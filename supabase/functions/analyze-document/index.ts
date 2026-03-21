// analyze-document edge function - v3 with polizza + scadenze support
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function getSupabaseClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, fileType, documentId, section, commessaId, filePath } = await req.json();

    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: 'File URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller identity and commessa ownership
    if (commessaId) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const sb = getSupabaseClient();
      const { data: ownerCheck } = await sb.from('commessa_data').select('id').eq('id', commessaId).eq('user_id', user.id).maybeSingle();
      if (!ownerCheck) {
        return new Response(JSON.stringify({ error: 'Commessa non trovata o accesso negato' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const isImage = fileType?.startsWith('image/');
    const isPdf = fileType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');
    
    const systemPrompt = `Sei un assistente esperto nell'analisi di documenti per il settore delle costruzioni edili. 
Analizza il documento fornito ed estrai tutte le informazioni rilevanti in formato strutturato JSON.

Devi estrarre:
- tipo_documento: il tipo di documento. Valori possibili: "fattura", "bonifico", "ricevuta_pagamento", "contabile_bancaria", "contratto", "bando_gara", "lettera_invito", "permesso", "PSC", "POS", "scheda sicurezza", "relazione tecnica", "CME", "ordine acquisto", "polizza", "delibera", "atto_assegnazione", altro.
  IMPORTANTE: Se il documento è un bando di gara, disciplinare, lettera di invito o avviso di procedura negoziata, indica "bando_gara" o "lettera_invito".
  IMPORTANTE: Se il documento è un'offerta economica, offerta tecnica o modulo di offerta, indica "offerta".
  IMPORTANTE: Se il documento è una delibera, determina a contrarre, atto di assegnazione, designazione di consorziata, indica "delibera" o "atto_assegnazione".
  IMPORTANTE: Se il documento è una polizza assicurativa (CAR, Anticipazione, Definitiva, RCT/RCO, etc.), indica "polizza".
  IMPORTANTE: Se il documento è una copia di un bonifico bancario, una contabile bancaria, una ricevuta di pagamento o un avviso di accredito, indica "bonifico" o "ricevuta_pagamento" o "contabile_bancaria".
- titolo: titolo o oggetto del documento
- data: data del documento se presente (formato GG/MM/AAAA)
- parti_coinvolte: array di persone o aziende menzionate. Per ogni parte indica:
  { "nome": "...", "ruolo": "emittente|destinatario|fornitore|cliente|committente|subappaltatore|..." }
  IMPORTANTE: Per le FATTURE, identifica SEMPRE chiaramente chi è l'EMITTENTE (chi ha emesso la fattura, il cedente/prestatore) e chi è il DESTINATARIO (chi riceve la fattura, il cessionario/committente). Usa esattamente i ruoli "emittente" e "destinatario".
- scadenze: eventuali scadenze o date importanti
- riferimenti_normativi: riferimenti a leggi, norme, capitolati
- materiali: eventuali materiali menzionati con quantità
- lavorazioni: eventuali lavorazioni menzionate
- note_sicurezza: eventuali note relative alla sicurezza
- note_ambientali: eventuali note relative all'ambiente
- riepilogo: un breve riepilogo del contenuto (max 3 frasi)
- persone: array di oggetti per OGNI persona fisica citata nel documento:
  { "nome", "ruolo", "azienda", "email", "telefono", "cellulare", "pec", "indirizzo" }

- committente: nome del committente/stazione appaltante se presente
- oggetto_lavori: oggetto/descrizione dei lavori se presente
- importo_contrattuale: importo contrattuale complessivo se presente
- oneri_sicurezza: oneri della sicurezza se presenti (numero decimale)
- importo_base_gara: importo a base di gara/importo a base d'asta se presente (numero decimale)
- costo_manodopera: costo della manodopera se presente (numero decimale)
- ribasso: ribasso percentuale o sconto offerto (es. "21,37" o "21.37%"). Estrarre SOLO il numero. Cercare in documenti di offerta economica, moduli di offerta, verbali di aggiudicazione.
- cig: Codice Identificativo Gara (CIG). Cercare in bandi di gara, lettere di invito, contratti, determine.
- cup: Codice Unico di Progetto (CUP). Cercare in bandi di gara, lettere di invito, contratti, determine.
- rup: nome del Responsabile Unico del Procedimento se presente
- direttore_lavori: nome del Direttore dei Lavori se presente
- impresa_assegnataria: ragione sociale dell'impresa consorziata assegnataria/esecutrice. Cercare SOPRATTUTTO in delibere, atti di assegnazione, designazioni di consorziata, determine a contrarre. Estrarre la ragione sociale completa (es. "Edilizia Rossi S.r.l.").
- data_consegna_lavori: data di consegna dei lavori se presente (formato GG/MM/AAAA). Cercare in verbali di consegna lavori, contratti, determine di consegna.
- durata_contrattuale: durata contrattuale dei lavori in giorni (solo numero intero, es. "180", "365"). Cercare in contratti, bandi, verbali di consegna.
- data_scadenza_contratto: data di scadenza/ultimazione dei lavori se presente (formato GG/MM/AAAA). Cercare in contratti, verbali di consegna, determine.

CAMPI SPECIFICI PER SOSPENSIONI LAVORI:
- giorni_sospensione: numero totale di giorni di sospensione dei lavori menzionati nel documento (solo numero intero). Cercare in verbali di sospensione, ordini di servizio, comunicazioni di sospensione.
- periodi_sospensione: array di periodi di sospensione, ciascuno con: { "data_inizio": "GG/MM/AAAA", "data_fine": "GG/MM/AAAA", "giorni": numero, "motivo": "descrizione motivo" }. Estrarre da verbali di sospensione e ripresa lavori.
- motivo_sospensione: motivo della sospensione se presente (es. "condizioni meteo avverse", "variante in corso d'opera", "ordine dell'autorità")

CAMPI SPECIFICI PER POLIZZE ASSICURATIVE:
- tipo_polizza: tipo di polizza (es. "CAR", "Anticipazione", "Definitiva", "RCT/RCO", "Decennale postuma"). Estrarre sempre.
- compagnia_assicurativa: nome della compagnia assicurativa (es. "Zurich", "Generali", "AXA", "Allianz")
- importo_garantito: importo/massimale garantito dalla polizza. Estrarre come numero decimale
- costo_polizza: premio della polizza (il costo pagato per la polizza, NON il massimale garantito). Estrarre come numero decimale. Cerca voci come "premio", "premio lordo", "premio netto", "premio annuo".
- data_emissione_polizza: data di INIZIO validità della polizza, cioè il campo "validità dal" o "decorrenza dal". Formato GG/MM/AAAA
- data_scadenza_polizza: data di FINE validità della polizza, cioè il campo "validità al" o "scadenza" o "fino al". Formato GG/MM/AAAA
- numero_polizza: numero della polizza assicurativa. Estrarre sempre.

CAMPI SPECIFICI PER FATTURE:
- numero_fattura: numero della fattura (es. "275", "FT-001")
- imponibile: importo imponibile (base imponibile netta, SENZA IVA). Estrarre come numero decimale (es. 1234.56)
- aliquota_iva: aliquota IVA in percentuale (es. 22, 10, 4, 0). Se non specificata, lascia null
- importo_iva: importo dell'IVA in euro. Estrarre come numero decimale
- importo_totale: importo totale della fattura (imponibile + IVA). Estrarre come numero decimale
- codice_sdi: codice destinatario SDI se presente
- split_payment: true se la fattura è in regime di split payment o scissione dei pagamenti, false altrimenti
- cig_fattura: codice CIG presente in fattura
- cup_fattura: codice CUP presente in fattura
- tipo_fattura: FONDAMENTALE! Determina se è una FATTURA EMESSA (vendita) o RICEVUTA (acquisto).
  Per distinguere, analizza attentamente:
  1. Il CEDENTE/PRESTATORE (chi emette la fattura) e il CESSIONARIO/COMMITTENTE (chi la riceve)
  2. Se la fattura è stata emessa dal "Consorzio Stabile Santa Rita" o da una delle sue consorziate → è "vendita" (fattura emessa)
  3. Se la fattura è stata ricevuta dal "Consorzio Stabile Santa Rita" (cioè il Consorzio è il cessionario/committente) → è "acquisto" (fattura ricevuta)
  4. Cerca sempre i campi "Cedente/Prestatore" e "Cessionario/Committente" nel documento
  Valori: "vendita" per fattura emessa, "acquisto" per fattura ricevuta
- emittente_fattura: nome completo del CEDENTE/PRESTATORE (chi ha emesso la fattura). Estrarre sempre.
- destinatario_fattura: nome completo del CESSIONARIO/COMMITTENTE (chi riceve la fattura). Estrarre sempre.
- data_scadenza_fattura: data di scadenza del pagamento se presente (formato GG/MM/AAAA)
- descrizione_contenuto: descrizione dettagliata del contenuto della fattura (cosa è stato acquistato/venduto, quali servizi o lavorazioni, materiali forniti). Sii specifico e completo.
- categoria_centro: analizza il contenuto della fattura e suggerisci una categoria tra: "materiali", "manodopera", "noli", "trasporti", "subappalti", "servizi professionali", "attrezzature", "sicurezza", "smaltimento", "polizze", "altro". Scegli la più appropriata in base al contenuto.

CAMPI SPECIFICI PER BONIFICI/PAGAMENTI:
- numero_fattura_riferimento: numero della fattura a cui si riferisce il bonifico/pagamento (se menzionato)
- importo_bonifico: importo del bonifico/pagamento
- data_valuta: data di valuta del bonifico
- ordinante: nome dell'ordinante del bonifico
- beneficiario: nome del beneficiario del bonifico
- causale: causale del bonifico (spesso contiene il numero fattura)
- cro_trn: codice CRO o TRN del bonifico se presente

Rispondi SOLO con il JSON, senza markdown o altro testo.`;

    let messages: any[];

    if (isImage || isPdf) {
      let dataUrl = fileUrl;
      let useVision = true;
      try {
        const fileResp = await fetch(fileUrl);
        if (fileResp.ok) {
          const arrayBuf = await fileResp.arrayBuffer();
          const fileSizeMB = arrayBuf.byteLength / 1024 / 1024;
          // Skip base64 for files > 4MB — fall back to text-only analysis
          if (fileSizeMB > 4) {
            console.log(`File too large (${fileSizeMB.toFixed(1)}MB), falling back to text-only prompt`);
            useVision = false;
          } else {
            // Use Deno's built-in base64 encoding to avoid memory spikes
            const { encode } = await import("https://deno.land/std@0.168.0/encoding/base64.ts");
            const b64 = encode(new Uint8Array(arrayBuf));
            const mime = isPdf ? 'application/pdf' : (fileType || 'image/jpeg');
            dataUrl = `data:${mime};base64,${b64}`;
          }
        }
      } catch (e) {
        console.error('Error fetching file for base64 conversion:', e);
        useVision = false;
      }

      if (useVision) {
        messages = [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analizza questo documento: ${fileName}` },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ];
      } else {
        // For large files, send a text-only request with filename context
        messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analizza il documento "${fileName}". Il file è troppo grande per l'analisi visiva. Estrai le informazioni dal nome del file e restituisci un JSON con i campi che riesci a dedurre. Per i campi non determinabili, usa null.` }
        ];
      }
    } else {
      let textContent = '';
      try {
        const fileResp = await fetch(fileUrl);
        if (fileResp.ok) {
          textContent = await fileResp.text();
          if (textContent.length > 15000) {
            textContent = textContent.substring(0, 15000) + '\n...[contenuto troncato]';
          }
        }
      } catch {
        textContent = `[Impossibile leggere il contenuto del file: ${fileName}]`;
      }

      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analizza questo documento "${fileName}":\n\n${textContent}` }
      ];
    }

    // Retry logic with model fallback for transient 502 errors
    const models = ['google/gemini-2.5-flash', 'google/gemini-3-flash-preview', 'google/gemini-2.5-flash-lite'];
    let response: Response | null = null;
    let lastError = '';

    for (let attempt = 0; attempt < 3; attempt++) {
      const model = models[attempt] || models[models.length - 1];
      if (attempt > 0) {
        const delay = 2000 * Math.pow(2, attempt - 1);
        console.warn(`Retry attempt ${attempt + 1} with model ${model} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }

      const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages }),
      });

      if (resp.ok) {
        response = resp;
        break;
      }

      // Non-retryable errors
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Troppe richieste. Riprova tra qualche istante.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crediti AI esauriti. Aggiungi crediti al workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const errorText = await resp.text();
      console.error(`AI gateway error (attempt ${attempt + 1}, model ${model}):`, resp.status, errorText);
      lastError = `${resp.status} - ${errorText}`;

      // Handle "document has no pages" - not retryable, use fallback
      if (resp.status === 400 && errorText.includes('no pages')) {
        console.log('Document has no pages for vision, retrying with text-only prompt');
        const fallbackMessages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analizza il documento "${fileName}". Il file non è leggibile dall'analisi visiva (potrebbe essere vuoto, corrotto o protetto). Estrai le informazioni dal nome del file e restituisci un JSON con i campi che riesci a dedurre. Per i campi non determinabili, usa null.` }
        ];
        const fallbackResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ model: 'google/gemini-2.5-flash', messages: fallbackMessages }),
        });
        if (fallbackResp.ok) {
          const fbData = await fallbackResp.json();
          const fbContent = fbData.choices?.[0]?.message?.content || '';
          let fbExtracted;
          try {
            const jsonMatch = fbContent.match(/\{[\s\S]*\}/);
            fbExtracted = jsonMatch ? JSON.parse(jsonMatch[0]) : { riepilogo: fbContent };
          } catch { fbExtracted = { riepilogo: fbContent }; }
          fbExtracted._warning = 'Il documento non è stato leggibile dall\'analisi visiva. Le informazioni sono state dedotte dal nome del file.';
          return new Response(
            JSON.stringify({ extracted_data: fbExtracted, summary: fbExtracted.riepilogo || 'Documento non leggibile' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break; // Don't retry 400 errors
      }

      // Only retry on 5xx errors
      if (resp.status < 500) break;
    }

    if (!response) {
      throw new Error(`AI gateway error: ${lastError}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    let extractedData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = { riepilogo: content };
      }
    } catch {
      extractedData = { riepilogo: content };
    }

    // Save extracted persons
    if (extractedData.persone && Array.isArray(extractedData.persone) && extractedData.persone.length > 0 && documentId) {
      try {
        const sb = getSupabaseClient();
        for (const persona of extractedData.persone) {
          if (!persona.nome) continue;
          const { data: existing } = await sb
            .from('persons')
            .select('id, source_document_ids')
            .ilike('nome', persona.nome.trim())
            .maybeSingle();

          if (existing) {
            const docIds = existing.source_document_ids || [];
            if (!docIds.includes(documentId)) docIds.push(documentId);
            const updateData: any = { source_document_ids: docIds };
            if (persona.ruolo) updateData.ruolo = persona.ruolo;
            if (persona.azienda) updateData.azienda = persona.azienda;
            if (persona.email) updateData.email = persona.email;
            if (persona.telefono) updateData.telefono = persona.telefono;
            if (persona.cellulare) updateData.cellulare = persona.cellulare;
            if (persona.pec) updateData.pec = persona.pec;
            if (persona.indirizzo) updateData.indirizzo = persona.indirizzo;
            await sb.from('persons').update(updateData).eq('id', existing.id);
          } else {
            await sb.from('persons').insert({
              nome: persona.nome.trim(),
              ruolo: persona.ruolo || null,
              azienda: persona.azienda || null,
              email: persona.email || null,
              telefono: persona.telefono || null,
              cellulare: persona.cellulare || null,
              pec: persona.pec || null,
              indirizzo: persona.indirizzo || null,
              source_document_ids: [documentId],
            });
          }
        }
      } catch (personErr) {
        console.error('Error saving persons:', personErr);
      }
    }

    // Enrich commessa_data
    if (commessaId) {
      try {
        const sb = getSupabaseClient();
        const { data: commessa } = await sb.from('commessa_data').select('*').eq('id', commessaId).maybeSingle();
        if (commessa) {
          const updates: Record<string, string> = {};
          const fieldMap: Record<string, string> = {
            committente: 'committente',
            oggetto_lavori: 'oggetto_lavori',
            importo_contrattuale: 'importo_contrattuale',
            oneri_sicurezza: 'oneri_sicurezza',
            rup: 'rup',
            direttore_lavori: 'direttore_lavori',
            impresa_assegnataria: 'impresa_assegnataria',
            data_consegna_lavori: 'data_consegna_lavori',
            durata_contrattuale: 'durata_contrattuale',
            data_scadenza_contratto: 'data_scadenza_contratto',
            importo_base_gara: 'importo_base_gara',
            costo_manodopera: 'costo_manodopera',
            ribasso: 'ribasso',
            cig: 'cig',
            cup: 'cup',
          };
          for (const [aiKey, dbKey] of Object.entries(fieldMap)) {
            if (extractedData[aiKey] && !commessa[dbKey]) {
              updates[dbKey] = String(extractedData[aiKey]);
            }
          }
          if (extractedData.parti_coinvolte && Array.isArray(extractedData.parti_coinvolte)) {
            for (const p of extractedData.parti_coinvolte) {
              if (typeof p === 'object') {
                const ruolo = (p.ruolo || '').toLowerCase();
                const nome = p.nome || p.name || '';
                if (ruolo.includes('rup') && !commessa.rup && nome) updates.rup = nome;
                if ((ruolo.includes('direttore') || ruolo.includes('dl')) && !commessa.direttore_lavori && nome) updates.direttore_lavori = nome;
                if (ruolo.includes('committente') && !commessa.committente && nome) updates.committente = nome;
              }
            }
          }
          if (Object.keys(updates).length > 0) {
            await sb.from('commessa_data').update(updates).eq('id', commessaId);
          }
        }
      } catch (commessaErr) {
        console.error('Error updating commessa_data:', commessaErr);
      }
    }

    // ─── POLIZZA: auto-create scadenza + fattura costo ───
    const tipoDoc = (extractedData.tipo_documento || '').toLowerCase();
    
    if (tipoDoc.includes('polizza')) {
      const sb = getSupabaseClient();
      
      const parseDate = (d: string | null): string | null => {
        if (!d) return null;
        const parts = d.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return d;
      };

      const parseNum = (v: any): number | null => {
        if (v === null || v === undefined || v === '') return null;
        if (typeof v === 'number') return v;
        let s = String(v).replace(/\s/g, '').replace(/[€$]/g, '');
        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');
        if (lastComma > lastDot) {
          s = s.replace(/\./g, '').replace(',', '.');
        } else {
          s = s.replace(/,/g, '');
        }
        const n = parseFloat(s);
        return isNaN(n) ? null : n;
      };

      const tipoPolizza = extractedData.tipo_polizza || 'Polizza';
      const compagnia = extractedData.compagnia_assicurativa || null;
      const importoGarantito = parseNum(extractedData.importo_garantito);
      const costoPolizza = parseNum(extractedData.costo_polizza);
      const dataEmissione = parseDate(extractedData.data_emissione_polizza);
      const dataScadenza = parseDate(extractedData.data_scadenza_polizza);
      const numeroPolizza = extractedData.numero_polizza || '';

      // Create scadenza record
      if (dataScadenza && commessaId) {
        try {
          await sb.from('scadenze').insert({
            commessa_id: commessaId,
            titolo: `Polizza ${tipoPolizza}${numeroPolizza ? ' n.' + numeroPolizza : ''}`,
            numero: numeroPolizza || null,
            descrizione: extractedData.riepilogo || `${tipoPolizza} - ${compagnia || 'Compagnia N/D'}`,
            tipo: 'polizza',
            data_scadenza: dataScadenza,
            data_emissione: dataEmissione,
            importo_garantito: importoGarantito,
            costo: costoPolizza,
            compagnia,
            tipo_polizza: tipoPolizza,
            document_id: documentId || null,
          });
          console.log(`Scadenza created for polizza ${tipoPolizza}, expires ${dataScadenza}`);
        } catch (scadErr) {
          console.error('Error creating scadenza:', scadErr);
        }
      }

      // Create fattura costo in Economia CSSR
      if (costoPolizza && costoPolizza > 0 && commessaId) {
        try {
          // Auto-match centro imputazione
          let centroImputazioneId: string | null = null;
          const { data: centriList } = await sb.from('centri_imputazione')
            .select('id, nome, tipo, regola_denominazione')
            .eq('commessa_id', commessaId)
            .eq('sezione', 'cssr');

          if (centriList && centriList.length > 0) {
            const descLower = (`polizza ${tipoPolizza} assicurazione`).toLowerCase();
            for (const centro of centriList) {
              const regola = (centro.regola_denominazione || '').toLowerCase();
              if (regola) {
                const keywords = regola.split(',').map((k: string) => k.trim()).filter(Boolean);
                if (keywords.some((kw: string) => descLower.includes(kw) || kw.includes('polizz') || kw.includes('assicur'))) {
                  centroImputazioneId = centro.id;
                  break;
                }
              }
              const nomeC = (centro.nome || '').toLowerCase();
              if (nomeC.includes('polizz') || nomeC.includes('assicur')) {
                centroImputazioneId = centro.id;
                break;
              }
            }
          }

          const { error: polFattErr } = await sb.from('fatture').insert({
            numero: numeroPolizza || `POL-${Date.now()}`,
            data: dataEmissione || new Date().toISOString().split('T')[0],
            tipo: 'acquisto',
            fornitore_cliente: compagnia || 'Compagnia assicurativa',
            importo: costoPolizza,
            aliquota_iva: 0,
            importo_iva: 0,
            importo_totale: costoPolizza,
            split_payment: false,
            descrizione: `Polizza ${tipoPolizza}${numeroPolizza ? ' n.' + numeroPolizza : ''} - ${compagnia || ''}`.trim(),
            stato_pagamento: 'da_pagare',
            file_path: filePath || null,
            commessa_id: commessaId,
            centro_imputazione_id: centroImputazioneId,
            centro_auto_assigned: centroImputazioneId !== null,
          });
          if (polFattErr) {
            console.error('Fattura costo polizza insert error:', JSON.stringify(polFattErr));
          } else {
            console.log(`Fattura costo created for polizza ${tipoPolizza}: ${costoPolizza}`);
          }
        } catch (fattCostErr) {
          console.error('Error creating fattura costo for polizza:', fattCostErr);
        }
      }
    }

    // ─── ECONOMIA CSSR: auto-create fattura or match bonifico (from ANY section) ───
    if (commessaId && !tipoDoc.includes('polizza')) {
      const sb = getSupabaseClient();

      if (tipoDoc.includes('fattura')) {
        try {
          const parseNum = (v: any): number => {
            if (v === null || v === undefined || v === '') return 0;
            if (typeof v === 'number') return v;
            let s = String(v).replace(/\s/g, '').replace(/[€$]/g, '');
            const lastDot = s.lastIndexOf('.');
            const lastComma = s.lastIndexOf(',');
            if (lastComma > lastDot) {
              s = s.replace(/\./g, '').replace(',', '.');
            } else {
              s = s.replace(/,/g, '');
            }
            const n = parseFloat(s);
            return isNaN(n) ? 0 : n;
          };

          const parseDate = (d: string | null): string => {
            if (!d) return new Date().toISOString().split('T')[0];
            const parts = d.split('/');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
            return d;
          };

          const dataFattura = parseDate(extractedData.data);
          let numero = extractedData.numero_fattura || 'N/D';
          if (numero === 'N/D') {
            const numMatch = (extractedData.titolo || fileName || '').match(/(?:n\.?\s*|Ft\.?\s*|fattura\s*n?\.?\s*)(\d+)/i);
            if (numMatch) numero = numMatch[1];
          }

          let importo = parseNum(extractedData.imponibile);
          if (!importo && extractedData.importo_totale) {
            importo = parseNum(extractedData.importo_totale);
          }
          if (!importo && extractedData.importi && Array.isArray(extractedData.importi)) {
            for (const imp of extractedData.importi) {
              const val = imp.valore || imp.importo || imp.totale;
              if (val) { importo = parseNum(val); if (importo) break; }
            }
          }

          const aliquotaIva = extractedData.aliquota_iva != null ? parseNum(extractedData.aliquota_iva) : 22;
          const importoIva = parseNum(extractedData.importo_iva) || null;
          const importoTotale = parseNum(extractedData.importo_totale) || null;

          let tipo = extractedData.tipo_fattura === 'vendita' ? 'vendita' : 'acquisto';
          const emittente = (extractedData.emittente_fattura || '').trim();
          const destinatario = (extractedData.destinatario_fattura || '').trim();
          const CONSORZIO = 'consorzio stabile santa rita';

          if (emittente && emittente.toLowerCase().includes(CONSORZIO)) {
            tipo = 'vendita';
          } else if (destinatario && destinatario.toLowerCase().includes(CONSORZIO)) {
            tipo = 'acquisto';
          }
          
          const allParti = extractedData.parti_coinvolte || [];
          for (const p of allParti) {
            const nomeP = (p.nome || p.name || '').toLowerCase();
            const ruoloP = (p.ruolo || '').toLowerCase();
            if (nomeP.includes(CONSORZIO)) {
              if (ruoloP.includes('emittente') || ruoloP.includes('cedente') || ruoloP.includes('prestatore')) {
                tipo = 'vendita';
              } else if (ruoloP.includes('destinatario') || ruoloP.includes('cessionario') || ruoloP.includes('committente')) {
                tipo = 'acquisto';
              }
            }
          }

          let fornitoreCliente = '';
          if (tipo === 'vendita') {
            fornitoreCliente = destinatario || '';
            if (!fornitoreCliente || fornitoreCliente.toLowerCase().includes(CONSORZIO)) {
              for (const p of allParti) {
                const n = (p.nome || p.name || '').trim();
                if (n && !n.toLowerCase().includes(CONSORZIO)) {
                  fornitoreCliente = n;
                  break;
                }
              }
            }
          } else {
            fornitoreCliente = emittente || '';
            if (!fornitoreCliente || fornitoreCliente.toLowerCase().includes(CONSORZIO)) {
              for (const p of allParti) {
                const n = (p.nome || p.name || '').trim();
                if (n && !n.toLowerCase().includes(CONSORZIO)) {
                  fornitoreCliente = n;
                  break;
                }
              }
            }
          }
          if (!fornitoreCliente) {
            fornitoreCliente = extractedData.committente 
              || (extractedData.parti_coinvolte?.[0]?.nome) 
              || 'Da compilare';
          }

          const splitPayment = extractedData.split_payment === true;
          const codiceSdi = extractedData.codice_sdi || null;
          const cigFattura = extractedData.cig_fattura || null;
          const cupFattura = extractedData.cup_fattura || null;
          const dataScadenza = extractedData.data_scadenza_fattura ? parseDate(extractedData.data_scadenza_fattura) : null;

          const descrizioneContenuto = extractedData.descrizione_contenuto || '';
          const descrizione = descrizioneContenuto || extractedData.riepilogo || extractedData.titolo || fileName;

          let centroImputazioneId: string | null = null;
          if (commessaId) {
            try {
              const { data: centriList } = await sb.from('centri_imputazione')
                .select('id, nome, tipo, regola_denominazione')
                .eq('commessa_id', commessaId)
                .eq('sezione', 'cssr');

              if (centriList && centriList.length > 0) {
                const categoria = (extractedData.categoria_centro || '').toLowerCase();
                const descLower = descrizione.toLowerCase();
                
                for (const centro of centriList) {
                  const nomeC = (centro.nome || '').toLowerCase();
                  const regola = (centro.regola_denominazione || '').toLowerCase();
                  
                  if (regola) {
                    const keywords = regola.split(',').map((k: string) => k.trim()).filter(Boolean);
                    if (keywords.some((kw: string) => descLower.includes(kw) || categoria.includes(kw))) {
                      centroImputazioneId = centro.id;
                      break;
                    }
                  }
                  if (descLower.includes(nomeC) || categoria.includes(nomeC)) {
                    centroImputazioneId = centro.id;
                    break;
                  }
                }
              }
            } catch (centroErr) {
              console.error('Error matching centro imputazione:', centroErr);
            }
          }

          const { error: insertErr } = await sb.from('fatture').insert({
            numero,
            data: dataFattura,
            tipo,
            fornitore_cliente: fornitoreCliente,
            importo,
            aliquota_iva: aliquotaIva,
            split_payment: splitPayment,
            codice_sdi: codiceSdi,
            cig: cigFattura,
            cup: cupFattura,
            data_scadenza: dataScadenza,
            descrizione,
            stato_pagamento: 'da_pagare',
            file_path: filePath || `economia-cssr/${fileName}`,
            commessa_id: commessaId || null,
            centro_imputazione_id: centroImputazioneId,
            centro_auto_assigned: centroImputazioneId !== null,
          });
          if (insertErr) {
            console.error('Fattura insert error:', JSON.stringify(insertErr));
          } else {
            console.log('Fattura record created with full financial data');
          }
        } catch (fatturaErr) {
          console.error('Error creating fattura:', fatturaErr);
        }

      } else if (tipoDoc.includes('bonifico') || tipoDoc.includes('contabile') || tipoDoc.includes('ricevuta') || tipoDoc.includes('pagamento')) {
        try {
          const numFatturaRef = extractedData.numero_fattura_riferimento || '';
          const causale = extractedData.causale || '';
          const ordinante = extractedData.ordinante || '';
          const beneficiario = extractedData.beneficiario || '';
          
          let numToMatch = numFatturaRef;
          if (!numToMatch) {
            const causaleMatch = causale.match(/(?:ft|fatt|fattura|n\.?)\s*(\d+)/i);
            if (causaleMatch) numToMatch = causaleMatch[1];
          }
          if (!numToMatch) {
            const fileMatch = fileName.match(/(?:ft|fatt|fattura|n\.?)\s*(\d+)/i);
            if (fileMatch) numToMatch = fileMatch[1];
          }

          let importoBonifico = 0;
          if (extractedData.importo_bonifico) {
            const parsed = parseFloat(String(extractedData.importo_bonifico).replace(/[^\d.,]/g, '').replace(',', '.'));
            if (!isNaN(parsed)) importoBonifico = parsed;
          } else if (extractedData.importi && Array.isArray(extractedData.importi)) {
            for (const imp of extractedData.importi) {
              const val = imp.valore || imp.importo || imp.totale;
              if (val) {
                const parsed = parseFloat(String(val).replace(/[^\d.,]/g, '').replace(',', '.'));
                if (!isNaN(parsed)) { importoBonifico = parsed; break; }
              }
            }
          }

          let matched = false;
          const query = sb.from('fatture').select('*');
          if (commessaId) query.eq('commessa_id', commessaId);

          const { data: allFatture } = await query;
          const cigBonifico = extractedData.cig || '';

          if (allFatture && allFatture.length > 0) {
            // 1. Match by CIG + invoice number
            if (numToMatch && cigBonifico) {
              const byCigAndNum = allFatture.find(f => 
                f.cig && f.cig === cigBonifico && 
                (f.numero === numToMatch || f.numero.includes(numToMatch))
              );
              if (byCigAndNum) {
                const noteText = [
                  byCigAndNum.note || '',
                  `Pagamento registrato automaticamente da: ${fileName}`,
                  extractedData.cro_trn ? `CRO/TRN: ${extractedData.cro_trn}` : '',
                  extractedData.data_valuta ? `Data valuta: ${extractedData.data_valuta}` : '',
                ].filter(Boolean).join('\n');

                const newIncassato = (Number(byCigAndNum.importo_incassato) || 0) + importoBonifico;
                const totale = Number(byCigAndNum.importo_totale) || 0;
                const isPaid = Math.abs(newIncassato - totale) < 0.5 || newIncassato >= totale;

                await sb.from('fatture').update({
                  stato_pagamento: isPaid ? 'pagata' : 'da_pagare',
                  importo_incassato: newIncassato,
                  note: noteText,
                }).eq('id', byCigAndNum.id);
                matched = true;
                console.log(`Bonifico matched to fattura ${byCigAndNum.numero} by CIG+number, incassato: ${newIncassato}`);
              }
            }

            // 2. Match by invoice number only
            if (!matched && numToMatch) {
              const byNumber = allFatture.find(f => f.numero === numToMatch || f.numero.includes(numToMatch));
              if (byNumber) {
                const noteText = [
                  byNumber.note || '',
                  `Pagamento registrato automaticamente da: ${fileName}`,
                  extractedData.cro_trn ? `CRO/TRN: ${extractedData.cro_trn}` : '',
                  extractedData.data_valuta ? `Data valuta: ${extractedData.data_valuta}` : '',
                ].filter(Boolean).join('\n');

                const newIncassato = (Number(byNumber.importo_incassato) || 0) + importoBonifico;
                const totale = Number(byNumber.importo_totale) || 0;
                const isPaid = Math.abs(newIncassato - totale) < 0.5 || newIncassato >= totale;

                await sb.from('fatture').update({
                  stato_pagamento: isPaid ? 'pagata' : 'da_pagare',
                  importo_incassato: newIncassato,
                  note: noteText,
                }).eq('id', byNumber.id);
                matched = true;
                console.log(`Bonifico matched to fattura ${byNumber.numero} by number, incassato: ${newIncassato}`);
              }
            }

            // 3. Match by amount + name
            if (!matched && importoBonifico > 0) {
              const searchName = (ordinante || beneficiario).toLowerCase();
              const byAmount = allFatture.find(f => {
                const totale = Number(f.importo_totale || f.importo);
                const amountMatch = Math.abs(totale - importoBonifico) < 0.5;
                if (!amountMatch) return false;
                if (searchName && f.fornitore_cliente) {
                  return f.fornitore_cliente.toLowerCase().includes(searchName) || 
                         searchName.includes(f.fornitore_cliente.toLowerCase());
                }
                return amountMatch;
              });

              if (byAmount) {
                const noteText = [
                  byAmount.note || '',
                  `Pagamento registrato automaticamente da: ${fileName}`,
                  extractedData.cro_trn ? `CRO/TRN: ${extractedData.cro_trn}` : '',
                  extractedData.data_valuta ? `Data valuta: ${extractedData.data_valuta}` : '',
                ].filter(Boolean).join('\n');

                const newIncassato = (Number(byAmount.importo_incassato) || 0) + importoBonifico;
                const totale = Number(byAmount.importo_totale) || 0;
                const isPaid = Math.abs(newIncassato - totale) < 0.5 || newIncassato >= totale;

                await sb.from('fatture').update({
                  stato_pagamento: isPaid ? 'pagata' : 'da_pagare',
                  importo_incassato: newIncassato,
                  note: noteText,
                }).eq('id', byAmount.id);
                matched = true;
                console.log(`Bonifico matched to fattura ${byAmount.numero} by amount, incassato: ${newIncassato}`);
              }
            }

            if (!matched) {
              console.log('Bonifico uploaded but no matching fattura found. Stored as document.');
            }
          }
        } catch (bonificoErr) {
          console.error('Error matching bonifico:', bonificoErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        extracted_data: extractedData,
        summary: extractedData.riepilogo || 'Analisi completata',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('analyze-document error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
