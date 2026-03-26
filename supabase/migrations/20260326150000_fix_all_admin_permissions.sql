-- ============================================================
-- FIX ALL ADMIN PERMISSIONS
-- This migration makes the admin panel fully functional
-- without requiring authentication (admin uses skip button).
--
-- IMPORTANT: Run this in your Supabase SQL Editor at:
-- https://supabase.com/dashboard → your project → SQL Editor
-- ============================================================

-- ============================================================
-- 1. Ensure listing-images bucket exists and is PUBLIC
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  10485760,  -- 10MB limit
  ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/svg+xml','image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- ============================================================
-- 2. Drop ALL existing storage policies for listing-images
--    (start clean to avoid conflicts)
-- ============================================================
DROP POLICY IF EXISTS "Admins can upload to any listing-images path" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete listing images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public read listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Public update listing-images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete listing-images" ON storage.objects;

-- ============================================================
-- 3. Create open storage policies for listing-images
--    (anon + authenticated can do everything)
-- ============================================================
CREATE POLICY "Public read listing-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-images');

CREATE POLICY "Public upload listing-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Public update listing-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'listing-images')
WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Public delete listing-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'listing-images');

-- ============================================================
-- 4. Fix host_listings RLS — allow public read + admin writes
-- ============================================================
DROP POLICY IF EXISTS "Hosts can view their own listings" ON public.host_listings;
DROP POLICY IF EXISTS "Hosts can create listings" ON public.host_listings;
DROP POLICY IF EXISTS "Hosts can update their own listings" ON public.host_listings;
DROP POLICY IF EXISTS "Hosts can delete their own listings" ON public.host_listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON public.host_listings;
DROP POLICY IF EXISTS "Public can view listings" ON public.host_listings;
DROP POLICY IF EXISTS "Public can manage listings" ON public.host_listings;
DROP POLICY IF EXISTS "Admin can manage all listings" ON public.host_listings;

-- Everyone can read listings (user app needs this)
CREATE POLICY "Anyone can view listings"
ON public.host_listings FOR SELECT
TO public
USING (true);

-- Anyone can insert (admin creates listings without auth)
CREATE POLICY "Anyone can insert listings"
ON public.host_listings FOR INSERT
TO public
WITH CHECK (true);

-- Anyone can update (admin edits listings without auth)
CREATE POLICY "Anyone can update listings"
ON public.host_listings FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Anyone can delete (admin deletes listings without auth)
CREATE POLICY "Anyone can delete listings"
ON public.host_listings FOR DELETE
TO public
USING (true);
