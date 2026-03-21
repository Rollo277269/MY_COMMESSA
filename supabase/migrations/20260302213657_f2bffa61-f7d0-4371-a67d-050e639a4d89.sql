
-- Table for contract extensions (proroghe)
CREATE TABLE public.proroghe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  motivo text NOT NULL,
  giorni integer NOT NULL,
  data_concessione date NOT NULL DEFAULT CURRENT_DATE,
  nuova_data_fine date NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.proroghe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proroghe" ON public.proroghe FOR SELECT USING (true);
CREATE POLICY "Anyone can insert proroghe" ON public.proroghe FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update proroghe" ON public.proroghe FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete proroghe" ON public.proroghe FOR DELETE USING (true);

CREATE TRIGGER update_proroghe_updated_at
  BEFORE UPDATE ON public.proroghe
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
