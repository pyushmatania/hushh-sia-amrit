import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Search, CheckCircle2, Clock, Ban, ChevronRight, Filter, Download, Users, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Booking {
  id: string; booking_id: string; user_id: string; property_id: string;
  date: string; slot: string; guests: number; total: number;
  status: string; created_at: string; propertyName?: string;
  rooms_count?: number | null; extra_mattresses?: number | null;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock; border: string }> = {
  upcoming: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", icon: Clock, border: "border-l-blue-400" },
  active: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2, border: "border-l-emerald-400" },
  confirmed: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2, border: "border-l-emerald-400" },
  completed: { color: "text-zinc-500", bg: "bg-zinc-100 dark:bg-zinc-800", icon: CheckCircle2, border: "border-l-zinc-300" },
  cancelled: { color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10", icon: Ban, border: "border-l-rose-400" },
  pending: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", icon: Clock, border: "border-l-amber-400" },
};

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function AdminBookings({ onNavigate }: { onNavigate?: (page: string, ctx?: { bookingId?: string; propertyId?: string }) => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [propertyNames, setPropertyNames] = useState<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    const [bookingsRes, listingsRes] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("host_listings").select("id, name"),
    ]);
    const listingMap = new Map<string, string>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));
    setPropertyNames(listingMap);
    const data = (bookingsRes.data ?? []).map(b => ({
      ...b,
      propertyName: listingMap.get(b.property_id) || `Property ${b.property_id.slice(0, 6)}`,
    }));
    setBookings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  // Unique properties from bookings
  const uniqueProperties = Array.from(new Set(bookings.map(b => b.property_id))).map(id => ({
    id,
    name: propertyNames.get(id) || `Property ${id.slice(0, 6)}`,
  }));

  const filtered = bookings.filter(b =>
    (statusFilter === "all" || b.status === statusFilter) &&
    (propertyFilter === "all" || b.property_id === propertyFilter) &&
    (b.booking_id?.toLowerCase().includes(search.toLowerCase()) || b.property_id?.toLowerCase().includes(search.toLowerCase()) || b.propertyName?.toLowerCase().includes(search.toLowerCase()))
  );

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const statuses = ["all", "pending", "upcoming", "confirmed", "active", "completed", "cancelled"];

  // Summary stats
  const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
  const totalGuests = bookings.reduce((s, b) => s + b.guests, 0);
  const activeCount = bookings.filter(b => b.status === "active" || b.status === "upcoming" || b.status === "confirmed").length;

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/10 flex items-center justify-center shadow-sm">
            <CalendarCheck size={20} className="text-sky-600" />
          </div>
          Bookings
        </h1>
        <p className="text-sm text-zinc-400 mt-1">{bookings.length} total bookings across all properties</p>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Active Bookings", value: activeCount.toString(), icon: CalendarCheck, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Total Guests", value: totalGuests.toString(), icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">{stat.value}</p>
              <p className="text-[10px] text-zinc-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search by ID or property..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => {
            const count = s === "all" ? bookings.length : bookings.filter(b => b.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                  statusFilter === s
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-500/20"
                    : "bg-white dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600 border border-zinc-100 dark:border-zinc-700 hover:border-zinc-200"
                }`}>
                {s} {count > 0 && <span className="ml-1 text-[9px] opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Property Filter */}
      {uniqueProperties.length > 1 && (
        <motion.div variants={fadeUp} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setPropertyFilter("all")}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
              propertyFilter === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-secondary/60 text-muted-foreground border-border/60 hover:bg-secondary"
            }`}
          >
            All Venues
          </button>
          {uniqueProperties.map(p => {
            const count = bookings.filter(b => b.property_id === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setPropertyFilter(p.id === propertyFilter ? "all" : p.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all truncate max-w-[160px] ${
                  propertyFilter === p.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-secondary/60 text-muted-foreground border-border/60 hover:bg-secondary"
                }`}
              >
                {p.name} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-[76px] rounded-2xl overflow-hidden">
              <div className="h-full bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 animate-pulse" style={{ backgroundSize: "200% 100%", animation: `shimmer 1.5s ease-in-out infinite ${i * 0.1}s` }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <CalendarCheck size={28} className="text-zinc-400" />
          </motion.div>
          <p className="text-zinc-500 text-sm font-medium">No bookings found</p>
          <p className="text-zinc-400 text-xs mt-1">Try adjusting your filters</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {filtered.map((b, i) => {
              const sc = statusConfig[b.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ x: 4, transition: { duration: 0.15 } }}
                  onClick={() => onNavigate?.("history", { bookingId: b.booking_id, propertyId: b.property_id })}
                  className={`rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100/80 dark:border-zinc-800/80 border-l-[3px] ${sc.border} p-4 ${onNavigate ? "cursor-pointer hover:shadow-lg hover:shadow-zinc-100/50 hover:border-indigo-200 dark:hover:border-indigo-500/30" : ""} transition-all duration-200 group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 12 }}
                        className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center shadow-sm`}
                      >
                        <StatusIcon size={18} className={sc.color} />
                      </motion.div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{b.propertyName}</p>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${sc.bg} ${sc.color}`}>{b.status}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-zinc-500 font-medium font-mono">#{b.booking_id?.slice(0, 10)}</span>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                            <span className="text-[11px] text-zinc-400">{b.date}</span>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                            <span className="text-[11px] text-zinc-400">{b.slot}</span>
                            <span className="text-zinc-300 dark:text-zinc-600">·</span>
                            <span className="text-[11px] text-zinc-400 flex items-center gap-0.5"><Users size={10} /> {b.guests}</span>
                          </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 tabular-nums">₹{Number(b.total).toLocaleString()}</p>
                        <p className="text-[10px] text-zinc-400">{new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                      <select
                        value={b.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); updateStatus(b.id, e.target.value); }}
                        className="text-[11px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-zinc-600 dark:text-zinc-300 hover:border-indigo-300 transition"
                      >
                        {["pending","upcoming","confirmed","active","completed","cancelled"].map(s =>
                          <option key={s} value={s}>{s}</option>
                        )}
                      </select>
                      {onNavigate && <ChevronRight size={16} className="text-zinc-300 group-hover:text-indigo-400 transition" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
