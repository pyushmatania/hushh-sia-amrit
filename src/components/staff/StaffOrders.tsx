import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Clock, ChefHat, Loader2, Bell, Search, X, ArrowUpDown, ChevronRight, CalendarDays, MapPin, User, History, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { playWinJingle } from "@/lib/spin-sounds";
import { hapticHeavy } from "@/lib/haptics";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import OrderNotes from "@/components/shared/OrderNotes";

interface Order {
  id: string; user_id: string; property_id: string; booking_id: string | null;
  total: number; status: string; created_at: string;
  items?: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  propertyName?: string; propertyImageUrls?: string[];
  guestName?: string; guestAvatar?: string | null;
}

interface ClientHistory {
  orders: Order[];
  bookings: { id: string; date: string; slot: string; status: string; total: number; propertyName: string }[];
  totalSpent: number;
  orderCount: number;
}

const statusFlow = ["pending", "preparing", "delivered", "completed"];
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "text-amber-400", bg: "bg-amber-500/15", label: "🔔 New" },
  preparing: { color: "text-blue-400", bg: "bg-blue-500/15", label: "👨‍🍳 Preparing" },
  delivered: { color: "text-emerald-400", bg: "bg-emerald-500/15", label: "✅ Delivered" },
  completed: { color: "text-muted-foreground", bg: "bg-muted", label: "Done" },
};

type SortMode = "newest" | "oldest" | "highest" | "lowest";

