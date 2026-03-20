
-- Add public read policies for remaining admin-needed tables
CREATE POLICY "Public can view all campaigns (dev)" ON public.campaigns FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all coupons (dev)" ON public.coupons FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all staff_tasks (dev)" ON public.staff_tasks FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all loyalty_transactions (dev)" ON public.loyalty_transactions FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all referral_codes (dev)" ON public.referral_codes FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all referral_uses (dev)" ON public.referral_uses FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all user_milestones (dev)" ON public.user_milestones FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all spin_history (dev)" ON public.spin_history FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all wishlists (dev)" ON public.wishlists FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all review_responses (dev)" ON public.review_responses FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all notifications (dev)" ON public.notifications FOR SELECT TO public USING (true);
CREATE POLICY "Public can view all user_roles (dev)" ON public.user_roles FOR SELECT TO public USING (true);
