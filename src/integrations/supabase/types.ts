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
      aziende: {
        Row: {
          cap: string | null
          citta: string | null
          codice_fiscale: string | null
          commessa_id: string | null
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
          codice_fiscale?: string | null
          commessa_id?: string | null
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
          codice_fiscale?: string | null
          commessa_id?: string | null
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
            foreignKeyName: "aziende_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      centri_imputazione: {
        Row: {
          commessa_id: string | null
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
          commessa_id?: string | null
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
          commessa_id?: string | null
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
            foreignKeyName: "centri_imputazione_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_documenti: {
        Row: {
          commessa_id: string | null
          created_at: string
          id: string
          indispensabile: boolean
          nome: string
          sezione: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          commessa_id?: string | null
          created_at?: string
          id?: string
          indispensabile?: boolean
          nome: string
          sezione?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          commessa_id?: string | null
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
            foreignKeyName: "checklist_documenti_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      cme_rows: {
        Row: {
          categoria: string | null
          codice: string | null
          commessa_id: string | null
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
          codice?: string | null
          commessa_id?: string | null
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
          codice?: string | null
          commessa_id?: string | null
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
            foreignKeyName: "cme_rows_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      commessa_data: {
        Row: {
          aggio_consorzio: number | null
          ambiente_analisi: Json | null
          cig: string | null
          cig_derivato: string | null
          commessa_consortile: string | null
          committente: string | null
          costo_manodopera: string | null
          created_at: string
          cup: string | null
          data_consegna_lavori: string | null
          data_contratto: string | null
          data_scadenza_contratto: string | null
          direttore_lavori: string | null
          durata_contrattuale: string | null
          foto_url: string | null
          id: string
          importo_base_gara: string | null
          importo_contrattuale: string | null
          impresa_assegnataria: string | null
          numero_repertorio: string | null
          oggetto_lavori: string | null
          oneri_sicurezza: string | null
          project_summary: string | null
          project_summary_doc_ids: string[] | null
          quota_servizi_tecnici: number | null
          ribasso: string | null
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
          committente?: string | null
          costo_manodopera?: string | null
          created_at?: string
          cup?: string | null
          data_consegna_lavori?: string | null
          data_contratto?: string | null
          data_scadenza_contratto?: string | null
          direttore_lavori?: string | null
          durata_contrattuale?: string | null
          foto_url?: string | null
          id?: string
          importo_base_gara?: string | null
          importo_contrattuale?: string | null
          impresa_assegnataria?: string | null
          numero_repertorio?: string | null
          oggetto_lavori?: string | null
          oneri_sicurezza?: string | null
          project_summary?: string | null
          project_summary_doc_ids?: string[] | null
          quota_servizi_tecnici?: number | null
          ribasso?: string | null
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
          committente?: string | null
          costo_manodopera?: string | null
          created_at?: string
          cup?: string | null
          data_consegna_lavori?: string | null
          data_contratto?: string | null
          data_scadenza_contratto?: string | null
          direttore_lavori?: string | null
          durata_contrattuale?: string | null
          foto_url?: string | null
          id?: string
          importo_base_gara?: string | null
          importo_contrattuale?: string | null
          impresa_assegnataria?: string | null
          numero_repertorio?: string | null
          oggetto_lavori?: string | null
          oneri_sicurezza?: string | null
          project_summary?: string | null
          project_summary_doc_ids?: string[] | null
          quota_servizi_tecnici?: number | null
          ribasso?: string | null
          riferimenti_pnrr?: string | null
          rup?: string | null
          stato?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cronoprogramma_phases: {
        Row: {
          cme_row_ids: string[] | null
          color: string | null
          commessa_id: string | null
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
          cme_row_ids?: string[] | null
          color?: string | null
          commessa_id?: string | null
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
          cme_row_ids?: string[] | null
          color?: string | null
          commessa_id?: string | null
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
            foreignKeyName: "cronoprogramma_phases_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronoprogramma_phases_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cronoprogramma_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          ai_extracted_data: Json | null
          ai_status: string | null
          ai_summary: string | null
          commessa_id: string | null
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
          commessa_id?: string | null
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
          commessa_id?: string | null
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
            foreignKeyName: "documents_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      eventi_commessa: {
        Row: {
          commessa_id: string | null
          created_at: string
          data_evento: string
          descrizione: string | null
          destinatario: string | null
          document_id: string | null
          id: string
          mezzo: string | null
          mittente: string | null
          protocollo: string | null
          tipo: string
          titolo: string
          updated_at: string
        }
        Insert: {
          commessa_id?: string | null
          created_at?: string
          data_evento?: string
          descrizione?: string | null
          destinatario?: string | null
          document_id?: string | null
          id?: string
          mezzo?: string | null
          mittente?: string | null
          protocollo?: string | null
          tipo?: string
          titolo: string
          updated_at?: string
        }
        Update: {
          commessa_id?: string | null
          created_at?: string
          data_evento?: string
          descrizione?: string | null
          destinatario?: string | null
          document_id?: string | null
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
            foreignKeyName: "eventi_commessa_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventi_commessa_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      fatture: {
        Row: {
          aliquota_iva: number
          centro_auto_assigned: boolean
          centro_imputazione_id: string | null
          cig: string | null
          codice_sdi: string | null
          commessa_id: string | null
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
          centro_imputazione_id?: string | null
          cig?: string | null
          codice_sdi?: string | null
          commessa_id?: string | null
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
          centro_imputazione_id?: string | null
          cig?: string | null
          codice_sdi?: string | null
          commessa_id?: string | null
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
            foreignKeyName: "fatture_centro_imputazione_id_fkey"
            columns: ["centro_imputazione_id"]
            isOneToOne: false
            referencedRelation: "centri_imputazione"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatture_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      ordini_acquisto: {
        Row: {
          commessa_id: string | null
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
          commessa_id?: string | null
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
          commessa_id?: string | null
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
            foreignKeyName: "ordini_acquisto_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      pdq_documents: {
        Row: {
          commessa_id: string
          created_at: string
          id: string
          revision: number
          sections: Json
          updated_at: string
        }
        Insert: {
          commessa_id: string
          created_at?: string
          id?: string
          revision?: number
          sections?: Json
          updated_at?: string
        }
        Update: {
          commessa_id?: string
          created_at?: string
          id?: string
          revision?: number
          sections?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdq_documents_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          azienda: string | null
          cellulare: string | null
          commessa_id: string | null
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
          commessa_id?: string | null
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
          commessa_id?: string | null
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
            foreignKeyName: "persons_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      proroghe: {
        Row: {
          commessa_id: string | null
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
          commessa_id?: string | null
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
          commessa_id?: string | null
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
            foreignKeyName: "proroghe_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      rita_audit_log: {
        Row: {
          action: string
          commessa_id: string | null
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
          commessa_id?: string | null
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
          commessa_id?: string | null
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
            foreignKeyName: "rita_audit_log_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      scadenze: {
        Row: {
          commessa_id: string | null
          compagnia: string | null
          costo: number | null
          created_at: string
          data_emissione: string | null
          data_scadenza: string
          descrizione: string | null
          document_id: string | null
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
          commessa_id?: string | null
          compagnia?: string | null
          costo?: number | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza: string
          descrizione?: string | null
          document_id?: string | null
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
          commessa_id?: string | null
          compagnia?: string | null
          costo?: number | null
          created_at?: string
          data_emissione?: string | null
          data_scadenza?: string
          descrizione?: string | null
          document_id?: string | null
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
            foreignKeyName: "scadenze_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scadenze_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      subappaltatore_checklist: {
        Row: {
          completato: boolean
          created_at: string
          document_id: string | null
          id: string
          note: string | null
          sort_order: number
          subappaltatore_id: string
          updated_at: string
          voce: string
        }
        Insert: {
          completato?: boolean
          created_at?: string
          document_id?: string | null
          id?: string
          note?: string | null
          sort_order?: number
          subappaltatore_id: string
          updated_at?: string
          voce: string
        }
        Update: {
          completato?: boolean
          created_at?: string
          document_id?: string | null
          id?: string
          note?: string | null
          sort_order?: number
          subappaltatore_id?: string
          updated_at?: string
          voce?: string
        }
        Relationships: [
          {
            foreignKeyName: "subappaltatore_checklist_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subappaltatore_checklist_subappaltatore_id_fkey"
            columns: ["subappaltatore_id"]
            isOneToOne: false
            referencedRelation: "subappaltatori"
            referencedColumns: ["id"]
          },
        ]
      }
      subappaltatori: {
        Row: {
          codice_fiscale: string | null
          commessa_id: string | null
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
          codice_fiscale?: string | null
          commessa_id?: string | null
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
          codice_fiscale?: string | null
          commessa_id?: string | null
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
            foreignKeyName: "subappaltatori_commessa_id_fkey"
            columns: ["commessa_id"]
            isOneToOne: false
            referencedRelation: "commessa_data"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
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
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
