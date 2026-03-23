import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Payment {
  id: string;
  booking_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  gateway: string;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_signature: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function usePayments(bookingId?: string) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingId) {
      query = query.eq("booking_id", bookingId);
    }

    const { data } = await query;
    if (data) setPayments(data as Payment[]);
    setLoading(false);
  }, [user, bookingId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const createPayment = useCallback(
    async (payment: Omit<Payment, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user) return null;

      const { data } = await supabase
        .from("payments")
        .insert({
          ...payment,
          user_id: user.id,
          metadata: (payment.metadata ?? {}) as Record<string, unknown>,
        })
        .select()
        .maybeSingle();

      if (data) {
        const newPayment = data as Payment;
        setPayments((prev) => [newPayment, ...prev]);
        return newPayment;
      }
      return null;
    },
    [user]
  );

  const getPaymentByBooking = useCallback(
    (bId: string) => payments.find((p) => p.booking_id === bId) ?? null,
    [payments]
  );

  return { payments, loading, createPayment, getPaymentByBooking, refresh: fetchPayments };
}
