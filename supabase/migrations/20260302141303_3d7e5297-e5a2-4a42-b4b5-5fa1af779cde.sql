
CREATE TABLE public.commessa_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  committente TEXT,
  oggetto_lavori TEXT,
  importo_contrattuale TEXT,
  oneri_sicurezza TEXT,
  data_contratto TEXT,
  data_consegna_lavori TEXT,
  durata_contrattuale TEXT,
  rup TEXT,
  direttore_lavori TEXT,
  impresa_assegnataria TEXT,
  data_scadenza_contratto TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commessa_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view commessa_data" ON public.commessa_data FOR SELECT USING (true);
CREATE POLICY "Anyone can insert commessa_data" ON public.commessa_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update commessa_data" ON public.commessa_data FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete commessa_data" ON public.commessa_data FOR DELETE USING (true);

CREATE TRIGGER update_commessa_data_updated_at
  BEFORE UPDATE ON public.commessa_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a single default row
INSERT INTO public.commessa_data (committente) VALUES (NULL);
