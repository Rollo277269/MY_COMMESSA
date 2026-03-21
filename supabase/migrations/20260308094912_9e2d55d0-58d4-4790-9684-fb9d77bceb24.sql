
CREATE TABLE public.pdq_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (commessa_id)
);

ALTER TABLE public.pdq_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pdq" ON public.pdq_documents
  FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own pdq" ON public.pdq_documents
  FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own pdq" ON public.pdq_documents
  FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own pdq" ON public.pdq_documents
  FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE TRIGGER update_pdq_documents_updated_at
  BEFORE UPDATE ON public.pdq_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
