import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CalendarCheck, ShoppingCart, XCircle, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedEvent {
  id: string; type: string; title: string; detail: string; time: string;
  icon: typeof Activity; color: string;
}

const cfg: Record<string, { icon: typeof Activity; color: string }> = {
  booking: { icon: CalendarCheck, color: "text-emerald-600" },
  order: { icon: ShoppingCart, color: "text-blue-600" },
  cancel: { icon: XCircle, color: "text-rose-600" },
  review: { icon: Star, color: "text-amber-600" },
};

export default function LiveActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecent = async () => {
    const [bookingsRes, ordersRes] = await Promise.all([
      supabase.from("bookings").select("id, booking_id, total, status, date, slot, created_at").order("created_at", { ascending: false }).limit(15),
      supabase.from("orders").select("id, total, status, created_at").order("created_at", { ascending: false }).limit(10),
    ]);
    const feed: FeedEvent[] = [];
    (bookingsRes.data ?? []).forEach(b => {
      const type = b.status === "cancelled" ? "cancel" : "booking";
      const c = cfg[type];
      feed.push({ id: `b-${b.id}`, type, title: type === "cancel" ? "Cancelled" : "New booking", detail: `#${b.booking_id?.slice(0, 8)} · ₹${Number(b.total).toLocaleString()}`, time: b.created_at, icon: c.icon, color: c.color });
    });
    (ordersRes.data ?? []).forEach(o => {
      feed.push({ id: `o-${o.id}`, type: "order", title: `Order ${o.status}`, detail: `₹${Number(o.total).toLocaleString()}`, time: o.created_at, icon: cfg.order.icon, color: cfg.order.color });
    });
    feed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setEvents(feed.slice(0, 20));
    setLoading(false);
  };

  useEffect(() => {
    loadRecent();
    const ch1 = supabase.channel("feed-bookings").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => loadRecent()).subscribe();
    const ch2 = supabase.channel("feed-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadRecent()).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, []);

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
    <div className="rounded-2xl bg-card border border-border/60 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-primary" />
        <span className="text-xs font-semibold text-foreground">Live Activity</span>
        <span className="relative flex h-1.5 w-1.5 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted-foreground" size={18} /></div>
      ) : events.length === 0 ? (
        <p className="text-[11px] text-muted-foreground text-center py-6">No activity yet</p>
      ) : (
        <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {events.map((event, i) => {
              const Icon = event.icon;
              return (
                <motion.div key={event.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-2.5 py-2 border-b border-border/40 last:border-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon size={12} className={event.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground">{event.title}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{event.detail}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap shrink-0">{timeAgo(event.time)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
