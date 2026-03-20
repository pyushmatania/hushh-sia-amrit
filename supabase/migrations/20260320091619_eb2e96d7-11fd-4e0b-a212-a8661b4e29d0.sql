-- Create a public storage bucket for chat images
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to chat-images bucket
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-images');

-- Allow anyone to view chat images (public bucket)
CREATE POLICY "Anyone can view chat images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own chat images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text);