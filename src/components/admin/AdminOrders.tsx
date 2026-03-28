import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import NumberTicker from "@/components/shared/NumberTicker";
import { ShoppingCart, Clock, CheckCircle2, Loader2, Search, UtensilsCrossed, MapPin, ChefHat, IndianRupee, Package, History, CalendarDays } from "lucide-react";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import OrderNotes from "@/components/shared/OrderNotes";

interface Order {
  id: string; user_id: string; property_id: string; booking_id: string | null;
  total: number; status: string; created_at: string; assigned_name: string | null;
  items: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  guestName: string; propertyName: string; propertyImageUrls: string[];
}

interface ClientHistory {
  orders: { id: string; total: number; status: string; created_at: string; propertyName: string; items: any[] }[];
  bookings: { id: string; date: string; slot: string; status: string; total: number; propertyName: string }[];
  totalSpent: number;
}

const statusColors: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  pending: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-l-amber-400", glow: "shadow-amber-100/50" },
  preparing: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-l-blue-400", glow: "shadow-blue-100/50" },
  delivered: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-l-emerald-400", glow: "shadow-emerald-100/50" },
  completed: { color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", border: "border-l-zinc-300", glow: "" },
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "text-amber-400", bg: "bg-amber-500/15", label: "🔔 New" },
  preparing: { color: "text-blue-400", bg: "bg-blue-500/15", label: "👨‍🍳 Preparing" },
  delivered: { color: "text-emerald-400", bg: "bg-emerald-500/15", label: "✅ Delivered" },
  completed: { color: "text-muted-foreground", bg: "bg-muted", label: "Done" },
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock, preparing: UtensilsCrossed, delivered: CheckCircle2, completed: CheckCircle2,
};

const staffNames = ["Raju K.", "Priya M.", "Suresh B.", "Anita D.", "Mohan S."];
const statusSteps = ["pending", "preparing", "delivered", "completed"];
const stepColors = ["bg-amber-400", "bg-blue-400", "bg-emerald-400", "bg-emerald-500"];

