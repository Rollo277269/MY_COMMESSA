import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checklistItems, documentNames } = await req.json();

    if (!checklistItems?.length || !documentNames?.length) {
      return new Response(JSON.stringify({
        matches: (checklistItems || []).map((item: string) => ({
          checklistItem: item,
          matched: false,
          matchedDocument: null,
          confidence: 0,
        })),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `Sei un assistente esperto di documentazione di cantiere e appalti pubblici.
Ti viene dato un elenco di DOCUMENTI RICHIESTI (checklist) e un elenco di FILE CARICATI (nomi dei file).

Per ogni documento richiesto, determina se esiste un file caricato che corrisponde semanticamente.
I nomi dei file possono essere abbreviati, contenere codici, date, o nomi diversi ma riferirsi allo stesso tipo di documento.

Esempi di matching semantico:
- "Polizza CAR" → "polizza_CAR_2024.pdf" ✓
- "POS (Piano Operativo Sicurezza)" → "POS_LeaderCostruzioni.pdf" ✓
- "Verbale di consegna lavori" → "verbale_consegna_urgenza_21gen.pdf" ✓
- "DURC" → "DURC_regolare_feb2026.pdf" ✓
- "Computo Metrico Estimativo" → "CME_marciapiedi.xlsx" ✓
- "Attestazione SOA" → non presente ✗

Rispondi SOLO con un JSON array. Per ogni documento della checklist:
{
  "index": <indice 0-based nella checklist>,
  "matched": true/false,
  "matchedDocument": "nome del file corrispondente" o null,
  "confidence": 0.0-1.0
}

Considera "matched: true" solo se la confidence è >= 0.6.
Rispondi SOLO con il JSON array valido, senza markdown.`;

    const userPrompt = `CHECKLIST (documenti richiesti):
${checklistItems.map((item: string, i: number) => `${i}. ${item}`).join("\n")}

FILE CARICATI:
${documentNames.map((name: string, i: number) => `${i}. ${name}`).join("\n")}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Troppe richieste, riprova tra poco." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crediti AI esauriti." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      throw new Error(`AI gateway error: ${response.status} - ${errText}`);
    }

    const aiResult = await response.json();
    let content = aiResult.choices?.[0]?.message?.content?.trim() || "[]";

    // Clean markdown wrapping
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(content);

    // Build result mapped back to checklist items
    const matches = checklistItems.map((item: string, i: number) => {
      const match = parsed.find((m: any) => m.index === i);
      return {
        checklistItem: item,
        matched: match?.matched ?? false,
        matchedDocument: match?.matchedDocument ?? null,
        confidence: match?.confidence ?? 0,
      };
    });

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
