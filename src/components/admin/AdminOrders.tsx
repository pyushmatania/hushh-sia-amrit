import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Clock, CheckCircle2, Loader2, Search, UtensilsCrossed, MapPin, ChefHat, Zap, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Order {
  id: string; user_id: string; property_id: string; booking_id: string | null;
  total: number; status: string; created_at: string; assigned_name: string | null;
  items?: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  guestName?: string; propertyName?: string;
}

const statusColors: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  pending: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-l-amber-400", glow: "shadow-amber-100/50" },
  preparing: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-l-blue-400", glow: "shadow-blue-100/50" },
  delivered: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-l-emerald-400", glow: "shadow-emerald-100/50" },
  completed: { color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", border: "border-l-zinc-300", glow: "" },
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock, preparing: UtensilsCrossed, delivered: CheckCircle2, completed: CheckCircle2,
};

const staffNames = ["Raju K.", "Priya M.", "Suresh B.", "Anita D.", "Mohan S."];
const statusSteps = ["pending", "preparing", "delivered", "completed"];
const stepColors = ["bg-amber-400", "bg-blue-400", "bg-emerald-400", "bg-emerald-500"];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

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
      (itemsRes.data ?? []).forEach(item => { const list = itemMap.get(item.order_id) || []; list.push(item); itemMap.set(item.order_id, list); });
      const profileMap = new Map<string, string>();
      (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
      const listingMap = new Map<string, string>();
      (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));
      setOrders(ordersRes.data.map(o => ({
        ...o, assigned_name: (o as any).assigned_name || null,
        items: itemMap.get(o.id) || [], guestName: profileMap.get(o.user_id) || "Unknown Guest",
        propertyName: listingMap.get(o.property_id) || `Property`,
      })));
      setLoading(false);
    };
    load();
    const ch = supabase.channel("admin-orders-rt").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateOrder = async (id: string, updates: Record<string, any>) => {
    await supabase.from("orders").update(updates).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const statuses = ["all", "pending", "preparing", "delivered", "completed"];
  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = !search || o.guestName?.toLowerCase().includes(search.toLowerCase()) || o.propertyName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

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
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 flex items-center justify-center shadow-sm">
              <ShoppingCart size={20} className="text-orange-600" />
            </div>
            Live Orders
            {pendingCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="ml-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-100 dark:border-amber-500/20"
              >
                {pendingCount} pending
              </motion.span>
            )}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">{orders.length} total · ₹{totalRevenue.toLocaleString("en-IN")} revenue</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Live</span>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search guest, property..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => {
            const count = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                  statusFilter === s
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-500/20"
                    : "bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-100 dark:border-zinc-700 hover:border-zinc-200"
                }`}>
                {s} {count > 0 && <span className="ml-0.5 text-[9px] opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader2 className="text-indigo-400" size={28} />
          </motion.div>
          <p className="text-xs text-zinc-400">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <ShoppingCart size={28} className="text-zinc-400" />
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">No orders match your filters</p>
          <p className="text-zinc-400 text-xs mt-1">Try changing the status filter</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((order, i) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              const sc = statusColors[order.status] || statusColors.pending;
              const stepIdx = statusSteps.indexOf(order.status);
              return (
                <motion.div key={order.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className={`rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 border-l-[3px] ${sc.border} p-4 hover:shadow-lg ${sc.glow} transition-all duration-200 group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 12 }}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm"
                      >
                        {order.guestName?.[0]?.toUpperCase() || "?"}
                      </motion.div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{order.guestName}</p>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1 ${sc.bg} ${sc.color}`}>
                            <StatusIcon size={10} /> {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1"><MapPin size={10} /> {order.propertyName}</span>
                          <span className="text-[10px] text-zinc-400">· {timeAgo(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">#{order.id.slice(0, 8)}</p>
                  </div>

                  {(order.items || []).length > 0 && (
                    <div className="bg-gradient-to-r from-zinc-50/80 to-zinc-50/40 dark:from-zinc-800/60 dark:to-zinc-800/30 rounded-xl p-3 mb-3 space-y-1.5 border border-zinc-100/50 dark:border-zinc-700/30">
                      {order.items!.map((item, j) => (
                        <div key={j} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="text-base">{item.item_emoji}</span>
                            <span className="text-zinc-700 dark:text-zinc-200 font-medium">{item.item_name}</span>
                            <span className="text-zinc-400 text-[10px] bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded-md">×{item.quantity}</span>
                          </span>
                          <span className="text-zinc-500 tabular-nums text-xs font-semibold">₹{(item.unit_price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress Steps */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1">
                      {statusSteps.map((step, si) => (
                        <motion.div
                          key={step}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: si * 0.1, duration: 0.3 }}
                          className={`h-1.5 flex-1 rounded-full origin-left ${
                            si <= stepIdx ? stepColors[si] : "bg-zinc-200 dark:bg-zinc-700"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {statusSteps.map((step, si) => (
                        <span key={step} className={`text-[8px] capitalize ${si <= stepIdx ? "text-zinc-600 dark:text-zinc-300 font-semibold" : "text-zinc-400"}`}>{step}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tabular-nums flex items-center gap-1">
                        <IndianRupee size={12} /> {Number(order.total).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <ChefHat size={12} className="text-indigo-500" />
                        <select value={order.assigned_name || ""} onChange={e => updateOrder(order.id, { assigned_name: e.target.value || null })}
                          className="text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-zinc-600 dark:text-zinc-300 min-w-[90px] hover:border-indigo-300 transition">
                          <option value="">Unassigned</option>
                          {staffNames.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                    <select value={order.status} onChange={e => updateOrder(order.id, { status: e.target.value })}
                      className="text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-600 dark:text-zinc-300 hover:border-indigo-300 transition font-medium">
                      {statusSteps.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
