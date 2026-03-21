import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChefHat, MapPin, ChevronRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LiveOrder {
  id: string; user_id: string; property_id: string; total: number;
  status: string; created_at: string; assigned_name: string | null;
  items: { item_name: string; item_emoji: string; quantity: number }[];
  guestName: string; propertyName: string;
}

const statusSteps = ["pending", "preparing", "delivered"];

export default function LiveOrdersWidget({ onViewAll }: { onViewAll: () => void }) {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const { data: ordersData } = await supabase.from("orders").select("*")
      .in("status", ["pending", "preparing"]).order("created_at", { ascending: false }).limit(5);
    if (!ordersData?.length) { setOrders([]); setLoading(false); return; }

    const [itemsRes, profilesRes, listingsRes] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", ordersData.map(o => o.id)),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name"),
    ]);

    const itemMap = new Map<string, any[]>();
    (itemsRes.data ?? []).forEach(item => { const list = itemMap.get(item.order_id) || []; list.push(item); itemMap.set(item.order_id, list); });
    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    const listingMap = new Map<string, string>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));

    setOrders(ordersData.map(o => ({
      ...o, assigned_name: (o as any).assigned_name || null,
      items: itemMap.get(o.id) || [], guestName: profileMap.get(o.user_id) || "Guest",
      propertyName: listingMap.get(o.property_id) || `Property`,
    })));
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const ch = supabase.channel("dashboard-orders-widget")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  if (loading) return <div className="rounded-[20px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-700/40 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] p-5 animate-pulse h-40" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      className="relative rounded-[20px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-700/40 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] overflow-hidden p-5"
    >
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-15 bg-orange-400 pointer-events-none" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <ShoppingCart size={14} className="text-orange-600" />
          </div>
          Live Kitchen
          {orders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-bold animate-pulse">
              {orders.length}
            </span>
          )}
        </h3>
        <button onClick={onViewAll} className="text-[11px] text-indigo-500 font-medium flex items-center gap-0.5 hover:underline">
          View all <ChevronRight size={12} />
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">✅ All orders fulfilled</p>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {orders.map(order => {
              const stepIdx = statusSteps.indexOf(order.status);
              const isPending = order.status === "pending";
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                  className={`rounded-xl border p-3.5 ${
                    isPending ? "border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5" : "border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-[11px] font-bold text-zinc-600">
                        {order.guestName[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{order.guestName}</p>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1"><MapPin size={8} /> {order.propertyName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isPending ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600" : "bg-blue-100 dark:bg-blue-500/20 text-blue-600"
                      }`}>
                        {isPending ? "⏳ Waiting" : "🍳 Cooking"}
                      </span>
                      <p className="text-[9px] text-zinc-400 mt-0.5">{timeAgo(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {order.items.map((item, j) => (
                      <span key={j} className="text-[10px] bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-100 dark:border-zinc-700">
                        {item.item_emoji} {item.item_name} ×{item.quantity}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    {order.assigned_name ? (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-100 dark:border-zinc-700">
                        <ChefHat size={10} className="text-indigo-500" /> {order.assigned_name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">Unassigned</span>
                    )}
                    <div className="flex items-center gap-1">
                      {statusSteps.map((step, si) => (
                        <div key={step} className={`w-5 h-1.5 rounded-full ${
                          si <= stepIdx ? (isPending ? "bg-amber-400" : "bg-blue-400") : "bg-zinc-200 dark:bg-zinc-700"
                        }`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
