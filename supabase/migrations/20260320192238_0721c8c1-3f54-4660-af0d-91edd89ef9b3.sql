
CREATE TABLE public.experience_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '✨',
  price numeric NOT NULL DEFAULT 0,
  includes text[] NOT NULL DEFAULT '{}',
  gradient text NOT NULL DEFAULT 'from-primary/80 to-primary/40',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage experience_packages (dev)"
  ON public.experience_packages FOR ALL TO public
  USING (true) WITH CHECK (true);

INSERT INTO public.experience_packages (name, emoji, price, includes, gradient, sort_order) VALUES
  ('Romantic Date', '💑', 2499, ARRAY['Dinner', 'Decor', 'Pool'], 'from-primary/80 to-primary/40', 1),
  ('Birthday Bash', '🎂', 4999, ARRAY['Decor', 'Cake', 'DJ', '10 ppl'], 'from-tertiary/80 to-tertiary/40', 2),
  ('Weekend Party', '🎉', 7999, ARRAY['Full day', 'BBQ', 'Music', '20 ppl'], 'from-accent/60 to-accent/20', 3),
  ('Karaoke Night', '🎤', 1999, ARRAY['3 hrs', 'Snacks', 'Props', '8 ppl'], 'from-primary/60 to-tertiary/40', 4),
  ('Camping Trip', '🏕️', 3499, ARRAY['Overnight', 'Dinner', 'Bonfire', '6 ppl'], 'from-accent/80 to-primary/30', 5),
  ('Sports Day', '🏆', 2999, ARRAY['Full day', 'Equipment', 'Trophies', '16 ppl'], 'from-tertiary/60 to-accent/40', 6);
