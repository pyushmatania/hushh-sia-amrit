import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChefHat, MapPin, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getListingThumbnail } from "@/lib/listing-thumbnails";

interface LiveOrder {
  id: string; user_id: string; property_id: string; total: number;
  status: string; created_at: string; assigned_name: string | null;
  items: { item_name: string; item_emoji: string; quantity: number }[];
  guestName: string; propertyName: string; propertyImageUrls: string[];
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
      supabase.from("host_listings").select("id, name, image_urls"),
    ]);

    const itemMap = new Map<string, any[]>();
    (itemsRes.data ?? []).forEach(item => { const list = itemMap.get(item.order_id) || []; list.push(item); itemMap.set(item.order_id, list); });
    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    const listingMap = new Map<string, { name: string; imageUrls: string[] }>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, { name: l.name, imageUrls: l.image_urls || [] }));

    setOrders(ordersData.map(o => {
      const listing = listingMap.get(o.property_id);
      return {
        ...o, assigned_name: (o as any).assigned_name || null,
        items: itemMap.get(o.id) || [], guestName: profileMap.get(o.user_id) || "Guest",
        propertyName: listing?.name || "Property",
        propertyImageUrls: listing?.imageUrls || [],
      };
    }));
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

  if (loading) return <div className="rounded-2xl bg-card border border-border/60 p-4 animate-pulse h-32" />;

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-primary" />
          <span className="text-xs font-semibold text-foreground">Live Kitchen</span>
          {orders.length > 0 && (
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full animate-pulse">{orders.length}</span>
          )}
        </div>
        <button onClick={onViewAll} className="text-[10px] text-primary font-medium flex items-center gap-0.5 hover:underline">
          View all <ChevronRight size={10} />
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-[11px] text-muted-foreground text-center py-4">✅ All orders fulfilled</p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {orders.map(order => {
              const stepIdx = statusSteps.indexOf(order.status);
              const isPending = order.status === "pending";
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl border border-border/60 p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground/60">
                        {order.guestName[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-foreground">{order.guestName}</p>
                        <p className="text-[9px] text-muted-foreground flex items-center gap-0.5"><MapPin size={7} /> {order.propertyName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isPending ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                        {isPending ? "Waiting" : "Cooking"}
                      </span>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{timeAgo(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {order.items.map((item, j) => (
                      <span key={j} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-md">
                        {item.item_emoji} {item.item_name} ×{item.quantity}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    {order.assigned_name ? (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-md">
                        <ChefHat size={9} className="text-primary" /> {order.assigned_name}
                      </span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground italic">Unassigned</span>
                    )}
                    <div className="flex items-center gap-0.5">
                      {statusSteps.map((step, si) => (
                        <div key={step} className={`w-4 h-1 rounded-full ${si <= stepIdx ? "bg-primary" : "bg-muted"}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
