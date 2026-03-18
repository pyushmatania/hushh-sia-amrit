
-- Host listings table
CREATE TABLE public.host_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT 'Jeypore, Odisha',
  category text NOT NULL DEFAULT 'Stays',
  base_price numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 10,
  amenities text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  image_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.host_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can view their own listings" ON public.host_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hosts can create listings" ON public.host_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Hosts can update their own listings" ON public.host_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Hosts can delete their own listings" ON public.host_listings FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_host_listings_updated_at
  BEFORE UPDATE ON public.host_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
