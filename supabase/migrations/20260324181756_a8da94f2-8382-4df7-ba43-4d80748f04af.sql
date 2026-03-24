-- Allow any authenticated user to upload to listing-images (admin use case)
CREATE POLICY "Admins can upload to any listing-images path"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

-- Drop the restrictive policy that requires folder = auth.uid()
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;

-- Also allow authenticated users to delete any listing image (admin)
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
CREATE POLICY "Authenticated can delete listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images');

-- Allow authenticated users to update any listing image
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
CREATE POLICY "Authenticated can update listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-images');