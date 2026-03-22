ALTER TABLE public.inventory ADD COLUMN image_urls text[] DEFAULT '{}';
ALTER TABLE public.experience_packages ADD COLUMN image_urls text[] DEFAULT '{}';

-- Migrate existing single image_url to image_urls array
UPDATE public.inventory SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '';
UPDATE public.experience_packages SET image_urls = ARRAY[image_url] WHERE image_url IS NOT NULL AND image_url != '';