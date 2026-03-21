
CREATE TABLE public.persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ruolo TEXT,
  azienda TEXT,
  email TEXT,
  telefono TEXT,
  cellulare TEXT,
  pec TEXT,
  indirizzo TEXT,
  note TEXT,
  source_document_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view persons" ON public.persons FOR SELECT USING (true);
CREATE POLICY "Anyone can insert persons" ON public.persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update persons" ON public.persons FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete persons" ON public.persons FOR DELETE USING (true);

CREATE TRIGGER update_persons_updated_at
  BEFORE UPDATE ON public.persons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
