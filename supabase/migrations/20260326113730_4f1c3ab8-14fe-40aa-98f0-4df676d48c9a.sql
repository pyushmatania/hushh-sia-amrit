UPDATE public.host_listings SET image_urls = ARRAY[
  'https://flwzxhlquhhvonbkrrxt.supabase.co/storage/v1/object/public/listing-images/admin/properties/heritage-walk-1.jpg',
  'https://flwzxhlquhhvonbkrrxt.supabase.co/storage/v1/object/public/listing-images/admin/properties/heritage-walk-2.jpg',
  'https://flwzxhlquhhvonbkrrxt.supabase.co/storage/v1/object/public/listing-images/admin/properties/heritage-walk-3.jpg',
  'https://flwzxhlquhhvonbkrrxt.supabase.co/storage/v1/object/public/listing-images/admin/properties/heritage-walk-4.jpg'
], updated_at = now() WHERE id = '16377537-1490-4e2b-b258-93fd0a890402';