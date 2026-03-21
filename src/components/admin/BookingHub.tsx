import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, Search, CheckCircle2, Clock, Ban, ChevronRight, Users, IndianRupee,
  Inbox, Check, X, Loader2, TrendingUp, TrendingDown, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, MapPin, Star, Filter, Eye, Building2, Activity,
  CalendarIcon, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell } from "recharts";

interface Booking {
  id: string; booking_id: string; user_id: string; property_id: string;
  date: string; slot: string; guests: number; total: number;
  status: string; created_at: string; updated_at: string;
  propertyName?: string; propertyImage?: string; propertyLocation?: string;
  userName?: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock; border: string; glow: string }> = {
  pending:   { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", icon: Clock, border: "border-l-amber-400", glow: "shadow-amber-100/50" },
  upcoming:  { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", icon: Clock, border: "border-l-blue-400", glow: "shadow-blue-100/50" },
  confirmed: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2, border: "border-l-emerald-400", glow: "shadow-emerald-100/50" },
  active:    { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: Activity, border: "border-l-emerald-400", glow: "shadow-emerald-100/50" },
  completed: { color: "text-zinc-500 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800", icon: CheckCircle2, border: "border-l-zinc-300", glow: "shadow-zinc-100/50" },
  cancelled: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", icon: Ban, border: "border-l-rose-400", glow: "shadow-rose-100/50" },
};

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "all", label: "All Bookings", icon: CalendarCheck },
  { id: "requests", label: "Requests", icon: Inbox },
  { id: "insights", label: "Insights", icon: PieChart },
] as const;

type TabId = typeof TABS[number]["id"];

