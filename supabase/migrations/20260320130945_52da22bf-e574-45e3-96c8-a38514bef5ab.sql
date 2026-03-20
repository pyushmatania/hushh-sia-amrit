
-- Campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'flash_deal',
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 10,
  target_audience text[] NOT NULL DEFAULT '{}',
  target_properties text[] NOT NULL DEFAULT '{}',
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  active boolean NOT NULL DEFAULT true,
  banner_color text NOT NULL DEFAULT 'from-primary to-accent',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaigns" ON public.campaigns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'ops_manager'));

-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 10,
  min_order numeric NOT NULL DEFAULT 0,
  max_uses integer,
  uses integer NOT NULL DEFAULT 0,
  user_specific_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'ops_manager'));

CREATE POLICY "Users can view active coupons" ON public.coupons FOR SELECT TO authenticated
  USING (active = true AND (user_specific_id IS NULL OR user_specific_id = auth.uid()));

-- Property tags table
CREATE TABLE public.property_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT 'bg-primary/15 text-primary',
  icon text NOT NULL DEFAULT '🏷️',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags" ON public.property_tags FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage tags" ON public.property_tags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Tag assignments (many-to-many)
CREATE TABLE public.tag_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid REFERENCES public.property_tags(id) ON DELETE CASCADE NOT NULL,
  target_type text NOT NULL DEFAULT 'property',
  target_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tag_id, target_type, target_id)
);

ALTER TABLE public.tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view assignments" ON public.tag_assignments FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage assignments" ON public.tag_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
