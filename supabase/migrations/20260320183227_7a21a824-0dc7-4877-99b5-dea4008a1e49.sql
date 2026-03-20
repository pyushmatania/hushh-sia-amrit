
-- ═══ CURATIONS: open all CRUD for dev ═══
DROP POLICY IF EXISTS "Admins can manage curations" ON public.curations;
CREATE POLICY "Public can manage curations (dev)" ON public.curations FOR ALL TO public USING (true) WITH CHECK (true);

-- ═══ COUPONS: open all CRUD for dev ═══
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Public can manage coupons (dev)" ON public.coupons FOR ALL TO public USING (true) WITH CHECK (true);

-- ═══ CAMPAIGNS: open all CRUD for dev ═══
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
CREATE POLICY "Public can manage campaigns (dev)" ON public.campaigns FOR ALL TO public USING (true) WITH CHECK (true);

-- ═══ PROPERTY_TAGS: open all CRUD for dev ═══
DROP POLICY IF EXISTS "Admins can manage tags" ON public.property_tags;
CREATE POLICY "Public can manage tags (dev)" ON public.property_tags FOR ALL TO public USING (true) WITH CHECK (true);

-- ═══ TAG_ASSIGNMENTS: open all CRUD for dev ═══
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.tag_assignments;
CREATE POLICY "Public can manage assignments (dev)" ON public.tag_assignments FOR ALL TO public USING (true) WITH CHECK (true);

-- ═══ INVENTORY: ensure fully open (already has OR true but add explicit) ═══
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.inventory;
DROP POLICY IF EXISTS "Admins and staff can view inventory" ON public.inventory;
CREATE POLICY "Public can manage inventory (dev)" ON public.inventory FOR ALL TO public USING (true) WITH CHECK (true);
