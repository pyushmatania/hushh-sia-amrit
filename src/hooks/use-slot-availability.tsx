import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PropertySlot {
  id: string;
  property_id: string;
  label: string;
  start_time: string;
  end_time: string;
  base_price: number;
  capacity: number;
  is_blocked: boolean;
  blocked_reason: string | null;
  created_at: string;
}

export interface SlotAvailability {
  id: string;
  slot_id: string;
  date: string;
  booked_count: number;
  is_available: boolean;
  price_override: number | null;
  created_at: string;
}

export function useSlotAvailability(propertyId?: string, date?: string) {
  const [slots, setSlots] = useState<PropertySlot[]>([]);
  const [availability, setAvailability] = useState<SlotAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    if (!propertyId) {
      setSlots([]);
      setAvailability([]);
      setLoading(false);
      return;
    }

    const { data: slotData } = await supabase
      .from("property_slots")
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_blocked", false)
      .order("start_time", { ascending: true });

    const fetchedSlots = (slotData ?? []) as PropertySlot[];
    setSlots(fetchedSlots);

    if (date && fetchedSlots.length > 0) {
      const slotIds = fetchedSlots.map((s) => s.id);
      const { data: availData } = await supabase
        .from("slot_availability")
        .select("*")
        .in("slot_id", slotIds)
        .eq("date", date);

      setAvailability((availData ?? []) as SlotAvailability[]);
    } else {
      setAvailability([]);
    }

    setLoading(false);
  }, [propertyId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const getSlotAvailability = useCallback(
    (slotId: string) => {
      const slot = slots.find((s) => s.id === slotId);
      const avail = availability.find((a) => a.slot_id === slotId);
      if (!slot) return null;

      const bookedCount = avail?.booked_count ?? 0;
      const isAvailable = avail?.is_available ?? true;
      const remainingCapacity = slot.capacity - bookedCount;
      const price = avail?.price_override ?? slot.base_price;

      return {
        slot,
        bookedCount,
        isAvailable: isAvailable && remainingCapacity > 0,
        remainingCapacity,
        price,
      };
    },
    [slots, availability]
  );

  return { slots, availability, loading, getSlotAvailability, refresh: fetchSlots };
}
