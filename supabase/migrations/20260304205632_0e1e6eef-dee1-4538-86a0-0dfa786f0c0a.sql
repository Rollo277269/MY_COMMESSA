
CREATE TABLE public.scadenze (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commessa_id UUID REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  titolo TEXT NOT NULL,
  descrizione TEXT,
  tipo TEXT NOT NULL DEFAULT 'polizza',
  data_scadenza DATE NOT NULL,
  data_emissione DATE,
  importo_garantito NUMERIC,
  costo NUMERIC,
  compagnia TEXT,
  tipo_polizza TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  notificato_30g BOOLEAN NOT NULL DEFAULT false,
  notificato_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scadenze ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scadenze" ON public.scadenze FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own scadenze" ON public.scadenze FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own scadenze" ON public.scadenze FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own scadenze" ON public.scadenze FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE TRIGGER update_scadenze_updated_at BEFORE UPDATE ON public.scadenze
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
