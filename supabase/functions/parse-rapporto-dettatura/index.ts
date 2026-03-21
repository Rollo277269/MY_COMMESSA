import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testo } = await req.json();
    if (!testo || typeof testo !== "string") {
      return new Response(JSON.stringify({ error: "Testo mancante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `Sei un assistente specializzato nell'analisi di rapporti giornalieri di cantiere edile.
Ti viene dato un testo dettato vocalmente. Estraete le informazioni strutturate in JSON con questi campi:

{
  "data": "YYYY-MM-DD (data del rapporto, se menzionata, altrimenti null)",
  "data_display": "DD/MM/YYYY (se trovata, altrimenti null)",
  "condizioni_meteo": "condizioni meteo menzionate (es. Sereno, Pioggia, ecc.) o stringa vuota",
  "temperatura": "temperatura in gradi se menzionata, altrimenti stringa vuota",
  "operai": [{"nome": "nome operaio", "qualifica": "qualifica se menzionata", "ore": "ore lavorate se menzionate, default 8"}],
  "lavorazioni": "testo delle lavorazioni svolte",
  "materiali": [{"fornitore": "nome fornitore", "descrizione": "descrizione materiale", "ddt": "riferimento DDT se menzionato", "quantita": "quantità se menzionata"}],
  "altri_documenti": "altri documenti acquisiti menzionati",
  "note": "note sull'andamento dei lavori"
}

Rispondi SOLO con il JSON valido, senza markdown o altro testo.
Se un campo non è menzionato nel testo, usa stringa vuota o array vuoto.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: testo },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI gateway error: ${response.status} - ${errText}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle possible markdown wrapping)
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
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
