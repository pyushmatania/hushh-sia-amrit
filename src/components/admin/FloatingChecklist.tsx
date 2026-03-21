import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, X, ChefHat, Clock, CheckCircle2, AlertTriangle,
  Flame, TrendingUp, Filter, RefreshCw, Loader2, Eye,
  Package, ShieldCheck, Calendar, Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PendingItem {
  id: string;
  type: "order" | "booking" | "verification" | "low-stock";
  title: string;
  subtitle: string;
  assignedTo?: string;
  time: string;
  status: string;
  emoji: string;
  urgency: "critical" | "high" | "medium" | "low";
  amount?: number;
}

type FilterType = "all" | "order" | "booking" | "verification" | "low-stock";

export default function FloatingChecklist() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    const [ordersRes, bookingsRes, verifRes, profilesRes, listingsRes, inventoryRes] = await Promise.all([
      supabase.from("orders").select("*").in("status", ["pending", "preparing"]).order("created_at", { ascending: false }).limit(15),
      supabase.from("bookings").select("*").in("status", ["pending", "upcoming"]).order("created_at", { ascending: false }).limit(15),
      supabase.from("identity_verifications").select("*").eq("status", "pending").order("submitted_at", { ascending: false }).limit(5),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name"),
      supabase.from("inventory").select("id, name, stock, low_stock_threshold, emoji").eq("available", true),
    ]);

    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    const listingMap = new Map<string, string>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));

    const orderItemsRes = ordersRes.data?.length
      ? await supabase.from("order_items").select("*").in("order_id", ordersRes.data.map(o => o.id))
      : { data: [] };

    const itemMap = new Map<string, { label: string; count: number }>();
    (orderItemsRes.data ?? []).forEach(item => {
      const existing = itemMap.get(item.order_id);
      if (existing) {
        itemMap.set(item.order_id, { label: `${existing.label}, ${item.item_emoji}${item.item_name}`, count: existing.count + item.quantity });
      } else {
        itemMap.set(item.order_id, { label: `${item.item_emoji}${item.item_name}`, count: item.quantity });
      }
    });

    const timeAgo = (ts: string) => {
      const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
      return `${Math.floor(mins / 1440)}d ago`;
    };

    const getOrderUrgency = (ts: string, status: string): PendingItem["urgency"] => {
      const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
      if (status === "pending" && mins > 15) return "critical";
      if (status === "pending" && mins > 5) return "high";
      if (status === "preparing") return "medium";
      return "low";
    };

    const pending: PendingItem[] = [];

    (ordersRes.data ?? []).forEach(o => {
      const info = itemMap.get(o.id);
      pending.push({
        id: o.id,
        type: "order",
        title: info ? info.label : `₹${Number(o.total).toLocaleString()} order`,
        subtitle: `${profileMap.get(o.user_id) || "Guest"} · ${listingMap.get(o.property_id) || "Property"}`,
        assignedTo: (o as any).assigned_name || undefined,
        time: timeAgo(o.created_at),
        status: o.status,
        emoji: o.status === "pending" ? "⏳" : "🍳",
        urgency: getOrderUrgency(o.created_at, o.status),
        amount: Number(o.total),
      });
    });

    (bookingsRes.data ?? []).forEach(b => {
      pending.push({
        id: b.id,
        type: "booking",
        title: `${listingMap.get(b.property_id) || "Property"} · ${b.slot}`,
        subtitle: `${profileMap.get(b.user_id) || "Guest"} · ${b.guests} guests`,
        time: b.date,
        status: b.status,
        emoji: "📅",
        urgency: b.status === "pending" ? "high" : "medium",
        amount: Number(b.total),
      });
    });

    (verifRes.data ?? []).forEach(v => {
      pending.push({
        id: v.id,
        type: "verification",
        title: `ID Verification (${v.document_type})`,
        subtitle: profileMap.get(v.user_id) || "User",
        time: timeAgo(v.submitted_at),
        status: "pending",
        emoji: "🪪",
        urgency: "high",
      });
    });

    // Low stock items
    (inventoryRes.data ?? []).filter(i => i.stock <= i.low_stock_threshold).forEach(i => {
      pending.push({
        id: i.id,
        type: "low-stock",
        title: `${i.emoji} ${i.name}`,
        subtitle: `${i.stock} left (threshold: ${i.low_stock_threshold})`,
        time: "",
        status: i.stock === 0 ? "out" : "low",
        emoji: i.stock === 0 ? "🚨" : "⚠️",
        urgency: i.stock === 0 ? "critical" : "medium",
      });
    });

    // Sort by urgency
    const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    pending.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    setItems(pending);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("floating-pending")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const filtered = useMemo(() =>
    filter === "all" ? items : items.filter(i => i.type === filter),
    [items, filter]
  );

  const counts = useMemo(() => ({
    order: items.filter(i => i.type === "order").length,
    booking: items.filter(i => i.type === "booking").length,
    verification: items.filter(i => i.type === "verification").length,
    "low-stock": items.filter(i => i.type === "low-stock").length,
    critical: items.filter(i => i.urgency === "critical").length,
  }), [items]);

  const totalValue = useMemo(() =>
    items.reduce((sum, i) => sum + (i.amount || 0), 0),
    [items]
  );

  const urgencyStyles: Record<string, string> = {
    critical: "border-l-red-500 bg-red-500/5",
    high: "border-l-amber-500 bg-amber-500/5",
    medium: "border-l-blue-500 bg-blue-500/5",
    low: "border-l-muted bg-muted/5",
  };

  const urgencyDot: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-amber-500",
    medium: "bg-blue-500",
    low: "bg-muted-foreground",
  };

  const typeIcons: Record<string, typeof Flame> = {
    order: Flame,
    booking: Calendar,
    verification: ShieldCheck,
    "low-stock": Package,
  };

  const filters: { id: FilterType; label: string; icon: typeof Flame; count: number }[] = [
    { id: "all", label: "All", icon: Eye, count: items.length },
    { id: "order", label: "Orders", icon: Flame, count: counts.order },
    { id: "booking", label: "Bookings", icon: Calendar, count: counts.booking },
    { id: "verification", label: "IDs", icon: ShieldCheck, count: counts.verification },
    { id: "low-stock", label: "Stock", icon: Package, count: counts["low-stock"] },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary/40 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
      >
        <div className="relative">
          <Bell size={22} />
          {items.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -top-2.5 -right-2.5 min-w-[20px] h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1 ${
                counts.critical > 0 ? "bg-red-500 animate-pulse" : "bg-destructive"
              }`}
            >
              {items.length}
            </motion.span>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.92 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[380px] z-50 max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 pb-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Bell size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">Pending Actions</h3>
                      <p className="text-[10px] text-muted-foreground">{items.length} items need attention</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => load(true)}
                      disabled={refreshing}
                      className="p-1.5 rounded-lg hover:bg-secondary transition"
                    >
                      <RefreshCw size={13} className={`text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                      <X size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg bg-secondary/60 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{counts.order}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">Orders</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{counts.booking}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">Bookings</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-2 text-center">
                    <p className="text-lg font-bold text-foreground">₹{totalValue > 999 ? `${(totalValue / 1000).toFixed(1)}k` : totalValue}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">Pipeline</p>
                  </div>
                </div>

                {/* Critical banner */}
                {counts.critical > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 flex items-center gap-2 mb-3"
                  >
                    <AlertTriangle size={14} className="text-red-500 shrink-0" />
                    <p className="text-[11px] text-red-400 font-semibold">
                      {counts.critical} critical item{counts.critical > 1 ? "s" : ""} — overdue or out of stock
                    </p>
                  </motion.div>
                )}

                {/* Filter pills */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {filters.filter(f => f.count > 0 || f.id === "all").map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                        filter === f.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <f.icon size={10} />
                      {f.label}
                      {f.count > 0 && (
                        <span className={`ml-0.5 min-w-[14px] h-[14px] rounded-full text-[8px] flex items-center justify-center ${
                          filter === f.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}>
                          {f.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {loading ? (
                  <div className="py-12 text-center">
                    <Loader2 size={20} className="animate-spin text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading pending items...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10 }}
                    >
                      <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
                    </motion.div>
                    <p className="text-sm font-semibold text-foreground">All clear!</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">No pending items in this category</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {filtered.map((item, i) => {
                      const TypeIcon = typeIcons[item.type] || Flame;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }}
                          transition={{ delay: i * 0.02 }}
                          className={`rounded-xl border border-border/60 p-3 border-l-[3px] ${urgencyStyles[item.urgency]} hover:bg-accent/5 transition-colors`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="relative mt-0.5">
                              <span className="text-base">{item.emoji}</span>
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${urgencyDot[item.urgency]} ring-2 ring-card`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate leading-tight">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.subtitle}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {item.assignedTo && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] text-foreground/70 bg-secondary/80 px-1.5 py-0.5 rounded-md">
                                    <ChefHat size={8} /> {item.assignedTo}
                                  </span>
                                )}
                                {item.amount && item.amount > 0 && (
                                  <span className="text-[9px] font-semibold text-foreground/70 bg-secondary/80 px-1.5 py-0.5 rounded-md">
                                    ₹{item.amount.toLocaleString()}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                  <Clock size={8} /> {item.time}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                item.status === "pending" ? "bg-amber-500/15 text-amber-500" :
                                item.status === "preparing" ? "bg-blue-500/15 text-blue-500" :
                                item.status === "out" ? "bg-red-500/15 text-red-500" :
                                item.status === "low" ? "bg-amber-500/15 text-amber-500" :
                                "bg-secondary text-muted-foreground"
                              }`}>
                                {item.status}
                              </span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-semibold ${
                                item.urgency === "critical" ? "bg-red-500/15 text-red-400" :
                                item.urgency === "high" ? "bg-amber-500/10 text-amber-400" :
                                "text-muted-foreground"
                              }`}>
                                {item.urgency === "critical" ? "🔴 URGENT" : item.urgency === "high" ? "🟡 HIGH" : ""}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-3 border-t border-border bg-secondary/30">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp size={10} /> Live · auto-refreshing
                    </span>
                    <span>{items.length} total pending</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
