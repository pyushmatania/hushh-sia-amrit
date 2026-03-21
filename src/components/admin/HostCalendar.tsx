import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, Loader2, Lock, Unlock,
  Users, IndianRupee, TrendingUp, Clock, BarChart3, Flame,
  ArrowUpRight, ArrowDownRight, Star, Zap, ChevronRight as ChevronRightIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BookingEntry {
  slot: string;
  status: string;
  guests: number;
  total: number;
  booking_id: string;
  property_id: string;
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

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  upcoming: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-500" },
  confirmed: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  active: { color: "text-primary", bg: "bg-primary/10 border-primary/20", dot: "bg-primary" },
  completed: { color: "text-muted-foreground", bg: "bg-muted/30 border-muted/20", dot: "bg-muted-foreground" },
  cancelled: { color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", dot: "bg-destructive" },
};

function StatCard({ icon: Icon, label, value, trend, trendUp }: {
  icon: any; label: string; value: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-3 flex flex-col gap-1"
    >
      <div className="flex items-center justify-between">
        <Icon size={14} className="text-muted-foreground" />
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trendUp ? 'text-emerald-400' : 'text-destructive'}`}>
            {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trend}
          </span>
        )}
      </div>
      <span className="text-lg font-bold text-foreground tracking-tight">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </motion.div>
  );
}

export default function HostCalendar({ onNavigate }: { onNavigate?: (page: string, context?: any) => void }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [bookingMap, setBookingMap] = useState<Map<string, BookingEntry[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const startDate = formatDate(year, month, 1);
      const endDate = formatDate(year, month, getDaysInMonth(year, month));

      const { data } = await supabase
        .from("bookings")
        .select("date, slot, status, guests, total, booking_id, property_id")
        .gte("date", startDate)
        .lte("date", endDate);

      const map = new Map<string, BookingEntry[]>();
      (data ?? []).forEach(b => {
        const existing = map.get(b.date) ?? [];
        existing.push(b);
        map.set(b.date, existing);
      });
      setBookingMap(map);
      setLoading(false);
    };
    load();
  }, [year, month]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const allBookings = Array.from(bookingMap.values()).flat();
    const totalRevenue = allBookings.reduce((s, b) => s + Number(b.total), 0);
    const totalGuests = allBookings.reduce((s, b) => s + b.guests, 0);
    const totalBookings = allBookings.length;
    const confirmed = allBookings.filter(b => b.status === "confirmed" || b.status === "completed").length;
    const cancelled = allBookings.filter(b => b.status === "cancelled").length;
    const daysWithBookings = bookingMap.size;
    const daysInMonth = getDaysInMonth(year, month);
    const occupancyRate = daysInMonth > 0 ? Math.round((daysWithBookings / daysInMonth) * 100) : 0;
    const avgRevPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    return { totalRevenue, totalGuests, totalBookings, confirmed, cancelled, occupancyRate, avgRevPerBooking, daysWithBookings };
  }, [bookingMap, year, month]);

  // Selected date stats
  const selectedBookings = selectedDate ? bookingMap.get(selectedDate) ?? [] : [];
  const selectedStats = useMemo(() => {
    const revenue = selectedBookings.reduce((s, b) => s + Number(b.total), 0);
    const guests = selectedBookings.reduce((s, b) => s + b.guests, 0);
    const slotsFilled = new Set(selectedBookings.map(b => b.slot)).size;
    const peakSlot = selectedBookings.length > 0
      ? selectedBookings.reduce((best, b) => Number(b.total) > Number(best.total) ? b : best, selectedBookings[0]).slot
      : "—";
    return { revenue, guests, slotsFilled, peakSlot, count: selectedBookings.length };
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

  // Heatmap intensity
  const maxBookingsInDay = Math.max(1, ...Array.from(bookingMap.values()).map(b => b.length));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays size={20} className="text-primary" /> Booking Calendar
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Revenue heatmap · Slot analytics · Occupancy tracking</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
          <Flame size={12} className="text-primary" />
          <span className="text-[10px] font-bold text-primary">{monthStats.occupancyRate}% occupied</span>
        </div>
      </div>

      {/* Monthly Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${(monthStats.totalRevenue / 1000).toFixed(1)}K`} trend="+12%" trendUp />
        <StatCard icon={CalendarDays} label="Bookings" value={String(monthStats.totalBookings)} trend={`${monthStats.confirmed} conf`} trendUp />
        <StatCard icon={Users} label="Guests" value={String(monthStats.totalGuests)} />
        <StatCard icon={TrendingUp} label="Avg/Booking" value={`₹${monthStats.avgRevPerBooking}`} />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card/50 p-2">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition">
          <ChevronLeft size={16} className="text-muted-foreground" />
        </button>
        <div className="text-center">
          <h3 className="text-sm font-bold text-foreground">{MONTHS[month]} {year}</h3>
          <p className="text-[10px] text-muted-foreground">{monthStats.daysWithBookings} active days</p>
        </div>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition">
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(year, month, day);
                const dayBookings = bookingMap.get(dateStr) ?? [];
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const hasBookings = dayBookings.length > 0;
                const intensity = hasBookings ? Math.min(dayBookings.length / maxBookingsInDay, 1) : 0;
                const dayRevenue = dayBookings.reduce((s, b) => s + Number(b.total), 0);

                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/40 shadow-lg shadow-primary/20"
                        : isToday
                        ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                        : hasBookings
                        ? "hover:bg-secondary text-foreground"
                        : "hover:bg-secondary/50 text-muted-foreground"
                    }`}
                    style={hasBookings && !isSelected ? {
                      background: `rgba(139, 92, 246, ${intensity * 0.15})`,
                    } : undefined}
                  >
                    <span className="font-semibold text-[11px]">{day}</span>
                    {hasBookings && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayBookings.slice(0, 3).map((b, j) => (
                          <div key={j} className={`w-1 h-1 rounded-full ${statusConfig[b.status]?.dot || "bg-muted-foreground"}`} />
                        ))}
                        {dayBookings.length > 3 && (
                          <span className="text-[7px] text-muted-foreground ml-0.5">+{dayBookings.length - 3}</span>
                        )}
                      </div>
                    )}
                    {dayRevenue > 0 && !isSelected && (
                      <span className="text-[7px] text-primary/70 font-medium">₹{dayRevenue >= 1000 ? `${(dayRevenue/1000).toFixed(0)}K` : dayRevenue}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 px-1">
            {Object.entries(statusConfig).map(([status, cfg]) => (
              <div key={status} className="flex items-center gap-1.5 text-[10px] text-muted-foreground capitalize">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {status}
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
                {/* Date Header */}
                <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                          weekday: "long", day: "numeric", month: "long"
                        })}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedStats.count === 0 ? "No bookings" : `${selectedStats.count} booking${selectedStats.count > 1 ? 's' : ''} · ${selectedStats.slotsFilled}/3 slots filled`}
                      </p>
                    </div>
                    {selectedStats.count > 0 && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-foreground">₹{selectedStats.revenue.toLocaleString()}</span>
                        <p className="text-[10px] text-muted-foreground">day revenue</p>
                      </div>
                    )}
                  </div>

                  {/* Day Quick Stats */}
                  {selectedStats.count > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-background/50 border border-border/50 p-2 text-center">
                        <Users size={12} className="text-primary mx-auto mb-1" />
                        <span className="text-sm font-bold text-foreground">{selectedStats.guests}</span>
                        <p className="text-[9px] text-muted-foreground">Guests</p>
                      </div>
                      <div className="rounded-lg bg-background/50 border border-border/50 p-2 text-center">
                        <Clock size={12} className="text-primary mx-auto mb-1" />
                        <span className="text-sm font-bold text-foreground">{selectedStats.slotsFilled}/3</span>
                        <p className="text-[9px] text-muted-foreground">Slots Used</p>
                      </div>
                      <div className="rounded-lg bg-background/50 border border-border/50 p-2 text-center">
                        <Zap size={12} className="text-primary mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-foreground truncate block">{selectedStats.peakSlot}</span>
                        <p className="text-[9px] text-muted-foreground">Peak Slot</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slot Breakdown */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground px-1 flex items-center gap-1.5">
                    <BarChart3 size={12} /> SLOT BREAKDOWN
                  </h5>
                  {SLOTS.map((slot, idx) => {
                    const slotBookings = selectedBookings.filter(b => b.slot.includes(slot.split("–")[0]));
                    const isBlocked = blockedSlots.has(`${selectedDate}|${slot}`);
                    const slotRevenue = slotBookings.reduce((s, b) => s + Number(b.total), 0);
                    const slotGuests = slotBookings.reduce((s, b) => s + b.guests, 0);

                    return (
                      <motion.div
                        key={slot}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={`rounded-xl border p-3 transition-all ${
                          isBlocked
                            ? "bg-destructive/5 border-destructive/20"
                            : slotBookings.length > 0
                            ? "bg-card border-border"
                            : "bg-secondary/30 border-border/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${slotBookings.length > 0 ? 'bg-emerald-500' : isBlocked ? 'bg-destructive' : 'bg-muted-foreground/30'}`} />
                            <span className="text-xs font-semibold text-foreground">{slot}</span>
                            {slotBookings.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                · {slotBookings.length} booking{slotBookings.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {slotRevenue > 0 && (
                              <span className="text-[10px] font-bold text-primary">₹{slotRevenue.toLocaleString()}</span>
                            )}
                            <button
                              onClick={() => toggleBlock(selectedDate!, slot)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                                isBlocked
                                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                              }`}
                            >
                              {isBlocked ? <><Lock size={9} /> Blocked</> : <><Unlock size={9} /> Open</>}
                            </button>
                          </div>
                        </div>

                        {slotBookings.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground pl-4">
                            {isBlocked ? "Slot is blocked for this date" : "No bookings — slot available"}
                          </p>
                        ) : (
                          <div className="space-y-1.5 pl-4">
                            {slotBookings.map((b, j) => {
                              const cfg = statusConfig[b.status] || statusConfig.upcoming;
                              return (
                                 <motion.div
                                  key={j}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: j * 0.05 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => onNavigate?.("history", { bookingId: b.booking_id, propertyId: b.property_id })}
                                  className={`flex items-center justify-between rounded-lg border px-2.5 py-2 cursor-pointer hover:ring-1 hover:ring-primary/30 active:ring-primary/50 transition-all ${cfg.bg}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    <div>
                                      <span className="text-[11px] font-medium text-foreground">
                                        #{b.booking_id.slice(0, 8)}
                                      </span>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                          <Users size={8} /> {b.guests}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">
                                          {b.property_id.slice(0, 12)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <span className="text-[11px] font-bold text-foreground">₹{Number(b.total).toLocaleString()}</span>
                                      <div>
                                        <span className={`text-[9px] font-medium capitalize ${cfg.color}`}>
                                          {b.status}
                                        </span>
                                      </div>
                                    </div>
                                    <ChevronRight size={12} className="text-muted-foreground" />
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        {/* Slot utilization bar */}
                        {slotBookings.length > 0 && (
                          <div className="mt-2 pl-4">
                            <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
                              <span>{slotGuests} guests</span>
                              <span>₹{Math.round(slotRevenue / Math.max(slotBookings.length, 1))}/avg</span>
                            </div>
                            <div className="h-1 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((slotGuests / 30) * 100, 100)}%` }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Revenue Split */}
                {selectedStats.count > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-border bg-card/50 p-3"
                  >
                    <h5 className="text-[10px] font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <Star size={10} /> REVENUE BY STATUS
                    </h5>
                    <div className="space-y-1.5">
                      {Object.entries(
                        selectedBookings.reduce((acc, b) => {
                          acc[b.status] = (acc[b.status] || 0) + Number(b.total);
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([status, rev]) => {
                        const cfg = statusConfig[status] || statusConfig.upcoming;
                        const pct = selectedStats.revenue > 0 ? Math.round((rev / selectedStats.revenue) * 100) : 0;
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-[10px] text-foreground capitalize flex-1">{status}</span>
                            <span className="text-[10px] font-medium text-foreground">₹{rev.toLocaleString()}</span>
                            <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className={`h-full rounded-full ${cfg.dot}`}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground w-6 text-right">{pct}%</span>
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
