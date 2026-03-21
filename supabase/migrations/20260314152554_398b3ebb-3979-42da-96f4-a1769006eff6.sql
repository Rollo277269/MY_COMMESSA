
CREATE TABLE public.eventi_commessa (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  data_evento date NOT NULL DEFAULT CURRENT_DATE,
  titolo text NOT NULL,
  descrizione text,
  tipo text NOT NULL DEFAULT 'evento',
  protocollo text,
  mittente text,
  destinatario text,
  mezzo text,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.eventi_commessa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own eventi" ON public.eventi_commessa
  FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own eventi" ON public.eventi_commessa
  FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own eventi" ON public.eventi_commessa
  FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own eventi" ON public.eventi_commessa
  FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE TRIGGER update_eventi_commessa_updated_at
  BEFORE UPDATE ON public.eventi_commessa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
