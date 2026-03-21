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
    const { commessa, persons, aziende, phases, cmeRows, documents, checklist } = await req.json();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `Sei un esperto di Sistemi di Gestione Qualità, Ambiente, Sicurezza e responsabilità sociale per imprese di costruzioni.
Devi redigere un PIANO DI QUALITÀ (PdQ) completo e professionale per una commessa di lavori pubblici.

Il PdQ deve essere strutturato nei seguenti CAPITOLI (usa esattamente questi titoli come sezioni):

1. SCOPO E CAMPO DI APPLICAZIONE
2. RIFERIMENTI NORMATIVI (tabella con norme ISO, D.Lgs., norme UNI/EN e norme tecniche citate nei documenti di progetto)
3. DATI DELLA COMMESSA (riepilogo contrattuale)
4. ORGANIZZAZIONE E RESPONSABILITÀ (organigramma nominativo)
5. PIANIFICAZIONE E CONTROLLO DELLA QUALITÀ
6. GESTIONE DELLE CERTIFICAZIONI (ISO 9001, 14001, 45001, 39001, 37001, SA 8000)
7. PRODOTTI CRITICI E CARATTERISTICHE PROGETTUALI
8. FORNITORI CRITICI
9. PRODOTTI CHIMICI E SCHEDE DI SICUREZZA
10. PIANIFICAZIONE RISORSE UMANE
11. GESTIONE DOCUMENTALE E REGISTRAZIONI
12. VERIFICHE ISPETTIVE INTERNE
13. NON CONFORMITÀ E AZIONI CORRETTIVE
14. RIESAME DELLA DIREZIONE
15. ALLEGATI

Per ogni sezione genera contenuto dettagliato. Usa la funzione generate_pdq per restituire il risultato.`;

    const userPrompt = buildUserPrompt(commessa, persons, aziende, phases, cmeRows, documents, checklist);

    // Use tool calling for guaranteed structured JSON output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 16000,
        tools: [{
          type: "function",
          function: {
            name: "generate_pdq",
            description: "Genera il Piano di Qualità strutturato in sezioni",
            parameters: {
              type: "object",
              properties: {
                sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      number: { type: "string" },
                      title: { type: "string" },
                      content: { type: "string" },
                      tables: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            headers: { type: "array", items: { type: "string" } },
                            rows: { type: "array", items: { type: "array", items: { type: "string" } } },
                          },
                          required: ["title", "headers", "rows"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["number", "title", "content"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["sections"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_pdq" } },
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
    
    // Extract from tool call response
    let parsed: any = null;
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      // Tool calling path - structured output
      const args = typeof toolCall.function.arguments === "string" 
        ? toolCall.function.arguments 
        : JSON.stringify(toolCall.function.arguments);
      parsed = safeParseJson(args);
    }
    
    // Fallback: try content field (in case model didn't use tool calling)
    if (!parsed?.sections) {
      const content = aiResult.choices?.[0]?.message?.content?.trim();
      if (content) {
        parsed = safeParseJson(content);
      }
    }

    if (!parsed?.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
      throw new Error("Risposta AI non valida - nessuna sezione generata");
    }

    console.log(`PdQ generated successfully: ${parsed.sections.length} sections`);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/** Robust JSON parser with recovery for truncated responses */
function safeParseJson(raw: string): any {
  // Clean markdown
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  // Find JSON boundaries
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1) return null;
  
  if (end > start) {
    cleaned = cleaned.substring(start, end + 1);
  } else {
    cleaned = cleaned.substring(start);
  }

  // Clean control chars and trailing commas
  cleaned = cleaned
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Recovery: try to find last complete section and close the JSON
    console.warn("Direct JSON parse failed, attempting recovery...");
  }

  // Strategy 1: Find last complete section object by matching "number": patterns
  const sectionPattern = /\{"number"\s*:\s*"[^"]+"\s*,\s*"title"\s*:\s*"[^"]*"/g;
  let lastSectionStart = -1;
  let match;
  const starts: number[] = [];
  while ((match = sectionPattern.exec(cleaned)) !== null) {
    starts.push(match.index);
    lastSectionStart = match.index;
  }

  if (starts.length >= 2) {
    // Try cutting at each section boundary from the end
    for (let i = starts.length - 1; i >= 1; i--) {
      const cutPoint = starts[i];
      // Find the closing brace before this section start (end of previous section)
      const beforeCut = cleaned.substring(0, cutPoint).trimEnd();
      const lastComma = beforeCut.lastIndexOf(",");
      if (lastComma > 0) {
        const attempt = beforeCut.substring(0, lastComma) + "]}";
        try {
          const result = JSON.parse(attempt);
          if (result.sections && Array.isArray(result.sections)) {
            console.warn(`Recovered ${result.sections.length} sections from truncated response`);
            return result;
          }
        } catch {}
      }
    }
  }

  // Strategy 2: Brute force - find matching braces
  let braceDepth = 0;
  let lastValidEnd = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") braceDepth++;
    if (cleaned[i] === "}") {
      braceDepth--;
      if (braceDepth === 1) lastValidEnd = i; // depth 1 = end of a section object
    }
  }

  if (lastValidEnd > 0) {
    const attempt = cleaned.substring(0, lastValidEnd + 1) + "]}";
    try {
      const result = JSON.parse(attempt);
      if (result.sections && Array.isArray(result.sections)) {
        console.warn(`Recovered (brace matching) ${result.sections.length} sections`);
        return result;
      }
    } catch {}
  }

  return null;
}

function buildUserPrompt(commessa: any, persons: any[], aziende: any[], phases: any[], cmeRows: any[], documents: any[], checklist: any[]): string {
  return `Genera il Piano di Qualità per la seguente commessa:

DATI COMMESSA:
- Committente: ${commessa?.committente || "N/D"}
- Oggetto lavori: ${commessa?.oggetto_lavori || "N/D"}
- CUP: ${commessa?.cup || "N/D"}
- CIG: ${commessa?.cig || "N/D"}
- CIG Derivato: ${commessa?.cig_derivato || "N/D"}
- Importo contrattuale: ${commessa?.importo_contrattuale || "N/D"}
- Importo base gara: ${commessa?.importo_base_gara || "N/D"}
- Ribasso: ${commessa?.ribasso || "N/D"}%
- Oneri sicurezza: ${commessa?.oneri_sicurezza || "N/D"}
- Impresa assegnataria: ${commessa?.impresa_assegnataria || "N/D"}
- RUP: ${commessa?.rup || "N/D"}
- Direttore Lavori: ${commessa?.direttore_lavori || "N/D"}
- Data contratto: ${commessa?.data_contratto || "N/D"}
- Data consegna lavori: ${commessa?.data_consegna_lavori || "N/D"}
- Durata contrattuale: ${commessa?.durata_contrattuale || "N/D"} giorni
- Data scadenza: ${commessa?.data_scadenza_contratto || "N/D"}

PERSONE (per organigramma):
${(persons || []).map((p: any) => `- ${p.nome} | Ruolo: ${p.ruolo || "N/D"} | Azienda: ${p.azienda || "N/D"}`).join("\n") || "Nessuna persona registrata"}

AZIENDE (per fornitori critici):
${(aziende || []).map((a: any) => `- ${a.nome} | Tipo: ${a.tipo || "N/D"}`).join("\n") || "Nessuna azienda registrata"}

FASI DEL CRONOPROGRAMMA:
${(phases || []).map((p: any) => `- ${p.name} (avanzamento: ${p.progress}%)`).join("\n") || "Nessuna fase"}

VOCI CME (primi 30):
${(cmeRows || []).slice(0, 30).map((r: any) => `- ${r.codice || ""} ${r.descrizione} | UM: ${r.unita_misura || ""} | Qtà: ${r.quantita || ""}`).join("\n") || "Nessuna voce CME"}

DOCUMENTI CARICATI (con sintesi AI):
${(documents || []).slice(0, 20).map((d: any) => {
  let line = `- ${d.file_name} (sezione: ${d.section})`;
  if (d.ai_summary) line += `\n  Sintesi: ${d.ai_summary.substring(0, 300)}`;
  if (d.ai_extracted_data) {
    try {
      const extracted = typeof d.ai_extracted_data === 'string' ? JSON.parse(d.ai_extracted_data) : d.ai_extracted_data;
      if (extracted.riferimenti_normativi) line += `\n  Norme: ${JSON.stringify(extracted.riferimenti_normativi).substring(0, 500)}`;
    } catch {}
  }
  return line;
}).join("\n") || "Nessun documento"}

CHECKLIST DOCUMENTI:
${(checklist || []).map((c: any) => `- ${c.nome} (indispensabile: ${c.indispensabile ? "Sì" : "No"})`).join("\n") || "Nessun elemento"}

Genera tutte le 15 sezioni con contenuti professionali e tabelle dettagliate.
Basa prodotti critici sulle voci CME, fornitori sulle aziende, organigramma sulle persone.
Nella sezione 2 includi le norme tecniche citate nei documenti di progetto.`;
}