const PIE_COLORS = ["hsl(221,83%,53%)", "hsl(142,71%,45%)", "hsl(0,84%,60%)", "hsl(38,92%,50%)", "hsl(262,83%,58%)", "hsl(200,98%,39%)"];

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function BookingHub({
  onNavigate,
}: {
  onNavigate?: (page: string, ctx?: { bookingId?: string; propertyId?: string; userId?: string }) => void;
}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [tab, setTab] = useState<TabId>("overview");
  const [updating, setUpdating] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  // Phase 2: Bulk actions
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [propertyMap, setPropertyMap] = useState<Map<string, { name: string; image: string; location: string; capacity: number; category: string }>>(new Map());
  const [profileMap, setProfileMap] = useState<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    const [bookingsRes, listingsRes, profilesRes] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("host_listings").select("id, name, image_urls, location, capacity, primary_category"),
      supabase.from("profiles").select("user_id, display_name"),
    ]);

    const lMap = new Map<string, { name: string; image: string; location: string; capacity: number; category: string }>();
    (listingsRes.data ?? []).forEach(l => lMap.set(l.id, { name: l.name, image: l.image_urls?.[0] || "", location: l.location, capacity: l.capacity || 15, category: l.primary_category || "experience" }));
    setPropertyMap(lMap);

    const pMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => pMap.set(p.user_id, p.display_name || "Guest"));
    setProfileMap(pMap);

    const data = (bookingsRes.data ?? []).map(b => {
      const prop = lMap.get(b.property_id);
      return {
        ...b,
        propertyName: prop?.name || `Property ${b.property_id.slice(0, 6)}`,
        propertyImage: prop?.image || "",
        propertyLocation: prop?.location || "",
        userName: pMap.get(b.user_id) || "Guest",
      };
    });
    setBookings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("booking-hub-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // Derived stats
  const stats = useMemo(() => {
    const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
    const totalGuests = bookings.reduce((s, b) => s + b.guests, 0);
    const activeCount = bookings.filter(b => ["active", "upcoming", "confirmed"].includes(b.status)).length;
    const pendingCount = bookings.filter(b => b.status === "pending" || b.status === "upcoming").length;
    const completedCount = bookings.filter(b => b.status === "completed").length;
    const cancelledCount = bookings.filter(b => b.status === "cancelled").length;
    const conversionRate = bookings.length > 0 ? Math.round(((completedCount + activeCount) / bookings.length) * 100) : 0;
    const avgBookingValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;
    return { totalRevenue, totalGuests, activeCount, pendingCount, completedCount, cancelledCount, conversionRate, avgBookingValue };
  }, [bookings]);

  // Revenue trend (last 14 days)
  const revenueTrend = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })] = 0;
    }
    bookings.forEach(b => {
      const d = new Date(b.created_at);
      const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (key in days) days[key] += Number(b.total);
    });
    return Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
  }, [bookings]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  // Top properties
  const topProperties = useMemo(() => {
    const map: Record<string, { name: string; image: string; count: number; revenue: number }> = {};
    bookings.forEach(b => {
      if (!map[b.property_id]) map[b.property_id] = { name: b.propertyName || "", image: b.propertyImage || "", count: 0, revenue: 0 };
      map[b.property_id].count++;
      map[b.property_id].revenue += Number(b.total);
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5).map(([id, d]) => ({ id, ...d }));
  }, [bookings]);

  // Top clients
  const topClients = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    bookings.forEach(b => {
      if (!map[b.user_id]) map[b.user_id] = { name: b.userName || "Guest", count: 0, revenue: 0 };
      map[b.user_id].count++;
      map[b.user_id].revenue += Number(b.total);
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5).map(([id, d]) => ({ id, ...d }));
  }, [bookings]);

  // Slot popularity
  const slotPopularity = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => { const s = b.slot?.split("·")[0]?.trim() || "Other"; map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([slot, count]) => ({ slot, count }));
  }, [bookings]);

  const uniqueProperties = useMemo(() =>
    Array.from(new Set(bookings.map(b => b.property_id))).map(id => ({
      id,
      name: propertyMap.get(id)?.name || `Property ${id.slice(0, 6)}`,
      image: propertyMap.get(id)?.image || "",
    })),
  [bookings, propertyMap]);

  const filtered = useMemo(() => bookings.filter(b => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (propertyFilter !== "all" && b.property_id !== propertyFilter) return false;
    if (dateFrom) {
      const bDate = new Date(b.created_at);
      bDate.setHours(0, 0, 0, 0);
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (bDate < from) return false;
    }
    if (dateTo) {
      const bDate = new Date(b.created_at);
      bDate.setHours(23, 59, 59, 999);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (bDate > to) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (b.booking_id?.toLowerCase().includes(q) ||
        b.propertyName?.toLowerCase().includes(q) ||
        b.userName?.toLowerCase().includes(q));
    }
    return true;
  }), [bookings, statusFilter, propertyFilter, search, dateFrom, dateTo]);

  const pendingBookings = useMemo(() => bookings.filter(b => b.status === "upcoming" || b.status === "pending"), [bookings]);

  // Capacity-aware conflict detection
  const ROOM_CAPACITY = 2; // persons per room
  const EXTRA_MATTRESS_LIMIT = 1; // extra person per room on mattress

  const getCapacityInfo = useCallback((propertyId: string) => {
    const prop = propertyMap.get(propertyId);
    const category = prop?.category || "experience";
    const totalCapacity = prop?.capacity || 15;

    if (category === "stay") {
      // Stay: room-based — capacity field = total rooms * persons per room
      const rooms = Math.max(1, Math.floor(totalCapacity / ROOM_CAPACITY));
      return { type: "stay" as const, rooms, perRoom: ROOM_CAPACITY, extraMattress: EXTRA_MATTRESS_LIMIT, maxGuests: rooms * (ROOM_CAPACITY + EXTRA_MATTRESS_LIMIT), totalCapacity };
    }
    // Experience / Service / Curation: flat guest limit
    return { type: "experience" as const, rooms: 0, perRoom: 0, extraMattress: 0, maxGuests: totalCapacity, totalCapacity };
  }, [propertyMap]);

  const conflictMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const activeBookings = bookings.filter(b => !["cancelled", "completed"].includes(b.status));
    for (let i = 0; i < activeBookings.length; i++) {
      for (let j = i + 1; j < activeBookings.length; j++) {
        const a = activeBookings[i], b2 = activeBookings[j];
        if (a.property_id === b2.property_id && a.date === b2.date && a.slot === b2.slot) {
          map.set(a.id, [...(map.get(a.id) || []), b2.id]);
          map.set(b2.id, [...(map.get(b2.id) || []), a.id]);
        }
      }
    }
    return map;
  }, [bookings]);

  // Capacity analysis for a booking slot
  const getSlotCapacity = useCallback((booking: Booking) => {
    const capInfo = getCapacityInfo(booking.property_id);
    const activeBookings = bookings.filter(b =>
      b.id !== booking.id &&
      b.property_id === booking.property_id &&
      b.date === booking.date &&
      b.slot === booking.slot &&
      !["cancelled", "completed"].includes(b.status)
    );
    const totalGuests = activeBookings.reduce((s, b) => s + b.guests, 0) + booking.guests;
    const isOverCapacity = totalGuests > capInfo.maxGuests;

    if (capInfo.type === "stay") {
      const roomsNeeded = Math.ceil(totalGuests / (ROOM_CAPACITY + EXTRA_MATTRESS_LIMIT));
      const needsMattress = totalGuests > roomsNeeded * ROOM_CAPACITY;
      return { ...capInfo, totalGuests, isOverCapacity, roomsNeeded, needsMattress, otherBookings: activeBookings.length };
    }
    return { ...capInfo, totalGuests, isOverCapacity, roomsNeeded: 0, needsMattress: false, otherBookings: activeBookings.length };
  }, [bookings, getCapacityInfo]);

  const getConflicts = useCallback((booking: Booking) => {
    const ids = conflictMap.get(booking.id);
    if (!ids || ids.length === 0) return [];
    return bookings.filter(b => ids.includes(b.id));
  }, [conflictMap, bookings]);

  const updateStatus = async (id: string, status: string) => {
    if (status === "confirmed" || status === "active") {
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        const cap = getSlotCapacity(booking);
        if (cap.otherBookings > 0 || cap.isOverCapacity) {
          let msg = `⚠️ Capacity Alert!\n\n`;
          if (cap.type === "stay") {
            msg += `Stay Property: ${cap.rooms} room(s), ${cap.perRoom} per room + ${cap.extraMattress} mattress\n`;
            msg += `Max capacity: ${cap.maxGuests} guests\n`;
            msg += `Total guests for this slot: ${cap.totalGuests}\n`;
            if (cap.isOverCapacity) {
              msg += `\n🚨 OVER CAPACITY by ${cap.totalGuests - cap.maxGuests} guest(s)!\n`;
              msg += `Rooms needed: ${cap.roomsNeeded} (only ${cap.rooms} available)\n`;
            } else {
              msg += `\nRooms needed: ${cap.roomsNeeded}`;
              if (cap.needsMattress) msg += ` (extra mattress required)`;
              msg += `\n`;
            }
          } else {
            msg += `Experience/Event: Max ${cap.maxGuests} guests\n`;
            msg += `Total guests for this slot: ${cap.totalGuests}\n`;
            if (cap.isOverCapacity) msg += `\n🚨 OVER CAPACITY by ${cap.totalGuests - cap.maxGuests} guest(s)!\n`;
          }
          msg += `\n${cap.otherBookings} other booking(s) on same slot.\n\nProceed anyway?`;
          if (!window.confirm(msg)) return;
        }
      }
    }
    setUpdating(id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update"); else {
      toast.success(`Booking ${status}`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
    setUpdating(null);
  };

  // Phase 2: Bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(b => b.id));
  };
  const bulkUpdateStatus = async (status: string) => {
    setBulkUpdating(true);
    for (const id of selectedIds) {
      await supabase.from("bookings").update({ status }).eq("id", id);
    }
    setBookings(prev => prev.map(b => selectedIds.includes(b.id) ? { ...b, status } : b));
    toast.success(`${selectedIds.length} bookings updated to ${status}`);
    setSelectedIds([]);
    setBulkUpdating(false);
    setBulkMode(false);
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statuses = ["all", "pending", "upcoming", "confirmed", "active", "completed", "cancelled"];

  return (
    <motion.div className="space-y-5" initial="initial" animate="animate">
      {/* Header */}
      <motion.div {...fadeUp}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/10 flex items-center justify-center shadow-sm">
            <CalendarCheck size={20} className="text-sky-600 dark:text-sky-400" />
          </div>
          Booking Hub
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{bookings.length} total bookings · ₹{stats.totalRevenue.toLocaleString("en-IN")} revenue</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div {...fadeUp} className="flex gap-1 bg-secondary/50 rounded-2xl p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(" ")[0]}</span>
            {t.id === "requests" && stats.pendingCount > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">{stats.pendingCount}</span>
            )}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {tab === "overview" && <OverviewTab key="overview" stats={stats} revenueTrend={revenueTrend} statusDistribution={statusDistribution} topProperties={topProperties} topClients={topClients} onNavigate={onNavigate} />}
          {tab === "all" && (
            <motion.div key="all" {...fadeUp} className="space-y-4">
              {/* Bulk Mode Toggle & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant={bulkMode ? "default" : "outline"} size="sm" className="h-8 text-[11px] rounded-xl gap-1.5"
                  onClick={() => { setBulkMode(!bulkMode); setSelectedIds([]); }}>
                  <CheckCircle2 size={12} /> {bulkMode ? "Cancel Bulk" : "Bulk Select"}
                </Button>
                {bulkMode && selectedIds.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" className="h-8 text-[11px] rounded-xl" onClick={selectAll}>
                      {selectedIds.length === filtered.length ? "Deselect All" : "Select All"}
                    </Button>
                    <span className="text-[11px] text-muted-foreground font-medium">{selectedIds.length} selected</span>
                    <div className="flex gap-1 ml-auto">
                      <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400"
                        disabled={bulkUpdating} onClick={() => bulkUpdateStatus("confirmed")}>
                        <Check size={10} /> Confirm
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400"
                        disabled={bulkUpdating} onClick={() => bulkUpdateStatus("cancelled")}>
                        <X size={10} /> Cancel
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg"
                        disabled={bulkUpdating} onClick={() => bulkUpdateStatus("completed")}>
                        <CheckCircle2 size={10} /> Complete
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search bookings, properties, or clients..." value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-9 rounded-xl" />
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("h-8 px-3 text-[11px] rounded-xl gap-1.5 font-medium", !dateFrom && "text-muted-foreground")}>
                        <CalendarIcon size={12} />
                        {dateFrom ? format(dateFrom, "dd MMM yyyy") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("h-8 px-3 text-[11px] rounded-xl gap-1.5 font-medium", !dateTo && "text-muted-foreground")}>
                        <CalendarIcon size={12} />
                        {dateTo ? format(dateTo, "dd MMM yyyy") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
                    </PopoverContent>
                  </Popover>
                  {(dateFrom || dateTo) && (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] text-muted-foreground hover:text-destructive" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
                      <X size={12} /> Clear
                    </Button>
                  )}
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {statuses.map(s => {
                    const count = s === "all" ? bookings.length : bookings.filter(b => b.status === s).length;
                    return (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                          statusFilter === s
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-secondary text-muted-foreground border border-transparent hover:border-border"
                        }`}>
                        {s} {count > 0 && <span className="ml-0.5 opacity-60">({count})</span>}
                      </button>
                    );
                  })}
                </div>
                {uniqueProperties.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button onClick={() => setPropertyFilter("all")} className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${propertyFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/60 text-muted-foreground border-border/60"}`}>All Venues</button>
                    {uniqueProperties.map(p => (
                      <button key={p.id} onClick={() => setPropertyFilter(p.id === propertyFilter ? "all" : p.id)} className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all max-w-[180px] ${propertyFilter === p.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/60 text-muted-foreground border-border/60"}`}>
                        {p.image ? (
                          <img src={p.image} className="w-5 h-5 rounded-md object-cover shrink-0" alt="" />
                        ) : (
                          <Building2 size={12} className="shrink-0" />
                        )}
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking Cards */}
              {filtered.length === 0 ? (
                <EmptyState message="No bookings match your filters" />
              ) : (
                <div className="space-y-2">
                  {filtered.map((b, i) => (
                    <div key={b.id} className="flex items-start gap-2">
                      {bulkMode && (
                        <button onClick={() => toggleSelect(b.id)} className={`mt-4 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${selectedIds.includes(b.id) ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}>
                          {selectedIds.includes(b.id) && <Check size={12} className="text-primary-foreground" />}
                        </button>
                      )}
                      <div className="flex-1">
                        <BookingCard booking={b} index={i} onNavigate={onNavigate} onStatusChange={updateStatus} conflicts={getConflicts(b)} capacityInfo={getSlotCapacity(b)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {tab === "requests" && (
            <motion.div key="requests" {...fadeUp} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{pendingBookings.length} pending requests</p>
              </div>
              {pendingBookings.length === 0 ? (
                <EmptyState message="No pending requests — all caught up! 🎉" />
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((b, i) => (
                    <RequestCard key={b.id} booking={b} index={i} updating={updating} onAccept={(id: string) => updateStatus(id, "confirmed")} onReject={(id: string) => updateStatus(id, "cancelled")} onNavigate={onNavigate} timeAgo={timeAgo} conflicts={getConflicts(b)} capacityInfo={getSlotCapacity(b)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
          {tab === "insights" && <InsightsTab key="insights" bookings={bookings} slotPopularity={slotPopularity} topProperties={topProperties} topClients={topClients} onNavigate={onNavigate} />}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

/* ─── Sub Components ─── */

function StatCard({ label, value, icon: Icon, color, bg, trend }: { label: string; value: string; icon: typeof Clock; color: string; bg: string; trend?: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
        {trend && <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={10} />{trend}</span>}
      </div>
      <div>
        <p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function OverviewTab({ stats, revenueTrend, statusDistribution, topProperties, topClients, onNavigate }: any) {
  return (
    <motion.div {...fadeUp} className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} icon={IndianRupee} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
        <StatCard label="Active Bookings" value={stats.activeCount.toString()} icon={Activity} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
        <StatCard label="Avg Booking Value" value={`₹${stats.avgBookingValue.toLocaleString("en-IN")}`} icon={TrendingUp} color="text-violet-600 dark:text-violet-400" bg="bg-violet-50 dark:bg-violet-500/10" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} icon={CheckCircle2} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10" />
      </div>

      {/* Revenue Trend */}
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Revenue Trend (14 days)</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(221,83%,53%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(221,83%,53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 12, fontSize: 11, border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(221,83%,53%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution + Pending Alert */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <p className="text-xs font-semibold text-foreground mb-2">Status Mix</p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} innerRadius={25} paddingAngle={3} strokeWidth={0}>
                  {statusDistribution.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 10, border: "1px solid hsl(var(--border))" }} />
              </RPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {statusDistribution.map((s: any, i: number) => (
              <span key={s.name} className="text-[9px] font-medium flex items-center gap-1 capitalize">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {stats.pendingCount > 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-500/20 p-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-2">
                <Inbox size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.pendingCount}</p>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80">Pending Requests</p>
            </div>
            <button onClick={() => {}} className="mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline">Review Now →</button>
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 border border-emerald-200/60 dark:border-emerald-500/20 p-4 flex flex-col justify-center items-center text-center">
            <CheckCircle2 size={24} className="text-emerald-500 mb-1" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">All Clear!</p>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">No pending requests</p>
          </div>
        )}
      </div>

      {/* Top Properties */}
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Top Venues</p>
        <div className="space-y-2.5">
          {topProperties.slice(0, 4).map((p: any, i: number) => (
            <div key={p.id} onClick={() => onNavigate?.("history", { propertyId: p.id })} className="flex items-center gap-3 cursor-pointer group hover:bg-secondary/50 rounded-xl p-2 -m-2 transition">
              <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
              {p.image ? (
                <img src={p.image} className="w-9 h-9 rounded-lg object-cover" alt="" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center"><Building2 size={14} className="text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.count} bookings</p>
              </div>
              <p className="text-xs font-bold text-foreground tabular-nums">₹{p.revenue.toLocaleString("en-IN")}</p>
              <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-primary transition" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function InsightsTab({ bookings, slotPopularity, topProperties, topClients, onNavigate }: any) {
  // Bookings by day of week
  const byDayOfWeek = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = new Array(7).fill(0);
    bookings.forEach((b: Booking) => { const d = new Date(b.created_at); counts[d.getDay()]++; });
    return days.map((d, i) => ({ day: d, count: counts[i] }));
  }, [bookings]);

  // Monthly revenue
  const monthlyRevenue = useMemo(() => {
    const months: Record<string, number> = {};
    bookings.forEach((b: Booking) => {
      const d = new Date(b.created_at);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      months[key] = (months[key] || 0) + Number(b.total);
    });
    return Object.entries(months).slice(-6).map(([month, revenue]) => ({ month, revenue }));
  }, [bookings]);

  return (
    <motion.div {...fadeUp} className="space-y-4">
      {/* Bookings by Day of Week */}
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Bookings by Day</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDayOfWeek}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="count" fill="hsl(221,83%,53%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Monthly Revenue</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 10, fontSize: 11, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="revenue" fill="hsl(142,71%,45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Slot Popularity */}
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Popular Time Slots</p>
        <div className="space-y-2">
          {slotPopularity.map((s: any) => {
            const max = slotPopularity[0]?.count || 1;
            return (
              <div key={s.slot} className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground w-20 truncate">{s.slot}</span>
                <div className="flex-1 h-6 rounded-lg bg-secondary/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / max) * 100}%` }}
                    className="h-full rounded-lg bg-gradient-to-r from-blue-500/30 to-blue-500/60"
                  />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground w-8 text-right">{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Clients */}
      <div className="rounded-2xl bg-card border border-border/60 p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Top Clients</p>
        <div className="space-y-2.5">
          {topClients.map((c: any, i: number) => (
            <div key={c.id} onClick={() => onNavigate?.("clients", { userId: c.id })} className="flex items-center gap-3 cursor-pointer group hover:bg-secondary/50 rounded-xl p-2 -m-2 transition">
              <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <span className="text-[11px] font-bold text-primary">{c.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.count} bookings</p>
              </div>
              <p className="text-xs font-bold text-foreground tabular-nums">₹{c.revenue.toLocaleString("en-IN")}</p>
              <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-primary transition" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function BookingCard({ booking: b, index, onNavigate, onStatusChange, conflicts = [], capacityInfo }: { booking: Booking; index: number; onNavigate?: any; onStatusChange: (id: string, status: string) => void; conflicts?: Booking[]; capacityInfo?: any }) {
  const sc = statusConfig[b.status] || statusConfig.pending;
  const StatusIcon = sc.icon;
  const hasConflict = conflicts.length > 0;
  const isOverCapacity = capacityInfo?.isOverCapacity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      className={`rounded-2xl bg-card border ${isOverCapacity ? "border-destructive/60 ring-2 ring-destructive/30" : hasConflict ? "border-amber-400/40 ring-1 ring-amber-400/20" : "border-border/60"} overflow-hidden hover:shadow-lg ${sc.glow} transition-all duration-200 group`}
    >
      {/* Property Image + Info Header */}
      <div className="relative cursor-pointer" onClick={() => onNavigate?.("history", { propertyId: b.property_id })}>
        {b.propertyImage ? (
          <div className="h-24 w-full overflow-hidden">
            <img src={b.propertyImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-16 w-full bg-gradient-to-r from-secondary to-secondary/50 flex items-center justify-center">
            <Building2 size={22} className="text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold text-white drop-shadow-md">{b.propertyName}</p>
            {b.propertyLocation && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={9} className="text-white/80" />
                <span className="text-[9px] text-white/80">{b.propertyLocation}</span>
              </div>
            )}
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize backdrop-blur-sm ${sc.bg} ${sc.color}`}>{b.status}</span>
        </div>
      </div>

      {/* Capacity-aware conflict banner */}
      {capacityInfo && (hasConflict || isOverCapacity) && (
        <div className={`px-3 py-2 border-b flex items-start gap-2 ${isOverCapacity ? "bg-destructive/10 border-destructive/20" : "bg-amber-50 dark:bg-amber-500/10 border-amber-200/40 dark:border-amber-500/20"}`}>
          <AlertTriangle size={12} className={`shrink-0 mt-0.5 ${isOverCapacity ? "text-destructive" : "text-amber-600 dark:text-amber-400"}`} />
          <div className="text-[10px]">
            {isOverCapacity ? (
              <p className="font-semibold text-destructive">
                🚨 Over capacity! {capacityInfo.totalGuests}/{capacityInfo.maxGuests} guests
                {capacityInfo.type === "stay" && ` · Needs ${capacityInfo.roomsNeeded} rooms (${capacityInfo.rooms} available)`}
              </p>
            ) : capacityInfo.type === "stay" ? (
              <p className="font-medium text-amber-700 dark:text-amber-300">
                🛏️ {capacityInfo.totalGuests}/{capacityInfo.maxGuests} guests · {capacityInfo.roomsNeeded}/{capacityInfo.rooms} rooms
                {capacityInfo.needsMattress && " · Extra mattress needed"}
              </p>
            ) : (
              <p className="font-medium text-amber-700 dark:text-amber-300">
                👥 {capacityInfo.totalGuests}/{capacityInfo.maxGuests} guests on same slot · {conflicts.length} overlapping booking{conflicts.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-3.5">
        {/* Booking ID + Amount */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-muted-foreground font-mono">#{b.booking_id?.slice(0, 12)}</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold text-foreground tabular-nums">₹{Number(b.total).toLocaleString()}</p>
            <span className="text-[9px] text-muted-foreground">· {timeAgoShort(b.created_at)}</span>
          </div>
        </div>

        {/* Details Row */}
        <div className="flex items-center gap-3 py-2 border-t border-border/40">
          <div className="flex items-center gap-1.5 flex-1">
            <CalendarCheck size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground truncate">{b.date}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            <Clock size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground truncate">{b.slot}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground">{b.guests}</span>
          </div>
        </div>

        {/* Client + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <button onClick={() => onNavigate?.("clients", { userId: b.user_id })} className="flex items-center gap-1.5 hover:text-primary transition">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-[8px] font-bold text-primary">{(b.userName || "G").charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-[11px] font-medium text-foreground">{b.userName}</span>
          </button>
          <div className="flex items-center gap-2">
            <select
              value={b.status}
              onClick={e => e.stopPropagation()}
              onChange={e => { e.stopPropagation(); onStatusChange(b.id, e.target.value); }}
              className="text-[10px] bg-secondary border border-border rounded-lg px-2 py-1 text-foreground hover:border-primary/40 transition"
            >
              {["pending","upcoming","confirmed","active","completed","cancelled"].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </select>
            {onNavigate && (
              <button onClick={() => onNavigate("history", { bookingId: b.booking_id, propertyId: b.property_id })} className="p-1.5 rounded-lg hover:bg-secondary transition">
                <Eye size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function RequestCard({ booking: b, index, updating, onAccept, onReject, onNavigate, timeAgo, conflicts = [] }: any) {
  const sc = statusConfig[b.status] || statusConfig.pending;
  const hasConflict = conflicts.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-2xl border ${hasConflict ? "border-destructive/40 ring-1 ring-destructive/20" : "border-amber-200/60 dark:border-amber-500/20"} bg-card overflow-hidden`}
    >
      {/* Property Header with Image */}
      <div className="relative cursor-pointer" onClick={() => onNavigate?.("history", { propertyId: b.property_id })}>
        {b.propertyImage ? (
          <div className="h-28 w-full overflow-hidden">
            <img src={b.propertyImage} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="h-20 w-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center">
            <Building2 size={28} className="text-amber-400" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-bold text-white drop-shadow-md">{b.propertyName}</p>
          {b.propertyLocation && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-white/80" />
              <span className="text-[10px] text-white/80">{b.propertyLocation}</span>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 dark:bg-amber-500/80 text-amber-700 dark:text-amber-100 capitalize backdrop-blur-sm">{b.status}</span>
        </div>
      </div>

      {hasConflict && (
        <div className="px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 flex items-start gap-2">
          <AlertTriangle size={14} className="text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold text-destructive">Scheduling Conflict</p>
            <p className="text-[10px] text-destructive/80 mt-0.5">
              {conflicts.length} other booking{conflicts.length > 1 ? "s" : ""} for this property on {b.date} at {b.slot} — total {conflicts.reduce((s: number, c: Booking) => s + c.guests, 0) + b.guests} guests
            </p>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Booking ID & Time */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-muted-foreground font-mono">#{b.booking_id?.slice(0, 12)}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo(b.created_at)}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl bg-secondary/50 p-2.5 flex items-center gap-2">
            <CalendarCheck size={14} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">Date</p>
              <p className="text-[11px] font-semibold text-foreground">{b.date}</p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/50 p-2.5 flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">Slot</p>
              <p className="text-[11px] font-semibold text-foreground truncate">{b.slot}</p>
            </div>
          </div>
          <div className="rounded-xl bg-secondary/50 p-2.5 flex items-center gap-2">
            <Users size={14} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">Guests</p>
              <p className="text-[11px] font-semibold text-foreground">{b.guests} people</p>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-2.5 flex items-center gap-2">
            <IndianRupee size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-[9px] text-muted-foreground">Total</p>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">₹{Number(b.total).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-border/40">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{(b.userName || "G").charAt(0)}</span>
          </div>
          <div className="flex-1">
            <button onClick={() => onNavigate?.("clients", { userId: b.user_id })} className="text-xs font-semibold text-foreground hover:text-primary transition">{b.userName || "Guest"}</button>
            <p className="text-[9px] text-muted-foreground">Client</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAccept(b.id)}
            disabled={updating === b.id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition disabled:opacity-50"
          >
            {updating === b.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
            Accept
          </button>
          <button
            onClick={() => onReject(b.id)}
            disabled={updating === b.id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition disabled:opacity-50"
          >
            <X size={14} /> Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
        <CalendarCheck size={24} className="text-muted-foreground" />
      </motion.div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );
}

function timeAgoShort(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
