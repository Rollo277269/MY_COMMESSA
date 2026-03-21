import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function repairAndParseJson(raw: string): any {
  let cleaned = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  const jsonStart = cleaned.search(/[\{\[]/);
  if (jsonStart === -1) throw new Error('No JSON found');
  cleaned = cleaned.substring(jsonStart);

  cleaned = cleaned
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/[\x00-\x1F\x7F]/g, ' ');

  try { return JSON.parse(cleaned); } catch {}

  const lastCompleteObj = cleaned.lastIndexOf('}');
  if (lastCompleteObj > 0) {
    let attempt = cleaned.substring(0, lastCompleteObj + 1);
    let braces = 0, brackets = 0;
    for (const c of attempt) {
      if (c === '{') braces++;
      if (c === '}') braces--;
      if (c === '[') brackets++;
      if (c === ']') brackets--;
    }
    attempt += '}'.repeat(Math.max(0, braces));
    attempt += ']'.repeat(Math.max(0, brackets));
    try { return JSON.parse(attempt); } catch {}
  }

  throw new Error('Could not repair JSON');
}

async function callAI(apiKey: string, systemPrompt: string, userContent: any, retries = 2): Promise<any[]> {
  const toolDef = {
    type: 'function' as const,
    function: {
      name: 'extract_cme_rows',
      description: 'Estrai le righe del computo metrico estimativo',
      parameters: {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                numero: { type: 'string', description: 'Numero ordinale progressivo della voce' },
                codice: { type: 'string', description: 'Codice tariffa della voce' },
                descrizione: { type: 'string', description: 'Designazione/descrizione completa della lavorazione' },
                unita_misura: { type: 'string', description: 'Unità di misura (m, m², m³, kg, cad, corpo, ecc.)' },
                par_ug: { type: 'number', description: 'Numero parti uguali' },
                lunghezza: { type: 'number', description: 'Lunghezza in metri' },
                larghezza: { type: 'number', description: 'Larghezza in metri' },
                h_peso: { type: 'number', description: 'Altezza o peso' },
                quantita: { type: 'number', description: 'Quantità totale' },
                prezzo_unitario: { type: 'number', description: 'Prezzo unitario in euro' },
                importo: { type: 'number', description: 'Importo totale in euro' },
              },
              required: ['descrizione'],
              additionalProperties: false,
            },
          },
        },
        required: ['rows'],
        additionalProperties: false,
      },
    },
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 16000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        tools: [toolDef],
        tool_choice: { type: 'function', function: { name: 'extract_cme_rows' } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('AI error:', response.status, text);
      if (response.status === 429) throw new Error('RATE_LIMIT');
      if (response.status === 402) throw new Error('CREDITS_EXHAUSTED');
      throw new Error('AI gateway error');
    }

    const result = await response.json();
    const finishReason = result.choices?.[0]?.finish_reason;
    console.log(`AI attempt ${attempt + 1}: finish_reason=${finishReason}`);

    // If AI returned an error, retry
    if (finishReason === 'error') {
      console.log(`AI returned error, ${retries - attempt} retries left`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      // All retries exhausted, return empty rather than failing the whole import
      console.log('All retries exhausted for this chunk, returning empty');
      return [];
    }

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let rows: any[] = [];

    if (toolCall) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        rows = parsed.rows || [];
      } catch {
        console.log('Tool call args truncated, repairing...');
        const repaired = repairAndParseJson(toolCall.function.arguments);
        rows = repaired.rows || (Array.isArray(repaired) ? repaired : []);
      }
    } else {
      const content = result.choices?.[0]?.message?.content || '';
      if (!content) {
        console.log('Empty content, returning empty for this chunk');
        return [];
      }
      const parsed = repairAndParseJson(content);
      rows = parsed.rows || (Array.isArray(parsed) ? parsed : []);
    }

    console.log('Extracted rows:', rows.length);
    return rows;
  }

  return [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { textContent } = body;

    console.log('Received keys:', Object.keys(body));
    console.log('textContent length:', textContent?.length || 0);

    if (!textContent) {
      return new Response(JSON.stringify({ error: 'No content provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If text is too short, return empty rows instead of calling AI
    if (textContent.length < 200) {
      console.log(`Text too short (${textContent.length} chars), returning empty rows`);
      return new Response(JSON.stringify({ rows: [], warning: 'Testo troppo breve per estrarre voci dal computo metrico. Verifica che il PDF contenga testo selezionabile.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const systemPrompt = `Sei un esperto di computi metrici estimativi per l'edilizia italiana. Analizza il testo fornito ed estrai TUTTE le voci del computo metrico in formato strutturato. Per ogni voce estrai: numero ordinale progressivo, codice tariffa (se presente), descrizione completa della lavorazione, unità di misura, dimensioni (parti uguali, lunghezza, larghezza, altezza/peso se presenti), quantità totale, prezzo unitario, importo totale. Estrai OGNI SINGOLA RIGA, non saltare nessuna voce. ESCLUDI le righe di totale generale, subtotale, somma, "TOTALE COMPUTO", "TOTALE LAVORI", "TOTALE GENERALE", "A RIPORTARE", "RIPORTO" e qualsiasi riga che rappresenti un riepilogo o somma parziale/totale.`;

    const userContent = `Analizza questo computo metrico ed estrai TUTTE le voci:\n\n${textContent.substring(0, 50000)}`;

    const rows = await callAI(LOVABLE_API_KEY, systemPrompt, userContent);
    console.log('Extracted rows count:', rows.length);

    return new Response(JSON.stringify({ rows }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    if (msg === 'RATE_LIMIT') {
      return new Response(JSON.stringify({ error: 'Troppe richieste, riprova tra poco.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (msg === 'CREDITS_EXHAUSTED') {
      return new Response(JSON.stringify({ error: 'Crediti AI esauriti.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.error('parse-cme error:', e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
