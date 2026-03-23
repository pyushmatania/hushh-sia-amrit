import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface OrderItem {
  id: string;
  order_id: string;
  item_name: string;
  item_emoji: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  property_id: string;
  booking_id: string | null;
  status: string;
  total: number;
  assigned_to: string | null;
  assigned_name: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export function useOrders(bookingId?: string) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (bookingId) {
      query = query.eq("booking_id", bookingId);
    }

    const { data } = await query;
    if (!data) {
      setLoading(false);
      return;
    }

    // Fetch items for all orders
    const orderIds = data.map((o) => o.id);
    const { data: itemsData } = orderIds.length > 0
      ? await supabase.from("order_items").select("*").in("order_id", orderIds)
      : { data: [] };

    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const item of (itemsData ?? []) as OrderItem[]) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    const ordersWithItems: Order[] = (data as Order[]).map((o) => ({
      ...o,
      items: itemsByOrder.get(o.id) ?? [],
    }));

    setOrders(ordersWithItems);
    setLoading(false);
  }, [user, bookingId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = useCallback(
    async (
      propertyId: string,
      items: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[],
      bId?: string
    ) => {
      if (!user) return null;

      const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          booking_id: bId ?? null,
          total,
          status: "pending",
        })
        .select()
        .maybeSingle();

      if (!order) return null;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        item_name: i.item_name,
        item_emoji: i.item_emoji,
        quantity: i.quantity,
        unit_price: i.unit_price,
      }));

      const { data: insertedItems } = await supabase
        .from("order_items")
        .insert(orderItems)
        .select();

      const newOrder: Order = {
        ...(order as Order),
        items: (insertedItems ?? []) as OrderItem[],
      };

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    [user]
  );

  const activeOrder = orders.find((o) => o.status === "pending" || o.status === "preparing");

  return { orders, activeOrder, loading, createOrder, refresh: fetchOrders };
}
