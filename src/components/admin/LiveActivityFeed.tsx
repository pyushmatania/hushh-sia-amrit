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
  bg: string;
}

const eventConfig = {
  booking: { icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  order: { icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  cancel: { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
  user: { icon: UserPlus, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
  review: { icon: Star, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
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
        id: `b-${b.id}`, type, title: type === "cancel" ? "Booking cancelled" : "New booking",
        detail: `#${b.booking_id?.slice(0, 8)} · ${b.date} ${b.slot} · ₹${Number(b.total).toLocaleString()}`,
        time: b.created_at, icon: cfg.icon, color: cfg.color, bg: cfg.bg,
      });
    });

    (ordersRes.data ?? []).forEach(o => {
      feed.push({
        id: `o-${o.id}`, type: "order", title: `Order ${o.status}`,
        detail: `₹${Number(o.total).toLocaleString()}`,
        time: o.created_at, icon: eventConfig.order.icon, color: eventConfig.order.color, bg: eventConfig.order.bg,
      });
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
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5"
    >
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
          <Activity size={14} className="text-indigo-600" />
        </div>
        Live Activity
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </h3>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={20} /></div>
      ) : events.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-6">No activity yet</p>
      ) : (
        <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {events.map((event, i) => {
              const Icon = event.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 py-2.5 border-b border-zinc-50 dark:border-zinc-800 last:border-0"
                >
                  <div className={`w-8 h-8 rounded-xl ${event.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={14} className={event.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{event.title}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{event.detail}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">{timeAgo(event.time)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
