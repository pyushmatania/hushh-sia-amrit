import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Clock, CheckCircle2, Loader2, Search, Filter, User, MapPin, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Order {
  id: string; user_id: string; property_id: string; booking_id: string | null;
  total: number; status: string; created_at: string;
  items?: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  guestName?: string; propertyName?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  preparing: "bg-blue-500/15 text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-muted text-muted-foreground",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  preparing: UtensilsCrossed,
  delivered: CheckCircle2,
  completed: CheckCircle2,
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const [ordersRes, itemsRes, profilesRes, listingsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("order_items").select("*"),
        supabase.from("profiles").select("user_id, display_name"),
        supabase.from("host_listings").select("id, name"),
      ]);

      if (!ordersRes.data) { setLoading(false); return; }

      const itemMap = new Map<string, any[]>();
      (itemsRes.data ?? []).forEach(item => {
        const list = itemMap.get(item.order_id) || [];
        list.push(item);
        itemMap.set(item.order_id, list);
      });

      const profileMap = new Map<string, string>();
      (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));

      const listingMap = new Map<string, string>();
      (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));

      setOrders(ordersRes.data.map(o => ({
        ...o,
        items: itemMap.get(o.id) || [],
        guestName: profileMap.get(o.user_id) || "Unknown Guest",
        propertyName: listingMap.get(o.property_id) || `Property ${o.property_id}`,
      })));
      setLoading(false);
    };
    load();

    // Realtime
    const ch = supabase
      .channel("admin-orders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const statuses = ["all", "pending", "preparing", "delivered", "completed"];

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = !search ||
      o.guestName?.toLowerCase().includes(search.toLowerCase()) ||
      o.propertyName?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const preparingCount = orders.filter(o => o.status === "preparing").length;

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart size={22} className="text-primary" /> Live Orders
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold animate-pulse">
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">{orders.length} total · {preparingCount} preparing</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search guest, property, or order ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
                statusFilter === s ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{s}{s !== "all" && ` (${orders.filter(o => o.status === s).length})`}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No orders match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => {
            const StatusIcon = statusIcons[order.status] || Clock;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-xl border bg-card p-4 ${
                  order.status === "pending" ? "border-amber-500/30" :
                  order.status === "preparing" ? "border-blue-500/30" : "border-border"
                }`}
              >
                {/* Header with guest + property + time */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold text-foreground">
                      {order.guestName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{order.guestName}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${statusColors[order.status] || statusColors.pending}`}>
                          <StatusIcon size={10} /> {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin size={10} /> {order.propertyName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(order.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</p>
                </div>

                {/* Items list */}
                {(order.items || []).length > 0 && (
                  <div className="bg-secondary/50 rounded-lg p-3 mb-3 space-y-1.5">
                    {order.items!.map((item, j) => (
                      <div key={j} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{item.item_emoji}</span>
                          <span className="text-foreground">{item.item_name}</span>
                          <span className="text-muted-foreground text-xs">×{item.quantity}</span>
                        </span>
                        <span className="text-muted-foreground tabular-nums text-xs">₹{(item.unit_price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{Number(order.total).toLocaleString()}</p>
                    {order.booking_id && (
                      <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-lg">
                        Booking: {order.booking_id.slice(0, 10)}
                      </span>
                    )}
                  </div>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
