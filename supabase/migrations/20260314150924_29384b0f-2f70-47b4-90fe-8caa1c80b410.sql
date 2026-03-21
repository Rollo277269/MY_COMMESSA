
ALTER TABLE public.commessa_data
  ADD COLUMN IF NOT EXISTS project_summary text,
  ADD COLUMN IF NOT EXISTS project_summary_doc_ids uuid[] DEFAULT '{}'::uuid[];
