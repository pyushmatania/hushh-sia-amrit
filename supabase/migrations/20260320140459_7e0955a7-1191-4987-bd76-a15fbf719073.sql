-- Allow admins to manage curations (insert, update, delete)
CREATE POLICY "Admins can manage curations" ON public.curations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'))
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));

-- Allow staff to view orders (for kitchen queue)
CREATE POLICY "Staff can view orders" ON public.orders
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'staff'));

-- Allow staff to update order status
CREATE POLICY "Staff can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'staff'));

-- Allow staff to view order items
CREATE POLICY "Staff can view order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'staff'));