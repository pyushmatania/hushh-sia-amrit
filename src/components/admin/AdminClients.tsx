import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Download, SlidersHorizontal, IndianRupee, CalendarCheck,
  Shield, CheckCircle2, Clock, X, MapPin, Star, Heart, ShoppingCart,
  Share2, Zap, Award, ChevronRight, ArrowLeft, FileText, User,
  ChefHat, Receipt, Phone, Mail, CreditCard, Home, Globe, Hash,
  Sparkles, TrendingUp, Eye, Bot, Send, Loader2, UtensilsCrossed, Gift,
  StickyNote, Pin, PinOff, Trash2, MoreVertical, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NeuralSearchWidget from "./NeuralSearchWidget";
import { getListingThumbnail } from "@/lib/listing-thumbnails";
import { useAuth } from "@/hooks/use-auth";

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

interface ListingInfo {
  id: string; name: string; image_urls: string[]; location: string; category: string;
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

/* ─── Property Thumbnail Helper ─── */
function PropertyThumb({ name, imageUrls, size = 40 }: { name: string; imageUrls?: string[]; size?: number }) {
  const thumb = getListingThumbnail(name, imageUrls, { preferMapped: true });
  return thumb ? (
    <img src={thumb} alt={name} className="rounded-lg object-cover shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <Home size={size * 0.4} className="text-primary/60" />
    </div>
  );
}

/* ─── Netflix-style Profile DP ─── */
const profileGradients = [
  "from-red-500 to-orange-400",
  "from-violet-600 to-fuchsia-400",
  "from-emerald-500 to-teal-400",
  "from-blue-600 to-cyan-400",
  "from-pink-500 to-rose-400",
  "from-amber-500 to-yellow-400",
  "from-indigo-600 to-blue-400",
  "from-teal-500 to-emerald-400",
  "from-fuchsia-600 to-pink-400",
  "from-orange-500 to-red-400",
  "from-cyan-500 to-blue-400",
  "from-rose-500 to-pink-400",
];

const profileEmojis = ["😎", "🦊", "🐱", "🦄", "🐼", "🦋", "🌸", "🎭", "🦅", "🐯", "🌟", "🍀"];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function ProfileAvatar({ client, size = 48 }: { client: ClientProfile; size?: number }) {
  const tier = tierGradients[client.tier] || tierGradients.Silver;
  const imgSize = size - 6;
  const initials = (client.display_name || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const hash = hashString(client.user_id);
  const gradient = profileGradients[hash % profileGradients.length];
  const emoji = profileEmojis[hash % profileEmojis.length];
  const isLarge = size >= 64;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Tier glow ring */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tier.ring} p-[2.5px]`} style={{ borderRadius: size * 0.3 }}>
        <div className="w-full h-full bg-card" style={{ borderRadius: size * 0.28 }} />
      </div>
      {/* Profile DP */}
      <div className="absolute inset-0 flex items-center justify-center">
        {client.avatar_url ? (
          <img
            src={client.avatar_url}
            alt={client.display_name || ""}
            className="object-cover"
            style={{ width: imgSize, height: imgSize, borderRadius: size * 0.26 }}
          />
        ) : (
          <div
            className={`bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}
            style={{ width: imgSize, height: imgSize, borderRadius: size * 0.26 }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-full bg-white/20 -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-full bg-black/10 translate-y-1/4 -translate-x-1/4" />
            </div>
            {/* Emoji + initials */}
            <span style={{ fontSize: size * (isLarge ? 0.32 : 0.28) }} className="relative z-10 drop-shadow-sm">
              {emoji}
            </span>
            {isLarge && (
              <span className="text-white/90 font-bold relative z-10 drop-shadow-sm -mt-0.5" style={{ fontSize: size * 0.14 }}>
                {initials}
              </span>
            )}
          </div>
        )}
      </div>
      {/* Verified badge */}
      {client.verifications.some(v => v.status === "approved") && (
        <div className="absolute -bottom-0.5 -right-0.5 rounded-lg bg-card flex items-center justify-center" style={{ width: size * 0.28, height: size * 0.28 }}>
          <CheckCircle2 size={size * 0.22} className="text-emerald-400" />
        </div>
      )}
    </div>
  );
}

