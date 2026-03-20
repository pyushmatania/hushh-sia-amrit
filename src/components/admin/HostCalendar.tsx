import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Lock, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DayBookings {
  date: string;
  bookings: { slot: string; status: string; guests: number; total: number; booking_id: string }[];
}

const SLOTS = ["12–4 PM", "4–7 PM", "7–11 PM"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const slotColors: Record<string, string> = {
  upcoming: "bg-blue-500",
  confirmed: "bg-emerald-500",
  active: "bg-primary",
  completed: "bg-muted-foreground",
  cancelled: "bg-destructive",
};

export default function HostCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [bookingMap, setBookingMap] = useState<Map<string, DayBookings["bookings"]>>(new Map());
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
        .select("date, slot, status, guests, total, booking_id")
        .gte("date", startDate)
        .lte("date", endDate);

      const map = new Map<string, DayBookings["bookings"]>();
      (data ?? []).forEach(b => {
        const existing = map.get(b.date) ?? [];
        existing.push({ slot: b.slot, status: b.status, guests: b.guests, total: b.total, booking_id: b.booking_id });
        map.set(b.date, existing);
      });
      setBookingMap(map);
      setLoading(false);
    };
    load();
  }, [year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const toggleBlock = (date: string, slot: string) => {
    const key = `${date}|${slot}`;
    setBlockedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedBookings = selectedDate ? bookingMap.get(selectedDate) ?? [] : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" /> Booking Calendar
        </h2>
        <p className="text-xs text-muted-foreground">Visual overview of all bookings by date & slot</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition">
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <h3 className="text-sm font-bold text-foreground">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <>
          {/* Calendar grid */}
          <div className="rounded-2xl border border-border bg-card p-3">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(year, month, day);
                const dayBookings = bookingMap.get(dateStr) ?? [];
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const hasBookings = dayBookings.length > 0;

                return (
                  <motion.button
                    key={day}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-medium transition ${
                      isSelected
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : isToday
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    {day}
                    {hasBookings && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayBookings.slice(0, 3).map((b, j) => (
                          <div
                            key={j}
                            className={`w-1.5 h-1.5 rounded-full ${slotColors[b.status] || "bg-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(slotColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5 text-[10px] text-muted-foreground capitalize">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                {status}
              </div>
            ))}
          </div>

          {/* Selected day detail */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-4 space-y-3"
            >
              <h4 className="text-sm font-bold text-foreground">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "short"
                })}
              </h4>

              {SLOTS.map(slot => {
                const slotBookings = selectedBookings.filter(b => b.slot.includes(slot.split("–")[0]));
                const isBlocked = blockedSlots.has(`${selectedDate}|${slot}`);

                return (
                  <div key={slot} className={`rounded-xl p-3 border border-border ${isBlocked ? "bg-destructive/5" : "bg-secondary/50"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">{slot}</span>
                      <button
                        onClick={() => toggleBlock(selectedDate, slot)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                          isBlocked
                            ? "bg-destructive/10 text-destructive"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isBlocked ? <><Lock size={10} /> Blocked</> : <><Unlock size={10} /> Open</>}
                      </button>
                    </div>

                    {slotBookings.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground">
                        {isBlocked ? "Slot blocked" : "No bookings"}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {slotBookings.map((b, j) => (
                          <div key={j} className="flex items-center justify-between text-[11px]">
                            <span className="text-foreground">
                              #{b.booking_id.slice(0, 8)} · {b.guests} guests
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium capitalize ${
                              b.status === "confirmed" ? "bg-emerald-500/15 text-emerald-500" :
                              b.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                              "bg-primary/15 text-primary"
                            }`}>
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
