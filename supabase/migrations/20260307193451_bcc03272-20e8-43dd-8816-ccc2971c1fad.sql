
CREATE TABLE public.aziende (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text DEFAULT 'fornitore',
  partita_iva text,
  codice_fiscale text,
  indirizzo text,
  citta text,
  provincia text,
  cap text,
  telefono text,
  email text,
  pec text,
  sito_web text,
  note text,
  source_document_ids uuid[] DEFAULT '{}'::uuid[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.aziende ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own aziende" ON public.aziende
  FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own aziende" ON public.aziende
  FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own aziende" ON public.aziende
  FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own aziende" ON public.aziende
  FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE TRIGGER update_aziende_updated_at
  BEFORE UPDATE ON public.aziende
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
