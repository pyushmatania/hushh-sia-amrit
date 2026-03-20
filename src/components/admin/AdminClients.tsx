import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Download, SlidersHorizontal, IndianRupee, CalendarCheck,
  Shield, CheckCircle2, Clock, X, MapPin, Star, Heart, ShoppingCart,
  Share2, Zap, Award, ChevronRight, ArrowLeft, FileText, User,
  ChefHat, Receipt, Phone, Mail, CreditCard, Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

/* ─── Types ─── */
interface BookingRecord {
  booking_id: string; property_id: string; date: string; slot: string;
  guests: number; total: number; status: string; created_at: string;
  propertyName?: string;
}

interface OrderRecord {
  id: string; property_id: string; total: number; status: string;
  created_at: string; assigned_name: string | null;
  items: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  propertyName?: string;
}

interface ReviewRecord {
  id: string; property_id: string; rating: number; content: string; created_at: string;
  propertyName?: string;
}

interface IdVerification {
  document_type: string; status: string; submitted_at: string;
}

interface ClientProfile {
  id: string; user_id: string; display_name: string | null;
  avatar_url: string | null; loyalty_points: number; tier: string;
  created_at: string; location: string | null; bio: string | null;
  bookings: BookingRecord[]; orders: OrderRecord[]; reviews: ReviewRecord[];
  verifications: IdVerification[]; wishlistCount: number; referralCount: number;
  totalSpend: number; orderSpend: number; segment: string; engagementScore: number;
}

/* ─── Config ─── */
const tierConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Silver: { color: "text-muted-foreground", bg: "bg-muted", icon: "🥈" },
  Gold: { color: "text-amber-400", bg: "bg-amber-500/10", icon: "🥇" },
  Platinum: { color: "text-blue-400", bg: "bg-blue-500/10", icon: "💎" },
  Diamond: { color: "text-purple-400", bg: "bg-purple-500/10", icon: "👑" },
};

