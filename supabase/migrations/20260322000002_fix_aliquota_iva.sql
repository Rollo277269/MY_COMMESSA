-- Fix L07: aliquota_iva su fatture — DEFAULT 22, NOT NULL
-- Garantisce che importo_iva e importo_totale (GENERATED ALWAYS AS) non siano mai NULL

-- Prima: aggiorna tutte le righe esistenti con aliquota_iva NULL → 22
UPDATE fatture
SET aliquota_iva = 22
WHERE aliquota_iva IS NULL;

-- Poi: aggiungi DEFAULT 22 e vincolo NOT NULL
ALTER TABLE fatture
  ALTER COLUMN aliquota_iva SET DEFAULT 22,
  ALTER COLUMN aliquota_iva SET NOT NULL;
