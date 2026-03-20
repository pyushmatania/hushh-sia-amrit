import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, UtensilsCrossed, CalendarCheck, Clock, ChefHat, User, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PendingItem {
  id: string;
  type: "order" | "booking" | "verification";
  title: string;
  subtitle: string;
  assignedTo?: string;
  time: string;
  status: string;
  emoji: string;
}

export default function FloatingChecklist() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [ordersRes, bookingsRes, verifRes, profilesRes, listingsRes] = await Promise.all([
      supabase.from("orders").select("*").in("status", ["pending", "preparing"]).order("created_at", { ascending: false }).limit(10),
      supabase.from("bookings").select("*").in("status", ["pending", "upcoming"]).order("created_at", { ascending: false }).limit(10),
      supabase.from("identity_verifications").select("*").eq("status", "pending").order("submitted_at", { ascending: false }).limit(5),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name"),
    ]);

    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    const listingMap = new Map<string, string>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));

    const orderItemsRes = ordersRes.data?.length
      ? await supabase.from("order_items").select("*").in("order_id", ordersRes.data.map(o => o.id))
      : { data: [] };

    const itemMap = new Map<string, string>();
    (orderItemsRes.data ?? []).forEach(item => {
      const existing = itemMap.get(item.order_id) || "";
      itemMap.set(item.order_id, existing ? `${existing}, ${item.item_emoji}${item.item_name}` : `${item.item_emoji}${item.item_name}`);
    });

    const timeAgo = (ts: string) => {
      const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
      if (mins < 1) return "now";
      if (mins < 60) return `${mins}m`;
      return `${Math.floor(mins / 60)}h`;
    };

    const pending: PendingItem[] = [];

    (ordersRes.data ?? []).forEach(o => {
      pending.push({
        id: o.id,
        type: "order",
        title: itemMap.get(o.id) || `₹${Number(o.total).toLocaleString()} order`,
        subtitle: `${profileMap.get(o.user_id) || "Guest"} · ${listingMap.get(o.property_id) || "Property"}`,
        assignedTo: (o as any).assigned_name || undefined,
        time: timeAgo(o.created_at),
        status: o.status,
        emoji: o.status === "pending" ? "⏳" : "🍳",
      });
    });

    (bookingsRes.data ?? []).forEach(b => {
      pending.push({
        id: b.id,
        type: "booking",
        title: `${listingMap.get(b.property_id) || "Property"} · ${b.slot}`,
        subtitle: `${profileMap.get(b.user_id) || "Guest"} · ${b.guests} guests · ₹${Number(b.total).toLocaleString()}`,
        time: b.date,
        status: b.status,
        emoji: "📅",
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
      });
    });

    setItems(pending);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("floating-pending")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const orderCount = items.filter(i => i.type === "order").length;
  const bookingCount = items.filter(i => i.type === "booking").length;
  const verifCount = items.filter(i => i.type === "verification").length;

  const typeColors: Record<string, string> = {
    order: "border-amber-500/30 bg-amber-500/5",
    booking: "border-blue-500/30 bg-blue-500/5",
    verification: "border-purple-500/30 bg-purple-500/5",
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Bell size={22} />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {items.length}
            </span>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:bg-transparent bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[75vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Bell size={16} className="text-primary" /> Pending Actions
                  </h3>
                  <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-secondary">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="flex gap-2">
                  {orderCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">
                      🍽️ {orderCount} orders
                    </span>
                  )}
                  {bookingCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold">
                      📅 {bookingCount} bookings
                    </span>
                  )}
                  {verifCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold">
                      🪪 {verifCount} IDs
                    </span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {loading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">Loading...</div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-2xl mb-1">✅</p>
                    <p className="text-xs text-muted-foreground">All clear! Nothing pending.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`rounded-xl border p-3 ${typeColors[item.type]}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-lg mt-0.5">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                            {item.assignedTo && (
                              <p className="text-[10px] text-foreground/70 flex items-center gap-1 mt-0.5">
                                <ChefHat size={9} /> {item.assignedTo}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                              item.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                              item.status === "preparing" ? "bg-blue-500/15 text-blue-400" :
                              "bg-secondary text-muted-foreground"
                            }`}>
                              {item.status}
                            </span>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{item.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
