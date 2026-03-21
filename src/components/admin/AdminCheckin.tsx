import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, QrCode, MapPin, Clock, CheckCircle2, LogOut, Search, Loader2, Shield, Users, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface GuestCheckin {
  bookingId: string;
  guestName: string;
  userId: string;
  propertyName: string;
  propertyId: string;
  propertyImage: string;
  date: string;
  slot: string;
  guests: number;
  total: number;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string;
  verificationStatus: string;
}

export default function AdminCheckin() {
  const [entries, setEntries] = useState<GuestCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "checked-in" | "expected" | "unverified">("all");
  const [qrSheet, setQrSheet] = useState(false);
  const [qrInput, setQrInput] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const [bookingsRes, profilesRes, listingsRes, verificationsRes] = await Promise.all([
      supabase.from("bookings").select("*").gte("date", today).order("date", { ascending: true }).limit(100),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name, image_urls"),
      supabase.from("identity_verifications").select("user_id, status"),
    ]);

    const profileMap = new Map<string, string>();
    (profilesRes.data ?? []).forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    const listingMap = new Map<string, { name: string; imageUrls: string[] }>();
    (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, { name: l.name, imageUrls: l.image_urls || [] }));
    const verificationMap = new Map<string, string>();
    (verificationsRes.data ?? []).forEach(v => verificationMap.set(v.user_id, v.status));

    const checkins: GuestCheckin[] = (bookingsRes.data ?? []).map(b => {
      const listing = listingMap.get(b.property_id);
      const thumb = getListingThumbnail(listing?.name || "", listing?.imageUrls || [], { preferMapped: true });
      return {
        bookingId: b.booking_id,
        guestName: profileMap.get(b.user_id) || "Unknown Guest",
        userId: b.user_id,
        propertyName: listing?.name || "Property",
        propertyId: b.property_id,
        propertyImage: thumb || "",
        date: b.date,
        slot: b.slot,
        guests: b.guests,
        total: Number(b.total),
        status: b.status,
        checkedIn: b.status === "checked-in",
        checkedInAt: b.status === "checked-in" ? b.updated_at : undefined,
        verificationStatus: verificationMap.get(b.user_id) || "none",
      };
    });

    setEntries(checkins);
    setLoading(false);
  };

  const toggleCheckin = async (entry: GuestCheckin) => {
    const newStatus = entry.checkedIn ? "upcoming" : "checked-in";
    await supabase.from("bookings").update({ status: newStatus }).eq("booking_id", entry.bookingId);
    setEntries(prev => prev.map(e => e.bookingId === entry.bookingId ? { ...e, checkedIn: !e.checkedIn, status: newStatus, checkedInAt: !e.checkedIn ? new Date().toISOString() : undefined } : e));
  };

  const handleQrScan = () => {
    const match = entries.find(e => e.bookingId.toLowerCase().includes(qrInput.toLowerCase().trim()));
    if (match && !match.checkedIn) {
      toggleCheckin(match);
      setQrInput("");
      setQrSheet(false);
    }
  };

  const filtered = entries.filter(e => {
    if (filter === "checked-in" && !e.checkedIn) return false;
    if (filter === "expected" && e.checkedIn) return false;
    if (filter === "unverified" && e.verificationStatus === "approved") return false;
    if (search && !e.guestName.toLowerCase().includes(search.toLowerCase()) && !e.propertyName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const checkedInCount = entries.filter(e => e.checkedIn).length;
  const expectedCount = entries.filter(e => !e.checkedIn).length;
  const unverifiedCount = entries.filter(e => e.verificationStatus !== "approved").length;
  const totalGuests = entries.reduce((s, e) => s + e.guests, 0);

  const verificationBadge = (status: string) => {
    if (status === "approved") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center gap-0.5"><Shield size={8} /> Verified</span>;
    if (status === "pending") return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 flex items-center gap-0.5"><Clock size={8} /> Pending</span>;
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 flex items-center gap-0.5"><AlertTriangle size={8} /> Unverified</span>;
  };

  return (
    <>
      <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 flex items-center justify-center shadow-sm">
                <UserCheck size={20} className="text-emerald-600" />
              </div>
              Guest Check-in
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {checkedInCount} checked in · {expectedCount} expected · {totalGuests} total guests
            </p>
          </div>
          <button onClick={() => setQrSheet(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm">
            <QrCode size={14} /> Scan QR
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Checked In", value: checkedInCount, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
            { label: "Expected", value: expectedCount, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Unverified", value: unverifiedCount, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
            { label: "Total Guests", value: totalGuests, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl ${s.bg} p-3 text-center`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search guest or property..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
          </div>
          <div className="flex gap-1.5">
            {(["all", "checked-in", "expected", "unverified"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium capitalize transition-all ${
                  filter === f ? "bg-primary/10 text-primary border border-primary/20" : "bg-card text-muted-foreground border border-border"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No guests match your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.bookingId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`rounded-2xl bg-card border border-border/80 p-4 transition-all ${entry.checkedIn ? "border-l-[3px] border-l-emerald-400" : "border-l-[3px] border-l-blue-400"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                          {entry.guestName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{entry.guestName}</p>
                          {verificationBadge(entry.verificationStatus)}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><MapPin size={9} /> {entry.propertyName}</span>
                          <span>· {entry.date} · {entry.slot}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-muted-foreground">#{entry.bookingId.slice(0, 10)}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                        <Users size={8} /> {entry.guests} guests
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground tabular-nums">₹{entry.total.toLocaleString()}</span>
                      {entry.checkedIn && entry.checkedInAt && (
                        <span className="text-[9px] text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 size={9} /> Checked in {new Date(entry.checkedInAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCheckin(entry)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                        entry.checkedIn
                          ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                          : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      }`}
                    >
                      {entry.checkedIn ? <><LogOut size={12} /> Check Out</> : <><CheckCircle2 size={12} /> Check In</>}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* QR Scan Sheet */}
      <Sheet open={qrSheet} onOpenChange={setQrSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><QrCode size={18} className="text-primary" /> QR Check-in</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
              <QrCode size={64} className="text-primary/30" />
            </div>
            <p className="text-center text-sm text-muted-foreground">Scan guest's QR code or enter booking ID</p>
            <div className="flex gap-2">
              <Input placeholder="Enter booking ID..." value={qrInput} onChange={e => setQrInput(e.target.value)} className="rounded-xl" onKeyDown={e => e.key === "Enter" && handleQrScan()} />
              <button onClick={handleQrScan} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                Check In
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
