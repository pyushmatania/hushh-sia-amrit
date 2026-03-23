
-- ============================================
-- HUSHH v2.0 SCHEMA HARDENING MIGRATION
-- Phase 1: All 10 critical fixes from audit
-- ============================================

-- 1. PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'upi',
  gateway TEXT NOT NULL DEFAULT 'razorpay',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager')
  );

CREATE POLICY "Public can view all payments (dev)" ON public.payments
  FOR SELECT TO public USING (true);

-- 2. REFUNDS TABLE
CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  gateway_refund_id TEXT,
  initiated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refunds" ON public.refunds
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.payments p WHERE p.id = refunds.payment_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage refunds" ON public.refunds
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager')
  );

CREATE POLICY "Public can view all refunds (dev)" ON public.refunds
  FOR SELECT TO public USING (true);

-- 3. INVOICES TABLE
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  line_items JSONB DEFAULT '[]'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager')
  );

CREATE POLICY "Public can view all invoices (dev)" ON public.invoices
  FOR SELECT TO public USING (true);

-- 4. PROPERTY SLOTS TABLE
CREATE TABLE public.property_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.host_listings(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  start_time TIME NOT NULL DEFAULT '06:00',
  end_time TIME NOT NULL DEFAULT '12:00',
  base_price NUMERIC NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 10,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.property_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view slots" ON public.property_slots
  FOR SELECT TO public USING (true);

CREATE POLICY "Hosts can manage own property slots" ON public.property_slots
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.host_listings hl WHERE hl.id = property_slots.property_id AND hl.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all slots" ON public.property_slots
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager')
  );

-- 5. SLOT AVAILABILITY TABLE
CREATE TABLE public.slot_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES public.property_slots(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  booked_count INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  price_override NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slot_id, date)
);

ALTER TABLE public.slot_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability" ON public.slot_availability
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage availability" ON public.slot_availability
  FOR ALL TO authenticated USING (
    has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager')
  );

-- 6. ADD payment_status TO BOOKINGS
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;

-- 7. ADD payment_status TO BOOKING_SPLITS
ALTER TABLE public.booking_splits
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_link_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS paid_at_actual TIMESTAMPTZ;

-- 8. ADD type TO CONVERSATIONS
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'direct',
  ADD COLUMN IF NOT EXISTS property_id TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 9. ADD updated_by TO APP_CONFIG
ALTER TABLE public.app_config
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 10. NOTIFICATION PREFERENCES TABLE
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'all',
  channel TEXT NOT NULL DEFAULT 'push',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type, channel)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences" ON public.notification_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view all notification_preferences (dev)" ON public.notification_preferences
  FOR SELECT TO public USING (true);

-- 11. PUSH TOKENS TABLE
CREATE TABLE public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens" ON public.push_tokens
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers for new tables
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.slot_availability;
