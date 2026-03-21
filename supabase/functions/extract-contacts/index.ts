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

    // 1. Fetch all documents with AI extracted data for this commessa
    const { data: documents, error: docErr } = await supabase
      .from("documents")
      .select("id, file_name, ai_extracted_data, ai_summary")
      .eq("commessa_id", commessa_id)
      .eq("ai_status", "completed");

    if (docErr) throw docErr;
    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({ contacts: [], message: "Nessun documento analizzato trovato" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch existing persons to avoid duplicates
    const { data: existingPersons } = await supabase
      .from("persons")
      .select("id, nome, email, telefono, cellulare, pec, ruolo, azienda")
      .eq("commessa_id", commessa_id);

    const existingNames = new Set((existingPersons || []).map(p => p.nome.toLowerCase().trim()));

    // 3. Build context from documents
    const docContext = documents
      .slice(0, 30) // Limit to avoid token overflow
      .map(d => {
        const extracted = d.ai_extracted_data
          ? (typeof d.ai_extracted_data === "string" ? d.ai_extracted_data : JSON.stringify(d.ai_extracted_data))
          : "";
        return `--- Documento: ${d.file_name} ---\nSintesi: ${d.ai_summary || "N/A"}\nDati estratti: ${extracted.slice(0, 2000)}`;
      })
      .join("\n\n");

    // 4. Call AI to extract contacts
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
            content: `Sei un assistente che estrae contatti da documenti di cantiere edile.
Analizza i documenti e restituisci SOLO una chiamata alla funzione extract_contacts con i contatti trovati.
Estrai: nomi propri di persone (non aziende), ruoli, aziende, email, telefoni, PEC, indirizzi.
NON inventare dati. Se un campo non è presente, omettilo.
Ignora nomi generici come "il direttore" senza un nome proprio.`
          },
          {
            role: "user",
            content: `Analizza questi documenti ed estrai tutte le persone con i relativi contatti:\n\n${docContext}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_contacts",
            description: "Restituisce la lista dei contatti estratti dai documenti",
            parameters: {
              type: "object",
              properties: {
                contacts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nome: { type: "string", description: "Nome e cognome della persona" },
                      ruolo: { type: "string", description: "Ruolo professionale" },
                      azienda: { type: "string", description: "Azienda di appartenenza" },
                      email: { type: "string" },
                      telefono: { type: "string" },
                      cellulare: { type: "string" },
                      pec: { type: "string" },
                      indirizzo: { type: "string" },
                      note: { type: "string" },
                      source_doc_ids: { type: "array", items: { type: "string" }, description: "ID dei documenti da cui è stato estratto" }
                    },
                    required: ["nome"],
                    additionalProperties: false
                  }
                }
              },
              required: ["contacts"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "extract_contacts" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`Errore AI: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let contacts: any[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        contacts = parsed.contacts || [];
      } catch {
        throw new Error("Errore parsing risposta AI");
      }
    }

    // 5. Separate new vs duplicate contacts
    const newContacts: any[] = [];
    const duplicateContacts: any[] = [];

    for (const contact of contacts) {
      if (!contact.nome || contact.nome.trim().length < 3) continue;
      const nameKey = contact.nome.toLowerCase().trim();

      if (existingNames.has(nameKey)) {
        const existing = (existingPersons || []).find(
          (p: any) => p.nome.toLowerCase().trim() === nameKey
        );
        duplicateContacts.push({ ...contact, existing_id: existing?.id });
      } else {
        newContacts.push(contact);
      }
    }

    // 6. Batch insert new contacts — upsert con onConflict per evitare duplicati da chiamate parallele
    let inserted = 0;
    if (newContacts.length > 0) {
      const rows = newContacts.map((contact: any) => ({
        commessa_id,
        nome: contact.nome.trim(),
        ruolo: contact.ruolo || null,
        azienda: contact.azienda || null,
        email: contact.email || null,
        telefono: contact.telefono || null,
        cellulare: contact.cellulare || null,
        pec: contact.pec || null,
        indirizzo: contact.indirizzo || null,
        note: contact.note || null,
        source_document_ids: contact.source_doc_ids || [],
      }));
      const { data: insertedRows, error: batchErr } = await supabase
        .from("persons")
        .upsert(rows, { onConflict: "commessa_id,nome", ignoreDuplicates: true })
        .select("id");
      if (batchErr) {
        console.error("Batch insert persons error:", batchErr.message);
      } else {
        inserted = insertedRows?.length ?? 0;
      }
    }

    return new Response(
      JSON.stringify({
        found: contacts.length,
        inserted,
        duplicates: duplicateContacts,
        message: inserted > 0
          ? `Trovate ${contacts.length} persone, ${inserted} nuove aggiunte.`
          : contacts.length > 0
            ? "Tutte le persone trovate sono già presenti."
            : "Nessun contatto trovato nei documenti.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-contacts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
