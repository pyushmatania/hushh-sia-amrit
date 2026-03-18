
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  icon text DEFAULT '🔔',
  read boolean NOT NULL DEFAULT false,
  action_url text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create a notification (security definer for use in triggers)
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _type text,
  _title text,
  _body text,
  _icon text DEFAULT '🔔'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, icon)
  VALUES (_user_id, _type, _title, _body, _icon);
END;
$$;

-- Auto-notify on new booking
CREATE OR REPLACE FUNCTION public.notify_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_notification(
    NEW.user_id,
    'booking',
    'Booking Confirmed! 🎉',
    'Your booking ' || NEW.booking_id || ' is confirmed for ' || NEW.date,
    '🎫'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_booking();
