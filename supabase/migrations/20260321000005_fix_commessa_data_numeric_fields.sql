-- [L06] Converti campi importo da TEXT a NUMERIC in commessa_data
-- I valori esistenti vengono convertiti: si rimuovono simboli euro, spazi,
-- separatori migliaia (.) e si normalizza la virgola decimale (,) → punto (.)
-- Valori non convertibili restano NULL.

-- Funzione helper per parsing sicuro da testo italiano a NUMERIC
CREATE OR REPLACE FUNCTION public.parse_italian_number(txt TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cleaned TEXT;
BEGIN
  IF txt IS NULL OR trim(txt) = '' OR trim(txt) = '—' THEN
    RETURN NULL;
  END IF;
  -- Rimuovi simbolo euro, spazi, 'EUR', testo non numerico iniziale/finale
  cleaned := regexp_replace(trim(txt), '[€$\s]|EUR|eur', '', 'g');
  -- Formato italiano: 1.234.567,89 → 1234567.89
  -- Rimuovi punti migliaia (punto seguito da 3 cifre)
  cleaned := regexp_replace(cleaned, '\.(\d{3})', '\1', 'g');
  -- Sostituisci virgola decimale con punto
  cleaned := replace(cleaned, ',', '.');
  -- Rimuovi caratteri non numerici residui (tranne punto e segno meno)
  cleaned := regexp_replace(cleaned, '[^0-9.\-]', '', 'g');
  -- Converti
  BEGIN
    RETURN cleaned::NUMERIC;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$;

-- ── importo_contrattuale TEXT → NUMERIC ──────────────────────────────────

-- 1. Aggiungi colonna NUMERIC temporanea
ALTER TABLE public.commessa_data
  ADD COLUMN IF NOT EXISTS importo_contrattuale_num NUMERIC;

-- 2. Converti dati esistenti
UPDATE public.commessa_data
SET importo_contrattuale_num = public.parse_italian_number(importo_contrattuale)
WHERE importo_contrattuale IS NOT NULL;

-- 3. Drop vecchia colonna TEXT e rinomina nuova
ALTER TABLE public.commessa_data DROP COLUMN importo_contrattuale;
ALTER TABLE public.commessa_data RENAME COLUMN importo_contrattuale_num TO importo_contrattuale;

-- ── oneri_sicurezza TEXT → NUMERIC ───────────────────────────────────────

ALTER TABLE public.commessa_data
  ADD COLUMN IF NOT EXISTS oneri_sicurezza_num NUMERIC;

UPDATE public.commessa_data
SET oneri_sicurezza_num = public.parse_italian_number(oneri_sicurezza)
WHERE oneri_sicurezza IS NOT NULL;

ALTER TABLE public.commessa_data DROP COLUMN oneri_sicurezza;
ALTER TABLE public.commessa_data RENAME COLUMN oneri_sicurezza_num TO oneri_sicurezza;

-- ── costo_manodopera TEXT → NUMERIC ──────────────────────────────────────

ALTER TABLE public.commessa_data
  ADD COLUMN IF NOT EXISTS costo_manodopera_num NUMERIC;

UPDATE public.commessa_data
SET costo_manodopera_num = public.parse_italian_number(costo_manodopera)
WHERE costo_manodopera IS NOT NULL;

ALTER TABLE public.commessa_data DROP COLUMN costo_manodopera;
ALTER TABLE public.commessa_data RENAME COLUMN costo_manodopera_num TO costo_manodopera;

-- ── importo_base_gara TEXT → NUMERIC ─────────────────────────────────────

ALTER TABLE public.commessa_data
  ADD COLUMN IF NOT EXISTS importo_base_gara_num NUMERIC;

UPDATE public.commessa_data
SET importo_base_gara_num = public.parse_italian_number(importo_base_gara)
WHERE importo_base_gara IS NOT NULL;

ALTER TABLE public.commessa_data DROP COLUMN importo_base_gara;
ALTER TABLE public.commessa_data RENAME COLUMN importo_base_gara_num TO importo_base_gara;

-- ── ribasso TEXT → NUMERIC (percentuale) ─────────────────────────────────

ALTER TABLE public.commessa_data
  ADD COLUMN IF NOT EXISTS ribasso_num NUMERIC;

UPDATE public.commessa_data
SET ribasso_num = public.parse_italian_number(ribasso)
WHERE ribasso IS NOT NULL;

ALTER TABLE public.commessa_data DROP COLUMN ribasso;
ALTER TABLE public.commessa_data RENAME COLUMN ribasso_num TO ribasso;

-- NB: durata_contrattuale rimane TEXT — può contenere "365 giorni", "12 mesi", ecc.
-- NB: data_contratto, data_consegna_lavori, data_scadenza_contratto rimangono TEXT
--     (già gestite come stringhe ISO dal frontend; una migrazione a DATE richiederebbe
--      validazione separata dei formati esistenti)
