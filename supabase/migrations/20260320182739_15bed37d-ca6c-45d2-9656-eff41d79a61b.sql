
-- Drop restrictive admin-only update policy
DROP POLICY IF EXISTS "Admins can update all listings" ON public.host_listings;

-- Allow anyone to update listings (dev/testing only)
CREATE POLICY "Public can update all listings (dev)"
  ON public.host_listings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Also allow public inserts for testing
DROP POLICY IF EXISTS "Hosts can create listings" ON public.host_listings;
CREATE POLICY "Public can insert listings (dev)"
  ON public.host_listings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public deletes for testing
DROP POLICY IF EXISTS "Admins can delete all listings" ON public.host_listings;
DROP POLICY IF EXISTS "Hosts can delete their own listings" ON public.host_listings;
CREATE POLICY "Public can delete listings (dev)"
  ON public.host_listings
  FOR DELETE
  TO public
  USING (true);
