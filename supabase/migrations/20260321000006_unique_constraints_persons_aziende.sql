-- [ST03] Aggiunge unique constraint su (commessa_id, nome) per persons e aziende
-- Necessario per upsert idempotente da extract-contacts e extract-companies.
-- Rimuove eventuali duplicati esistenti prima di aggiungere il constraint.

-- ── PERSONS ────────────────────────────────────────────────────────────────

-- Rimuovi duplicati: mantieni il record più vecchio (created_at minore)
DELETE FROM public.persons
WHERE id NOT IN (
  SELECT DISTINCT ON (commessa_id, lower(trim(nome))) id
  FROM public.persons
  ORDER BY commessa_id, lower(trim(nome)), created_at ASC
);

-- Unique constraint standard su (commessa_id, nome) — usato dall'upsert
ALTER TABLE public.persons
  ADD CONSTRAINT IF NOT EXISTS persons_commessa_id_nome_unique
  UNIQUE (commessa_id, nome);

-- ── AZIENDE ────────────────────────────────────────────────────────────────

-- Rimuovi duplicati
DELETE FROM public.aziende
WHERE id NOT IN (
  SELECT DISTINCT ON (commessa_id, lower(trim(nome))) id
  FROM public.aziende
  ORDER BY commessa_id, lower(trim(nome)), created_at ASC
);

-- Unique constraint standard su (commessa_id, nome)
ALTER TABLE public.aziende
  ADD CONSTRAINT IF NOT EXISTS aziende_commessa_id_nome_unique
  UNIQUE (commessa_id, nome);
