
CREATE TABLE public.cme_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT,
  codice TEXT,
  descrizione TEXT NOT NULL,
  unita_misura TEXT,
  quantita NUMERIC,
  prezzo_unitario NUMERIC,
  importo NUMERIC,
  categoria TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cme_rows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cme_rows" ON public.cme_rows FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cme_rows" ON public.cme_rows FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cme_rows" ON public.cme_rows FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete cme_rows" ON public.cme_rows FOR DELETE USING (true);
