export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      adesioni_copartecipazione: {
        Row: {
          copartecipazione_id: string
          created_at: string | null
          data_risposta: string | null
          id: string
          note_risposta: string | null
          socio_id: string
          stato: Database["public"]["Enums"]["stato_adesione_partner"] | null
          updated_at: string | null
        }
        Insert: {
          copartecipazione_id: string
          created_at?: string | null
          data_risposta?: string | null
          id?: string
          note_risposta?: string | null
          socio_id: string
          stato?: Database["public"]["Enums"]["stato_adesione_partner"] | null
          updated_at?: string | null
        }
        Update: {
          copartecipazione_id?: string
          created_at?: string | null
          data_risposta?: string | null
          id?: string
          note_risposta?: string | null
          socio_id?: string
          stato?: Database["public"]["Enums"]["stato_adesione_partner"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adesioni_copartecipazione_copartecipazione_id_fkey"
            columns: ["copartecipazione_id"]
            isOneToOne: false
            referencedRelation: "co_partecipazioni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adesioni_copartecipazione_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      anagrafica_soci: {
        Row: {
          capitale_sociale: number | null
          codice_ateco: string | null
          codice_ateco_secondario: string | null
          created_at: string | null
          data_costituzione: string | null
          forma_giuridica: string | null
          id: string
          oggetto_sociale: string | null
          socio_id: string
          updated_at: string | null
        }
        Insert: {
          capitale_sociale?: number | null
          codice_ateco?: string | null
          codice_ateco_secondario?: string | null
          created_at?: string | null
          data_costituzione?: string | null
          forma_giuridica?: string | null
          id?: string
          oggetto_sociale?: string | null
          socio_id: string
          updated_at?: string | null
        }
        Update: {
          capitale_sociale?: number | null
          codice_ateco?: string | null
          codice_ateco_secondario?: string | null
          created_at?: string | null
          data_costituzione?: string | null
          forma_giuridica?: string | null
          id?: string
          oggetto_sociale?: string | null
          socio_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anagrafica_soci_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: true
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      analisi_disciplinare_gara: {
        Row: {
          analizzato_da: string | null
          avvalimento: Json | null
          checklist_busta_a: string[] | null
          checklist_busta_b: string[] | null
          checklist_busta_c: string[] | null
          cig: string | null
          clausola_conformita: string | null
          created_at: string | null
          cup: string | null
          documento_fonte: string | null
          ente: string | null
          fonte_analisi: string | null
          forme_associative: Json | null
          gara_id: string
          garanzie: Json | null
          id: string
          json_raw: Json | null
          nota_riferimenti: string | null
          note_critiche: string[] | null
          oggetto: string | null
          procedura: string | null
          requisiti_capacita_economica: Json | null
          requisiti_capacita_tecnica: Json | null
          requisiti_idoneita_professionale: Json | null
          scadenze: Json | null
          socio_id: string | null
          subappalto: Json | null
          updated_at: string | null
          versione: number | null
        }
        Insert: {
          analizzato_da?: string | null
          avvalimento?: Json | null
          checklist_busta_a?: string[] | null
          checklist_busta_b?: string[] | null
          checklist_busta_c?: string[] | null
          cig?: string | null
          clausola_conformita?: string | null
          created_at?: string | null
          cup?: string | null
          documento_fonte?: string | null
          ente?: string | null
          fonte_analisi?: string | null
          forme_associative?: Json | null
          gara_id: string
          garanzie?: Json | null
          id?: string
          json_raw?: Json | null
          nota_riferimenti?: string | null
          note_critiche?: string[] | null
          oggetto?: string | null
          procedura?: string | null
          requisiti_capacita_economica?: Json | null
          requisiti_capacita_tecnica?: Json | null
          requisiti_idoneita_professionale?: Json | null
          scadenze?: Json | null
          socio_id?: string | null
          subappalto?: Json | null
          updated_at?: string | null
          versione?: number | null
        }
        Update: {
          analizzato_da?: string | null
          avvalimento?: Json | null
          checklist_busta_a?: string[] | null
          checklist_busta_b?: string[] | null
          checklist_busta_c?: string[] | null
          cig?: string | null
          clausola_conformita?: string | null
          created_at?: string | null
          cup?: string | null
          documento_fonte?: string | null
          ente?: string | null
          fonte_analisi?: string | null
          forme_associative?: Json | null
          gara_id?: string
          garanzie?: Json | null
          id?: string
          json_raw?: Json | null
          nota_riferimenti?: string | null
          note_critiche?: string[] | null
          oggetto?: string | null
          procedura?: string | null
          requisiti_capacita_economica?: Json | null
          requisiti_capacita_tecnica?: Json | null
          requisiti_idoneita_professionale?: Json | null
          scadenze?: Json | null
          socio_id?: string | null
          subappalto?: Json | null
          updated_at?: string | null
          versione?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analisi_disciplinare_gara_analizzato_da_fkey"
            columns: ["analizzato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisi_disciplinare_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisi_disciplinare_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisi_disciplinare_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      attivita_log: {
        Row: {
          created_at: string | null
          descrizione: string
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          id: string
          ip_address: unknown
          metadata: Json | null
          socio_id: string | null
          tipo: Database["public"]["Enums"]["attivita_tipo"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descrizione: string
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          socio_id?: string | null
          tipo: Database["public"]["Enums"]["attivita_tipo"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descrizione?: string
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          socio_id?: string | null
          tipo?: Database["public"]["Enums"]["attivita_tipo"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attivita_log_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attivita_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_sync_config: {
        Row: {
          calendar_key: string
          color_hex: string | null
          created_at: string
          enabled: boolean
          gcal_calendar_id: string
          sync_direction: string
          updated_at: string
        }
        Insert: {
          calendar_key: string
          color_hex?: string | null
          created_at?: string
          enabled?: boolean
          gcal_calendar_id: string
          sync_direction?: string
          updated_at?: string
        }
        Update: {
          calendar_key?: string
          color_hex?: string | null
          created_at?: string
          enabled?: boolean
          gcal_calendar_id?: string
          sync_direction?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_sync_conflicts: {
        Row: {
          conflict_type: string
          created_at: string
          gcal_calendar_id: string | null
          gcal_event_id: string | null
          gcal_payload: Json | null
          gcal_updated_at: string | null
          id: number
          internal_event_id: string | null
          internal_payload: Json | null
          internal_updated_at: string | null
          resolution: string
          resolved_at: string | null
        }
        Insert: {
          conflict_type: string
          created_at?: string
          gcal_calendar_id?: string | null
          gcal_event_id?: string | null
          gcal_payload?: Json | null
          gcal_updated_at?: string | null
          id?: never
          internal_event_id?: string | null
          internal_payload?: Json | null
          internal_updated_at?: string | null
          resolution: string
          resolved_at?: string | null
        }
        Update: {
          conflict_type?: string
          created_at?: string
          gcal_calendar_id?: string | null
          gcal_event_id?: string | null
          gcal_payload?: Json | null
          gcal_updated_at?: string | null
          id?: never
          internal_event_id?: string | null
          internal_payload?: Json | null
          internal_updated_at?: string | null
          resolution?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      calendar_sync_map: {
        Row: {
          created_at: string
          deleted_at: string | null
          gcal_calendar_id: string
          gcal_etag: string | null
          gcal_event_id: string
          gcal_updated: string | null
          id: string
          internal_event_id: string
          internal_table: string
          last_synced_at: string
          sync_direction: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          gcal_calendar_id: string
          gcal_etag?: string | null
          gcal_event_id: string
          gcal_updated?: string | null
          id?: string
          internal_event_id: string
          internal_table?: string
          last_synced_at?: string
          sync_direction?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          gcal_calendar_id?: string
          gcal_etag?: string | null
          gcal_event_id?: string
          gcal_updated?: string | null
          id?: string
          internal_event_id?: string
          internal_table?: string
          last_synced_at?: string
          sync_direction?: string
        }
        Relationships: []
      }
      calendar_sync_outbox: {
        Row: {
          created_at: string
          error_message: string | null
          id: number
          internal_event_id: string
          internal_table: string
          operation: string
          payload: Json | null
          previous_calendar_key: string | null
          processed_at: string | null
          retry_count: number
          target_calendar_key: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: never
          internal_event_id: string
          internal_table?: string
          operation: string
          payload?: Json | null
          previous_calendar_key?: string | null
          processed_at?: string | null
          retry_count?: number
          target_calendar_key: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: never
          internal_event_id?: string
          internal_table?: string
          operation?: string
          payload?: Json | null
          previous_calendar_key?: string | null
          processed_at?: string | null
          retry_count?: number
          target_calendar_key?: string
        }
        Relationships: []
      }
      calendar_sync_tokens: {
        Row: {
          calendar_key: string
          created_at: string
          gcal_calendar_id: string
          last_full_sync_at: string | null
          last_incremental_at: string | null
          sync_token: string | null
          updated_at: string
        }
        Insert: {
          calendar_key: string
          created_at?: string
          gcal_calendar_id: string
          last_full_sync_at?: string | null
          last_incremental_at?: string | null
          sync_token?: string | null
          updated_at?: string
        }
        Update: {
          calendar_key?: string
          created_at?: string
          gcal_calendar_id?: string
          last_full_sync_at?: string | null
          last_incremental_at?: string | null
          sync_token?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cassetti: {
        Row: {
          attivo: boolean
          colore: string
          created_at: string
          descrizione: string | null
          icon: string | null
          id: string
          label: string
          ordine: number
          url: string | null
        }
        Insert: {
          attivo?: boolean
          colore?: string
          created_at?: string
          descrizione?: string | null
          icon?: string | null
          id: string
          label: string
          ordine?: number
          url?: string | null
        }
        Update: {
          attivo?: boolean
          colore?: string
          created_at?: string
          descrizione?: string | null
          icon?: string | null
          id?: string
          label?: string
          ordine?: number
          url?: string | null
        }
        Relationships: []
      }
      cassetti_ruoli: {
        Row: {
          cassetto_id: string
          ruolo: string
        }
        Insert: {
          cassetto_id: string
          ruolo: string
        }
        Update: {
          cassetto_id?: string
          ruolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cassetti_ruoli_cassetto_id_fkey"
            columns: ["cassetto_id"]
            isOneToOne: false
            referencedRelation: "cassetti"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          scope: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          scope?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          scope?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      checklist_documenti_soci: {
        Row: {
          created_at: string | null
          documento_id: string | null
          id: string
          note: string | null
          obbligatorio: boolean | null
          scadenza: string | null
          socio_id: string
          status: string | null
          tipo_documento_chiave: string
          tipo_documento_id: string | null
          tipo_documento_nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          documento_id?: string | null
          id?: string
          note?: string | null
          obbligatorio?: boolean | null
          scadenza?: string | null
          socio_id: string
          status?: string | null
          tipo_documento_chiave: string
          tipo_documento_id?: string | null
          tipo_documento_nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          documento_id?: string | null
          id?: string
          note?: string | null
          obbligatorio?: boolean | null
          scadenza?: string | null
          socio_id?: string
          status?: string | null
          tipo_documento_chiave?: string
          tipo_documento_id?: string | null
          tipo_documento_nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_documenti_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_documenti_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_documenti_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_documenti_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_documenti_soci_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_documenti_soci_tipo_documento_id_fkey"
            columns: ["tipo_documento_id"]
            isOneToOne: false
            referencedRelation: "tipi_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_gara: {
        Row: {
          created_at: string | null
          documento_richiesto: string
          file_url: string | null
          gara_id: string
          id: string
          modello_url: string | null
          note: string | null
          ordine: number | null
          responsabile: Database["public"]["Enums"]["checklist_responsabile"]
          socio_assegnato_id: string | null
          status: Database["public"]["Enums"]["checklist_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          documento_richiesto: string
          file_url?: string | null
          gara_id: string
          id?: string
          modello_url?: string | null
          note?: string | null
          ordine?: number | null
          responsabile?: Database["public"]["Enums"]["checklist_responsabile"]
          socio_assegnato_id?: string | null
          status?: Database["public"]["Enums"]["checklist_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          documento_richiesto?: string
          file_url?: string | null
          gara_id?: string
          id?: string
          modello_url?: string | null
          note?: string | null
          ordine?: number | null
          responsabile?: Database["public"]["Enums"]["checklist_responsabile"]
          socio_assegnato_id?: string | null
          status?: Database["public"]["Enums"]["checklist_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_gara_socio_assegnato_id_fkey"
            columns: ["socio_assegnato_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_operativa_gara: {
        Row: {
          assegnato_a: string | null
          attivita: string | null
          categoria: string | null
          completata: boolean
          completata_at: string | null
          completato_da: string | null
          created_at: string | null
          cronoprogramma_id: string | null
          data_target: string | null
          descrizione: string | null
          gara_id: string
          id: string
          note: string | null
          ordine: number | null
          responsabile: string | null
          socio_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assegnato_a?: string | null
          attivita?: string | null
          categoria?: string | null
          completata?: boolean
          completata_at?: string | null
          completato_da?: string | null
          created_at?: string | null
          cronoprogramma_id?: string | null
          data_target?: string | null
          descrizione?: string | null
          gara_id: string
          id?: string
          note?: string | null
          ordine?: number | null
          responsabile?: string | null
          socio_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assegnato_a?: string | null
          attivita?: string | null
          categoria?: string | null
          completata?: boolean
          completata_at?: string | null
          completato_da?: string | null
          created_at?: string | null
          cronoprogramma_id?: string | null
          data_target?: string | null
          descrizione?: string | null
          gara_id?: string
          id?: string
          note?: string | null
          ordine?: number | null
          responsabile?: string | null
          socio_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_operativa_gara_completato_da_fkey"
            columns: ["completato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_operativa_gara_cronoprogramma_id_fkey"
            columns: ["cronoprogramma_id"]
            isOneToOne: false
            referencedRelation: "cronoprogramma_gara"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_operativa_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_operativa_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_operativa_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_aziende: {
        Row: {
          cap: string | null
          citta: string | null
          cm_commessa_id: string | null
          codice_fiscale: string | null
          created_at: string
          email: string | null
          id: string
          indirizzo: string | null
          nome: string
          note: string | null
          partita_iva: string | null
          pec: string | null
          provincia: string | null
          sito_web: string | null
          source_document_ids: string[] | null
          telefono: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          cap?: string | null
          citta?: string | null
          cm_commessa_id?: string | null
          codice_fiscale?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome: string
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          sito_web?: string | null
          source_document_ids?: string[] | null
          telefono?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          cap?: string | null
          citta?: string | null
          cm_commessa_id?: string | null
          codice_fiscale?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome?: string
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          sito_web?: string | null
          source_document_ids?: string[] | null
          telefono?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_aziende_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_centri_imputazione: {
        Row: {
          cm_commessa_id: string | null
          created_at: string
          id: string
          is_default: boolean
          nome: string
          regola_denominazione: string | null
          sezione: string
          sort_order: number
          tipo: string
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          nome: string
          regola_denominazione?: string | null
          sezione?: string
          sort_order?: number
          tipo: string
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          nome?: string
          regola_denominazione?: string | null
          sezione?: string
          sort_order?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_centri_imputazione_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_checklist_documenti: {
        Row: {
          cm_commessa_id: string | null
          created_at: string
          id: string
          indispensabile: boolean
          nome: string
          sezione: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          created_at?: string
          id?: string
          indispensabile?: boolean
          nome: string
          sezione?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          created_at?: string
          id?: string
          indispensabile?: boolean
          nome?: string
          sezione?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_checklist_documenti_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_cme_rows: {
        Row: {
          categoria: string | null
          cm_commessa_id: string | null
          codice: string | null
          created_at: string
          descrizione: string
          h_peso: number | null
          id: string
          importo: number | null
          larghezza: number | null
          lunghezza: number | null
          numero: string | null
          par_ug: number | null
          prezzo_unitario: number | null
          quantita: number | null
          sort_order: number
          unita_misura: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          cm_commessa_id?: string | null
          codice?: string | null
          created_at?: string
          descrizione: string
          h_peso?: number | null
          id?: string
          importo?: number | null
          larghezza?: number | null
          lunghezza?: number | null
          numero?: string | null
          par_ug?: number | null
          prezzo_unitario?: number | null
          quantita?: number | null
          sort_order?: number
          unita_misura?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          cm_commessa_id?: string | null
          codice?: string | null
          created_at?: string
          descrizione?: string
          h_peso?: number | null
          id?: string
          importo?: number | null
          larghezza?: number | null
          lunghezza?: number | null
          numero?: string | null
          par_ug?: number | null
          prezzo_unitario?: number | null
          quantita?: number | null
          sort_order?: number
          unita_misura?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_cme_rows_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_commessa_data: {
        Row: {
          aggio_consorzio: number | null
          ambiente_analisi: Json | null
          cig: string | null
          cig_derivato: string | null
          commessa_consortile: string | null
          commessa_id: string | null
          committente: string | null
          costo_manodopera: number | null
          created_at: string
          cup: string | null
          data_consegna_lavori: string | null
          data_contratto: string | null
          data_scadenza_contratto: string | null
          direttore_lavori: string | null
          durata_contrattuale: string | null
          foto_url: string | null
          id: string
          importo_base_gara: number | null
          importo_contrattuale: number | null
          impresa_assegnataria: string | null
          oggetto_lavori: string | null
          oneri_sicurezza: number | null
          project_summary: string | null
          project_summary_doc_ids: string[] | null
          quota_servizi_tecnici: number | null
          ribasso: number | null
          riferimenti_pnrr: string | null
          rup: string | null
          stato: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aggio_consorzio?: number | null
          ambiente_analisi?: Json | null
          cig?: string | null
          cig_derivato?: string | null
          commessa_consortile?: string | null
          commessa_id?: string | null
          committente?: string | null
          costo_manodopera?: number | null
          created_at?: string
          cup?: string | null
          data_consegna_lavori?: string | null
          data_contratto?: string | null
          data_scadenza_contratto?: string | null
          direttore_lavori?: string | null
          durata_contrattuale?: string | null
          foto_url?: string | null
          id?: string
          importo_base_gara?: number | null
          importo_contrattuale?: number | null
          impresa_assegnataria?: string | null
          oggetto_lavori?: string | null
          oneri_sicurezza?: number | null
          project_summary?: string | null
          project_summary_doc_ids?: string[] | null
          quota_servizi_tecnici?: number | null
          ribasso?: number | null
          riferimenti_pnrr?: string | null
          rup?: string | null
          stato?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aggio_consorzio?: number | null
          ambiente_analisi?: Json | null
          cig?: string | null
          cig_derivato?: string | null
          commessa_consortile?: string | null
          commessa_id?: string | null
          committente?: string | null
          costo_manodopera?: number | null
          created_at?: string
          cup?: string | null
          data_consegna_lavori?: string | null
          data_contratto?: string | null
          data_scadenza_contratto?: string | null
          direttore_lavori?: string | null
          durata_contrattuale?: string | null
          foto_url?: string | null
          id?: string
          importo_base_gara?: number | null
          importo_contrattuale?: number | null
          impresa_assegnataria?: string | null
          oggetto_lavori?: string | null
          oneri_sicurezza?: number | null
          project_summary?: string | null
          project_summary_doc_ids?: string[] | null
          quota_servizi_tecnici?: number | null
          ribasso?: number | null
          riferimenti_pnrr?: string | null
          rup?: string | null
          stato?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_commessa_data_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_commessa_data_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_cronoprogramma_phases: {
        Row: {
          cm_commessa_id: string | null
          cme_row_ids: string[] | null
          color: string | null
          created_at: string
          depends_on: string[] | null
          end_date: string
          id: string
          name: string
          parent_id: string | null
          progress: number
          sort_order: number
          start_date: string
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          cme_row_ids?: string[] | null
          color?: string | null
          created_at?: string
          depends_on?: string[] | null
          end_date: string
          id?: string
          name: string
          parent_id?: string | null
          progress?: number
          sort_order?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          cme_row_ids?: string[] | null
          color?: string | null
          created_at?: string
          depends_on?: string[] | null
          end_date?: string
          id?: string
          name?: string
          parent_id?: string | null
          progress?: number
          sort_order?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_cronoprogramma_phases_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_cronoprogramma_phases_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cm_cronoprogramma_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_documents: {
        Row: {
          ai_extracted_data: Json | null
          ai_status: string | null
          ai_summary: string | null
          cm_commessa_id: string | null
          created_at: string
          file_hash: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          section: string
          subfolder: string | null
          updated_at: string
        }
        Insert: {
          ai_extracted_data?: Json | null
          ai_status?: string | null
          ai_summary?: string | null
          cm_commessa_id?: string | null
          created_at?: string
          file_hash?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          section?: string
          subfolder?: string | null
          updated_at?: string
        }
        Update: {
          ai_extracted_data?: Json | null
          ai_status?: string | null
          ai_summary?: string | null
          cm_commessa_id?: string | null
          created_at?: string
          file_hash?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          section?: string
          subfolder?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_documents_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_eventi_commessa: {
        Row: {
          cm_commessa_id: string | null
          cm_document_id: string | null
          created_at: string
          data_evento: string
          descrizione: string | null
          destinatario: string | null
          id: string
          mezzo: string | null
          mittente: string | null
          protocollo: string | null
          tipo: string
          titolo: string
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          cm_document_id?: string | null
          created_at?: string
          data_evento?: string
          descrizione?: string | null
          destinatario?: string | null
          id?: string
          mezzo?: string | null
          mittente?: string | null
          protocollo?: string | null
          tipo?: string
          titolo: string
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          cm_document_id?: string | null
          created_at?: string
          data_evento?: string
          descrizione?: string | null
          destinatario?: string | null
          id?: string
          mezzo?: string | null
          mittente?: string | null
          protocollo?: string | null
          tipo?: string
          titolo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_eventi_commessa_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_eventi_commessa_cm_document_id_fkey"
            columns: ["cm_document_id"]
            isOneToOne: false
            referencedRelation: "cm_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_fatture: {
        Row: {
          aliquota_iva: number
          centro_auto_assigned: boolean
          cig: string | null
          cm_centro_imputazione_id: string | null
          cm_commessa_id: string | null
          codice_sdi: string | null
          created_at: string
          cup: string | null
          data: string
          data_scadenza: string | null
          descrizione: string | null
          file_path: string | null
          fornitore_cliente: string
          id: string
          importo: number
          importo_incassato: number
          importo_iva: number | null
          importo_totale: number | null
          note: string | null
          numero: string
          ritenuta_acconto: number | null
          split_payment: boolean
          stato_pagamento: string
          tipo: string
          updated_at: string
        }
        Insert: {
          aliquota_iva?: number
          centro_auto_assigned?: boolean
          cig?: string | null
          cm_centro_imputazione_id?: string | null
          cm_commessa_id?: string | null
          codice_sdi?: string | null
          created_at?: string
          cup?: string | null
          data?: string
          data_scadenza?: string | null
          descrizione?: string | null
          file_path?: string | null
          fornitore_cliente: string
          id?: string
          importo?: number
          importo_incassato?: number
          importo_iva?: number | null
          importo_totale?: number | null
          note?: string | null
          numero: string
          ritenuta_acconto?: number | null
          split_payment?: boolean
          stato_pagamento?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          aliquota_iva?: number
          centro_auto_assigned?: boolean
          cig?: string | null
          cm_centro_imputazione_id?: string | null
          cm_commessa_id?: string | null
          codice_sdi?: string | null
          created_at?: string
          cup?: string | null
          data?: string
          data_scadenza?: string | null
          descrizione?: string | null
          file_path?: string | null
          fornitore_cliente?: string
          id?: string
          importo?: number
          importo_incassato?: number
          importo_iva?: number | null
          importo_totale?: number | null
          note?: string | null
          numero?: string
          ritenuta_acconto?: number | null
          split_payment?: boolean
          stato_pagamento?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_fatture_cm_centro_imputazione_id_fkey"
            columns: ["cm_centro_imputazione_id"]
            isOneToOne: false
            referencedRelation: "cm_centri_imputazione"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_fatture_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_ordini_acquisto: {
        Row: {
          cm_commessa_id: string | null
          created_at: string
          data: string
          data_consegna_effettiva: string | null
          data_consegna_prevista: string | null
          descrizione: string | null
          fornitore: string
          id: string
          importo: number | null
          note: string | null
          numero: string
          stato: string
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          created_at?: string
          data?: string
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          descrizione?: string | null
          fornitore: string
          id?: string
          importo?: number | null
          note?: string | null
          numero: string
          stato?: string
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          created_at?: string
          data?: string
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          descrizione?: string | null
          fornitore?: string
          id?: string
          importo?: number | null
          note?: string | null
          numero?: string
          stato?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_ordini_acquisto_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_pdq_documents: {
        Row: {
          cm_commessa_id: string
          created_at: string
          id: string
          revision: number
          sections: Json
          updated_at: string
        }
        Insert: {
          cm_commessa_id: string
          created_at?: string
          id?: string
          revision?: number
          sections?: Json
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string
          created_at?: string
          id?: string
          revision?: number
          sections?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_pdq_documents_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_persons: {
        Row: {
          azienda: string | null
          cellulare: string | null
          cm_commessa_id: string | null
          created_at: string
          email: string | null
          id: string
          indirizzo: string | null
          nome: string
          note: string | null
          pec: string | null
          ruolo: string | null
          source_document_ids: string[] | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          azienda?: string | null
          cellulare?: string | null
          cm_commessa_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome: string
          note?: string | null
          pec?: string | null
          ruolo?: string | null
          source_document_ids?: string[] | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          azienda?: string | null
          cellulare?: string | null
          cm_commessa_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome?: string
          note?: string | null
          pec?: string | null
          ruolo?: string | null
          source_document_ids?: string[] | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_persons_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_proroghe: {
        Row: {
          cm_commessa_id: string | null
          created_at: string
          data_concessione: string
          giorni: number
          id: string
          motivo: string
          note: string | null
          nuova_data_fine: string
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          created_at?: string
          data_concessione?: string
          giorni: number
          id?: string
          motivo: string
          note?: string | null
          nuova_data_fine: string
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          created_at?: string
          data_concessione?: string
          giorni?: number
          id?: string
          motivo?: string
          note?: string | null
          nuova_data_fine?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_proroghe_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_rita_audit_log: {
        Row: {
          action: string
          cm_commessa_id: string | null
          created_at: string
          details: Json | null
          id: string
          record_id: string | null
          table_name: string
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          cm_commessa_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name: string
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          cm_commessa_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_rita_audit_log_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_scadenze: {
        Row: {
          cm_commessa_id: string | null
          cm_document_id: string | null
          compagnia: string | null
          costo: number | null
          created_at: string
          data_emissione: string | null
          data_scadenza: string
          descrizione: string | null
          id: string
          importo_garantito: number | null
          notificato_30g: boolean
          notificato_email: boolean
          numero: string | null
          tipo: string
          tipo_polizza: string | null
          titolo: string
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          cm_document_id?: string | null
          compagnia?: string | null
          costo?: number | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza: string
          descrizione?: string | null
          id?: string
          importo_garantito?: number | null
          notificato_30g?: boolean
          notificato_email?: boolean
          numero?: string | null
          tipo?: string
          tipo_polizza?: string | null
          titolo: string
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          cm_document_id?: string | null
          compagnia?: string | null
          costo?: number | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza?: string
          descrizione?: string | null
          id?: string
          importo_garantito?: number | null
          notificato_30g?: boolean
          notificato_email?: boolean
          numero?: string | null
          tipo?: string
          tipo_polizza?: string | null
          titolo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_scadenze_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_scadenze_cm_document_id_fkey"
            columns: ["cm_document_id"]
            isOneToOne: false
            referencedRelation: "cm_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_subappaltatore_checklist: {
        Row: {
          cm_document_id: string | null
          cm_subappaltatore_id: string
          completato: boolean
          created_at: string
          id: string
          note: string | null
          sort_order: number
          updated_at: string
          voce: string
        }
        Insert: {
          cm_document_id?: string | null
          cm_subappaltatore_id: string
          completato?: boolean
          created_at?: string
          id?: string
          note?: string | null
          sort_order?: number
          updated_at?: string
          voce: string
        }
        Update: {
          cm_document_id?: string | null
          cm_subappaltatore_id?: string
          completato?: boolean
          created_at?: string
          id?: string
          note?: string | null
          sort_order?: number
          updated_at?: string
          voce?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_subappaltatore_checklist_cm_document_id_fkey"
            columns: ["cm_document_id"]
            isOneToOne: false
            referencedRelation: "cm_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_subappaltatore_checklist_cm_subappaltatore_id_fkey"
            columns: ["cm_subappaltatore_id"]
            isOneToOne: false
            referencedRelation: "cm_subappaltatori"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_subappaltatori: {
        Row: {
          cm_commessa_id: string | null
          codice_fiscale: string | null
          created_at: string
          email: string | null
          id: string
          indirizzo: string | null
          lavorazioni: string | null
          nome: string
          note: string | null
          partita_iva: string | null
          pec: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          cm_commessa_id?: string | null
          codice_fiscale?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          lavorazioni?: string | null
          nome: string
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          cm_commessa_id?: string | null
          codice_fiscale?: string | null
          created_at?: string
          email?: string | null
          id?: string
          indirizzo?: string | null
          lavorazioni?: string | null
          nome?: string
          note?: string | null
          partita_iva?: string | null
          pec?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cm_subappaltatori_cm_commessa_id_fkey"
            columns: ["cm_commessa_id"]
            isOneToOne: false
            referencedRelation: "cm_commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      co_partecipazioni: {
        Row: {
          created_at: string | null
          data_esito: string | null
          data_proposta: string | null
          gara_id: string
          id: string
          note: string | null
          note_direzione: string | null
          socio_partner_2_id: string | null
          socio_partner_3_id: string | null
          socio_partner_id: string | null
          socio_principale_id: string | null
          stato_copartecipazione:
            | Database["public"]["Enums"]["stato_copartecipazione"]
            | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_esito?: string | null
          data_proposta?: string | null
          gara_id: string
          id?: string
          note?: string | null
          note_direzione?: string | null
          socio_partner_2_id?: string | null
          socio_partner_3_id?: string | null
          socio_partner_id?: string | null
          socio_principale_id?: string | null
          stato_copartecipazione?:
            | Database["public"]["Enums"]["stato_copartecipazione"]
            | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_esito?: string | null
          data_proposta?: string | null
          gara_id?: string
          id?: string
          note?: string | null
          note_direzione?: string | null
          socio_partner_2_id?: string | null
          socio_partner_3_id?: string | null
          socio_partner_id?: string | null
          socio_principale_id?: string | null
          stato_copartecipazione?:
            | Database["public"]["Enums"]["stato_copartecipazione"]
            | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "co_partecipazioni_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "co_partecipazioni_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "co_partecipazioni_socio_partner_2_id_fkey"
            columns: ["socio_partner_2_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "co_partecipazioni_socio_partner_3_id_fkey"
            columns: ["socio_partner_3_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "co_partecipazioni_socio_partner_id_fkey"
            columns: ["socio_partner_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "co_partecipazioni_socio_principale_id_fkey"
            columns: ["socio_principale_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_activity_log: {
        Row: {
          action: Database["public"]["Enums"]["commessa_action"]
          changes: Json | null
          commessa_id: string
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["commessa_action"]
          changes?: Json | null
          commessa_id: string
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["commessa_action"]
          changes?: Json | null
          commessa_id?: string
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_activity_log_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_activity_log_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_activity_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_communications: {
        Row: {
          attachments: Json | null
          channel: Database["public"]["Enums"]["comm_channel"]
          commessa_id: string
          created_at: string | null
          created_by: string | null
          external_date: string | null
          external_ref: string | null
          id: string
          is_important: boolean | null
          linked_task_ids: string[] | null
          recipients: string[] | null
          sender: string | null
          subject: string | null
          summary: string
        }
        Insert: {
          attachments?: Json | null
          channel?: Database["public"]["Enums"]["comm_channel"]
          commessa_id: string
          created_at?: string | null
          created_by?: string | null
          external_date?: string | null
          external_ref?: string | null
          id?: string
          is_important?: boolean | null
          linked_task_ids?: string[] | null
          recipients?: string[] | null
          sender?: string | null
          subject?: string | null
          summary: string
        }
        Update: {
          attachments?: Json | null
          channel?: Database["public"]["Enums"]["comm_channel"]
          commessa_id?: string
          created_at?: string | null
          created_by?: string | null
          external_date?: string | null
          external_ref?: string | null
          id?: string
          is_important?: boolean | null
          linked_task_ids?: string[] | null
          recipients?: string[] | null
          sender?: string | null
          subject?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "commessa_communications_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_communications_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_comunicazioni: {
        Row: {
          allegati: Json | null
          association_confidence: number | null
          auto_associated: boolean | null
          canale: string
          commessa_id: string | null
          converted_to_task: boolean | null
          created_at: string | null
          created_by: string | null
          destinatari: Json | null
          direction: string
          external_id: string | null
          external_message_id: string | null
          external_thread_id: string | null
          id: string
          manual_association: boolean | null
          mittente: string | null
          mittente_email: string | null
          oggetto: string | null
          processed_at: string | null
          raw_payload: Json | null
          received_at: string | null
          related_task_id: string | null
          testo: string | null
          testo_html: string | null
        }
        Insert: {
          allegati?: Json | null
          association_confidence?: number | null
          auto_associated?: boolean | null
          canale: string
          commessa_id?: string | null
          converted_to_task?: boolean | null
          created_at?: string | null
          created_by?: string | null
          destinatari?: Json | null
          direction: string
          external_id?: string | null
          external_message_id?: string | null
          external_thread_id?: string | null
          id?: string
          manual_association?: boolean | null
          mittente?: string | null
          mittente_email?: string | null
          oggetto?: string | null
          processed_at?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          related_task_id?: string | null
          testo?: string | null
          testo_html?: string | null
        }
        Update: {
          allegati?: Json | null
          association_confidence?: number | null
          auto_associated?: boolean | null
          canale?: string
          commessa_id?: string | null
          converted_to_task?: boolean | null
          created_at?: string | null
          created_by?: string | null
          destinatari?: Json | null
          direction?: string
          external_id?: string | null
          external_message_id?: string | null
          external_thread_id?: string | null
          id?: string
          manual_association?: boolean | null
          mittente?: string | null
          mittente_email?: string | null
          oggetto?: string | null
          processed_at?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          related_task_id?: string | null
          testo?: string | null
          testo_html?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_comunicazioni_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "commessa_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "v_commessa_upcoming_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_contacts: {
        Row: {
          cellulare: string | null
          cognome: string | null
          commessa_id: string
          created_at: string | null
          created_by: string | null
          custom_role_name: string | null
          email: string | null
          id: string
          is_required: boolean | null
          nome: string
          notes: string | null
          organization: string | null
          role: Database["public"]["Enums"]["contact_role"]
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          cellulare?: string | null
          cognome?: string | null
          commessa_id: string
          created_at?: string | null
          created_by?: string | null
          custom_role_name?: string | null
          email?: string | null
          id?: string
          is_required?: boolean | null
          nome: string
          notes?: string | null
          organization?: string | null
          role: Database["public"]["Enums"]["contact_role"]
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          cellulare?: string | null
          cognome?: string | null
          commessa_id?: string
          created_at?: string | null
          created_by?: string | null
          custom_role_name?: string | null
          email?: string | null
          id?: string
          is_required?: boolean | null
          nome?: string
          notes?: string | null
          organization?: string | null
          role?: Database["public"]["Enums"]["contact_role"]
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_contacts_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_contacts_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_documents: {
        Row: {
          category: Database["public"]["Enums"]["doc_commessa_category"]
          commessa_id: string
          created_at: string | null
          description: string | null
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          insurance_type: Database["public"]["Enums"]["insurance_type"] | null
          is_mandatory: boolean | null
          issue_date: string | null
          mime_type: string | null
          notes: string | null
          owner_socio_id: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["doc_commessa_category"]
          commessa_id: string
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          insurance_type?: Database["public"]["Enums"]["insurance_type"] | null
          is_mandatory?: boolean | null
          issue_date?: string | null
          mime_type?: string | null
          notes?: string | null
          owner_socio_id?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["doc_commessa_category"]
          commessa_id?: string
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          insurance_type?: Database["public"]["Enums"]["insurance_type"] | null
          is_mandatory?: boolean | null
          issue_date?: string | null
          mime_type?: string | null
          notes?: string | null
          owner_socio_id?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_documents_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_documents_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_documents_owner_socio_id_fkey"
            columns: ["owner_socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_fatture: {
        Row: {
          aliquota_iva: number | null
          categoria: Database["public"]["Enums"]["invoice_category"]
          commessa_id: string
          created_at: string | null
          created_by: string | null
          data_fattura: string
          data_pagamento: string | null
          data_scadenza_pagamento: string | null
          file_name: string | null
          file_url: string | null
          fornitore_cliente: string
          iban: string | null
          id: string
          imponibile: number
          importo_pagato: number | null
          iva: number | null
          modalita_pagamento: string | null
          note: string | null
          numero: string
          partita_iva: string | null
          stato_pagamento:
            | Database["public"]["Enums"]["invoice_payment_status"]
            | null
          totale: number | null
          updated_at: string | null
        }
        Insert: {
          aliquota_iva?: number | null
          categoria: Database["public"]["Enums"]["invoice_category"]
          commessa_id: string
          created_at?: string | null
          created_by?: string | null
          data_fattura: string
          data_pagamento?: string | null
          data_scadenza_pagamento?: string | null
          file_name?: string | null
          file_url?: string | null
          fornitore_cliente: string
          iban?: string | null
          id?: string
          imponibile?: number
          importo_pagato?: number | null
          iva?: number | null
          modalita_pagamento?: string | null
          note?: string | null
          numero: string
          partita_iva?: string | null
          stato_pagamento?:
            | Database["public"]["Enums"]["invoice_payment_status"]
            | null
          totale?: number | null
          updated_at?: string | null
        }
        Update: {
          aliquota_iva?: number | null
          categoria?: Database["public"]["Enums"]["invoice_category"]
          commessa_id?: string
          created_at?: string | null
          created_by?: string | null
          data_fattura?: string
          data_pagamento?: string | null
          data_scadenza_pagamento?: string | null
          file_name?: string | null
          file_url?: string | null
          fornitore_cliente?: string
          iban?: string | null
          id?: string
          imponibile?: number
          importo_pagato?: number | null
          iva?: number | null
          modalita_pagamento?: string | null
          note?: string | null
          numero?: string
          partita_iva?: string | null
          stato_pagamento?:
            | Database["public"]["Enums"]["invoice_payment_status"]
            | null
          totale?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_fatture_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_fatture_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_fatture_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_lavoratore_documenti: {
        Row: {
          commessa_id: string
          created_at: string | null
          custom_tipo: string | null
          data_rilascio: string | null
          data_scadenza: string | null
          descrizione: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          lavoratore_id: string
          mime_type: string | null
          stato_validita: Database["public"]["Enums"]["deadline_status"] | null
          tipo_documento: Database["public"]["Enums"]["doc_lavoratore_type"]
          titolo: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          commessa_id: string
          created_at?: string | null
          custom_tipo?: string | null
          data_rilascio?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          lavoratore_id: string
          mime_type?: string | null
          stato_validita?: Database["public"]["Enums"]["deadline_status"] | null
          tipo_documento: Database["public"]["Enums"]["doc_lavoratore_type"]
          titolo: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          commessa_id?: string
          created_at?: string | null
          custom_tipo?: string | null
          data_rilascio?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          lavoratore_id?: string
          mime_type?: string | null
          stato_validita?: Database["public"]["Enums"]["deadline_status"] | null
          tipo_documento?: Database["public"]["Enums"]["doc_lavoratore_type"]
          titolo?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_lavoratore_documenti_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratore_documenti_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratore_documenti_lavoratore_id_fkey"
            columns: ["lavoratore_id"]
            isOneToOne: false
            referencedRelation: "commessa_lavoratori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratore_documenti_lavoratore_id_fkey"
            columns: ["lavoratore_id"]
            isOneToOne: false
            referencedRelation: "v_commessa_lavoratori_compliance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratore_documenti_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_lavoratori: {
        Row: {
          codice_fiscale: string | null
          cognome: string
          commessa_id: string
          created_at: string | null
          created_by: string | null
          data_fine: string | null
          data_inizio: string | null
          data_nascita: string | null
          email: string | null
          id: string
          is_active: boolean | null
          mansione: string | null
          nome: string
          notes: string | null
          qualifica: string | null
          socio_id: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          codice_fiscale?: string | null
          cognome: string
          commessa_id: string
          created_at?: string | null
          created_by?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          data_nascita?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          mansione?: string | null
          nome: string
          notes?: string | null
          qualifica?: string | null
          socio_id?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          codice_fiscale?: string | null
          cognome?: string
          commessa_id?: string
          created_at?: string | null
          created_by?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          data_nascita?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          mansione?: string | null
          nome?: string
          notes?: string | null
          qualifica?: string | null
          socio_id?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_lavoratori_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratori_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratori_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratori_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_reminder_queue: {
        Row: {
          commessa_id: string
          created_at: string | null
          error_message: string | null
          id: string
          message_data: Json | null
          message_template: string | null
          notification_channel: string | null
          reminder_type: string | null
          retry_count: number | null
          scadenza_id: string
          scheduled_at: string
          sent_at: string | null
          status: string | null
          target_emails: string[] | null
          target_user_ids: string[] | null
        }
        Insert: {
          commessa_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_data?: Json | null
          message_template?: string | null
          notification_channel?: string | null
          reminder_type?: string | null
          retry_count?: number | null
          scadenza_id: string
          scheduled_at: string
          sent_at?: string | null
          status?: string | null
          target_emails?: string[] | null
          target_user_ids?: string[] | null
        }
        Update: {
          commessa_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_data?: Json | null
          message_template?: string | null
          notification_channel?: string | null
          reminder_type?: string | null
          retry_count?: number | null
          scadenza_id?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          target_emails?: string[] | null
          target_user_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_reminder_queue_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_reminder_queue_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_reminder_queue_scadenza_id_fkey"
            columns: ["scadenza_id"]
            isOneToOne: false
            referencedRelation: "commessa_scadenzario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_reminder_queue_scadenza_id_fkey"
            columns: ["scadenza_id"]
            isOneToOne: false
            referencedRelation: "v_commessa_scadenzario_full"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_risorse_digitali: {
        Row: {
          commessa_id: string
          created_at: string | null
          created_by: string | null
          custom_tipo: string | null
          descrizione: string | null
          id: string
          is_active: boolean | null
          note: string | null
          responsabile_esterno: string | null
          responsabile_id: string | null
          responsabile_socio_id: string | null
          tipo: Database["public"]["Enums"]["digital_resource_type"]
          titolo: string
          updated_at: string | null
          url: string
        }
        Insert: {
          commessa_id: string
          created_at?: string | null
          created_by?: string | null
          custom_tipo?: string | null
          descrizione?: string | null
          id?: string
          is_active?: boolean | null
          note?: string | null
          responsabile_esterno?: string | null
          responsabile_id?: string | null
          responsabile_socio_id?: string | null
          tipo: Database["public"]["Enums"]["digital_resource_type"]
          titolo: string
          updated_at?: string | null
          url: string
        }
        Update: {
          commessa_id?: string
          created_at?: string | null
          created_by?: string | null
          custom_tipo?: string | null
          descrizione?: string | null
          id?: string
          is_active?: boolean | null
          note?: string | null
          responsabile_esterno?: string | null
          responsabile_id?: string | null
          responsabile_socio_id?: string | null
          tipo?: Database["public"]["Enums"]["digital_resource_type"]
          titolo?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "commessa_risorse_digitali_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_risorse_digitali_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_risorse_digitali_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_risorse_digitali_responsabile_id_fkey"
            columns: ["responsabile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_risorse_digitali_responsabile_socio_id_fkey"
            columns: ["responsabile_socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_scadenzario: {
        Row: {
          commessa_id: string
          created_at: string | null
          data_scadenza: string
          descrizione: string | null
          entity_id: string
          entity_type: string
          giorni_preavviso: number | null
          id: string
          last_notified_at: string | null
          next_reminder_at: string | null
          notifiche_inviate: number | null
          notify_direzione: boolean | null
          nuovo_entity_id: string | null
          promemoria_attivo: boolean | null
          rinnovato: boolean | null
          stato: Database["public"]["Enums"]["deadline_status"] | null
          target_socio_ids: string[] | null
          target_user_ids: string[] | null
          titolo: string
          updated_at: string | null
        }
        Insert: {
          commessa_id: string
          created_at?: string | null
          data_scadenza: string
          descrizione?: string | null
          entity_id: string
          entity_type: string
          giorni_preavviso?: number | null
          id?: string
          last_notified_at?: string | null
          next_reminder_at?: string | null
          notifiche_inviate?: number | null
          notify_direzione?: boolean | null
          nuovo_entity_id?: string | null
          promemoria_attivo?: boolean | null
          rinnovato?: boolean | null
          stato?: Database["public"]["Enums"]["deadline_status"] | null
          target_socio_ids?: string[] | null
          target_user_ids?: string[] | null
          titolo: string
          updated_at?: string | null
        }
        Update: {
          commessa_id?: string
          created_at?: string | null
          data_scadenza?: string
          descrizione?: string | null
          entity_id?: string
          entity_type?: string
          giorni_preavviso?: number | null
          id?: string
          last_notified_at?: string | null
          next_reminder_at?: string | null
          notifiche_inviate?: number | null
          notify_direzione?: boolean | null
          nuovo_entity_id?: string | null
          promemoria_attivo?: boolean | null
          rinnovato?: boolean | null
          stato?: Database["public"]["Enums"]["deadline_status"] | null
          target_socio_ids?: string[] | null
          target_user_ids?: string[] | null
          titolo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_scadenzario_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_scadenzario_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_task_templates: {
        Row: {
          category: Database["public"]["Enums"]["task_category"]
          created_at: string | null
          days_offset: number
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          ordine: number | null
          priority: Database["public"]["Enums"]["priorita_level"] | null
          reference_date: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["task_category"]
          created_at?: string | null
          days_offset: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          ordine?: number | null
          priority?: Database["public"]["Enums"]["priorita_level"] | null
          reference_date?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["task_category"]
          created_at?: string | null
          days_offset?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          ordine?: number | null
          priority?: Database["public"]["Enums"]["priorita_level"] | null
          reference_date?: string | null
        }
        Relationships: []
      }
      commessa_tasks: {
        Row: {
          assignee_id: string | null
          assignee_socio_id: string | null
          attachments: Json | null
          category: Database["public"]["Enums"]["task_category"]
          commessa_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          notes: string | null
          ordine: number | null
          origin: Database["public"]["Enums"]["task_origin"] | null
          origin_ref_id: string | null
          priority: Database["public"]["Enums"]["priorita_level"] | null
          reminder_days: number | null
          reminder_sent: boolean | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          assignee_socio_id?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["task_category"]
          commessa_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          due_time?: string | null
          id?: string
          notes?: string | null
          ordine?: number | null
          origin?: Database["public"]["Enums"]["task_origin"] | null
          origin_ref_id?: string | null
          priority?: Database["public"]["Enums"]["priorita_level"] | null
          reminder_days?: number | null
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          assignee_socio_id?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["task_category"]
          commessa_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          notes?: string | null
          ordine?: number | null
          origin?: Database["public"]["Enums"]["task_origin"] | null
          origin_ref_id?: string | null
          priority?: Database["public"]["Enums"]["priorita_level"] | null
          reminder_days?: number | null
          reminder_sent?: boolean | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_assignee_socio_id_fkey"
            columns: ["assignee_socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commesse: {
        Row: {
          award_date: string | null
          codice: string
          consegna_lavori_at: string | null
          contract_signed: boolean | null
          contract_signed_at: string | null
          created_at: string | null
          created_by: string | null
          data_fine_effettiva: string | null
          data_fine_prevista: string | null
          data_inizio: string | null
          descrizione: string
          ente: string
          gara_id: string | null
          health_score: number | null
          id: string
          importo_contratto: number
          note: string | null
          progress: number | null
          status: Database["public"]["Enums"]["commessa_status"] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          award_date?: string | null
          codice: string
          consegna_lavori_at?: string | null
          contract_signed?: boolean | null
          contract_signed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fine_effettiva?: string | null
          data_fine_prevista?: string | null
          data_inizio?: string | null
          descrizione: string
          ente: string
          gara_id?: string | null
          health_score?: number | null
          id?: string
          importo_contratto: number
          note?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["commessa_status"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          award_date?: string | null
          codice?: string
          consegna_lavori_at?: string | null
          contract_signed?: boolean | null
          contract_signed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          data_fine_effettiva?: string | null
          data_fine_prevista?: string | null
          data_inizio?: string | null
          descrizione?: string
          ente?: string
          gara_id?: string | null
          health_score?: number | null
          id?: string
          importo_contratto?: number
          note?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["commessa_status"] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commesse_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commesse_soci: {
        Row: {
          commessa_id: string
          created_at: string | null
          id: string
          quota_percentuale: number | null
          ruolo: Database["public"]["Enums"]["ruolo_commessa"]
          socio_id: string
        }
        Insert: {
          commessa_id: string
          created_at?: string | null
          id?: string
          quota_percentuale?: number | null
          ruolo?: Database["public"]["Enums"]["ruolo_commessa"]
          socio_id: string
        }
        Update: {
          commessa_id?: string
          created_at?: string | null
          id?: string
          quota_percentuale?: number | null
          ruolo?: Database["public"]["Enums"]["ruolo_commessa"]
          socio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commesse_soci_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_soci_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_soci_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      contatori_progressivi: {
        Row: {
          created_at: string | null
          descrizione: string | null
          id: string
          updated_at: string | null
          valore_corrente: number
        }
        Insert: {
          created_at?: string | null
          descrizione?: string | null
          id: string
          updated_at?: string | null
          valore_corrente?: number
        }
        Update: {
          created_at?: string | null
          descrizione?: string | null
          id?: string
          updated_at?: string | null
          valore_corrente?: number
        }
        Relationships: []
      }
      contatti: {
        Row: {
          codice_fiscale: string | null
          created_at: string
          data_nascita: string | null
          data_rilascio: string | null
          data_scadenza_documento: string | null
          documento_id: string | null
          ente_rilascio: string | null
          id: string
          luogo_nascita: string | null
          nome_completo: string | null
          numero_documento: string | null
          ruolo: string | null
          socio_id: string
          tipo_documento_identita: string | null
          updated_at: string
        }
        Insert: {
          codice_fiscale?: string | null
          created_at?: string
          data_nascita?: string | null
          data_rilascio?: string | null
          data_scadenza_documento?: string | null
          documento_id?: string | null
          ente_rilascio?: string | null
          id?: string
          luogo_nascita?: string | null
          nome_completo?: string | null
          numero_documento?: string | null
          ruolo?: string | null
          socio_id: string
          tipo_documento_identita?: string | null
          updated_at?: string
        }
        Update: {
          codice_fiscale?: string | null
          created_at?: string
          data_nascita?: string | null
          data_rilascio?: string | null
          data_scadenza_documento?: string | null
          documento_id?: string | null
          ente_rilascio?: string | null
          id?: string
          luogo_nascita?: string | null
          nome_completo?: string | null
          numero_documento?: string | null
          ruolo?: string | null
          socio_id?: string
          tipo_documento_identita?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contatti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string
          created_at: string | null
          gara_id: string | null
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          last_message_sender: Database["public"]["Enums"]["sender_type"] | null
          socio_id: string | null
          unread_count_admin: number | null
          unread_count_socio: number | null
          updated_at: string | null
        }
        Insert: {
          conversation_type?: string
          created_at?: string | null
          gara_id?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          last_message_sender?:
            | Database["public"]["Enums"]["sender_type"]
            | null
          socio_id?: string | null
          unread_count_admin?: number | null
          unread_count_socio?: number | null
          updated_at?: string | null
        }
        Update: {
          conversation_type?: string
          created_at?: string | null
          gara_id?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          last_message_preview?: string | null
          last_message_sender?:
            | Database["public"]["Enums"]["sender_type"]
            | null
          socio_id?: string | null
          unread_count_admin?: number | null
          unread_count_socio?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      copartecipazione_inviti: {
        Row: {
          attempts: number
          copartecipazione_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          last_error: string | null
          provider_message_id: string | null
          responded_at: string | null
          responded_via: string | null
          sent_at: string | null
          socio_id: string
          status: string
          token_hash: string
        }
        Insert: {
          attempts?: number
          copartecipazione_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          last_error?: string | null
          provider_message_id?: string | null
          responded_at?: string | null
          responded_via?: string | null
          sent_at?: string | null
          socio_id: string
          status?: string
          token_hash?: string
        }
        Update: {
          attempts?: number
          copartecipazione_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          last_error?: string | null
          provider_message_id?: string | null
          responded_at?: string | null
          responded_via?: string | null
          sent_at?: string | null
          socio_id?: string
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "copartecipazione_inviti_copartecipazione_id_fkey"
            columns: ["copartecipazione_id"]
            isOneToOne: false
            referencedRelation: "co_partecipazioni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copartecipazione_inviti_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      criticita_gara: {
        Row: {
          azione_richiesta: string | null
          azione_urgente: boolean
          created_at: string | null
          descrizione: string | null
          gara_id: string
          gravita: string | null
          id: string
          nota_risoluzione: string | null
          risolta: boolean
          risolta_at: string | null
          risolta_da: string | null
          risoluzione: string | null
          severita: string | null
          socio_id: string | null
          status: string | null
          tipo: string | null
          titolo: string
          updated_at: string | null
        }
        Insert: {
          azione_richiesta?: string | null
          azione_urgente?: boolean
          created_at?: string | null
          descrizione?: string | null
          gara_id: string
          gravita?: string | null
          id?: string
          nota_risoluzione?: string | null
          risolta?: boolean
          risolta_at?: string | null
          risolta_da?: string | null
          risoluzione?: string | null
          severita?: string | null
          socio_id?: string | null
          status?: string | null
          tipo?: string | null
          titolo: string
          updated_at?: string | null
        }
        Update: {
          azione_richiesta?: string | null
          azione_urgente?: boolean
          created_at?: string | null
          descrizione?: string | null
          gara_id?: string
          gravita?: string | null
          id?: string
          nota_risoluzione?: string | null
          risolta?: boolean
          risolta_at?: string | null
          risolta_da?: string | null
          risoluzione?: string | null
          severita?: string | null
          socio_id?: string | null
          status?: string | null
          tipo?: string | null
          titolo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "criticita_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criticita_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criticita_gara_risolta_da_fkey"
            columns: ["risolta_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criticita_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      cronoprogramma_gara: {
        Row: {
          completata: boolean | null
          completata_at: string | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          data_scadenza: string | null
          descrizione: string | null
          durata_giorni: number | null
          fase: string
          gara_id: string
          id: string
          is_critica: boolean | null
          is_perentoria: boolean | null
          note: string | null
          ora_scadenza: string | null
          ordine: number | null
          priorita: string | null
          riferimento_documento: string | null
          socio_id: string | null
          tipo_scadenza: string | null
          titolo: string | null
          updated_at: string | null
        }
        Insert: {
          completata?: boolean | null
          completata_at?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          durata_giorni?: number | null
          fase: string
          gara_id: string
          id?: string
          is_critica?: boolean | null
          is_perentoria?: boolean | null
          note?: string | null
          ora_scadenza?: string | null
          ordine?: number | null
          priorita?: string | null
          riferimento_documento?: string | null
          socio_id?: string | null
          tipo_scadenza?: string | null
          titolo?: string | null
          updated_at?: string | null
        }
        Update: {
          completata?: boolean | null
          completata_at?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          durata_giorni?: number | null
          fase?: string
          gara_id?: string
          id?: string
          is_critica?: boolean | null
          is_perentoria?: boolean | null
          note?: string | null
          ora_scadenza?: string | null
          ordine?: number | null
          priorita?: string | null
          riferimento_documento?: string | null
          socio_id?: string | null
          tipo_scadenza?: string | null
          titolo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronoprogramma_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronoprogramma_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronoprogramma_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      DB_docs_gara: {
        Row: {
          doc_id: string
          doc_text: string | null
          gara_id: string | null
          id: number | null
          "Nome documento": string | null
          "URL documento": string | null
        }
        Insert: {
          doc_id: string
          doc_text?: string | null
          gara_id?: string | null
          id?: number | null
          "Nome documento"?: string | null
          "URL documento"?: string | null
        }
        Update: {
          doc_id?: string
          doc_text?: string | null
          gara_id?: string | null
          id?: number | null
          "Nome documento"?: string | null
          "URL documento"?: string | null
        }
        Relationships: []
      }
      deadline_rules: {
        Row: {
          created_at: string
          document_type_id: string
          escalation_policy: Json | null
          expiry_source: string
          id: string
          is_blocking_for_actions: boolean
          reminder_channels: string[]
          reminder_schedule_days: number[]
          updated_at: string
          validity_months: number | null
        }
        Insert: {
          created_at?: string
          document_type_id: string
          escalation_policy?: Json | null
          expiry_source?: string
          id?: string
          is_blocking_for_actions?: boolean
          reminder_channels?: string[]
          reminder_schedule_days?: number[]
          updated_at?: string
          validity_months?: number | null
        }
        Update: {
          created_at?: string
          document_type_id?: string
          escalation_policy?: Json | null
          expiry_source?: string
          id?: string
          is_blocking_for_actions?: boolean
          reminder_channels?: string[]
          reminder_schedule_days?: number[]
          updated_at?: string
          validity_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deadline_rules_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: true
            referencedRelation: "tipi_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      document_extraction_jobs: {
        Row: {
          attempt_count: number
          completed_at: string | null
          created_at: string
          document_id: string
          document_type: string
          error_code: string | null
          error_message: string | null
          extraction_result: Json | null
          id: string
          mapped_to_target: boolean
          max_attempts: number
          socio_id: string
          source_hash: string | null
          started_at: string | null
          status: string
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          document_id: string
          document_type: string
          error_code?: string | null
          error_message?: string | null
          extraction_result?: Json | null
          id?: string
          mapped_to_target?: boolean
          max_attempts?: number
          socio_id: string
          source_hash?: string | null
          started_at?: string | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          document_id?: string
          document_type?: string
          error_code?: string | null
          error_message?: string | null
          extraction_result?: Json | null
          id?: string
          mapped_to_target?: boolean
          max_attempts?: number
          socio_id?: string
          source_hash?: string | null
          started_at?: string | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_extraction_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extraction_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extraction_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extraction_jobs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extraction_jobs_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      document_items: {
        Row: {
          caricato_da: string | null
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          label: string | null
          metadata: Json | null
          mime_type: string | null
          ordine: number | null
          parent_document_id: string
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string | null
        }
        Insert: {
          caricato_da?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          label?: string | null
          metadata?: Json | null
          mime_type?: string | null
          ordine?: number | null
          parent_document_id: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Update: {
          caricato_da?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          label?: string | null
          metadata?: Json | null
          mime_type?: string | null
          ordine?: number | null
          parent_document_id?: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_items_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_items_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_items_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_items_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
        ]
      }
      document_subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      documenti: {
        Row: {
          anno: number | null
          archived_at: string | null
          archived_by: string | null
          archived_reason: string | null
          caricato_da: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"]
          classificazione_automatica: boolean | null
          classificazione_score: number | null
          contesto: string | null
          created_at: string | null
          data_emissione: string | null
          display_name: string | null
          drive_file_id: string | null
          drive_file_url: string | null
          drive_filename: string | null
          drive_last_error: string | null
          drive_sync_status: string | null
          drive_synced_at: string | null
          durata_giorni_snapshot: number | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          extraction_metadata: Json | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_archived: boolean | null
          last_renamed_at: string | null
          mime_type: string | null
          moved_to_superato_at: string | null
          name_hash: string | null
          naming_template_snapshot: Json | null
          note: string | null
          obbligatorio: boolean | null
          original_filename: string | null
          replaced_by_document_id: string | null
          replaces_document_id: string | null
          scadenza: string | null
          socio_id: string | null
          soggetto_id: string | null
          soggetto_tipo: string | null
          sottocategoria: string | null
          status: Database["public"]["Enums"]["documento_status"] | null
          storage_bucket: string | null
          storage_path: string | null
          testo_estratto: string | null
          tipo_documento_id: string | null
          tipo_documento_nome: string
          titolo: string
          updated_at: string | null
        }
        Insert: {
          anno?: number | null
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          caricato_da?: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"]
          classificazione_automatica?: boolean | null
          classificazione_score?: number | null
          contesto?: string | null
          created_at?: string | null
          data_emissione?: string | null
          display_name?: string | null
          drive_file_id?: string | null
          drive_file_url?: string | null
          drive_filename?: string | null
          drive_last_error?: string | null
          drive_sync_status?: string | null
          drive_synced_at?: string | null
          durata_giorni_snapshot?: number | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          extraction_metadata?: Json | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_archived?: boolean | null
          last_renamed_at?: string | null
          mime_type?: string | null
          moved_to_superato_at?: string | null
          name_hash?: string | null
          naming_template_snapshot?: Json | null
          note?: string | null
          obbligatorio?: boolean | null
          original_filename?: string | null
          replaced_by_document_id?: string | null
          replaces_document_id?: string | null
          scadenza?: string | null
          socio_id?: string | null
          soggetto_id?: string | null
          soggetto_tipo?: string | null
          sottocategoria?: string | null
          status?: Database["public"]["Enums"]["documento_status"] | null
          storage_bucket?: string | null
          storage_path?: string | null
          testo_estratto?: string | null
          tipo_documento_id?: string | null
          tipo_documento_nome: string
          titolo: string
          updated_at?: string | null
        }
        Update: {
          anno?: number | null
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          caricato_da?: string | null
          categoria?: Database["public"]["Enums"]["documento_categoria"]
          classificazione_automatica?: boolean | null
          classificazione_score?: number | null
          contesto?: string | null
          created_at?: string | null
          data_emissione?: string | null
          display_name?: string | null
          drive_file_id?: string | null
          drive_file_url?: string | null
          drive_filename?: string | null
          drive_last_error?: string | null
          drive_sync_status?: string | null
          drive_synced_at?: string | null
          durata_giorni_snapshot?: number | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          extraction_metadata?: Json | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_archived?: boolean | null
          last_renamed_at?: string | null
          mime_type?: string | null
          moved_to_superato_at?: string | null
          name_hash?: string | null
          naming_template_snapshot?: Json | null
          note?: string | null
          obbligatorio?: boolean | null
          original_filename?: string | null
          replaced_by_document_id?: string | null
          replaces_document_id?: string | null
          scadenza?: string | null
          socio_id?: string | null
          soggetto_id?: string | null
          soggetto_tipo?: string | null
          sottocategoria?: string | null
          status?: Database["public"]["Enums"]["documento_status"] | null
          storage_bucket?: string | null
          storage_path?: string | null
          testo_estratto?: string | null
          tipo_documento_id?: string | null
          tipo_documento_nome?: string
          titolo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_soggetto_id_fkey"
            columns: ["soggetto_id"]
            isOneToOne: false
            referencedRelation: "socio_soggetti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_tipo_documento_id_fkey"
            columns: ["tipo_documento_id"]
            isOneToOne: false
            referencedRelation: "tipi_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      documenti_consorzio: {
        Row: {
          caricato_da: string | null
          categoria: string
          created_at: string | null
          data_emissione: string | null
          data_scadenza: string | null
          descrizione: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          nome: string
          scaricabile_soci: boolean | null
          storage_bucket: string | null
          storage_path: string | null
          tipo_documento: string | null
          updated_at: string | null
          visibile_soci: boolean | null
        }
        Insert: {
          caricato_da?: string | null
          categoria?: string
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          nome: string
          scaricabile_soci?: boolean | null
          storage_bucket?: string | null
          storage_path?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
          visibile_soci?: boolean | null
        }
        Update: {
          caricato_da?: string | null
          categoria?: string
          created_at?: string | null
          data_emissione?: string | null
          data_scadenza?: string | null
          descrizione?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          nome?: string
          scaricabile_soci?: boolean | null
          storage_bucket?: string | null
          storage_path?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
          visibile_soci?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_consorzio_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documenti_persona: {
        Row: {
          archiviato: boolean
          archiviato_at: string | null
          classificazione_automatica: boolean
          classificazione_score: number | null
          correlation_id: string | null
          created_at: string
          data_emissione: string | null
          data_scadenza: string | null
          dati_estratti: Json | null
          documento_id_principale: string | null
          ente_rilascio: string | null
          event_id: string | null
          file_name: string
          file_path: string
          file_url_cache: string | null
          id: string
          nome_documento: string
          numero_documento: string | null
          persona_id: string | null
          socio_id: string
          sorgente: Database["public"]["Enums"]["sorgente_dato"]
          stato: Database["public"]["Enums"]["stato_documento_persona"]
          tipo_documento: string
          updated_at: string
          webhook_last_error: string | null
          webhook_pending: boolean
          webhook_retry_count: number
        }
        Insert: {
          archiviato?: boolean
          archiviato_at?: string | null
          classificazione_automatica?: boolean
          classificazione_score?: number | null
          correlation_id?: string | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza?: string | null
          dati_estratti?: Json | null
          documento_id_principale?: string | null
          ente_rilascio?: string | null
          event_id?: string | null
          file_name: string
          file_path: string
          file_url_cache?: string | null
          id?: string
          nome_documento: string
          numero_documento?: string | null
          persona_id?: string | null
          socio_id: string
          sorgente?: Database["public"]["Enums"]["sorgente_dato"]
          stato?: Database["public"]["Enums"]["stato_documento_persona"]
          tipo_documento: string
          updated_at?: string
          webhook_last_error?: string | null
          webhook_pending?: boolean
          webhook_retry_count?: number
        }
        Update: {
          archiviato?: boolean
          archiviato_at?: string | null
          classificazione_automatica?: boolean
          classificazione_score?: number | null
          correlation_id?: string | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza?: string | null
          dati_estratti?: Json | null
          documento_id_principale?: string | null
          ente_rilascio?: string | null
          event_id?: string | null
          file_name?: string
          file_path?: string
          file_url_cache?: string | null
          id?: string
          nome_documento?: string
          numero_documento?: string | null
          persona_id?: string | null
          socio_id?: string
          sorgente?: Database["public"]["Enums"]["sorgente_dato"]
          stato?: Database["public"]["Enums"]["stato_documento_persona"]
          tipo_documento?: string
          updated_at?: string
          webhook_last_error?: string | null
          webhook_pending?: boolean
          webhook_retry_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "documenti_persona_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persone"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_persona_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      documenti_richiesta_gara: {
        Row: {
          caricato_da: string | null
          created_at: string | null
          descrizione: string | null
          documento_gara_id: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          gara_id: string | null
          id: string
          mime_type: string | null
          note: string | null
          origine: string | null
          richiesta_id: string
          socio_id: string | null
          status: string | null
          storage_bucket: string | null
          storage_path: string | null
          tipo_documento: string
          titolo: string | null
          updated_at: string | null
        }
        Insert: {
          caricato_da?: string | null
          created_at?: string | null
          descrizione?: string | null
          documento_gara_id?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          gara_id?: string | null
          id?: string
          mime_type?: string | null
          note?: string | null
          origine?: string | null
          richiesta_id: string
          socio_id?: string | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tipo_documento: string
          titolo?: string | null
          updated_at?: string | null
        }
        Update: {
          caricato_da?: string | null
          created_at?: string | null
          descrizione?: string | null
          documento_gara_id?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          gara_id?: string | null
          id?: string
          mime_type?: string | null
          note?: string | null
          origine?: string | null
          richiesta_id?: string
          socio_id?: string | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tipo_documento?: string
          titolo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_richiesta_gara_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_richiesta_gara_richiesta_id_fkey"
            columns: ["richiesta_id"]
            isOneToOne: false
            referencedRelation: "richieste_gara"
            referencedColumns: ["id"]
          },
        ]
      }
      documenti_richiesti_gara: {
        Row: {
          busta: string | null
          caricato_at: string | null
          categoria: string | null
          chi_firma: string | null
          condizione_obbligatorieta: string | null
          created_at: string | null
          descrizione: string | null
          descrizione_dettagliata: string | null
          file_name: string | null
          file_url: string | null
          firma_digitale: string | null
          formato_richiesto: string | null
          gara_id: string
          giorni_prima_scadenza: number | null
          id: string
          integrazioni_necessarie: string | null
          modello_allegato: string | null
          modello_fornito: boolean | null
          modello_url: string | null
          nome_documento: string | null
          note: string | null
          note_rifiuto: string | null
          obbligatorio: boolean | null
          ordine: number | null
          preparato_at: string | null
          preparato_da: string | null
          riferimento_documento: string | null
          scadenza_preparazione: string | null
          socio_id: string | null
          status: string | null
          tipo_documento: string
          updated_at: string | null
          verificato_at: string | null
          verificato_da: string | null
        }
        Insert: {
          busta?: string | null
          caricato_at?: string | null
          categoria?: string | null
          chi_firma?: string | null
          condizione_obbligatorieta?: string | null
          created_at?: string | null
          descrizione?: string | null
          descrizione_dettagliata?: string | null
          file_name?: string | null
          file_url?: string | null
          firma_digitale?: string | null
          formato_richiesto?: string | null
          gara_id: string
          giorni_prima_scadenza?: number | null
          id?: string
          integrazioni_necessarie?: string | null
          modello_allegato?: string | null
          modello_fornito?: boolean | null
          modello_url?: string | null
          nome_documento?: string | null
          note?: string | null
          note_rifiuto?: string | null
          obbligatorio?: boolean | null
          ordine?: number | null
          preparato_at?: string | null
          preparato_da?: string | null
          riferimento_documento?: string | null
          scadenza_preparazione?: string | null
          socio_id?: string | null
          status?: string | null
          tipo_documento: string
          updated_at?: string | null
          verificato_at?: string | null
          verificato_da?: string | null
        }
        Update: {
          busta?: string | null
          caricato_at?: string | null
          categoria?: string | null
          chi_firma?: string | null
          condizione_obbligatorieta?: string | null
          created_at?: string | null
          descrizione?: string | null
          descrizione_dettagliata?: string | null
          file_name?: string | null
          file_url?: string | null
          firma_digitale?: string | null
          formato_richiesto?: string | null
          gara_id?: string
          giorni_prima_scadenza?: number | null
          id?: string
          integrazioni_necessarie?: string | null
          modello_allegato?: string | null
          modello_fornito?: boolean | null
          modello_url?: string | null
          nome_documento?: string | null
          note?: string | null
          note_rifiuto?: string | null
          obbligatorio?: boolean | null
          ordine?: number | null
          preparato_at?: string | null
          preparato_da?: string | null
          riferimento_documento?: string | null
          scadenza_preparazione?: string | null
          socio_id?: string | null
          status?: string | null
          tipo_documento?: string
          updated_at?: string | null
          verificato_at?: string | null
          verificato_da?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_richiesti_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_richiesti_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_richiesti_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_richiesti_gara_verificato_da_fkey"
            columns: ["verificato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      drive_file_log: {
        Row: {
          created_at: string | null
          drive_file_id: string | null
          drive_folder_id: string | null
          file_name: string | null
          gara_id: string
          id: string
          source_id: string | null
          source_table: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          drive_file_id?: string | null
          drive_folder_id?: string | null
          file_name?: string | null
          gara_id: string
          id?: string
          source_id?: string | null
          source_table?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          drive_file_id?: string | null
          drive_folder_id?: string | null
          file_name?: string | null
          gara_id?: string
          id?: string
          source_id?: string | null
          source_table?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drive_file_log_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_file_log_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_file_log_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_settings: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      drive_sync_queue: {
        Row: {
          action: string | null
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          file_name: string | null
          file_url: string | null
          gara_id: string | null
          id: string
          last_error: string | null
          max_attempts: number | null
          mime_type: string | null
          next_retry_at: string | null
          payload: Json | null
          source_id: string | null
          source_table: string | null
          storage_bucket: string | null
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          action?: string | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          file_name?: string | null
          file_url?: string | null
          gara_id?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          mime_type?: string | null
          next_retry_at?: string | null
          payload?: Json | null
          source_id?: string | null
          source_table?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          action?: string | null
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string | null
          file_url?: string | null
          gara_id?: string | null
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          mime_type?: string | null
          next_retry_at?: string | null
          payload?: Json | null
          source_id?: string | null
          source_table?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drive_sync_queue_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_sync_queue_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      elementi_offerta_economica: {
        Row: {
          created_at: string | null
          descrizione: string | null
          formato_numero: string | null
          gara_id: string
          id: string
          nome_elemento: string
          note: string | null
          obbligatorio: boolean | null
          ordine: number | null
          riferimento_documento: string | null
          socio_id: string | null
          soggetto_ribasso: boolean | null
          valore_base: number | null
        }
        Insert: {
          created_at?: string | null
          descrizione?: string | null
          formato_numero?: string | null
          gara_id: string
          id?: string
          nome_elemento: string
          note?: string | null
          obbligatorio?: boolean | null
          ordine?: number | null
          riferimento_documento?: string | null
          socio_id?: string | null
          soggetto_ribasso?: boolean | null
          valore_base?: number | null
        }
        Update: {
          created_at?: string | null
          descrizione?: string | null
          formato_numero?: string | null
          gara_id?: string
          id?: string
          nome_elemento?: string
          note?: string | null
          obbligatorio?: boolean | null
          ordine?: number | null
          riferimento_documento?: string | null
          socio_id?: string | null
          soggetto_ribasso?: boolean | null
          valore_base?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "elementi_offerta_economica_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elementi_offerta_economica_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elementi_offerta_economica_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      esiti_gare: {
        Row: {
          cig: string
          created_at: string | null
          data_aggiudicazione: string | null
          esito: string | null
          esito_raw: Json | null
          external_id: string | null
          gara_id: string
          id: string
          importo_aggiudicato: number | null
          match_status: string
          ribasso: number | null
          source: string | null
          sync_run_id: string | null
          vincitore: string | null
        }
        Insert: {
          cig: string
          created_at?: string | null
          data_aggiudicazione?: string | null
          esito?: string | null
          esito_raw?: Json | null
          external_id?: string | null
          gara_id: string
          id?: string
          importo_aggiudicato?: number | null
          match_status?: string
          ribasso?: number | null
          source?: string | null
          sync_run_id?: string | null
          vincitore?: string | null
        }
        Update: {
          cig?: string
          created_at?: string | null
          data_aggiudicazione?: string | null
          esito?: string | null
          esito_raw?: Json | null
          external_id?: string | null
          gara_id?: string
          id?: string
          importo_aggiudicato?: number | null
          match_status?: string
          ribasso?: number | null
          source?: string | null
          sync_run_id?: string | null
          vincitore?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esiti_gare_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esiti_gare_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esiti_gare_sync_run_id_fkey"
            columns: ["sync_run_id"]
            isOneToOne: false
            referencedRelation: "esiti_sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      esiti_sync_runs: {
        Row: {
          created_at: string | null
          ended_at: string | null
          errors: Json | null
          esiti_found: number | null
          esiti_new: number | null
          esiti_updated: number | null
          gare_checked: number | null
          id: string
          mode: string
          started_at: string
          stats: Json | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          errors?: Json | null
          esiti_found?: number | null
          esiti_new?: number | null
          esiti_updated?: number | null
          gare_checked?: number | null
          id?: string
          mode?: string
          started_at?: string
          stats?: Json | null
          status?: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          errors?: Json | null
          esiti_found?: number | null
          esiti_new?: number | null
          esiti_updated?: number | null
          gare_checked?: number | null
          id?: string
          mode?: string
          started_at?: string
          stats?: Json | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      event_reminders: {
        Row: {
          advance_days: number
          canale: string
          created_at: string
          error: string | null
          evento_id: string
          id: string
          inviato: boolean
          inviato_at: string | null
        }
        Insert: {
          advance_days: number
          canale?: string
          created_at?: string
          error?: string | null
          evento_id: string
          id?: string
          inviato?: boolean
          inviato_at?: string | null
        }
        Update: {
          advance_days?: number
          canale?: string
          created_at?: string
          error?: string | null
          evento_id?: string
          id?: string
          inviato?: boolean
          inviato_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventi_calendario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_reminders_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "v_eventi_calendario_socio"
            referencedColumns: ["id"]
          },
        ]
      }
      eventi_calendario: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_evento: string
          descrizione: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          id: string
          is_active: boolean | null
          is_auto_generated: boolean | null
          is_operativo: boolean | null
          luogo: string | null
          metadata: Json | null
          note: string | null
          ora_fine: string | null
          ora_inizio: string | null
          partecipanti: string[] | null
          socio_id: string | null
          source_id: string | null
          source_type: string | null
          tipo: Database["public"]["Enums"]["evento_tipo"]
          titolo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_evento: string
          descrizione?: string | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          id?: string
          is_active?: boolean | null
          is_auto_generated?: boolean | null
          is_operativo?: boolean | null
          luogo?: string | null
          metadata?: Json | null
          note?: string | null
          ora_fine?: string | null
          ora_inizio?: string | null
          partecipanti?: string[] | null
          socio_id?: string | null
          source_id?: string | null
          source_type?: string | null
          tipo: Database["public"]["Enums"]["evento_tipo"]
          titolo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_evento?: string
          descrizione?: string | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          id?: string
          is_active?: boolean | null
          is_auto_generated?: boolean | null
          is_operativo?: boolean | null
          luogo?: string | null
          metadata?: Json | null
          note?: string | null
          ora_fine?: string | null
          ora_inizio?: string | null
          partecipanti?: string[] | null
          socio_id?: string | null
          source_id?: string | null
          source_type?: string | null
          tipo?: Database["public"]["Enums"]["evento_tipo"]
          titolo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventi_calendario_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventi_calendario_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      eventi_calendario_interni: {
        Row: {
          colore: string | null
          commessa_id: string | null
          completato: boolean | null
          created_at: string | null
          created_by: string | null
          data_evento: string
          data_fine: string | null
          data_inizio: string | null
          descrizione: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          gara_id: string | null
          id: string
          luogo: string | null
          note: string | null
          ora_fine: string | null
          ora_inizio: string | null
          partecipanti: string[] | null
          priorita: Database["public"]["Enums"]["priorita_level"] | null
          reminder_minuti: number | null
          richiesta_id: string | null
          task_id: string | null
          tipo: string | null
          titolo: string
          updated_at: string | null
        }
        Insert: {
          colore?: string | null
          commessa_id?: string | null
          completato?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data_evento: string
          data_fine?: string | null
          data_inizio?: string | null
          descrizione?: string | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          gara_id?: string | null
          id?: string
          luogo?: string | null
          note?: string | null
          ora_fine?: string | null
          ora_inizio?: string | null
          partecipanti?: string[] | null
          priorita?: Database["public"]["Enums"]["priorita_level"] | null
          reminder_minuti?: number | null
          richiesta_id?: string | null
          task_id?: string | null
          tipo?: string | null
          titolo: string
          updated_at?: string | null
        }
        Update: {
          colore?: string | null
          commessa_id?: string | null
          completato?: boolean | null
          created_at?: string | null
          created_by?: string | null
          data_evento?: string
          data_fine?: string | null
          data_inizio?: string | null
          descrizione?: string | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          gara_id?: string | null
          id?: string
          luogo?: string | null
          note?: string | null
          ora_fine?: string | null
          ora_inizio?: string | null
          partecipanti?: string[] | null
          priorita?: Database["public"]["Enums"]["priorita_level"] | null
          reminder_minuti?: number | null
          richiesta_id?: string | null
          task_id?: string | null
          tipo?: string | null
          titolo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      eventi_documenti: {
        Row: {
          attore_id: string | null
          attore_ruolo: string
          azione: string
          created_at: string
          documento_id: string | null
          event_id: string | null
          id: string
          payload_after: Json | null
          payload_before: Json | null
          socio_id: string | null
        }
        Insert: {
          attore_id?: string | null
          attore_ruolo?: string
          azione: string
          created_at?: string
          documento_id?: string | null
          event_id?: string | null
          id?: string
          payload_after?: Json | null
          payload_before?: Json | null
          socio_id?: string | null
        }
        Update: {
          attore_id?: string | null
          attore_ruolo?: string
          azione?: string
          created_at?: string
          documento_id?: string | null
          event_id?: string | null
          id?: string
          payload_after?: Json | null
          payload_before?: Json | null
          socio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventi_documenti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventi_documenti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventi_documenti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventi_documenti_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
        ]
      }
      forme_partecipazione_gara: {
        Row: {
          ausiliaria_piva: string | null
          ausiliaria_ragione_sociale: string | null
          avvalimento_attivo: boolean | null
          avvalimento_requisiti: string[] | null
          created_at: string | null
          documentazione_completa: boolean | null
          forma: Database["public"]["Enums"]["forma_partecipazione"]
          gara_id: string
          id: string
          is_mandataria: boolean | null
          mandataria_socio_id: string | null
          note: string | null
          prestazioni_assunte: string[] | null
          quota_partecipazione: number | null
          socio_id: string
          subappalto_percentuale: number | null
          subappalto_prestazioni: string[] | null
          subappalto_previsto: boolean | null
          tipo_rti: Database["public"]["Enums"]["tipo_rti"] | null
          updated_at: string | null
        }
        Insert: {
          ausiliaria_piva?: string | null
          ausiliaria_ragione_sociale?: string | null
          avvalimento_attivo?: boolean | null
          avvalimento_requisiti?: string[] | null
          created_at?: string | null
          documentazione_completa?: boolean | null
          forma?: Database["public"]["Enums"]["forma_partecipazione"]
          gara_id: string
          id?: string
          is_mandataria?: boolean | null
          mandataria_socio_id?: string | null
          note?: string | null
          prestazioni_assunte?: string[] | null
          quota_partecipazione?: number | null
          socio_id: string
          subappalto_percentuale?: number | null
          subappalto_prestazioni?: string[] | null
          subappalto_previsto?: boolean | null
          tipo_rti?: Database["public"]["Enums"]["tipo_rti"] | null
          updated_at?: string | null
        }
        Update: {
          ausiliaria_piva?: string | null
          ausiliaria_ragione_sociale?: string | null
          avvalimento_attivo?: boolean | null
          avvalimento_requisiti?: string[] | null
          created_at?: string | null
          documentazione_completa?: boolean | null
          forma?: Database["public"]["Enums"]["forma_partecipazione"]
          gara_id?: string
          id?: string
          is_mandataria?: boolean | null
          mandataria_socio_id?: string | null
          note?: string | null
          prestazioni_assunte?: string[] | null
          quota_partecipazione?: number | null
          socio_id?: string
          subappalto_percentuale?: number | null
          subappalto_prestazioni?: string[] | null
          subappalto_previsto?: boolean | null
          tipo_rti?: Database["public"]["Enums"]["tipo_rti"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forme_partecipazione_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forme_partecipazione_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forme_partecipazione_gara_mandataria_socio_id_fkey"
            columns: ["mandataria_socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forme_partecipazione_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_analysis_jobs: {
        Row: {
          analisi_id: string | null
          checklist_id: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          documents_analyzed: string[] | null
          documents_to_analyze: string[] | null
          documents_zip_url: string | null
          error_code: string | null
          error_details: Json | null
          error_message: string | null
          gara_id: string
          generator_document_bucket: string | null
          generator_document_mime: string | null
          generator_document_name: string | null
          generator_document_path: string | null
          generator_document_uploaded_at: string | null
          id: string
          max_retries: number | null
          next_retry_at: string | null
          request_status: string | null
          retry_count: number | null
          richiesta_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          webhook_called_at: string | null
          webhook_last_error: string | null
          webhook_response: Json | null
          webhook_response_status: number | null
          webhook_sent_at: string | null
          webhook_url: string | null
        }
        Insert: {
          analisi_id?: string | null
          checklist_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          documents_analyzed?: string[] | null
          documents_to_analyze?: string[] | null
          documents_zip_url?: string | null
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          gara_id: string
          generator_document_bucket?: string | null
          generator_document_mime?: string | null
          generator_document_name?: string | null
          generator_document_path?: string | null
          generator_document_uploaded_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          request_status?: string | null
          retry_count?: number | null
          richiesta_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          webhook_called_at?: string | null
          webhook_last_error?: string | null
          webhook_response?: Json | null
          webhook_response_status?: number | null
          webhook_sent_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          analisi_id?: string | null
          checklist_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          documents_analyzed?: string[] | null
          documents_to_analyze?: string[] | null
          documents_zip_url?: string | null
          error_code?: string | null
          error_details?: Json | null
          error_message?: string | null
          gara_id?: string
          generator_document_bucket?: string | null
          generator_document_mime?: string | null
          generator_document_name?: string | null
          generator_document_path?: string | null
          generator_document_uploaded_at?: string | null
          id?: string
          max_retries?: number | null
          next_retry_at?: string | null
          request_status?: string | null
          retry_count?: number | null
          richiesta_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          webhook_called_at?: string | null
          webhook_last_error?: string | null
          webhook_response?: Json | null
          webhook_response_status?: number | null
          webhook_sent_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_analysis_jobs_analisi_id_fkey"
            columns: ["analisi_id"]
            isOneToOne: false
            referencedRelation: "analisi_disciplinare_gara"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_analysis_jobs_analisi_id_fkey"
            columns: ["analisi_id"]
            isOneToOne: false
            referencedRelation: "v_analisi_disciplinare_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_analysis_jobs_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_analysis_jobs_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "v_gara_checklist_riepilogo"
            referencedColumns: ["checklist_id"]
          },
          {
            foreignKeyName: "gara_analysis_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_analysis_jobs_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_analysis_jobs_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_analysis_jobs_richiesta_id_fkey"
            columns: ["richiesta_id"]
            isOneToOne: false
            referencedRelation: "richieste_gara"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_checklist: {
        Row: {
          analisi_id: string | null
          assigned_at: string | null
          assigned_by: string | null
          copartecipazione_id: string | null
          created_at: string | null
          gara_id: string
          generated_at: string | null
          generated_from_docs: string | null
          id: string
          note_interne: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          richiesta_id: string | null
          status: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          analisi_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          copartecipazione_id?: string | null
          created_at?: string | null
          gara_id: string
          generated_at?: string | null
          generated_from_docs?: string | null
          id?: string
          note_interne?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          richiesta_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          analisi_id?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          copartecipazione_id?: string | null
          created_at?: string | null
          gara_id?: string
          generated_at?: string | null
          generated_from_docs?: string | null
          id?: string
          note_interne?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          richiesta_id?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_checklist_analisi_id_fkey"
            columns: ["analisi_id"]
            isOneToOne: false
            referencedRelation: "analisi_disciplinare_gara"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_analisi_id_fkey"
            columns: ["analisi_id"]
            isOneToOne: false
            referencedRelation: "v_analisi_disciplinare_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_copartecipazione_id_fkey"
            columns: ["copartecipazione_id"]
            isOneToOne: false
            referencedRelation: "co_partecipazioni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_richiesta_id_fkey"
            columns: ["richiesta_id"]
            isOneToOne: false
            referencedRelation: "richieste_gara"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_checklist_assignments: {
        Row: {
          created_at: string | null
          document_id: string | null
          document_name: string | null
          document_url: string | null
          download_source_name: string | null
          download_source_url: string | null
          downloaded_at: string | null
          downloaded_by: string | null
          drive_file_id: string | null
          drive_file_url: string | null
          drive_sync_status: string | null
          drive_synced_at: string | null
          flow_type: Database["public"]["Enums"]["assignment_flow_type"] | null
          id: string
          is_required: boolean | null
          item_id: string
          note: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string | null
          subject_id: string | null
          subject_name: string | null
          subject_type: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
          validated_at: string | null
          validated_by: string | null
          validation_note: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          document_name?: string | null
          document_url?: string | null
          download_source_name?: string | null
          download_source_url?: string | null
          downloaded_at?: string | null
          downloaded_by?: string | null
          drive_file_id?: string | null
          drive_file_url?: string | null
          drive_sync_status?: string | null
          drive_synced_at?: string | null
          flow_type?: Database["public"]["Enums"]["assignment_flow_type"] | null
          id?: string
          is_required?: boolean | null
          item_id: string
          note?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string | null
          subject_id?: string | null
          subject_name?: string | null
          subject_type: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_note?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          document_name?: string | null
          document_url?: string | null
          download_source_name?: string | null
          download_source_url?: string | null
          downloaded_at?: string | null
          downloaded_by?: string | null
          drive_file_id?: string | null
          drive_file_url?: string | null
          drive_sync_status?: string | null
          drive_synced_at?: string | null
          flow_type?: Database["public"]["Enums"]["assignment_flow_type"] | null
          id?: string
          is_required?: boolean | null
          item_id?: string
          note?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string | null
          subject_id?: string | null
          subject_name?: string | null
          subject_type?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_checklist_assignments_downloaded_by_fkey"
            columns: ["downloaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_assignments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_assignments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_gara_checklist_items_ita"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_assignments_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_assignments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_assignments_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_checklist_buste: {
        Row: {
          busta: string
          checklist_id: string | null
          created_at: string | null
          gara_id: string
          id: string
          nome: string | null
          punteggio_massimo: number | null
          updated_at: string | null
        }
        Insert: {
          busta: string
          checklist_id?: string | null
          created_at?: string | null
          gara_id: string
          id?: string
          nome?: string | null
          punteggio_massimo?: number | null
          updated_at?: string | null
        }
        Update: {
          busta?: string
          checklist_id?: string | null
          created_at?: string | null
          gara_id?: string
          id?: string
          nome?: string | null
          punteggio_massimo?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_checklist_buste_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_buste_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "v_gara_checklist_riepilogo"
            referencedColumns: ["checklist_id"]
          },
          {
            foreignKeyName: "gara_checklist_buste_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_buste_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_checklist_items: {
        Row: {
          assegnazione_tipo: string | null
          busta_id: string | null
          category_busta: string | null
          category_type: string | null
          checklist_id: string
          codice: string | null
          condizione_obbligatorieta: string | null
          created_at: string | null
          description: string | null
          firma_digitale: string | null
          gara_id: string | null
          id: string
          is_manual: boolean | null
          is_required: boolean | null
          modello_nome: string | null
          modello_stazione_appaltante: boolean | null
          modello_url: string | null
          note: string | null
          riferimenti_normativi: string[] | null
          riferimento_documento: string | null
          soggetti_che_devono_produrre: string[] | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assegnazione_tipo?: string | null
          busta_id?: string | null
          category_busta?: string | null
          category_type?: string | null
          checklist_id: string
          codice?: string | null
          condizione_obbligatorieta?: string | null
          created_at?: string | null
          description?: string | null
          firma_digitale?: string | null
          gara_id?: string | null
          id?: string
          is_manual?: boolean | null
          is_required?: boolean | null
          modello_nome?: string | null
          modello_stazione_appaltante?: boolean | null
          modello_url?: string | null
          note?: string | null
          riferimenti_normativi?: string[] | null
          riferimento_documento?: string | null
          soggetti_che_devono_produrre?: string[] | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assegnazione_tipo?: string | null
          busta_id?: string | null
          category_busta?: string | null
          category_type?: string | null
          checklist_id?: string
          codice?: string | null
          condizione_obbligatorieta?: string | null
          created_at?: string | null
          description?: string | null
          firma_digitale?: string | null
          gara_id?: string | null
          id?: string
          is_manual?: boolean | null
          is_required?: boolean | null
          modello_nome?: string | null
          modello_stazione_appaltante?: boolean | null
          modello_url?: string | null
          note?: string | null
          riferimenti_normativi?: string[] | null
          riferimento_documento?: string | null
          soggetti_che_devono_produrre?: string[] | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_checklist_items_busta_id_fkey"
            columns: ["busta_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist_buste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "v_gara_checklist_riepilogo"
            referencedColumns: ["checklist_id"]
          },
          {
            foreignKeyName: "gara_checklist_items_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_items_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_checklist_uploads: {
        Row: {
          assignment_id: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          note: string | null
          storage_bucket: string | null
          uploader_id: string | null
        }
        Insert: {
          assignment_id: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          note?: string | null
          storage_bucket?: string | null
          uploader_id?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          note?: string | null
          storage_bucket?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_checklist_uploads_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_uploads_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_drive_folders: {
        Row: {
          copartecipazione_id: string | null
          created_at: string | null
          error_message: string | null
          folder_id: string
          folder_name: string | null
          folder_url: string | null
          gara_id: string
          id: string
          is_active: boolean | null
          parent_folder_id: string | null
          provider: string
          richiesta_id: string | null
          updated_at: string | null
        }
        Insert: {
          copartecipazione_id?: string | null
          created_at?: string | null
          error_message?: string | null
          folder_id: string
          folder_name?: string | null
          folder_url?: string | null
          gara_id: string
          id?: string
          is_active?: boolean | null
          parent_folder_id?: string | null
          provider?: string
          richiesta_id?: string | null
          updated_at?: string | null
        }
        Update: {
          copartecipazione_id?: string | null
          created_at?: string | null
          error_message?: string | null
          folder_id?: string
          folder_name?: string | null
          folder_url?: string | null
          gara_id?: string
          id?: string
          is_active?: boolean | null
          parent_folder_id?: string | null
          provider?: string
          richiesta_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_drive_folders_copartecipazione_id_fkey"
            columns: ["copartecipazione_id"]
            isOneToOne: false
            referencedRelation: "co_partecipazioni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_drive_folders_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_drive_folders_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_drive_folders_richiesta_id_fkey"
            columns: ["richiesta_id"]
            isOneToOne: false
            referencedRelation: "richieste_gara"
            referencedColumns: ["id"]
          },
        ]
      }
      gara_note_critiche: {
        Row: {
          azione_richiesta: string | null
          checklist_id: string | null
          created_at: string | null
          descrizione: string
          gara_id: string
          id: string
          priorita: string | null
          source: string | null
          tipo: string | null
          titolo: string | null
          updated_at: string | null
        }
        Insert: {
          azione_richiesta?: string | null
          checklist_id?: string | null
          created_at?: string | null
          descrizione: string
          gara_id: string
          id?: string
          priorita?: string | null
          source?: string | null
          tipo?: string | null
          titolo?: string | null
          updated_at?: string | null
        }
        Update: {
          azione_richiesta?: string | null
          checklist_id?: string | null
          created_at?: string | null
          descrizione?: string
          gara_id?: string
          id?: string
          priorita?: string | null
          source?: string | null
          tipo?: string | null
          titolo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_gara_note_critiche_checklist"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_gara_note_critiche_checklist"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "v_gara_checklist_riepilogo"
            referencedColumns: ["checklist_id"]
          },
          {
            foreignKeyName: "fk_gara_note_critiche_gara"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_gara_note_critiche_gara"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_note_critiche_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_note_critiche_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "v_gara_checklist_riepilogo"
            referencedColumns: ["checklist_id"]
          },
          {
            foreignKeyName: "gara_note_critiche_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_note_critiche_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      gare: {
        Row: {
          altre_categorie: string[] | null
          analisi_completata: boolean | null
          analisi_completata_at: string | null
          analisi_completata_da: string | null
          analysis_completed_at: string | null
          analysis_error: string | null
          analysis_started_at: string | null
          analysis_status: string | null
          Bando: string | null
          categoria_prevalente: string | null
          categorie: string[] | null
          categorie_dettaglio: Json | null
          cig: string | null
          classifica_ente: string | null
          classifiche: string[] | null
          costi_manodopera: number | null
          created_at: string | null
          created_by: string | null
          criterio:
            | Database["public"]["Enums"]["criterio_aggiudicazione"]
            | null
          criterio_aggiudicazione: string | null
          cup: string | null
          data_aggiudicazione_prevista: string | null
          data_apertura_buste: string | null
          data_apertura_economica: string | null
          data_apertura_tecnica: string | null
          data_pubblicazione: string | null
          data_risposta_chiarimenti: string | null
          data_scadenza_offerta: string | null
          data_sopralluogo: string | null
          dati_estratti: Json | null
          deadline: string | null
          descrizione: string | null
          Disciplinare: string | null
          doc_allegati: boolean | null
          doc_disciplinare: boolean | null
          doc_estratto: boolean | null
          doc_integrale: boolean | null
          documenti_zip_url: string | null
          drive_folder_id: string | null
          drive_folder_name: string | null
          drive_last_error: string | null
          drive_sync_status: string | null
          drive_synced_at: string | null
          drive_zip_file_id: string | null
          durata_esecuzione_giorni: number | null
          durata_esecuzione_mesi: number | null
          ente: string | null
          esito_data_aggiudicazione: string | null
          esito_importo_aggiudicato: number | null
          esito_raw: Json | null
          esito_ribasso: number | null
          esito_source: string | null
          esito_storico: string | null
          esito_synced_at: string | null
          esito_vincitore: string | null
          external_created_at: string | null
          external_id: number | null
          external_updated_at: string | null
          fareappalti_id: string | null
          fareappalti_synced_at: string | null
          has_documents: boolean | null
          id: string
          import_batch_id: string | null
          importo_base: number | null
          importo_forniture: number | null
          importo_lavori: number | null
          importo_manodopera: number | null
          importo_oneri_sicurezza: number | null
          importo_progettazione: number | null
          importo_servizi: number | null
          importo_sicurezza: number | null
          importo_totale: number | null
          is_archived: boolean | null
          is_searchable: boolean
          is_storico: boolean | null
          is_telematica: boolean | null
          link_portale: string | null
          localita: string[] | null
          note_interne: string | null
          note_portale: string | null
          ora_scadenza_offerta: string | null
          organization_address: Json | null
          organization_id: string | null
          organization_offices: Json | null
          organization_url: string | null
          piattaforma_nome: string | null
          piattaforma_url: string | null
          policy_request_sent_at: string | null
          procedure_name: string | null
          procedure_type: string | null
          protocollo: string | null
          provincia: string | null
          reference: string | null
          referenti: Json | null
          regione: string | null
          registrazione_piattaforma_richiesta: boolean | null
          riferimento_bando: string | null
          riferimento_disciplinare: string | null
          scadenza_apertura_buste: string | null
          socio_partecipante_id: string | null
          sopralluogo_luogo: string | null
          sopralluogo_note: string | null
          sopralluogo_prenotazione_entro: string | null
          sopralluogo_tipo:
            | Database["public"]["Enums"]["sopralluogo_tipo"]
            | null
          source_id: string | null
          source_org_url: string | null
          source_tender_url: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["gara_status"] | null
          status_code: string | null
          submitted_at: string | null
          tender_status: string | null
          termine_stipula_giorni: number | null
          tipo_gara: string | null
          tipo_procedura: string | null
          updated_at: string | null
          validita_offerta_giorni: number | null
          viewed: boolean | null
          webhook_last_called_at: string | null
          webhook_response_status: number | null
        }
        Insert: {
          altre_categorie?: string[] | null
          analisi_completata?: boolean | null
          analisi_completata_at?: string | null
          analisi_completata_da?: string | null
          analysis_completed_at?: string | null
          analysis_error?: string | null
          analysis_started_at?: string | null
          analysis_status?: string | null
          Bando?: string | null
          categoria_prevalente?: string | null
          categorie?: string[] | null
          categorie_dettaglio?: Json | null
          cig?: string | null
          classifica_ente?: string | null
          classifiche?: string[] | null
          costi_manodopera?: number | null
          created_at?: string | null
          created_by?: string | null
          criterio?:
            | Database["public"]["Enums"]["criterio_aggiudicazione"]
            | null
          criterio_aggiudicazione?: string | null
          cup?: string | null
          data_aggiudicazione_prevista?: string | null
          data_apertura_buste?: string | null
          data_apertura_economica?: string | null
          data_apertura_tecnica?: string | null
          data_pubblicazione?: string | null
          data_risposta_chiarimenti?: string | null
          data_scadenza_offerta?: string | null
          data_sopralluogo?: string | null
          dati_estratti?: Json | null
          deadline?: string | null
          descrizione?: string | null
          Disciplinare?: string | null
          doc_allegati?: boolean | null
          doc_disciplinare?: boolean | null
          doc_estratto?: boolean | null
          doc_integrale?: boolean | null
          documenti_zip_url?: string | null
          drive_folder_id?: string | null
          drive_folder_name?: string | null
          drive_last_error?: string | null
          drive_sync_status?: string | null
          drive_synced_at?: string | null
          drive_zip_file_id?: string | null
          durata_esecuzione_giorni?: number | null
          durata_esecuzione_mesi?: number | null
          ente?: string | null
          esito_data_aggiudicazione?: string | null
          esito_importo_aggiudicato?: number | null
          esito_raw?: Json | null
          esito_ribasso?: number | null
          esito_source?: string | null
          esito_storico?: string | null
          esito_synced_at?: string | null
          esito_vincitore?: string | null
          external_created_at?: string | null
          external_id?: number | null
          external_updated_at?: string | null
          fareappalti_id?: string | null
          fareappalti_synced_at?: string | null
          has_documents?: boolean | null
          id?: string
          import_batch_id?: string | null
          importo_base?: number | null
          importo_forniture?: number | null
          importo_lavori?: number | null
          importo_manodopera?: number | null
          importo_oneri_sicurezza?: number | null
          importo_progettazione?: number | null
          importo_servizi?: number | null
          importo_sicurezza?: number | null
          importo_totale?: number | null
          is_archived?: boolean | null
          is_searchable?: boolean
          is_storico?: boolean | null
          is_telematica?: boolean | null
          link_portale?: string | null
          localita?: string[] | null
          note_interne?: string | null
          note_portale?: string | null
          ora_scadenza_offerta?: string | null
          organization_address?: Json | null
          organization_id?: string | null
          organization_offices?: Json | null
          organization_url?: string | null
          piattaforma_nome?: string | null
          piattaforma_url?: string | null
          policy_request_sent_at?: string | null
          procedure_name?: string | null
          procedure_type?: string | null
          protocollo?: string | null
          provincia?: string | null
          reference?: string | null
          referenti?: Json | null
          regione?: string | null
          registrazione_piattaforma_richiesta?: boolean | null
          riferimento_bando?: string | null
          riferimento_disciplinare?: string | null
          scadenza_apertura_buste?: string | null
          socio_partecipante_id?: string | null
          sopralluogo_luogo?: string | null
          sopralluogo_note?: string | null
          sopralluogo_prenotazione_entro?: string | null
          sopralluogo_tipo?:
            | Database["public"]["Enums"]["sopralluogo_tipo"]
            | null
          source_id?: string | null
          source_org_url?: string | null
          source_tender_url?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["gara_status"] | null
          status_code?: string | null
          submitted_at?: string | null
          tender_status?: string | null
          termine_stipula_giorni?: number | null
          tipo_gara?: string | null
          tipo_procedura?: string | null
          updated_at?: string | null
          validita_offerta_giorni?: number | null
          viewed?: boolean | null
          webhook_last_called_at?: string | null
          webhook_response_status?: number | null
        }
        Update: {
          altre_categorie?: string[] | null
          analisi_completata?: boolean | null
          analisi_completata_at?: string | null
          analisi_completata_da?: string | null
          analysis_completed_at?: string | null
          analysis_error?: string | null
          analysis_started_at?: string | null
          analysis_status?: string | null
          Bando?: string | null
          categoria_prevalente?: string | null
          categorie?: string[] | null
          categorie_dettaglio?: Json | null
          cig?: string | null
          classifica_ente?: string | null
          classifiche?: string[] | null
          costi_manodopera?: number | null
          created_at?: string | null
          created_by?: string | null
          criterio?:
            | Database["public"]["Enums"]["criterio_aggiudicazione"]
            | null
          criterio_aggiudicazione?: string | null
          cup?: string | null
          data_aggiudicazione_prevista?: string | null
          data_apertura_buste?: string | null
          data_apertura_economica?: string | null
          data_apertura_tecnica?: string | null
          data_pubblicazione?: string | null
          data_risposta_chiarimenti?: string | null
          data_scadenza_offerta?: string | null
          data_sopralluogo?: string | null
          dati_estratti?: Json | null
          deadline?: string | null
          descrizione?: string | null
          Disciplinare?: string | null
          doc_allegati?: boolean | null
          doc_disciplinare?: boolean | null
          doc_estratto?: boolean | null
          doc_integrale?: boolean | null
          documenti_zip_url?: string | null
          drive_folder_id?: string | null
          drive_folder_name?: string | null
          drive_last_error?: string | null
          drive_sync_status?: string | null
          drive_synced_at?: string | null
          drive_zip_file_id?: string | null
          durata_esecuzione_giorni?: number | null
          durata_esecuzione_mesi?: number | null
          ente?: string | null
          esito_data_aggiudicazione?: string | null
          esito_importo_aggiudicato?: number | null
          esito_raw?: Json | null
          esito_ribasso?: number | null
          esito_source?: string | null
          esito_storico?: string | null
          esito_synced_at?: string | null
          esito_vincitore?: string | null
          external_created_at?: string | null
          external_id?: number | null
          external_updated_at?: string | null
          fareappalti_id?: string | null
          fareappalti_synced_at?: string | null
          has_documents?: boolean | null
          id?: string
          import_batch_id?: string | null
          importo_base?: number | null
          importo_forniture?: number | null
          importo_lavori?: number | null
          importo_manodopera?: number | null
          importo_oneri_sicurezza?: number | null
          importo_progettazione?: number | null
          importo_servizi?: number | null
          importo_sicurezza?: number | null
          importo_totale?: number | null
          is_archived?: boolean | null
          is_searchable?: boolean
          is_storico?: boolean | null
          is_telematica?: boolean | null
          link_portale?: string | null
          localita?: string[] | null
          note_interne?: string | null
          note_portale?: string | null
          ora_scadenza_offerta?: string | null
          organization_address?: Json | null
          organization_id?: string | null
          organization_offices?: Json | null
          organization_url?: string | null
          piattaforma_nome?: string | null
          piattaforma_url?: string | null
          policy_request_sent_at?: string | null
          procedure_name?: string | null
          procedure_type?: string | null
          protocollo?: string | null
          provincia?: string | null
          reference?: string | null
          referenti?: Json | null
          regione?: string | null
          registrazione_piattaforma_richiesta?: boolean | null
          riferimento_bando?: string | null
          riferimento_disciplinare?: string | null
          scadenza_apertura_buste?: string | null
          socio_partecipante_id?: string | null
          sopralluogo_luogo?: string | null
          sopralluogo_note?: string | null
          sopralluogo_prenotazione_entro?: string | null
          sopralluogo_tipo?:
            | Database["public"]["Enums"]["sopralluogo_tipo"]
            | null
          source_id?: string | null
          source_org_url?: string | null
          source_tender_url?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["gara_status"] | null
          status_code?: string | null
          submitted_at?: string | null
          tender_status?: string | null
          termine_stipula_giorni?: number | null
          tipo_gara?: string | null
          tipo_procedura?: string | null
          updated_at?: string | null
          validita_offerta_giorni?: number | null
          viewed?: boolean | null
          webhook_last_called_at?: string | null
          webhook_response_status?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gare_analisi_completata_da_fkey"
            columns: ["analisi_completata_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gare_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gare_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "gare_import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gare_socio_partecipante_id_fkey"
            columns: ["socio_partecipante_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      gare_import_batches: {
        Row: {
          created_at: string | null
          error_report: Json | null
          failed_rows: number | null
          file_name: string
          id: string
          imported_by: string | null
          imported_rows: number | null
          status: string | null
          total_rows: number | null
        }
        Insert: {
          created_at?: string | null
          error_report?: Json | null
          failed_rows?: number | null
          file_name: string
          id?: string
          imported_by?: string | null
          imported_rows?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Update: {
          created_at?: string | null
          error_report?: Json | null
          failed_rows?: number | null
          file_name?: string
          id?: string
          imported_by?: string | null
          imported_rows?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Relationships: []
      }
      gare_uffici_contatti: {
        Row: {
          codice_cu: string | null
          codice_ipa: string | null
          created_at: string
          fax: string | null
          gara_id: string
          id: string
          indirizzo_citta: string | null
          indirizzo_provincia: string | null
          indirizzo_regione: string | null
          indirizzo_sigla: string | null
          indirizzo_via: string | null
          nome: string | null
          pec: string | null
          responsabile_email: string | null
          responsabile_nome: string | null
          sort_order: number
          telefono: string | null
          updated_at: string
        }
        Insert: {
          codice_cu?: string | null
          codice_ipa?: string | null
          created_at?: string
          fax?: string | null
          gara_id: string
          id?: string
          indirizzo_citta?: string | null
          indirizzo_provincia?: string | null
          indirizzo_regione?: string | null
          indirizzo_sigla?: string | null
          indirizzo_via?: string | null
          nome?: string | null
          pec?: string | null
          responsabile_email?: string | null
          responsabile_nome?: string | null
          sort_order?: number
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          codice_cu?: string | null
          codice_ipa?: string | null
          created_at?: string
          fax?: string | null
          gara_id?: string
          id?: string
          indirizzo_citta?: string | null
          indirizzo_provincia?: string | null
          indirizzo_regione?: string | null
          indirizzo_sigla?: string | null
          indirizzo_via?: string | null
          nome?: string | null
          pec?: string | null
          responsabile_email?: string | null
          responsabile_nome?: string | null
          sort_order?: number
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gare_uffici_contatti_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gare_uffici_contatti_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      google_oauth_tokens: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string
          scope: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token: string
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          message_id: string
          mime_type: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          message_id: string
          mime_type?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          message_id?: string
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          context_id: string | null
          context_label: string | null
          context_type: Database["public"]["Enums"]["context_type"] | null
          conversation_id: string
          created_at: string | null
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json | null
          read_at: string | null
          read_by: string | null
          sender_id: string
          sender_name: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
        }
        Insert: {
          content?: string | null
          context_id?: string | null
          context_label?: string | null
          context_type?: Database["public"]["Enums"]["context_type"] | null
          conversation_id: string
          created_at?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          read_at?: string | null
          read_by?: string | null
          sender_id: string
          sender_name?: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
        }
        Update: {
          content?: string | null
          context_id?: string | null
          context_label?: string | null
          context_type?: Database["public"]["Enums"]["context_type"] | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          read_at?: string | null
          read_by?: string | null
          sender_id?: string
          sender_name?: string | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_conversations_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_read_by_fkey"
            columns: ["read_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      naming_rules: {
        Row: {
          created_at: string
          date_granularity: string
          date_source: string
          document_type_id: string
          fallback_strategy: Json
          id: string
          normalization_rules: Json
          pattern_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_granularity?: string
          date_source?: string
          document_type_id: string
          fallback_strategy?: Json
          id?: string
          normalization_rules?: Json
          pattern_template?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_granularity?: string
          date_source?: string
          document_type_id?: string
          fallback_strategy?: Json
          id?: string
          normalization_rules?: Json
          pattern_template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "naming_rules_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: true
            referencedRelation: "tipi_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      note_board: {
        Row: {
          contenuto: string
          created_at: string | null
          id: string
          immagine_url: string | null
          socio_id: string | null
          tipo: string
          titolo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contenuto: string
          created_at?: string | null
          id?: string
          immagine_url?: string | null
          socio_id?: string | null
          tipo?: string
          titolo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contenuto?: string
          created_at?: string | null
          id?: string
          immagine_url?: string | null
          socio_id?: string | null
          tipo?: string
          titolo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_board_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_board_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          channel: string
          created_at: string | null
          dedup_key: string
          event_type: string
          id: string
          last_error: string | null
          max_retries: number | null
          payload: Json
          processed_at: string | null
          recipient_id: string | null
          recipient_type: string
          retries: number | null
          status: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          dedup_key: string
          event_type: string
          id?: string
          last_error?: string | null
          max_retries?: number | null
          payload: Json
          processed_at?: string | null
          recipient_id?: string | null
          recipient_type: string
          retries?: number | null
          status?: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          dedup_key?: string
          event_type?: string
          id?: string
          last_error?: string | null
          max_retries?: number | null
          payload?: Json
          processed_at?: string | null
          recipient_id?: string | null
          recipient_type?: string
          retries?: number | null
          status?: string
        }
        Relationships: []
      }
      notifiche_soci: {
        Row: {
          archiviata: boolean | null
          archiviata_at: string | null
          azione_url: string | null
          created_at: string | null
          data_scadenza: string | null
          documento_id: string | null
          gara_id: string | null
          giorni_rimanenti: number | null
          id: string
          letta: boolean | null
          letta_at: string | null
          messaggio: string
          metadata: Json | null
          priorita: Database["public"]["Enums"]["notifica_priorita"] | null
          scadenza_id: string | null
          socio_id: string
          tipo: Database["public"]["Enums"]["notifica_tipo"]
          titolo: string
          updated_at: string | null
        }
        Insert: {
          archiviata?: boolean | null
          archiviata_at?: string | null
          azione_url?: string | null
          created_at?: string | null
          data_scadenza?: string | null
          documento_id?: string | null
          gara_id?: string | null
          giorni_rimanenti?: number | null
          id?: string
          letta?: boolean | null
          letta_at?: string | null
          messaggio: string
          metadata?: Json | null
          priorita?: Database["public"]["Enums"]["notifica_priorita"] | null
          scadenza_id?: string | null
          socio_id: string
          tipo: Database["public"]["Enums"]["notifica_tipo"]
          titolo: string
          updated_at?: string | null
        }
        Update: {
          archiviata?: boolean | null
          archiviata_at?: string | null
          azione_url?: string | null
          created_at?: string | null
          data_scadenza?: string | null
          documento_id?: string | null
          gara_id?: string | null
          giorni_rimanenti?: number | null
          id?: string
          letta?: boolean | null
          letta_at?: string | null
          messaggio?: string
          metadata?: Json | null
          priorita?: Database["public"]["Enums"]["notifica_priorita"] | null
          scadenza_id?: string | null
          socio_id?: string
          tipo?: Database["public"]["Enums"]["notifica_tipo"]
          titolo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_scadenza_id_fkey"
            columns: ["scadenza_id"]
            isOneToOne: false
            referencedRelation: "scadenze"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_scadenza_id_fkey"
            columns: ["scadenza_id"]
            isOneToOne: false
            referencedRelation: "v_scadenze_prossime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      osservazioni_documentali_gara: {
        Row: {
          azione_richiesta: string | null
          azione_urgente: boolean | null
          created_at: string | null
          descrizione: string
          documento_correlato: string | null
          gara_id: string
          id: string
          nota_risoluzione: string | null
          ordine: number | null
          riferimento: string | null
          risolta: boolean | null
          risolta_at: string | null
          severita: Database["public"]["Enums"]["priorita_level"] | null
          socio_id: string | null
          tipo: Database["public"]["Enums"]["tipo_osservazione_doc"]
          titolo: string
        }
        Insert: {
          azione_richiesta?: string | null
          azione_urgente?: boolean | null
          created_at?: string | null
          descrizione: string
          documento_correlato?: string | null
          gara_id: string
          id?: string
          nota_risoluzione?: string | null
          ordine?: number | null
          riferimento?: string | null
          risolta?: boolean | null
          risolta_at?: string | null
          severita?: Database["public"]["Enums"]["priorita_level"] | null
          socio_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_osservazione_doc"]
          titolo: string
        }
        Update: {
          azione_richiesta?: string | null
          azione_urgente?: boolean | null
          created_at?: string | null
          descrizione?: string
          documento_correlato?: string | null
          gara_id?: string
          id?: string
          nota_risoluzione?: string | null
          ordine?: number | null
          riferimento?: string | null
          risolta?: boolean | null
          risolta_at?: string | null
          severita?: Database["public"]["Enums"]["priorita_level"] | null
          socio_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_osservazione_doc"]
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "osservazioni_documentali_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osservazioni_documentali_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "osservazioni_documentali_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      persone: {
        Row: {
          codice_fiscale: string | null
          cognome: string
          created_at: string
          data_nascita: string | null
          eliminato: boolean
          eliminato_at: string | null
          email: string | null
          id: string
          indirizzo_cap: string | null
          indirizzo_citta: string | null
          indirizzo_civico: string | null
          indirizzo_nazione: string
          indirizzo_provincia: string | null
          indirizzo_via: string | null
          luogo_nascita: string | null
          nome: string
          note_interne: string | null
          provincia_nascita: string | null
          secondo_nome: string | null
          socio_id: string
          sorgente_creazione: Database["public"]["Enums"]["sorgente_dato"]
          stato_elaborazione: string
          telefono: string | null
          titolo: Database["public"]["Enums"]["titolo_persona"] | null
          updated_at: string
        }
        Insert: {
          codice_fiscale?: string | null
          cognome: string
          created_at?: string
          data_nascita?: string | null
          eliminato?: boolean
          eliminato_at?: string | null
          email?: string | null
          id?: string
          indirizzo_cap?: string | null
          indirizzo_citta?: string | null
          indirizzo_civico?: string | null
          indirizzo_nazione?: string
          indirizzo_provincia?: string | null
          indirizzo_via?: string | null
          luogo_nascita?: string | null
          nome: string
          note_interne?: string | null
          provincia_nascita?: string | null
          secondo_nome?: string | null
          socio_id: string
          sorgente_creazione?: Database["public"]["Enums"]["sorgente_dato"]
          stato_elaborazione?: string
          telefono?: string | null
          titolo?: Database["public"]["Enums"]["titolo_persona"] | null
          updated_at?: string
        }
        Update: {
          codice_fiscale?: string | null
          cognome?: string
          created_at?: string
          data_nascita?: string | null
          eliminato?: boolean
          eliminato_at?: string | null
          email?: string | null
          id?: string
          indirizzo_cap?: string | null
          indirizzo_citta?: string | null
          indirizzo_civico?: string | null
          indirizzo_nazione?: string
          indirizzo_provincia?: string | null
          indirizzo_via?: string | null
          luogo_nascita?: string | null
          nome?: string
          note_interne?: string | null
          provincia_nascita?: string | null
          secondo_nome?: string | null
          socio_id?: string
          sorgente_creazione?: Database["public"]["Enums"]["sorgente_dato"]
          stato_elaborazione?: string
          telefono?: string | null
          titolo?: Database["public"]["Enums"]["titolo_persona"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persone_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      persone_aziende_ruoli: {
        Row: {
          attivo: boolean
          created_at: string
          data_fine: string | null
          data_inizio: string | null
          id: string
          note: string | null
          persona_id: string
          ruolo_id: string
          socio_id: string
          updated_at: string
        }
        Insert: {
          attivo?: boolean
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          id?: string
          note?: string | null
          persona_id: string
          ruolo_id: string
          socio_id: string
          updated_at?: string
        }
        Update: {
          attivo?: boolean
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          id?: string
          note?: string | null
          persona_id?: string
          ruolo_id?: string
          socio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persone_aziende_ruoli_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "persone"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persone_aziende_ruoli_ruolo_id_fkey"
            columns: ["ruolo_id"]
            isOneToOne: false
            referencedRelation: "ruoli_persona"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persone_aziende_ruoli_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      persone_merge_log: {
        Row: {
          created_at: string
          dati_after: Json | null
          dati_before: Json | null
          eseguito_da: string | null
          id: string
          motivo_merge: string
          persona_id_master: string
          persona_id_merged: string
        }
        Insert: {
          created_at?: string
          dati_after?: Json | null
          dati_before?: Json | null
          eseguito_da?: string | null
          id?: string
          motivo_merge: string
          persona_id_master: string
          persona_id_merged: string
        }
        Update: {
          created_at?: string
          dati_after?: Json | null
          dati_before?: Json | null
          eseguito_da?: string | null
          id?: string
          motivo_merge?: string
          persona_id_master?: string
          persona_id_merged?: string
        }
        Relationships: [
          {
            foreignKeyName: "persone_merge_log_persona_id_master_fkey"
            columns: ["persona_id_master"]
            isOneToOne: false
            referencedRelation: "persone"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persone_merge_log_persona_id_merged_fkey"
            columns: ["persona_id_merged"]
            isOneToOne: false
            referencedRelation: "persone"
            referencedColumns: ["id"]
          },
        ]
      }
      preavvisi_documenti: {
        Row: {
          created_at: string | null
          durata_validita_mesi: number | null
          id: string
          note: string | null
          obbligatorio: boolean | null
          preavviso_giorni: number
          tipo_documento_chiave: string
          tipo_documento_nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          durata_validita_mesi?: number | null
          id?: string
          note?: string | null
          obbligatorio?: boolean | null
          preavviso_giorni?: number
          tipo_documento_chiave: string
          tipo_documento_nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          durata_validita_mesi?: number | null
          id?: string
          note?: string | null
          obbligatorio?: boolean | null
          preavviso_giorni?: number
          tipo_documento_chiave?: string
          tipo_documento_nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      privacy_acceptances: {
        Row: {
          accepted_at: string
          document_url: string | null
          document_version: string
          id: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string
          document_url?: string | null
          document_version: string
          id?: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string
          document_url?: string | null
          document_version?: string
          id?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activated_at: string | null
          avatar_url: string | null
          cognome: string | null
          created_at: string | null
          definitive_email: string | null
          email: string
          first_login_completed_at: string | null
          has_completed_tour: boolean
          id: string
          is_active: boolean | null
          last_login: string | null
          nome: string
          onboarding_tour_version: number
          privacy_accepted_at: string | null
          privacy_accepted_version: string | null
          provisional_email: string | null
          provisional_login_active: boolean
          ruolo: Database["public"]["Enums"]["user_role"]
          socio_id: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          avatar_url?: string | null
          cognome?: string | null
          created_at?: string | null
          definitive_email?: string | null
          email: string
          first_login_completed_at?: string | null
          has_completed_tour?: boolean
          id: string
          is_active?: boolean | null
          last_login?: string | null
          nome: string
          onboarding_tour_version?: number
          privacy_accepted_at?: string | null
          privacy_accepted_version?: string | null
          provisional_email?: string | null
          provisional_login_active?: boolean
          ruolo?: Database["public"]["Enums"]["user_role"]
          socio_id?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          avatar_url?: string | null
          cognome?: string | null
          created_at?: string | null
          definitive_email?: string | null
          email?: string
          first_login_completed_at?: string | null
          has_completed_tour?: boolean
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          nome?: string
          onboarding_tour_version?: number
          privacy_accepted_at?: string | null
          privacy_accepted_version?: string | null
          provisional_email?: string | null
          provisional_login_active?: boolean
          ruolo?: Database["public"]["Enums"]["user_role"]
          socio_id?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_socio"
            columns: ["socio_id"]
            isOneToOne: true
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          n8n_metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          n8n_metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          n8n_metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rag_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "rag_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_chat_sessions: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_id: string
          document_source: string
          id: string
          last_message_at: string | null
          message_count: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_id: string
          document_source: string
          id?: string
          last_message_at?: string | null
          message_count?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          document_source?: string
          id?: string
          last_message_at?: string | null
          message_count?: number
        }
        Relationships: []
      }
      rag_document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          document_source: string
          embedding: string | null
          id: string
          metadata: Json | null
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          document_source: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          document_source?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          token_count?: number | null
        }
        Relationships: []
      }
      rag_document_sessions: {
        Row: {
          created_at: string | null
          document_id: string
          document_source: string
          id: string
          is_vectorized: boolean
          updated_at: string | null
          vector_reference: string | null
          vectorized_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          document_source: string
          id?: string
          is_vectorized?: boolean
          updated_at?: string | null
          vector_reference?: string | null
          vectorized_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          document_source?: string
          id?: string
          is_vectorized?: boolean
          updated_at?: string | null
          vector_reference?: string | null
          vectorized_at?: string | null
        }
        Relationships: []
      }
      richieste_gara: {
        Row: {
          attestazione_soa_filename: string | null
          attestazione_soa_url: string | null
          bando_allegato_url: string | null
          categoria_prevalente: string
          created_at: string | null
          data_fattibilita: string | null
          gara_id: string
          id: string
          messaggio_rifiuto: string | null
          motivo_fattibilita: string | null
          note: string | null
          numero_protocollo: string | null
          socio_id: string
          status: Database["public"]["Enums"]["richiesta_status"] | null
          updated_at: string | null
          valutato_at: string | null
          valutato_da: string | null
          valutato_direzione: boolean | null
          valutato_direzione_at: string | null
          valutato_direzione_da: string | null
        }
        Insert: {
          attestazione_soa_filename?: string | null
          attestazione_soa_url?: string | null
          bando_allegato_url?: string | null
          categoria_prevalente: string
          created_at?: string | null
          data_fattibilita?: string | null
          gara_id: string
          id?: string
          messaggio_rifiuto?: string | null
          motivo_fattibilita?: string | null
          note?: string | null
          numero_protocollo?: string | null
          socio_id: string
          status?: Database["public"]["Enums"]["richiesta_status"] | null
          updated_at?: string | null
          valutato_at?: string | null
          valutato_da?: string | null
          valutato_direzione?: boolean | null
          valutato_direzione_at?: string | null
          valutato_direzione_da?: string | null
        }
        Update: {
          attestazione_soa_filename?: string | null
          attestazione_soa_url?: string | null
          bando_allegato_url?: string | null
          categoria_prevalente?: string
          created_at?: string | null
          data_fattibilita?: string | null
          gara_id?: string
          id?: string
          messaggio_rifiuto?: string | null
          motivo_fattibilita?: string | null
          note?: string | null
          numero_protocollo?: string | null
          socio_id?: string
          status?: Database["public"]["Enums"]["richiesta_status"] | null
          updated_at?: string | null
          valutato_at?: string | null
          valutato_da?: string | null
          valutato_direzione?: boolean | null
          valutato_direzione_at?: string | null
          valutato_direzione_da?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "richieste_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "richieste_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "richieste_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "richieste_gara_valutato_da_fkey"
            columns: ["valutato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "richieste_gara_valutato_direzione_da_fkey"
            columns: ["valutato_direzione_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      richieste_libere: {
        Row: {
          created_at: string | null
          deadline: string | null
          descrizione: string | null
          ente: string | null
          file_name: string | null
          file_url: string | null
          id: string
          importo_stimato: number | null
          link_portale: string | null
          note_direzione: string | null
          regione: string | null
          socio_id: string
          status: string | null
          titolo: string
          updated_at: string | null
          valutato_at: string | null
          valutato_da: string | null
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          descrizione?: string | null
          ente?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          importo_stimato?: number | null
          link_portale?: string | null
          note_direzione?: string | null
          regione?: string | null
          socio_id: string
          status?: string | null
          titolo: string
          updated_at?: string | null
          valutato_at?: string | null
          valutato_da?: string | null
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          descrizione?: string | null
          ente?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          importo_stimato?: number | null
          link_portale?: string | null
          note_direzione?: string | null
          regione?: string | null
          socio_id?: string
          status?: string | null
          titolo?: string
          updated_at?: string | null
          valutato_at?: string | null
          valutato_da?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "richieste_libere_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "richieste_libere_valutato_da_fkey"
            columns: ["valutato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      riepilogo_checklist_documentale: {
        Row: {
          busta: Database["public"]["Enums"]["busta_gara"]
          completato: boolean | null
          completato_at: string | null
          created_at: string | null
          documento: string
          file_url: string | null
          firma_richiesta: boolean | null
          formato: string | null
          gara_id: string
          id: string
          modello_disponibile: boolean | null
          note: string | null
          ordine: number | null
          riferimento: string | null
          scadenza_preparazione: string | null
          socio_id: string | null
        }
        Insert: {
          busta: Database["public"]["Enums"]["busta_gara"]
          completato?: boolean | null
          completato_at?: string | null
          created_at?: string | null
          documento: string
          file_url?: string | null
          firma_richiesta?: boolean | null
          formato?: string | null
          gara_id: string
          id?: string
          modello_disponibile?: boolean | null
          note?: string | null
          ordine?: number | null
          riferimento?: string | null
          scadenza_preparazione?: string | null
          socio_id?: string | null
        }
        Update: {
          busta?: Database["public"]["Enums"]["busta_gara"]
          completato?: boolean | null
          completato_at?: string | null
          created_at?: string | null
          documento?: string
          file_url?: string | null
          firma_richiesta?: boolean | null
          formato?: string | null
          gara_id?: string
          id?: string
          modello_disponibile?: boolean | null
          note?: string | null
          ordine?: number | null
          riferimento?: string | null
          scadenza_preparazione?: string | null
          socio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riepilogo_checklist_documentale_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riepilogo_checklist_documentale_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "riepilogo_checklist_documentale_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      ruoli_persona: {
        Row: {
          attivo: boolean
          codice: string
          etichetta: string
          id: string
          ordine: number
        }
        Insert: {
          attivo?: boolean
          codice: string
          etichetta: string
          id?: string
          ordine?: number
        }
        Update: {
          attivo?: boolean
          codice?: string
          etichetta?: string
          id?: string
          ordine?: number
        }
        Relationships: []
      }
      scadenze: {
        Row: {
          commessa_id: string | null
          completata: boolean | null
          completata_at: string | null
          created_at: string | null
          data_scadenza: string
          descrizione: string | null
          documento_id: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          gara_id: string | null
          id: string
          priorita: Database["public"]["Enums"]["priorita_level"] | null
          socio_id: string | null
          tipo: Database["public"]["Enums"]["tipo_scadenza"]
          titolo: string
        }
        Insert: {
          commessa_id?: string | null
          completata?: boolean | null
          completata_at?: string | null
          created_at?: string | null
          data_scadenza: string
          descrizione?: string | null
          documento_id?: string | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          gara_id?: string | null
          id?: string
          priorita?: Database["public"]["Enums"]["priorita_level"] | null
          socio_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_scadenza"]
          titolo: string
        }
        Update: {
          commessa_id?: string | null
          completata?: boolean | null
          completata_at?: string | null
          created_at?: string | null
          data_scadenza?: string
          descrizione?: string | null
          documento_id?: string | null
          entity_id?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"] | null
          gara_id?: string | null
          id?: string
          priorita?: Database["public"]["Enums"]["priorita_level"] | null
          socio_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_scadenza"]
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "scadenze_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_audit_log: {
        Row: {
          action: string
          actor_role: string
          actor_user_id: string
          after_data: Json | null
          before_data: Json | null
          context: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_role?: string
          actor_user_id: string
          after_data?: Json | null
          before_data?: Json | null
          context?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_role?: string
          actor_user_id?: string
          after_data?: Json | null
          before_data?: Json | null
          context?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      sezioni_offerta_tecnica: {
        Row: {
          allegati_ammessi: boolean | null
          allegati_note: string | null
          created_at: string | null
          criterio_valutazione: string | null
          descrizione_contenuto: string | null
          formato_richiesto: string | null
          gara_id: string
          id: string
          lunghezza_max_pagine: number | null
          nome_sezione: string
          ordine: number | null
          punteggio_max: number | null
          riferimento_documento: string | null
          socio_id: string | null
        }
        Insert: {
          allegati_ammessi?: boolean | null
          allegati_note?: string | null
          created_at?: string | null
          criterio_valutazione?: string | null
          descrizione_contenuto?: string | null
          formato_richiesto?: string | null
          gara_id: string
          id?: string
          lunghezza_max_pagine?: number | null
          nome_sezione: string
          ordine?: number | null
          punteggio_max?: number | null
          riferimento_documento?: string | null
          socio_id?: string | null
        }
        Update: {
          allegati_ammessi?: boolean | null
          allegati_note?: string | null
          created_at?: string | null
          criterio_valutazione?: string | null
          descrizione_contenuto?: string | null
          formato_richiesto?: string | null
          gara_id?: string
          id?: string
          lunghezza_max_pagine?: number | null
          nome_sezione?: string
          ordine?: number | null
          punteggio_max?: number | null
          riferimento_documento?: string | null
          socio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sezioni_offerta_tecnica_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sezioni_offerta_tecnica_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sezioni_offerta_tecnica_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      soa_attestazioni: {
        Row: {
          categorie: string[] | null
          classifiche: string[] | null
          created_at: string | null
          data_emissione: string | null
          direttori_tecnici: string | null
          ente_certificatore: string | null
          file_name: string | null
          file_url: string | null
          id: string
          note: string | null
          numero_attestazione: string | null
          scadenza_quinquennale: string | null
          scadenza_triennale: string | null
          socio_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          categorie?: string[] | null
          classifiche?: string[] | null
          created_at?: string | null
          data_emissione?: string | null
          direttori_tecnici?: string | null
          ente_certificatore?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          note?: string | null
          numero_attestazione?: string | null
          scadenza_quinquennale?: string | null
          scadenza_triennale?: string | null
          socio_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          categorie?: string[] | null
          classifiche?: string[] | null
          created_at?: string | null
          data_emissione?: string | null
          direttori_tecnici?: string | null
          ente_certificatore?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          note?: string | null
          numero_attestazione?: string | null
          scadenza_quinquennale?: string | null
          scadenza_triennale?: string | null
          socio_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soa_attestazioni_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: true
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      soci: {
        Row: {
          activated_at: string | null
          anagrafica_updated_at: string | null
          banca: string | null
          cap: string | null
          cassa_edile_codice: string | null
          cassa_edile_provincia: string | null
          cassa_edile_sede: string | null
          cciaa_iscrizione: string | null
          ccnl_applicato: string | null
          citta: string | null
          codice_destinatario: string | null
          codice_fiscale: string | null
          created_at: string | null
          data_iscrizione_cciaa: string | null
          elenco_dipendenti: Json | null
          email: string | null
          email_confirmed: boolean | null
          iban_dedicato: string | null
          id: string
          inail_codice: string | null
          inail_pat: string | null
          inail_provincia: string | null
          inail_sede: string | null
          indirizzo: string | null
          inps_matricola: string | null
          inps_provincia: string | null
          inps_sede: string | null
          latitudine: number | null
          legali_rappresentanti: Json | null
          legge_68_dettagli: string | null
          longitudine: number | null
          note: string | null
          numero_dipendenti: number | null
          numero_iscrizione_cciaa: string | null
          obbligo_legge_68: boolean | null
          onboarding_status: Database["public"]["Enums"]["onboarding_status_enum"]
          partita_iva: string | null
          pec: string | null
          provincia: string | null
          provisional_auth_created_at: string | null
          qualifiche: string[] | null
          ragione_sociale: string
          rating: number | null
          rea: string | null
          responsabile_tecnico_dm37: Json | null
          sede_legale_cap: string | null
          sede_legale_citta: string | null
          sede_legale_indirizzo: string | null
          sede_legale_provincia: string | null
          sede_operativa_cap: string | null
          sede_operativa_citta: string | null
          sede_operativa_indirizzo: string | null
          sede_operativa_provincia: string | null
          status: Database["public"]["Enums"]["socio_status"] | null
          telefono: string | null
          updated_at: string | null
          user_id: string | null
          visura_onboarding_storage_path: string | null
        }
        Insert: {
          activated_at?: string | null
          anagrafica_updated_at?: string | null
          banca?: string | null
          cap?: string | null
          cassa_edile_codice?: string | null
          cassa_edile_provincia?: string | null
          cassa_edile_sede?: string | null
          cciaa_iscrizione?: string | null
          ccnl_applicato?: string | null
          citta?: string | null
          codice_destinatario?: string | null
          codice_fiscale?: string | null
          created_at?: string | null
          data_iscrizione_cciaa?: string | null
          elenco_dipendenti?: Json | null
          email?: string | null
          email_confirmed?: boolean | null
          iban_dedicato?: string | null
          id?: string
          inail_codice?: string | null
          inail_pat?: string | null
          inail_provincia?: string | null
          inail_sede?: string | null
          indirizzo?: string | null
          inps_matricola?: string | null
          inps_provincia?: string | null
          inps_sede?: string | null
          latitudine?: number | null
          legali_rappresentanti?: Json | null
          legge_68_dettagli?: string | null
          longitudine?: number | null
          note?: string | null
          numero_dipendenti?: number | null
          numero_iscrizione_cciaa?: string | null
          obbligo_legge_68?: boolean | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status_enum"]
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          provisional_auth_created_at?: string | null
          qualifiche?: string[] | null
          ragione_sociale: string
          rating?: number | null
          rea?: string | null
          responsabile_tecnico_dm37?: Json | null
          sede_legale_cap?: string | null
          sede_legale_citta?: string | null
          sede_legale_indirizzo?: string | null
          sede_legale_provincia?: string | null
          sede_operativa_cap?: string | null
          sede_operativa_citta?: string | null
          sede_operativa_indirizzo?: string | null
          sede_operativa_provincia?: string | null
          status?: Database["public"]["Enums"]["socio_status"] | null
          telefono?: string | null
          updated_at?: string | null
          user_id?: string | null
          visura_onboarding_storage_path?: string | null
        }
        Update: {
          activated_at?: string | null
          anagrafica_updated_at?: string | null
          banca?: string | null
          cap?: string | null
          cassa_edile_codice?: string | null
          cassa_edile_provincia?: string | null
          cassa_edile_sede?: string | null
          cciaa_iscrizione?: string | null
          ccnl_applicato?: string | null
          citta?: string | null
          codice_destinatario?: string | null
          codice_fiscale?: string | null
          created_at?: string | null
          data_iscrizione_cciaa?: string | null
          elenco_dipendenti?: Json | null
          email?: string | null
          email_confirmed?: boolean | null
          iban_dedicato?: string | null
          id?: string
          inail_codice?: string | null
          inail_pat?: string | null
          inail_provincia?: string | null
          inail_sede?: string | null
          indirizzo?: string | null
          inps_matricola?: string | null
          inps_provincia?: string | null
          inps_sede?: string | null
          latitudine?: number | null
          legali_rappresentanti?: Json | null
          legge_68_dettagli?: string | null
          longitudine?: number | null
          note?: string | null
          numero_dipendenti?: number | null
          numero_iscrizione_cciaa?: string | null
          obbligo_legge_68?: boolean | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status_enum"]
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          provisional_auth_created_at?: string | null
          qualifiche?: string[] | null
          ragione_sociale?: string
          rating?: number | null
          rea?: string | null
          responsabile_tecnico_dm37?: Json | null
          sede_legale_cap?: string | null
          sede_legale_citta?: string | null
          sede_legale_indirizzo?: string | null
          sede_legale_provincia?: string | null
          sede_operativa_cap?: string | null
          sede_operativa_citta?: string | null
          sede_operativa_indirizzo?: string | null
          sede_operativa_provincia?: string | null
          status?: Database["public"]["Enums"]["socio_status"] | null
          telefono?: string | null
          updated_at?: string | null
          user_id?: string | null
          visura_onboarding_storage_path?: string | null
        }
        Relationships: []
      }
      socio_drive_folders: {
        Row: {
          created_at: string | null
          drive_folder_id: string
          drive_folder_name: string | null
          drive_folder_url: string | null
          id: string
          socio_id: string
          superati_folder_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          drive_folder_id: string
          drive_folder_name?: string | null
          drive_folder_url?: string | null
          id?: string
          socio_id: string
          superati_folder_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          drive_folder_id?: string
          drive_folder_name?: string | null
          drive_folder_url?: string | null
          id?: string
          socio_id?: string
          superati_folder_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "socio_drive_folders_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: true
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      socio_soggetti: {
        Row: {
          codice_fiscale: string | null
          cognome: string
          created_at: string | null
          data_nascita: string | null
          doc_data_rilascio: string | null
          doc_ente_rilascio: string | null
          doc_extraction_metadata: Json | null
          doc_numero: string | null
          doc_scadenza: string | null
          doc_tipo: string | null
          id: string
          luogo_nascita: string | null
          nome: string
          socio_id: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          codice_fiscale?: string | null
          cognome: string
          created_at?: string | null
          data_nascita?: string | null
          doc_data_rilascio?: string | null
          doc_ente_rilascio?: string | null
          doc_extraction_metadata?: Json | null
          doc_numero?: string | null
          doc_scadenza?: string | null
          doc_tipo?: string | null
          id?: string
          luogo_nascita?: string | null
          nome: string
          socio_id: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          codice_fiscale?: string | null
          cognome?: string
          created_at?: string | null
          data_nascita?: string | null
          doc_data_rilascio?: string | null
          doc_ente_rilascio?: string | null
          doc_extraction_metadata?: Json | null
          doc_numero?: string | null
          doc_scadenza?: string | null
          doc_tipo?: string | null
          id?: string
          luogo_nascita?: string | null
          nome?: string
          socio_id?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "socio_soggetti_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      task_interni: {
        Row: {
          assegnato_a: string | null
          completato_at: string | null
          created_at: string | null
          creato_da: string | null
          data_completamento: string | null
          data_scadenza: string
          descrizione: string | null
          entity_id: string | null
          entity_type: string | null
          gara_id: string | null
          id: string
          priorita: Database["public"]["Enums"]["task_priorita"] | null
          richiesta_id: string | null
          socio_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tipo: Database["public"]["Enums"]["task_tipo"]
          titolo: string
          updated_at: string | null
        }
        Insert: {
          assegnato_a?: string | null
          completato_at?: string | null
          created_at?: string | null
          creato_da?: string | null
          data_completamento?: string | null
          data_scadenza: string
          descrizione?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gara_id?: string | null
          id?: string
          priorita?: Database["public"]["Enums"]["task_priorita"] | null
          richiesta_id?: string | null
          socio_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tipo?: Database["public"]["Enums"]["task_tipo"]
          titolo: string
          updated_at?: string | null
        }
        Update: {
          assegnato_a?: string | null
          completato_at?: string | null
          created_at?: string | null
          creato_da?: string | null
          data_completamento?: string | null
          data_scadenza?: string
          descrizione?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gara_id?: string | null
          id?: string
          priorita?: Database["public"]["Enums"]["task_priorita"] | null
          richiesta_id?: string | null
          socio_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tipo?: Database["public"]["Enums"]["task_tipo"]
          titolo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_interni_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_richiesta_id_fkey"
            columns: ["richiesta_id"]
            isOneToOne: false
            referencedRelation: "richieste_gara"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_preparazione_gara: {
        Row: {
          attivita: string
          completata: boolean | null
          completata_at: string | null
          completata_da: string | null
          created_at: string | null
          data_limite: string | null
          documento_richiesto_id: string | null
          gara_id: string
          giorni_prima_scadenza: number
          id: string
          ordine: number | null
          priorita: Database["public"]["Enums"]["priorita_level"] | null
          responsabile: string | null
          socio_id: string | null
        }
        Insert: {
          attivita: string
          completata?: boolean | null
          completata_at?: string | null
          completata_da?: string | null
          created_at?: string | null
          data_limite?: string | null
          documento_richiesto_id?: string | null
          gara_id: string
          giorni_prima_scadenza: number
          id?: string
          ordine?: number | null
          priorita?: Database["public"]["Enums"]["priorita_level"] | null
          responsabile?: string | null
          socio_id?: string | null
        }
        Update: {
          attivita?: string
          completata?: boolean | null
          completata_at?: string | null
          completata_da?: string | null
          created_at?: string | null
          data_limite?: string | null
          documento_richiesto_id?: string | null
          gara_id?: string
          giorni_prima_scadenza?: number
          id?: string
          ordine?: number | null
          priorita?: Database["public"]["Enums"]["priorita_level"] | null
          responsabile?: string | null
          socio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_preparazione_gara_completata_da_fkey"
            columns: ["completata_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_preparazione_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_preparazione_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_preparazione_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      tipi_documento: {
        Row: {
          canale_notifica_scadenza: string[]
          cartellabile: boolean
          cartellabile_label: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"]
          category_busta: string | null
          category_id: string | null
          contesto: string
          created_at: string | null
          descrizione: string | null
          durata_giorni: number | null
          ha_scadenza: boolean | null
          id: string
          is_active: boolean
          naming_template: Json
          nome: string
          obbligatorio_per_socio: boolean | null
          ordine: number | null
          parole_chiave: string[] | null
          regex_patterns: string[] | null
          sottocategoria: string | null
          subcategory_id: string | null
          tags: string[]
          target_ruoli: string[]
          updated_at: string | null
          versioning_policy: string
          visibilita: string
          visibility_scope: string
        }
        Insert: {
          canale_notifica_scadenza?: string[]
          cartellabile?: boolean
          cartellabile_label?: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"]
          category_busta?: string | null
          category_id?: string | null
          contesto?: string
          created_at?: string | null
          descrizione?: string | null
          durata_giorni?: number | null
          ha_scadenza?: boolean | null
          id?: string
          is_active?: boolean
          naming_template?: Json
          nome: string
          obbligatorio_per_socio?: boolean | null
          ordine?: number | null
          parole_chiave?: string[] | null
          regex_patterns?: string[] | null
          sottocategoria?: string | null
          subcategory_id?: string | null
          tags?: string[]
          target_ruoli?: string[]
          updated_at?: string | null
          versioning_policy?: string
          visibilita?: string
          visibility_scope?: string
        }
        Update: {
          canale_notifica_scadenza?: string[]
          cartellabile?: boolean
          cartellabile_label?: string | null
          categoria?: Database["public"]["Enums"]["documento_categoria"]
          category_busta?: string | null
          category_id?: string | null
          contesto?: string
          created_at?: string | null
          descrizione?: string | null
          durata_giorni?: number | null
          ha_scadenza?: boolean | null
          id?: string
          is_active?: boolean
          naming_template?: Json
          nome?: string
          obbligatorio_per_socio?: boolean | null
          ordine?: number | null
          parole_chiave?: string[] | null
          regex_patterns?: string[] | null
          sottocategoria?: string | null
          subcategory_id?: string | null
          tags?: string[]
          target_ruoli?: string[]
          updated_at?: string | null
          versioning_policy?: string
          visibilita?: string
          visibility_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "tipi_documento_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tipi_documento_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "document_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      video_tutorials: {
        Row: {
          categoria: string
          created_at: string
          descrizione: string | null
          durata: string | null
          durata_secondi: number | null
          id: string
          is_active: boolean
          ordine: number
          storage_path: string
          thumbnail_path: string | null
          titolo: string
          updated_at: string
          visible_direzione: boolean
          visible_soci: boolean
        }
        Insert: {
          categoria?: string
          created_at?: string
          descrizione?: string | null
          durata?: string | null
          durata_secondi?: number | null
          id?: string
          is_active?: boolean
          ordine?: number
          storage_path: string
          thumbnail_path?: string | null
          titolo: string
          updated_at?: string
          visible_direzione?: boolean
          visible_soci?: boolean
        }
        Update: {
          categoria?: string
          created_at?: string
          descrizione?: string | null
          durata?: string | null
          durata_secondi?: number | null
          id?: string
          is_active?: boolean
          ordine?: number
          storage_path?: string
          thumbnail_path?: string | null
          titolo?: string
          updated_at?: string
          visible_direzione?: boolean
          visible_soci?: boolean
        }
        Relationships: []
      }
      vincoli_offerta_gara: {
        Row: {
          busta: Database["public"]["Enums"]["busta_gara"] | null
          created_at: string | null
          descrizione: string
          gara_id: string
          id: string
          note: string | null
          riferimento_documento: string | null
          socio_id: string | null
          tipo_vincolo: string
          valore: string | null
        }
        Insert: {
          busta?: Database["public"]["Enums"]["busta_gara"] | null
          created_at?: string | null
          descrizione: string
          gara_id: string
          id?: string
          note?: string | null
          riferimento_documento?: string | null
          socio_id?: string | null
          tipo_vincolo: string
          valore?: string | null
        }
        Update: {
          busta?: Database["public"]["Enums"]["busta_gara"] | null
          created_at?: string | null
          descrizione?: string
          gara_id?: string
          id?: string
          note?: string | null
          riferimento_documento?: string | null
          socio_id?: string | null
          tipo_vincolo?: string
          valore?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vincoli_offerta_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vincoli_offerta_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vincoli_offerta_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempts: number | null
          correlation_id: string | null
          created_at: string | null
          endpoint: string | null
          error_message: string | null
          event_name: string | null
          id: string
          request_payload: Json | null
          response_body: Json | null
          response_status: number | null
          success: boolean | null
        }
        Insert: {
          attempts?: number | null
          correlation_id?: string | null
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          event_name?: string | null
          id?: string
          request_payload?: Json | null
          response_body?: Json | null
          response_status?: number | null
          success?: boolean | null
        }
        Update: {
          attempts?: number | null
          correlation_id?: string | null
          created_at?: string | null
          endpoint?: string | null
          error_message?: string | null
          event_name?: string | null
          id?: string
          request_payload?: Json | null
          response_body?: Json | null
          response_status?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      v_analisi_disciplinare_overview: {
        Row: {
          analisi_cig: string | null
          created_at: string | null
          ente: string | null
          fonte_analisi: string | null
          gara_cig: string | null
          gara_descrizione: string | null
          gara_id: string | null
          has_economica: boolean | null
          has_idoneita: boolean | null
          has_tecnica: boolean | null
          id: string | null
          procedura: string | null
          socio_id: string | null
          socio_nome: string | null
          tipo_analisi: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analisi_disciplinare_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisi_disciplinare_gara_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisi_disciplinare_gara_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      v_calendar_sync_dlq: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number | null
          internal_event_id: string | null
          internal_table: string | null
          operation: string | null
          payload: Json | null
          retry_count: number | null
          target_calendar_key: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number | null
          internal_event_id?: string | null
          internal_table?: string | null
          operation?: string | null
          payload?: Json | null
          retry_count?: number | null
          target_calendar_key?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number | null
          internal_event_id?: string | null
          internal_table?: string | null
          operation?: string | null
          payload?: Json | null
          retry_count?: number | null
          target_calendar_key?: string | null
        }
        Relationships: []
      }
      v_calendar_sync_status: {
        Row: {
          active_mappings: number | null
          conflicts_last_24h: number | null
          deleted_mappings: number | null
          last_mapping_updated: string | null
          last_outbox_processed: string | null
          outbox_dlq: number | null
          outbox_pending: number | null
          outbox_processed_last_hour: number | null
          sync_token_status: Json | null
        }
        Relationships: []
      }
      v_commessa_fatture_riepilogo: {
        Row: {
          commessa_id: string | null
          fatture_da_incassare: number | null
          fatture_da_pagare: number | null
          totale_entrate: number | null
          totale_fatture: number | null
          totale_scaduto: number | null
          totale_sospeso: number | null
          totale_spese: number | null
          totale_uscite: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_fatture_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_fatture_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
        ]
      }
      v_commessa_lavoratori_compliance: {
        Row: {
          codice_fiscale: string | null
          cognome: string | null
          commessa_codice: string | null
          commessa_id: string | null
          compliance_status: string | null
          created_at: string | null
          created_by: string | null
          data_fine: string | null
          data_inizio: string | null
          data_nascita: string | null
          documenti_in_scadenza: number | null
          documenti_scaduti: number | null
          documenti_validi: number | null
          email: string | null
          id: string | null
          is_active: boolean | null
          mansione: string | null
          nome: string | null
          notes: string | null
          qualifica: string | null
          socio_id: string | null
          telefono: string | null
          totale_documenti: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_lavoratori_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratori_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratori_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_lavoratori_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      v_commessa_scadenzario_full: {
        Row: {
          commessa_codice: string | null
          commessa_descrizione: string | null
          commessa_id: string | null
          commessa_status: Database["public"]["Enums"]["commessa_status"] | null
          created_at: string | null
          data_scadenza: string | null
          descrizione: string | null
          entity_id: string | null
          entity_type: string | null
          giorni_preavviso: number | null
          giorni_rimanenti: number | null
          id: string | null
          last_notified_at: string | null
          next_reminder_at: string | null
          notifiche_inviate: number | null
          notify_direzione: boolean | null
          nuovo_entity_id: string | null
          promemoria_attivo: boolean | null
          rinnovato: boolean | null
          stato: Database["public"]["Enums"]["deadline_status"] | null
          stato_calcolato: string | null
          target_socio_ids: string[] | null
          target_user_ids: string[] | null
          titolo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_scadenzario_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_scadenzario_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
        ]
      }
      v_commessa_upcoming_tasks: {
        Row: {
          assignee_id: string | null
          assignee_nome: string | null
          assignee_socio_id: string | null
          assignee_socio_nome: string | null
          attachments: Json | null
          category: Database["public"]["Enums"]["task_category"] | null
          commessa_codice: string | null
          commessa_descrizione: string | null
          commessa_id: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          days_until: number | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string | null
          notes: string | null
          ordine: number | null
          origin: Database["public"]["Enums"]["task_origin"] | null
          origin_ref_id: string | null
          priority: Database["public"]["Enums"]["priorita_level"] | null
          reminder_days: number | null
          reminder_sent: boolean | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_assignee_socio_id_fkey"
            columns: ["assignee_socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_commesse_dashboard: {
        Row: {
          award_date: string | null
          categoria_prevalente: string | null
          codice: string | null
          consegna_lavori_at: string | null
          contact_count: number | null
          contract_signed: boolean | null
          contract_signed_at: string | null
          created_at: string | null
          created_by: string | null
          data_fine_effettiva: string | null
          data_fine_prevista: string | null
          data_inizio: string | null
          descrizione: string | null
          doc_count: number | null
          ente: string | null
          gara_categorie: string[] | null
          gara_cig: string | null
          gara_id: string | null
          gara_importo: number | null
          health_score: number | null
          id: string | null
          importo_contratto: number | null
          next_deadline: string | null
          note: string | null
          overdue_tasks: number | null
          pending_tasks: number | null
          progress: number | null
          required_contacts: number | null
          soci_ids: string[] | null
          status: Database["public"]["Enums"]["commessa_status"] | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commesse_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commesse_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_comunicazioni_da_associare: {
        Row: {
          allegati: Json | null
          association_confidence: number | null
          auto_associated: boolean | null
          canale: string | null
          commessa_id: string | null
          commesse_suggerite: string[] | null
          converted_to_task: boolean | null
          created_at: string | null
          created_by: string | null
          destinatari: Json | null
          direction: string | null
          external_id: string | null
          external_message_id: string | null
          external_thread_id: string | null
          id: string | null
          manual_association: boolean | null
          mittente: string | null
          mittente_email: string | null
          oggetto: string | null
          processed_at: string | null
          raw_payload: Json | null
          received_at: string | null
          related_task_id: string | null
          testo: string | null
          testo_html: string | null
        }
        Insert: {
          allegati?: Json | null
          association_confidence?: number | null
          auto_associated?: boolean | null
          canale?: string | null
          commessa_id?: string | null
          commesse_suggerite?: never
          converted_to_task?: boolean | null
          created_at?: string | null
          created_by?: string | null
          destinatari?: Json | null
          direction?: string | null
          external_id?: string | null
          external_message_id?: string | null
          external_thread_id?: string | null
          id?: string | null
          manual_association?: boolean | null
          mittente?: string | null
          mittente_email?: string | null
          oggetto?: string | null
          processed_at?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          related_task_id?: string | null
          testo?: string | null
          testo_html?: string | null
        }
        Update: {
          allegati?: Json | null
          association_confidence?: number | null
          auto_associated?: boolean | null
          canale?: string | null
          commessa_id?: string | null
          commesse_suggerite?: never
          converted_to_task?: boolean | null
          created_at?: string | null
          created_by?: string | null
          destinatari?: Json | null
          direction?: string | null
          external_id?: string | null
          external_message_id?: string | null
          external_thread_id?: string | null
          id?: string | null
          manual_association?: boolean | null
          mittente?: string | null
          mittente_email?: string | null
          oggetto?: string | null
          processed_at?: string | null
          raw_payload?: Json | null
          received_at?: string | null
          related_task_id?: string | null
          testo?: string | null
          testo_html?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commessa_comunicazioni_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "commessa_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commessa_comunicazioni_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "v_commessa_upcoming_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      v_conversations_list: {
        Row: {
          created_at: string | null
          id: string | null
          is_archived: boolean | null
          last_message_at: string | null
          last_message_preview: string | null
          last_message_sender: Database["public"]["Enums"]["sender_type"] | null
          socio_email: string | null
          socio_id: string | null
          socio_nome: string | null
          unread_count_admin: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      v_documenti_archiviati: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          archived_reason: string | null
          caricato_da: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"] | null
          created_at: string | null
          data_emissione: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string | null
          is_archived: boolean | null
          mime_type: string | null
          note: string | null
          obbligatorio: boolean | null
          replaced_by_document_id: string | null
          replaced_by_file_url: string | null
          replaced_by_titolo: string | null
          replaces_document_id: string | null
          scadenza: string | null
          socio_id: string | null
          socio_nome: string | null
          sottocategoria: string | null
          status: Database["public"]["Enums"]["documento_status"] | null
          tipo_documento_id: string | null
          tipo_documento_nome: string | null
          titolo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_tipo_documento_id_fkey"
            columns: ["tipo_documento_id"]
            isOneToOne: false
            referencedRelation: "tipi_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      v_documenti_attivi: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          archived_reason: string | null
          caricato_da: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"] | null
          created_at: string | null
          data_emissione: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string | null
          is_archived: boolean | null
          mime_type: string | null
          note: string | null
          obbligatorio: boolean | null
          replaced_by_document_id: string | null
          replaces_document_id: string | null
          scadenza: string | null
          socio_id: string | null
          socio_nome: string | null
          sottocategoria: string | null
          status: Database["public"]["Enums"]["documento_status"] | null
          tipo_documento_id: string | null
          tipo_documento_nome: string | null
          titolo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaced_by_document_id_fkey"
            columns: ["replaced_by_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_replaces_document_id_fkey"
            columns: ["replaces_document_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_tipo_documento_id_fkey"
            columns: ["tipo_documento_id"]
            isOneToOne: false
            referencedRelation: "tipi_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      v_documenti_completi: {
        Row: {
          caricato_da: string | null
          categoria: Database["public"]["Enums"]["documento_categoria"] | null
          created_at: string | null
          data_emissione: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string | null
          mime_type: string | null
          note: string | null
          obbligatorio: boolean | null
          scadenza: string | null
          socio_id: string | null
          socio_nome: string | null
          sottocategoria: string | null
          status: Database["public"]["Enums"]["documento_status"] | null
          tipo_documento_id: string | null
          tipo_documento_nome: string | null
          tipo_obbligatorio: boolean | null
          titolo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documenti_caricato_da_fkey"
            columns: ["caricato_da"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenti_tipo_documento_id_fkey"
            columns: ["tipo_documento_id"]
            isOneToOne: false
            referencedRelation: "tipi_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      v_eventi_calendario_socio: {
        Row: {
          created_at: string | null
          data_evento: string | null
          descrizione: string | null
          documento_titolo: string | null
          giorni_mancanti: number | null
          id: string | null
          is_auto_generated: boolean | null
          metadata: Json | null
          navigation_target: string | null
          ora_fine: string | null
          ora_inizio: string | null
          socio_id: string | null
          socio_nome: string | null
          source_id: string | null
          source_type: string | null
          stato_scadenza: string | null
          tipo: Database["public"]["Enums"]["evento_tipo"] | null
          tipo_documento: string | null
          titolo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventi_calendario_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      v_gara_checklist_items_ita: {
        Row: {
          busta: string | null
          busta_id: string | null
          checklist_id: string | null
          codice: string | null
          condizione_obbligatorieta: string | null
          created_at: string | null
          descrizione: string | null
          firma_digitale: string | null
          gara_id: string | null
          id: string | null
          is_manual: boolean | null
          modello_stazione_appaltante: boolean | null
          modello_url: string | null
          nome_modello: string | null
          note: string | null
          obbligatorio: boolean | null
          riferimenti_normativi: string[] | null
          riferimento_documento: string | null
          soggetti_che_devono_produrre: string[] | null
          sort_order: number | null
          tipo: string | null
          titolo: string | null
          updated_at: string | null
        }
        Insert: {
          busta?: string | null
          busta_id?: string | null
          checklist_id?: string | null
          codice?: string | null
          condizione_obbligatorieta?: string | null
          created_at?: string | null
          descrizione?: string | null
          firma_digitale?: string | null
          gara_id?: string | null
          id?: string | null
          is_manual?: boolean | null
          modello_stazione_appaltante?: boolean | null
          modello_url?: string | null
          nome_modello?: string | null
          note?: string | null
          obbligatorio?: boolean | null
          riferimenti_normativi?: string[] | null
          riferimento_documento?: string | null
          soggetti_che_devono_produrre?: string[] | null
          sort_order?: number | null
          tipo?: string | null
          titolo?: string | null
          updated_at?: string | null
        }
        Update: {
          busta?: string | null
          busta_id?: string | null
          checklist_id?: string | null
          codice?: string | null
          condizione_obbligatorieta?: string | null
          created_at?: string | null
          descrizione?: string | null
          firma_digitale?: string | null
          gara_id?: string | null
          id?: string | null
          is_manual?: boolean | null
          modello_stazione_appaltante?: boolean | null
          modello_url?: string | null
          nome_modello?: string | null
          note?: string | null
          obbligatorio?: boolean | null
          riferimenti_normativi?: string[] | null
          riferimento_documento?: string | null
          soggetti_che_devono_produrre?: string[] | null
          sort_order?: number | null
          tipo?: string | null
          titolo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_checklist_items_busta_id_fkey"
            columns: ["busta_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist_buste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "gara_checklist"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "v_gara_checklist_riepilogo"
            referencedColumns: ["checklist_id"]
          },
          {
            foreignKeyName: "gara_checklist_items_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_items_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      v_gara_checklist_riepilogo: {
        Row: {
          assegnazioni_caricate: number | null
          assegnazioni_mancanti: number | null
          assegnazioni_validate: number | null
          checklist_id: string | null
          checklist_status: string | null
          cig: string | null
          copartecipazione_id: string | null
          created_at: string | null
          deadline: string | null
          ente: string | null
          gara_descrizione: string | null
          gara_id: string | null
          items_busta_a: number | null
          items_busta_b: number | null
          items_busta_c: number | null
          percentuale_completamento: number | null
          totale_assegnazioni: number | null
          totale_items: number | null
          updated_at: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gara_checklist_copartecipazione_id_fkey"
            columns: ["copartecipazione_id"]
            isOneToOne: false
            referencedRelation: "co_partecipazioni"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gara_checklist_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
        ]
      }
      v_gare_con_richieste: {
        Row: {
          altre_categorie: string[] | null
          categoria_prevalente: string | null
          cig: string | null
          created_at: string | null
          created_by: string | null
          cup: string | null
          data_apertura_buste: string | null
          data_pubblicazione: string | null
          data_sopralluogo: string | null
          deadline: string | null
          descrizione: string | null
          ente: string | null
          id: string | null
          importo_base: number | null
          importo_oneri_sicurezza: number | null
          link_portale: string | null
          note_interne: string | null
          num_richieste: number | null
          protocollo: string | null
          provincia: string | null
          regione: string | null
          soci_interessati: string[] | null
          status: Database["public"]["Enums"]["gara_status"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gare_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_notifiche_attive_socio: {
        Row: {
          archiviata: boolean | null
          archiviata_at: string | null
          azione_url: string | null
          created_at: string | null
          data_scadenza: string | null
          documento_file_url: string | null
          documento_id: string | null
          documento_titolo: string | null
          gara_cig: string | null
          gara_descrizione: string | null
          gara_id: string | null
          giorni_rimanenti: number | null
          id: string | null
          letta: boolean | null
          letta_at: string | null
          messaggio: string | null
          metadata: Json | null
          priorita: Database["public"]["Enums"]["notifica_priorita"] | null
          scadenza_id: string | null
          socio_id: string | null
          tipo: Database["public"]["Enums"]["notifica_tipo"] | null
          tipo_documento_nome: string | null
          titolo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_scadenza_id_fkey"
            columns: ["scadenza_id"]
            isOneToOne: false
            referencedRelation: "scadenze"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_scadenza_id_fkey"
            columns: ["scadenza_id"]
            isOneToOne: false
            referencedRelation: "v_scadenze_prossime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifiche_soci_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      v_scadenze_prossime: {
        Row: {
          commessa_id: string | null
          completata: boolean | null
          completata_at: string | null
          created_at: string | null
          data_scadenza: string | null
          descrizione: string | null
          documento_id: string | null
          documento_titolo: string | null
          entity_id: string | null
          entity_type: Database["public"]["Enums"]["entity_type"] | null
          gara_cig: string | null
          gara_descrizione: string | null
          gara_id: string | null
          id: string | null
          priorita: Database["public"]["Enums"]["priorita_level"] | null
          socio_id: string | null
          socio_nome: string | null
          tipo: Database["public"]["Enums"]["tipo_scadenza"] | null
          titolo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scadenze_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commesse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "v_commesse_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documenti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_archiviati"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_attivi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "v_documenti_completi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
      v_task_attivi: {
        Row: {
          assegnato_a: string | null
          cig: string | null
          created_at: string | null
          creato_da: string | null
          data_completamento: string | null
          data_scadenza: string | null
          descrizione: string | null
          gara_deadline: string | null
          gara_descrizione: string | null
          gara_id: string | null
          id: string | null
          priorita: Database["public"]["Enums"]["task_priorita"] | null
          richiesta_id: string | null
          richiesta_status:
            | Database["public"]["Enums"]["richiesta_status"]
            | null
          socio_id: string | null
          socio_nome: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tipo: Database["public"]["Enums"]["task_tipo"] | null
          titolo: string | null
          updated_at: string | null
          urgenza: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_interni_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "gare"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_gara_id_fkey"
            columns: ["gara_id"]
            isOneToOne: false
            referencedRelation: "v_gare_con_richieste"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_richiesta_id_fkey"
            columns: ["richiesta_id"]
            isOneToOne: false
            referencedRelation: "richieste_gara"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_interni_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "soci"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accetta_copartecipazione: {
        Args: {
          p_copartecipazione_id: string
          p_note?: string
          p_socio_id: string
        }
        Returns: boolean
      }
      activate_socio_account: {
        Args: {
          email_input: string
          nome_input: string
          socio_id_input: string
          user_id_input: string
        }
        Returns: undefined
      }
      aggiorna_stati_eventi_calendario_documenti: {
        Args: never
        Returns: {
          eventi_aggiornati: number
          eventi_scaduti: number
          eventi_urgenti: number
        }[]
      }
      aggiungi_attivita_cronoprogramma: {
        Args: {
          p_data_scadenza: string
          p_descrizione: string
          p_gara_id: string
          p_note?: string
          p_priorita?: string
          p_socio_id: string
          p_titolo: string
        }
        Returns: string
      }
      aggiungi_checklist_item: {
        Args: {
          p_attivita: string
          p_descrizione?: string
          p_gara_id: string
          p_obbligatoria?: boolean
          p_socio_id: string
        }
        Returns: string
      }
      aggiungi_criticita: {
        Args: {
          p_descrizione: string
          p_gara_id: string
          p_severita?: string
          p_socio_id: string
          p_tipo: string
          p_titolo: string
        }
        Returns: string
      }
      annulla_copartecipazione: {
        Args: { p_copartecipazione_id: string; p_motivo?: string }
        Returns: Json
      }
      apply_commessa_task_template: {
        Args: {
          p_commessa_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: number
      }
      auth_socio_id: { Args: never; Returns: string }
      calcola_completamento_checklist: {
        Args: { p_socio_id: string }
        Returns: number
      }
      calcola_priorita_scadenza: {
        Args: { p_data_scadenza: string; p_tipo_documento_nome: string }
        Returns: Database["public"]["Enums"]["priorita_level"]
      }
      calcola_rating_socio: { Args: { p_socio_id: string }; Returns: number }
      calculate_commessa_health: {
        Args: { p_commessa_id: string }
        Returns: number
      }
      calculate_deadline_status: {
        Args: { p_data_scadenza: string; p_giorni_preavviso?: number }
        Returns: Database["public"]["Enums"]["deadline_status"]
      }
      calendar_sync_cleanup: { Args: { p_days?: number }; Returns: number }
      calendar_sync_retry_dlq: {
        Args: { p_max_items?: number }
        Returns: number
      }
      check_collaboration_readiness: {
        Args: { p_gara_id: string }
        Returns: Json
      }
      check_socio_checklist_readiness: {
        Args: { p_gara_id: string; p_socio_id: string }
        Returns: Json
      }
      check_socio_documenti_compliance: {
        Args: { p_socio_id: string }
        Returns: Json
      }
      cm_cleanup_stuck_processing_documents: { Args: never; Returns: undefined }
      cm_parse_italian_number: { Args: { txt: string }; Returns: number }
      count_search_gare: {
        Args: {
          p_categorie?: string[]
          p_criterio?: string
          p_data_pubblicazione_a?: string
          p_data_pubblicazione_da?: string
          p_data_scadenza_a?: string
          p_data_scadenza_da?: string
          p_escludi_archiviate?: boolean
          p_importo_max?: number
          p_importo_min?: number
          p_procedure_type?: string
          p_regioni?: string[]
          p_stato?: string
          p_testo_ricerca?: string
        }
        Returns: number
      }
      crea_copartecipazione_da_richiesta: {
        Args: {
          p_note?: string
          p_richiesta_id: string
          p_socio_partner_2_id?: string
          p_socio_partner_3_id?: string
          p_socio_partner_id: string
        }
        Returns: Json
      }
      crea_job_analisi_gara: {
        Args: {
          p_documents_zip_url?: string
          p_gara_id: string
          p_richiesta_id: string
        }
        Returns: string
      }
      crea_notifica_scadenza: {
        Args: {
          p_data_scadenza: string
          p_documento_id: string
          p_giorni_mancanti: number
          p_scadenza_id?: string
          p_socio_id: string
          p_titolo_documento: string
        }
        Returns: string
      }
      crea_richiesta_partecipazione:
        | {
            Args: {
              p_bando_allegato_url?: string
              p_categoria_prevalente?: string
              p_gara_id: string
              p_note?: string
              p_socio_id?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_bando_allegato_url?: string
              p_categoria_prevalente: string
              p_gara_id: string
              p_note?: string
              p_socio_id: string
            }
            Returns: Json
          }
      create_soggetto_from_extraction: {
        Args: {
          p_extraction_result: Json
          p_socio_id: string
          p_source?: string
          p_source_documento_id?: string
        }
        Returns: string
      }
      create_task_from_communication: {
        Args: {
          p_communication_id: string
          p_descrizione?: string
          p_due_date?: string
          p_priority?: string
          p_titolo: string
        }
        Returns: string
      }
      debug_analisi_disciplinare: {
        Args: { p_gara_id: string }
        Returns: {
          cig: string
          created_at: string
          ente: string
          fonte_analisi: string
          gara_id: string
          has_requisiti_economica: boolean
          has_requisiti_idoneita: boolean
          has_requisiti_tecnica: boolean
          id: string
          procedura: string
          socio_id: string
        }[]
      }
      expire_stale_copart_invites: { Args: never; Returns: Json }
      extract_storage_path_from_url: {
        Args: { bucket_name: string; file_url: string }
        Returns: string
      }
      find_active_document_to_replace: {
        Args: { p_socio_id: string; p_tipo_documento_nome: string }
        Returns: string
      }
      genera_cronoprogramma_da_template: {
        Args: { p_gara_id: string }
        Returns: Json
      }
      genera_numero_protocollo_richiesta: { Args: never; Returns: string }
      generate_commessa_code: { Args: never; Returns: string }
      get_available_soci: {
        Args: never
        Returns: {
          id: string
          ragione_sociale: string
        }[]
      }
      get_checklist_item_status: {
        Args: { p_item_id: string }
        Returns: {
          item_id: string
          presenti: number
          status_colore: string
          totale_richiesti: number
          validati: number
        }[]
      }
      get_dashboard_stats: { Args: never; Returns: Json }
      get_notifiche_count_socio: {
        Args: { p_socio_id: string }
        Returns: {
          alte: number
          medie: number
          totale_non_lette: number
          urgenti: number
        }[]
      }
      get_or_create_conversation: {
        Args: { p_socio_id: string }
        Returns: string
      }
      get_preavviso_documento: {
        Args: { p_tipo_documento_nome: string }
        Returns: number
      }
      get_requisito_gara: {
        Args: {
          p_chiave: string
          p_gara_id: string
          p_sezione: string
          p_socio_id: string
        }
        Returns: Json
      }
      get_richiesta_rifiutata_email_context: {
        Args: { p_richiesta_id: string }
        Returns: Json
      }
      get_soci_copartecipazione: {
        Args: { copart_id: string }
        Returns: {
          email: string
          ragione_sociale: string
          ruolo: string
          socio_id: string
        }[]
      }
      get_soci_map_markers: {
        Args: never
        Returns: {
          latitudine: number
          longitudine: number
          ragione_sociale: string
        }[]
      }
      get_stats_documenti_gara_socio: {
        Args: { p_gara_id: string; p_socio_id: string }
        Returns: Json
      }
      get_task_stats: {
        Args: never
        Returns: {
          completati_oggi: number
          da_fare: number
          in_corso: number
          scaduti: number
          totali: number
          urgenti: number
        }[]
      }
      get_temporal_kpis: { Args: never; Returns: Json }
      get_total_unread_count: { Args: { p_user_type: string }; Returns: number }
      get_user_role: { Args: never; Returns: string }
      get_user_socio_id: { Args: never; Returns: string }
      importa_analisi_disciplinare: {
        Args: {
          p_fonte?: string
          p_gara_id: string
          p_json: Json
          p_socio_id: string
        }
        Returns: string
      }
      importa_checklist_documentale_json: {
        Args: {
          p_checklist_id: string
          p_checklist_json: Json
          p_gara_id: string
        }
        Returns: {
          buste_create: number
          items_creati: number
          note_create: number
        }[]
      }
      importa_checklist_note_critiche_json: {
        Args: {
          p_checklist_id: string
          p_gara_id: string
          p_note_critiche: Json
        }
        Returns: number
      }
      ingest_email: {
        Args: {
          p_attachments?: Json
          p_body_html?: string
          p_body_text: string
          p_external_id?: string
          p_from_email: string
          p_from_name: string
          p_received_at?: string
          p_subject: string
          p_to_emails: string[]
        }
        Returns: string
      }
      is_direzione: { Args: never; Returns: boolean }
      is_internal_user: { Args: never; Returns: boolean }
      is_socio_active: { Args: { socio_id_input: string }; Returns: boolean }
      is_socio_available: { Args: { socio_id_input: string }; Returns: boolean }
      list_unactivated_soci: {
        Args: never
        Returns: {
          id: string
          ragione_sociale: string
        }[]
      }
      login_stats: { Args: never; Returns: Json }
      mark_assignment_downloaded: {
        Args: { p_assignment_id: string }
        Returns: boolean
      }
      mark_gara_submitted: { Args: { p_gara_id: string }; Returns: Json }
      mark_messages_as_read: {
        Args: { p_conversation_id: string; p_reader_type: string }
        Returns: number
      }
      mark_reminder_sent: {
        Args: { p_error?: string; p_reminder_id: string; p_success: boolean }
        Returns: undefined
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_rag_chunks: {
        Args: {
          match_count?: number
          p_document_id: string
          p_document_source: string
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      parse_commessa_code: { Args: { p_text: string }; Returns: string[] }
      process_copart_invite_action: {
        Args: {
          p_action: string
          p_note?: string
          p_responded_via?: string
          p_token_hash: string
        }
        Returns: {
          copartecipazione_id: string
          outcome: string
          socio_id: string
        }[]
      }
      process_dashboard_invite_decision: {
        Args: { p_action: string; p_invite_id: string; p_note?: string }
        Returns: Json
      }
      process_pending_reminders: {
        Args: never
        Returns: {
          commessa_codice: string
          reminder_id: string
          reminder_type: string
          scheduled_at: string
          target_emails: string[]
          titolo: string
        }[]
      }
      reclassify_document: {
        Args: {
          p_document_id: string
          p_new_tipo_documento_nome: string
          p_socio_id: string
          p_user_id?: string
        }
        Returns: Json
      }
      refresh_scadenzario_stati: { Args: never; Returns: number }
      register_checklist_upload: {
        Args: {
          p_assignment_id: string
          p_file_name: string
          p_file_path: string
          p_file_size?: number
          p_mime_type?: string
          p_note?: string
          p_storage_bucket?: string
        }
        Returns: string
      }
      replace_document:
        | {
            Args: {
              p_archived_by?: string
              p_archived_reason?: string
              p_new_categoria?: string
              p_new_entity_type?: string
              p_new_file_name: string
              p_new_file_url: string
              p_new_obbligatorio?: boolean
              p_new_scadenza?: string
              p_new_socio_id: string
              p_new_tipo_documento_nome: string
              p_new_titolo: string
              p_old_document_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_archived_by?: string
              p_archived_reason?: string
              p_new_categoria?: string
              p_new_entity_type?: string
              p_new_file_name: string
              p_new_file_url: string
              p_new_obbligatorio?: boolean
              p_new_scadenza?: string
              p_new_socio_id: string
              p_new_storage_bucket?: string
              p_new_storage_path?: string
              p_new_tipo_documento_nome: string
              p_new_titolo: string
              p_old_document_id: string
            }
            Returns: Json
          }
      resolve_calendar_key: {
        Args: {
          p_is_operativo: boolean
          p_is_task_interno: boolean
          p_source_type: string
          p_tipo: string
          p_tipo_evento: string
        }
        Returns: string
      }
      resolve_user_socio_id: { Args: never; Returns: string }
      ricalcola_tutte_le_priorita_scadenze: {
        Args: never
        Returns: {
          notifiche_create: number
          scadenze_aggiornate: number
        }[]
      }
      ricalcola_tutti_giorni_residui: { Args: never; Returns: number }
      rifiuta_copartecipazione: {
        Args: {
          p_copartecipazione_id: string
          p_note?: string
          p_socio_id: string
        }
        Returns: boolean
      }
      search_gare: {
        Args: {
          p_categorie?: string[]
          p_criterio?: string
          p_data_pubblicazione_a?: string
          p_data_pubblicazione_da?: string
          p_data_scadenza_a?: string
          p_data_scadenza_da?: string
          p_escludi_archiviate?: boolean
          p_importo_max?: number
          p_importo_min?: number
          p_limit?: number
          p_offset?: number
          p_procedure_type?: string
          p_regioni?: string[]
          p_stato?: string
          p_testo_ricerca?: string
        }
        Returns: {
          categorie: string[]
          cig: string
          created_at: string
          criterio_aggiudicazione: string
          cup: string
          data_pubblicazione: string
          deadline: string
          descrizione: string
          ente: string
          external_id: number
          has_documents: boolean
          id: string
          importo_totale: number
          localita: string[]
          procedure_type: string
          provincia: string
          reference: string
          regione: string
          source_url: string
          status: string
          status_code: string
        }[]
      }
      send_copart_expiry_reminders: { Args: never; Returns: Json }
      send_policy_request: { Args: { p_gara_id: string }; Returns: Json }
      soft_delete_document: {
        Args: { p_actor_id?: string; p_document_id: string }
        Returns: Json
      }
      sync_checklist_documenti_status: {
        Args: { p_socio_id?: string }
        Returns: number
      }
      sync_socio_persone: { Args: { p_socio_id: string }; Returns: undefined }
      timeout_stale_gara_analysis_jobs: { Args: never; Returns: Json }
      transition_gara_to_preparazione: {
        Args: { p_gara_id: string; p_richiesta_id?: string }
        Returns: Json
      }
      update_gara_analysis_job_webhook: {
        Args: {
          p_error_message?: string
          p_gara_id: string
          p_http_status: number
        }
        Returns: undefined
      }
      update_gara_from_analysis: {
        Args: {
          p_analysis_status?: string
          p_categorie?: string[]
          p_cig?: string
          p_criterio?: string
          p_cup?: string
          p_data_pubblicazione?: string
          p_data_scadenza_offerta?: string
          p_dati_estratti?: Json
          p_deadline?: string
          p_descrizione?: string
          p_ente?: string
          p_external_created_at?: string
          p_external_updated_at?: string
          p_gara_id: string
          p_importo_base?: number
          p_importo_manodopera?: number
          p_importo_progettazione?: number
          p_importo_sicurezza?: number
          p_importo_totale?: number
          p_link_portale?: string
          p_note_portale?: string
          p_organization_address?: Json
          p_organization_id?: string
          p_organization_offices?: Json
          p_procedure_name?: string
          p_procedure_type?: string
          p_provincia?: string
          p_referenti?: Json
          p_regione?: string
          p_source_org_url?: string
          p_source_tender_url?: string
          p_status_code?: string
          p_tender_status?: string
        }
        Returns: Json
      }
      upload_document_with_replacement: {
        Args: {
          p_caricato_da?: string
          p_categoria?: string
          p_file_name: string
          p_file_url: string
          p_obbligatorio?: boolean
          p_scadenza?: string
          p_socio_id: string
          p_tipo_documento_nome: string
          p_titolo: string
        }
        Returns: Json
      }
      upload_document_with_replacement_socio: {
        Args: {
          p_anno?: number
          p_caricato_da?: string
          p_categoria?: string
          p_entity_id?: string
          p_entity_type?: string
          p_file_name: string
          p_file_url: string
          p_obbligatorio?: boolean
          p_scadenza?: string
          p_socio_id: string
          p_storage_bucket?: string
          p_storage_path?: string
          p_tipo_documento_nome: string
          p_titolo: string
        }
        Returns: Json
      }
      upload_document_with_replacement_soggetto: {
        Args: {
          p_caricato_da?: string
          p_categoria?: string
          p_file_name: string
          p_file_url: string
          p_obbligatorio?: boolean
          p_scadenza?: string
          p_socio_id: string
          p_soggetto_id?: string
          p_soggetto_tipo?: string
          p_storage_bucket?: string
          p_storage_path?: string
          p_tipo_documento_nome: string
          p_titolo: string
        }
        Returns: Json
      }
      upsert_gara_checklist_busta: {
        Args: {
          p_busta: string
          p_checklist_id: string
          p_gara_id: string
          p_nome?: string
          p_punteggio_massimo?: number
        }
        Returns: string
      }
      upsert_gara_checklist_item: {
        Args: {
          p_busta: string
          p_checklist_id: string
          p_codice: string
          p_condizione_obbligatorieta?: string
          p_descrizione?: string
          p_firma_digitale?: string
          p_gara_id: string
          p_modello_stazione_appaltante?: boolean
          p_nome_modello?: string
          p_note?: string
          p_obbligatorio?: boolean
          p_riferimento_documento?: string
          p_soggetti_che_devono_produrre?: string[]
          p_sort_order?: number
          p_titolo: string
        }
        Returns: string
      }
      upsert_gara_fareappalti:
        | {
            Args: {
              p_categorie: string[]
              p_categorie_dettaglio: Json
              p_cig: string
              p_criterio_aggiudicazione: string
              p_cup: string
              p_data_pubblicazione: string
              p_deadline: string
              p_descrizione: string
              p_doc_allegati: boolean
              p_doc_integrale: boolean
              p_ente: string
              p_external_id: number
              p_external_updated_at: string
              p_has_documents: boolean
              p_importo_sicurezza: number
              p_importo_totale: number
              p_is_telematica: boolean
              p_localita: string[]
              p_procedure_type: string
              p_provincia: string
              p_reference: string
              p_regione: string
              p_source_id: string
              p_source_url: string
              p_status_code: string
            }
            Returns: string
          }
        | {
            Args: {
              p_categorie?: string[]
              p_categorie_dettaglio?: Json
              p_cig: string
              p_criterio_aggiudicazione?: string
              p_cup: string
              p_data_pubblicazione?: string
              p_data_scadenza_offerta?: string
              p_deadline?: string
              p_descrizione: string
              p_doc_allegati?: boolean
              p_doc_disciplinare?: boolean
              p_doc_estratto?: boolean
              p_doc_integrale?: boolean
              p_ente: string
              p_external_created_at?: string
              p_external_id: number
              p_external_updated_at?: string
              p_has_documents?: boolean
              p_importo_base?: number
              p_importo_manodopera?: number
              p_importo_progettazione?: number
              p_importo_sicurezza?: number
              p_importo_totale?: number
              p_is_telematica?: boolean
              p_localita?: string[]
              p_note_portale?: string
              p_organization_address?: Json
              p_organization_id?: string
              p_organization_offices?: Json
              p_organization_url?: string
              p_procedure_name?: string
              p_procedure_type: string
              p_provincia: string
              p_reference: string
              p_regione: string
              p_source_id?: string
              p_source_org_url?: string
              p_source_tender_url?: string
              p_source_url?: string
              p_status_code?: string
              p_tender_status?: string
            }
            Returns: string
          }
      upsert_gara_uffici_contatti_from_json: {
        Args: { p_gara_id: string; p_offices: Json }
        Returns: undefined
      }
      upsert_scadenza: {
        Args: {
          p_commessa_id: string
          p_data_scadenza: string
          p_descrizione: string
          p_entity_id: string
          p_entity_type: string
          p_giorni_preavviso?: number
          p_titolo: string
        }
        Returns: string
      }
      upsert_soggetto_from_extraction: {
        Args: {
          p_codice_fiscale?: string
          p_cognome: string
          p_data_nascita?: string
          p_doc_numero?: string
          p_doc_scadenza?: string
          p_doc_tipo?: string
          p_luogo_nascita?: string
          p_nome: string
          p_socio_id: string
          p_source?: string
          p_source_documento_id?: string
          p_tipo: string
        }
        Returns: string
      }
      verifica_requisito_soa: {
        Args: { p_gara_id: string; p_socio_id: string }
        Returns: {
          categoria_richiesta: string
          classifica_richiesta: string
          descrizione: string
          riferimento: string
        }[]
      }
    }
    Enums: {
      analysis_job_status:
        | "PENDING"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
      assignment_flow_type: "UPLOAD_ONLY" | "SIGNED_FLOW"
      assignment_status: "MANCANTE" | "CARICATO" | "VALIDATO" | "RIFIUTATO"
      assignment_subject_type: "CONSORZIO" | "SOCIO"
      attivita_tipo:
        | "UPLOAD_DOC"
        | "RICHIESTA_GARA"
        | "CAMBIO_STATUS"
        | "NUOVO_SOCIO"
        | "NUOVA_COMMESSA"
        | "LOGIN"
        | "ALTRO"
        | "RICLASSIFICA_DOC"
        | "AFFIANCAMENTO_SALVATO"
        | "AFFIANCAMENTO_INVITI_INVIATI"
        | "AFFIANCAMENTO_TRANSIZIONE_BLOCCATA"
        | "AFFIANCAMENTO_TRANSIZIONE_OK"
        | "COPARTECIPAZIONE_INVITO"
        | "AFFIANCAMENTO_ANNULLATO"
        | "VALUTAZIONE_RICHIESTA"
      busta_gara: "A" | "B" | "C" | "D" | "E"
      categoria_doc_gara:
        | "A1_IDENTIFICATIVI_GENERALI"
        | "A2_CAPACITA_ECONOMICA"
        | "A3_CAPACITA_TECNICA"
        | "A4_GARANZIE_CONTRIBUTI"
        | "A5_SOPRALLUOGO"
        | "A6_PNRR"
        | "B1_RELAZIONE_TECNICA"
        | "B2_ALLEGATI_TECNICI"
        | "B3_VINCOLI_TECNICI"
        | "C1_OFFERTA_ECONOMICA"
        | "C2_CORREDO_ECONOMICO"
        | "C3_MODALITA_ECONOMICA"
        | "D1_RTI_ATI"
        | "D2_CONSORZI"
        | "D3_AVVALIMENTO"
        | "D4_SUBAPPALTO"
        | "D5_GEIE"
        | "E1_AGGIUNTIVA"
        | "E2_POST_AGGIUDICAZIONE"
      checklist_gara_status:
        | "BOZZA_GENERATA"
        | "PRONTA_PER_ASSEGNAZIONE"
        | "ASSEGNATA"
        | "IN_RACCOLTA"
        | "COMPLETATA"
      checklist_responsabile: "CONSORZIO" | "SOCIO" | "ALTRO_SOCIO"
      checklist_status:
        | "DA_PREPARARE"
        | "PREPARATO"
        | "CARICATO"
        | "FIRMATO"
        | "INVIATO"
      comm_channel:
        | "EMAIL"
        | "WHATSAPP"
        | "TELEGRAM"
        | "PEC"
        | "TELEFONO"
        | "RIUNIONE"
        | "MANUALE"
      commessa_action:
        | "CREATED"
        | "UPDATED"
        | "STATUS_CHANGED"
        | "DOCUMENT_UPLOADED"
        | "DOCUMENT_DELETED"
        | "TASK_CREATED"
        | "TASK_COMPLETED"
        | "TASK_UPDATED"
        | "CONTACT_ADDED"
        | "CONTACT_UPDATED"
        | "COMMUNICATION_ADDED"
        | "REMINDER_SENT"
        | "NOTE_ADDED"
      commessa_status: "IN_CORSO" | "SOSPESA" | "CONCLUSA"
      contact_role:
        | "RUP"
        | "DIRETTORE_LAVORI"
        | "REFERENTE_CONSORZIATA"
        | "CAPOCANTIERE"
        | "COORDINATORE_SICUREZZA"
        | "ALTRO"
      context_type:
        | "GARA"
        | "COMMESSA"
        | "DOCUMENTO"
        | "RICHIESTA_GARA"
        | "RICHIESTA_LIBERA"
      criterio_aggiudicazione:
        | "OEPV"
        | "PREZZO_PIU_BASSO"
        | "COSTO_FISSO"
        | "ALTRO"
      deadline_status:
        | "VALIDO"
        | "IN_SCADENZA"
        | "SCADUTO"
        | "RINNOVATO"
        | "NON_APPLICABILE"
      digital_resource_type:
        | "MODELLO_BIM"
        | "ISSUE_TRACKER"
        | "ACDAT"
        | "REVISIONE"
        | "REPOSITORY"
        | "CLOUD_STORAGE"
        | "ALTRO"
      doc_commessa_category:
        | "CONTRATTO_LEGALE"
        | "ASSICURAZIONE"
        | "SICUREZZA_PERSONALE"
        | "TECNICO"
        | "CONTABILE"
        | "CORRISPONDENZA"
        | "ALTRO"
      doc_lavoratore_type:
        | "ATTESTATO_CORSO_SICUREZZA"
        | "ATTESTATO_CORSO_PRIMO_SOCCORSO"
        | "ATTESTATO_CORSO_ANTINCENDIO"
        | "ATTESTATO_CORSO_SPECIFICO"
        | "VISITA_MEDICA"
        | "IDONEITA_MANSIONE"
        | "CONSEGNA_DPI"
        | "DOCUMENTO_IDENTITA"
        | "UNILAV"
        | "ALTRO"
      documento_categoria: "QUALIFICA" | "GARA" | "COMMESSA" | "CONSORZIO"
      documento_status:
        | "VALIDO"
        | "IN_SCADENZA"
        | "SCADUTO"
        | "MANCANTE"
        | "IN_SOSTITUZIONE"
        | "SUPERATO"
        | "PENDING_DATA"
        | "ERROR"
      drive_provider: "GOOGLE_DRIVE" | "ONEDRIVE" | "NONE"
      entity_type:
        | "SOCIO"
        | "GARA"
        | "COMMESSA"
        | "CONSORZIO"
        | "GARA_CONSORZIO"
        | "COPARTECIPAZIONE"
      evento_tipo:
        | "SCADENZA_DOC"
        | "SCADENZA_GARA"
        | "SOPRALLUOGO"
        | "RIUNIONE"
        | "ASSEMBLEA"
        | "CONSEGNA_LAVORI"
        | "ALTRO"
      fase_gara:
        | "PRE_GARA"
        | "OFFERTA"
        | "VALUTAZIONE"
        | "POST_GARA"
        | "CONTRATTO"
        | "ESECUZIONE"
      firma_digitale_tipo: "GRAFOMETRICA" | "DIGITALE" | "REMOTA"
      forma_partecipazione:
        | "SINGOLO"
        | "RTI_COSTITUITO"
        | "RTI_COSTITUENDO"
        | "CONSORZIO_STABILE"
        | "CONSORZIO_COOPERATIVE"
        | "CONSORZIO_ARTIGIANI"
        | "AVVALIMENTO"
        | "GEIE"
      gara_chat_sender_type: "CONSORZIO" | "SOCIO" | "SISTEMA"
      gara_status:
        | "NUOVA"
        | "RICHIESTA"
        | "IN_VALUTAZIONE"
        | "FATTIBILE"
        | "NON_FATTIBILE"
        | "IN_PREPARAZIONE"
        | "INVIATA"
        | "AGGIUDICATA"
        | "PERSA"
        | "attiva"
        | "PENDING_ANALYSIS"
        | "AWAITING_OUTCOME"
        | "IN_ATTESA_CONFERME"
      insurance_type:
        | "CAUZIONE_PROVVISORIA"
        | "CAUZIONE_DEFINITIVA"
        | "POLIZZA_CAR"
        | "POLIZZA_RCT_RCO"
        | "ALTRA_POLIZZA"
      invoice_category: "ENTRATA" | "USCITA" | "SPESA"
      invoice_payment_status:
        | "DA_PAGARE"
        | "PAGATA"
        | "DA_INCASSARE"
        | "INCASSATA"
        | "SCADUTA"
        | "PARZIALE"
      message_type: "TEXT" | "FILE" | "AUDIO" | "IMAGE"
      notifica_priorita: "BASSA" | "MEDIA" | "ALTA" | "URGENTE"
      notifica_tipo:
        | "SCADENZA_DOCUMENTO"
        | "DOCUMENTO_SCADUTO"
        | "RICHIESTA_APPROVATA"
        | "RICHIESTA_RIFIUTATA"
        | "NUOVA_GARA"
        | "COPARTECIPAZIONE"
        | "TASK_ASSEGNATO"
        | "COMUNICAZIONE"
        | "SISTEMA"
      onboarding_status_enum:
        | "COMPLETO"
        | "ELABORAZIONE_IN_CORSO"
        | "WEBHOOK_INVIATO"
        | "ERRORE_WEBHOOK"
      origine_documento: "SOCIO" | "CONSORZIO"
      priorita_level: "BASSA" | "MEDIA" | "ALTA" | "CRITICA"
      richiesta_status:
        | "RICHIESTA"
        | "IN_VALUTAZIONE"
        | "APPROVATA"
        | "RIFIUTATA"
        | "FATTIBILE"
        | "NON_FATTIBILE"
        | "IN_COPARTECIPAZIONE"
      ruolo_commessa: "MANDATARIA" | "MANDANTE" | "COOPTATA"
      sender_type: "SOCIO" | "DIREZIONE" | "AMMINISTRAZIONE"
      socio_status: "ATTIVO" | "SOSPESO" | "INATTIVO" | "ARCHIVIATO"
      sopralluogo_tipo: "OBBLIGATORIO" | "FACOLTATIVO" | "NON_PREVISTO"
      sorgente_dato:
        | "ESTRAZIONE_CCIAA"
        | "ESTRAZIONE_SOA"
        | "ESTRAZIONE_IDENTITA"
        | "MANUALE"
        | "MERGE"
      stato_adesione_partner: "IN_ATTESA" | "ACCETTATA" | "RIFIUTATA"
      stato_copartecipazione:
        | "PROPOSTA"
        | "IN_ATTESA_ADESIONI"
        | "CONFERMATA"
        | "RIFIUTATA"
        | "ANNULLATA"
      stato_documento_persona:
        | "PENDING"
        | "VALIDO"
        | "SCADUTO"
        | "IN_SCADENZA"
        | "ARCHIVIATO"
        | "ERRORE_ESTRAZIONE"
      status_commessa:
        | "CREATA"
        | "POST_AGGIUDICAZIONE"
        | "IN_STIPULA"
        | "IN_ESECUZIONE"
        | "SOSPESA"
        | "PROROGATA"
        | "IN_CHIUSURA"
        | "COLLAUDO"
        | "CHIUSA"
        | "CONTENZIOSO"
        | "IN_CORSO"
        | "CONCLUSA"
      task_category:
        | "CONTRATTO"
        | "ASSICURAZIONE"
        | "SICUREZZA"
        | "DOCUMENTAZIONE"
        | "PAGAMENTO"
        | "MILESTONE"
        | "COMUNICAZIONE"
        | "ALTRO"
      task_origin:
        | "TEMPLATE"
        | "MANUALE"
        | "COMUNICAZIONE"
        | "DOCUMENTO"
        | "SISTEMA"
      task_priorita: "BASSA" | "NORMALE" | "ALTA" | "URGENTE" | "CRITICA"
      task_status:
        | "DA_FARE"
        | "IN_CORSO"
        | "IN_ATTESA"
        | "COMPLETATO"
        | "ANNULLATO"
      task_tipo: "VALUTAZIONE" | "REVISIONE" | "APPROVAZIONE" | "ALTRO"
      tipo_firma:
        | "OBBLIGATORIA"
        | "FACOLTATIVA"
        | "NON_RICHIESTA"
        | "NON_SPECIFICATA"
      tipo_osservazione_doc:
        | "CRITICITA_DOCUMENTALE"
        | "VERIFICA_IMPORTANTE"
        | "RACCOMANDAZIONE_OPERATIVA"
        | "TEMPISTICA_LUNGA"
        | "DIPENDENZA_TERZI"
        | "CONTRADDIZIONE"
        | "REQUISITO_STRINGENTE"
        | "CLAUSOLA_PNRR"
        | "ALTRO"
      tipo_rti: "ORIZZONTALE" | "VERTICALE" | "MISTO"
      tipo_scadenza: "DOCUMENTO" | "DURC"
      tipo_scadenza_gara:
        | "PUBBLICAZIONE"
        | "TERMINE_CHIARIMENTI"
        | "RISPOSTA_CHIARIMENTI"
        | "SOPRALLUOGO"
        | "SCADENZA_OFFERTA"
        | "APERTURA_AMMINISTRATIVA"
        | "APERTURA_TECNICA"
        | "APERTURA_ECONOMICA"
        | "AGGIUDICAZIONE_PROVVISORIA"
        | "AGGIUDICAZIONE_DEFINITIVA"
        | "STIPULA_CONTRATTO"
        | "CONSEGNA_GARANZIA"
        | "INIZIO_ESECUZIONE"
        | "MILESTONE"
        | "FINE_ESECUZIONE"
        | "ALTRO"
      titolo_persona:
        | "Sig."
        | "Sig.ra"
        | "Dott."
        | "Dott.ssa"
        | "Ing."
        | "Avv."
        | "Prof."
        | "Prof.ssa"
      user_role:
        | "DIREZIONE"
        | "UFFICIO_AMMINISTRATIVO"
        | "UFFICIO_GARE"
        | "SOCIO"
        | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      analysis_job_status: [
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "FAILED",
        "CANCELLED",
      ],
      assignment_flow_type: ["UPLOAD_ONLY", "SIGNED_FLOW"],
      assignment_status: ["MANCANTE", "CARICATO", "VALIDATO", "RIFIUTATO"],
      assignment_subject_type: ["CONSORZIO", "SOCIO"],
      attivita_tipo: [
        "UPLOAD_DOC",
        "RICHIESTA_GARA",
        "CAMBIO_STATUS",
        "NUOVO_SOCIO",
        "NUOVA_COMMESSA",
        "LOGIN",
        "ALTRO",
        "RICLASSIFICA_DOC",
        "AFFIANCAMENTO_SALVATO",
        "AFFIANCAMENTO_INVITI_INVIATI",
        "AFFIANCAMENTO_TRANSIZIONE_BLOCCATA",
        "AFFIANCAMENTO_TRANSIZIONE_OK",
        "COPARTECIPAZIONE_INVITO",
        "AFFIANCAMENTO_ANNULLATO",
        "VALUTAZIONE_RICHIESTA",
      ],
      busta_gara: ["A", "B", "C", "D", "E"],
      categoria_doc_gara: [
        "A1_IDENTIFICATIVI_GENERALI",
        "A2_CAPACITA_ECONOMICA",
        "A3_CAPACITA_TECNICA",
        "A4_GARANZIE_CONTRIBUTI",
        "A5_SOPRALLUOGO",
        "A6_PNRR",
        "B1_RELAZIONE_TECNICA",
        "B2_ALLEGATI_TECNICI",
        "B3_VINCOLI_TECNICI",
        "C1_OFFERTA_ECONOMICA",
        "C2_CORREDO_ECONOMICO",
        "C3_MODALITA_ECONOMICA",
        "D1_RTI_ATI",
        "D2_CONSORZI",
        "D3_AVVALIMENTO",
        "D4_SUBAPPALTO",
        "D5_GEIE",
        "E1_AGGIUNTIVA",
        "E2_POST_AGGIUDICAZIONE",
      ],
      checklist_gara_status: [
        "BOZZA_GENERATA",
        "PRONTA_PER_ASSEGNAZIONE",
        "ASSEGNATA",
        "IN_RACCOLTA",
        "COMPLETATA",
      ],
      checklist_responsabile: ["CONSORZIO", "SOCIO", "ALTRO_SOCIO"],
      checklist_status: [
        "DA_PREPARARE",
        "PREPARATO",
        "CARICATO",
        "FIRMATO",
        "INVIATO",
      ],
      comm_channel: [
        "EMAIL",
        "WHATSAPP",
        "TELEGRAM",
        "PEC",
        "TELEFONO",
        "RIUNIONE",
        "MANUALE",
      ],
      commessa_action: [
        "CREATED",
        "UPDATED",
        "STATUS_CHANGED",
        "DOCUMENT_UPLOADED",
        "DOCUMENT_DELETED",
        "TASK_CREATED",
        "TASK_COMPLETED",
        "TASK_UPDATED",
        "CONTACT_ADDED",
        "CONTACT_UPDATED",
        "COMMUNICATION_ADDED",
        "REMINDER_SENT",
        "NOTE_ADDED",
      ],
      commessa_status: ["IN_CORSO", "SOSPESA", "CONCLUSA"],
      contact_role: [
        "RUP",
        "DIRETTORE_LAVORI",
        "REFERENTE_CONSORZIATA",
        "CAPOCANTIERE",
        "COORDINATORE_SICUREZZA",
        "ALTRO",
      ],
      context_type: [
        "GARA",
        "COMMESSA",
        "DOCUMENTO",
        "RICHIESTA_GARA",
        "RICHIESTA_LIBERA",
      ],
      criterio_aggiudicazione: [
        "OEPV",
        "PREZZO_PIU_BASSO",
        "COSTO_FISSO",
        "ALTRO",
      ],
      deadline_status: [
        "VALIDO",
        "IN_SCADENZA",
        "SCADUTO",
        "RINNOVATO",
        "NON_APPLICABILE",
      ],
      digital_resource_type: [
        "MODELLO_BIM",
        "ISSUE_TRACKER",
        "ACDAT",
        "REVISIONE",
        "REPOSITORY",
        "CLOUD_STORAGE",
        "ALTRO",
      ],
      doc_commessa_category: [
        "CONTRATTO_LEGALE",
        "ASSICURAZIONE",
        "SICUREZZA_PERSONALE",
        "TECNICO",
        "CONTABILE",
        "CORRISPONDENZA",
        "ALTRO",
      ],
      doc_lavoratore_type: [
        "ATTESTATO_CORSO_SICUREZZA",
        "ATTESTATO_CORSO_PRIMO_SOCCORSO",
        "ATTESTATO_CORSO_ANTINCENDIO",
        "ATTESTATO_CORSO_SPECIFICO",
        "VISITA_MEDICA",
        "IDONEITA_MANSIONE",
        "CONSEGNA_DPI",
        "DOCUMENTO_IDENTITA",
        "UNILAV",
        "ALTRO",
      ],
      documento_categoria: ["QUALIFICA", "GARA", "COMMESSA", "CONSORZIO"],
      documento_status: [
        "VALIDO",
        "IN_SCADENZA",
        "SCADUTO",
        "MANCANTE",
        "IN_SOSTITUZIONE",
        "SUPERATO",
        "PENDING_DATA",
        "ERROR",
      ],
      drive_provider: ["GOOGLE_DRIVE", "ONEDRIVE", "NONE"],
      entity_type: [
        "SOCIO",
        "GARA",
        "COMMESSA",
        "CONSORZIO",
        "GARA_CONSORZIO",
        "COPARTECIPAZIONE",
      ],
      evento_tipo: [
        "SCADENZA_DOC",
        "SCADENZA_GARA",
        "SOPRALLUOGO",
        "RIUNIONE",
        "ASSEMBLEA",
        "CONSEGNA_LAVORI",
        "ALTRO",
      ],
      fase_gara: [
        "PRE_GARA",
        "OFFERTA",
        "VALUTAZIONE",
        "POST_GARA",
        "CONTRATTO",
        "ESECUZIONE",
      ],
      firma_digitale_tipo: ["GRAFOMETRICA", "DIGITALE", "REMOTA"],
      forma_partecipazione: [
        "SINGOLO",
        "RTI_COSTITUITO",
        "RTI_COSTITUENDO",
        "CONSORZIO_STABILE",
        "CONSORZIO_COOPERATIVE",
        "CONSORZIO_ARTIGIANI",
        "AVVALIMENTO",
        "GEIE",
      ],
      gara_chat_sender_type: ["CONSORZIO", "SOCIO", "SISTEMA"],
      gara_status: [
        "NUOVA",
        "RICHIESTA",
        "IN_VALUTAZIONE",
        "FATTIBILE",
        "NON_FATTIBILE",
        "IN_PREPARAZIONE",
        "INVIATA",
        "AGGIUDICATA",
        "PERSA",
        "attiva",
        "PENDING_ANALYSIS",
        "AWAITING_OUTCOME",
        "IN_ATTESA_CONFERME",
      ],
      insurance_type: [
        "CAUZIONE_PROVVISORIA",
        "CAUZIONE_DEFINITIVA",
        "POLIZZA_CAR",
        "POLIZZA_RCT_RCO",
        "ALTRA_POLIZZA",
      ],
      invoice_category: ["ENTRATA", "USCITA", "SPESA"],
      invoice_payment_status: [
        "DA_PAGARE",
        "PAGATA",
        "DA_INCASSARE",
        "INCASSATA",
        "SCADUTA",
        "PARZIALE",
      ],
      message_type: ["TEXT", "FILE", "AUDIO", "IMAGE"],
      notifica_priorita: ["BASSA", "MEDIA", "ALTA", "URGENTE"],
      notifica_tipo: [
        "SCADENZA_DOCUMENTO",
        "DOCUMENTO_SCADUTO",
        "RICHIESTA_APPROVATA",
        "RICHIESTA_RIFIUTATA",
        "NUOVA_GARA",
        "COPARTECIPAZIONE",
        "TASK_ASSEGNATO",
        "COMUNICAZIONE",
        "SISTEMA",
      ],
      onboarding_status_enum: [
        "COMPLETO",
        "ELABORAZIONE_IN_CORSO",
        "WEBHOOK_INVIATO",
        "ERRORE_WEBHOOK",
      ],
      origine_documento: ["SOCIO", "CONSORZIO"],
      priorita_level: ["BASSA", "MEDIA", "ALTA", "CRITICA"],
      richiesta_status: [
        "RICHIESTA",
        "IN_VALUTAZIONE",
        "APPROVATA",
        "RIFIUTATA",
        "FATTIBILE",
        "NON_FATTIBILE",
        "IN_COPARTECIPAZIONE",
      ],
      ruolo_commessa: ["MANDATARIA", "MANDANTE", "COOPTATA"],
      sender_type: ["SOCIO", "DIREZIONE", "AMMINISTRAZIONE"],
      socio_status: ["ATTIVO", "SOSPESO", "INATTIVO", "ARCHIVIATO"],
      sopralluogo_tipo: ["OBBLIGATORIO", "FACOLTATIVO", "NON_PREVISTO"],
      sorgente_dato: [
        "ESTRAZIONE_CCIAA",
        "ESTRAZIONE_SOA",
        "ESTRAZIONE_IDENTITA",
        "MANUALE",
        "MERGE",
      ],
      stato_adesione_partner: ["IN_ATTESA", "ACCETTATA", "RIFIUTATA"],
      stato_copartecipazione: [
        "PROPOSTA",
        "IN_ATTESA_ADESIONI",
        "CONFERMATA",
        "RIFIUTATA",
        "ANNULLATA",
      ],
      stato_documento_persona: [
        "PENDING",
        "VALIDO",
        "SCADUTO",
        "IN_SCADENZA",
        "ARCHIVIATO",
        "ERRORE_ESTRAZIONE",
      ],
      status_commessa: [
        "CREATA",
        "POST_AGGIUDICAZIONE",
        "IN_STIPULA",
        "IN_ESECUZIONE",
        "SOSPESA",
        "PROROGATA",
        "IN_CHIUSURA",
        "COLLAUDO",
        "CHIUSA",
        "CONTENZIOSO",
        "IN_CORSO",
        "CONCLUSA",
      ],
      task_category: [
        "CONTRATTO",
        "ASSICURAZIONE",
        "SICUREZZA",
        "DOCUMENTAZIONE",
        "PAGAMENTO",
        "MILESTONE",
        "COMUNICAZIONE",
        "ALTRO",
      ],
      task_origin: [
        "TEMPLATE",
        "MANUALE",
        "COMUNICAZIONE",
        "DOCUMENTO",
        "SISTEMA",
      ],
      task_priorita: ["BASSA", "NORMALE", "ALTA", "URGENTE", "CRITICA"],
      task_status: [
        "DA_FARE",
        "IN_CORSO",
        "IN_ATTESA",
        "COMPLETATO",
        "ANNULLATO",
      ],
      task_tipo: ["VALUTAZIONE", "REVISIONE", "APPROVAZIONE", "ALTRO"],
      tipo_firma: [
        "OBBLIGATORIA",
        "FACOLTATIVA",
        "NON_RICHIESTA",
        "NON_SPECIFICATA",
      ],
      tipo_osservazione_doc: [
        "CRITICITA_DOCUMENTALE",
        "VERIFICA_IMPORTANTE",
        "RACCOMANDAZIONE_OPERATIVA",
        "TEMPISTICA_LUNGA",
        "DIPENDENZA_TERZI",
        "CONTRADDIZIONE",
        "REQUISITO_STRINGENTE",
        "CLAUSOLA_PNRR",
        "ALTRO",
      ],
      tipo_rti: ["ORIZZONTALE", "VERTICALE", "MISTO"],
      tipo_scadenza: ["DOCUMENTO", "DURC"],
      tipo_scadenza_gara: [
        "PUBBLICAZIONE",
        "TERMINE_CHIARIMENTI",
        "RISPOSTA_CHIARIMENTI",
        "SOPRALLUOGO",
        "SCADENZA_OFFERTA",
        "APERTURA_AMMINISTRATIVA",
        "APERTURA_TECNICA",
        "APERTURA_ECONOMICA",
        "AGGIUDICAZIONE_PROVVISORIA",
        "AGGIUDICAZIONE_DEFINITIVA",
        "STIPULA_CONTRATTO",
        "CONSEGNA_GARANZIA",
        "INIZIO_ESECUZIONE",
        "MILESTONE",
        "FINE_ESECUZIONE",
        "ALTRO",
      ],
      titolo_persona: [
        "Sig.",
        "Sig.ra",
        "Dott.",
        "Dott.ssa",
        "Ing.",
        "Avv.",
        "Prof.",
        "Prof.ssa",
      ],
      user_role: [
        "DIREZIONE",
        "UFFICIO_AMMINISTRATIVO",
        "UFFICIO_GARE",
        "SOCIO",
        "ADMIN",
      ],
    },
  },
} as const
