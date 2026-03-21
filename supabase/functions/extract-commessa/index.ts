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

    // Get completed documents ONLY for this commessa
    const { data: docs, error: docsErr } = await sb
      .from('documents')
      .select('ai_extracted_data')
      .eq('commessa_id', commessaId)
      .eq('ai_status', 'completed')
      .not('ai_extracted_data', 'is', null);

    if (docsErr) throw docsErr;
    if (!docs || docs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nessun documento analizzato trovato' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get this specific commessa
    const { data: commessa, error: commErr } = await sb
      .from('commessa_data')
      .select('*')
      .eq('id', commessaId)
      .maybeSingle();

    if (commErr) throw commErr;
    if (!commessa) {
      return new Response(
        JSON.stringify({ error: 'Commessa non trovata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Collect all candidate values from documents
    const candidates: Record<string, string[]> = {
      committente: [],
      oggetto_lavori: [],
      importo_contrattuale: [],
      importo_base_gara: [],
      oneri_sicurezza: [],
      costo_manodopera: [],
      ribasso: [],
      cig: [],
      cup: [],
      data_contratto: [],
      data_consegna_lavori: [],
      durata_contrattuale: [],
      rup: [],
      direttore_lavori: [],
      impresa_assegnataria: [],
      data_scadenza_contratto: [],
      riferimenti_pnrr: [],
    };

    for (const doc of docs) {
      const ai = doc.ai_extracted_data;
      if (!ai || typeof ai !== 'object') continue;

      // Direct field mapping
      if (ai.committente) candidates.committente.push(String(ai.committente));
      if (ai.oggetto_lavori) candidates.oggetto_lavori.push(String(ai.oggetto_lavori));
      if (ai.titolo && !ai.oggetto_lavori) candidates.oggetto_lavori.push(String(ai.titolo));
      if (ai.importo_contrattuale) candidates.importo_contrattuale.push(String(ai.importo_contrattuale));
      if (ai.oneri_sicurezza) candidates.oneri_sicurezza.push(String(ai.oneri_sicurezza));
      if (ai.importo_base_gara) candidates.importo_base_gara.push(String(ai.importo_base_gara));
      if (ai.costo_manodopera) candidates.costo_manodopera.push(String(ai.costo_manodopera));
      if (ai.ribasso) candidates.ribasso.push(String(ai.ribasso));
      if (ai.cig) candidates.cig.push(String(ai.cig));
      if (ai.cup) candidates.cup.push(String(ai.cup));
      if (ai.rup) candidates.rup.push(String(ai.rup));
      if (ai.direttore_lavori) candidates.direttore_lavori.push(String(ai.direttore_lavori));
      if (ai.impresa_assegnataria) candidates.impresa_assegnataria.push(String(ai.impresa_assegnataria));

      // PNRR references
      if (ai.riferimenti_pnrr) candidates.riferimenti_pnrr.push(String(ai.riferimenti_pnrr));
      if (ai.pnrr) candidates.riferimenti_pnrr.push(String(ai.pnrr));
      if (ai.fondi_pnrr) candidates.riferimenti_pnrr.push(String(ai.fondi_pnrr));
      if (ai.finanziamento) {
        const fin = String(ai.finanziamento).toLowerCase();
        if (fin.includes('pnrr') || fin.includes('next generation') || fin.includes('missione')) {
          candidates.riferimenti_pnrr.push(String(ai.finanziamento));
        }
      }
      if (ai.fonti_finanziamento) {
        const fonti = Array.isArray(ai.fonti_finanziamento) ? ai.fonti_finanziamento : [ai.fonti_finanziamento];
        for (const f of fonti) {
          const fs = String(f).toLowerCase();
          if (fs.includes('pnrr') || fs.includes('next generation') || fs.includes('missione')) {
            candidates.riferimenti_pnrr.push(String(f));
          }
        }
      }

      // Extract from importi
      if (ai.importi) {
        const importi = ai.importi;
        if (typeof importi === 'object' && !Array.isArray(importi)) {
          for (const [k, v] of Object.entries(importi)) {
            const kl = k.toLowerCase();
            if (kl.includes('base') && kl.includes('gara')) candidates.importo_base_gara.push(String(v));
            if (kl.includes('sicurezza')) candidates.oneri_sicurezza.push(String(v));
            if (kl.includes('manodopera')) candidates.costo_manodopera.push(String(v));
            if (kl.includes('contrattual') || kl.includes('complessiv')) candidates.importo_contrattuale.push(String(v));
          }
        } else {
          const importiStr = String(importi);
          if (importiStr.toLowerCase().includes('contrattual') || importiStr.toLowerCase().includes('complessiv')) {
            candidates.importo_contrattuale.push(importiStr);
          }
          if (importiStr.toLowerCase().includes('sicurezza')) {
            candidates.oneri_sicurezza.push(importiStr);
          }
          if (importiStr.toLowerCase().includes('base') && importiStr.toLowerCase().includes('gara')) {
            candidates.importo_base_gara.push(importiStr);
          }
          if (importiStr.toLowerCase().includes('manodopera')) {
            candidates.costo_manodopera.push(importiStr);
          }
        }
      }

      // Extract dates
      if (ai.data) {
        const tipoDoc = (ai.tipo_documento || '').toLowerCase();
        if (tipoDoc.includes('contratto')) {
          candidates.data_contratto.push(String(ai.data));
        }
        if (tipoDoc.includes('consegna')) {
          candidates.data_consegna_lavori.push(String(ai.data));
        }
      }

      // Extract from scadenze
      if (ai.scadenze) {
        const scadArr = Array.isArray(ai.scadenze) ? ai.scadenze : [ai.scadenze];
        for (const s of scadArr) {
          const sStr = String(s).toLowerCase();
          if (sStr.includes('contratt') || sStr.includes('fine lavori') || sStr.includes('ultimazione')) {
            candidates.data_scadenza_contratto.push(String(s));
          }
        }
      }

      // Extract from parti_coinvolte
      if (ai.parti_coinvolte && Array.isArray(ai.parti_coinvolte)) {
        for (const p of ai.parti_coinvolte) {
          if (typeof p === 'object') {
            const ruolo = (p.ruolo || '').toLowerCase();
            const nome = p.nome || p.name || '';
            if (!nome) continue;
            if (ruolo.includes('rup') || ruolo.includes('responsabile unico')) candidates.rup.push(nome);
            if (ruolo.includes('direttore') || ruolo.includes(' dl') || ruolo === 'dl') candidates.direttore_lavori.push(nome);
            if (ruolo.includes('committente') || ruolo.includes('stazione appaltante')) candidates.committente.push(nome);
            if (ruolo.includes('impresa') || ruolo.includes('appaltator') || ruolo.includes('esecutr') || ruolo.includes('assegnatari') || ruolo.includes('consorziata') || ruolo.includes('designat')) candidates.impresa_assegnataria.push(nome);
          }
        }
      }

      // Prioritize impresa from delibere/atti di assegnazione
      const tipoDoc = (ai.tipo_documento || '').toLowerCase();
      if ((tipoDoc.includes('delibera') || tipoDoc.includes('assegnazione') || tipoDoc.includes('designazione')) && ai.impresa_assegnataria) {
        // Push twice to give higher weight in frequency count
        candidates.impresa_assegnataria.push(String(ai.impresa_assegnataria));
        candidates.impresa_assegnataria.push(String(ai.impresa_assegnataria));
      }

      // Also check persone array
      if (ai.persone && Array.isArray(ai.persone)) {
        for (const p of ai.persone) {
          if (typeof p === 'object') {
            const ruolo = (p.ruolo || '').toLowerCase();
            const nome = p.nome || '';
            if (!nome) continue;
            if (ruolo.includes('rup') || ruolo.includes('responsabile unico')) candidates.rup.push(nome);
            if (ruolo.includes('direttore') || ruolo.includes(' dl') || ruolo === 'dl') candidates.direttore_lavori.push(nome);
          }
        }
      }

      // Duration
      if (ai.durata_contrattuale) candidates.durata_contrattuale.push(String(ai.durata_contrattuale));
    }

    // Check if an "atto di assegnazione" document exists
    let hasAttoAssegnazione = false;
    for (const doc of docs) {
      const ai = doc.ai_extracted_data;
      if (!ai || typeof ai !== 'object') continue;
      const tipoDoc = (ai.tipo_documento || '').toLowerCase();
      if (tipoDoc.includes('assegnazione') || tipoDoc.includes('designazione')) {
        hasAttoAssegnazione = true;
        break;
      }
    }

    // Campi che ora sono NUMERIC nel DB — devono essere convertiti prima dell'UPDATE
    const NUMERIC_FIELDS = new Set(['importo_contrattuale', 'oneri_sicurezza', 'costo_manodopera', 'importo_base_gara', 'ribasso']);

    function parseItalianNumber(txt: string): number | null {
      if (!txt || txt.trim() === '' || txt.trim() === '—') return null;
      let cleaned = txt.replace(/[€$\s]|EUR|eur/g, '');
      cleaned = cleaned.replace(/\.(\d{3})/g, '$1'); // rimuovi separatori migliaia
      cleaned = cleaned.replace(',', '.');             // virgola → punto
      cleaned = cleaned.replace(/[^0-9.\-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }

    // Build updates: only overwrite empty fields, pick the most common value
    const updates: Record<string, string | number | null> = {};
    for (const [key, values] of Object.entries(candidates)) {
      // Special handling for impresa_assegnataria
      if (key === 'impresa_assegnataria') {
        const currentVal = (commessa as any)[key];
        if (currentVal && String(currentVal).trim() !== '' && currentVal !== 'Manca atto di assegnazione') continue;
        if (values.length > 0 && hasAttoAssegnazione) {
          const freq: Record<string, number> = {};
          for (const v of values) {
            const trimmed = v.trim();
            if (trimmed && trimmed !== '—') freq[trimmed] = (freq[trimmed] || 0) + 1;
          }
          const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
          if (best) updates[key] = best[0];
        } else if (!hasAttoAssegnazione) {
          updates[key] = 'Manca atto di assegnazione';
        }
        continue;
      }

      if (values.length === 0) continue;
      const currentVal = (commessa as any)[key];
      if (currentVal && String(currentVal).trim() !== '') continue;

      const freq: Record<string, number> = {};
      for (const v of values) {
        const trimmed = v.trim();
        if (trimmed && trimmed !== '—') {
          freq[trimmed] = (freq[trimmed] || 0) + 1;
        }
      }
      const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
      if (best) {
        if (NUMERIC_FIELDS.has(key)) {
          const num = parseItalianNumber(best[0]);
          if (num !== null) updates[key] = num;
        } else {
          updates[key] = best[0];
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await sb
        .from('commessa_data')
        .update(updates)
        .eq('id', commessa.id);
      if (updateErr) throw updateErr;
    }

    return new Response(
      JSON.stringify({
        success: true,
        fields_updated: Object.keys(updates),
        message: Object.keys(updates).length > 0
          ? `Aggiornati ${Object.keys(updates).length} campi dai documenti`
          : 'Nessun nuovo dato trovato nei documenti',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('extract-commessa error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
