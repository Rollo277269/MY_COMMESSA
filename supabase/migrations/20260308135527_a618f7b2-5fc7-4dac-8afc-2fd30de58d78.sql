
-- Drop the unique constraint on commessa_id to allow multiple revisions
ALTER TABLE public.pdq_documents DROP CONSTRAINT IF EXISTS pdq_documents_commessa_id_key;

-- Add a unique constraint on commessa_id + revision instead
ALTER TABLE public.pdq_documents ADD CONSTRAINT pdq_documents_commessa_revision_unique UNIQUE (commessa_id, revision);
