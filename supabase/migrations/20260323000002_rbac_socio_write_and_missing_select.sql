-- Migrazione: Aggiungere policy SOCIO write + _socio_select mancanti
--
-- Problema 1: SOCIO non ha policy INSERT/UPDATE/DELETE → non può creare né modificare
--             le proprie commesse e i dati collegati.
-- Problema 2: Alcune tabelle child hanno solo _internal_all senza _socio_select →
--             SOCIO non può leggere fatture, ordini, proroghe, ecc. della propria commessa.
--
-- Convenzione: per le tabelle child la FK verso cm_commessa_data è sempre cm_commessa_id.

-- ════════════════════════════════════════════════════════════════════════════════
-- PARTE A: _socio_select mancanti (tabelle child prive di accesso lettura per SOCIO)
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "cm_centri_imputazione_socio_select"
  ON public.cm_centri_imputazione FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_checklist_documenti_socio_select"
  ON public.cm_checklist_documenti FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_eventi_commessa_socio_select"
  ON public.cm_eventi_commessa FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_fatture_socio_select"
  ON public.cm_fatture FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_ordini_acquisto_socio_select"
  ON public.cm_ordini_acquisto FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_pdq_documents_socio_select"
  ON public.cm_pdq_documents FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_proroghe_socio_select"
  ON public.cm_proroghe FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_subappaltatori_socio_select"
  ON public.cm_subappaltatori FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

-- cm_subappaltatore_checklist: FK indiretta via subappaltatore_id
CREATE POLICY "cm_subappaltatore_checklist_socio_select"
  ON public.cm_subappaltatore_checklist FOR SELECT TO authenticated
  USING (
    (cm_subappaltatore_id IN (
      SELECT s.id FROM public.cm_subappaltatori s
      JOIN public.cm_commessa_data c ON s.cm_commessa_id = c.id
      WHERE c.user_id = auth.uid()
    ))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

-- cm_rita_audit_log: SOCIO può leggere i log della propria commessa
CREATE POLICY "cm_rita_audit_log_socio_select"
  ON public.cm_rita_audit_log FOR SELECT TO authenticated
  USING (
    (cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid()))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

-- ════════════════════════════════════════════════════════════════════════════════
-- PARTE B: policy write SOCIO per cm_commessa_data
-- ════════════════════════════════════════════════════════════════════════════════

CREATE POLICY "cm_commessa_data_socio_insert"
  ON public.cm_commessa_data FOR INSERT TO authenticated
  WITH CHECK (
    (user_id = auth.uid())
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_commessa_data_socio_update"
  ON public.cm_commessa_data FOR UPDATE TO authenticated
  USING (
    (user_id = auth.uid())
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  )
  WITH CHECK (
    (user_id = auth.uid())
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

CREATE POLICY "cm_commessa_data_socio_delete"
  ON public.cm_commessa_data FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid())
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

-- ════════════════════════════════════════════════════════════════════════════════
-- PARTE C: policy write SOCIO per tabelle child (cm_commessa_id FK)
-- Tutte le tabelle seguono lo stesso pattern.
-- ════════════════════════════════════════════════════════════════════════════════

-- Helper macro inline: SOCIO write condition per tabelle child
-- USING/WITH CHECK: cm_commessa_id appartiene a una commessa propria + ruolo SOCIO

-- cm_aziende
CREATE POLICY "cm_aziende_socio_insert" ON public.cm_aziende FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_aziende_socio_update" ON public.cm_aziende FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_aziende_socio_delete" ON public.cm_aziende FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_centri_imputazione
CREATE POLICY "cm_centri_imputazione_socio_insert" ON public.cm_centri_imputazione FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_centri_imputazione_socio_update" ON public.cm_centri_imputazione FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_centri_imputazione_socio_delete" ON public.cm_centri_imputazione FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_checklist_documenti
CREATE POLICY "cm_checklist_documenti_socio_insert" ON public.cm_checklist_documenti FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_checklist_documenti_socio_update" ON public.cm_checklist_documenti FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_checklist_documenti_socio_delete" ON public.cm_checklist_documenti FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_cme_rows
CREATE POLICY "cm_cme_rows_socio_insert" ON public.cm_cme_rows FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_cme_rows_socio_update" ON public.cm_cme_rows FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_cme_rows_socio_delete" ON public.cm_cme_rows FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_cronoprogramma_phases
CREATE POLICY "cm_cronoprogramma_phases_socio_insert" ON public.cm_cronoprogramma_phases FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_cronoprogramma_phases_socio_update" ON public.cm_cronoprogramma_phases FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_cronoprogramma_phases_socio_delete" ON public.cm_cronoprogramma_phases FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_documents
CREATE POLICY "cm_documents_socio_insert" ON public.cm_documents FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_documents_socio_update" ON public.cm_documents FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_documents_socio_delete" ON public.cm_documents FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_eventi_commessa
CREATE POLICY "cm_eventi_commessa_socio_insert" ON public.cm_eventi_commessa FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_eventi_commessa_socio_update" ON public.cm_eventi_commessa FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_eventi_commessa_socio_delete" ON public.cm_eventi_commessa FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_fatture
CREATE POLICY "cm_fatture_socio_insert" ON public.cm_fatture FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_fatture_socio_update" ON public.cm_fatture FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_fatture_socio_delete" ON public.cm_fatture FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_ordini_acquisto
CREATE POLICY "cm_ordini_acquisto_socio_insert" ON public.cm_ordini_acquisto FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_ordini_acquisto_socio_update" ON public.cm_ordini_acquisto FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_ordini_acquisto_socio_delete" ON public.cm_ordini_acquisto FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_pdq_documents
CREATE POLICY "cm_pdq_documents_socio_insert" ON public.cm_pdq_documents FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_pdq_documents_socio_update" ON public.cm_pdq_documents FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_pdq_documents_socio_delete" ON public.cm_pdq_documents FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_persons
CREATE POLICY "cm_persons_socio_insert" ON public.cm_persons FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_persons_socio_update" ON public.cm_persons FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_persons_socio_delete" ON public.cm_persons FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_proroghe
CREATE POLICY "cm_proroghe_socio_insert" ON public.cm_proroghe FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_proroghe_socio_update" ON public.cm_proroghe FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_proroghe_socio_delete" ON public.cm_proroghe FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_scadenze
CREATE POLICY "cm_scadenze_socio_insert" ON public.cm_scadenze FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_scadenze_socio_update" ON public.cm_scadenze FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_scadenze_socio_delete" ON public.cm_scadenze FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_subappaltatori
CREATE POLICY "cm_subappaltatori_socio_insert" ON public.cm_subappaltatori FOR INSERT TO authenticated
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_subappaltatori_socio_update" ON public.cm_subappaltatori FOR UPDATE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')))
  WITH CHECK ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));
