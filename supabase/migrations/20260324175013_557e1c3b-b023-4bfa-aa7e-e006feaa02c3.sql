
-- Revision history table for all listing types
CREATE TABLE public.listing_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL DEFAULT 'property', -- property, curation, experience
  entity_id text NOT NULL,
  entity_name text NOT NULL DEFAULT '',
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_name text NOT NULL DEFAULT 'System',
  change_type text NOT NULL DEFAULT 'update', -- create, update, delete
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view listing_revisions (dev)" ON public.listing_revisions
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can insert listing_revisions (dev)" ON public.listing_revisions
  FOR INSERT TO public WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_listing_revisions_entity ON public.listing_revisions(entity_type, entity_id);
CREATE INDEX idx_listing_revisions_created ON public.listing_revisions(created_at DESC);

-- Trigger function to auto-log host_listings changes
CREATE OR REPLACE FUNCTION public.log_listing_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  changes_json jsonb := '{}'::jsonb;
  col text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Compare old and new values
    IF OLD.name IS DISTINCT FROM NEW.name THEN changes_json := changes_json || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name)); END IF;
    IF OLD.description IS DISTINCT FROM NEW.description THEN changes_json := changes_json || jsonb_build_object('description', 'modified'); END IF;
    IF OLD.base_price IS DISTINCT FROM NEW.base_price THEN changes_json := changes_json || jsonb_build_object('base_price', jsonb_build_object('old', OLD.base_price, 'new', NEW.base_price)); END IF;
    IF OLD.status IS DISTINCT FROM NEW.status THEN changes_json := changes_json || jsonb_build_object('status', jsonb_build_object('old', OLD.status, 'new', NEW.status)); END IF;
    IF OLD.image_urls IS DISTINCT FROM NEW.image_urls THEN changes_json := changes_json || jsonb_build_object('images', jsonb_build_object('old_count', array_length(OLD.image_urls, 1), 'new_count', array_length(NEW.image_urls, 1))); END IF;
    IF OLD.capacity IS DISTINCT FROM NEW.capacity THEN changes_json := changes_json || jsonb_build_object('capacity', jsonb_build_object('old', OLD.capacity, 'new', NEW.capacity)); END IF;
    IF OLD.category IS DISTINCT FROM NEW.category THEN changes_json := changes_json || jsonb_build_object('category', jsonb_build_object('old', OLD.category, 'new', NEW.category)); END IF;
    IF OLD.location IS DISTINCT FROM NEW.location THEN changes_json := changes_json || jsonb_build_object('location', jsonb_build_object('old', OLD.location, 'new', NEW.location)); END IF;
    IF OLD.tags IS DISTINCT FROM NEW.tags THEN changes_json := changes_json || jsonb_build_object('tags', 'modified'); END IF;
    IF OLD.amenities IS DISTINCT FROM NEW.amenities THEN changes_json := changes_json || jsonb_build_object('amenities', 'modified'); END IF;

    -- Only log if something actually changed
    IF changes_json = '{}'::jsonb THEN RETURN NEW; END IF;

    INSERT INTO public.listing_revisions (entity_type, entity_id, entity_name, change_type, changes, snapshot)
    VALUES ('property', NEW.id::text, NEW.name, 'update', changes_json,
      jsonb_build_object('name', NEW.name, 'status', NEW.status, 'base_price', NEW.base_price, 'category', NEW.category));
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.listing_revisions (entity_type, entity_id, entity_name, change_type, changes)
    VALUES ('property', NEW.id::text, NEW.name, 'create', jsonb_build_object('action', 'created'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_listing_revision
  AFTER INSERT OR UPDATE ON public.host_listings
  FOR EACH ROW EXECUTE FUNCTION public.log_listing_revision();

-- Trigger for curations
CREATE OR REPLACE FUNCTION public.log_curation_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  changes_json jsonb := '{}'::jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.name IS DISTINCT FROM NEW.name THEN changes_json := changes_json || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name)); END IF;
    IF OLD.price IS DISTINCT FROM NEW.price THEN changes_json := changes_json || jsonb_build_object('price', jsonb_build_object('old', OLD.price, 'new', NEW.price)); END IF;
    IF OLD.active IS DISTINCT FROM NEW.active THEN changes_json := changes_json || jsonb_build_object('active', jsonb_build_object('old', OLD.active, 'new', NEW.active)); END IF;
    IF OLD.image_urls IS DISTINCT FROM NEW.image_urls THEN changes_json := changes_json || jsonb_build_object('images', 'modified'); END IF;
    IF OLD.includes IS DISTINCT FROM NEW.includes THEN changes_json := changes_json || jsonb_build_object('includes', 'modified'); END IF;
    IF changes_json = '{}'::jsonb THEN RETURN NEW; END IF;
    INSERT INTO public.listing_revisions (entity_type, entity_id, entity_name, change_type, changes)
    VALUES ('curation', NEW.id::text, NEW.name, 'update', changes_json);
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.listing_revisions (entity_type, entity_id, entity_name, change_type, changes)
    VALUES ('curation', NEW.id::text, NEW.name, 'create', jsonb_build_object('action', 'created'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_curation_revision
  AFTER INSERT OR UPDATE ON public.curations
  FOR EACH ROW EXECUTE FUNCTION public.log_curation_revision();

-- Trigger for experience_packages
CREATE OR REPLACE FUNCTION public.log_experience_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  changes_json jsonb := '{}'::jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.name IS DISTINCT FROM NEW.name THEN changes_json := changes_json || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name)); END IF;
    IF OLD.price IS DISTINCT FROM NEW.price THEN changes_json := changes_json || jsonb_build_object('price', jsonb_build_object('old', OLD.price, 'new', NEW.price)); END IF;
    IF OLD.active IS DISTINCT FROM NEW.active THEN changes_json := changes_json || jsonb_build_object('active', jsonb_build_object('old', OLD.active, 'new', NEW.active)); END IF;
    IF OLD.video_url IS DISTINCT FROM NEW.video_url THEN changes_json := changes_json || jsonb_build_object('video', 'modified'); END IF;
    IF OLD.includes IS DISTINCT FROM NEW.includes THEN changes_json := changes_json || jsonb_build_object('includes', 'modified'); END IF;
    IF changes_json = '{}'::jsonb THEN RETURN NEW; END IF;
    INSERT INTO public.listing_revisions (entity_type, entity_id, entity_name, change_type, changes)
    VALUES ('experience', NEW.id::text, NEW.name, 'update', changes_json);
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.listing_revisions (entity_type, entity_id, entity_name, change_type, changes)
    VALUES ('experience', NEW.id::text, NEW.name, 'create', jsonb_build_object('action', 'created'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_experience_revision
  AFTER INSERT OR UPDATE ON public.experience_packages
  FOR EACH ROW EXECUTE FUNCTION public.log_experience_revision();
