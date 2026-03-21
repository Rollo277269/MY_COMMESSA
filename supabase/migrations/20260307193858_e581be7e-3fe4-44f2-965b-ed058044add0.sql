
-- Restrict audit log inserts to authenticated users only
DROP POLICY "Service can insert audit logs" ON public.rita_audit_log;
CREATE POLICY "Authenticated can insert audit logs" ON public.rita_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (commessa_id IN (
    SELECT id FROM commessa_data WHERE user_id = auth.uid()
  ));
