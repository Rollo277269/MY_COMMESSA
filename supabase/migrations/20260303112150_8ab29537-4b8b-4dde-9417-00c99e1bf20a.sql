-- Add foto_url column to commessa_data
ALTER TABLE public.commessa_data ADD COLUMN IF NOT EXISTS foto_url text;

-- Create storage bucket for commessa photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('commessa-photos', 'commessa-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload commessa photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'commessa-photos');

-- Allow public read for commessa photos
CREATE POLICY "Public can read commessa photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'commessa-photos');

-- Allow users to update their photos
CREATE POLICY "Users can update commessa photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'commessa-photos');

-- Allow users to delete their photos
CREATE POLICY "Users can delete commessa photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'commessa-photos');