function EngagementBar({ score }: { score: number }) {
  const color = score >= 70 ? "from-emerald-500 to-emerald-400" : score >= 40 ? "from-amber-500 to-amber-400" : "from-red-500 to-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`} />
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

/* ─── Notes types ─── */
interface ClientNote {
  id: string;
  client_user_id: string;
  author_id: string | null;
  author_name: string;
  content: string;
  note_type: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

const noteTypeConfig: Record<string, { label: string; emoji: string; color: string }> = {
  general: { label: "General", emoji: "📝", color: "bg-secondary text-foreground" },
  important: { label: "Important", emoji: "⚠️", color: "bg-amber-500/10 text-amber-400" },
  followup: { label: "Follow-up", emoji: "📞", color: "bg-blue-500/10 text-blue-400" },
  positive: { label: "Positive", emoji: "👍", color: "bg-emerald-500/10 text-emerald-400" },
  concern: { label: "Concern", emoji: "🚩", color: "bg-destructive/10 text-destructive" },
};

/* ─── Notes Panel ─── */
function ClientNotesPanel({ clientUserId }: { clientUserId: string }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    const { data } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_user_id", clientUserId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setNotes((data as ClientNote[]) || []);
    setLoading(false);
  }, [clientUserId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`client-notes-${clientUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "client_notes", filter: `client_user_id=eq.${clientUserId}` }, () => fetchNotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clientUserId, fetchNotes]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const authorName = user?.email?.split("@")[0] || "Admin";
    await supabase.from("client_notes").insert({
      client_user_id: clientUserId,
      author_id: user?.id || null,
      author_name: authorName,
      content: newNote.trim(),
      note_type: noteType,
    } as any);
    setNewNote("");
    setNoteType("general");
    setSaving(false);
  };

  const togglePin = async (note: ClientNote) => {
    await supabase.from("client_notes").update({ pinned: !note.pinned } as any).eq("id", note.id);
  };

  const deleteNote = async (id: string) => {
    await supabase.from("client_notes").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote size={12} className="text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Add Note</span>
          </div>
          <Textarea
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Write an internal note about this client..."
            className="min-h-[72px] text-xs bg-secondary/40 border-border/50 resize-none rounded-xl"
          />
        </div>
        <div className="flex items-center justify-between p-2.5 bg-secondary/20">
          <div className="flex gap-1 flex-wrap">
            {Object.entries(noteTypeConfig).map(([key, cfg]) => (
              <button key={key} onClick={() => setNoteType(key)}
                className={`text-[9px] font-medium px-2 py-0.5 rounded-full transition ${noteType === key ? cfg.color + " ring-1 ring-current/20" : "bg-secondary text-muted-foreground"}`}>
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>
          <button onClick={addNote} disabled={!newNote.trim() || saving}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-50 transition active:scale-95">
            {saving ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
            Save
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="space-y-2">{[1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />
        ))}</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={32} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No notes yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Add internal notes to track interactions & preferences</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note, i) => {
            const cfg = noteTypeConfig[note.note_type] || noteTypeConfig.general;
            return (
              <motion.div key={note.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`rounded-xl border bg-card overflow-hidden ${note.pinned ? "border-primary/30 shadow-sm shadow-primary/5" : "border-border"}`}
              >
                {note.pinned && (
                  <div className="px-3 py-1 bg-primary/5 border-b border-primary/10 flex items-center gap-1">
                    <Pin size={8} className="text-primary" />
                    <span className="text-[8px] font-bold text-primary uppercase tracking-wider">Pinned</span>
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => togglePin(note)} className="w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center transition" title={note.pinned ? "Unpin" : "Pin"}>
                        {note.pinned ? <PinOff size={10} className="text-primary" /> : <Pin size={10} className="text-muted-foreground" />}
                      </button>
                      <button onClick={() => deleteNote(note.id)} className="w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center transition" title="Delete">
                        <Trash2 size={10} className="text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                    <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.emoji} {cfg.label}</span>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <User size={8} /> {note.author_name}
                    </span>
                    <span className="text-[9px] text-muted-foreground ml-auto">{formatDate(note.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Client Detail Drawer ─── */
function ClientDetailDrawer({ client, onClose, listingMap, listingInfoMap }: {
  client: ClientProfile; onClose: () => void; listingMap: Map<string, string>; listingInfoMap: Map<string, ListingInfo>;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "orders" | "notes" | "timeline">("overview");
  const tier = tierGradients[client.tier] || tierGradients.Silver;
  const seg = segmentConfig[client.segment] || segmentConfig.regular;
  const lifetimeValue = client.totalSpend + client.orderSpend;
  const idDoc = client.verifications[0];

  // Most visited property
  const propVisits = new Map<string, number>();
  client.bookings.forEach(b => propVisits.set(b.property_id, (propVisits.get(b.property_id) || 0) + 1));
  const topPropertyId = [...propVisits.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const topProperty = topPropertyId ? listingInfoMap.get(topPropertyId) : null;

  // Favorite food items
  const foodCount = new Map<string, { name: string; emoji: string; count: number }>();
  client.orders.forEach(o => o.items.forEach(i => {
    const key = i.item_name;
    const prev = foodCount.get(key) || { name: i.item_name, emoji: i.item_emoji, count: 0 };
    foodCount.set(key, { ...prev, count: prev.count + i.quantity });
  }));
  const topFoods = [...foodCount.values()].sort((a, b) => b.count - a.count).slice(0, 4);

  // Avg rating given
  const avgRating = client.reviews.length ? (client.reviews.reduce((s, r) => s + r.rating, 0) / client.reviews.length).toFixed(1) : null;

  const timeline = useMemo(() => {
    const events: { date: string; type: string; title: string; subtitle: string; icon: typeof Clock; color: string; propertyId?: string }[] = [];
    client.bookings.forEach(b => events.push({
      date: b.created_at, type: "booking",
      title: `Booked ${listingMap.get(b.property_id) || "Property"}`,
      subtitle: `${b.date} · ${b.slot} · ${b.guests} guests · ₹${Number(b.total).toLocaleString("en-IN")}`,
      icon: CalendarCheck, color: "text-primary", propertyId: b.property_id,
    }));
    client.orders.forEach(o => events.push({
      date: o.created_at, type: "order",
      title: `Ordered ${o.items.map(i => `${i.item_emoji}${i.item_name}`).join(", ") || "items"}`,
      subtitle: `₹${Number(o.total).toLocaleString("en-IN")} · ${o.status}`,
      icon: ShoppingCart, color: "text-amber-400", propertyId: o.property_id,
    }));
    client.reviews.forEach(r => events.push({
      date: r.created_at, type: "review",
      title: `Reviewed ${listingMap.get(r.property_id) || "Property"}`,
      subtitle: `${"⭐".repeat(r.rating)} · "${r.content.slice(0, 50)}${r.content.length > 50 ? "…" : ""}"`,
      icon: Star, color: "text-yellow-400", propertyId: r.property_id,
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
      subtitle: "Joined Hushh",
      icon: User, color: "text-muted-foreground",
    });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [client, listingMap, idDoc]);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Eye },
    { id: "bookings" as const, label: `Stays (${client.bookings.length})`, icon: Home },
    { id: "orders" as const, label: `Orders (${client.orders.length})`, icon: ShoppingCart },
    { id: "notes" as const, label: "Notes", icon: StickyNote },
    { id: "timeline" as const, label: "Timeline", icon: Clock },
  ];

  const mockPhone = `+91 ${client.user_id.slice(0, 5).replace(/[^0-9]/g, "9")}${Math.floor(1000000 + Math.random() * 9000000)}`.slice(0, 14);
  const mockEmail = `${(client.display_name || "user").toLowerCase().replace(/\s+/g, ".")}@gmail.com`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full max-w-md h-full bg-card border-l border-border overflow-y-auto"
        onClick={e => e.stopPropagation()}
        ref={el => { if (el) el.scrollTop = 0; }}
      >
        {/* ── Hero header ── */}
        <div className="relative">
          {/* Background: show top property image if available */}
          {topProperty ? (
            <div className="h-44 relative overflow-hidden">
              <img
                src={getListingThumbnail(topProperty.name, topProperty.image_urls, { preferMapped: true }) || ""}
                alt="" className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-card" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,hsl(var(--primary)/0.1),transparent_60%)]" />
            </div>
          ) : (
            <>
              <div className={`h-44 bg-gradient-to-br ${tier.ring} opacity-20`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.15),transparent_60%)]" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
            </>
          )}

          <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition active:scale-95">
            <ArrowLeft size={16} className="text-foreground" />
          </button>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${seg.bg} ${seg.color} backdrop-blur-sm`}>
              {seg.label}
            </span>
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${tier.badge} ${tier.text} backdrop-blur-sm`}>
              {tier.icon} {client.tier}
            </span>
          </div>

          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <ProfileAvatar client={client} size={88} />
          </div>
        </div>

        {/* ── Name & meta ── */}
        <div className="pt-16 px-4 pb-4 text-center">
          <h2 className="text-xl font-bold text-foreground">{client.display_name || "Unnamed"}</h2>
          {client.bio && <p className="text-[11px] text-muted-foreground italic mt-1 line-clamp-2 max-w-[280px] mx-auto">{client.bio}</p>}
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarCheck size={9} /> Joined {formatDate(client.created_at)}</span>
            {client.location && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin size={9} /> {client.location}</span>}
            {client.verifications.some(v => v.status === "approved") && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 size={9} /> Verified</span>
            )}
          </div>

          {/* Contact row */}
          <div className="flex gap-2 mt-3 justify-center">
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Phone size={10} className="text-muted-foreground" />
              <span className="text-[10px] text-foreground">{mockPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-3 py-1.5">
              <Mail size={10} className="text-muted-foreground" />
              <span className="text-[10px] text-foreground truncate max-w-[140px]">{mockEmail}</span>
            </div>
          </div>
        </div>

        {/* ── Lifetime stats (3D cards) ── */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Total Revenue", value: `₹${lifetimeValue.toLocaleString("en-IN")}`, sub: `₹${client.totalSpend.toLocaleString("en-IN")} stays · ₹${client.orderSpend.toLocaleString("en-IN")} food`, icon: IndianRupee, gradient: "from-emerald-500/15 to-emerald-500/5" },
              { label: "Engagement", value: `${client.engagementScore}/100`, sub: avgRating ? `Avg rating: ${avgRating}★` : "No reviews yet", icon: Zap, gradient: "from-purple-500/15 to-purple-500/5" },
              { label: "Activity", value: `${client.bookings.length} stays · ${client.orders.length} orders`, sub: `${client.reviews.length} reviews · ${client.referralCount} referrals`, icon: TrendingUp, gradient: "from-blue-500/15 to-blue-500/5" },
              { label: "Loyalty", value: `${client.loyalty_points.toLocaleString()} pts`, sub: `${client.wishlistCount} wishlist · ${client.referralCount} referrals`, icon: Award, gradient: "from-amber-500/15 to-amber-500/5" },
            ].map(s => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl bg-gradient-to-br ${s.gradient} border border-border/60 p-3 group`}
                style={{ perspective: "600px" }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-card/80 flex items-center justify-center">
                    <s.icon size={14} className="text-foreground" />
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{s.sub}</p>
              </motion.div>
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

        {/* ── Favourite Property & Foods ── */}
        <div className="px-4 pb-3 space-y-2">
          {topProperty && (
            <div className="rounded-xl bg-secondary/40 border border-border/50 p-3 flex items-center gap-3">
              <PropertyThumb name={topProperty.name} imageUrls={topProperty.image_urls} size={48} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Favourite Venue</p>
                <p className="text-xs font-semibold text-foreground truncate">{topProperty.name}</p>
                <p className="text-[9px] text-muted-foreground">{propVisits.get(topPropertyId!) || 0} visits · {topProperty.location}</p>
              </div>
            </div>
          )}

          {topFoods.length > 0 && (
            <div className="rounded-xl bg-secondary/40 border border-border/50 p-3">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><UtensilsCrossed size={9} /> Top Orders</p>
              <div className="flex flex-wrap gap-1.5">
                {topFoods.map(f => (
                  <span key={f.name} className="text-[10px] px-2 py-1 rounded-lg bg-card border border-border/50">
                    {f.emoji} {f.name} <span className="text-muted-foreground">×{f.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── ID verification ── */}
        <div className="px-4 pb-3">
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

        {/* ── Tabs ── */}
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

        {/* ── Tab content ── */}
        <div className="p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Engagement breakdown */}
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

              {/* Properties visited */}
              {propVisits.size > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Properties Visited ({propVisits.size})</h4>
                  <div className="space-y-1.5">
                    {[...propVisits.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([pid, count]) => {
                        const info = listingInfoMap.get(pid);
                        const name = info?.name || listingMap.get(pid) || pid;
                        return (
                          <div key={pid} className="flex items-center gap-2.5 rounded-xl bg-secondary/30 border border-border/40 p-2.5">
                            <PropertyThumb name={name} imageUrls={info?.image_urls} size={36} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-foreground truncate">{name}</p>
                              <p className="text-[9px] text-muted-foreground">{info?.location || ""} · {info?.category || ""}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-foreground">{count}</p>
                              <p className="text-[8px] text-muted-foreground">visits</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Recent activity */}
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</h4>
                <div className="space-y-1.5">
                  {timeline.slice(0, 5).map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/30 p-2.5">
                      <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <ev.icon size={12} className={ev.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-foreground truncate">{ev.title}</p>
                        <p className="text-[9px] text-muted-foreground">{ev.subtitle}</p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">{formatDate(ev.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-2.5">
              {client.bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Home size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No stays yet</p>
                </div>
              ) : client.bookings
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((b, i) => {
                  const info = listingInfoMap.get(b.property_id);
                  const pName = info?.name || listingMap.get(b.property_id) || `Property ${b.property_id}`;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden"
                      style={{ perspective: "800px" }}
                    >
                      {/* Property thumbnail header */}
                      <div className="flex items-center gap-3 p-3 bg-secondary/30">
                        <PropertyThumb name={pName} imageUrls={info?.image_urls} size={44} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{pName}</p>
                          <p className="text-[9px] text-muted-foreground">{info?.location || ""}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${bookingStatusColors[b.status] || "bg-secondary text-muted-foreground"}`}>
                          {b.status}
                        </span>
                      </div>
                      {/* Details */}
                      <div className="p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarCheck size={9} /> {b.date}</span>
                          <span className="flex items-center gap-1"><Clock size={9} /> {b.slot}</span>
                          <span className="flex items-center gap-1"><Users size={9} /> {b.guests} guests</span>
                          <span className="flex items-center gap-1 font-semibold text-foreground"><IndianRupee size={9} /> ₹{Number(b.total).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-[9px] font-mono text-muted-foreground">{b.booking_id}</span>
                          <span className="text-[9px] text-muted-foreground">Booked {timeAgo(b.created_at)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-2.5">
              {client.orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart size={32} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
              ) : client.orders
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((o, i) => {
                  const info = listingInfoMap.get(o.property_id);
                  const pName = info?.name || listingMap.get(o.property_id) || "Property";
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden"
                    >
                      {/* Property header */}
                      <div className="flex items-center gap-3 p-3 bg-secondary/30">
                        <PropertyThumb name={pName} imageUrls={info?.image_urls} size={40} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{pName}</p>
                          <p className="text-[9px] text-muted-foreground">{info?.location || ""}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          o.status === "delivered" ? "bg-emerald-500/15 text-emerald-400" :
                          o.status === "preparing" ? "bg-blue-500/15 text-blue-400" :
                          o.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                          "bg-muted text-muted-foreground"
                        }`}>{o.status}</span>
                      </div>
                      <div className="p-3 space-y-2">
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
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground tabular-nums">₹{Number(o.total).toLocaleString("en-IN")}</span>
                            {o.assigned_name && (
                              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <ChefHat size={8} /> {o.assigned_name}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-muted-foreground">{timeAgo(o.created_at)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {activeTab === "notes" && (
            <ClientNotesPanel clientUserId={client.user_id} />
          )}

          {activeTab === "timeline" && (
            <div className="relative">
              <div className="absolute left-[13px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-3">
                {timeline.map((ev, i) => {
                  const info = ev.propertyId ? listingInfoMap.get(ev.propertyId) : null;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 relative">
                      <div className="w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0 z-10">
                        <ev.icon size={11} className={ev.color} />
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2">
                          {info && <PropertyThumb name={info.name} imageUrls={info.image_urls} size={24} />}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">{ev.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{ev.subtitle}</p>
                          </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{formatDate(ev.date)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── AI Search ─── */
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
export default function AdminClients({ initialUserId, onContextConsumed, onBack }: { initialUserId?: string; onContextConsumed?: () => void; onBack?: () => void } = {}) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"spend" | "bookings" | "recent" | "engagement">("engagement");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [listingMap, setListingMap] = useState<Map<string, string>>(new Map());
  const [listingInfoMap, setListingInfoMap] = useState<Map<string, ListingInfo>>(new Map());

  useEffect(() => {
    if (initialUserId && !loading && clients.length > 0) {
      const target = clients.find(c => c.user_id === initialUserId);
      if (target) setSelectedClient(target);
      onContextConsumed?.();
    }
  }, [initialUserId, loading, clients, onContextConsumed]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

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
        supabase.from("host_listings").select("id, name, image_urls, location, category"),
      ]);

      const lMap = new Map<string, string>();
      const lInfoMap = new Map<string, ListingInfo>();
      (listingsRes.data ?? []).forEach((l: any) => {
        lMap.set(l.id, l.name);
        lInfoMap.set(l.id, { id: l.id, name: l.name, image_urls: l.image_urls || [], location: l.location || "", category: l.category || "" });
      });
      setListingMap(lMap);
      setListingInfoMap(lInfoMap);

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
      c.loyalty_points, c.location || "-", c.verifications[0]?.status || "none",
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
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary/10 transition active:scale-95">
              <ArrowLeft size={16} className="text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={16} className="text-primary" />
              </div>
              Client Directory
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 ml-10">{clients.length} clients · {filtered.length} shown</p>
          </div>
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

      {/* Client cards - 3D enhanced */}
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
        <div className="space-y-2.5">
          {filtered.map((c, i) => {
            const seg = segmentConfig[c.segment] || segmentConfig.regular;
            const tier = tierGradients[c.tier] || tierGradients.Silver;
            const lifetimeValue = c.totalSpend + c.orderSpend;
            const joinedLabel = timeAgo(c.created_at);
            const isVerified = c.verifications.some(v => v.status === "approved");

            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedClient(c)}
                className="w-full rounded-2xl border border-border bg-card text-left hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 active:scale-[0.97] group"
              >
                <div className="p-4">
                  {/* Top row: avatar + name + tier/segment badges */}
                  <div className="flex items-start gap-3">
                    <ProfileAvatar client={c} size={56} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-foreground truncate">{c.display_name || "Unnamed"}</p>
                        {isVerified && <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {c.location && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin size={9} /> {c.location}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">Joined {joinedLabel}</span>
                      </div>
                      {c.bio && (
                        <p className="text-[10px] text-muted-foreground/70 italic mt-1 line-clamp-1">{c.bio}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${tier.badge} ${tier.text}`}>
                        {tier.icon} {c.tier}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${seg.bg} ${seg.color}`}>
                        {seg.label}
                      </span>
                    </div>
                  </div>

                  {/* Engagement bar */}
                  <div className="mt-3">
                    <EngagementBar score={c.engagementScore} />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/50">
                    {[
                      { label: "Revenue", value: `₹${lifetimeValue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-400" },
                      { label: "Bookings", value: c.bookings.length, icon: CalendarCheck, color: "text-primary" },
                      { label: "Orders", value: c.orders.length, icon: ShoppingCart, color: "text-amber-400" },
                      { label: "Points", value: c.loyalty_points, icon: Award, color: "text-purple-400" },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <s.icon size={12} className={`${s.color} mx-auto mb-0.5`} />
                        <p className="text-xs font-bold text-foreground tabular-nums">{s.value}</p>
                        <p className="text-[8px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chevron strip */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border/40 bg-secondary/20">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                    <Star size={9} className="text-yellow-400" /> {c.reviews.length} reviews
                    <span className="mx-1">·</span>
                    <Heart size={9} className="text-rose-400" /> {c.wishlistCount} saved
                    <span className="mx-1">·</span>
                    <Share2 size={9} className="text-blue-400" /> {c.referralCount} referrals
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition" />
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
            listingInfoMap={listingInfoMap}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
