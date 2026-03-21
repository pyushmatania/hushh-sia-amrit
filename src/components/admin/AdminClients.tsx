import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Download, SlidersHorizontal, IndianRupee, CalendarCheck,
  Shield, CheckCircle2, Clock, X, MapPin, Star, Heart, ShoppingCart,
  Share2, Zap, Award, ChevronRight, ArrowLeft, FileText, User,
  ChefHat, Receipt, Phone, Mail, CreditCard, Home, Globe, Hash,
  Sparkles, TrendingUp, Eye, Bot, Send, Loader2
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
const tierGradients: Record<string, { ring: string; badge: string; text: string; icon: string }> = {
  Silver: { ring: "from-zinc-400 to-zinc-300", badge: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-400", icon: "🥈" },
  Gold: { ring: "from-amber-400 to-yellow-300", badge: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", icon: "🥇" },
  Platinum: { ring: "from-blue-400 to-cyan-300", badge: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", icon: "💎" },
  Diamond: { ring: "from-purple-400 to-pink-300", badge: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400", icon: "👑" },
};

const segmentConfig: Record<string, { label: string; color: string; bg: string; glow: string }> = {
  vip: { label: "VIP", color: "text-purple-400", bg: "bg-purple-500/10", glow: "shadow-purple-500/20" },
  high_spender: { label: "High Spender", color: "text-amber-400", bg: "bg-amber-500/10", glow: "shadow-amber-500/20" },
  frequent: { label: "Frequent", color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20" },
  engaged: { label: "Engaged", color: "text-blue-400", bg: "bg-blue-500/10", glow: "shadow-blue-500/20" },
  new_user: { label: "New", color: "text-cyan-400", bg: "bg-cyan-500/10", glow: "shadow-cyan-500/20" },
  inactive: { label: "Inactive", color: "text-muted-foreground", bg: "bg-secondary", glow: "" },
  regular: { label: "Regular", color: "text-foreground", bg: "bg-secondary", glow: "" },
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

/* ─── Avatar with tier ring ─── */
function ProfileAvatar({ client, size = 48 }: { client: ClientProfile; size?: number }) {
  const tier = tierGradients[client.tier] || tierGradients.Silver;
  const imgSize = size - 6;
  const initials = (client.display_name || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Gradient ring */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${tier.ring} p-[2.5px]`}>
        <div className="w-full h-full rounded-full bg-card" />
      </div>
      {/* Avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        {client.avatar_url ? (
          <img
            src={client.avatar_url}
            alt={client.display_name || ""}
            className="rounded-full object-cover"
            style={{ width: imgSize, height: imgSize }}
          />
        ) : (
          <div
            className="rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-foreground"
            style={{ width: imgSize, height: imgSize, fontSize: size * 0.28 }}
          >
            {initials}
          </div>
        )}
      </div>
      {/* Online dot / verified badge */}
      {client.verifications.some(v => v.status === "approved") && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-card flex items-center justify-center">
          <CheckCircle2 size={12} className="text-emerald-400" />
        </div>
      )}
    </div>
  );
}

function EngagementBar({ score }: { score: number }) {
  const color = score >= 70 ? "from-emerald-500 to-emerald-400" : score >= 40 ? "from-amber-500 to-amber-400" : "from-red-500 to-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <span className="text-[9px] font-bold text-muted-foreground tabular-nums w-5 text-right">{score}</span>
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

function ContactPill({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2">
      <Icon size={12} className="text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-[11px] font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Client Detail Drawer ─── */
function ClientDetailDrawer({ client, onClose, listingMap }: { client: ClientProfile; onClose: () => void; listingMap: Map<string, string> }) {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "orders" | "timeline">("overview");
  const tier = tierGradients[client.tier] || tierGradients.Silver;
  const seg = segmentConfig[client.segment] || segmentConfig.regular;
  const lifetimeValue = client.totalSpend + client.orderSpend;
  const idDoc = client.verifications[0];

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
    { id: "overview" as const, label: "Overview", icon: Eye },
    { id: "bookings" as const, label: `Stays (${client.bookings.length})`, icon: Home },
    { id: "orders" as const, label: `Orders (${client.orders.length})`, icon: ShoppingCart },
    { id: "timeline" as const, label: "Timeline", icon: Clock },
  ];

  // Generate mock contact from user_id for demo
  const mockPhone = `+91 ${client.user_id.slice(0, 5).replace(/[^0-9]/g, "9")}${Math.floor(1000000 + Math.random() * 9000000)}`.slice(0, 14);
  const mockEmail = `${(client.display_name || "user").toLowerCase().replace(/\s+/g, ".")}@gmail.com`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md h-full bg-card border-l border-border overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero header with gradient */}
        <div className="relative">
          <div className={`h-28 bg-gradient-to-br ${tier.ring} opacity-20`} />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />

          {/* Back button */}
          <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition">
            <ArrowLeft size={14} className="text-foreground" />
          </button>

          {/* Segment badge */}
          <span className={`absolute top-3 right-3 text-[9px] font-bold px-2.5 py-1 rounded-full border ${seg.bg} ${seg.color} backdrop-blur-sm`}>
            {seg.label}
          </span>

          {/* Profile avatar - overlapping */}
          <div className="absolute -bottom-8 left-4">
            <ProfileAvatar client={client} size={72} />
          </div>
        </div>

        {/* Name & tier */}
        <div className="pt-12 px-4 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground truncate">{client.display_name || "Unnamed"}</h2>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tier.badge} ${tier.text}`}>
                  {tier.icon} {client.tier}
                </span>
              </div>
              {client.bio && <p className="text-[11px] text-muted-foreground mt-1 italic line-clamp-2">{client.bio}</p>}
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <CalendarCheck size={9} /> Member since {formatDate(client.created_at)} · {timeAgo(client.created_at)}
              </p>
            </div>
          </div>

          {/* Contact info row */}
          <div className="grid grid-cols-1 gap-1.5 mt-3">
            <ContactPill icon={Phone} label="Phone" value={mockPhone} />
            <ContactPill icon={Mail} label="Email" value={mockEmail} />
            {client.location && <ContactPill icon={MapPin} label="Address" value={client.location} />}
            <ContactPill icon={Hash} label="User ID" value={client.user_id.slice(0, 12) + "…"} />
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Revenue", value: `₹${lifetimeValue.toLocaleString("en-IN")}`, color: "text-foreground", sub: "lifetime" },
              { label: "Stays", value: client.bookings.length.toString(), color: "text-primary", sub: "bookings" },
              { label: "Orders", value: client.orders.length.toString(), color: "text-amber-400", sub: "food" },
              { label: "Points", value: client.loyalty_points.toLocaleString(), color: "text-emerald-400", sub: "loyalty" },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-secondary/40 border border-border/50 p-2.5 text-center">
                <p className={`text-base font-bold tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Engagement bar */}
          <div className="mt-3 rounded-xl bg-secondary/40 border border-border/50 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Zap size={10} /> Engagement Score</span>
              <span className="text-xs font-bold text-foreground">{client.engagementScore}/100</span>
            </div>
            <EngagementBar score={client.engagementScore} />
          </div>
        </div>

        {/* ID & verification */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border/50 p-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              idDoc?.status === "approved" ? "bg-emerald-500/10" : idDoc ? "bg-amber-500/10" : "bg-secondary"
            }`}>
              <Shield size={18} className={
                idDoc?.status === "approved" ? "text-emerald-400" : idDoc ? "text-amber-400" : "text-muted-foreground"
              } />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Identity Verification</p>
              {idDoc ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground capitalize">{idDoc.document_type}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    idDoc.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                    idDoc.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                    "bg-destructive/15 text-destructive"
                  }`}>{idDoc.status}</span>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground">Not submitted yet</p>
              )}
            </div>
            <div className="text-right">
              <Share2 size={10} className="text-purple-400 inline mr-1" />
              <span className="text-[10px] text-muted-foreground">{client.referralCount} referrals</span>
              <br />
              <Heart size={10} className="text-rose-400 inline mr-1" />
              <span className="text-[10px] text-muted-foreground">{client.wishlistCount} saved</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-[10px] font-semibold text-center border-b-2 transition flex items-center justify-center gap-1 ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}>
                <tab.icon size={10} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Engagement Breakdown</h4>
                <div className="rounded-xl bg-secondary/40 border border-border/50 p-3 space-y-2.5">
                  {[
                    { label: "Bookings", score: Math.min(100, client.bookings.length * 15), icon: CalendarCheck },
                    { label: "Orders", score: Math.min(100, client.orders.length * 10), icon: ShoppingCart },
                    { label: "Reviews", score: Math.min(100, client.reviews.length * 20), icon: Star },
                    { label: "Referrals", score: Math.min(100, client.referralCount * 15), icon: Share2 },
                    { label: "Loyalty", score: Math.min(100, Math.round(client.loyalty_points / 50)), icon: Award },
                  ].map(e => (
                    <div key={e.label} className="flex items-center gap-2">
                      <e.icon size={10} className="text-muted-foreground shrink-0" />
                      <span className="text-[9px] text-muted-foreground w-14">{e.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${e.score}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="h-full rounded-full bg-primary/60" />
                      </div>
                      <span className="text-[9px] text-muted-foreground w-6 text-right tabular-nums">{e.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Revenue Split</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-secondary/40 border border-border/50 p-3">
                    <Home size={14} className="text-primary mb-1.5" />
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{client.totalSpend.toLocaleString("en-IN")}</p>
                    <p className="text-[9px] text-muted-foreground">{client.bookings.length} stays</p>
                  </div>
                  <div className="rounded-xl bg-secondary/40 border border-border/50 p-3">
                    <ShoppingCart size={14} className="text-amber-400 mb-1.5" />
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{client.orderSpend.toLocaleString("en-IN")}</p>
                    <p className="text-[9px] text-muted-foreground">{client.orders.length} orders</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</h4>
                <div className="space-y-1.5">
                  {timeline.slice(0, 5).map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/30 p-2.5">
                      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <ev.icon size={11} className={ev.color} />
                      </div>
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
                <div className="text-center py-12">
                  <Home size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No stays yet</p>
                </div>
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
                <div className="text-center py-12">
                  <ShoppingCart size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
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
                    <div className="w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0 z-10">
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

/* ─── AI Search for Client Directory ─── */
function ClientAISearch({ clients, listingMap }: { clients: ClientProfile[]; listingMap: Map<string, string> }) {
  const handleSearch = async (query: string): Promise<string> => {
    const context = clients.slice(0, 50).map(c => ({
      name: c.display_name, tier: c.tier, segment: c.segment,
      points: c.loyalty_points, location: c.location,
      totalSpend: c.totalSpend + c.orderSpend,
      bookings: c.bookings.map(b => ({
        property: listingMap.get(b.property_id) || b.property_id,
        date: b.date, slot: b.slot, guests: b.guests, total: b.total, status: b.status,
      })),
      orders: c.orders.map(o => ({
        items: o.items.map(i => `${i.item_emoji}${i.item_name} x${i.quantity}`).join(", "),
        total: o.total, date: o.created_at.split("T")[0], chef: o.assigned_name,
      })),
      reviews: c.reviews.length,
      avgRating: c.reviews.length ? (c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length).toFixed(1) : null,
      verified: c.verifications.some(v => v.status === "approved"),
      joined: c.created_at.split("T")[0],
    }));

    const resp = await supabase.functions.invoke("property-history-ai", {
      body: { query, context: JSON.stringify(context), mode: "clients" },
    });
    if (resp.error) throw resp.error;
    return resp.data?.answer || "No answer found.";
  };

  return (
    <NeuralSearchWidget
      title="Client Intelligence"
      subtitle="Deep insights across guest behavior & spend"
      placeholder="Who are the top spenders this month?"
      examples={[
        "Who are the top 3 spenders?",
        "Which clients ordered food but never booked?",
        "Show VIP clients and their preferences",
        "Who hasn't visited in the last 30 days?",
        "Compare Gold vs Platinum tier spending",
      ]}
      onSearch={handleSearch}
    />
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
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");

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

      const oiMap = new Map<string, any[]>();
      (orderItemsRes.data ?? []).forEach(item => {
        const list = oiMap.get(item.order_id) || [];
        list.push(item); oiMap.set(item.order_id, list);
      });

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
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            Client Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 ml-10">{clients.length} clients · {filtered.length} shown</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition active:scale-95">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
          { label: "Bookings", value: stats.totalBookings.toString(), icon: CalendarCheck, color: "text-emerald-400", bg: "bg-emerald-500/5" },
          { label: "Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-500/5" },
          { label: "Verified", value: stats.verified.toString(), icon: Shield, color: "text-blue-400", bg: "bg-blue-500/5" },
          { label: "Avg Score", value: `${stats.avgEngagement}`, icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/5" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-border ${s.bg} p-2.5 text-center`}>
            <s.icon size={12} className={`${s.color} mx-auto mb-1`} />
            <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Search */}
      <ClientAISearch clients={filtered} listingMap={listingMap} />

      {/* Segment chips */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setSegmentFilter(null)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${!segmentFilter ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          All ({clients.length})
        </button>
        {Object.entries(segmentConfig).map(([key, cfg]) => (
          segmentCounts[key] ? (
            <button key={key} onClick={() => setSegmentFilter(segmentFilter === key ? null : key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${segmentFilter === key ? `${cfg.bg} ${cfg.color}` : "bg-secondary text-muted-foreground"}`}>
              {cfg.label} ({segmentCounts[key]})
            </button>
          ) : null
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, location, bio..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 rounded-xl" />
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
              {Object.entries(tierGradients).map(([t, cfg]) => (
                <button key={t} onClick={() => setTierFilter(tierFilter === t ? null : t)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${tierFilter === t ? `${cfg.badge} ${cfg.text}` : "bg-card text-muted-foreground"}`}>
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
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${sortBy === k ? "bg-primary/15 text-primary" : "bg-card text-muted-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Client cards */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2"><div className="h-3 w-24 bg-muted rounded" /><div className="h-2 w-16 bg-muted rounded" /></div>
          </div>
        ))}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No clients match your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => {
            const seg = segmentConfig[c.segment] || segmentConfig.regular;
            const tier = tierGradients[c.tier] || tierGradients.Silver;
            const lifetimeValue = c.totalSpend + c.orderSpend;
            const mockEmail = `${(c.display_name || "user").toLowerCase().replace(/\s+/g, ".")}@gmail.com`;

            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedClient(c)}
                className="w-full rounded-2xl border border-border bg-card p-3.5 text-left hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 active:scale-[0.97] group"
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar client={c} size={48} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground truncate">{c.display_name || "Unnamed"}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${tier.badge} ${tier.text}`}>
                        {tier.icon}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${seg.bg} ${seg.color}`}>
                        {seg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {c.location && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin size={8} /> {c.location}
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Mail size={8} /> {mockEmail.length > 18 ? mockEmail.slice(0, 18) + "…" : mockEmail}
                      </span>
                    </div>
                    {/* Mini engagement bar */}
                    <div className="mt-1.5 max-w-[140px]">
                      <EngagementBar score={c.engagementScore} />
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-bold text-foreground tabular-nums">₹{lifetimeValue.toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-1 justify-end text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><CalendarCheck size={8} />{c.bookings.length}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><ShoppingCart size={8} />{c.orders.length}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Star size={8} />{c.reviews.length}</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground">{timeAgo(c.created_at)}</p>
                  </div>

                  <ChevronRight size={14} className="text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
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
