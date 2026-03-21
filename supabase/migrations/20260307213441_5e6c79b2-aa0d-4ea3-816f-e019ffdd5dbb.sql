
CREATE TABLE public.checklist_documenti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  nome text NOT NULL,
  sezione text NOT NULL DEFAULT 'documenti',
  indispensabile boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_documenti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist" ON public.checklist_documenti
  FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own checklist" ON public.checklist_documenti
  FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own checklist" ON public.checklist_documenti
  FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own checklist" ON public.checklist_documenti
  FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE TRIGGER update_checklist_documenti_updated_at
  BEFORE UPDATE ON public.checklist_documenti
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
