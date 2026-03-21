import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, Clock, Filter, Loader2, Package, ShoppingCart, CalendarCheck, AlertTriangle, Users, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  icon: string;
  read: boolean;
  created_at: string;
  user_id: string;
}

const typeIcons: Record<string, { icon: typeof Bell; color: string }> = {
  booking: { icon: CalendarCheck, color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
  order: { icon: ShoppingCart, color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10" },
  alert: { icon: AlertTriangle, color: "text-red-600 bg-red-50 dark:bg-red-500/10" },
  system: { icon: Bell, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" },
  inventory: { icon: Package, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  user: { icon: Users, color: "text-pink-600 bg-pink-50 dark:bg-pink-500/10" },
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "booking" | "order" | "alert">("all");

  useEffect(() => {
    loadNotifications();
    const ch = supabase.channel("admin-notifications-rt").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => loadNotifications()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const loadNotifications = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
    setNotifications(data ?? []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = notifications.filter(n => {
    if (filter === "unread" && n.read) return false;
    if (filter === "booking" && n.type !== "booking") return false;
    if (filter === "order" && n.type !== "order") return false;
    if (filter === "alert" && !["alert", "system"].includes(n.type)) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-500/10 dark:to-pink-500/10 flex items-center justify-center shadow-sm">
              <Bell size={20} className="text-rose-600" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                className="ml-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-100 dark:border-rose-500/20">
                {unreadCount}
              </motion.span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{notifications.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(["all", "unread", "booking", "order", "alert"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
              filter === f ? "bg-primary/10 text-primary border border-primary/20" : "bg-card text-muted-foreground border border-border"
            }`}>
            {f} {f === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BellOff size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((n, i) => {
              const typeInfo = typeIcons[n.type] || typeIcons.system;
              const Icon = typeInfo.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`rounded-2xl bg-card border border-border/80 p-4 transition-all cursor-pointer ${!n.read ? "border-l-[3px] border-l-primary bg-primary/[0.02]" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${typeInfo.color} flex items-center justify-center shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-semibold ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.icon} {n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Clock size={9} /> {timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
