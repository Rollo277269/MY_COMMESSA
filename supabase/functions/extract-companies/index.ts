import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { commessa_id } = await req.json();
    if (!commessa_id) throw new Error("commessa_id richiesto");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurata");

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
    const { data: ownerCheck } = await supabase.from("commessa_data").select("id").eq("id", commessa_id).eq("user_id", user.id).maybeSingle();
    if (!ownerCheck) {
      return new Response(JSON.stringify({ error: "Commessa non trovata o accesso negato" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1. Fetch documents with AI data
    const { data: documents, error: docErr } = await supabase
      .from("documents")
      .select("id, file_name, ai_extracted_data, ai_summary")
      .eq("commessa_id", commessa_id)
      .eq("ai_status", "completed");

    if (docErr) throw docErr;
    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({ companies: [], message: "Nessun documento analizzato trovato" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch existing companies
    const { data: existingCompanies } = await supabase
      .from("aziende")
      .select("id, nome, tipo, partita_iva, codice_fiscale, indirizzo, citta, provincia, cap, telefono, email, pec, sito_web")
      .eq("commessa_id", commessa_id);

    const existingNames = new Set((existingCompanies || []).map(c => c.nome.toLowerCase().trim()));

    // 3. Build context
    const docContext = documents
      .slice(0, 30)
      .map(d => {
        const extracted = d.ai_extracted_data
          ? (typeof d.ai_extracted_data === "string" ? d.ai_extracted_data : JSON.stringify(d.ai_extracted_data))
          : "";
        return `--- Documento: ${d.file_name} ---\nSintesi: ${d.ai_summary || "N/A"}\nDati estratti: ${extracted.slice(0, 2000)}`;
      })
      .join("\n\n");

    // 4. AI extraction
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Sei un assistente che estrae aziende/ditte/enti da documenti di cantiere edile.
Analizza i documenti e restituisci SOLO una chiamata alla funzione extract_companies con le aziende trovate.
Estrai: ragione sociale, tipo (committente, fornitore, subappaltatore, impresa, consorzio, ente, professionista, altro), 
partita IVA, codice fiscale, indirizzo, città, provincia, CAP, telefono, email, PEC, sito web.
NON inventare dati. Se un campo non è presente, omettilo.
Ignora nomi generici senza una ragione sociale chiara.`
          },
          {
            role: "user",
            content: `Analizza questi documenti ed estrai tutte le aziende/enti/ditte con i relativi dati:\n\n${docContext}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_companies",
            description: "Restituisce la lista delle aziende estratte dai documenti",
            parameters: {
              type: "object",
              properties: {
                companies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nome: { type: "string", description: "Ragione sociale" },
                      tipo: { type: "string", description: "committente, fornitore, subappaltatore, impresa, consorzio, ente, professionista, altro" },
                      partita_iva: { type: "string" },
                      codice_fiscale: { type: "string" },
                      indirizzo: { type: "string" },
                      citta: { type: "string" },
                      provincia: { type: "string" },
                      cap: { type: "string" },
                      telefono: { type: "string" },
                      email: { type: "string" },
                      pec: { type: "string" },
                      sito_web: { type: "string" },
                      note: { type: "string" },
                      source_doc_ids: { type: "array", items: { type: "string" } }
                    },
                    required: ["nome"],
                    additionalProperties: false
                  }
                }
              },
              required: ["companies"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_companies" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`Errore AI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let companies: any[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        companies = parsed.companies || [];
      } catch {
        throw new Error("Errore parsing risposta AI");
      }
    }

    // 5. Separate new vs duplicate
    const newCompanies: any[] = [];
    const duplicateCompanies: any[] = [];

    for (const company of companies) {
      if (!company.nome || company.nome.trim().length < 2) continue;
      const nameKey = company.nome.toLowerCase().trim();

      if (existingNames.has(nameKey)) {
        const existing = (existingCompanies || []).find(
          (c: any) => c.nome.toLowerCase().trim() === nameKey
        );
        duplicateCompanies.push({ ...company, existing_id: existing?.id });
      } else {
        newCompanies.push(company);
      }
    }

    // 6. Batch insert new companies — upsert per evitare duplicati da chiamate parallele
    let inserted = 0;
    if (newCompanies.length > 0) {
      const rows = newCompanies.map((company: any) => ({
        commessa_id,
        nome: company.nome.trim(),
        tipo: company.tipo || "fornitore",
        partita_iva: company.partita_iva || null,
        codice_fiscale: company.codice_fiscale || null,
        indirizzo: company.indirizzo || null,
        citta: company.citta || null,
        provincia: company.provincia || null,
        cap: company.cap || null,
        telefono: company.telefono || null,
        email: company.email || null,
        pec: company.pec || null,
        sito_web: company.sito_web || null,
        note: company.note || null,
        source_document_ids: company.source_doc_ids || [],
      }));
      const { data: insertedRows, error: batchErr } = await supabase
        .from("aziende")
        .upsert(rows, { onConflict: "commessa_id,nome", ignoreDuplicates: true })
        .select("id");
      if (batchErr) {
        console.error("Batch insert aziende error:", batchErr.message);
      } else {
        inserted = insertedRows?.length ?? 0;
      }
    }

    return new Response(
      JSON.stringify({
        found: companies.length,
        inserted,
        duplicates: duplicateCompanies,
        message: inserted > 0
          ? `Trovate ${companies.length} aziende, ${inserted} nuove aggiunte.`
          : companies.length > 0
            ? "Tutte le aziende trovate sono già presenti."
            : "Nessuna azienda trovata nei documenti.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-companies error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
