
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to commessa_data (nullable for migration)
ALTER TABLE public.commessa_data ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add commessa_id to all related tables
ALTER TABLE public.documents ADD COLUMN commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE;
ALTER TABLE public.persons ADD COLUMN commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE;
ALTER TABLE public.cronoprogramma_phases ADD COLUMN commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE;
ALTER TABLE public.cme_rows ADD COLUMN commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE;
ALTER TABLE public.proroghe ADD COLUMN commessa_id uuid REFERENCES public.commessa_data(id) ON DELETE CASCADE;

-- Update RLS policies for commessa_data to be user-scoped
DROP POLICY IF EXISTS "Anyone can view commessa_data" ON public.commessa_data;
DROP POLICY IF EXISTS "Anyone can insert commessa_data" ON public.commessa_data;
DROP POLICY IF EXISTS "Anyone can update commessa_data" ON public.commessa_data;
DROP POLICY IF EXISTS "Anyone can delete commessa_data" ON public.commessa_data;

CREATE POLICY "Users can view own commesse" ON public.commessa_data FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own commesse" ON public.commessa_data FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own commesse" ON public.commessa_data FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own commesse" ON public.commessa_data FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Update RLS for documents
DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.documents;

CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));

-- Update RLS for persons
DROP POLICY IF EXISTS "Anyone can view persons" ON public.persons;
DROP POLICY IF EXISTS "Anyone can insert persons" ON public.persons;
DROP POLICY IF EXISTS "Anyone can update persons" ON public.persons;
DROP POLICY IF EXISTS "Anyone can delete persons" ON public.persons;

CREATE POLICY "Users can view own persons" ON public.persons FOR SELECT TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own persons" ON public.persons FOR INSERT TO authenticated WITH CHECK (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own persons" ON public.persons FOR UPDATE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own persons" ON public.persons FOR DELETE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));

-- Update RLS for cronoprogramma_phases
DROP POLICY IF EXISTS "Anyone can view cronoprogramma_phases" ON public.cronoprogramma_phases;
DROP POLICY IF EXISTS "Anyone can insert cronoprogramma_phases" ON public.cronoprogramma_phases;
DROP POLICY IF EXISTS "Anyone can update cronoprogramma_phases" ON public.cronoprogramma_phases;
DROP POLICY IF EXISTS "Anyone can delete cronoprogramma_phases" ON public.cronoprogramma_phases;

CREATE POLICY "Users can view own phases" ON public.cronoprogramma_phases FOR SELECT TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own phases" ON public.cronoprogramma_phases FOR INSERT TO authenticated WITH CHECK (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own phases" ON public.cronoprogramma_phases FOR UPDATE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own phases" ON public.cronoprogramma_phases FOR DELETE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));

-- Update RLS for cme_rows
DROP POLICY IF EXISTS "Anyone can view cme_rows" ON public.cme_rows;
DROP POLICY IF EXISTS "Anyone can insert cme_rows" ON public.cme_rows;
DROP POLICY IF EXISTS "Anyone can update cme_rows" ON public.cme_rows;
DROP POLICY IF EXISTS "Anyone can delete cme_rows" ON public.cme_rows;

CREATE POLICY "Users can view own cme" ON public.cme_rows FOR SELECT TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own cme" ON public.cme_rows FOR INSERT TO authenticated WITH CHECK (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own cme" ON public.cme_rows FOR UPDATE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own cme" ON public.cme_rows FOR DELETE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));

-- Update RLS for proroghe
DROP POLICY IF EXISTS "Anyone can view proroghe" ON public.proroghe;
DROP POLICY IF EXISTS "Anyone can insert proroghe" ON public.proroghe;
DROP POLICY IF EXISTS "Anyone can update proroghe" ON public.proroghe;
DROP POLICY IF EXISTS "Anyone can delete proroghe" ON public.proroghe;

CREATE POLICY "Users can view own proroghe" ON public.proroghe FOR SELECT TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own proroghe" ON public.proroghe FOR INSERT TO authenticated WITH CHECK (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own proroghe" ON public.proroghe FOR UPDATE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own proroghe" ON public.proroghe FOR DELETE TO authenticated USING (commessa_id IN (SELECT id FROM public.commessa_data WHERE user_id = auth.uid()));
