-- ═══════════════════════════════════════════════════════════════════════════
-- [ST02] Cleanup automatico documenti bloccati in ai_status = 'processing'
-- Dopo 30 minuti senza aggiornamento, resetta a 'error' con messaggio.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cleanup_stuck_processing_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.documents
  SET
    ai_status = 'error',
    ai_summary = 'Analisi interrotta: timeout dopo 30 minuti. Clicca "Rianalizza" per riprovare.'
  WHERE
    ai_status = 'processing'
    AND updated_at < now() - INTERVAL '30 minutes';
END;
$$;

-- Programma il cleanup ogni 15 minuti
SELECT cron.schedule(
  'cleanup-stuck-documents',
  '*/15 * * * *',
  $$SELECT public.cleanup_stuck_processing_documents();$$
);


-- ═══════════════════════════════════════════════════════════════════════════
-- [D01] Trigger: reset notificato_30g e notificato_email quando data_scadenza
-- viene spostata oltre 30 giorni nel futuro (es. dopo una proroga)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.reset_scadenza_notification_on_date_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se la data_scadenza viene aggiornata e la nuova data è > 30 giorni da oggi
  -- azzera i flag di notifica in modo che la prossima esecuzione del cron possa
  -- notificare correttamente quando si avvicina nuovamente.
  IF NEW.data_scadenza IS DISTINCT FROM OLD.data_scadenza
     AND NEW.data_scadenza > (CURRENT_DATE + INTERVAL '30 days') THEN
    NEW.notificato_30g := false;
    NEW.notificato_email := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reset_notification_on_date_change ON public.scadenze;

CREATE TRIGGER reset_notification_on_date_change
  BEFORE UPDATE OF data_scadenza ON public.scadenze
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_scadenza_notification_on_date_change();


-- ═══════════════════════════════════════════════════════════════════════════
-- Cron job check-scadenze: ogni giorno alle 08:00
-- NOTA: sostituire <PROJECT_REF> e <SERVICE_ROLE_KEY> con i valori reali
-- oppure configurare tramite Supabase Dashboard > Database > Cron Jobs
-- ═══════════════════════════════════════════════════════════════════════════

-- Rimuovi eventuali vecchi job con lo stesso nome
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-scadenze') THEN
    PERFORM cron.unschedule('check-scadenze');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'check-scadenze-daily') THEN
    PERFORM cron.unschedule('check-scadenze-daily');
  END IF;
END $$;

-- Programma il job giornaliero alle 08:00 (pg_net via extensions.http)
-- IMPORTANTE: impostare app.cron_secret in Supabase Dashboard >
--   Settings > Database > Configuration > Additional Configuration
-- con: app.cron_secret = '<stesso valore del secret CRON_SECRET>'
SELECT cron.schedule(
  'check-scadenze-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://scqwswwmhhmzpnzhvidr.supabase.co/functions/v1/check-scadenze',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', current_setting('app.cron_secret', true)
    ),
    body := convert_to('{}', 'utf8')
  );
  $$
);
