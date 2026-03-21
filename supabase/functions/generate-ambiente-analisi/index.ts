import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { commessaId } = await req.json();

    if (!commessaId) {
      return new Response(
        JSON.stringify({ error: 'commessaId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Verify caller identity and commessa ownership
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: ownerCheck } = await sb.from('commessa_data').select('id').eq('id', commessaId).eq('user_id', user.id).maybeSingle();
    if (!ownerCheck) {
      return new Response(JSON.stringify({ error: 'Commessa non trovata o accesso negato' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch commessa data
    const { data: commessa, error: commErr } = await sb
      .from('commessa_data')
      .select('oggetto_lavori, committente, commessa_consortile, cup, cig, importo_contrattuale, riferimenti_pnrr')
      .eq('id', commessaId)
      .maybeSingle();

    if (commErr) throw commErr;

    // Fetch analyzed documents (project docs with environmental/CAM info)
    const { data: docs, error: docsErr } = await sb
      .from('documents')
      .select('file_name, ai_extracted_data, ai_summary, section')
      .eq('commessa_id', commessaId)
      .eq('ai_status', 'completed')
      .not('ai_extracted_data', 'is', null);

    if (docsErr) throw docsErr;

    // Build context from documents
    const docContextParts: string[] = [];
    for (const doc of (docs || [])) {
      const ai = doc.ai_extracted_data as any;
      if (!ai || typeof ai !== 'object') continue;

      const parts: string[] = [];
      parts.push(`File: ${doc.file_name} (sezione: ${doc.section})`);
      if (ai.titolo) parts.push(`Titolo: ${ai.titolo}`);
      if (ai.riepilogo) parts.push(`Riepilogo: ${ai.riepilogo}`);
      if (ai.note_ambientali) parts.push(`Note ambientali: ${ai.note_ambientali}`);
      if (ai.materiali) {
        const mat = Array.isArray(ai.materiali) ? ai.materiali.map((m: any) => typeof m === 'object' ? m.nome || JSON.stringify(m) : m).join(', ') : String(ai.materiali);
        parts.push(`Materiali: ${mat}`);
      }
      if (ai.lavorazioni) {
        const lav = Array.isArray(ai.lavorazioni) ? ai.lavorazioni.join(', ') : String(ai.lavorazioni);
        parts.push(`Lavorazioni: ${lav}`);
      }
      if (ai.riferimenti_normativi) {
        const norme = Array.isArray(ai.riferimenti_normativi) ? ai.riferimenti_normativi.join('; ') : String(ai.riferimenti_normativi);
        parts.push(`Riferimenti normativi: ${norme}`);
      }
      if (ai.tipo_documento) parts.push(`Tipo: ${ai.tipo_documento}`);

      if (parts.length > 2) {
        docContextParts.push(parts.join('\n'));
      }
    }

    const docContext = docContextParts.length > 0
      ? docContextParts.join('\n---\n')
      : 'Nessun documento analizzato disponibile.';

    const commessaContext = commessa
      ? `Commessa: ${commessa.commessa_consortile || ''} - ${commessa.oggetto_lavori || ''}\nCommittente: ${commessa.committente || ''}\nCUP: ${commessa.cup || ''}\nCIG: ${commessa.cig || ''}\nImporto: ${commessa.importo_contrattuale || ''}\nRiferimenti PNRR: ${commessa.riferimenti_pnrr || 'non specificati'}`
      : '';

    const cerCodesReference = [
      "17 01 01 - Cemento", "17 01 02 - Mattoni", "17 01 03 - Mattonelle e ceramiche",
      "17 01 07 - Miscugli di cemento, mattoni, mattonelle e ceramiche",
      "17 02 01 - Legno", "17 02 02 - Vetro", "17 02 03 - Plastica",
      "17 02 04* - Vetro, plastica e legno contaminati (pericoloso)",
      "17 03 02 - Miscele bituminose", "17 04 01 - Rame, bronzo, ottone",
      "17 04 02 - Alluminio", "17 04 05 - Ferro e acciaio", "17 04 07 - Metalli misti",
      "17 04 11 - Cavi", "17 05 04 - Terra e rocce", "17 05 06 - Fanghi di dragaggio",
      "17 06 04 - Materiali isolanti", "17 08 02 - Materiali a base di gesso",
      "17 09 04 - Rifiuti misti da costruzione e demolizione",
      "15 01 01 - Imballaggi in carta e cartone", "15 01 02 - Imballaggi in plastica",
      "15 01 03 - Imballaggi in legno", "15 01 06 - Imballaggi in materiali misti",
      "08 01 11* - Pitture e vernici pericolose", "08 01 12 - Pitture e vernici non pericolose",
      "20 01 21* - Tubi fluorescenti e rifiuti con mercurio (pericoloso)",
      "16 02 13* - Apparecchiature con componenti pericolosi (pericoloso)",
      "13 02 05* - Scarti di oli minerali (pericoloso)",
    ];

    const systemPrompt = `Sei un esperto di gestione ambientale di cantiere e normativa CAM (Criteri Ambientali Minimi) per lavori pubblici in Italia.
Devi compilare tre sezioni dell'analisi ambientale di un cantiere, basandoti esclusivamente sulle informazioni contenute nei documenti progettuali forniti (capitolato, relazioni tecniche, elaborati).
Devi inoltre selezionare i codici CER pertinenti alle lavorazioni previste.

REGOLE IMPORTANTI:
- Scrivi in italiano tecnico professionale, in forma discorsiva (non elenchi puntati)
- Basa le informazioni SOLO sui dati estratti dai documenti forniti
- Se un'informazione non è presente nei documenti, indica che "non risultano specifiche indicazioni nei documenti di progetto" piuttosto che inventare
- Cita i riferimenti normativi pertinenti quando presenti nei documenti
- Per i CAM, fai riferimento al DM 23/06/2022 se citato nei documenti
- Ogni sezione deve essere di 3-5 paragrafi, dettagliata e operativa
- Per i codici CER, seleziona SOLO quelli effettivamente pertinenti alle lavorazioni descritte nei documenti`;

    const userPrompt = `DATI DELLA COMMESSA:
${commessaContext}

DOCUMENTI DI PROGETTO ANALIZZATI:
${docContext}

CODICI CER DI RIFERIMENTO (seleziona solo quelli pertinenti):
${cerCodesReference.join('\n')}

Compila le seguenti tre sezioni e seleziona i codici CER pertinenti, in formato JSON con le chiavi "aspetti_critici", "gestione_rifiuti", "cam_progetto", "cer_codes_selezionati":

1. ASPETTI CRITICI E PECULIARITÀ AMBIENTALI DEL CANTIERE: Analizza il contesto ambientale del sito, vincoli territoriali, caratteristiche geologiche/idrogeologiche emerse dalle relazioni, impatti potenziali su aria/acqua/suolo/rumore, presenza di materiali pericolosi, interferenze con ricettori sensibili.

2. GESTIONE RIFIUTI DI CANTIERE: Sulla base delle lavorazioni previste (demolizioni, scavi, consolidamenti strutturali ecc.), individua le principali tipologie di rifiuti producibili con i relativi codici CER probabili, le modalità di raccolta differenziata in cantiere, lo stoccaggio temporaneo, i formulari FIR, gli obiettivi di recupero/riciclo in conformità ai CAM.

3. CRITERI AMBIENTALI MINIMI (CAM) DI PROGETTO: Analizza i requisiti CAM applicabili all'intervento come da documenti, i criteri per materiali da costruzione, i requisiti energetici, le percentuali di materiali riciclati, la demolizione selettiva, le verifiche di conformità previste.

4. CODICI CER SELEZIONATI: Restituisci un array di stringhe con i soli codici CER (es. "17 01 01", "17 02 04*") pertinenti alle lavorazioni previste nei documenti.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'compile_ambiente_analisi',
              description: 'Compila le tre sezioni dell\'analisi ambientale del cantiere e seleziona i codici CER pertinenti',
              parameters: {
                type: 'object',
                properties: {
                  aspetti_critici: {
                    type: 'string',
                    description: 'Testo della sezione aspetti critici e peculiarità ambientali',
                  },
                  gestione_rifiuti: {
                    type: 'string',
                    description: 'Testo della sezione gestione rifiuti di cantiere',
                  },
                  cam_progetto: {
                    type: 'string',
                    description: 'Testo della sezione criteri ambientali minimi CAM',
                  },
                  cer_codes_selezionati: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array di codici CER pertinenti (es. ["17 01 01", "17 02 04*", "15 01 02"])',
                  },
                },
                required: ['aspetti_critici', 'gestione_rifiuti', 'cam_progetto', 'cer_codes_selezionati'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'compile_ambiente_analisi' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite di richieste raggiunto, riprova tra qualche minuto.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crediti AI esauriti.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();

    // Extract tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      // Fallback: try to parse from content
      const content = aiResult.choices?.[0]?.message?.content || '';
      console.error('No tool call in response, content:', content.substring(0, 200));
      throw new Error('AI non ha restituito dati strutturati');
    }

    let analisi: { aspetti_critici: string; gestione_rifiuti: string; cam_progetto: string };
    try {
      analisi = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error('Failed to parse tool call arguments:', toolCall.function.arguments.substring(0, 200));
      throw new Error('Errore nel parsing della risposta AI');
    }

    // Save to commessa_data
    const { error: updateErr } = await sb
      .from('commessa_data')
      .update({ ambiente_analisi: analisi })
      .eq('id', commessaId);

    if (updateErr) throw updateErr;

    return new Response(
      JSON.stringify({ success: true, analisi }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('generate-ambiente-analisi error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
