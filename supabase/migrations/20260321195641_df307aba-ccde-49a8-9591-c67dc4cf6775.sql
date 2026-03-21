
-- Booking photos table for guest event photos
CREATE TABLE public.booking_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text NOT NULL,
  user_id uuid NOT NULL,
  photo_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view photos for their bookings" ON public.booking_photos
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert their own photos" ON public.booking_photos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON public.booking_photos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Booking splits table for group payment splitting
CREATE TABLE public.booking_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text NOT NULL,
  created_by uuid NOT NULL,
  friend_name text NOT NULL DEFAULT '',
  friend_email text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage booking_splits (dev)" ON public.booking_splits
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Storage bucket for booking photos
INSERT INTO storage.buckets (id, name, public) VALUES ('booking-photos', 'booking-photos', true);

CREATE POLICY "Anyone can view booking photos" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'booking-photos');

CREATE POLICY "Authenticated users can upload booking photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'booking-photos');

CREATE POLICY "Users can delete own booking photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'booking-photos');
