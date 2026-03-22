
-- App config table for admin-editable settings
CREATE TABLE public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  label text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read config
CREATE POLICY "Public can read config" ON public.app_config FOR SELECT TO public USING (true);

-- Admin can manage config (dev policy)
CREATE POLICY "Public can manage config (dev)" ON public.app_config FOR ALL TO public USING (true) WITH CHECK (true);

-- Seed default config values
INSERT INTO public.app_config (key, value, label, description, category) VALUES
  ('extra_mattress_price', '500', 'Extra Mattress Price (₹)', 'Price per extra mattress per night', 'pricing'),
  ('room_capacity', '2', 'Guests per Room', 'Number of guests that fit per room', 'pricing'),
  ('platform_fee', '49', 'Platform Fee (₹)', 'Fixed platform fee per booking', 'pricing'),
  ('service_fee_percent', '10', 'Service Fee (%)', 'Percentage service fee on bookings', 'pricing'),
  ('coupon_discount_percent', '10', 'Coupon Discount (%)', 'Default coupon discount percentage', 'pricing'),
  ('max_mattresses_per_room', '1', 'Max Mattresses per Room', 'Maximum extra mattresses allowed per room', 'pricing');

-- Add image_url to inventory
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;