export default function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [clientHistory, setClientHistory] = useState<ClientHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"details" | "history" | "timeline">("details");
  const initialLoadDone = useRef(false);

  // Property map for resolving names in history
  const listingMapRef = useRef(new Map<string, { name: string; imageUrls: string[] }>());

  const loadOrders = async () => {
    const [ordersRes, itemsRes, listingsRes, profilesRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("order_items").select("*"),
      supabase.from("host_listings").select("id, name, image_urls"),
      supabase.from("profiles").select("user_id, display_name, avatar_url"),
    ]);
    if (!ordersRes.data) { setLoading(false); return; }

    const { data: items } = itemsRes;
    const itemMap = new Map<string, any[]>();
    (items ?? []).forEach(item => {
      const list = itemMap.get(item.order_id) || [];
      list.push(item);
      itemMap.set(item.order_id, list);
    });

    const listingMap = new Map<string, { name: string; imageUrls: string[] }>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, { name: l.name, imageUrls: l.image_urls || [] }));
    listingMapRef.current = listingMap;

    const profileMap = new Map<string, { name: string; avatar: string | null }>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, { name: p.display_name || "Guest", avatar: p.avatar_url }));

    setOrders(ordersRes.data.map(o => {
      const listing = listingMap.get(o.property_id);
      const profile = profileMap.get(o.user_id);
      return {
        ...o,
        items: itemMap.get(o.id) || [],
        propertyName: listing?.name || "Property",
        propertyImageUrls: listing?.imageUrls || [],
        guestName: profile?.name || "Guest",
        guestAvatar: profile?.avatar || null,
      };
    }));
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
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => loadOrders())
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

  const loadClientHistory = async (userId: string) => {
    setHistoryLoading(true);
    const [ordersRes, bookingsRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("order_items").select("*"),
    ]);

    const clientOrders = (ordersRes.data || []).map(o => {
      const listing = listingMapRef.current.get(o.property_id);
      const orderItems = (itemsRes.data || []).filter(it => it.order_id === o.id);
      return { ...o, items: orderItems, propertyName: listing?.name || "Property", propertyImageUrls: listing?.imageUrls || [] };
    });

    const clientBookings = (bookingsRes.data || []).map(b => {
      const listing = listingMapRef.current.get(b.property_id);
      return { id: b.id, date: b.date, slot: b.slot, status: b.status, total: Number(b.total), propertyName: listing?.name || "Property" };
    });

    const totalSpent = clientOrders.reduce((s, o) => s + Number(o.total), 0) + clientBookings.reduce((s, b) => s + b.total, 0);

    setClientHistory({ orders: clientOrders, bookings: clientBookings, totalSpent, orderCount: clientOrders.length });
    setHistoryLoading(false);
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailTab("details");
    setClientHistory(null);
    loadClientHistory(order.user_id);
  };

  // Filter & Sort
  const filtered = orders.filter(o => {
    const statusMatch = filter === "active" ? ["pending", "preparing"].includes(o.status) :
      filter === "delivered" ? o.status === "delivered" : o.status === "completed";
    const nameMatch = !searchQuery || (o.guestName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && nameMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortMode === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortMode === "highest") return Number(b.total) - Number(a.total);
    return Number(a.total) - Number(b.total);
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;

  const formatDateTime = (ts: string) => {
    const d = new Date(ts);
    return {
      time: d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
      date: d.toLocaleDateString("en", { day: "numeric", month: "short" }),
      full: d.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
  };

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

      {/* Status Filters */}
      <div className="flex gap-2">
        {["active", "delivered", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filter === f ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}>{f}</button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by guest name…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary/30" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)}
          className="px-3 py-2 rounded-xl bg-secondary text-xs text-foreground border border-border focus:outline-none focus:ring-1 focus:ring-primary/30">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">₹ High</option>
          <option value="lowest">₹ Low</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={24} /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No orders in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order, i) => {
            const sc = statusConfig[order.status] || statusConfig.pending;
            const dt = formatDateTime(order.created_at);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openDetail(order)}
                className={`rounded-2xl border border-border bg-card p-4 cursor-pointer active:scale-[0.98] transition-transform ${
                  order.status === "pending" ? "ring-1 ring-amber-500/30" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const thumb = getListingThumbnail(order.propertyName || "", order.propertyImageUrls, { preferMapped: true });
                      return thumb ? (
                        <img src={thumb} alt={order.propertyName} className="w-8 h-8 rounded-xl object-cover ring-1 ring-border/30" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {order.propertyName?.[0] || "?"}
                        </div>
                      );
                    })()}
                    <div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{order.propertyName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-mono">#{order.id.slice(0, 6)}</span>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock size={8} /> {dt.time}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{dt.date}</p>
                  </div>
                </div>

                {/* Guest info */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Avatar className="h-6 w-6">
                    {order.guestAvatar ? <AvatarImage src={order.guestAvatar} alt={order.guestName} /> : null}
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {(order.guestName || "G")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-foreground font-medium truncate">{order.guestName}</span>
                  <ChevronRight size={12} className="text-muted-foreground ml-auto" />
                </div>

                <div className="space-y-1.5 mb-3">
                  {(order.items || []).slice(0, 3).map((item, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.item_emoji} {item.item_name}</span>
                      <span className="text-sm font-bold text-foreground tabular-nums">×{item.quantity}</span>
                    </div>
                  ))}
                  {(order.items || []).length > 3 && (
                    <p className="text-[10px] text-muted-foreground">+{(order.items!.length - 3)} more items</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-bold text-foreground tabular-nums">₹{Number(order.total).toLocaleString()}</span>
                  {order.status !== "completed" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); advance(order.id, order.status); }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold ${
                        order.status === "pending" ? "bg-blue-500 text-white" :
                        order.status === "preparing" ? "bg-emerald-500 text-white" :
                        "bg-secondary text-foreground"
                      }`}
                    >
                      {order.status === "pending" ? "Start Preparing" :
                       order.status === "preparing" ? "Mark Delivered" : "Complete"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-5 pb-3 border-b border-border">
                <SheetHeader>
                  <SheetTitle className="text-left text-base flex items-center gap-2">
                    <Package size={16} className="text-primary" />
                    Order #{selectedOrder.id.slice(0, 8)}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex items-center gap-3 mt-3">
                  <Avatar className="h-10 w-10">
                    {selectedOrder.guestAvatar ? <AvatarImage src={selectedOrder.guestAvatar} alt={selectedOrder.guestName} /> : null}
                    <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                      {(selectedOrder.guestName || "G")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{selectedOrder.guestName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin size={9} /> {selectedOrder.propertyName} · {formatDateTime(selectedOrder.created_at).full}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusConfig[selectedOrder.status]?.bg} ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.label}
                  </span>
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {detailTab === "details" && (
                  <>
                    {/* Property card */}
                    <div className="rounded-2xl bg-secondary/50 p-4 flex items-center gap-3">
                      {(() => {
                        const thumb = getListingThumbnail(selectedOrder.propertyName || "", selectedOrder.propertyImageUrls, { preferMapped: true });
                        return thumb ? (
                          <img src={thumb} alt={selectedOrder.propertyName} className="w-14 h-14 rounded-xl object-cover ring-1 ring-border/30" />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                            {selectedOrder.propertyName?.[0]}
                          </div>
                        );
                      })()}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedOrder.propertyName}</p>
                        {selectedOrder.booking_id && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">🔑 Booking: {selectedOrder.booking_id.slice(0, 10)}</p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-2">Order Items</p>
                      <div className="rounded-xl border border-border bg-card divide-y divide-border">
                        {(selectedOrder.items || []).map((item, j) => (
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
                      <div className="flex items-center justify-between mt-3 px-1">
                        <span className="text-sm font-bold text-foreground">Total</span>
                        <span className="text-lg font-bold text-primary tabular-nums">₹{Number(selectedOrder.total).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Status action */}
                    {selectedOrder.status !== "completed" && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          advance(selectedOrder.id, selectedOrder.status);
                          const idx = statusFlow.indexOf(selectedOrder.status);
                          if (idx < statusFlow.length - 1) setSelectedOrder({ ...selectedOrder, status: statusFlow[idx + 1] });
                        }}
                        className={`w-full py-3 rounded-xl text-sm font-semibold ${
                          selectedOrder.status === "pending" ? "bg-blue-500 text-white" :
                          selectedOrder.status === "preparing" ? "bg-emerald-500 text-white" :
                          "bg-secondary text-foreground"
                        }`}
                      >
                        {selectedOrder.status === "pending" ? "🍳 Start Preparing" :
                         selectedOrder.status === "preparing" ? "✅ Mark Delivered" : "Complete Order"}
                      </motion.button>
                    )}
                  </>
                )}

                {detailTab === "history" && (
                  <>
                    {historyLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={20} /></div>
                    ) : clientHistory ? (
                      <>
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-secondary/50 p-3 text-center">
                            <p className="text-lg font-bold text-foreground">{clientHistory.orderCount}</p>
                            <p className="text-[10px] text-muted-foreground">Orders</p>
                          </div>
                          <div className="rounded-xl bg-secondary/50 p-3 text-center">
                            <p className="text-lg font-bold text-foreground">{clientHistory.bookings.length}</p>
                            <p className="text-[10px] text-muted-foreground">Bookings</p>
                          </div>
                          <div className="rounded-xl bg-secondary/50 p-3 text-center">
                            <p className="text-lg font-bold text-foreground tabular-nums">₹{clientHistory.totalSpent.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">Total Spent</p>
                          </div>
                        </div>

                        {/* Past Orders */}
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-2">Past Orders</p>
                          {clientHistory.orders.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">No past orders</p>
                          ) : (
                            <div className="space-y-2">
                              {clientHistory.orders.map(o => {
                                const sc2 = statusConfig[o.status] || statusConfig.pending;
                                return (
                                  <div key={o.id} className={`rounded-xl border border-border p-3 ${o.id === selectedOrder.id ? "ring-1 ring-primary/30" : ""}`}>
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc2.bg} ${sc2.color}`}>{sc2.label}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">#{o.id.slice(0, 6)}</span>
                                      </div>
                                      <span className="text-xs font-bold text-foreground tabular-nums">₹{Number(o.total).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{o.propertyName} · {formatDateTime(o.created_at).full}</p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {(o.items || []).slice(0, 4).map((it, j) => (
                                        <span key={j} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-md">{it.item_emoji} {it.item_name}</span>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Past Bookings */}
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-2">Bookings</p>
                          {clientHistory.bookings.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">No bookings found</p>
                          ) : (
                            <div className="space-y-2">
                              {clientHistory.bookings.map(b => (
                                <div key={b.id} className="rounded-xl border border-border p-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-semibold text-foreground">{b.propertyName}</p>
                                    <p className="text-[10px] text-muted-foreground">{b.date} · {b.slot}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] font-bold text-foreground capitalize px-2 py-0.5 rounded-full bg-secondary">{b.status}</span>
                                    <p className="text-[10px] text-foreground font-bold tabular-nums mt-0.5">₹{b.total.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : null}
                  </>
                )}

                {detailTab === "timeline" && (
                  <>
                    {historyLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={20} /></div>
                    ) : clientHistory ? (
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-4">
                          {/* Merge and sort all events chronologically */}
                          {[
                            ...clientHistory.orders.map(o => ({
                              type: "order" as const,
                              id: o.id,
                              date: o.created_at,
                              title: `Food Order · ₹${Number(o.total).toLocaleString()}`,
                              subtitle: o.propertyName || "Property",
                              status: o.status,
                              emoji: "🍽️",
                            })),
                            ...clientHistory.bookings.map(b => ({
                              type: "booking" as const,
                              id: b.id,
                              date: b.date,
                              title: `Booking · ₹${b.total.toLocaleString()}`,
                              subtitle: `${b.propertyName} · ${b.slot}`,
                              status: b.status,
                              emoji: "🎫",
                            })),
                          ]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((event, i) => (
                              <div key={`${event.type}-${event.id}`} className="relative pl-10">
                                <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-card ${
                                  event.type === "order" ? "bg-blue-400" : "bg-emerald-400"
                                }`} />
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
                          {clientHistory.orders.length === 0 && clientHistory.bookings.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-8 pl-10">No activity yet</p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
