
-- Table for subcontractors
CREATE TABLE public.subappaltatori (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE,
  nome text NOT NULL,
  partita_iva text,
  codice_fiscale text,
  indirizzo text,
  telefono text,
  email text,
  pec text,
  lavorazioni text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subappaltatori ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subappaltatori" ON public.subappaltatori FOR SELECT TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own subappaltatori" ON public.subappaltatori FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own subappaltatori" ON public.subappaltatori FOR UPDATE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own subappaltatori" ON public.subappaltatori FOR DELETE TO authenticated
  USING (commessa_id IN (SELECT id FROM commessa_data WHERE user_id = auth.uid()));

CREATE TRIGGER update_subappaltatori_updated_at BEFORE UPDATE ON public.subappaltatori
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table for CSE checklist items per subcontractor
CREATE TABLE public.subappaltatore_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subappaltatore_id uuid REFERENCES public.subappaltatori(id) ON DELETE CASCADE NOT NULL,
  voce text NOT NULL,
  completato boolean NOT NULL DEFAULT false,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  note text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subappaltatore_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist" ON public.subappaltatore_checklist FOR SELECT TO authenticated
  USING (subappaltatore_id IN (
    SELECT s.id FROM subappaltatori s
    JOIN commessa_data c ON s.commessa_id = c.id
    WHERE c.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own checklist" ON public.subappaltatore_checklist FOR INSERT TO authenticated
  WITH CHECK (subappaltatore_id IN (
    SELECT s.id FROM subappaltatori s
    JOIN commessa_data c ON s.commessa_id = c.id
    WHERE c.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own checklist" ON public.subappaltatore_checklist FOR UPDATE TO authenticated
  USING (subappaltatore_id IN (
    SELECT s.id FROM subappaltatori s
    JOIN commessa_data c ON s.commessa_id = c.id
    WHERE c.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own checklist" ON public.subappaltatore_checklist FOR DELETE TO authenticated
  USING (subappaltatore_id IN (
    SELECT s.id FROM subappaltatori s
    JOIN commessa_data c ON s.commessa_id = c.id
    WHERE c.user_id = auth.uid()
  ));

CREATE TRIGGER update_subappaltatore_checklist_updated_at BEFORE UPDATE ON public.subappaltatore_checklist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
