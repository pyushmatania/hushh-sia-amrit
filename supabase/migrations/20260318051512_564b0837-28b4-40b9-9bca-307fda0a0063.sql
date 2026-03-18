
-- Loyalty transactions table to track points history
CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'earn',
  title text NOT NULL,
  description text DEFAULT '',
  points integer NOT NULL,
  icon text DEFAULT '⭐',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.loyalty_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.loyalty_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to award points (updates profile + creates transaction)
CREATE OR REPLACE FUNCTION public.award_loyalty_points(
  _user_id uuid,
  _points integer,
  _title text,
  _icon text DEFAULT '⭐'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total integer;
  new_tier text;
BEGIN
  -- Update points
  UPDATE profiles
  SET loyalty_points = loyalty_points + _points
  WHERE user_id = _user_id
  RETURNING loyalty_points INTO new_total;

  -- Calculate tier
  IF new_total >= 1000 THEN new_tier := 'Diamond';
  ELSIF new_total >= 500 THEN new_tier := 'Platinum';
  ELSIF new_total >= 200 THEN new_tier := 'Gold';
  ELSE new_tier := 'Silver';
  END IF;

  UPDATE profiles SET tier = new_tier WHERE user_id = _user_id;

  -- Log transaction
  INSERT INTO loyalty_transactions (user_id, type, title, points, icon)
  VALUES (_user_id, 'earn', _title, _points, _icon);
END;
$$;

-- Function to redeem points
CREATE OR REPLACE FUNCTION public.redeem_loyalty_points(
  _user_id uuid,
  _points integer,
  _title text,
  _icon text DEFAULT '🎁'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_pts integer;
  new_total integer;
  new_tier text;
BEGIN
  SELECT loyalty_points INTO current_pts FROM profiles WHERE user_id = _user_id;
  IF current_pts < _points THEN RETURN false; END IF;

  UPDATE profiles
  SET loyalty_points = loyalty_points - _points
  WHERE user_id = _user_id
  RETURNING loyalty_points INTO new_total;

  IF new_total >= 1000 THEN new_tier := 'Diamond';
  ELSIF new_total >= 500 THEN new_tier := 'Platinum';
  ELSIF new_total >= 200 THEN new_tier := 'Gold';
  ELSE new_tier := 'Silver';
  END IF;

  UPDATE profiles SET tier = new_tier WHERE user_id = _user_id;

  INSERT INTO loyalty_transactions (user_id, type, title, points, icon)
  VALUES (_user_id, 'redeem', _title, -_points, _icon);

  RETURN true;
END;
$$;
