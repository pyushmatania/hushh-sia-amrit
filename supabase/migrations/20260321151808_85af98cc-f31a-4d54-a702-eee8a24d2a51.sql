
CREATE TABLE public.client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID NOT NULL,
  author_id UUID,
  author_name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  note_type TEXT NOT NULL DEFAULT 'general',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage client_notes (dev)" ON public.client_notes FOR ALL TO public USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.client_notes;
