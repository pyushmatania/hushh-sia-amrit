import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Search, Filter, XCircle, CheckCircle2, Clock, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Booking {
  id: string; booking_id: string; user_id: string; property_id: string;
  date: string; slot: string; guests: number; total: number;
  status: string; created_at: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  upcoming: { color: "bg-blue-500/15 text-blue-400", icon: Clock },
  active: { color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
  confirmed: { color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
  completed: { color: "bg-muted text-muted-foreground", icon: CheckCircle2 },
  cancelled: { color: "bg-destructive/15 text-destructive", icon: Ban },
  pending: { color: "bg-amber-500/15 text-amber-400", icon: Clock },
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
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarCheck size={22} className="text-primary" /> Bookings
        </h1>
        <p className="text-sm text-muted-foreground">{bookings.length} total bookings</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ID or property..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition ${
                statusFilter === s ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-12 rounded-lg bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead className="hidden md:table-cell">Property</TableHead>
                <TableHead>Date / Slot</TableHead>
                <TableHead className="hidden sm:table-cell">Guests</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No bookings found</TableCell></TableRow>
              ) : filtered.map((b) => {
                const sc = statusConfig[b.status] || statusConfig.pending;
                return (
                  <TableRow key={b.id} className={onNavigate ? "cursor-pointer hover:bg-secondary/60 transition" : ""} onClick={() => onNavigate?.("history", { bookingId: b.booking_id, propertyId: b.property_id })}>
                    <TableCell className="font-mono text-xs">{b.booking_id?.slice(0, 10)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{b.property_id?.slice(0, 12)}</TableCell>
                    <TableCell>
                      <p className="text-xs font-medium">{b.date}</p>
                      <p className="text-[10px] text-muted-foreground">{b.slot}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell tabular-nums">{b.guests}</TableCell>
                    <TableCell className="font-medium tabular-nums">₹{Number(b.total).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${sc.color}`}>{b.status}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <select
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                        className="text-[11px] bg-secondary border border-border rounded-lg px-2 py-1 text-foreground"
                      >
                        {["pending","upcoming","confirmed","active","completed","cancelled"].map(s =>
                          <option key={s} value={s}>{s}</option>
                        )}
                      </select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
