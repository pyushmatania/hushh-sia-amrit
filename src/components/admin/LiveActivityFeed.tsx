import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, CalendarCheck, ShoppingCart, XCircle, UserPlus,
  Star, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedEvent {
  id: string;
  type: "booking" | "order" | "cancel" | "user" | "review";
  title: string;
  detail: string;
  time: string;
  icon: typeof Activity;
  color: string;
}

const eventConfig = {
  booking: { icon: CalendarCheck, color: "text-emerald-400" },
  order: { icon: ShoppingCart, color: "text-blue-400" },
  cancel: { icon: XCircle, color: "text-destructive" },
  user: { icon: UserPlus, color: "text-amber-400" },
  review: { icon: Star, color: "text-primary" },
};

export default function LiveActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecent = async () => {
    const [bookingsRes, ordersRes] = await Promise.all([
      supabase.from("bookings").select("id, booking_id, total, status, date, slot, created_at")
        .order("created_at", { ascending: false }).limit(15),
      supabase.from("orders").select("id, total, status, created_at")
        .order("created_at", { ascending: false }).limit(10),
    ]);

    const feed: FeedEvent[] = [];

    (bookingsRes.data ?? []).forEach(b => {
      const type = b.status === "cancelled" ? "cancel" : "booking";
      const cfg = eventConfig[type];
      feed.push({
        id: `b-${b.id}`,
        type,
        title: type === "cancel" ? "Booking cancelled" : "New booking",
        detail: `#${b.booking_id?.slice(0, 8)} · ${b.date} ${b.slot} · ₹${Number(b.total).toLocaleString()}`,
        time: b.created_at,
        icon: cfg.icon,
        color: cfg.color,
      });
    });

    (ordersRes.data ?? []).forEach(o => {
      feed.push({
        id: `o-${o.id}`,
        type: "order",
        title: `Order ${o.status}`,
        detail: `₹${Number(o.total).toLocaleString()}`,
        time: o.created_at,
        icon: eventConfig.order.icon,
        color: eventConfig.order.color,
      });
    });

    feed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setEvents(feed.slice(0, 20));
    setLoading(false);
  };

  useEffect(() => {
    loadRecent();

    const ch1 = supabase
      .channel("feed-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => loadRecent())
      .subscribe();

    const ch2 = supabase
      .channel("feed-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => loadRecent())
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Activity size={14} className="text-primary" />
        Live Activity
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-primary" size={20} />
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
      ) : (
        <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {events.map((event, i) => {
              const Icon = event.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Icon size={14} className={event.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{event.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{event.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                    {timeAgo(event.time)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
