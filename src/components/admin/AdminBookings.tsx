import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Search, CheckCircle2, Clock, Ban, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Booking {
  id: string; booking_id: string; user_id: string; property_id: string;
  date: string; slot: string; guests: number; total: number;
  status: string; created_at: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  upcoming: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", icon: Clock },
  active: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
  confirmed: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
  completed: { color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", icon: CheckCircle2 },
  cancelled: { color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", icon: Ban },
  pending: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", icon: Clock },
};

export default function AdminBookings({ onNavigate }: { onNavigate?: (page: string, ctx?: { bookingId?: string; propertyId?: string }) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("bookings").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
  }, []);

  const filtered = bookings.filter(b =>
    (statusFilter === "all" || b.status === statusFilter) &&
    (b.booking_id?.toLowerCase().includes(search.toLowerCase()) || b.property_id?.toLowerCase().includes(search.toLowerCase()))
  );

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const statuses = ["all", "pending", "upcoming", "confirmed", "active", "completed", "cancelled"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
            <CalendarCheck size={18} className="text-sky-600" />
          </div>
          Bookings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">{bookings.length} total bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search by ID or property..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition ${
                statusFilter === s ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600" : "bg-white dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 border border-zinc-100 dark:border-zinc-700"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <CalendarCheck size={24} className="text-zinc-400" />
          </div>
          <p className="text-zinc-400 text-sm">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b, i) => {
            const sc = statusConfig[b.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onNavigate?.("history", { bookingId: b.booking_id, propertyId: b.property_id })}
                className={`rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 ${onNavigate ? "cursor-pointer hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30" : ""} transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${sc.bg} flex items-center justify-center`}>
                      <StatusIcon size={16} className={sc.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 font-mono">{b.booking_id?.slice(0, 12)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${sc.bg} ${sc.color}`}>{b.status}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-zinc-500">{b.date}</span>
                        <span className="text-zinc-300">·</span>
                        <span className="text-[11px] text-zinc-400">{b.slot}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">₹{Number(b.total).toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-400">{b.guests} guests</p>
                    </div>
                    <select
                      value={b.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); updateStatus(b.id, e.target.value); }}
                      className="text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1 text-zinc-600 dark:text-zinc-300"
                    >
                      {["pending","upcoming","confirmed","active","completed","cancelled"].map(s =>
                        <option key={s} value={s}>{s}</option>
                      )}
                    </select>
                    {onNavigate && <ChevronRight size={16} className="text-zinc-300" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
