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
    async (payment: {
      booking_id?: string | null;
      amount: number;
      currency?: string;
      status?: string;
      payment_method?: string;
      gateway?: string;
      gateway_order_id?: string | null;
      gateway_payment_id?: string | null;
      gateway_signature?: string | null;
      metadata?: Record<string, unknown> | null;
    }) => {
      if (!user) return null;

      const insertData: Record<string, unknown> = {
        user_id: user.id,
        amount: payment.amount,
        booking_id: payment.booking_id ?? null,
        currency: payment.currency ?? "INR",
        status: payment.status ?? "pending",
        payment_method: payment.payment_method ?? "upi",
        gateway: payment.gateway ?? "razorpay",
        gateway_order_id: payment.gateway_order_id ?? null,
        gateway_payment_id: payment.gateway_payment_id ?? null,
        gateway_signature: payment.gateway_signature ?? null,
        metadata: payment.metadata ?? {},
      };

      const { data } = await supabase
        .from("payments")
        .insert(insertData as never)
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
