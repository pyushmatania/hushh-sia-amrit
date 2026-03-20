
-- Drop FK on notifications to allow mock data
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Drop the booking notification trigger temporarily
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
