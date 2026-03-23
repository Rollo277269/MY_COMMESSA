-- Migrazione: Fix policy _internal_all per includere ADMIN
-- Problema: tutte le policy _internal_all usano un array manuale che esclude ADMIN.
-- Soluzione: rimpiazzare con is_internal_user() che include già ADMIN.
-- La funzione is_internal_user() è SECURITY DEFINER ed è già nel DB.

-- ── cm_commessa_data ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_commessa_data_internal_all" ON public.cm_commessa_data;
CREATE POLICY "cm_commessa_data_internal_all"
  ON public.cm_commessa_data FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_aziende ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_aziende_internal_all" ON public.cm_aziende;
CREATE POLICY "cm_aziende_internal_all"
  ON public.cm_aziende FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_centri_imputazione ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_centri_imputazione_internal_all" ON public.cm_centri_imputazione;
CREATE POLICY "cm_centri_imputazione_internal_all"
  ON public.cm_centri_imputazione FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_checklist_documenti ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_checklist_documenti_internal_all" ON public.cm_checklist_documenti;
CREATE POLICY "cm_checklist_documenti_internal_all"
  ON public.cm_checklist_documenti FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_cme_rows ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_cme_rows_internal_all" ON public.cm_cme_rows;
CREATE POLICY "cm_cme_rows_internal_all"
  ON public.cm_cme_rows FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_cronoprogramma_phases ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_cronoprogramma_phases_internal_all" ON public.cm_cronoprogramma_phases;
CREATE POLICY "cm_cronoprogramma_phases_internal_all"
  ON public.cm_cronoprogramma_phases FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_documents ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_documents_internal_all" ON public.cm_documents;
CREATE POLICY "cm_documents_internal_all"
  ON public.cm_documents FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_eventi_commessa ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_eventi_commessa_internal_all" ON public.cm_eventi_commessa;
CREATE POLICY "cm_eventi_commessa_internal_all"
  ON public.cm_eventi_commessa FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_fatture ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_fatture_internal_all" ON public.cm_fatture;
CREATE POLICY "cm_fatture_internal_all"
  ON public.cm_fatture FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_ordini_acquisto ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_ordini_acquisto_internal_all" ON public.cm_ordini_acquisto;
CREATE POLICY "cm_ordini_acquisto_internal_all"
  ON public.cm_ordini_acquisto FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_pdq_documents ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_pdq_documents_internal_all" ON public.cm_pdq_documents;
CREATE POLICY "cm_pdq_documents_internal_all"
  ON public.cm_pdq_documents FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_persons ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_persons_internal_all" ON public.cm_persons;
CREATE POLICY "cm_persons_internal_all"
  ON public.cm_persons FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_proroghe ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_proroghe_internal_all" ON public.cm_proroghe;
CREATE POLICY "cm_proroghe_internal_all"
  ON public.cm_proroghe FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_scadenze ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_scadenze_internal_all" ON public.cm_scadenze;
CREATE POLICY "cm_scadenze_internal_all"
  ON public.cm_scadenze FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_subappaltatori ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_subappaltatori_internal_all" ON public.cm_subappaltatori;
CREATE POLICY "cm_subappaltatori_internal_all"
  ON public.cm_subappaltatori FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_subappaltatore_checklist ───────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_subappaltatore_checklist_internal_all" ON public.cm_subappaltatore_checklist;
CREATE POLICY "cm_subappaltatore_checklist_internal_all"
  ON public.cm_subappaltatore_checklist FOR ALL TO authenticated
  USING (public.is_internal_user())
  WITH CHECK (public.is_internal_user());

-- ── cm_rita_audit_log ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cm_rita_audit_log_internal_select" ON public.cm_rita_audit_log;
CREATE POLICY "cm_rita_audit_log_internal_select"
  ON public.cm_rita_audit_log FOR SELECT TO authenticated
  USING (public.is_internal_user());

-- Fix INSERT: aggiungere ADMIN (policy esistente mancava ADMIN)
DROP POLICY IF EXISTS "cm_rita_audit_log_insert" ON public.cm_rita_audit_log;
CREATE POLICY "cm_rita_audit_log_insert"
  ON public.cm_rita_audit_log FOR INSERT TO authenticated
  WITH CHECK (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    OR public.is_internal_user()
  );
