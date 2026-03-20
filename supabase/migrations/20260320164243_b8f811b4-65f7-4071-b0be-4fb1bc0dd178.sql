
-- Step 1: Drop FK and add columns
ALTER TABLE public.host_listings DROP CONSTRAINT IF EXISTS host_listings_user_id_fkey;

ALTER TABLE public.host_listings 
ADD COLUMN IF NOT EXISTS property_type text DEFAULT '',
ADD COLUMN IF NOT EXISTS primary_category text DEFAULT 'stay',
ADD COLUMN IF NOT EXISTS lat numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS lng numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS highlights text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS slots jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rules jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS entry_instructions text DEFAULT '',
ADD COLUMN IF NOT EXISTS host_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_label text DEFAULT '';

-- Update existing 8 listings with rich data
UPDATE public.host_listings SET property_type='Private Villa', primary_category='stay', lat=18.8563, lng=82.5716, highlights=ARRAY['Heated pool','Bose sound system','Fairy light setup','Bonfire kit'], host_name='Rahul M.', rating=4.8, review_count=124 WHERE name='The Firefly Villa';
UPDATE public.host_listings SET property_type='Farmhouse', primary_category='stay', lat=18.8645, lng=82.5802, highlights=ARRAY['Stargazing deck','Farm-to-table dining','Herb garden walk'], host_name='Sneha T.', rating=4.6, review_count=89 WHERE name='Koraput Garden House';
UPDATE public.host_listings SET property_type='Open Lawn', primary_category='experience', lat=18.8701, lng=82.5634, highlights=ARRAY['20ft cinema screen','DJ booth','Bonfire circle'], host_name='Vikram S.', rating=4.9, review_count=201, category='Experiences' WHERE name='Ember Grounds';
UPDATE public.host_listings SET property_type='Rooftop', primary_category='stay', lat=18.8482, lng=82.589, highlights=ARRAY['360° city views','Cocktail bar','Italian furniture'], host_name='Nisha R.', rating=4.7, review_count=156 WHERE name='Moonrise Terrace';
UPDATE public.host_listings SET property_type='Camping', primary_category='stay', lat=18.839, lng=82.575, highlights=ARRAY['Tribal drum circle','Nature trail','Tribal art tents'], host_name='Biju N.', rating=4.5, review_count=67, name='Tribal Camp' WHERE name='Tribal Heritage Camp';
UPDATE public.host_listings SET property_type='Sports Arena', primary_category='experience', lat=18.875, lng=82.555, highlights=ARRAY['Pickleball court','Floodlit turf','Cricket bowling machine'], host_name='Amit K.', rating=4.4, review_count=43, name='The Sports Arena', base_price=599 WHERE name='Sports Arena';
UPDATE public.host_listings SET property_type='Co-Working', primary_category='stay', lat=18.855, lng=82.575, highlights=ARRAY['Soundproofed pod','100 Mbps WiFi','Ergonomic chair'], host_name='Siddharth R.', rating=4.3, review_count=32 WHERE name='Work Pod';
UPDATE public.host_listings SET property_type='Pool Villa', primary_category='stay', lat=18.841, lng=82.562, highlights=ARRAY['Infinity pool','Underwater LED','Poolside loungers'], host_name='Meera J.', rating=4.8, review_count=143 WHERE name='Blue Lagoon Pool';
