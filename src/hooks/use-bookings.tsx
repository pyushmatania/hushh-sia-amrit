import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { Booking } from "@/pages/Index";

const LOCAL_KEY = "hushh_bookings";

function getLocalBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch { return []; }
}

function setLocalBookings(bookings: Booking[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(bookings));
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const load = async () => {
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setBookings(
            data.map((b) => ({
              id: b.id,
              propertyId: b.property_id,
              date: b.date,
              slot: b.slot,
              guests: b.guests,
              total: Number(b.total),
              status: b.status as Booking["status"],
              bookingId: b.booking_id,
            }))
          );
        }
        setLoading(false);
      };
      load();
    } else {
      setBookings(getLocalBookings());
      setLoading(false);
    }
  }, [user]);

  const createBooking = useCallback(
    async (booking: Omit<Booking, "id">) => {
      if (user) {
        const { data } = await supabase
          .from("bookings")
          .insert({
            user_id: user.id,
            property_id: booking.propertyId,
            date: booking.date,
            slot: booking.slot,
            guests: booking.guests,
            total: booking.total,
            status: booking.status,
            booking_id: booking.bookingId,
          })
          .select()
          .single();

        if (data) {
          const newBooking: Booking = {
            id: data.id,
            propertyId: data.property_id,
            date: data.date,
            slot: data.slot,
            guests: data.guests,
            total: Number(data.total),
            status: data.status as Booking["status"],
            bookingId: data.booking_id,
          };
          setBookings((prev) => [newBooking, ...prev]);
          return newBooking;
        }
        return null;
      } else {
        // Guest mode — store locally
        const newBooking: Booking = {
          ...booking,
          id: `local-${Date.now()}`,
        };
        setBookings((prev) => {
          const next = [newBooking, ...prev];
          setLocalBookings(next);
          return next;
        });
        return newBooking;
      }
    },
    [user]
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      setBookings((prev) => {
        const next = prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b));
        if (!user) setLocalBookings(next);
        return next;
      });
      if (user) {
        await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      }
    },
    [user]
  );

  return { bookings, createBooking, cancelBooking, loading };
}
