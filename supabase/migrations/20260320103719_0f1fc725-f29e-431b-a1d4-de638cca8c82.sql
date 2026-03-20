
CREATE TABLE public.curations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  emoji text NOT NULL DEFAULT '✨',
  slot text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  original_price numeric,
  includes text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  mood text[] NOT NULL DEFAULT '{}',
  property_id text NOT NULL,
  gradient text NOT NULL DEFAULT 'from-indigo-600/80 to-slate-900/60',
  badge text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.curations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active curations"
  ON public.curations FOR SELECT
  TO public
  USING (active = true);

CREATE TRIGGER curations_updated_at
  BEFORE UPDATE ON public.curations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
