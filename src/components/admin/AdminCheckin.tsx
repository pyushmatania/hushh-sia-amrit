import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, QrCode, MapPin, Clock, CheckCircle2, LogOut, Search, Loader2,
  Shield, Users, AlertTriangle, ScanLine, Zap, ArrowRight, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { DEMO_BOOKINGS, DEMO_LISTINGS, DEMO_PROFILES } from "./admin-demo-data";
import DemoDataBanner from "./DemoDataBanner";
import { useDataMode } from "@/hooks/use-data-mode";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

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
  const [isDemo, setIsDemo] = useState(false);
  const { isDemoMode } = useDataMode();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "checked-in" | "expected" | "unverified">("all");
  const [qrSheet, setQrSheet] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; guest?: string } | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    // Realtime sync so check-in/out reflects instantly
    const ch = supabase
      .channel("admin-checkin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [bookingsRes, profilesRes, listingsRes, verificationsRes] = await Promise.all([
      supabase.from("bookings").select("*").order("date", { ascending: true }).limit(200),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("host_listings").select("id, name, image_urls"),
      supabase.from("identity_verifications").select("user_id, status"),
    ]);

    const bookingsRaw = bookingsRes.data ?? [];
    const profilesRaw = profilesRes.data ?? [];
    const listingsRaw = listingsRes.data ?? [];
    const verificationsRaw = verificationsRes.data ?? [];

    const usingDemo = bookingsRaw.length === 0;
    setIsDemo(usingDemo);

    const bookingsData = usingDemo ? DEMO_BOOKINGS : bookingsRaw;
    const profilesData = usingDemo ? DEMO_PROFILES : profilesRaw;
    const listingsData = usingDemo ? DEMO_LISTINGS : listingsRaw;

    const profileMap = new Map<string, string>();
    profilesData.forEach(p => profileMap.set(p.user_id, p.display_name || "Guest"));
    const listingMap = new Map<string, { name: string; imageUrls: string[] }>();
    listingsData.forEach(l => listingMap.set(l.id, { name: l.name, imageUrls: (l as any).image_urls || [] }));
    const verificationMap = new Map<string, string>();
    verificationsRaw.forEach(v => verificationMap.set(v.user_id, v.status));

    const checkins: GuestCheckin[] = bookingsData.map(b => {
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
        checkedIn: b.status === "checked-in" || b.status === "active",
        checkedInAt: ["checked-in", "active"].includes(b.status) ? b.updated_at : undefined,
        verificationStatus: verificationMap.get(b.user_id) || "none",
      };
    });

    setEntries(checkins);
    setLoading(false);
  };

  const toggleCheckin = async (entry: GuestCheckin) => {
    const newStatus = entry.checkedIn ? "upcoming" : "active";
    await supabase.from("bookings").update({ status: newStatus }).eq("booking_id", entry.bookingId);
    setEntries(prev => prev.map(e =>
      e.bookingId === entry.bookingId
        ? { ...e, checkedIn: !e.checkedIn, status: newStatus, checkedInAt: !e.checkedIn ? new Date().toISOString() : undefined }
        : e
    ));
    toast.success(entry.checkedIn ? `${entry.guestName} checked out` : `${entry.guestName} checked in ✅`);
  };

  const handleQrScan = useCallback(() => {
    const input = qrInput.trim();
    if (!input) return;

    // Try to parse as JSON (from our QR code format)
    let bookingIdToFind = input;
    try {
      const parsed = JSON.parse(input);
      if (parsed.type === "hushh_checkin" && parsed.bid) {
        bookingIdToFind = parsed.bid;
      }
    } catch {
      // Not JSON, treat as raw booking ID
    }

    const match = entries.find(e =>
      e.bookingId.toLowerCase() === bookingIdToFind.toLowerCase() ||
      e.bookingId.toLowerCase().includes(bookingIdToFind.toLowerCase())
    );

    if (match) {
      if (match.checkedIn) {
        setScanResult({ success: false, message: "Already checked in", guest: match.guestName });
      } else {
        toggleCheckin(match);
        setScanResult({ success: true, message: "Check-in successful!", guest: match.guestName });
      }
    } else {
      setScanResult({ success: false, message: "No booking found for this QR code" });
    }
    setQrInput("");
  }, [qrInput, entries]);

  // Focus QR input when sheet opens
  useEffect(() => {
    if (qrSheet) {
      setScanResult(null);
      setTimeout(() => qrInputRef.current?.focus(), 300);
    }
  }, [qrSheet]);

  const filtered = entries.filter(e => {
    if (filter === "checked-in" && !e.checkedIn) return false;
    if (filter === "expected" && e.checkedIn) return false;
    if (filter === "unverified" && e.verificationStatus === "approved") return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.guestName.toLowerCase().includes(q) && !e.propertyName.toLowerCase().includes(q) && !e.bookingId.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const checkedInCount = entries.filter(e => e.checkedIn).length;
  const expectedCount = entries.filter(e => !e.checkedIn).length;
  const unverifiedCount = entries.filter(e => e.verificationStatus !== "approved").length;
  const totalGuests = entries.reduce((s, e) => s + e.guests, 0);

  return (
    <>
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {isDemo && <DemoDataBanner entityName="check-in entries" />}
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-6 xl:p-8 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvc3ZnPg==')] opacity-60" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl xl:text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <UserCheck size={24} />
                </div>
                Guest Check-in
              </h1>
              <p className="text-white/80 mt-2 text-sm">
                Real-time guest arrival management
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs font-semibold hover:bg-white/25 transition">
                <RefreshCw size={14} /> Refresh
              </button>
              <button onClick={() => setQrSheet(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 text-sm font-bold hover:bg-white/90 transition shadow-lg shadow-emerald-700/20">
                <ScanLine size={16} /> Scan QR
              </button>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Checked In", value: checkedInCount, icon: CheckCircle2 },
              { label: "Expected", value: expectedCount, icon: Clock },
              { label: "Unverified", value: unverifiedCount, icon: AlertTriangle },
              { label: "Total Guests", value: totalGuests, icon: Users },
            ].map(s => (
              <div key={s.label} className="bg-white/12 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <s.icon size={14} className="text-white/70" />
                  <span className="text-2xl font-bold">{s.value}</span>
                </div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guest, property, or booking ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-11"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["all", "expected", "checked-in", "unverified"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card text-muted-foreground border border-border hover:bg-accent"
                }`}>
                {f === "all" ? "All" : f === "checked-in" ? "Checked In" : f === "expected" ? "Expected" : "Unverified"}
                <span className="ml-1.5 opacity-70">
                  ({f === "all" ? entries.length : f === "checked-in" ? checkedInCount : f === "expected" ? expectedCount : unverifiedCount})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Guest List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border">
            <Users size={40} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-base font-medium text-muted-foreground">No guests match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            <AnimatePresence initial={false}>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.bookingId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className={`group rounded-2xl bg-card border transition-all hover:shadow-md ${
                    entry.checkedIn
                      ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5"
                      : "border-border"
                  }`}
                >
                  <div className="p-4 xl:p-5">
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                            {entry.propertyImage ? (
                              <img src={entry.propertyImage} alt="" className="object-cover w-full h-full rounded-full" />
                            ) : (
                              <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                                {entry.guestName[0]?.toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {entry.checkedIn && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                              <CheckCircle2 size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-foreground">{entry.guestName}</p>
                            <VerificationBadge status={entry.verificationStatus} />
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">#{entry.bookingId}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground tabular-nums">₹{entry.total.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                          <Users size={9} /> {entry.guests} guests
                        </p>
                      </div>
                    </div>

                    {/* Info Row */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={10} className="text-primary/70" /> {entry.propertyName}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {entry.date}</span>
                      <span>{entry.slot}</span>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                      {entry.checkedIn && entry.checkedInAt ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 size={12} />
                          Checked in at {new Date(entry.checkedInAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Awaiting arrival</span>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleCheckin(entry)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          entry.checkedIn
                            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/25"
                        }`}
                      >
                        {entry.checkedIn ? <><LogOut size={13} /> Check Out</> : <><Zap size={13} /> Check In</>}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* QR Scan Sheet */}
      <Sheet open={qrSheet} onOpenChange={setQrSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScanLine size={18} className="text-primary" />
              </div>
              QR Check-in Scanner
            </SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-5">
            {/* Scan Area */}
            <div className="w-56 h-56 mx-auto rounded-3xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 relative overflow-hidden">
              <QrCode size={72} className="text-primary/20" />
              <p className="text-[11px] text-primary/50 mt-2 font-medium">Point camera at QR</p>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Or enter booking ID manually</p>
            </div>

            <div className="flex gap-2">
              <Input
                ref={qrInputRef}
                placeholder="Scan or type booking ID..."
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                className="rounded-xl h-12 text-base font-mono"
                onKeyDown={e => e.key === "Enter" && handleQrScan()}
                autoFocus
              />
              <button
                onClick={handleQrScan}
                disabled={!qrInput.trim()}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                <ArrowRight size={16} /> Go
              </button>
            </div>

            {/* Scan Result */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-2xl p-4 flex items-center gap-3 ${
                    scanResult.success
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30"
                      : "bg-destructive/5 border border-destructive/20"
                  }`}
                >
                  {scanResult.success ? (
                    <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle size={24} className="text-destructive shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-bold ${scanResult.success ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"}`}>
                      {scanResult.message}
                    </p>
                    {scanResult.guest && (
                      <p className="text-xs text-muted-foreground mt-0.5">{scanResult.guest}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function VerificationBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
        <Shield size={8} /> Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
        <Clock size={8} /> Pending
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-0.5">
      <AlertTriangle size={8} /> Unverified
    </span>
  );
}
