import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, Loader2, Lock, Unlock,
  Users, IndianRupee, TrendingUp, Clock, BarChart3, Flame,
  ArrowUpRight, ArrowDownRight, Star, Zap, MapPin, Home, Eye, User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { properties } from "@/data/properties";

interface BookingEntry {
  slot: string;
  status: string;
  guests: number;
  total: number;
  booking_id: string;
  property_id: string;
  user_id?: string;
  created_at?: string;
}

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
  tier: string;
}

interface PropertyInfo {
  name: string;
  location: string;
  category: string;
  image?: string;
}

const SLOTS = ["12–4 PM", "4–7 PM", "7–11 PM"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const statusConfig: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  upcoming: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-500", label: "Upcoming" },
  confirmed: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500", label: "Confirmed" },
  active: { color: "text-primary", bg: "bg-primary/10 border-primary/20", dot: "bg-primary", label: "Active" },
  completed: { color: "text-muted-foreground", bg: "bg-muted/30 border-muted/20", dot: "bg-muted-foreground", label: "Completed" },
  cancelled: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", dot: "bg-destructive", label: "Cancelled" },
};

function StatCard({ icon: Icon, label, value, trend, trendUp, accent }: {
  icon: any; label: string; value: string; trend?: string; trendUp?: boolean; accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-secondary/20 backdrop-blur-sm p-3.5 flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent || 'bg-primary/10'}`}>
          <Icon size={13} className={accent ? 'text-foreground' : 'text-primary'} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${trendUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-destructive bg-destructive/10'}`}>
            {trendUp ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
            {trend}
          </span>
        )}
      </div>
      <span className="text-xl font-black text-foreground tracking-tight leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </motion.div>
  );
}

// Build a property name map from static data + DB listings
function usePropertyMap() {
  const [dbListings, setDbListings] = useState<Map<string, PropertyInfo>>(new Map());

  useEffect(() => {
    supabase.from("host_listings").select("id, name, location, category, image_urls").then(({ data }) => {
      const map = new Map<string, PropertyInfo>();
      (data ?? []).forEach(l => {
        map.set(l.id, {
          name: l.name,
          location: l.location || "Jeypore",
          category: l.category || "Stays",
          image: l.image_urls?.[0],
        });
      });
      setDbListings(map);
    });
  }, []);

  return useMemo(() => {
    const map = new Map<string, PropertyInfo>();
    // Static properties first
    properties.forEach(p => {
      const imgs = (p as any).images;
      const firstImg = Array.isArray(imgs) ? imgs[0] : typeof imgs === 'string' ? imgs : undefined;
      map.set(p.id, { name: p.name, location: (p as any).location || "Jeypore, Odisha", category: (p as any).category || "Stays", image: firstImg });
    });
    // DB listings override
    dbListings.forEach((v, k) => map.set(k, v));
    return map;
  }, [dbListings]);
}

