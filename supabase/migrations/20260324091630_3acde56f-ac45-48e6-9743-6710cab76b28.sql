
-- Function to notify telegram on new booking
CREATE OR REPLACE FUNCTION public.notify_telegram_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://flwzxhlquhhvonbkrrxt.supabase.co/functions/v1/telegram-notify',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3p4aGxxdWhodm9uYmtycnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzQ0MDAsImV4cCI6MjA4OTM1MDQwMH0.DHyvOYWbPsVdT-zb-UGzOFmMarUgp0RYPPqTx-fpZ_8"}'::jsonb,
    body := jsonb_build_object(
      'event_type', 'new_booking',
      'data', jsonb_build_object(
        'booking_id', NEW.booking_id,
        'guests', NEW.guests,
        'date', NEW.date,
        'slot', NEW.slot,
        'total', NEW.total,
        'status', NEW.status,
        'property_id', NEW.property_id
      )
    )
  );
  RETURN NEW;
END;
$$;

-- Function to notify telegram on new order
CREATE OR REPLACE FUNCTION public.notify_telegram_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://flwzxhlquhhvonbkrrxt.supabase.co/functions/v1/telegram-notify',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3p4aGxxdWhodm9uYmtycnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzQ0MDAsImV4cCI6MjA4OTM1MDQwMH0.DHyvOYWbPsVdT-zb-UGzOFmMarUgp0RYPPqTx-fpZ_8"}'::jsonb,
    body := jsonb_build_object(
      'event_type', 'new_order',
      'data', jsonb_build_object(
        'id', NEW.id,
        'total', NEW.total,
        'property_id', NEW.property_id,
        'status', NEW.status,
        'booking_id', NEW.booking_id
      )
    )
  );
  RETURN NEW;
END;
$$;

-- Function to notify telegram on booking cancellation
CREATE OR REPLACE FUNCTION public.notify_telegram_booking_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    PERFORM net.http_post(
      url := 'https://flwzxhlquhhvonbkrrxt.supabase.co/functions/v1/telegram-notify',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsd3p4aGxxdWhodm9uYmtycnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NzQ0MDAsImV4cCI6MjA4OTM1MDQwMH0.DHyvOYWbPsVdT-zb-UGzOFmMarUgp0RYPPqTx-fpZ_8"}'::jsonb,
      body := jsonb_build_object(
        'event_type', 'booking_cancelled',
        'data', jsonb_build_object(
          'booking_id', NEW.booking_id,
          'date', NEW.date,
          'total', NEW.total
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trg_telegram_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_booking();

CREATE TRIGGER trg_telegram_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_order();

CREATE TRIGGER trg_telegram_booking_cancel
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_telegram_booking_cancel();
