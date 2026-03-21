CREATE TABLE public.ordini_acquisto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commessa_id UUID REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  fornitore TEXT NOT NULL,
  descrizione TEXT,
  importo NUMERIC DEFAULT 0,
  stato TEXT NOT NULL DEFAULT 'in_attesa',
  data_consegna_prevista DATE,
  data_consegna_effettiva DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ordini_acquisto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ordini" ON public.ordini_acquisto FOR SELECT USING (
  commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own ordini" ON public.ordini_acquisto FOR INSERT WITH CHECK (
  commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own ordini" ON public.ordini_acquisto FOR UPDATE USING (
  commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own ordini" ON public.ordini_acquisto FOR DELETE USING (
  commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid())
);

CREATE TRIGGER update_ordini_acquisto_updated_at
  BEFORE UPDATE ON public.ordini_acquisto
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();