export default function AdminOrders() {
  const [animateParent] = useAutoAnimate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailTab, setDetailTab] = useState<"details" | "history" | "timeline">("details");
  const [clientHistory, setClientHistory] = useState<ClientHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [listingMap] = useState(() => new Map<string, { name: string; imageUrls: string[] }>());

  const load = async () => {
    const [ordersRes, itemsRes, profilesRes, listingsRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("order_items").select("*"),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name, image_urls"),
    ]);
    if (!ordersRes.data) { setLoading(false); return; }
    const itemMap = new Map<string, any[]>();
    (itemsRes.data ?? []).forEach(item => { const list = itemMap.get(item.order_id) || []; list.push(item); itemMap.set(item.order_id, list); });
    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, { name: l.name, imageUrls: l.image_urls || [] }));
    setOrders(ordersRes.data.map(o => {
      const listing = listingMap.get(o.property_id);
      return {
        ...o, assigned_name: (o as any).assigned_name || null,
        items: itemMap.get(o.id) || [], guestName: profileMap.get(o.user_id) || "Unknown Guest",
        propertyName: listing?.name || "Property", propertyImageUrls: listing?.imageUrls || [],
      };
    }));
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("admin-orders-rt").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateOrder = async (id: string, updates: Record<string, any>) => {
    await supabase.from("orders").update(updates).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    if (selectedOrder?.id === id) setSelectedOrder(prev => prev ? { ...prev, ...updates } : prev);
  };

  const loadClientHistory = async (userId: string) => {
    setHistoryLoading(true);
    const [ordersRes, bookingsRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(15),
      supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(15),
      supabase.from("order_items").select("*"),
    ]);
    const clientOrders = (ordersRes.data || []).map(o => {
      const listing = listingMap.get(o.property_id);
      return { id: o.id, total: Number(o.total), status: o.status, created_at: o.created_at, propertyName: listing?.name || "Property", items: (itemsRes.data || []).filter(it => it.order_id === o.id) };
    });
    const clientBookings = (bookingsRes.data || []).map(b => {
      const listing = listingMap.get(b.property_id);
      return { id: b.id, date: b.date, slot: b.slot, status: b.status, total: Number(b.total), propertyName: listing?.name || "Property" };
    });
    const totalSpent = clientOrders.reduce((s, o) => s + o.total, 0) + clientBookings.reduce((s, b) => s + b.total, 0);
    setClientHistory({ orders: clientOrders, bookings: clientBookings, totalSpent });
    setHistoryLoading(false);
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailTab("details");
    setClientHistory(null);
    loadClientHistory(order.user_id);
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

  const formatDT = (ts: string) => {
    const d = new Date(ts);
    return {
      time: d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
      date: d.toLocaleDateString("en", { day: "numeric", month: "short" }),
      full: d.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <>
      <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
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
            <p className="text-sm text-muted-foreground mt-1">{orders.length} total · ₹<NumberTicker value={totalRevenue} locale="en-IN" /> revenue</p>
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
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search guest, property..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-xl" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map(s => {
              const count = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                    statusFilter === s
                      ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                      : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                  }`}>
                  {s} {count > 0 && <span className="ml-0.5 text-[9px] opacity-60">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="text-primary animate-spin" size={28} />
            <p className="text-xs text-muted-foreground">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No orders match your filters</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Try changing the status filter</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div ref={animateParent} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((order, i) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                const sc = statusColors[order.status] || statusColors.pending;
                const stepIdx = statusSteps.indexOf(order.status);
                const dt = formatDT(order.created_at);
                return (
                  <motion.div key={order.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => openDetail(order)}
                    className={`rounded-2xl bg-card backdrop-blur-sm border border-border/80 border-l-[3px] ${sc.border} p-4 hover:shadow-lg ${sc.glow} transition-all duration-200 cursor-pointer active:scale-[0.99]`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const thumb = getListingThumbnail(order.propertyName || "", order.propertyImageUrls, { preferMapped: true });
                          return thumb ? (
                            <img src={thumb} alt={order.propertyName} className="w-11 h-11 rounded-2xl object-cover shadow-sm ring-1 ring-border/30" />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shadow-sm">
                              {order.propertyName?.[0]?.toUpperCase() || "?"}
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{order.guestName}</p>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1 ${sc.bg} ${sc.color}`}>
                              <StatusIcon size={10} /> {order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {order.propertyName}</span>
                            <span className="text-[10px] text-muted-foreground">· <Clock size={8} className="inline" /> {dt.time} · {dt.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">#{order.id.slice(0, 8)}</p>
                    </div>

                    {(order.items || []).length > 0 && (
                      <div className="bg-secondary/50 rounded-xl p-3 mb-3 space-y-1.5 border border-border/50">
                        {order.items!.map((item, j) => (
                          <div key={j} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span className="text-base">{item.item_emoji}</span>
                              <span className="text-foreground font-medium">{item.item_name}</span>
                              <span className="text-muted-foreground text-[10px] bg-muted px-1.5 py-0.5 rounded-md">×{item.quantity}</span>
                            </span>
                            <span className="text-muted-foreground tabular-nums text-xs font-semibold">₹{(item.unit_price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Progress Steps */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, si) => (
                          <div key={step} className={`h-1.5 flex-1 rounded-full ${si <= stepIdx ? stepColors[si] : "bg-muted"}`} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {statusSteps.map((step, si) => (
                          <span key={step} className={`text-[8px] capitalize ${si <= stepIdx ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{step}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/80" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-foreground tabular-nums flex items-center gap-1">
                          <IndianRupee size={12} /> {Number(order.total).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <ChefHat size={12} className="text-primary" />
                          <select value={order.assigned_name || ""} onChange={e => updateOrder(order.id, { assigned_name: e.target.value || null })}
                            className="text-[11px] bg-muted border border-border rounded-xl px-2 py-1.5 text-foreground min-w-[90px] hover:border-primary/30 transition">
                            <option value="">Unassigned</option>
                            {staffNames.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      </div>
                      <select value={order.status} onChange={e => updateOrder(order.id, { status: e.target.value })}
                        className="text-[11px] bg-muted border border-border rounded-xl px-2.5 py-1.5 text-foreground hover:border-primary/30 transition font-medium">
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

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-5 pb-3 border-b border-border">
                <SheetHeader>
                  <SheetTitle className="text-left text-base flex items-center gap-2">
                    <Package size={16} className="text-primary" /> Order #{selectedOrder.id.slice(0, 8)}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex items-center gap-3 mt-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                      {selectedOrder.guestName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{selectedOrder.guestName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin size={9} /> {selectedOrder.propertyName} · {formatDT(selectedOrder.created_at).full}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
                </div>

                {/* Quick actions in detail */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 flex-1">
                    <ChefHat size={12} className="text-primary" />
                    <select value={selectedOrder.assigned_name || ""} onChange={e => updateOrder(selectedOrder.id, { assigned_name: e.target.value || null })}
                      className="text-[11px] bg-muted border border-border rounded-xl px-2 py-1.5 text-foreground flex-1 hover:border-primary/30 transition">
                      <option value="">Unassigned</option>
                      {staffNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <select value={selectedOrder.status} onChange={e => updateOrder(selectedOrder.id, { status: e.target.value })}
                    className="text-[11px] bg-muted border border-border rounded-xl px-2.5 py-1.5 text-foreground hover:border-primary/30 transition font-medium">
                    {statusSteps.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-5 pt-3 bg-background">
                {([
                  { key: "details" as const, label: "Details", icon: Package },
                  { key: "history" as const, label: "History", icon: History },
                  { key: "timeline" as const, label: "Timeline", icon: CalendarDays },
                ]).map(t => (
                  <button key={t.key} onClick={() => setDetailTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      detailTab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}>
                    <t.icon size={12} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {detailTab === "details" && (
                  <>
                    <div className="rounded-2xl bg-secondary/50 p-4 flex items-center gap-3">
                      {(() => {
                        const thumb = getListingThumbnail(selectedOrder.propertyName, selectedOrder.propertyImageUrls, { preferMapped: true });
                        return thumb ? (
                          <img src={thumb} alt={selectedOrder.propertyName} className="w-12 h-12 rounded-xl object-cover ring-1 ring-border/30" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">{selectedOrder.propertyName[0]}</div>
                        );
                      })()}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedOrder.propertyName}</p>
                        {selectedOrder.booking_id && <p className="text-[10px] text-muted-foreground">🔑 {selectedOrder.booking_id.slice(0, 10)}</p>}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card divide-y divide-border">
                      {selectedOrder.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.item_emoji}</span>
                            <div>
                              <p className="text-sm text-foreground font-medium">{item.item_name}</p>
                              <p className="text-[10px] text-muted-foreground">₹{item.unit_price} each</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-foreground">×{item.quantity}</span>
                            <p className="text-[10px] text-muted-foreground tabular-nums">₹{(item.unit_price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-bold text-foreground">Total</span>
                      <span className="text-lg font-bold text-primary tabular-nums">₹{Number(selectedOrder.total).toLocaleString()}</span>
                    </div>

                    <OrderNotes orderId={selectedOrder.id} authorName="Admin" authorRole="admin" />
                  </>
                )}

                {detailTab === "history" && (
                  historyLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={20} /></div>
                  ) : clientHistory ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-secondary/50 p-3 text-center">
                          <p className="text-lg font-bold text-foreground">{clientHistory.orders.length}</p>
                          <p className="text-[10px] text-muted-foreground">Orders</p>
                        </div>
                        <div className="rounded-xl bg-secondary/50 p-3 text-center">
                          <p className="text-lg font-bold text-foreground">{clientHistory.bookings.length}</p>
                          <p className="text-[10px] text-muted-foreground">Bookings</p>
                        </div>
                        <div className="rounded-xl bg-secondary/50 p-3 text-center">
                          <p className="text-lg font-bold text-foreground tabular-nums">₹{clientHistory.totalSpent.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">Spent</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Past Orders</p>
                        <div className="space-y-2">
                          {clientHistory.orders.map(o => (
                            <div key={o.id} className={`rounded-xl border border-border p-3 ${o.id === selectedOrder.id ? "ring-1 ring-primary/30" : ""}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig[o.status]?.bg} ${statusConfig[o.status]?.color}`}>{statusConfig[o.status]?.label}</span>
                                <span className="text-xs font-bold text-foreground tabular-nums">₹{o.total.toLocaleString()}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{o.propertyName} · {formatDT(o.created_at).full}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Bookings</p>
                        <div className="space-y-2">
                          {clientHistory.bookings.map(b => (
                            <div key={b.id} className="rounded-xl border border-border p-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-foreground">{b.propertyName}</p>
                                <p className="text-[10px] text-muted-foreground">{b.date} · {b.slot}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-bold capitalize px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{b.status}</span>
                                <p className="text-[10px] font-bold text-foreground tabular-nums mt-0.5">₹{b.total.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null
                )}

                {detailTab === "timeline" && (
                  historyLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={20} /></div>
                  ) : clientHistory ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                      <div className="space-y-4">
                        {[
                          ...clientHistory.orders.map(o => ({ type: "order" as const, id: o.id, date: o.created_at, title: `Food Order · ₹${o.total.toLocaleString()}`, subtitle: o.propertyName, status: o.status, emoji: "🍽️" })),
                          ...clientHistory.bookings.map(b => ({ type: "booking" as const, id: b.id, date: b.date, title: `Booking · ₹${b.total.toLocaleString()}`, subtitle: `${b.propertyName} · ${b.slot}`, status: b.status, emoji: "🎫" })),
                        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((event) => (
                            <div key={`${event.type}-${event.id}`} className="relative pl-10">
                              <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-card ${event.type === "order" ? "bg-blue-400" : "bg-emerald-400"}`} />
                              <div className="rounded-xl border border-border p-3 bg-card">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-foreground">{event.emoji} {event.title}</span>
                                  <span className="text-[10px] font-bold capitalize px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{event.status}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{event.subtitle}</p>
                                <p className="text-[9px] text-muted-foreground mt-1">{timeAgo(event.date)}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
