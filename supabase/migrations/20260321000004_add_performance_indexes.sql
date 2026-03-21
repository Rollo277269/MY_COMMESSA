-- [ST01] Indici per RLS policies con subquery su commessa_data(user_id)
-- Senza questi indici ogni SELECT su tabelle con RLS esegue full scan su commessa_data.
-- Pattern RLS usato ovunque: commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid())

-- Indice principale per RLS: user_id su commessa_data
CREATE INDEX IF NOT EXISTS idx_commessa_data_user_id
  ON public.commessa_data(user_id);

-- Indici su commessa_id per tutte le tabelle che usano RLS con subquery
CREATE INDEX IF NOT EXISTS idx_documents_commessa_id
  ON public.documents(commessa_id);

CREATE INDEX IF NOT EXISTS idx_persons_commessa_id
  ON public.persons(commessa_id);

CREATE INDEX IF NOT EXISTS idx_aziende_commessa_id
  ON public.aziende(commessa_id);

CREATE INDEX IF NOT EXISTS idx_cme_rows_commessa_id
  ON public.cme_rows(commessa_id);

CREATE INDEX IF NOT EXISTS idx_cronoprogramma_phases_commessa_id
  ON public.cronoprogramma_phases(commessa_id);

CREATE INDEX IF NOT EXISTS idx_proroghe_commessa_id
  ON public.proroghe(commessa_id);

CREATE INDEX IF NOT EXISTS idx_fatture_commessa_id
  ON public.fatture(commessa_id);

CREATE INDEX IF NOT EXISTS idx_centri_imputazione_commessa_id
  ON public.centri_imputazione(commessa_id);

CREATE INDEX IF NOT EXISTS idx_scadenze_commessa_id
  ON public.scadenze(commessa_id);

CREATE INDEX IF NOT EXISTS idx_ordini_acquisto_commessa_id
  ON public.ordini_acquisto(commessa_id);

CREATE INDEX IF NOT EXISTS idx_pdq_documents_commessa_id
  ON public.pdq_documents(commessa_id);

CREATE INDEX IF NOT EXISTS idx_subappaltatori_commessa_id
  ON public.subappaltatori(commessa_id);

CREATE INDEX IF NOT EXISTS idx_checklist_documenti_commessa_id
  ON public.checklist_documenti(commessa_id);

CREATE INDEX IF NOT EXISTS idx_eventi_commessa_commessa_id
  ON public.eventi_commessa(commessa_id);

-- Indice per query frequenti su ai_status (cleanup + frontend polling)
CREATE INDEX IF NOT EXISTS idx_documents_ai_status
  ON public.documents(ai_status)
  WHERE ai_status IN ('processing', 'error', 'pending');

-- Indice per il cron check-scadenze (filtra per notificato_email e data_scadenza)
CREATE INDEX IF NOT EXISTS idx_scadenze_notifica
  ON public.scadenze(notificato_email, data_scadenza)
  WHERE notificato_email = false;

-- Indice per user_roles (lookup frequente per has_role function)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
  ON public.user_roles(user_id);
