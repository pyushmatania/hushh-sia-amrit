import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, UserCheck, UserX, Search, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Booking {
  id: string; booking_id: string; property_id: string; date: string;
  slot: string; guests: number; total: number; status: string; user_id: string;
}

export default function StaffCheckin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("bookings").select("*")
      .in("status", ["upcoming", "active", "confirmed"])
      .order("date", { ascending: true })
      .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
  }, []);

  const checkIn = async (id: string) => {
    await supabase.from("bookings").update({ status: "active" }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "active" } : b));
  };

  const checkOut = async (id: string) => {
    await supabase.from("bookings").update({ status: "completed" }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "completed" } : b));
  };

  const filtered = bookings.filter(b =>
    b.booking_id?.toLowerCase().includes(search.toLowerCase()) ||
    b.property_id?.toLowerCase().includes(search.toLowerCase())
  );

  const activeBookings = filtered.filter(b => b.status === "active");
  const upcomingBookings = filtered.filter(b => b.status === "upcoming" || b.status === "confirmed");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <CalendarCheck size={20} className="text-primary" /> Check-In / Check-Out
      </h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search booking ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Active guests */}
      {activeBookings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" /> Active Guests ({activeBookings.length})
          </h3>
          {activeBookings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.booking_id?.slice(0, 12)}</p>
                  <p className="text-xs text-muted-foreground">{b.date} · {b.slot} · {b.guests} guests</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => checkOut(b.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-xs font-semibold text-foreground">
                  <UserX size={14} /> Check Out
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upcoming */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Clock size={14} className="text-amber-400" /> Upcoming ({upcomingBookings.length})
        </h3>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : upcomingBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No upcoming bookings</p>
        ) : (
          upcomingBookings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{b.booking_id?.slice(0, 12)}</p>
                  <p className="text-xs text-muted-foreground">{b.date} · {b.slot} · {b.guests} guests</p>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => checkIn(b.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
                  <UserCheck size={14} /> Check In
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
