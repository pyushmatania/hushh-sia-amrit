
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS assigned_to uuid DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS assigned_name text DEFAULT NULL;
