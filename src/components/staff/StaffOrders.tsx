import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Clock, CheckCircle2, ChefHat, Loader2, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { playWinJingle } from "@/lib/spin-sounds";
import { hapticHeavy } from "@/lib/haptics";

interface Order {
  id: string; user_id: string; property_id: string; booking_id: string | null;
  total: number; status: string; created_at: string;
  items?: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  propertyName?: string; propertyImageUrls?: string[];
}
const statusFlow = ["pending", "preparing", "delivered", "completed"];
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "text-amber-400", bg: "bg-amber-500/15", label: "🔔 New" },
  preparing: { color: "text-blue-400", bg: "bg-blue-500/15", label: "👨‍🍳 Preparing" },
  delivered: { color: "text-emerald-400", bg: "bg-emerald-500/15", label: "✅ Delivered" },
  completed: { color: "text-muted-foreground", bg: "bg-muted", label: "Done" },
};

export default function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const initialLoadDone = useRef(false);

  const loadOrders = async () => {
    const { data: ordersData } = await supabase.from("orders").select("*")
      .order("created_at", { ascending: false }).limit(50);
    if (!ordersData) { setLoading(false); return; }

    const { data: items } = await supabase.from("order_items").select("*")
      .in("order_id", ordersData.map(o => o.id));

    const itemMap = new Map<string, any[]>();
    (items ?? []).forEach(item => {
      const list = itemMap.get(item.order_id) || [];
      list.push(item);
      itemMap.set(item.order_id, list);
    });

    setOrders(ordersData.map(o => ({ ...o, items: itemMap.get(o.id) || [] })));
    setLoading(false);
    initialLoadDone.current = true;
  };

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel('staff-orders-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as any;
        if (newOrder.status === 'pending' && initialLoadDone.current) {
          playWinJingle();
          hapticHeavy();
        }
        loadOrders();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        loadOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const advance = async (id: string, current: string) => {
    const idx = statusFlow.indexOf(current);
    if (idx < statusFlow.length - 1) {
      const next = statusFlow[idx + 1];
      await supabase.from("orders").update({ status: next }).eq("id", id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
    }
  };

  const filtered = orders.filter(o =>
    filter === "active" ? ["pending", "preparing"].includes(o.status) :
    filter === "delivered" ? o.status === "delivered" :
    o.status === "completed"
  );

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart size={20} className="text-primary" /> Kitchen Queue
        </h1>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full animate-pulse">
            <Bell size={12} /> {pendingCount} new
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {["active", "delivered", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filter === f ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No orders in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const sc = statusConfig[order.status] || statusConfig.pending;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border border-border bg-card p-4 ${
                  order.status === "pending" ? "ring-1 ring-amber-500/30" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">#{order.id.slice(0, 6)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  {(order.items || []).map((item, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.item_emoji} {item.item_name}</span>
                      <span className="text-sm font-bold text-foreground tabular-nums">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-bold text-foreground tabular-nums">₹{Number(order.total).toLocaleString()}</span>
                  {order.status !== "completed" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => advance(order.id, order.status)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold ${
                        order.status === "pending" ? "bg-blue-500 text-white" :
                        order.status === "preparing" ? "bg-emerald-500 text-white" :
                        "bg-secondary text-foreground"
                      }`}
                    >
                      {order.status === "pending" ? "Start Preparing" :
                       order.status === "preparing" ? "Mark Delivered" :
                       "Complete"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
