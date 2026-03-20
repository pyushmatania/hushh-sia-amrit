import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string; user_id: string; property_id: string; booking_id: string | null;
  total: number; status: string; created_at: string;
  items?: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  preparing: "bg-blue-500/15 text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: ordersData } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
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
    };
    load();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart size={22} className="text-primary" /> Live Orders
        </h1>
        <p className="text-sm text-muted-foreground">{orders.length} orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || statusColors.pending}`}>
                  {order.status}
                </span>
              </div>

              {(order.items || []).length > 0 && (
                <div className="space-y-1 mb-3">
                  {order.items!.map((item, j) => (
                    <div key={j} className="flex items-center justify-between text-sm">
                      <span>{item.item_emoji} {item.item_name} ×{item.quantity}</span>
                      <span className="text-muted-foreground tabular-nums">₹{(item.unit_price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-sm font-bold text-foreground tabular-nums">₹{Number(order.total).toLocaleString()}</p>
                <select
                  value={order.status}
                  onChange={e => updateOrderStatus(order.id, e.target.value)}
                  className="text-[11px] bg-secondary border border-border rounded-lg px-2 py-1 text-foreground"
                >
                  {["pending","preparing","delivered","completed"].map(s =>
                    <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
