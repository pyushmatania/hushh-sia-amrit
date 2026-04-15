import { motion } from "framer-motion";
import { ShoppingBag, Clock, ChevronRight, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import OrderNotes from "@/components/shared/OrderNotes";
import { useAuth } from "@/hooks/use-auth";
import { useLocaleSettings } from "@/hooks/use-locale-settings";

interface OrderRow {
  id: string;
  property_id: string;
  total: number;
  status: string;
  created_at: string;
  items: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
}

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Pending" },
  preparing: { bg: "bg-sky-500/15", text: "text-sky-400", label: "Preparing" },
  delivered: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Delivered" },
  completed: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Completed" },
};

export default function OrderHistorySection() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!ordersData || ordersData.length === 0) {
        setLoading(false);
        return;
      }

      const orderIds = ordersData.map((o) => o.id);
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      const mapped: OrderRow[] = ordersData.map((o) => ({
        id: o.id,
        property_id: o.property_id,
        total: Number(o.total),
        status: o.status,
        created_at: o.created_at,
        items: (itemsData || [])
          .filter((i) => i.order_id === o.id)
          .map((i) => ({
            item_name: i.item_name,
            item_emoji: i.item_emoji,
            quantity: i.quantity,
            unit_price: Number(i.unit_price),
          })),
      }));

      setOrders(mapped);
      setLoading(false);
    })();
  }, [user]);

  if (!user || (loading === false && orders.length === 0)) return null;

  const { formatDateShort: formatDate, formatTime } = (await import("@/hooks/use-locale-settings")).useLocaleSettings ? (() => {
    // Use inline to avoid hook rules — fallback to locale-aware formatting
    const d1 = (iso: string) => {
      try {
        const s = JSON.parse(localStorage.getItem("hushh_locale_settings") || "{}");
        const d = new Date(iso);
        const tf = s.timeFormat || "12h";
        return {
          date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          time: tf === "24h"
            ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
            : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        };
      } catch { return { date: iso, time: "" }; }
    };
    return { formatDateShort: (iso: string) => d1(iso).date, formatTime: (iso: string) => d1(iso).time };
  })() : { formatDateShort: (iso: string) => iso, formatTime: (iso: string) => iso };

  return (
    <div className="px-5 pt-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "hsl(var(--primary) / 0.12)" }}
          >
            <ShoppingBag size={15} className="text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Order History</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-foreground/[0.04] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.map((order, i) => {
              const st = statusStyle[order.status] || statusStyle.pending;
              const isOpen = expanded === order.id;
              const preview = order.items.slice(0, 3).map((it) => it.item_emoji).join(" ");

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "hsl(var(--foreground) / 0.02)",
                    border: "1px solid hsl(var(--foreground) / 0.06)",
                  }}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full flex items-center gap-3 p-3.5 text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: "hsl(var(--foreground) / 0.04)" }}
                    >
                      {preview || "🛒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <Clock size={9} /> {formatDate(order.created_at)} · {formatTime(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-bold text-foreground">₹{order.total}</span>
                      <ChevronRight
                        size={14}
                        className={`text-muted-foreground mx-auto mt-0.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-foreground/[0.06] px-3.5 pb-3.5 pt-2.5 space-y-1.5"
                    >
                      {order.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">
                            {item.item_emoji} {item.item_name} × {item.quantity}
                          </span>
                          <span className="text-muted-foreground font-medium">₹{item.unit_price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-foreground/[0.06] pt-1.5 flex justify-between text-xs">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-foreground">₹{order.total}</span>
                      </div>
                      <div className="border-t border-foreground/[0.06] pt-3 mt-2">
                        <OrderNotes orderId={order.id} authorName={user?.email?.split("@")[0] || "Guest"} authorRole="guest" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
