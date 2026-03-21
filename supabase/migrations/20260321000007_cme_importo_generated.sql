-- [L04] Calcolo importo CME come colonna GENERATED ALWAYS lato DB
-- Elimina race condition client-side: quantita*prezzo_unitario calcolato atomicamente in DB

-- Rinomina colonna esistente per backup temporaneo
ALTER TABLE public.cme_rows RENAME COLUMN importo TO importo_old;

-- Aggiungi colonna GENERATED ALWAYS AS
ALTER TABLE public.cme_rows
  ADD COLUMN importo NUMERIC GENERATED ALWAYS AS (
    CASE
      WHEN quantita IS NOT NULL AND prezzo_unitario IS NOT NULL
        THEN ROUND((quantita * prezzo_unitario)::NUMERIC, 2)
      ELSE NULL
    END
  ) STORED;

-- Elimina vecchia colonna (i valori sono ora ricalcolati automaticamente)
ALTER TABLE public.cme_rows DROP COLUMN importo_old;
