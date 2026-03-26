-- Allow anon role to also upload to listing-images (for admin bypass without auth session)
CREATE POLICY "Anon can upload listing images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'listing-images');

-- Allow anon to update listing images
CREATE POLICY "Anon can update listing images"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'listing-images');

-- Allow anon to delete listing images
CREATE POLICY "Anon can delete listing images"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'listing-images');