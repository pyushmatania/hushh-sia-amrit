import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Clock, UtensilsCrossed, MapPin, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LiveOrder {
  id: string; user_id: string; property_id: string; total: number;
  status: string; created_at: string;
  items: { item_name: string; item_emoji: string; quantity: number }[];
  guestName: string; propertyName: string;
}

const statusColors: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/5",
  preparing: "border-blue-500/40 bg-blue-500/5",
};

export default function LiveOrdersWidget({ onViewAll }: { onViewAll: () => void }) {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const { data: ordersData } = await supabase.from("orders").select("*")
      .in("status", ["pending", "preparing"])
      .order("created_at", { ascending: false }).limit(5);

    if (!ordersData?.length) { setOrders([]); setLoading(false); return; }

    const [itemsRes, profilesRes, listingsRes] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", ordersData.map(o => o.id)),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name"),
    ]);

    const itemMap = new Map<string, any[]>();
    (itemsRes.data ?? []).forEach(item => {
      const list = itemMap.get(item.order_id) || [];
      list.push(item); itemMap.set(item.order_id, list);
    });

    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));

    const listingMap = new Map<string, string>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));

    setOrders(ordersData.map(o => ({
      ...o,
      items: itemMap.get(o.id) || [],
      guestName: profileMap.get(o.user_id) || "Guest",
      propertyName: listingMap.get(o.property_id) || `Property ${o.property_id}`,
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const ch = supabase
      .channel("dashboard-orders-widget")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  };

  if (loading) return (
    <div className="rounded-2xl border border-border bg-card p-4 animate-pulse h-32" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShoppingCart size={14} className="text-primary" />
          Active Kitchen Orders
          {orders.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold animate-pulse">
              {orders.length}
            </span>
          )}
        </h3>
        <button onClick={onViewAll} className="text-[10px] text-primary font-medium flex items-center gap-0.5 hover:underline">
          View all <ChevronRight size={12} />
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">✅ All orders fulfilled</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {orders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-lg border p-3 ${statusColors[order.status] || "border-border"}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-foreground">
                      {order.guestName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{order.guestName}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin size={8} /> {order.propertyName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                      order.status === "pending" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {order.status === "pending" ? "⏳ Waiting" : "🍳 Cooking"}
                    </span>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{timeAgo(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {order.items.map((item, j) => (
                    <span key={j} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md">
                      {item.item_emoji} {item.item_name} ×{item.quantity}
                    </span>
                  ))}
                  {order.items.length === 0 && (
                    <span className="text-[10px] text-muted-foreground">₹{Number(order.total).toLocaleString()}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
