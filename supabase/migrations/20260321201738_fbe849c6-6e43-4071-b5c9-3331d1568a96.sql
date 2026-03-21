ALTER TABLE public.bookings ADD COLUMN rooms_count integer DEFAULT null;
ALTER TABLE public.bookings ADD COLUMN extra_mattresses integer DEFAULT 0;