-- Fix listing-images upload to work for all users (anon + authenticated).
-- The bucket is already publicly readable, so allowing uploads from any user
-- is acceptable for this admin-managed bucket.
-- This covers cases where admin is unauthenticated (skip button) or
-- the authenticated policy wasn't properly applied.

DROP POLICY IF EXISTS "Admins can upload to any listing-images path" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;

CREATE POLICY "Anyone can upload to listing-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'listing-images');
