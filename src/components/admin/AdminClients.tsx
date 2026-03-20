import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Download, Filter, CalendarCheck, IndianRupee,
  Tag, Crown, Repeat, Moon, Sparkles, ChevronDown, SlidersHorizontal,
  Shield, CheckCircle2, Clock, XCircle, Eye, MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ClientProfile {
  id: string; user_id: string; display_name: string | null;
  avatar_url: string | null; loyalty_points: number; tier: string;
  created_at: string; location: string | null; bio: string | null;
  bookingCount: number; totalSpend: number; segment: string;
  lastBooking: string | null; verified: boolean;
}

const tierColors: Record<string, string> = {
  Silver: "bg-muted text-muted-foreground",
  Gold: "bg-amber-500/15 text-amber-400",
  Platinum: "bg-blue-500/15 text-blue-400",
  Diamond: "bg-primary/15 text-primary",
};

const segmentConfig: Record<string, { label: string; color: string; bg: string }> = {
  high_spender: { label: "💰 High Spender", color: "text-amber-400", bg: "bg-amber-500/10" },
  frequent: { label: "🔁 Frequent", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  inactive: { label: "😴 Inactive", color: "text-muted-foreground", bg: "bg-secondary" },
  new_user: { label: "✨ New", color: "text-blue-400", bg: "bg-blue-500/10" },
  regular: { label: "👤 Regular", color: "text-foreground", bg: "bg-secondary" },
};

function assignSegment(bookings: number, spend: number, daysSinceJoin: number): string {
  if (spend >= 10000) return "high_spender";
  if (bookings >= 5) return "frequent";
  if (daysSinceJoin <= 14) return "new_user";
  if (bookings === 0 && daysSinceJoin > 30) return "inactive";
  return "regular";
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"spend" | "bookings" | "recent" | "points">("spend");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const [profilesRes, bookingsRes, verificationsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("user_id, total, date"),
        supabase.from("identity_verifications" as any).select("user_id, status"),
      ]);

      const bookingMap = new Map<string, { count: number; spend: number; lastDate: string | null }>();
      (bookingsRes.data ?? []).forEach((b: any) => {
        const existing = bookingMap.get(b.user_id) || { count: 0, spend: 0, lastDate: null };
        bookingMap.set(b.user_id, {
          count: existing.count + 1,
          spend: existing.spend + Number(b.total),
          lastDate: !existing.lastDate || b.date > existing.lastDate ? b.date : existing.lastDate,
        });
      });

      const verifiedSet = new Set<string>();
      (verificationsRes.data ?? []).forEach((v: any) => {
        if (v.status === "approved") verifiedSet.add(v.user_id);
      });

      const now = Date.now();
      setClients((profilesRes.data ?? []).map(p => {
        const bData = bookingMap.get(p.user_id) || { count: 0, spend: 0, lastDate: null };
        const daysSinceJoin = Math.floor((now - new Date(p.created_at).getTime()) / 86400000);
        return {
          ...p,
          bookingCount: bData.count,
          totalSpend: bData.spend,
          lastBooking: bData.lastDate,
          segment: assignSegment(bData.count, bData.spend, daysSinceJoin),
          verified: verifiedSet.has(p.user_id),
        };
      }));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = clients
    .filter(c => {
      const matchSearch = !search || (c.display_name?.toLowerCase().includes(search.toLowerCase())) || c.user_id.includes(search.toLowerCase());
      const matchSegment = !segmentFilter || c.segment === segmentFilter;
      const matchTier = !tierFilter || c.tier === tierFilter;
      const matchVerified = !verifiedFilter || (verifiedFilter === "verified" ? c.verified : !c.verified);
      return matchSearch && matchSegment && matchTier && matchVerified;
    })
    .sort((a, b) => {
      if (sortBy === "spend") return b.totalSpend - a.totalSpend;
      if (sortBy === "bookings") return b.bookingCount - a.bookingCount;
      if (sortBy === "points") return b.loyalty_points - a.loyalty_points;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const segmentCounts = clients.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  const exportCSV = () => {
    const headers = ["Name", "Tier", "Segment", "Bookings", "Total Spend", "Points", "Location", "Verified", "Joined"];
    const rows = filtered.map(c => [
      c.display_name || "Unnamed", c.tier, c.segment, c.bookingCount,
      c.totalSpend, c.loyalty_points, c.location || "-",
      c.verified ? "Yes" : "No",
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `hushh-clients-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users size={22} className="text-primary" /> Client Directory
          </h1>
          <p className="text-sm text-muted-foreground">{clients.length} clients · {filtered.length} shown</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Segment chips */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setSegmentFilter(null)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${!segmentFilter ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          All ({clients.length})
        </button>
        {Object.entries(segmentConfig).map(([key, cfg]) => (
          <button key={key} onClick={() => setSegmentFilter(segmentFilter === key ? null : key)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${segmentFilter === key ? `${cfg.bg} ${cfg.color}` : "bg-secondary text-muted-foreground"}`}>
            {cfg.label} ({segmentCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or user ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${showFilters ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-wrap gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Tier</p>
            <div className="flex gap-1">
              {["Silver","Gold","Platinum","Diamond"].map(t => (
                <button key={t} onClick={() => setTierFilter(tierFilter === t ? null : t)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition ${tierFilter === t ? tierColors[t] : "bg-card text-muted-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Verified</p>
            <div className="flex gap-1">
              {["verified","unverified"].map(v => (
                <button key={v} onClick={() => setVerifiedFilter(verifiedFilter === v ? null : v)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize transition ${verifiedFilter === v ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Sort By</p>
            <div className="flex gap-1">
              {([["spend","₹ Spend"],["bookings","Bookings"],["points","Points"],["recent","Recent"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setSortBy(k)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition ${sortBy === k ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Table view */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 rounded-lg bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden sm:table-cell">Tier</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Spend</TableHead>
                <TableHead className="hidden md:table-cell">Points</TableHead>
                <TableHead className="hidden lg:table-cell">Last Booking</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No clients match filters</TableCell></TableRow>
              ) : filtered.map(c => {
                const seg = segmentConfig[c.segment] || segmentConfig.regular;
                return (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                          {c.display_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{c.display_name || "Unnamed"}</p>
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${seg.bg} ${seg.color}`}>{seg.label}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierColors[c.tier] || tierColors.Silver}`}>{c.tier}</span>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm font-medium">{c.bookingCount}</TableCell>
                    <TableCell className="tabular-nums text-sm font-medium">₹{c.totalSpend.toLocaleString()}</TableCell>
                    <TableCell className="hidden md:table-cell tabular-nums text-sm">{c.loyalty_points}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{c.lastBooking || "—"}</TableCell>
                    <TableCell>
                      {c.verified ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-medium"><CheckCircle2 size={12} /> Verified</span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-[10px]"><Clock size={12} /> Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Client detail expand */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">{selectedClient.display_name || "Unnamed"}</h3>
            <button onClick={() => setSelectedClient(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "User ID", value: selectedClient.user_id.slice(0, 12) + "..." },
              { label: "Location", value: selectedClient.location || "Not set" },
              { label: "Member Since", value: new Date(selectedClient.created_at).toLocaleDateString("en", { month: "short", year: "numeric" }) },
              { label: "Bio", value: selectedClient.bio || "—" },
            ].map(d => (
              <div key={d.label}>
                <p className="text-[10px] text-muted-foreground">{d.label}</p>
                <p className="text-xs font-medium text-foreground truncate">{d.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Spend", value: `₹${filtered.reduce((s, c) => s + c.totalSpend, 0).toLocaleString()}`, icon: IndianRupee, color: "text-primary" },
          { label: "Avg Bookings", value: (filtered.reduce((s, c) => s + c.bookingCount, 0) / (filtered.length || 1)).toFixed(1), icon: CalendarCheck, color: "text-emerald-400" },
          { label: "Verified", value: filtered.filter(c => c.verified).length.toString(), icon: Shield, color: "text-blue-400" },
          { label: "Avg Points", value: Math.round(filtered.reduce((s, c) => s + c.loyalty_points, 0) / (filtered.length || 1)).toString(), icon: Tag, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
            <s.icon size={16} className={`mx-auto ${s.color} mb-1`} />
            <p className="text-lg font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
