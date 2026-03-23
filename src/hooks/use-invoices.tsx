import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Invoice {
  id: string;
  booking_id: string | null;
  payment_id: string | null;
  user_id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  line_items: Record<string, unknown>[] | null;
  pdf_url: string | null;
  created_at: string;
}

export function useInvoices(bookingId?: string) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingId) {
      query = query.eq("booking_id", bookingId);
    }

    const { data } = await query;
    if (data) setInvoices(data as Invoice[]);
    setLoading(false);
  }, [user, bookingId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getInvoiceByBooking = useCallback(
    (bId: string) => invoices.find((i) => i.booking_id === bId) ?? null,
    [invoices]
  );

  return { invoices, loading, getInvoiceByBooking, refresh: fetchInvoices };
}
