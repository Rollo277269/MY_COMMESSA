
-- Add sezione (CSSR vs Consorziata) and file naming rule to centri_imputazione
ALTER TABLE public.centri_imputazione
  ADD COLUMN sezione text NOT NULL DEFAULT 'cssr' CHECK (sezione IN ('cssr', 'consorziata')),
  ADD COLUMN regola_denominazione text;
