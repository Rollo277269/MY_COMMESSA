-- Fix S03: Storage bucket policies con ownership check per DELETE
-- INSERT e SELECT rimangono authenticated-only (path non contiene commessaId)
-- DELETE aggiunge verifica ownership tramite tabella documents

-- ── Bucket: documents ──────────────────────────────────────────────

-- Rimuovi policy DELETE esistente senza ownership
DROP POLICY IF EXISTS "Authenticated can delete documents" ON storage.objects;

-- DELETE: solo se il documento esiste nel DB e appartiene all'utente
CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.documents d
      JOIN public.commessa_data c ON c.id = d.commessa_id
      WHERE d.file_path = storage.objects.name
        AND c.user_id = auth.uid()
    )
  );

-- ── Bucket: commessa-photos ─────────────────────────────────────────

-- Rimuovi policy DELETE esistente senza ownership
DROP POLICY IF EXISTS "Authenticated can delete commessa photos" ON storage.objects;

-- DELETE foto: solo se la commessa appartiene all'utente
-- Il path è salvato in commessa_data.foto_url — confronto tramite name
CREATE POLICY "Users can delete own commessa photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'commessa-photos'
    AND EXISTS (
      SELECT 1
      FROM public.commessa_data c
      WHERE c.foto_url LIKE '%' || storage.objects.name
        AND c.user_id = auth.uid()
    )
  );
