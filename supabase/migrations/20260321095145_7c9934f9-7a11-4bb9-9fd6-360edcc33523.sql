
-- Staff Members table
CREATE TABLE public.staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'staff',
  department text NOT NULL DEFAULT 'operations',
  salary numeric NOT NULL DEFAULT 0,
  joining_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active',
  avatar_url text,
  emergency_contact text DEFAULT '',
  bank_account text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Staff Attendance table
CREATE TABLE public.staff_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in timestamptz,
  check_out timestamptz,
  status text NOT NULL DEFAULT 'present',
  hours_worked numeric DEFAULT 0,
  overtime_hours numeric DEFAULT 0,
  notes text DEFAULT '',
  meal_provided boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(staff_id, date)
);

-- Staff Salary Payments table
CREATE TABLE public.staff_salary_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  month text NOT NULL,
  year integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  payment_method text DEFAULT 'bank_transfer',
  deductions numeric DEFAULT 0,
  bonus numeric DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(staff_id, month, year)
);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_salary_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies (dev-open + admin)
CREATE POLICY "Public can manage staff_members (dev)" ON public.staff_members FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage staff_attendance (dev)" ON public.staff_attendance FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public can manage staff_salary_payments (dev)" ON public.staff_salary_payments FOR ALL TO public USING (true) WITH CHECK (true);

-- Updated_at triggers
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
