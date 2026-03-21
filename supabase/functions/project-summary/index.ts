import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { commessaId } = await req.json();
    if (!commessaId) {
      return new Response(JSON.stringify({ error: "commessaId mancante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify caller identity and commessa ownership
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: ownerCheck } = await supabase.from("commessa_data").select("id").eq("id", commessaId).eq("user_id", user.id).maybeSingle();
    if (!ownerCheck) {
      return new Response(JSON.stringify({ error: "Commessa non trovata o accesso negato" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch commessa data including cached summary
    const { data: commessa } = await supabase
      .from("commessa_data")
      .select("*, project_summary, project_summary_doc_ids")
      .eq("id", commessaId)
      .maybeSingle();

    const cachedSummary = commessa?.project_summary || null;
    const cachedDocIds: string[] = commessa?.project_summary_doc_ids || [];

    // Fetch all completed documents
    const { data: docs } = await supabase
      .from("documents")
      .select("id, file_name, section, ai_summary, ai_extracted_data, ai_status")
      .eq("commessa_id", commessaId)
      .in("ai_status", ["completed"])
      .limit(50);

    if (!docs || docs.length === 0) {
      return new Response(JSON.stringify({
        summary: cachedSummary,
        cached: true,
        message: cachedSummary ? undefined : "Nessun documento analizzato disponibile per generare il riepilogo."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check which docs are new (not in cached set)
    const currentDocIds = docs.map(d => d.id);
    const newDocs = docs.filter(d => !cachedDocIds.includes(d.id));

    // If no new docs and we have a cached summary, return it
    if (newDocs.length === 0 && cachedSummary) {
      return new Response(JSON.stringify({
        summary: cachedSummary,
        cached: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    // Build context - only from NEW docs if we already have a summary
    const docsToAnalyze = cachedSummary ? newDocs : docs;

    const docSummaries = docsToAnalyze.map((d, i) => {
      let text = `${i + 1}. "${d.file_name}" (sezione: ${d.section})`;
      if (d.ai_summary) text += `\n   Sintesi: ${d.ai_summary}`;
      if (d.ai_extracted_data) {
        const extracted = typeof d.ai_extracted_data === "string"
          ? JSON.parse(d.ai_extracted_data)
          : d.ai_extracted_data;
        const keys = Object.keys(extracted).slice(0, 10);
        const details = keys.map(k => `${k}: ${JSON.stringify(extracted[k])}`).join("; ");
        if (details) text += `\n   Dati: ${details}`;
      }
      return text;
    }).join("\n\n");

    // Build commessa context
    let commessaContext = "";
    if (commessa) {
      const fields = [
        commessa.oggetto_lavori && `Oggetto: ${commessa.oggetto_lavori}`,
        commessa.committente && `Committente: ${commessa.committente}`,
        commessa.importo_contrattuale && `Importo contrattuale: €${commessa.importo_contrattuale}`,
        commessa.impresa_assegnataria && `Impresa: ${commessa.impresa_assegnataria}`,
        commessa.durata_contrattuale && `Durata: ${commessa.durata_contrattuale} giorni`,
      ].filter(Boolean);
      commessaContext = fields.join("\n");
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (cachedSummary && newDocs.length > 0) {
      // INCREMENTAL mode: update existing summary with new docs only
      systemPrompt = `Sei un assistente esperto di commesse edili pubbliche.
Ti viene fornito un riepilogo esistente del progetto e le sintesi AI di NUOVI documenti appena caricati.

Aggiorna il riepilogo esistente integrando le nuove informazioni. Non riscrivere tutto da zero: modifica solo le parti che necessitano di aggiornamento alla luce dei nuovi documenti.

Il riepilogo deve rimanere strutturato in paragrafi brevi (max 250 parole totali) coprendo:
1. **Descrizione**: cosa prevede l'intervento
2. **Soggetti coinvolti**: committente, impresa, eventuali subappaltatori
3. **Aspetti economici**: importi principali, ribassi
4. **Stato documentale**: quali tipologie di documenti sono presenti e cosa emerge
5. **Criticità o note**: eventuali aspetti rilevanti emersi dai documenti

Usa un tono professionale e conciso. Non inventare informazioni non presenti nei dati.
Rispondi SOLO con il testo del riepilogo aggiornato, senza markdown headers.`;

      userPrompt = `RIEPILOGO ESISTENTE:
${cachedSummary}

DATI COMMESSA:
${commessaContext || "Non disponibili"}

NUOVI DOCUMENTI (${newDocs.length}):
${docSummaries}`;
    } else {
      // FULL mode: generate from scratch
      systemPrompt = `Sei un assistente esperto di commesse edili pubbliche.
Ti vengono forniti i dati di una commessa e le sintesi AI dei documenti caricati (atti amministrativi, progettuali, contrattuali).

Genera un RIEPILOGO SINTETICO del progetto in italiano, strutturato in paragrafi brevi (max 200 parole totali).
Il riepilogo deve coprire:
1. **Descrizione**: cosa prevede l'intervento
2. **Soggetti coinvolti**: committente, impresa, eventuali subappaltatori
3. **Aspetti economici**: importi principali, ribassi
4. **Stato documentale**: quali tipologie di documenti sono presenti e cosa emerge
5. **Criticità o note**: eventuali aspetti rilevanti emersi dai documenti

Usa un tono professionale e conciso. Non inventare informazioni non presenti nei dati.
Rispondi SOLO con il testo del riepilogo, senza markdown headers.`;

      userPrompt = `DATI COMMESSA:
${commessaContext || "Non disponibili"}

DOCUMENTI ANALIZZATI (${docs.length}):
${docSummaries}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco.", summary: cachedSummary }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti.", summary: cachedSummary }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      throw new Error(`AI gateway error: ${response.status} - ${errText}`);
    }

    const aiResult = await response.json();
    const summary = aiResult.choices?.[0]?.message?.content?.trim() || "";

    // Persist summary and doc IDs to commessa_data
    await supabase.from("commessa_data").update({
      project_summary: summary,
      project_summary_doc_ids: currentDocIds,
    }).eq("id", commessaId);

    return new Response(JSON.stringify({ summary, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
