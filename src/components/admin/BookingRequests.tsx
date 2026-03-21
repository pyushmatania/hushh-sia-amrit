import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Check, X, Loader2, Users, CalendarCheck,
  IndianRupee, Clock, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingRequest {
  id: string;
  booking_id: string;
  date: string;
  slot: string;
  guests: number;
  total: number;
  status: string;
  created_at: string;
  property_id: string;
  propertyName?: string;
}

type FilterStatus = "all" | "upcoming" | "confirmed" | "cancelled" | "completed";

export default function BookingRequests() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const load = useCallback(async () => {
    const [bookingsRes, listingsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("id, booking_id, date, slot, guests, total, status, created_at, property_id")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("host_listings").select("id, name"),
    ]);

    const listingMap = new Map<string, string>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));

    const data = (bookingsRes.data ?? []).map(b => ({
      ...b,
      propertyName: listingMap.get(b.property_id) || `Property ${b.property_id.slice(0, 6)}`,
    }));
    setBookings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("booking-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const updateStatus = async (id: string, status: "confirmed" | "cancelled") => {
    setUpdating(id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update booking");
    } else {
      toast.success(`Booking ${status}`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
    setUpdating(null);
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    all: bookings.length,
    upcoming: bookings.filter(b => b.status === "upcoming").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Inbox size={18} className="text-primary" /> Booking Requests
        </h2>
        <p className="text-xs text-muted-foreground">Accept, reject, and manage incoming bookings</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(["all", "upcoming", "confirmed", "cancelled", "completed"] as FilterStatus[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${
              filter === f ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Inbox size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No {filter === "all" ? "" : filter} bookings</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">#{b.booking_id.slice(0, 10)}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(b.created_at)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                    b.status === "confirmed" ? "bg-emerald-500/15 text-emerald-500" :
                    b.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                    b.status === "completed" ? "bg-muted-foreground/15 text-muted-foreground" :
                    "bg-blue-500/15 text-blue-500"
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarCheck size={12} />
                    {b.date} · {b.slot}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Users size={12} />
                    {b.guests} guests
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-foreground font-medium">
                    <IndianRupee size={12} />
                    ₹{Number(b.total).toLocaleString()}
                  </div>
                </div>

                {b.status === "upcoming" && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => updateStatus(b.id, "confirmed")}
                      disabled={updating === b.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-medium hover:bg-emerald-500/20 transition disabled:opacity-50"
                    >
                      {updating === b.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(b.id, "cancelled")}
                      disabled={updating === b.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition disabled:opacity-50"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
