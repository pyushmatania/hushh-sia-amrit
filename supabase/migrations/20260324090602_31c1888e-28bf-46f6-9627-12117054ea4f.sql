
-- Telegram bot state (singleton for tracking poll offset)
CREATE TABLE public.telegram_bot_state (
  id int PRIMARY KEY CHECK (id = 1),
  admin_chat_id text DEFAULT '',
  group_chat_id text DEFAULT '',
  bot_username text DEFAULT '',
  notifications_enabled boolean DEFAULT true,
  booking_alerts boolean DEFAULT true,
  order_alerts boolean DEFAULT true,
  daily_summary boolean DEFAULT true,
  auto_reply_enabled boolean DEFAULT true,
  auto_reply_message text DEFAULT 'Thanks for reaching out to Hushh Jeypore! 🏡 We will get back to you shortly.',
  update_offset bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.telegram_bot_state (id) VALUES (1);

-- Telegram incoming messages
CREATE TABLE public.telegram_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id bigint UNIQUE NOT NULL,
  chat_id bigint NOT NULL,
  from_username text DEFAULT '',
  from_first_name text DEFAULT '',
  message_text text,
  message_type text DEFAULT 'text',
  is_command boolean DEFAULT false,
  replied boolean DEFAULT false,
  reply_text text,
  raw_update jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_messages_chat_id ON public.telegram_messages (chat_id);
CREATE INDEX idx_telegram_messages_created_at ON public.telegram_messages (created_at DESC);

-- Telegram sent messages log
CREATE TABLE public.telegram_sent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id text NOT NULL,
  message_type text DEFAULT 'notification',
  message_text text NOT NULL,
  status text DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.telegram_bot_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_sent_log ENABLE ROW LEVEL SECURITY;

-- Policies - admin access
CREATE POLICY "Public can manage telegram_bot_state (dev)" ON public.telegram_bot_state FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage telegram_messages (dev)" ON public.telegram_messages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage telegram_sent_log (dev)" ON public.telegram_sent_log FOR ALL TO public USING (true) WITH CHECK (true);

-- Enable realtime for incoming messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.telegram_messages;
