
CREATE TABLE public.cronoprogramma_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.cronoprogramma_phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  depends_on UUID[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cronoprogramma_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cronoprogramma_phases" ON public.cronoprogramma_phases FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cronoprogramma_phases" ON public.cronoprogramma_phases FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update cronoprogramma_phases" ON public.cronoprogramma_phases FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete cronoprogramma_phases" ON public.cronoprogramma_phases FOR DELETE USING (true);
