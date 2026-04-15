import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChefHat, MapPin, ChevronRight, Clock, Package, History, CalendarDays, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { DEMO_ORDERS, DEMO_ORDER_ITEMS, DEMO_LISTINGS, DEMO_PROFILES } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import OrderNotes from "@/components/shared/OrderNotes";

interface LiveOrder {
  id: string; user_id: string; property_id: string; total: number;
  status: string; created_at: string; assigned_name: string | null; booking_id: string | null;
  items: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  guestName: string; propertyName: string; propertyImageUrls: string[];
}

interface ClientHistory {
  orders: { id: string; total: number; status: string; created_at: string; propertyName: string; items: any[] }[];
  bookings: { id: string; date: string; slot: string; status: string; total: number; propertyName: string }[];
  totalSpent: number;
}

const statusSteps = ["pending", "preparing", "delivered"];
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "text-amber-400", bg: "bg-amber-500/15", label: "🔔 New" },
  preparing: { color: "text-blue-400", bg: "bg-blue-500/15", label: "👨‍🍳 Preparing" },
  delivered: { color: "text-emerald-400", bg: "bg-emerald-500/15", label: "✅ Delivered" },
  completed: { color: "text-muted-foreground", bg: "bg-muted", label: "Done" },
};

export default function LiveOrdersWidget({ onViewAll }: { onViewAll: () => void }) {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const { isDemoMode } = useDataMode();
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null);
  const [detailTab, setDetailTab] = useState<"details" | "history" | "timeline">("details");
  const [clientHistory, setClientHistory] = useState<ClientHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const listingMapRef = useState(new Map<string, { name: string; imageUrls: string[] }>())[0];

  const loadOrders = async () => {
    const { data: ordersData } = await supabase.from("orders").select("*")
      .in("status", ["pending", "preparing"]).order("created_at", { ascending: false }).limit(5);
    if (!ordersData?.length && isDemoMode) {
      const demoActive = DEMO_ORDERS.filter(o => o.status === "pending" || o.status === "preparing");
      const demoLive: LiveOrder[] = demoActive.map(o => {
        const listing = DEMO_LISTINGS.find(l => l.id === o.property_id);
        const profile = DEMO_PROFILES.find(p => p.user_id === o.user_id);
        const items = DEMO_ORDER_ITEMS.filter(i => i.order_id === o.id).map(i => ({
          item_name: i.item_name, item_emoji: i.item_emoji, quantity: i.quantity, unit_price: i.unit_price,
        }));
        return {
          id: o.id, user_id: o.user_id, property_id: o.property_id, total: o.total,
          status: o.status, created_at: o.created_at, assigned_name: null, booking_id: o.booking_id,
          items, guestName: profile?.display_name || "Guest",
          propertyName: listing?.name || "Property", propertyImageUrls: listing?.image_urls || [],
        };
      });
      setIsDemo(true);
      setOrders(demoLive);
      setLoading(false);
      return;
    } else if (!ordersData?.length) {
      setOrders([]);
      setIsDemo(false);
      setLoading(false);
      return;
    }

    const [itemsRes, profilesRes, listingsRes] = await Promise.all([
      supabase.from("order_items").select("*").in("order_id", ordersData.map(o => o.id)),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name, image_urls"),
    ]);

    const itemMap = new Map<string, any[]>();
    (itemsRes.data ?? []).forEach(item => { const list = itemMap.get(item.order_id) || []; list.push(item); itemMap.set(item.order_id, list); });
    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    (listingsRes.data ?? []).forEach(l => listingMapRef.set(l.id, { name: l.name, imageUrls: l.image_urls || [] }));

    setOrders(ordersData.map(o => {
      const listing = listingMapRef.get(o.property_id);
      return {
        ...o, assigned_name: (o as any).assigned_name || null, booking_id: o.booking_id || null,
        items: itemMap.get(o.id) || [], guestName: profileMap.get(o.user_id) || "Guest",
        propertyName: listing?.name || "Property", propertyImageUrls: listing?.imageUrls || [],
      };
    }));
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const ch = supabase.channel("dashboard-orders-widget")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadOrders()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isDemoMode]);

  const loadClientHistory = async (userId: string) => {
    setHistoryLoading(true);
    const [ordersRes, bookingsRes, itemsRes] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(15),
      supabase.from("bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(15),
      supabase.from("order_items").select("*"),
    ]);
    const clientOrders = (ordersRes.data || []).map(o => {
      const listing = listingMapRef.get(o.property_id);
      return { id: o.id, total: Number(o.total), status: o.status, created_at: o.created_at, propertyName: listing?.name || "Property", items: (itemsRes.data || []).filter(it => it.order_id === o.id) };
    });
    const clientBookings = (bookingsRes.data || []).map(b => {
      const listing = listingMapRef.get(b.property_id);
      return { id: b.id, date: b.date, slot: b.slot, status: b.status, total: Number(b.total), propertyName: listing?.name || "Property" };
    });
    const totalSpent = clientOrders.reduce((s, o) => s + o.total, 0) + clientBookings.reduce((s, b) => s + b.total, 0);
    setClientHistory({ orders: clientOrders, bookings: clientBookings, totalSpent });
    setHistoryLoading(false);
  };

  const openDetail = (order: LiveOrder) => {
    setSelectedOrder(order);
    setDetailTab("details");
    setClientHistory(null);
    loadClientHistory(order.user_id);
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

  const formatDT = (ts: string) => {
    const d = new Date(ts);
    return {
      time: d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
      date: d.toLocaleDateString("en", { day: "numeric", month: "short" }),
      full: d.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
  };

  if (loading) return <div className="rounded-2xl bg-card border border-border/60 p-4 animate-pulse h-32" />;

  return (
    <>
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        {isDemo && <DemoDataBanner entityName="orders" />}
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
                const dt = formatDT(order.created_at);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                    onClick={() => openDetail(order)}
                    className="rounded-xl border border-border/60 p-3 hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const thumb = getListingThumbnail(order.propertyName, order.propertyImageUrls, { preferMapped: true });
                          return thumb ? (
                            <img src={thumb} alt={order.propertyName} className="w-7 h-7 rounded-lg object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground/60">
                              {order.propertyName[0]}
                            </div>
                          );
                        })()}
                        <div>
                          <p className="text-[11px] font-semibold text-foreground">{order.guestName}</p>
                          <p className="text-[9px] text-muted-foreground flex items-center gap-0.5"><MapPin size={7} /> {order.propertyName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isPending ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                          {isPending ? "Waiting" : "Cooking"}
                        </span>
                        <p className="text-[8px] text-muted-foreground mt-0.5 flex items-center gap-0.5 justify-end">
                          <Clock size={7} /> {dt.time} · {dt.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {order.items.slice(0, 3).map((item, j) => (
                        <span key={j} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-md">
                          {item.item_emoji} {item.item_name} ×{item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && <span className="text-[9px] text-muted-foreground">+{order.items.length - 3}</span>}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-foreground tabular-nums">₹{Number(order.total).toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, si) => (
                          <div key={step} className={`w-4 h-1 rounded-full ${si <= stepIdx ? "bg-primary" : "bg-muted"}`} />
                        ))}
                        <ChevronRight size={10} className="text-muted-foreground ml-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-0 overflow-hidden">
          {selectedOrder && (
            <div className="flex flex-col h-full">
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
              </div>

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

                    {/* Order Notes */}
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
