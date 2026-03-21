import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function repairAndParseJson(raw: string): any {
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const jsonStart = cleaned.search(/[\{\[]/);
  if (jsonStart === -1) throw new Error('No JSON found');
  cleaned = cleaned.substring(jsonStart);
  cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/[\x00-\x1F\x7F]/g, ' ');
  try { return JSON.parse(cleaned); } catch {}
  const lastCompleteObj = cleaned.lastIndexOf('}');
  if (lastCompleteObj > 0) {
    let attempt = cleaned.substring(0, lastCompleteObj + 1);
    let braces = 0, brackets = 0;
    for (const c of attempt) { if (c === '{') braces++; if (c === '}') braces--; if (c === '[') brackets++; if (c === ']') brackets--; }
    attempt += '}'.repeat(Math.max(0, braces));
    attempt += ']'.repeat(Math.max(0, brackets));
    try { return JSON.parse(attempt); } catch {}
  }
  throw new Error('Could not repair JSON');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { textContent } = await req.json();
    if (!textContent) {
      return new Response(JSON.stringify({ error: 'No content provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const toolDef = {
      type: 'function' as const,
      function: {
        name: 'extract_cronoprogramma',
        description: 'Estrai le fasi del cronoprogramma di progetto',
        parameters: {
          type: 'object',
          properties: {
            phases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Nome della fase/lavorazione' },
                  start_date: { type: 'string', description: 'Data inizio in formato YYYY-MM-DD' },
                  end_date: { type: 'string', description: 'Data fine in formato YYYY-MM-DD' },
                  progress: { type: 'number', description: 'Percentuale avanzamento 0-100' },
                  sub_phases: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        start_date: { type: 'string' },
                        end_date: { type: 'string' },
                        progress: { type: 'number' },
                      },
                      required: ['name', 'start_date', 'end_date'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['name', 'start_date', 'end_date'],
                additionalProperties: false,
              },
            },
          },
          required: ['phases'],
          additionalProperties: false,
        },
      },
    };

    const systemPrompt = `Sei un esperto di pianificazione lavori edili. Analizza il testo fornito (estratto da un cronoprogramma PDF) e identifica TUTTE le fasi e sotto-fasi con le relative date di inizio e fine.

Regole:
- Estrai ogni fase principale e le sue sotto-fasi
- Le date devono essere in formato YYYY-MM-DD
- Se le date sono espresse come durate (es. "30 giorni"), calcola le date assolute basandoti sul contesto
- Se vedi barre di Gantt o riferimenti temporali (mesi, settimane), deduci le date
- Il progress è 0 se non specificato
- Non inventare fasi che non esistono nel documento
- Raggruppa logicamente le sotto-fasi sotto le fasi principali`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 16000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analizza questo cronoprogramma ed estrai tutte le fasi:\n\n${textContent.substring(0, 50000)}` },
        ],
        tools: [toolDef],
        tool_choice: { type: 'function', function: { name: 'extract_cronoprogramma' } },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('AI error:', response.status, text);
      if (response.status === 429) return new Response(JSON.stringify({ error: 'Troppe richieste, riprova tra poco.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (response.status === 402) return new Response(JSON.stringify({ error: 'Crediti AI esauriti.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error('AI gateway error');
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let phases: any[] = [];

    if (toolCall) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        phases = parsed.phases || [];
      } catch {
        const repaired = repairAndParseJson(toolCall.function.arguments);
        phases = repaired.phases || (Array.isArray(repaired) ? repaired : []);
      }
    } else {
      const content = result.choices?.[0]?.message?.content || '';
      if (content) {
        const parsed = repairAndParseJson(content);
        phases = parsed.phases || (Array.isArray(parsed) ? parsed : []);
      }
    }

    console.log('Extracted phases:', phases.length);
    return new Response(JSON.stringify({ phases }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('parse-cronoprogramma error:', e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
