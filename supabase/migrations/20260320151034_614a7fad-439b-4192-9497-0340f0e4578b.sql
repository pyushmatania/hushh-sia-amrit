
-- Allow public read access for admin skip-auth mode (dev/testing)
CREATE POLICY "Public can view all bookings (dev)" ON public.bookings FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all orders (dev)" ON public.orders FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all order_items (dev)" ON public.order_items FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all host_listings (dev)" ON public.host_listings FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all audit_logs (dev)" ON public.audit_logs FOR SELECT TO public USING (true);
CREATE POLICY "Public can update bookings (dev)" ON public.bookings FOR UPDATE TO public USING (true);
CREATE POLICY "Public can update orders (dev)" ON public.orders FOR UPDATE TO public USING (true);
