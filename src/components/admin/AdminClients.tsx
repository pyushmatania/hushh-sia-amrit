import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Download, SlidersHorizontal, IndianRupee, CalendarCheck,
  Tag, Crown, Shield, CheckCircle2, Clock, X, MapPin, Star, Heart,
  ShoppingCart, MessageSquare, Share2, TrendingUp, ChevronRight, Mail,
  Phone, Award, Zap, BarChart3, ArrowUpRight, ArrowDownRight, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface ClientProfile {
  id: string; user_id: string; display_name: string | null;
  avatar_url: string | null; loyalty_points: number; tier: string;
  created_at: string; location: string | null; bio: string | null;
  bookingCount: number; totalSpend: number; segment: string;
  orderCount: number; orderSpend: number; reviewCount: number;
  wishlistCount: number; referralCount: number;
  lastBooking: string | null; verified: boolean;
  engagementScore: number;
}

const tierConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Silver: { color: "text-muted-foreground", bg: "bg-muted", icon: "🥈" },
  Gold: { color: "text-amber-400", bg: "bg-amber-500/10", icon: "🥇" },
  Platinum: { color: "text-blue-400", bg: "bg-blue-500/10", icon: "💎" },
  Diamond: { color: "text-purple-400", bg: "bg-purple-500/10", icon: "👑" },
};

const segmentConfig: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  vip: { label: "VIP", color: "text-purple-400", bg: "bg-purple-500/10", desc: "High-value repeat customer" },
  high_spender: { label: "High Spender", color: "text-amber-400", bg: "bg-amber-500/10", desc: "Spend ≥ ₹5,000" },
  frequent: { label: "Frequent", color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "5+ bookings" },
  engaged: { label: "Engaged", color: "text-blue-400", bg: "bg-blue-500/10", desc: "Active with reviews & orders" },
  inactive: { label: "Inactive", color: "text-muted-foreground", bg: "bg-secondary", desc: "No activity in 30+ days" },
  new_user: { label: "New", color: "text-cyan-400", bg: "bg-cyan-500/10", desc: "Joined < 14 days ago" },
  regular: { label: "Regular", color: "text-foreground", bg: "bg-secondary", desc: "Standard user" },
};

function assignSegment(b: number, spend: number, days: number, reviews: number, orders: number): string {
  if (spend >= 5000 && b >= 3) return "vip";
  if (spend >= 5000) return "high_spender";
  if (b >= 5) return "frequent";
  if (reviews >= 2 || orders >= 3) return "engaged";
  if (days <= 14) return "new_user";
  if (b === 0 && days > 30) return "inactive";
  return "regular";
}

function calcEngagement(b: number, orders: number, reviews: number, wishlists: number, referrals: number, points: number): number {
  return Math.min(100, Math.round(
    (b * 15) + (orders * 10) + (reviews * 20) + (wishlists * 5) + (referrals * 15) + (points / 50)
  ));
}

function EngagementRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "stroke-emerald-400" : score >= 40 ? "stroke-amber-400" : "stroke-destructive";
  return (
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
        <circle cx="20" cy="20" r="18" fill="none" className="stroke-secondary" strokeWidth="3" />
        <circle cx="20" cy="20" r="18" fill="none" className={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground tabular-nums">{score}</span>
    </div>
  );
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"spend" | "bookings" | "recent" | "points" | "engagement">("engagement");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");

  useEffect(() => {
    const load = async () => {
      const [profilesRes, bookingsRes, verificationsRes, ordersRes, reviewsRes, wishlistsRes, referralsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("user_id, total, date, status, property_id, slot"),
        supabase.from("identity_verifications").select("user_id, status"),
        supabase.from("orders").select("user_id, total, status"),
        supabase.from("reviews").select("user_id, rating"),
        supabase.from("wishlists").select("user_id"),
        supabase.from("referral_codes").select("user_id, uses"),
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

      const orderMap = new Map<string, { count: number; spend: number }>();
      (ordersRes.data ?? []).forEach((o: any) => {
        const e = orderMap.get(o.user_id) || { count: 0, spend: 0 };
        orderMap.set(o.user_id, { count: e.count + 1, spend: e.spend + Number(o.total) });
      });

      const reviewMap = new Map<string, number>();
      (reviewsRes.data ?? []).forEach((r: any) => reviewMap.set(r.user_id, (reviewMap.get(r.user_id) || 0) + 1));

      const wishlistMap = new Map<string, number>();
      (wishlistsRes.data ?? []).forEach((w: any) => wishlistMap.set(w.user_id, (wishlistMap.get(w.user_id) || 0) + 1));

      const referralMap = new Map<string, number>();
      (referralsRes.data ?? []).forEach((r: any) => referralMap.set(r.user_id, (referralMap.get(r.user_id) || 0) + 1));

      const verifiedSet = new Set<string>();
      (verificationsRes.data ?? []).forEach((v: any) => { if (v.status === "approved") verifiedSet.add(v.user_id); });

      const now = Date.now();
      setClients((profilesRes.data ?? []).map(p => {
        const bData = bookingMap.get(p.user_id) || { count: 0, spend: 0, lastDate: null };
        const oData = orderMap.get(p.user_id) || { count: 0, spend: 0 };
        const reviews = reviewMap.get(p.user_id) || 0;
        const wishlists = wishlistMap.get(p.user_id) || 0;
        const referrals = referralMap.get(p.user_id) || 0;
        const daysSinceJoin = Math.floor((now - new Date(p.created_at).getTime()) / 86400000);

        return {
          ...p,
          bookingCount: bData.count,
          totalSpend: bData.spend,
          lastBooking: bData.lastDate,
          orderCount: oData.count,
          orderSpend: oData.spend,
          reviewCount: reviews,
          wishlistCount: wishlists,
          referralCount: referrals,
          segment: assignSegment(bData.count, bData.spend + oData.spend, daysSinceJoin, reviews, oData.count),
          verified: verifiedSet.has(p.user_id),
          engagementScore: calcEngagement(bData.count, oData.count, reviews, wishlists, referrals, p.loyalty_points),
        };
      }));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() =>
    clients
      .filter(c => {
        const matchSearch = !search || c.display_name?.toLowerCase().includes(search.toLowerCase()) || c.location?.toLowerCase().includes(search.toLowerCase()) || c.user_id.includes(search.toLowerCase());
        const matchSegment = !segmentFilter || c.segment === segmentFilter;
        const matchTier = !tierFilter || c.tier === tierFilter;
        const matchVerified = !verifiedFilter || (verifiedFilter === "verified" ? c.verified : !c.verified);
        return matchSearch && matchSegment && matchTier && matchVerified;
      })
      .sort((a, b) => {
        if (sortBy === "spend") return (b.totalSpend + b.orderSpend) - (a.totalSpend + a.orderSpend);
        if (sortBy === "bookings") return b.bookingCount - a.bookingCount;
        if (sortBy === "points") return b.loyalty_points - a.loyalty_points;
        if (sortBy === "engagement") return b.engagementScore - a.engagementScore;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [clients, search, segmentFilter, tierFilter, verifiedFilter, sortBy]
  );

  const segmentCounts = useMemo(() =>
    clients.reduce((acc, c) => { acc[c.segment] = (acc[c.segment] || 0) + 1; return acc; }, {} as Record<string, number>),
    [clients]
  );

  const stats = useMemo(() => {
    const totalSpend = filtered.reduce((s, c) => s + c.totalSpend + c.orderSpend, 0);
    const avgEngagement = Math.round(filtered.reduce((s, c) => s + c.engagementScore, 0) / (filtered.length || 1));
    const totalBookings = filtered.reduce((s, c) => s + c.bookingCount, 0);
    const totalOrders = filtered.reduce((s, c) => s + c.orderCount, 0);
    return { totalSpend, avgEngagement, totalBookings, totalOrders };
  }, [filtered]);

  const exportCSV = () => {
    const headers = ["Name","Tier","Segment","Engagement","Bookings","Orders","Total Spend","Order Spend","Reviews","Wishlists","Referrals","Points","Location","Verified","Bio","Joined"];
    const rows = filtered.map(c => [
      c.display_name || "Unnamed", c.tier, c.segment, c.engagementScore, c.bookingCount, c.orderCount,
      c.totalSpend, c.orderSpend, c.reviewCount, c.wishlistCount, c.referralCount,
      c.loyalty_points, c.location || "-", c.verified ? "Yes" : "No", `"${(c.bio || "").replace(/"/g, '""')}"`,
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `hushh-clients-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const daysSince = (d: string) => {
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users size={20} className="text-primary" /> Client Directory
          </h1>
          <p className="text-xs text-muted-foreground">{clients.length} total · {filtered.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setViewMode("cards")} className={`px-2.5 py-1.5 text-[10px] font-medium ${viewMode === "cards" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>Cards</button>
            <button onClick={() => setViewMode("compact")} className={`px-2.5 py-1.5 text-[10px] font-medium ${viewMode === "compact" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>Compact</button>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Revenue", value: `₹${stats.totalSpend.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-primary" },
          { label: "Bookings", value: stats.totalBookings.toString(), icon: CalendarCheck, color: "text-emerald-400" },
          { label: "Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "text-amber-400" },
          { label: "Avg Engagement", value: `${stats.avgEngagement}%`, icon: Zap, color: "text-blue-400" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-3">
            <s.icon size={14} className={`${s.color} mb-1`} />
            <p className="text-base font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Segment pills */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setSegmentFilter(null)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${!segmentFilter ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          All ({clients.length})
        </button>
        {Object.entries(segmentConfig).map(([key, cfg]) => (
          segmentCounts[key] ? (
            <button key={key} onClick={() => setSegmentFilter(segmentFilter === key ? null : key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${segmentFilter === key ? `${cfg.bg} ${cfg.color}` : "bg-secondary text-muted-foreground"}`}>
              {cfg.label} ({segmentCounts[key]})
            </button>
          ) : null
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, location, ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition ${showFilters ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex flex-wrap gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Tier</p>
            <div className="flex gap-1">
              {Object.entries(tierConfig).map(([t, cfg]) => (
                <button key={t} onClick={() => setTierFilter(tierFilter === t ? null : t)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition ${tierFilter === t ? `${cfg.bg} ${cfg.color}` : "bg-card text-muted-foreground"}`}>
                  {cfg.icon} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">ID Status</p>
            <div className="flex gap-1">
              {["verified", "unverified"].map(v => (
                <button key={v} onClick={() => setVerifiedFilter(verifiedFilter === v ? null : v)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize transition ${verifiedFilter === v ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground"}`}>
                  {v === "verified" ? "✅" : "⏳"} {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Sort</p>
            <div className="flex gap-1">
              {([["engagement", "🎯 Engagement"], ["spend", "₹ Spend"], ["bookings", "📅 Bookings"], ["points", "⭐ Points"], ["recent", "🕒 Recent"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setSortBy(k)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition ${sortBy === k ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Client list */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No clients match your filters</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const seg = segmentConfig[c.segment] || segmentConfig.regular;
            const t = tierConfig[c.tier] || tierConfig.Silver;
            const isExpanded = expandedId === c.id;
            const lifetimeValue = c.totalSpend + c.orderSpend;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className="w-full p-4 text-left">
                  <div className="flex items-center gap-3">
                    {/* Avatar + Engagement ring */}
                    <div className="relative shrink-0">
                      <EngagementRing score={c.engagementScore} />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xs font-bold text-foreground">
                          {c.display_name?.[0]?.toUpperCase() || "?"}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{c.display_name || "Unnamed"}</p>
                        {c.verified && <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t.bg} ${t.color}`}>{t.icon} {c.tier}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {c.location && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <MapPin size={8} /> {c.location}
                          </span>
                        )}
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${seg.bg} ${seg.color}`}>{seg.label}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground tabular-nums">₹{lifetimeValue.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-muted-foreground">lifetime</p>
                    </div>
                  </div>

                  {/* Quick metrics row */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                    {[
                      { icon: CalendarCheck, value: c.bookingCount, label: "bookings", color: "text-emerald-400" },
                      { icon: ShoppingCart, value: c.orderCount, label: "orders", color: "text-amber-400" },
                      { icon: Star, value: c.reviewCount, label: "reviews", color: "text-yellow-400" },
                      { icon: Heart, value: c.wishlistCount, label: "saved", color: "text-rose-400" },
                      { icon: Award, value: c.loyalty_points, label: "pts", color: "text-primary" },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-1">
                        <m.icon size={10} className={m.color} />
                        <span className="text-[10px] font-semibold text-foreground tabular-nums">{m.value}</span>
                        <span className="text-[9px] text-muted-foreground">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border">
                        {/* Bio */}
                        {c.bio && (
                          <p className="text-xs text-muted-foreground italic">&ldquo;{c.bio}&rdquo;</p>
                        )}

                        {/* Detailed metrics */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Booking Spend", value: `₹${c.totalSpend.toLocaleString("en-IN")}`, icon: CalendarCheck },
                            { label: "Order Spend", value: `₹${c.orderSpend.toLocaleString("en-IN")}`, icon: ShoppingCart },
                            { label: "Referrals Made", value: c.referralCount.toString(), icon: Share2 },
                            { label: "Last Booking", value: c.lastBooking || "Never", icon: Clock },
                            { label: "Member Since", value: daysSince(c.created_at), icon: CalendarCheck },
                            { label: "Segment", value: seg.desc, icon: BarChart3 },
                          ].map(d => (
                            <div key={d.label} className="rounded-lg bg-secondary/50 p-2.5">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <d.icon size={10} className="text-muted-foreground" />
                                <p className="text-[9px] text-muted-foreground">{d.label}</p>
                              </div>
                              <p className="text-xs font-medium text-foreground">{d.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Engagement breakdown */}
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-[10px] font-semibold text-foreground mb-2 flex items-center gap-1">
                            <Zap size={10} className="text-primary" /> Engagement Breakdown
                          </p>
                          <div className="space-y-1.5">
                            {[
                              { label: "Bookings", score: Math.min(100, c.bookingCount * 15), max: "15pts each" },
                              { label: "Orders", score: Math.min(100, c.orderCount * 10), max: "10pts each" },
                              { label: "Reviews", score: Math.min(100, c.reviewCount * 20), max: "20pts each" },
                              { label: "Referrals", score: Math.min(100, c.referralCount * 15), max: "15pts each" },
                              { label: "Loyalty", score: Math.min(100, Math.round(c.loyalty_points / 50)), max: "pts/50" },
                            ].map(e => (
                              <div key={e.label} className="flex items-center gap-2">
                                <span className="text-[9px] text-muted-foreground w-16">{e.label}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <div className="h-full rounded-full bg-primary/60" style={{ width: `${e.score}%`, transition: "width 0.5s" }} />
                                </div>
                                <span className="text-[8px] text-muted-foreground w-14 text-right">{e.max}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* User ID */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="font-mono">ID: {c.user_id.slice(0, 20)}...</span>
                          <span>{c.verified ? "✅ ID Verified" : "⏳ Not Verified"}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Compact view */
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">Client</th>
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">Tier</th>
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">Engagement</th>
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">Bookings</th>
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">Orders</th>
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">Revenue</th>
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">Points</th>
                  <th className="p-3 text-[10px] font-semibold text-muted-foreground">ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const seg = segmentConfig[c.segment] || segmentConfig.regular;
                  const t = tierConfig[c.tier] || tierConfig.Silver;
                  return (
                    <tr key={c.id} className="border-b border-border hover:bg-secondary/30 transition cursor-pointer" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                            {c.display_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground truncate max-w-[100px]">{c.display_name || "Unnamed"}</p>
                            <span className={`text-[8px] font-bold ${seg.color}`}>{seg.label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3"><span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${t.bg} ${t.color}`}>{t.icon}{c.tier}</span></td>
                      <td className="p-3"><span className={`text-xs font-bold tabular-nums ${c.engagementScore >= 70 ? "text-emerald-400" : c.engagementScore >= 40 ? "text-amber-400" : "text-destructive"}`}>{c.engagementScore}</span></td>
                      <td className="p-3 text-xs font-medium tabular-nums text-foreground">{c.bookingCount}</td>
                      <td className="p-3 text-xs font-medium tabular-nums text-foreground">{c.orderCount}</td>
                      <td className="p-3 text-xs font-bold tabular-nums text-foreground">₹{(c.totalSpend + c.orderSpend).toLocaleString("en-IN")}</td>
                      <td className="p-3 text-xs tabular-nums text-muted-foreground">{c.loyalty_points}</td>
                      <td className="p-3">{c.verified ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Clock size={12} className="text-muted-foreground" />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
