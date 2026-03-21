import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── READ tools ──────────────────────────────────────────────────────
const READ_TOOLS = [
  {
    type: "function",
    function: {
      name: "query_commessa",
      description: "Ottieni i dati generali della commessa attiva (importo, committente, oggetto lavori, date, CIG, CUP, ecc.)",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "query_documents",
      description: "Cerca documenti caricati nella commessa. Puoi filtrare per sezione e/o nome file.",
      parameters: {
        type: "object",
        properties: {
          section: { type: "string", description: "Sezione (es. documenti, sicurezza, ambiente, progetto)" },
          search: { type: "string", description: "Testo da cercare nel nome file" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_fatture",
      description: "Cerca fatture della commessa. Puoi filtrare per tipo (attiva/passiva), stato pagamento, fornitore/cliente.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["attiva", "passiva"], description: "Tipo fattura" },
          stato: { type: "string", description: "Stato pagamento (da_pagare, pagata, parziale)" },
          search: { type: "string", description: "Cerca nel fornitore/cliente o descrizione" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_persone",
      description: "Cerca persone/contatti della commessa (DL, RUP, imprese, ecc.)",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Cerca per nome, ruolo o azienda" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_scadenze",
      description: "Ottieni le scadenze e polizze della commessa.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", description: "Tipo scadenza (polizza, adempimento, ecc.)" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_cronoprogramma",
      description: "Ottieni le fasi del cronoprogramma della commessa con date, avanzamento e dipendenze.",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "query_ordini",
      description: "Cerca ordini di acquisto della commessa.",
      parameters: {
        type: "object",
        properties: {
          stato: { type: "string", description: "Stato ordine (in_attesa, confermato, consegnato, annullato)" },
          search: { type: "string", description: "Cerca per fornitore o descrizione" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_cme",
      description: "Ottieni le voci del Computo Metrico Estimativo (CME) della commessa.",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Cerca per descrizione o codice" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_centri_imputazione",
      description: "Ottieni i centri di imputazione della commessa.",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "query_aziende",
      description: "Cerca aziende/ditte/enti della commessa. Puoi filtrare per tipo o nome.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", description: "Tipo azienda" },
          search: { type: "string", description: "Cerca per nome o P.IVA" },
        },
        additionalProperties: false,
      },
    },
  },
];

// ── WRITE tools ─────────────────────────────────────────────────────
const WRITE_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_scadenza",
      description: "Crea una nuova scadenza/polizza nella commessa. Richiede almeno titolo e data_scadenza.",
      parameters: {
        type: "object",
        properties: {
          titolo: { type: "string", description: "Titolo della scadenza" },
          tipo: { type: "string", description: "Tipo (polizza, adempimento, contratto, altro)" },
          tipo_polizza: { type: "string", description: "Tipo polizza (CAR, Anticipazione, Definitiva, ecc.)" },
          data_scadenza: { type: "string", description: "Data scadenza YYYY-MM-DD" },
          data_emissione: { type: "string", description: "Data emissione YYYY-MM-DD" },
          compagnia: { type: "string", description: "Compagnia assicurativa" },
          importo_garantito: { type: "number", description: "Importo garantito" },
          costo: { type: "number", description: "Premio/costo" },
          numero: { type: "string", description: "Numero polizza" },
          descrizione: { type: "string", description: "Descrizione aggiuntiva" },
        },
        required: ["titolo", "data_scadenza"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_scadenza",
      description: "Aggiorna una scadenza/polizza esistente. Servono l'id del record e i campi da aggiornare.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID della scadenza da aggiornare" },
          titolo: { type: "string" },
          tipo: { type: "string" },
          tipo_polizza: { type: "string" },
          data_scadenza: { type: "string" },
          data_emissione: { type: "string" },
          compagnia: { type: "string" },
          importo_garantito: { type: "number" },
          costo: { type: "number" },
          numero: { type: "string" },
          descrizione: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_scadenza",
      description: "Elimina una scadenza/polizza esistente. Serve l'id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID della scadenza da eliminare" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_fattura",
      description: "Aggiorna una fattura esistente (es. stato pagamento, note, importo incassato). Serve l'id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID della fattura da aggiornare" },
          stato_pagamento: { type: "string", enum: ["da_pagare", "pagata", "parziale"], description: "Stato pagamento" },
          importo_incassato: { type: "number", description: "Importo incassato/pagato" },
          note: { type: "string", description: "Note aggiuntive" },
          data_scadenza: { type: "string", description: "Data scadenza YYYY-MM-DD" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_persona",
      description: "Crea un nuovo contatto/persona nella commessa.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome completo" },
          ruolo: { type: "string", description: "Ruolo (DL, RUP, CSE, ecc.)" },
          azienda: { type: "string", description: "Azienda di appartenenza" },
          email: { type: "string" },
          telefono: { type: "string" },
          cellulare: { type: "string" },
          pec: { type: "string" },
          note: { type: "string" },
        },
        required: ["nome"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_persona",
      description: "Aggiorna un contatto/persona esistente. Serve l'id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID della persona" },
          nome: { type: "string" },
          ruolo: { type: "string" },
          azienda: { type: "string" },
          email: { type: "string" },
          telefono: { type: "string" },
          cellulare: { type: "string" },
          pec: { type: "string" },
          note: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_persona",
      description: "Elimina un contatto/persona. Serve l'id.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "ID della persona" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_azienda",
      description: "Crea una nuova azienda/ente nella commessa.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Ragione sociale" },
          tipo: { type: "string", description: "Tipo (committente, fornitore, subappaltatore, impresa, consorzio, ente, professionista)" },
          partita_iva: { type: "string" },
          codice_fiscale: { type: "string" },
          indirizzo: { type: "string" },
          citta: { type: "string" },
          provincia: { type: "string" },
          telefono: { type: "string" },
          email: { type: "string" },
          pec: { type: "string" },
          sito_web: { type: "string" },
          note: { type: "string" },
        },
        required: ["nome"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_azienda",
      description: "Aggiorna un'azienda/ente esistente. Serve l'id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID dell'azienda" },
          nome: { type: "string" },
          tipo: { type: "string" },
          partita_iva: { type: "string" },
          codice_fiscale: { type: "string" },
          indirizzo: { type: "string" },
          citta: { type: "string" },
          provincia: { type: "string" },
          telefono: { type: "string" },
          email: { type: "string" },
          pec: { type: "string" },
          sito_web: { type: "string" },
          note: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_azienda",
      description: "Elimina un'azienda/ente. Serve l'id.",
      parameters: {
        type: "object",
        properties: { id: { type: "string", description: "ID dell'azienda" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_ordine",
      description: "Aggiorna un ordine di acquisto (stato, date consegna, note). Serve l'id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID dell'ordine" },
          stato: { type: "string", enum: ["in_attesa", "confermato", "consegnato", "annullato"] },
          data_consegna_prevista: { type: "string" },
          data_consegna_effettiva: { type: "string" },
          note: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_fase_cronoprogramma",
      description: "Aggiorna una fase del cronoprogramma (avanzamento, date). Serve l'id.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID della fase" },
          progress: { type: "number", description: "Avanzamento 0-100" },
          start_date: { type: "string", description: "Data inizio YYYY-MM-DD" },
          end_date: { type: "string", description: "Data fine YYYY-MM-DD" },
          name: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
];

// ── Permissions map by role ─────────────────────────────────────────
const ROLE_PERMISSIONS: Record<string, Set<string>> = {
  admin: new Set([
    // all read + write tools
    ...READ_TOOLS.map(t => t.function.name),
    ...WRITE_TOOLS.map(t => t.function.name),
  ]),
  editor: new Set([
    ...READ_TOOLS.map(t => t.function.name),
    ...WRITE_TOOLS.map(t => t.function.name),
  ]),
  viewer: new Set([
    ...READ_TOOLS.map(t => t.function.name),
    // viewers cannot write
  ]),
};

// ── Execute read tool ───────────────────────────────────────────────
async function executeReadTool(
  supabase: any,
  commessaId: string,
  toolName: string,
  args: Record<string, any>
): Promise<string> {
  try {
    switch (toolName) {
      case "query_commessa": {
        const { data, error } = await supabase.from("commessa_data").select("*").eq("id", commessaId).single();
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_documents": {
        let q = supabase.from("documents").select("id, file_name, section, subfolder, file_type, file_size, ai_summary, ai_status, created_at").eq("commessa_id", commessaId).order("created_at", { ascending: false }).limit(50);
        if (args.section) q = q.eq("section", args.section);
        if (args.search) q = q.ilike("file_name", `%${args.search}%`);
        const { data, error } = await q;
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_fatture": {
        let q = supabase.from("fatture").select("id, numero, tipo, data, fornitore_cliente, descrizione, importo, importo_totale, stato_pagamento, data_scadenza").eq("commessa_id", commessaId).order("data", { ascending: false }).limit(50);
        if (args.tipo) q = q.eq("tipo", args.tipo);
        if (args.stato) q = q.eq("stato_pagamento", args.stato);
        if (args.search) q = q.or(`fornitore_cliente.ilike.%${args.search}%,descrizione.ilike.%${args.search}%`);
        const { data, error } = await q;
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_persone": {
        let q = supabase.from("persons").select("id, nome, ruolo, azienda, email, telefono, cellulare, pec").eq("commessa_id", commessaId).order("nome").limit(50);
        if (args.search) q = q.or(`nome.ilike.%${args.search}%,ruolo.ilike.%${args.search}%,azienda.ilike.%${args.search}%`);
        const { data, error } = await q;
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_scadenze": {
        let q = supabase.from("scadenze").select("id, titolo, tipo, tipo_polizza, data_scadenza, data_emissione, compagnia, importo_garantito, costo, numero, descrizione").eq("commessa_id", commessaId).order("data_scadenza").limit(50);
        if (args.tipo) q = q.eq("tipo", args.tipo);
        const { data, error } = await q;
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_cronoprogramma": {
        const { data, error } = await supabase.from("cronoprogramma_phases").select("id, name, start_date, end_date, progress, parent_id, sort_order, color").eq("commessa_id", commessaId).order("sort_order").limit(100);
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_ordini": {
        let q = supabase.from("ordini_acquisto").select("id, numero, data, fornitore, descrizione, importo, stato, data_consegna_prevista, data_consegna_effettiva, note").eq("commessa_id", commessaId).order("data", { ascending: false }).limit(50);
        if (args.stato) q = q.eq("stato", args.stato);
        if (args.search) q = q.or(`fornitore.ilike.%${args.search}%,descrizione.ilike.%${args.search}%`);
        const { data, error } = await q;
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_cme": {
        let q = supabase.from("cme_rows").select("id, numero, codice, descrizione, unita_misura, quantita, prezzo_unitario, importo, categoria").eq("commessa_id", commessaId).order("sort_order").limit(100);
        if (args.search) q = q.or(`descrizione.ilike.%${args.search}%,codice.ilike.%${args.search}%`);
        const { data, error } = await q;
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_centri_imputazione": {
        const { data, error } = await supabase.from("centri_imputazione").select("id, nome, tipo, sezione, is_default, sort_order").eq("commessa_id", commessaId).order("sort_order");
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      case "query_aziende": {
        let q = supabase.from("aziende").select("id, nome, tipo, partita_iva, codice_fiscale, indirizzo, citta, provincia, telefono, email, pec, sito_web").eq("commessa_id", commessaId).order("nome").limit(50);
        if (args.tipo) q = q.eq("tipo", args.tipo);
        if (args.search) q = q.or(`nome.ilike.%${args.search}%,partita_iva.ilike.%${args.search}%`);
        const { data, error } = await q;
        if (error) return `Errore: ${error.message}`;
        return JSON.stringify(data);
      }
      default:
        return `Tool sconosciuto: ${toolName}`;
    }
  } catch (e) {
    return `Errore: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ── Execute write tool ──────────────────────────────────────────────
async function executeWriteTool(
  supabase: any,
  commessaId: string,
  toolName: string,
  args: Record<string, any>,
  auditInfo: { userId: string; userEmail: string; userRole: string }
): Promise<string> {
  try {
    let result: { action: string; table: string; recordId?: string; details: any } | null = null;

    switch (toolName) {
      // ── Scadenze ──
      case "create_scadenza": {
        const row = { ...args, commessa_id: commessaId };
        const { data, error } = await supabase.from("scadenze").insert(row).select("id, titolo").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "create", table: "scadenze", recordId: data.id, details: { titolo: data.titolo, ...args } };
        break;
      }
      case "update_scadenza": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("scadenze").update(updates).eq("id", id).eq("commessa_id", commessaId).select("id, titolo").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "update", table: "scadenze", recordId: id, details: updates };
        break;
      }
      case "delete_scadenza": {
        const { error } = await supabase.from("scadenze").delete().eq("id", args.id).eq("commessa_id", commessaId);
        if (error) return `Errore: ${error.message}`;
        result = { action: "delete", table: "scadenze", recordId: args.id, details: {} };
        break;
      }
      // ── Fatture ──
      case "update_fattura": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("fatture").update(updates).eq("id", id).eq("commessa_id", commessaId).select("id, numero, fornitore_cliente").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "update", table: "fatture", recordId: id, details: { ...updates, numero: data.numero } };
        break;
      }
      // ── Persone ──
      case "create_persona": {
        const row = { ...args, commessa_id: commessaId };
        const { data, error } = await supabase.from("persons").insert(row).select("id, nome").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "create", table: "persons", recordId: data.id, details: args };
        break;
      }
      case "update_persona": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("persons").update(updates).eq("id", id).eq("commessa_id", commessaId).select("id, nome").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "update", table: "persons", recordId: id, details: updates };
        break;
      }
      case "delete_persona": {
        const { error } = await supabase.from("persons").delete().eq("id", args.id).eq("commessa_id", commessaId);
        if (error) return `Errore: ${error.message}`;
        result = { action: "delete", table: "persons", recordId: args.id, details: {} };
        break;
      }
      // ── Aziende ──
      case "create_azienda": {
        const row = { ...args, commessa_id: commessaId };
        const { data, error } = await supabase.from("aziende").insert(row).select("id, nome").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "create", table: "aziende", recordId: data.id, details: args };
        break;
      }
      case "update_azienda": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("aziende").update(updates).eq("id", id).eq("commessa_id", commessaId).select("id, nome").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "update", table: "aziende", recordId: id, details: updates };
        break;
      }
      case "delete_azienda": {
        const { error } = await supabase.from("aziende").delete().eq("id", args.id).eq("commessa_id", commessaId);
        if (error) return `Errore: ${error.message}`;
        result = { action: "delete", table: "aziende", recordId: args.id, details: {} };
        break;
      }
      // ── Ordini ──
      case "update_ordine": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("ordini_acquisto").update(updates).eq("id", id).eq("commessa_id", commessaId).select("id, numero").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "update", table: "ordini_acquisto", recordId: id, details: updates };
        break;
      }
      // ── Cronoprogramma ──
      case "update_fase_cronoprogramma": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("cronoprogramma_phases").update(updates).eq("id", id).eq("commessa_id", commessaId).select("id, name").single();
        if (error) return `Errore: ${error.message}`;
        result = { action: "update", table: "cronoprogramma_phases", recordId: id, details: updates };
        break;
      }
      default:
        return `Tool di scrittura sconosciuto: ${toolName}`;
    }

    // Log audit
    if (result) {
      const auditRow: any = {
        user_email: auditInfo.userEmail,
        user_role: auditInfo.userRole,
        commessa_id: commessaId,
        action: result.action,
        table_name: result.table,
        record_id: result.recordId || null,
        details: result.details,
      };
      // Only set user_id if we have a valid UUID
      if (auditInfo.userId) auditRow.user_id = auditInfo.userId;
      
      const { error: auditError } = await supabase.from("rita_audit_log").insert(auditRow);
      if (auditError) console.warn("Audit log error:", auditError.message);

      const actionLabel = result.action === "create" ? "Creato" : result.action === "update" ? "Aggiornato" : "Eliminato";
      return JSON.stringify({ success: true, message: `${actionLabel} con successo`, id: result.recordId, audit_logged: !auditError });
    }

    return JSON.stringify({ success: false, message: "Nessuna operazione eseguita" });
  } catch (e) {
    return `Errore: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// ── Main handler ────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, commessaId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const userToken = authHeader.replace("Bearer ", "");

    // Service role client for data operations (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Identify user and role via getClaims ──
    let userId = "";
    let userEmail = "sconosciuto";
    let userRole = "viewer";

    if (userToken) {
      try {
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
        // Use getClaims for fast JWT validation
        const authClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: `Bearer ${userToken}` } },
        });
        const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(userToken);
        
        if (!claimsError && claimsData?.claims) {
          userId = claimsData.claims.sub as string || "";
          userEmail = (claimsData.claims.email as string) || "sconosciuto";
          // Get role from our table using service role client
          const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: userId });
          userRole = roleData || "viewer";
          console.log(`User identified: ${userEmail}, role: ${userRole}`);
        } else {
          console.warn("Could not validate user token:", claimsError?.message);
        }
      } catch (e) {
        console.warn("Auth error:", e);
      }
    }

    // Verify commessa ownership before any tool execution
    if (commessaId && userId) {
      const { data: ownerCheck } = await supabase.from("commessa_data").select("id").eq("id", commessaId).eq("user_id", userId).maybeSingle();
      if (!ownerCheck) {
        return new Response(JSON.stringify({ error: "Commessa non trovata o accesso negato" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else if (commessaId && !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const canWrite = userRole === "admin" || userRole === "editor";
    const allTools = canWrite ? [...READ_TOOLS, ...WRITE_TOOLS] : READ_TOOLS;
    const allowedToolNames = new Set(allTools.map(t => t.function.name));

    const roleLabel = userRole === "admin" ? "Amministratore" : userRole === "editor" ? "Operatore" : "Osservatore";

    const systemPrompt = `Sei Rita, un'assistente AI integrata in un gestionale per commesse di cantiere edile. 
Rispondi sempre in italiano, in modo chiaro e conciso.

HAI ACCESSO AI DATI REALI della commessa tramite gli strumenti (tools) a tua disposizione. 
UTILIZZA SEMPRE i tools per recuperare dati prima di rispondere a domande sui dati della commessa.
Non inventare dati: se non trovi informazioni, dillo chiaramente.

**REGOLA CRITICA PER LE MODIFICHE**: Prima di eseguire QUALSIASI operazione di scrittura (create, update, delete), DEVI SEMPRE prima usare il tool di lettura corrispondente per ottenere gli ID reali dei record dal database. NON USARE MAI ID che ricordi da messaggi precedenti nella conversazione - potrebbero essere obsoleti o errati. Riesegui SEMPRE la query di lettura immediatamente prima di modificare.

L'utente corrente è: ${userEmail} (ruolo: ${roleLabel})
${canWrite ? `
PUOI ANCHE MODIFICARE I DATI: creare, aggiornare o eliminare record (scadenze, fatture, persone, aziende, ordini, fasi cronoprogramma).
Tutte le modifiche vengono registrate nel registro audit con il nome dell'utente.
IMPORTANTE: Prima di eseguire operazioni distruttive (eliminazione) o modifiche importanti, CHIEDI SEMPRE CONFERMA all'utente riepilogando cosa verrà fatto.
Per le creazioni, conferma i dati prima di procedere.` : `
Il tuo ruolo è "Osservatore": puoi solo consultare i dati, NON puoi modificarli. Se l'utente chiede modifiche, spiegagli che non ha i permessi necessari e di contattare un amministratore.`}

Puoi aiutare l'utente con:
- Consultare e riassumere documenti caricati
- Verificare lo stato delle fatture attive e passive
- Controllare il cronoprogramma e l'avanzamento delle fasi
- Consultare scadenze e polizze
- Cercare contatti e persone coinvolte
- Analizzare il computo metrico estimativo (CME)
- Verificare ordini di acquisto
- Consultare i centri di imputazione
${canWrite ? `- Creare nuove scadenze, persone, aziende
- Aggiornare stato fatture, ordini, fasi cronoprogramma
- Eliminare record esistenti` : ""}

${context ? `Contesto: l'utente si trova nella sezione "${context}".` : ""}
${commessaId ? `Commessa attiva: ${commessaId}` : "Nessuna commessa selezionata."}

Sii pratica e diretta. Usa tabelle markdown quando presenti elenchi di dati.`;

    const aiMessages = [{ role: "system", content: systemPrompt }, ...messages];
    let finalContent = "";
    let currentMessages = [...aiMessages];
    const MAX_TOOL_ITERATIONS = 15;

    for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
      const bodyPayload: any = {
        model: "google/gemini-3-flash-preview",
        messages: currentMessages,
      };

      if (commessaId && iteration < MAX_TOOL_ITERATIONS - 1) {
        bodyPayload.tools = allTools;
        bodyPayload.tool_choice = "auto";
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Troppe richieste. Riprova tra qualche secondo." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Crediti AI esauriti. Contatta l'amministratore." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        return new Response(JSON.stringify({ error: `Errore AI gateway: ${response.status}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resultData = await response.json();
      const choice = resultData.choices?.[0];
      if (!choice) {
        return new Response(JSON.stringify({ error: "Nessuna risposta dall'AI" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const message = choice.message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        currentMessages.push(message);

        for (const toolCall of message.tool_calls) {
          const fnName = toolCall.function.name;
          let fnArgs = {};
          try { fnArgs = JSON.parse(toolCall.function.arguments || "{}"); } catch { }

          console.log(`Executing tool: ${fnName}`, fnArgs);

          // Permission check
          if (!allowedToolNames.has(fnName)) {
            currentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: `Non hai i permessi per eseguire ${fnName}. Il tuo ruolo è ${roleLabel}.` }),
            });
            continue;
          }

          let toolResult: string;
          const isWriteTool = WRITE_TOOLS.some(t => t.function.name === fnName);

          if (isWriteTool) {
            toolResult = await executeWriteTool(supabase, commessaId, fnName, fnArgs, {
              userId, userEmail, userRole,
            });
          } else {
            toolResult = await executeReadTool(supabase, commessaId, fnName, fnArgs);
          }

          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }
        continue;
      }

      finalContent = message.content || "";
      break;
    }

    if (finalContent) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const chunk = JSON.stringify({
            choices: [{ delta: { content: finalContent }, finish_reason: null }],
          });
          controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const streamBody: any = {
      model: "google/gemini-3-flash-preview",
      messages: currentMessages,
      stream: true,
    };

    const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(streamBody),
    });

    if (!streamResponse.ok) {
      const t = await streamResponse.text();
      console.error("Stream error:", streamResponse.status, t);
      return new Response(JSON.stringify({ error: "Errore streaming" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Errore sconosciuto" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
