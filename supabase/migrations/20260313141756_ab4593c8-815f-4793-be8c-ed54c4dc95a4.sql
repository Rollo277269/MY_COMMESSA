CREATE POLICY "Allow anon read" 
ON public.commessa_data 
FOR SELECT 
TO anon 
USING (true);