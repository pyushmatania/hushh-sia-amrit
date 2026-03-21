import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { Booking } from "@/pages/Index";

const LOCAL_KEY = "hushh_bookings";

const STATUS_ORDER: Record<Booking["status"], number> = {
  active: 0,
  upcoming: 1,
  completed: 2,
  cancelled: 3,
};

// Demo bookings shown for guest users — covers all statuses
const guestDemoBookings: Booking[] = [
  {
    id: "demo-active",
    propertyId: "c68aa3b0-4db8-41c8-9938-8b17ef628605",
    date: "Mar 20, 2026",
    slot: "Evening · 6 PM – 11 PM",
    guests: 4,
    total: 8500,
    status: "active",
    bookingId: "HUSHH-ACT001",
  },
  {
    id: "demo-up-1",
    propertyId: "664088f8-de6f-4806-8129-a074008d80bf",
    date: "Mar 25, 2026",
    slot: "Night · 7 PM – 11 PM",
    guests: 2,
    total: 4200,
    status: "upcoming",
    bookingId: "HUSHH-UP0025",
  },
  {
    id: "demo-up-2",
    propertyId: "9f53b02c-03b3-4975-85da-fc670583ff8a",
    date: "Apr 2, 2026",
    slot: "Full Day · 10 AM – 10 PM",
    guests: 12,
    total: 18500,
    status: "upcoming",
    bookingId: "HUSHH-UP0026",
  },
  {
    id: "demo-up-3",
    propertyId: "4394a035-b49d-43ec-824b-0ca2ac4ea63d",
    date: "Apr 10, 2026",
    slot: "Morning · 9 AM – 1 PM",
    guests: 8,
    total: 6400,
    status: "upcoming",
    bookingId: "HUSHH-UP0027",
  },
  {
    id: "demo-comp-1",
    propertyId: "fdc64fb0-8c00-47a1-8d3d-f1804528b3b7",
    date: "Mar 10, 2026",
    slot: "Full Day · 10 AM – 10 PM",
    guests: 8,
    total: 15200,
    status: "completed",
    bookingId: "HUSHH-CP0012",
  },
  {
    id: "demo-comp-2",
    propertyId: "260921b0-6a08-42ab-8af7-4b09abec8053",
    date: "Feb 28, 2026",
    slot: "Evening · 5 PM – 10 PM",
    guests: 6,
    total: 9800,
    status: "completed",
    bookingId: "HUSHH-CP0011",
  },
  {
    id: "demo-comp-3",
    propertyId: "635c4a53-a83a-43c4-9bb6-057c0f67b6f2",
    date: "Feb 14, 2026",
    slot: "Night · 8 PM – 12 AM",
    guests: 2,
    total: 3500,
    status: "completed",
    bookingId: "HUSHH-CP0010",
  },
  {
    id: "demo-comp-4",
    propertyId: "d0ace255-6252-4d32-bc08-a3808df64d34",
    date: "Jan 26, 2026",
    slot: "Full Day · 10 AM – 10 PM",
    guests: 15,
    total: 22000,
    status: "completed",
    bookingId: "HUSHH-CP0009",
  },
  {
    id: "demo-comp-5",
    propertyId: "9bc305ac-0f90-49d3-a169-731e11acf801",
    date: "Jan 1, 2026",
    slot: "Night · 9 PM – 2 AM",
    guests: 10,
    total: 14500,
    status: "completed",
    bookingId: "HUSHH-CP0008",
  },
  {
    id: "demo-comp-6",
    propertyId: "6a9747b5-d786-41d1-9911-bbe92c292cf2",
    date: "Dec 25, 2025",
    slot: "Evening · 5 PM – 11 PM",
    guests: 4,
    total: 7200,
    status: "completed",
    bookingId: "HUSHH-CP0007",
  },
  {
    id: "demo-cancel-1",
    propertyId: "eb407558-e858-4745-9685-9e3618ee0d16",
    date: "Feb 20, 2026",
    slot: "Night · 8 PM – 1 AM",
    guests: 2,
    total: 6000,
    status: "cancelled",
    bookingId: "HUSHH-CX0005",
  },
  {
    id: "demo-cancel-2",
    propertyId: "cb3a8358-59b0-4273-bfe1-88c6d553d15f",
    date: "Jan 15, 2026",
    slot: "Morning · 10 AM – 2 PM",
    guests: 4,
    total: 2800,
    status: "cancelled",
    bookingId: "HUSHH-CX0004",
  },
];

function getLocalBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalBookings(bookings: Booking[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(bookings));
}

function parseBookingDate(dateText: string): Date | null {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function isPastDate(dateText: string): boolean {
  const parsed = parseBookingDate(dateText);
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
}

function normalizeStatus(rawStatus: string | null | undefined, dateText: string): Booking["status"] {
  const value = (rawStatus || "").toLowerCase().trim();

  if (["active", "checked_in", "checked-in", "ongoing", "in_stay", "in-stay"].includes(value)) {
    return "active";
  }
  if (["cancelled", "canceled"].includes(value)) {
    return "cancelled";
  }
  if (["completed", "complete", "past", "done", "finished"].includes(value)) {
    return "completed";
  }

  // If date has already passed and it isn't active/cancelled, treat as completed
  if (isPastDate(dateText)) {
    return "completed";
  }

  return "upcoming";
}

function normalizeBooking(booking: Booking): Booking {
  return {
    ...booking,
    status: normalizeStatus(booking.status, booking.date),
  };
}

function sortBookings(input: Booking[]) {
  return [...input].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
}

function mergeGuestBookings(local: Booking[]): Booking[] {
  const normalizedLocal = local.map(normalizeBooking);
  const localIds = new Set(normalizedLocal.map((b) => b.id));
  const demoMissing = guestDemoBookings.filter((b) => !localIds.has(b.id));
  return sortBookings([...normalizedLocal, ...demoMissing]);
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const isDemo = !user;

  useEffect(() => {
    if (user) {
      const load = async () => {
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const mapped = data.map((b) =>
            normalizeBooking({
              id: b.id,
              propertyId: b.property_id,
              date: b.date,
              slot: b.slot,
              guests: b.guests,
              total: Number(b.total),
              status: b.status as Booking["status"],
              bookingId: b.booking_id,
            })
          );
          setBookings(sortBookings(mapped));
        } else {
          setBookings([]);
        }
        setLoading(false);
      };

      load();
      return;
    }

    const local = getLocalBookings();
    setBookings(mergeGuestBookings(local));
    setLoading(false);
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
          const newBooking: Booking = normalizeBooking({
            id: data.id,
            propertyId: data.property_id,
            date: data.date,
            slot: data.slot,
            guests: data.guests,
            total: Number(data.total),
            status: data.status as Booking["status"],
            bookingId: data.booking_id,
          });
          setBookings((prev) => sortBookings([newBooking, ...prev]));
          return newBooking;
        }

        return null;
      }

      const newBooking: Booking = normalizeBooking({
        ...booking,
        id: `local-${Date.now()}`,
      });

      setBookings((prev) => {
        const localOnly = prev.filter((b) => !b.id.startsWith("demo-"));
        const nextLocal = [newBooking, ...localOnly];
        setLocalBookings(nextLocal);
        return mergeGuestBookings(nextLocal);
      });

      return newBooking;
    },
    [user]
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      setBookings((prev) => {
        const updated = prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" as const } : b
        );

        if (!user) {
          const localOnly = updated.filter((b) => !b.id.startsWith("demo-"));
          setLocalBookings(localOnly);
          return mergeGuestBookings(localOnly);
        }

        return sortBookings(updated);
      });

      if (user) {
        await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
      }
    },
    [user]
  );

  return { bookings, createBooking, cancelBooking, loading, isDemo };
}