export default function HostCalendar({ onNavigate }: { onNavigate?: (page: string, context?: any) => void }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [bookingMap, setBookingMap] = useState<Map<string, BookingEntry[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [filterPropertyId, setFilterPropertyId] = useState<string>("all");
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());
  const propertyMap = usePropertyMap();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const startDate = formatDate(year, month, 1);
      const endDate = formatDate(year, month, getDaysInMonth(year, month));

      const { data } = await supabase
        .from("bookings")
        .select("date, slot, status, guests, total, booking_id, property_id, user_id, created_at")
        .gte("date", startDate)
        .lte("date", endDate);

      const map = new Map<string, BookingEntry[]>();
      const userIds = new Set<string>();
      (data ?? []).forEach(b => {
        const existing = map.get(b.date) ?? [];
        existing.push(b);
        map.set(b.date, existing);
        if (b.user_id) userIds.add(b.user_id);
      });
      setBookingMap(map);

      // Fetch user profiles
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, tier")
          .in("user_id", Array.from(userIds));
        const profileMap = new Map<string, UserProfile>();
        (profiles ?? []).forEach(p => profileMap.set(p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url, tier: p.tier }));
        setUserProfiles(profileMap);
      }

      setLoading(false);
    };
    load();
  }, [year, month]);

  // Apply property filter to bookingMap
  const filteredBookingMap = useMemo(() => {
    if (filterPropertyId === "all") return bookingMap;
    const filtered = new Map<string, BookingEntry[]>();
    bookingMap.forEach((entries, date) => {
      const matched = entries.filter(b => b.property_id === filterPropertyId);
      if (matched.length > 0) filtered.set(date, matched);
    });
    return filtered;
  }, [bookingMap, filterPropertyId]);

  // All unique property IDs from current month bookings
  const bookedPropertyIds = useMemo(() => {
    const ids = new Set<string>();
    bookingMap.forEach(entries => entries.forEach(b => ids.add(b.property_id)));
    return Array.from(ids);
  }, [bookingMap]);

  // Previous month stats for trend
  const [prevMonthRevenue, setPrevMonthRevenue] = useState(0);
  useEffect(() => {
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    const s = formatDate(py, pm, 1);
    const e = formatDate(py, pm, getDaysInMonth(py, pm));
    supabase.from("bookings").select("total").gte("date", s).lte("date", e).then(({ data }) => {
      setPrevMonthRevenue((data ?? []).reduce((sum, b) => sum + Number(b.total), 0));
    });
  }, [year, month]);

  const monthStats = useMemo(() => {
    const allBookings = Array.from(filteredBookingMap.values()).flat();
    const totalRevenue = allBookings.reduce((s, b) => s + Number(b.total), 0);
    const totalGuests = allBookings.reduce((s, b) => s + b.guests, 0);
    const totalBookings = allBookings.length;
    const confirmed = allBookings.filter(b => b.status === "confirmed" || b.status === "completed").length;
    const daysWithBookings = filteredBookingMap.size;
    const daysInMonth = getDaysInMonth(year, month);
    const occupancyRate = daysInMonth > 0 ? Math.round((daysWithBookings / daysInMonth) * 100) : 0;
    const avgRevPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    const revTrend = prevMonthRevenue > 0 ? Math.round(((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;
    const uniqueProperties = new Set(allBookings.map(b => b.property_id)).size;
    return { totalRevenue, totalGuests, totalBookings, confirmed, occupancyRate, avgRevPerBooking, daysWithBookings, revTrend, uniqueProperties };
  }, [filteredBookingMap, year, month, prevMonthRevenue]);

  const selectedBookings = selectedDate ? filteredBookingMap.get(selectedDate) ?? [] : [];
  const selectedStats = useMemo(() => {
    const revenue = selectedBookings.reduce((s, b) => s + Number(b.total), 0);
    const guests = selectedBookings.reduce((s, b) => s + b.guests, 0);
    const slotsFilled = new Set(selectedBookings.map(b => b.slot)).size;
    const peakSlot = selectedBookings.length > 0
      ? selectedBookings.reduce((best, b) => Number(b.total) > Number(best.total) ? b : best, selectedBookings[0]).slot
      : "—";
    const uniqueProps = new Set(selectedBookings.map(b => b.property_id)).size;
    return { revenue, guests, slotsFilled, peakSlot, count: selectedBookings.length, uniqueProps };
  }, [selectedBookings]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const toggleBlock = (date: string, slot: string) => {
    const key = `${date}|${slot}`;
    setBlockedSlots(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const maxBookingsInDay = Math.max(1, ...Array.from(filteredBookingMap.values()).map(b => b.length));

  const getPropertyName = (id: string) => propertyMap.get(id)?.name || `Property ${id.slice(0, 6)}`;
  const getPropertyInfo = (id: string) => propertyMap.get(id) || { name: `Property ${id.slice(0, 6)}`, location: "Jeypore", category: "Stays" };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <CalendarDays size={20} className="text-primary" /> Booking Calendar
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Revenue heatmap · Property insights · Occupancy tracking</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/25"
        >
          <Flame size={13} className="text-primary" />
          <span className="text-[11px] font-bold text-primary">{monthStats.occupancyRate}%</span>
          <span className="text-[9px] text-primary/70">occupied</span>
        </motion.div>
      </div>

      {/* Property Filter */}
      {bookedPropertyIds.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterPropertyId("all")}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
              filterPropertyId === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/60 text-muted-foreground border-border/60 hover:bg-secondary"
            }`}
          >
            All Properties
          </button>
          {bookedPropertyIds.map(pid => (
            <button
              key={pid}
              onClick={() => setFilterPropertyId(pid === filterPropertyId ? "all" : pid)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition truncate max-w-[140px] ${
                filterPropertyId === pid
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/60 text-muted-foreground border-border/60 hover:bg-secondary"
              }`}
            >
              {getPropertyName(pid)}
            </button>
          ))}
        </div>
      )}

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={`₹${monthStats.totalRevenue >= 100000 ? `${(monthStats.totalRevenue / 100000).toFixed(1)}L` : `${(monthStats.totalRevenue / 1000).toFixed(1)}K`}`}
          trend={monthStats.revTrend !== 0 ? `${monthStats.revTrend > 0 ? '+' : ''}${monthStats.revTrend}%` : undefined}
          trendUp={monthStats.revTrend > 0}
          accent="bg-emerald-500/15"
        />
        <StatCard
          icon={CalendarDays}
          label="Total Bookings"
          value={String(monthStats.totalBookings)}
          trend={`${monthStats.confirmed} confirmed`}
          trendUp
          accent="bg-blue-500/15"
        />
        <StatCard icon={Users} label="Total Guests" value={String(monthStats.totalGuests)} accent="bg-amber-500/15" />
        <StatCard
          icon={Home}
          label="Properties Booked"
          value={String(monthStats.uniqueProperties)}
          trend={`₹${monthStats.avgRevPerBooking}/avg`}
          trendUp
          accent="bg-primary/15"
        />
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-gradient-to-r from-card to-secondary/20 p-3">
        <motion.button whileTap={{ scale: 0.85 }} onClick={prevMonth} className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center hover:bg-secondary transition">
          <ChevronLeft size={16} className="text-foreground" />
        </motion.button>
        <div className="text-center">
          <h3 className="text-sm font-black text-foreground tracking-wide">{MONTHS[month]} {year}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">{monthStats.daysWithBookings} active days · {daysInMonth} total</p>
        </div>
        <motion.button whileTap={{ scale: 0.85 }} onClick={nextMonth} className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center hover:bg-secondary transition">
          <ChevronRight size={16} className="text-foreground" />
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm p-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(year, month, day);
                const dayBookings = filteredBookingMap.get(dateStr) ?? [];
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const hasBookings = dayBookings.length > 0;
                const intensity = hasBookings ? Math.min(dayBookings.length / maxBookingsInDay, 1) : 0;
                const dayRevenue = dayBookings.reduce((s, b) => s + Number(b.total), 0);
                const uniqueProps = new Set(dayBookings.map(b => b.property_id)).size;

                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative rounded-xl flex flex-col items-center justify-center py-2 min-h-[52px] transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/50 shadow-lg shadow-primary/25 scale-105"
                        : isToday
                        ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                        : hasBookings
                        ? "hover:bg-secondary/80 text-foreground"
                        : "hover:bg-secondary/40 text-muted-foreground/60"
                    }`}
                    style={hasBookings && !isSelected && !isToday ? {
                      background: `linear-gradient(135deg, rgba(139, 92, 246, ${intensity * 0.12}), rgba(139, 92, 246, ${intensity * 0.06}))`,
                    } : undefined}
                  >
                    <span className={`font-bold text-[12px] leading-none ${isSelected ? '' : isToday ? 'text-primary' : ''}`}>{day}</span>
                    {hasBookings && (
                      <div className="flex gap-[3px] mt-1">
                        {dayBookings.slice(0, 4).map((b, j) => (
                          <div key={j} className={`w-[5px] h-[5px] rounded-full ${isSelected ? 'bg-primary-foreground/70' : statusConfig[b.status]?.dot || "bg-muted-foreground"}`} />
                        ))}
                        {dayBookings.length > 4 && (
                          <span className={`text-[6px] ml-0.5 font-bold ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>+{dayBookings.length - 4}</span>
                        )}
                      </div>
                    )}
                    {dayRevenue > 0 && !isSelected && (
                      <span className="text-[7px] text-primary font-bold mt-0.5 leading-none">
                        ₹{dayRevenue >= 1000 ? `${(dayRevenue/1000).toFixed(0)}K` : dayRevenue}
                      </span>
                    )}
                    {uniqueProps > 1 && !isSelected && (
                      <span className="text-[6px] text-emerald-400 font-semibold">{uniqueProps} props</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 px-1">
            {Object.entries(statusConfig).map(([status, cfg]) => (
              <div key={status} className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <div className={`w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
            ))}
          </div>

          {/* Selected Date Detail */}
          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="space-y-4"
              >
                {/* Date Header Card */}
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-black text-foreground">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "long", day: "numeric", month: "long"
                        })}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedStats.count === 0
                          ? "No bookings on this date"
                          : `${selectedStats.count} booking${selectedStats.count > 1 ? 's' : ''} · ${selectedStats.slotsFilled}/3 slots · ${selectedStats.uniqueProps} propert${selectedStats.uniqueProps > 1 ? 'ies' : 'y'}`}
                      </p>
                    </div>
                    {selectedStats.count > 0 && (
                      <div className="text-right">
                        <span className="text-2xl font-black text-foreground">₹{selectedStats.revenue.toLocaleString()}</span>
                        <p className="text-[10px] text-muted-foreground">day revenue</p>
                      </div>
                    )}
                  </div>

                  {/* Day Quick Stats */}
                  {selectedStats.count > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: Users, val: String(selectedStats.guests), label: "Guests", color: "bg-amber-500/10" },
                        { icon: Clock, val: `${selectedStats.slotsFilled}/3`, label: "Slots", color: "bg-blue-500/10" },
                        { icon: Home, val: String(selectedStats.uniqueProps), label: "Properties", color: "bg-emerald-500/10" },
                        { icon: Zap, val: selectedStats.peakSlot.length > 8 ? selectedStats.peakSlot.slice(0, 8) + '…' : selectedStats.peakSlot, label: "Peak", color: "bg-primary/10" },
                      ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className={`rounded-xl ${s.color} border border-border/30 p-2.5 text-center`}
                        >
                          <s.icon size={12} className="text-foreground/60 mx-auto mb-1" />
                          <span className="text-xs font-bold text-foreground block leading-none">{s.val}</span>
                          <p className="text-[8px] text-muted-foreground mt-1">{s.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Properties → Slots → Bookings (merged hierarchy) */}
                {selectedStats.count > 0 && (
                  <div className="space-y-3">
                    {Array.from(new Set(selectedBookings.map(b => b.property_id))).map((pid, idx) => {
                      const info = getPropertyInfo(pid);
                      const propBookings = selectedBookings.filter(b => b.property_id === pid);
                      const propRevenue = propBookings.reduce((s, b) => s + Number(b.total), 0);
                      const propGuests = propBookings.reduce((s, b) => s + b.guests, 0);

                      const slotGroups = SLOTS.map(slot => ({
                        slot,
                        bookings: propBookings.filter(b => b.slot.includes(slot.split("–")[0])),
                        isBlocked: blockedSlots.has(`${selectedDate}|${slot}`),
                      })).filter(sg => sg.bookings.length > 0 || sg.isBlocked);

                      return (
                        <motion.div
                          key={pid}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.08 }}
                          className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden"
                        >
                          {/* Property Header */}
                          <div className="p-3.5 border-b border-border/40 bg-gradient-to-r from-card to-secondary/20">
                            <div className="flex items-center gap-3">
                              {info.image ? (
                                <img src={info.image} alt={info.name} className="w-12 h-12 rounded-xl object-cover border border-border/50" loading="lazy" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                  <Home size={18} className="text-primary" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{info.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><MapPin size={8} /> {info.location}</span>
                                  <span className="text-[9px] text-primary/70 font-medium">{info.category}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-base font-black text-foreground">₹{propRevenue.toLocaleString()}</span>
                                <p className="text-[9px] text-muted-foreground">{propBookings.length} booking{propBookings.length > 1 ? 's' : ''} · {propGuests} guests</p>
                              </div>
                            </div>
                          </div>

                          {/* Slots under this property */}
                          <div className="divide-y divide-border/30">
                            {slotGroups.map((sg) => {
                              const slotRevenue = sg.bookings.reduce((s, b) => s + Number(b.total), 0);
                              const slotGuests = sg.bookings.reduce((s, b) => s + b.guests, 0);

                              return (
                                <div key={sg.slot} className={`p-3 ${sg.isBlocked && sg.bookings.length === 0 ? 'bg-destructive/5' : ''}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${sg.bookings.length > 0 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : sg.isBlocked ? 'bg-destructive' : 'bg-muted-foreground/20'}`} />
                                      <span className="text-[11px] font-bold text-foreground">{sg.slot}</span>
                                      {sg.bookings.length > 0 && (
                                        <span className="text-[9px] text-muted-foreground">· {sg.bookings.length} booking{sg.bookings.length > 1 ? 's' : ''}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {slotRevenue > 0 && (
                                        <span className="text-[10px] font-bold text-primary">₹{slotRevenue.toLocaleString()}</span>
                                      )}
                                      <button
                                        onClick={() => toggleBlock(selectedDate!, sg.slot)}
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-semibold transition ${
                                          sg.isBlocked ? "bg-destructive/10 text-destructive" : "bg-secondary/80 text-muted-foreground"
                                        }`}
                                      >
                                        {sg.isBlocked ? <><Lock size={8} /> Blocked</> : <><Unlock size={8} /> Open</>}
                                      </button>
                                    </div>
                                  </div>

                                  {sg.bookings.length === 0 ? (
                                    <p className="text-[9px] text-muted-foreground pl-4 italic">{sg.isBlocked ? "Slot blocked" : "Available"}</p>
                                  ) : (
                                    <div className="space-y-1.5 pl-4">
                                      {sg.bookings.map((b, j) => {
                                        const cfg = statusConfig[b.status] || statusConfig.upcoming;
                                        const userProfile = b.user_id ? userProfiles.get(b.user_id) : null;
                                        const userName = userProfile?.display_name || (b.user_id ? `User ${b.user_id.slice(0, 6)}` : "Guest");
                                        const bookedAt = b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

                                        return (
                                          <motion.div
                                            key={j}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: j * 0.04 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => onNavigate?.("clients", { userId: b.user_id })}
                                            className={`rounded-xl border px-3 py-2.5 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all ${cfg.bg}`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                {userProfile?.avatar_url ? (
                                                  <img src={userProfile.avatar_url} alt={userName} className="w-9 h-9 rounded-full object-cover border-2 border-border/50 shrink-0" />
                                                ) : (
                                                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-2 border-border/50">
                                                    <User size={14} className="text-primary" />
                                                  </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-1.5">
                                                    <p className="text-[12px] font-bold text-foreground truncate">{userName}</p>
                                                    {userProfile?.tier && userProfile.tier !== "Silver" && (
                                                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-bold">{userProfile.tier}</span>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className="text-[9px] text-muted-foreground font-mono">#{b.booking_id.length > 10 ? b.booking_id.slice(0, 10) : b.booking_id}</span>
                                                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Users size={8} /> {b.guests} guests</span>
                                                    {bookedAt && (
                                                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Clock size={7} /> {bookedAt}</span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 shrink-0">
                                                <div className="text-right">
                                                  <span className="text-[12px] font-black text-foreground">₹{Number(b.total).toLocaleString()}</span>
                                                  <div><span className={`text-[9px] font-semibold ${cfg.color}`}>{cfg.label}</span></div>
                                                </div>
                                                <Eye size={12} className="text-muted-foreground" />
                                              </div>
                                            </div>
                                          </motion.div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {sg.bookings.length > 0 && (
                                    <div className="mt-2 pl-4">
                                      <div className="flex items-center justify-between text-[8px] text-muted-foreground mb-0.5">
                                        <span>{slotGuests} guests</span>
                                        <span>₹{Math.round(slotRevenue / Math.max(sg.bookings.length, 1))}/avg</span>
                                      </div>
                                      <div className="h-1 rounded-full bg-secondary overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${Math.min((slotGuests / 30) * 100, 100)}%` }}
                                          transition={{ delay: 0.3, duration: 0.5 }}
                                          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {SLOTS.filter(slot => !slotGroups.some(sg => sg.slot === slot)).length > 0 && (
                              <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] text-muted-foreground font-medium">Available:</span>
                                {SLOTS.filter(slot => !slotGroups.some(sg => sg.slot === slot)).map(slot => (
                                  <span key={slot} className="text-[9px] text-emerald-500/70 bg-emerald-500/5 px-2 py-0.5 rounded-md font-medium">{slot}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}



                {/* Revenue Split by Status */}
                {selectedStats.count > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-border/60 bg-card/80 p-4"
                  >
                    <h5 className="text-[11px] font-bold text-muted-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                      <Star size={11} /> Revenue by Status
                    </h5>
                    <div className="space-y-2">
                      {Object.entries(
                        selectedBookings.reduce((acc, b) => {
                          acc[b.status] = (acc[b.status] || 0) + Number(b.total);
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([status, rev]) => {
                        const cfg = statusConfig[status] || statusConfig.upcoming;
                        const pct = selectedStats.revenue > 0 ? Math.round((rev / selectedStats.revenue) * 100) : 0;
                        return (
                          <div key={status} className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                            <span className="text-[11px] text-foreground font-medium flex-1">{cfg.label}</span>
                            <span className="text-[11px] font-bold text-foreground">₹{rev.toLocaleString()}</span>
                            <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className={`h-full rounded-full ${cfg.dot}`}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground w-7 text-right font-mono">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Revenue by Property */}
                {selectedStats.uniqueProps > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl border border-border/60 bg-card/80 p-4"
                  >
                    <h5 className="text-[11px] font-bold text-muted-foreground mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                      <Eye size={11} /> Revenue by Property
                    </h5>
                    <div className="space-y-2">
                      {Array.from(
                        selectedBookings.reduce((acc, b) => {
                          acc.set(b.property_id, (acc.get(b.property_id) || 0) + Number(b.total));
                          return acc;
                        }, new Map<string, number>())
                      )
                        .sort(([, a], [, b]) => b - a)
                        .map(([pid, rev]) => {
                          const pct = selectedStats.revenue > 0 ? Math.round((rev / selectedStats.revenue) * 100) : 0;
                          return (
                            <div key={pid} className="flex items-center gap-2.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              <span className="text-[11px] text-foreground font-medium flex-1 truncate">{getPropertyName(pid)}</span>
                              <span className="text-[11px] font-bold text-foreground">₹{rev.toLocaleString()}</span>
                              <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  className="h-full rounded-full bg-primary"
                                />
                              </div>
                              <span className="text-[9px] text-muted-foreground w-7 text-right font-mono">{pct}%</span>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
