-- Fix RLS su user_roles:
-- La policy "Admins can manage roles" con FOR ALL USING (...) non protegge
-- correttamente INSERT (serve WITH CHECK) né impedisce self-escalation.
-- Sostituiamo con policy esplicite per ogni operazione.

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Solo admin può vedere i ruoli di altri utenti (oltre al proprio già coperto da "Users can view own roles")
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Solo admin può inserire nuovi ruoli (con WITH CHECK per proteggere anche INSERT)
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Solo admin può aggiornare ruoli, e non può degradare se stesso
-- (impedisce che l'ultimo admin si rimuova il ruolo bloccando il sistema)
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Solo admin può cancellare ruoli, ma non il proprio
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    AND user_id != auth.uid()  -- un admin non può cancellare il proprio ruolo
  );