CREATE POLICY "cm_subappaltatori_socio_delete" ON public.cm_subappaltatori FOR DELETE TO authenticated
  USING ((cm_commessa_id IN (SELECT id FROM public.cm_commessa_data WHERE user_id = auth.uid())) AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO')));

-- cm_subappaltatore_checklist (FK indiretta via subappaltatore_id)
CREATE POLICY "cm_subappaltatore_checklist_socio_insert" ON public.cm_subappaltatore_checklist FOR INSERT TO authenticated
  WITH CHECK (
    (cm_subappaltatore_id IN (
      SELECT s.id FROM public.cm_subappaltatori s
      JOIN public.cm_commessa_data c ON s.cm_commessa_id = c.id
      WHERE c.user_id = auth.uid()
    ))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );
CREATE POLICY "cm_subappaltatore_checklist_socio_update" ON public.cm_subappaltatore_checklist FOR UPDATE TO authenticated
  USING (
    (cm_subappaltatore_id IN (
      SELECT s.id FROM public.cm_subappaltatori s
      JOIN public.cm_commessa_data c ON s.cm_commessa_id = c.id
      WHERE c.user_id = auth.uid()
    ))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  )
  WITH CHECK (
    (cm_subappaltatore_id IN (
      SELECT s.id FROM public.cm_subappaltatori s
      JOIN public.cm_commessa_data c ON s.cm_commessa_id = c.id
      WHERE c.user_id = auth.uid()
    ))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );
CREATE POLICY "cm_subappaltatore_checklist_socio_delete" ON public.cm_subappaltatore_checklist FOR DELETE TO authenticated
  USING (
    (cm_subappaltatore_id IN (
      SELECT s.id FROM public.cm_subappaltatori s
      JOIN public.cm_commessa_data c ON s.cm_commessa_id = c.id
      WHERE c.user_id = auth.uid()
    ))
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND ruolo = 'SOCIO'))
  );

-- cm_rita_audit_log: INSERT già coperta dalla policy "cm_rita_audit_log_insert" (migrazione 1).
-- Nessuna policy aggiuntiva necessaria per SOCIO su questa tabella.
