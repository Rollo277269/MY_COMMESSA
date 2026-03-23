-- Fix D03: Documenti orfani su cancellazione subappaltatore
-- Aggiunge trigger che elimina i documenti collegati (subfolder = subappaltatore.id)
-- prima che il subappaltatore venga cancellato.
-- I file storage orfani vengono puliti dal cron job cleanup_stuck_processing
-- che già marca documenti inconsistenti come error.

CREATE OR REPLACE FUNCTION delete_subappaltatore_documents()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Elimina tutti i documenti che usano il subappaltatore_id come subfolder
  DELETE FROM public.documents
  WHERE subfolder = OLD.id::text;
  RETURN OLD;
END;
$$;

CREATE TRIGGER before_delete_subappaltatore
  BEFORE DELETE ON public.subappaltatori
  FOR EACH ROW
  EXECUTE FUNCTION delete_subappaltatore_documents();