const segmentConfig: Record<string, { label: string; color: string; bg: string }> = {
  vip: { label: "VIP", color: "text-purple-400", bg: "bg-purple-500/10" },
  high_spender: { label: "High Spender", color: "text-amber-400", bg: "bg-amber-500/10" },
  frequent: { label: "Frequent", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  engaged: { label: "Engaged", color: "text-blue-400", bg: "bg-blue-500/10" },
  new_user: { label: "New", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  inactive: { label: "Inactive", color: "text-muted-foreground", bg: "bg-secondary" },
  regular: { label: "Regular", color: "text-foreground", bg: "bg-secondary" },
};

const bookingStatusColors: Record<string, string> = {
  upcoming: "bg-primary/15 text-primary",
  active: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-muted text-muted-foreground",
  confirmed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-destructive/15 text-destructive",
  pending: "bg-amber-500/15 text-amber-400",
};

function assignSegment(bookings: number, spend: number, days: number, reviews: number, orders: number): string {
  if (spend >= 5000 && bookings >= 3) return "vip";
  if (spend >= 5000) return "high_spender";
  if (bookings >= 5) return "frequent";
  if (reviews >= 2 || orders >= 3) return "engaged";
  if (days <= 14) return "new_user";
  if (bookings === 0 && days > 30) return "inactive";
  return "regular";
}

function calcEngagement(b: number, o: number, r: number, w: number, ref: number, pts: number): number {
  return Math.min(100, Math.round((b * 15) + (o * 10) + (r * 20) + (w * 5) + (ref * 15) + (pts / 50)));
}

function EngagementRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = (size / 2) - 3;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 70 ? "stroke-emerald-400" : score >= 40 ? "stroke-amber-400" : "stroke-destructive";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-secondary" strokeWidth="2.5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={color} strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground tabular-nums">{score}</span>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/* ─── Client Detail Drawer ─── */
function ClientDetailDrawer({ client, onClose, listingMap }: { client: ClientProfile; onClose: () => void; listingMap: Map<string, string> }) {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "orders" | "timeline">("overview");
  const t = tierConfig[client.tier] || tierConfig.Silver;
  const seg = segmentConfig[client.segment] || segmentConfig.regular;
  const lifetimeValue = client.totalSpend + client.orderSpend;
  const idDoc = client.verifications[0];

  // Build timeline from all activities
  const timeline = useMemo(() => {
    const events: { date: string; type: string; title: string; subtitle: string; icon: typeof Clock; color: string }[] = [];
    client.bookings.forEach(b => events.push({
      date: b.created_at, type: "booking",
      title: `Booked ${listingMap.get(b.property_id) || "Property"}`,
      subtitle: `${b.date} · ${b.slot} · ${b.guests} guests · ₹${Number(b.total).toLocaleString("en-IN")} · ${b.booking_id}`,
      icon: CalendarCheck, color: "text-primary",
    }));
    client.orders.forEach(o => events.push({
      date: o.created_at, type: "order",
      title: `Ordered ${o.items.map(i => `${i.item_emoji}${i.item_name}`).join(", ") || "items"}`,
      subtitle: `₹${Number(o.total).toLocaleString("en-IN")} · ${o.status}${o.assigned_name ? ` · Chef: ${o.assigned_name}` : ""}`,
      icon: ShoppingCart, color: "text-amber-400",
    }));
    client.reviews.forEach(r => events.push({
      date: r.created_at, type: "review",
      title: `Reviewed ${listingMap.get(r.property_id) || "Property"}`,
      subtitle: `${"⭐".repeat(r.rating)} · "${r.content.slice(0, 60)}${r.content.length > 60 ? "..." : ""}"`,
      icon: Star, color: "text-yellow-400",
    }));
    if (idDoc) events.push({
      date: idDoc.submitted_at, type: "id",
      title: `ID Submitted (${idDoc.document_type})`,
      subtitle: `Status: ${idDoc.status}`,
      icon: Shield, color: "text-blue-400",
    });
    events.push({
      date: client.created_at, type: "joined",
      title: "Account Created",
      subtitle: `Joined Hushh`,
      icon: User, color: "text-muted-foreground",
    });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [client, listingMap, idDoc]);

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "bookings" as const, label: `Bookings (${client.bookings.length})` },
    { id: "orders" as const, label: `Orders (${client.orders.length})` },
    { id: "timeline" as const, label: "Timeline" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md h-full bg-card border-l border-border overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border p-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary">
              <ArrowLeft size={14} className="text-foreground" />
            </button>
            <h2 className="text-sm font-bold text-foreground flex-1">Client Profile</h2>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${seg.bg} ${seg.color}`}>{seg.label}</span>
          </div>
        </div>

        {/* Profile hero */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <EngagementRing score={client.engagementScore} size={56} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-sm font-bold text-foreground">
                  {client.display_name?.[0]?.toUpperCase() || "?"}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground truncate">{client.display_name || "Unnamed"}</h3>
                {idDoc?.status === "approved" && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${t.bg} ${t.color}`}>{t.icon} {client.tier}</span>
                {client.location && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <MapPin size={8} /> {client.location}
                  </span>
                )}
              </div>
              {client.bio && <p className="text-[10px] text-muted-foreground mt-1 italic truncate">{client.bio}</p>}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Lifetime", value: `₹${lifetimeValue.toLocaleString("en-IN")}`, color: "text-foreground" },
              { label: "Bookings", value: client.bookings.length.toString(), color: "text-primary" },
              { label: "Orders", value: client.orders.length.toString(), color: "text-amber-400" },
              { label: "Points", value: client.loyalty_points.toString(), color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="rounded-lg bg-secondary/50 p-2 text-center">
                <p className={`text-sm font-bold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[8px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & ID section */}
        <div className="p-4 border-b border-border space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Identity & Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Shield size={10} className="text-blue-400" />
                <span className="text-[9px] text-muted-foreground">ID Status</span>
              </div>
              {idDoc ? (
                <div>
                  <p className="text-xs font-medium text-foreground capitalize">{idDoc.document_type}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    idDoc.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                    idDoc.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                    "bg-destructive/15 text-destructive"
                  }`}>{idDoc.status}</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Not submitted</p>
              )}
            </div>
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <CalendarCheck size={10} className="text-primary" />
                <span className="text-[9px] text-muted-foreground">Member Since</span>
              </div>
              <p className="text-xs font-medium text-foreground">{formatDate(client.created_at)}</p>
              <p className="text-[9px] text-muted-foreground">{timeAgo(client.created_at)}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Share2 size={10} className="text-purple-400" />
                <span className="text-[9px] text-muted-foreground">Referrals</span>
              </div>
              <p className="text-xs font-medium text-foreground">{client.referralCount} referrals</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Heart size={10} className="text-rose-400" />
                <span className="text-[9px] text-muted-foreground">Wishlisted</span>
              </div>
              <p className="text-xs font-medium text-foreground">{client.wishlistCount} properties</p>
            </div>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <User size={10} className="text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">User ID</span>
            </div>
            <p className="text-[10px] font-mono text-foreground break-all">{client.user_id}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[57px] z-10 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-[10px] font-semibold text-center border-b-2 transition ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}>{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Engagement breakdown */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Engagement Score</h4>
                <div className="rounded-xl bg-secondary/50 p-3 space-y-2">
                  {[
                    { label: "Bookings", score: Math.min(100, client.bookings.length * 15) },
                    { label: "Orders", score: Math.min(100, client.orders.length * 10) },
                    { label: "Reviews", score: Math.min(100, client.reviews.length * 20) },
                    { label: "Referrals", score: Math.min(100, client.referralCount * 15) },
                    { label: "Loyalty", score: Math.min(100, Math.round(client.loyalty_points / 50)) },
                  ].map(e => (
                    <div key={e.label} className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground w-14">{e.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60" style={{ width: `${e.score}%`, transition: "width 0.5s" }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground w-6 text-right tabular-nums">{e.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spend breakdown */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Revenue Breakdown</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <CalendarCheck size={14} className="text-primary mb-1" />
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{client.totalSpend.toLocaleString("en-IN")}</p>
                    <p className="text-[9px] text-muted-foreground">from {client.bookings.length} bookings</p>
                  </div>
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <ShoppingCart size={14} className="text-amber-400 mb-1" />
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{client.orderSpend.toLocaleString("en-IN")}</p>
                    <p className="text-[9px] text-muted-foreground">from {client.orders.length} orders</p>
                  </div>
                </div>
              </div>

              {/* Recent activity preview */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</h4>
                <div className="space-y-1.5">
                  {timeline.slice(0, 4).map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/30 p-2">
                      <ev.icon size={12} className={`${ev.color} mt-0.5 shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-foreground truncate">{ev.title}</p>
                        <p className="text-[9px] text-muted-foreground">{formatDate(ev.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-2">
              {client.bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No bookings yet</p>
              ) : client.bookings
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home size={12} className="text-primary" />
                      <p className="text-xs font-semibold text-foreground">{listingMap.get(b.property_id) || `Property ${b.property_id}`}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${bookingStatusColors[b.status] || "bg-secondary text-muted-foreground"}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarCheck size={9} /> {b.date}</span>
                    <span className="flex items-center gap-1"><Clock size={9} /> {b.slot}</span>
                    <span className="flex items-center gap-1"><Users size={9} /> {b.guests} guests</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground"><IndianRupee size={9} /> ₹{Number(b.total).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-border">
                    <span className="text-[9px] font-mono text-muted-foreground">{b.booking_id}</span>
                    <span className="text-[9px] text-muted-foreground">{formatDate(b.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-2">
              {client.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
              ) : client.orders
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((o, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={12} className="text-amber-400" />
                      <p className="text-xs font-semibold text-foreground">{listingMap.get(o.property_id) || "Property"}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                      o.status === "delivered" ? "bg-emerald-500/15 text-emerald-400" :
                      o.status === "preparing" ? "bg-blue-500/15 text-blue-400" :
                      o.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>{o.status}</span>
                  </div>
                  {/* Items */}
                  {o.items.length > 0 && (
                    <div className="bg-secondary/50 rounded-lg p-2 space-y-1">
                      {o.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between text-[10px]">
                          <span>{item.item_emoji} {item.item_name} ×{item.quantity}</span>
                          <span className="text-muted-foreground tabular-nums">₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1.5 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground tabular-nums">₹{Number(o.total).toLocaleString("en-IN")}</span>
                      {o.assigned_name && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <ChefHat size={8} /> {o.assigned_name}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{formatDate(o.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-3">
                {timeline.map((ev, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 relative">
                    <div className={`w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0 z-10`}>
                      <ev.icon size={10} className={ev.color} />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-xs font-medium text-foreground">{ev.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ev.subtitle}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{formatDate(ev.date)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function AdminClients() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"spend" | "bookings" | "recent" | "engagement">("engagement");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [listingMap, setListingMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const load = async () => {
      const [profilesRes, bookingsRes, ordersRes, orderItemsRes, reviewsRes, wishlistsRes, referralsRes, verificationsRes, listingsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*"),
        supabase.from("orders").select("*"),
        supabase.from("order_items").select("*"),
        supabase.from("reviews").select("*"),
        supabase.from("wishlists").select("user_id"),
        supabase.from("referral_codes").select("user_id, uses"),
        supabase.from("identity_verifications").select("*"),
        supabase.from("host_listings").select("id, name"),
      ]);

      const lMap = new Map<string, string>();
      (listingsRes.data ?? []).forEach(l => lMap.set(l.id, l.name));
      setListingMap(lMap);

      // Group order items by order_id
      const oiMap = new Map<string, any[]>();
      (orderItemsRes.data ?? []).forEach(item => {
        const list = oiMap.get(item.order_id) || [];
        list.push(item); oiMap.set(item.order_id, list);
      });

      // Group data by user_id
      const bookingsByUser = new Map<string, BookingRecord[]>();
      (bookingsRes.data ?? []).forEach(b => {
        const list = bookingsByUser.get(b.user_id) || [];
        list.push({ ...b, propertyName: lMap.get(b.property_id) });
        bookingsByUser.set(b.user_id, list);
      });

      const ordersByUser = new Map<string, OrderRecord[]>();
      (ordersRes.data ?? []).forEach(o => {
        const list = ordersByUser.get(o.user_id) || [];
        list.push({
          ...o, assigned_name: (o as any).assigned_name || null,
          items: oiMap.get(o.id) || [],
          propertyName: lMap.get(o.property_id),
        });
        ordersByUser.set(o.user_id, list);
      });

      const reviewsByUser = new Map<string, ReviewRecord[]>();
      (reviewsRes.data ?? []).forEach(r => {
        const list = reviewsByUser.get(r.user_id) || [];
        list.push({ ...r, propertyName: lMap.get(r.property_id) });
        reviewsByUser.set(r.user_id, list);
      });

      const wishlistByUser = new Map<string, number>();
      (wishlistsRes.data ?? []).forEach(w => wishlistByUser.set(w.user_id, (wishlistByUser.get(w.user_id) || 0) + 1));

      const referralByUser = new Map<string, number>();
      (referralsRes.data ?? []).forEach(r => referralByUser.set(r.user_id, (referralByUser.get(r.user_id) || 0) + 1));

      const verifByUser = new Map<string, IdVerification[]>();
      (verificationsRes.data ?? []).forEach((v: any) => {
        const list = verifByUser.get(v.user_id) || [];
        list.push(v); verifByUser.set(v.user_id, list);
      });

      const now = Date.now();
      setClients((profilesRes.data ?? []).map(p => {
        const bookings = bookingsByUser.get(p.user_id) || [];
        const orders = ordersByUser.get(p.user_id) || [];
        const reviews = reviewsByUser.get(p.user_id) || [];
        const wishlists = wishlistByUser.get(p.user_id) || 0;
        const referrals = referralByUser.get(p.user_id) || 0;
        const verifications = verifByUser.get(p.user_id) || [];
        const totalSpend = bookings.reduce((s, b) => s + Number(b.total), 0);
        const orderSpend = orders.reduce((s, o) => s + Number(o.total), 0);
        const daysSinceJoin = Math.floor((now - new Date(p.created_at).getTime()) / 86400000);

        return {
          ...p, bookings, orders, reviews, verifications,
          wishlistCount: wishlists, referralCount: referrals,
          totalSpend, orderSpend,
          segment: assignSegment(bookings.length, totalSpend + orderSpend, daysSinceJoin, reviews.length, orders.length),
          engagementScore: calcEngagement(bookings.length, orders.length, reviews.length, wishlists, referrals, p.loyalty_points),
        };
      }));
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() =>
    clients
      .filter(c => {
        const s = search.toLowerCase();
        const matchSearch = !search || c.display_name?.toLowerCase().includes(s) || c.location?.toLowerCase().includes(s) || c.user_id.includes(s) || c.bio?.toLowerCase().includes(s);
        return matchSearch && (!segmentFilter || c.segment === segmentFilter) && (!tierFilter || c.tier === tierFilter);
      })
      .sort((a, b) => {
        if (sortBy === "spend") return (b.totalSpend + b.orderSpend) - (a.totalSpend + a.orderSpend);
        if (sortBy === "bookings") return b.bookings.length - a.bookings.length;
        if (sortBy === "engagement") return b.engagementScore - a.engagementScore;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [clients, search, segmentFilter, tierFilter, sortBy]
  );

  const segmentCounts = useMemo(() =>
    clients.reduce((acc, c) => { acc[c.segment] = (acc[c.segment] || 0) + 1; return acc; }, {} as Record<string, number>),
    [clients]
  );

  const stats = useMemo(() => ({
    totalRevenue: filtered.reduce((s, c) => s + c.totalSpend + c.orderSpend, 0),
    avgEngagement: Math.round(filtered.reduce((s, c) => s + c.engagementScore, 0) / (filtered.length || 1)),
    totalBookings: filtered.reduce((s, c) => s + c.bookings.length, 0),
    totalOrders: filtered.reduce((s, c) => s + c.orders.length, 0),
    verified: filtered.filter(c => c.verifications.some(v => v.status === "approved")).length,
  }), [filtered]);

  const exportCSV = () => {
    const headers = ["Name", "Tier", "Segment", "Engagement", "Bookings", "Orders", "Booking Spend", "Order Spend", "Total Revenue", "Reviews", "Wishlists", "Referrals", "Points", "Location", "ID Status", "Joined"];
    const rows = filtered.map(c => [
      c.display_name || "Unnamed", c.tier, c.segment, c.engagementScore, c.bookings.length, c.orders.length,
      c.totalSpend, c.orderSpend, c.totalSpend + c.orderSpend, c.reviews.length, c.wishlistCount, c.referralCount,
      c.loyalty_points, c.location || "-",
      c.verifications[0]?.status || "none",
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `hushh-clients-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users size={20} className="text-primary" /> Client Directory
          </h1>
          <p className="text-xs text-muted-foreground">{clients.length} clients · {filtered.length} shown</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-primary" },
          { label: "Bookings", value: stats.totalBookings.toString(), icon: CalendarCheck, color: "text-emerald-400" },
          { label: "Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "text-amber-400" },
          { label: "Verified", value: stats.verified.toString(), icon: Shield, color: "text-blue-400" },
          { label: "Avg Score", value: `${stats.avgEngagement}`, icon: Zap, color: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-2.5 text-center">
            <s.icon size={12} className={`${s.color} mx-auto mb-0.5`} />
            <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Segments */}
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
          <Input placeholder="Search name, location, bio..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
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
            <p className="text-[10px] text-muted-foreground mb-1">Sort</p>
            <div className="flex gap-1">
              {([["engagement", "🎯 Score"], ["spend", "₹ Revenue"], ["bookings", "📅 Bookings"], ["recent", "🕒 Recent"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setSortBy(k)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition ${sortBy === k ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Client cards */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No clients match your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => {
            const seg = segmentConfig[c.segment] || segmentConfig.regular;
            const t = tierConfig[c.tier] || tierConfig.Silver;
            const lifetimeValue = c.totalSpend + c.orderSpend;
            const idDoc = c.verifications[0];

            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedClient(c)}
                className="w-full rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30 transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <EngagementRing score={c.engagementScore} size={44} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-[10px] font-bold text-foreground">
                        {c.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">{c.display_name || "Unnamed"}</p>
                      {idDoc?.status === "approved" && <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />}
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded-full ${t.bg} ${t.color}`}>{t.icon}{c.tier}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {c.location && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><MapPin size={7} />{c.location}</span>}
                      <span className={`text-[8px] font-bold ${seg.color}`}>{seg.label}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground tabular-nums">₹{lifetimeValue.toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      <span className="text-[8px] text-muted-foreground">{c.bookings.length}B</span>
                      <span className="text-[8px] text-muted-foreground">{c.orders.length}O</span>
                      <span className="text-[8px] text-muted-foreground">{c.reviews.length}R</span>
                    </div>
                  </div>

                  <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailDrawer
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            listingMap={listingMap}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
