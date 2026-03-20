
-- Identity verification documents table
CREATE TABLE public.identity_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_type text NOT NULL DEFAULT 'aadhaar',
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  notes text DEFAULT ''
);

ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Users can submit their own docs
CREATE POLICY "Users can insert own verification" ON public.identity_verifications
  FOR INSERT TO public WITH CHECK (true);

-- Users can view own verification
CREATE POLICY "Users can view own verification" ON public.identity_verifications
  FOR SELECT TO public USING (true);

-- Public read for admin skip-auth (dev)
CREATE POLICY "Public can update verifications (dev)" ON public.identity_verifications
  FOR UPDATE TO public USING (true);

-- Create storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public) VALUES ('identity-docs', 'identity-docs', false)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload identity docs" ON storage.objects
  FOR INSERT TO public WITH CHECK (bucket_id = 'identity-docs');

CREATE POLICY "Anyone can view identity docs" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'identity-docs');
