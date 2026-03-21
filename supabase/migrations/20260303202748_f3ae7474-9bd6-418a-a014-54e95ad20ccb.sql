
-- Centri di imputazione (costo/ricavo) per commessa
CREATE TABLE public.centri_imputazione (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('costo', 'ricavo')),
  is_default boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.centri_imputazione ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own centri" ON public.centri_imputazione FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own centri" ON public.centri_imputazione FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own centri" ON public.centri_imputazione FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own centri" ON public.centri_imputazione FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

-- Fatture (vendite e acquisti)
CREATE TABLE public.fatture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('vendita', 'acquisto')),
  numero text NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  fornitore_cliente text NOT NULL,
  descrizione text,
  importo numeric NOT NULL DEFAULT 0,
  aliquota_iva numeric NOT NULL DEFAULT 22,
  importo_iva numeric GENERATED ALWAYS AS (importo * aliquota_iva / 100) STORED,
  importo_totale numeric GENERATED ALWAYS AS (importo + importo * aliquota_iva / 100) STORED,
  stato_pagamento text NOT NULL DEFAULT 'da_pagare' CHECK (stato_pagamento IN ('da_pagare', 'pagata', 'scaduta')),
  data_scadenza date,
  centro_imputazione_id uuid REFERENCES public.centri_imputazione(id) ON DELETE SET NULL,
  file_path text,
  note text,
  cig text,
  cup text,
  split_payment boolean NOT NULL DEFAULT false,
  ritenuta_acconto numeric DEFAULT 0,
  codice_sdi text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fatture ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fatture" ON public.fatture FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own fatture" ON public.fatture FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own fatture" ON public.fatture FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own fatture" ON public.fatture FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

-- Trigger updated_at
CREATE TRIGGER update_centri_imputazione_updated_at BEFORE UPDATE ON public.centri_imputazione
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fatture_updated_at BEFORE UPDATE ON public.fatture
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
