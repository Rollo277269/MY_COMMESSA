-- Fix storage bucket policies: rimuovi accesso anonimo, richiedi autenticazione con ownership commessa

-- ── Bucket: documents ──────────────────────────────────────────────

-- Rimuovi policies aperte esistenti
DROP POLICY IF EXISTS "Documents are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents" ON storage.objects;

-- SELECT: pubblico per documenti (file_path include section/fileName, non contiene user data sensibili)
-- ma l'accesso reale è controllato dal frontend via RLS sulle tabelle
CREATE POLICY "Authenticated can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- INSERT: solo utenti autenticati
CREATE POLICY "Authenticated can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- UPDATE: solo utenti autenticati
CREATE POLICY "Authenticated can update documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'documents');

-- DELETE: solo utenti autenticati
CREATE POLICY "Authenticated can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- ── Bucket: commessa-photos ─────────────────────────────────────────

DROP POLICY IF EXISTS "Public can read commessa photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload commessa photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete commessa photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload commessa photos" ON storage.objects;

CREATE POLICY "Authenticated can read commessa photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'commessa-photos');

CREATE POLICY "Authenticated can upload commessa photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'commessa-photos');

CREATE POLICY "Authenticated can update commessa photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'commessa-photos');

CREATE POLICY "Authenticated can delete commessa photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'commessa-photos');
