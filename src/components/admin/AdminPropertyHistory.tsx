import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Search, CalendarCheck, Users, Clock, ShoppingCart,
  ChevronRight, ArrowLeft, MapPin, Star, IndianRupee, Home,
  ChefHat, TrendingUp, BarChart3, Filter, Sparkles, Eye,
  Flame, Coffee, Utensils, ChevronLeft, Send, Bot, Loader2,
  ArrowRight, X, Hash, UserCheck, Package, Activity, Calendar,
  BadgePercent, Repeat, PieChart, Zap, Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import NeuralSearchWidget from "./NeuralSearchWidget";
import { getListingThumbnail } from "@/lib/listing-thumbnails";

/* ─── Types ─── */
interface PropertyBooking {
  booking_id: string; user_id: string; date: string; slot: string;
  guests: number; total: number; status: string; created_at: string;
  userName?: string; userAvatar?: string;
}

interface PropertyOrder {
  id: string; user_id: string; total: number; status: string;
  created_at: string; assigned_name: string | null; booking_id: string | null;
  items: { item_name: string; item_emoji: string; quantity: number; unit_price: number }[];
  userName?: string;
}

interface PropertySummary {
  id: string; name: string; category: string; location: string;
  imageUrls: string[];
  bookings: PropertyBooking[]; orders: PropertyOrder[];
  totalRevenue: number; totalGuests: number; uniqueGuests: number;
  avgRating: number; reviewCount: number;
  topItems: { name: string; emoji: string; count: number }[];
  basePrice: number; capacity: number; status: string;
  amenities: string[]; tags: string[];
}

interface CalendarDay {
  date: string; dayNum: number; bookings: PropertyBooking[];
  isToday: boolean; isCurrentMonth: boolean;
}

interface UserMini {
  user_id: string; display_name: string | null; avatar_url: string | null;
  tier: string;
}

/* ─── Helpers ─── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const statusColors: Record<string, string> = {
  upcoming: "bg-primary/15 text-primary",
  active: "bg-emerald-500/15 text-emerald-400",
  completed: "bg-muted text-muted-foreground",
  confirmed: "bg-blue-500/15 text-blue-400",
  cancelled: "bg-destructive/15 text-destructive",
  pending: "bg-amber-500/15 text-amber-400",
};

function PropertyThumbnail({ name, imageUrls, size = "md", className = "" }: { name: string; imageUrls?: string[]; size?: "sm" | "md" | "lg" | "hero"; className?: string }) {
  const thumb = getListingThumbnail(name, imageUrls, { preferMapped: true });
  const sizeClasses = {
    sm: "w-10 h-10 rounded-xl",
    md: "w-14 h-14 rounded-2xl",
    lg: "w-20 h-20 rounded-2xl",
    hero: "w-full h-40 rounded-none",
  };
  if (!thumb) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 ${className}`}>
        <Building2 size={size === "hero" ? 40 : size === "lg" ? 24 : 16} className="text-primary/40" />
      </div>
    );
  }
  return (
    <img src={thumb} alt={name} className={`${sizeClasses[size]} object-cover shrink-0 ${className}`} loading="lazy" />
  );
}

/* ─── Calendar Component ─── */
function BookingCalendar({ bookings, onDayClick }: { bookings: PropertyBooking[]; onDayClick: (date: string, bookings: PropertyBooking[]) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const result: CalendarDay[] = [];
    const today = new Date().toISOString().split("T")[0];

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      result.push({ date: d.toISOString().split("T")[0], dayNum: d.getDate(), bookings: [], isToday: false, isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayBookings = bookings.filter(b => b.date === dateStr);
      result.push({ date: dateStr, dayNum: d, bookings: dayBookings, isToday: dateStr === today, isCurrentMonth: true });
    }
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      result.push({ date: d.toISOString().split("T")[0], dayNum: d.getDate(), bookings: [], isToday: false, isCurrentMonth: false });
    }
    return result;
  }, [currentMonth, bookings]);

  const monthLabel = currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition active:scale-95">
          <ChevronLeft size={14} className="text-foreground" />
        </button>
        <h3 className="text-sm font-bold text-foreground">{monthLabel}</h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition active:scale-95">
          <ChevronRight size={14} className="text-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <div key={d} className="text-center text-[9px] font-bold text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const hasBookings = day.bookings.length > 0;
          return (
            <button
              key={i}
              onClick={() => hasBookings && onDayClick(day.date, day.bookings)}
              className={`relative h-10 rounded-lg text-[11px] font-medium transition flex flex-col items-center justify-center gap-0.5 ${
                !day.isCurrentMonth ? "text-muted-foreground/30" :
                day.isToday ? "bg-primary/15 text-primary font-bold" :
                hasBookings ? "bg-secondary hover:bg-primary/10 text-foreground cursor-pointer" :
                "text-muted-foreground"
              }`}
            >
              <span>{day.dayNum}</span>
              {hasBookings && (
                <div className="flex gap-0.5">
                  {day.bookings.slice(0, 3).map((_, j) => (
                    <div key={j} className="w-1 h-1 rounded-full bg-primary" />
                  ))}
                  {day.bookings.length > 3 && <div className="w-1 h-1 rounded-full bg-amber-400" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── AI Search Bar ─── */
function AISearchBar({ onResult, properties }: { onResult: (answer: string) => void; properties: PropertySummary[] }) {
  const handleSearch = async (query: string): Promise<string> => {
    const context = properties.map(p => ({
      name: p.name, id: p.id, category: p.category,
      bookings: p.bookings.map(b => ({
        date: b.date, slot: b.slot, guests: b.guests, total: b.total,
        status: b.status, guest: b.userName,
      })),
      orders: p.orders.map(o => ({
        date: o.created_at.split("T")[0], total: o.total, status: o.status,
        items: o.items.map(i => `${i.item_emoji}${i.item_name} x${i.quantity}`).join(", "),
        guest: o.userName, chef: o.assigned_name,
      })),
      totalRevenue: p.totalRevenue, avgRating: p.avgRating,
      topItems: p.topItems.slice(0, 5),
    }));

    const resp = await supabase.functions.invoke("property-history-ai", {
      body: { query, context: JSON.stringify(context) },
    });
    if (resp.error) throw resp.error;
    const text = resp.data?.answer || "No answer found.";
    onResult(text);
    return text;
  };

  return (
    <NeuralSearchWidget
      title="Property Intelligence"
      subtitle="Search across all property history & analytics"
      placeholder="Who stayed in the villa last weekend?"
      contextKey="properties"
      examples={[
        "Who stayed in the villa last weekend?",
        "How many times was Maggi ordered this month?",
        "Which property had most guests last week?",
        "Top 5 food items ordered in January",
        "Show bonfire add-on trends",
      ]}
      onSearch={handleSearch}
    />
  );
}

/* ─── Property Detail Drawer ─── */
function PropertyDetailDrawer({ property, users, onClose, onUserClick }: {
  property: PropertySummary; users: Map<string, UserMini>; onClose: () => void; onUserClick: (userId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"calendar" | "guests" | "orders" | "timeline" | "analytics">("calendar");
  const [selectedDay, setSelectedDay] = useState<{ date: string; bookings: PropertyBooking[] } | null>(null);

  const uniqueGuestList = useMemo(() => {
    const map = new Map<string, { user: UserMini; bookings: PropertyBooking[]; orders: PropertyOrder[]; totalSpend: number }>();
    property.bookings.forEach(b => {
      const existing = map.get(b.user_id) || { user: users.get(b.user_id) || { user_id: b.user_id, display_name: b.userName || null, avatar_url: null, tier: "Silver" }, bookings: [], orders: [], totalSpend: 0 };
      existing.bookings.push(b);
      existing.totalSpend += Number(b.total);
      map.set(b.user_id, existing);
    });
    property.orders.forEach(o => {
      const existing = map.get(o.user_id);
      if (existing) { existing.orders.push(o); existing.totalSpend += Number(o.total); }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
  }, [property, users]);

  const foodAnalytics = useMemo(() => {
    const itemMap = new Map<string, { name: string; emoji: string; count: number; revenue: number }>();
    property.orders.forEach(o => o.items.forEach(item => {
      const key = item.item_name;
      const existing = itemMap.get(key) || { name: item.item_name, emoji: item.item_emoji, count: 0, revenue: 0 };
      existing.count += item.quantity;
      existing.revenue += item.quantity * item.unit_price;
      itemMap.set(key, existing);
    }));
    return Array.from(itemMap.values()).sort((a, b) => b.count - a.count);
  }, [property.orders]);

  const slotDistribution = useMemo(() => {
    const map = new Map<string, number>();
    property.bookings.forEach(b => map.set(b.slot, (map.get(b.slot) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [property.bookings]);

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    property.bookings.forEach(b => {
      const month = b.date.slice(0, 7);
      map.set(month, (map.get(month) || 0) + Number(b.total));
    });
    property.orders.forEach(o => {
      const month = o.created_at.slice(0, 7);
      map.set(month, (map.get(month) || 0) + Number(o.total));
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  }, [property]);

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m[1]), 1);

  const timelineEvents = useMemo(() => {
    const events: { type: string; icon: string; label: string; detail: string; date: string; userId?: string }[] = [];
    property.bookings.forEach(b => {
      const u = users.get(b.user_id)?.display_name || b.userName || "Guest";
      events.push({ type: "booking", icon: "🎫", label: `${u} booked ${b.slot}`, detail: `${b.guests} guests · ₹${Number(b.total).toLocaleString("en-IN")} · ${b.status}`, date: b.created_at, userId: b.user_id });
    });
    property.orders.forEach(o => {
      const u = users.get(o.user_id)?.display_name || o.userName || "Guest";
      const items = o.items.map(i => `${i.item_emoji}${i.item_name}`).join(", ");
      events.push({ type: "order", icon: "🍽️", label: `${u} ordered food`, detail: `${items} · ₹${Number(o.total).toLocaleString("en-IN")} · Chef: ${o.assigned_name || "—"}`, date: o.created_at, userId: o.user_id });
    });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [property, users]);

  // Last booking date
  const lastBookingDate = property.bookings.length > 0 ? property.bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at : null;
  const bookingRevenue = property.bookings.reduce((s, b) => s + Number(b.total), 0);
  const orderRevenue = property.orders.reduce((s, o) => s + Number(o.total), 0);

  const tabs = [
    { id: "calendar" as const, label: "Calendar", icon: CalendarCheck },
    { id: "guests" as const, label: `Guests`, icon: Users },
    { id: "orders" as const, label: `Food`, icon: Utensils },
    { id: "timeline" as const, label: `Timeline`, icon: Activity },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ];

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
        ref={el => { if (el) el.scrollTop = 0; }}
      >
        {/* ── Hero Header with Real Thumbnail ── */}
        <div className="relative">
          <PropertyThumbnail name={property.name} imageUrls={property.imageUrls} size="hero" className="w-full h-44" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />

          {/* Back button */}
          <button onClick={onClose} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center hover:bg-card transition active:scale-95 z-10">
            <ArrowLeft size={16} className="text-foreground" />
          </button>

          {/* Status badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
              property.status === "published" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}>{property.status || "active"}</span>
          </div>

          {/* Property info overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground drop-shadow-sm">{property.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin size={9} />{property.location}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{property.category}</span>
                </div>
                {property.avgRating > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={10} fill={s <= Math.round(property.avgRating) ? "currentColor" : "none"}
                          className={s <= Math.round(property.avgRating) ? "text-amber-400" : "text-muted-foreground/30"} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{property.avgRating.toFixed(1)}</span>
                    <span className="text-[9px] text-muted-foreground">({property.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="px-4 pt-3 pb-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"><TrendingUp size={13} className="text-primary" /></div>
                <p className="text-[9px] text-muted-foreground font-medium">Total Revenue</p>
              </div>
              <p className="text-base font-bold text-foreground tabular-nums">₹{property.totalRevenue.toLocaleString("en-IN")}</p>
              <div className="flex items-center gap-2 mt-1 text-[8px] text-muted-foreground">
                <span>Bookings: ₹{bookingRevenue.toLocaleString("en-IN")}</span>
                <span>·</span>
                <span>Food: ₹{orderRevenue.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: "Bookings", value: property.bookings.length, icon: CalendarCheck, color: "text-blue-400" },
                { label: "Guests", value: property.uniqueGuests, icon: Users, color: "text-emerald-400" },
                { label: "Orders", value: property.orders.length, icon: Utensils, color: "text-amber-400" },
                { label: "Capacity", value: property.capacity || "—", icon: Home, color: "text-purple-400" },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-secondary/40 border border-border/40 p-2 text-center">
                  <s.icon size={10} className={`${s.color} mx-auto mb-0.5`} />
                  <p className="text-xs font-bold text-foreground tabular-nums">{s.value}</p>
                  <p className="text-[7px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Property details row */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.basePrice > 0 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <IndianRupee size={8} />Base: ₹{property.basePrice.toLocaleString("en-IN")}
              </span>
            )}
            {lastBookingDate && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Clock size={8} />Last: {timeAgo(lastBookingDate)}
              </span>
            )}
            {property.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
            ))}
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {property.amenities.slice(0, 6).map((a, i) => (
                <span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">{a}</span>
              ))}
              {property.amenities.length > 6 && <span className="text-[8px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">+{property.amenities.length - 6}</span>}
            </div>
          )}

          {/* Top ordered items quick view */}
          {property.topItems.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {property.topItems.slice(0, 4).map((item, i) => (
                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/15">
                  {item.emoji} {item.name} ({item.count})
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-y border-border">
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

        <div className="p-4">
          {/* Calendar tab */}
          {activeTab === "calendar" && (
            <div className="space-y-4">
              <BookingCalendar bookings={property.bookings} onDayClick={(date, bks) => setSelectedDay({ date, bookings: bks })} />

              <AnimatePresence>
                {selectedDay && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">{formatDate(selectedDay.date)}</h4>
                      <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
                    </div>
                    {selectedDay.bookings.map((b, i) => {
                      const user = users.get(b.user_id);
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-bold text-foreground shrink-0 overflow-hidden">
                            {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : (user?.display_name || b.userName || "?")[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-foreground truncate">{user?.display_name || b.userName || "Guest"}</p>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full capitalize ${statusColors[b.status] || "bg-secondary text-muted-foreground"}`}>{b.status}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{b.slot} · {b.guests} guests · ₹{Number(b.total).toLocaleString("en-IN")}</p>
                          </div>
                          <button onClick={() => onUserClick(b.user_id)} className="p-1.5 rounded-lg hover:bg-secondary transition">
                            <ArrowRight size={12} className="text-muted-foreground" />
                          </button>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Stays</h4>
                <div className="space-y-1.5">
                  {property.bookings.slice(0, 8).map((b, i) => {
                    const user = users.get(b.user_id);
                    return (
                      <button key={i} onClick={() => onUserClick(b.user_id)}
                        className="w-full flex items-center gap-2.5 rounded-xl bg-secondary/30 p-2.5 text-left hover:bg-secondary/60 transition active:scale-[0.98]">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 overflow-hidden">
                          {user?.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : (user?.display_name || "?")[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[11px] font-medium text-foreground truncate">{user?.display_name || "Guest"}</p>
                            <span className="text-[8px] text-muted-foreground bg-secondary px-1 py-0.5 rounded">{user?.tier || "Silver"}</span>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{b.date} · {b.slot} · {b.guests}g</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-foreground tabular-nums">₹{Number(b.total).toLocaleString("en-IN")}</p>
                          <span className={`text-[7px] font-bold px-1 py-0.5 rounded capitalize ${statusColors[b.status] || "bg-secondary text-muted-foreground"}`}>{b.status}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Guests tab */}
          {activeTab === "guests" && (
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground mb-2">{uniqueGuestList.length} unique guests</p>
              {uniqueGuestList.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No guests yet</p>
                </div>
              ) : uniqueGuestList.map((g, i) => (
                <motion.button key={g.user.user_id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => onUserClick(g.user.user_id)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30 transition active:scale-[0.97] group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-foreground shrink-0 overflow-hidden">
                      {g.user.avatar_url ? <img src={g.user.avatar_url} className="w-full h-full object-cover" alt="" /> : (g.user.display_name || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground truncate">{g.user.display_name || "Guest"}</p>
                        <span className="text-[8px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{g.user.tier}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {g.bookings.length} stays · {g.orders.length} orders · Last: {timeAgo(g.bookings[0]?.created_at || "")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground tabular-nums">₹{g.totalSpend.toLocaleString("en-IN")}</p>
                    </div>
                    <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary transition shrink-0" />
                  </div>
                  {g.orders.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-1">
                      {g.orders.flatMap(o => o.items).slice(0, 5).map((item, j) => (
                        <span key={j} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full">{item.item_emoji} {item.item_name}</span>
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* Food / Orders tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Most Ordered Items</h4>
                <div className="space-y-1.5">
                  {foodAnalytics.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
                  ) : foodAnalytics.map((item, i) => {
                    const pct = (item.count / (foodAnalytics[0]?.count || 1)) * 100;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3">
                        <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-base shrink-0">
                          {item.emoji || "🍽️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                            <span className="text-[10px] font-bold text-foreground tabular-nums">{item.count}×</span>
                          </div>
                          <div className="h-1 rounded-full bg-secondary overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                              className="h-full rounded-full bg-primary/60" />
                          </div>
                          <p className="text-[9px] text-muted-foreground mt-0.5">₹{item.revenue.toLocaleString("en-IN")} revenue</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recent Orders</h4>
                <div className="space-y-1.5">
                  {property.orders.slice(0, 6).map((o, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onUserClick(o.user_id)} className="text-xs font-semibold text-foreground hover:text-primary transition">{o.userName || "Guest"}</button>
                          {o.assigned_name && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><ChefHat size={8} />{o.assigned_name}</span>}
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full capitalize ${
                          o.status === "delivered" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                        }`}>{o.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {o.items.map((item, j) => (
                          <span key={j} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full">{item.item_emoji} {item.item_name} ×{item.quantity}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                        <span>₹{Number(o.total).toLocaleString("en-IN")}</span>
                        <span>{formatDate(o.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline tab */}
          {activeTab === "timeline" && (
            <div className="space-y-1">
              {timelineEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                </div>
              ) : timelineEvents.map((ev, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02, duration: 0.3 }}
                  className="flex gap-3 group"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      ev.type === "booking" ? "bg-primary/10" : "bg-amber-500/10"
                    }`}>
                      {ev.icon}
                    </div>
                    {i < timelineEvents.length - 1 && <div className="w-px flex-1 bg-border min-h-[16px]" />}
                  </div>
                  <button onClick={() => ev.userId && onUserClick(ev.userId)}
                    className="flex-1 rounded-xl bg-secondary/30 p-2.5 mb-1.5 text-left hover:bg-secondary/60 transition active:scale-[0.98]">
                    <p className="text-[11px] font-semibold text-foreground">{ev.label}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{ev.detail}</p>
                    <p className="text-[8px] text-muted-foreground/60 mt-1">{formatDate(ev.date)} · {timeAgo(ev.date)}</p>
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Monthly Revenue</h4>
                <div className="rounded-xl bg-secondary/30 p-3">
                  <div className="flex items-end gap-1 h-24">
                    {monthlyRevenue.map(([month, rev], i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[7px] text-muted-foreground tabular-nums">₹{(rev / 1000).toFixed(0)}k</span>
                        <motion.div initial={{ height: 0 }} animate={{ height: `${(rev / maxRevenue) * 70}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-primary/60 to-primary/30 min-h-[4px]" />
                        <span className="text-[7px] text-muted-foreground">{month.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                  {monthlyRevenue.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data</p>}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Popular Slots</h4>
                <div className="space-y-1.5">
                  {slotDistribution.map(([slot, count], i) => {
                    const pct = (count / (slotDistribution[0]?.[1] || 1)) * 100;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <Clock size={10} className="text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-foreground w-24 truncate">{slot}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-muted-foreground tabular-nums w-5 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Metrics</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Avg Booking Value", value: `₹${property.bookings.length ? Math.round(property.bookings.reduce((s, b) => s + Number(b.total), 0) / property.bookings.length).toLocaleString("en-IN") : 0}`, icon: IndianRupee },
                    { label: "Avg Guests/Booking", value: property.bookings.length ? (property.totalGuests / property.bookings.length).toFixed(1) : "0", icon: Users },
                    { label: "Repeat Guest Rate", value: `${property.uniqueGuests > 0 ? Math.round(((property.bookings.length - property.uniqueGuests) / property.bookings.length) * 100) : 0}%`, icon: Repeat },
                    { label: "Food Attach Rate", value: `${property.bookings.length > 0 ? Math.round((property.orders.length / property.bookings.length) * 100) : 0}%`, icon: Utensils },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl bg-secondary/40 border border-border/50 p-3">
                      <m.icon size={12} className="text-primary mb-1" />
                      <p className="text-sm font-bold text-foreground">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function AdminPropertyHistory({ onNavigateToClient, initialPropertyId, initialBookingId, onContextConsumed, onBack }: {
  onNavigateToClient?: (userId: string) => void;
  initialPropertyId?: string;
  initialBookingId?: string;
  onContextConsumed?: () => void;
  onBack?: () => void;
}) {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null);
  const [usersMap, setUsersMap] = useState<Map<string, UserMini>>(new Map());
  const [sortBy, setSortBy] = useState<"revenue" | "bookings" | "guests" | "recent">("revenue");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const load = async () => {
      const [listingsRes, bookingsRes, ordersRes, orderItemsRes, reviewsRes, profilesRes] = await Promise.all([
        supabase.from("host_listings").select("*"),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
        supabase.from("reviews").select("property_id, rating"),
        supabase.from("profiles").select("user_id, display_name, avatar_url, tier"),
      ]);

      const uMap = new Map<string, UserMini>();
      (profilesRes.data ?? []).forEach(p => uMap.set(p.user_id, p));
      setUsersMap(uMap);

      const oiMap = new Map<string, any[]>();
      (orderItemsRes.data ?? []).forEach(item => {
        const list = oiMap.get(item.order_id) || [];
        list.push(item); oiMap.set(item.order_id, list);
      });

      const reviewMap = new Map<string, { total: number; count: number }>();
      (reviewsRes.data ?? []).forEach(r => {
        const existing = reviewMap.get(r.property_id) || { total: 0, count: 0 };
        existing.total += r.rating; existing.count++;
        reviewMap.set(r.property_id, existing);
      });

      const propMap = new Map<string, PropertySummary>();
      (listingsRes.data ?? []).forEach(l => {
        propMap.set(l.id, {
          id: l.id, name: l.name, category: l.category, location: l.location,
          imageUrls: l.image_urls || [],
          bookings: [], orders: [],
          totalRevenue: 0, totalGuests: 0, uniqueGuests: 0,
          avgRating: 0, reviewCount: 0, topItems: [],
          basePrice: Number(l.base_price) || 0,
          capacity: l.capacity || 0,
          status: l.status || "draft",
          amenities: l.amenities || [],
          tags: l.tags || [],
        });
      });

      (bookingsRes.data ?? []).forEach(b => {
        const prop = propMap.get(b.property_id);
        if (prop) {
          const user = uMap.get(b.user_id);
          prop.bookings.push({ ...b, userName: user?.display_name || null, userAvatar: user?.avatar_url || null } as any);
        }
      });

      (ordersRes.data ?? []).forEach(o => {
        const prop = propMap.get(o.property_id);
        if (prop) {
          const user = uMap.get(o.user_id);
          prop.orders.push({
            ...o, items: oiMap.get(o.id) || [],
            userName: user?.display_name || null,
          } as any);
        }
      });

      propMap.forEach((prop, id) => {
        prop.totalRevenue = prop.bookings.reduce((s, b) => s + Number(b.total), 0) + prop.orders.reduce((s, o) => s + Number(o.total), 0);
        prop.totalGuests = prop.bookings.reduce((s, b) => s + b.guests, 0);
        prop.uniqueGuests = new Set(prop.bookings.map(b => b.user_id)).size;
        const rev = reviewMap.get(id);
        prop.avgRating = rev ? rev.total / rev.count : 0;
        prop.reviewCount = rev?.count || 0;
        const itemCount = new Map<string, { name: string; emoji: string; count: number }>();
        prop.orders.forEach(o => o.items.forEach(i => {
          const ex = itemCount.get(i.item_name) || { name: i.item_name, emoji: i.item_emoji, count: 0 };
          ex.count += i.quantity; itemCount.set(i.item_name, ex);
        }));
        prop.topItems = Array.from(itemCount.values()).sort((a, b) => b.count - a.count).slice(0, 5);
      });

      const allProps = Array.from(propMap.values());
      setProperties(allProps);
      setLoading(false);

      if (initialPropertyId) {
        const targetProp = allProps.find(p => p.id === initialPropertyId);
        if (targetProp) {
          setSelectedProperty(targetProp);
          onContextConsumed?.();
        }
      }
    };
    load();
  }, [initialPropertyId]);

  const categories = useMemo(() => {
    const cats = new Set(properties.map(p => p.category));
    return Array.from(cats);
  }, [properties]);

  const filtered = useMemo(() =>
    properties
      .filter(p => {
        const s = search.toLowerCase();
        const matchSearch = !search || p.name.toLowerCase().includes(s) || p.location.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
        return matchSearch && (!categoryFilter || p.category === categoryFilter);
      })
      .sort((a, b) => {
        if (sortBy === "revenue") return b.totalRevenue - a.totalRevenue;
        if (sortBy === "bookings") return b.bookings.length - a.bookings.length;
        if (sortBy === "guests") return b.uniqueGuests - a.uniqueGuests;
        return (b.bookings[0] ? new Date(b.bookings[0].created_at).getTime() : 0) - (a.bookings[0] ? new Date(a.bookings[0].created_at).getTime() : 0);
      }),
    [properties, search, categoryFilter, sortBy]
  );

  const totalStats = useMemo(() => ({
    revenue: filtered.reduce((s, p) => s + p.totalRevenue, 0),
    bookings: filtered.reduce((s, p) => s + p.bookings.length, 0),
    guests: filtered.reduce((s, p) => s + p.uniqueGuests, 0),
    orders: filtered.reduce((s, p) => s + p.orders.length, 0),
  }), [filtered]);

  const handleUserClick = useCallback((userId: string) => {
    if (onNavigateToClient) onNavigateToClient(userId);
  }, [onNavigateToClient]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-primary/10 transition active:scale-95">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity size={16} className="text-primary" />
            </div>
            Property History
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 ml-10">Full operational history · Calendar · AI Search</p>
        </div>
      </div>

      <AISearchBar onResult={() => {}} properties={properties} />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total Revenue", value: `₹${totalStats.revenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
          { label: "Bookings", value: totalStats.bookings.toString(), icon: CalendarCheck, color: "text-emerald-400", bg: "bg-emerald-500/5" },
          { label: "Unique Guests", value: totalStats.guests.toString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/5" },
          { label: "Food Orders", value: totalStats.orders.toString(), icon: Utensils, color: "text-amber-400", bg: "bg-amber-500/5" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-border ${s.bg} p-2.5 text-center`}>
            <s.icon size={12} className={`${s.color} mx-auto mb-1`} />
            <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter + Search */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setCategoryFilter(null)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${!categoryFilter ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          All ({properties.length})
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${categoryFilter === cat ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search property, location..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 rounded-xl text-xs" />
        </div>
        <div className="flex rounded-xl border border-border overflow-hidden">
          {([["revenue", "₹"], ["bookings", "📅"], ["guests", "👥"], ["recent", "🕒"]] as const).map(([k, icon]) => (
            <button key={k} onClick={() => setSortBy(k)}
              className={`px-2 py-1.5 text-[10px] font-medium transition ${sortBy === k ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Property Cards with Thumbnails ── */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />
        ))}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No properties match</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((prop, i) => (
            <motion.button
              key={prop.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelectedProperty(prop)}
              className="w-full rounded-2xl border border-border bg-card overflow-hidden text-left hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 active:scale-[0.97] group"
            >
              {/* Thumbnail + overlay */}
              <div className="relative h-24 overflow-hidden">
                <PropertyThumbnail name={prop.name} imageUrls={prop.imageUrls} size="hero" className="w-full h-24" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {prop.avgRating > 0 && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold bg-black/50 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">
                      <Star size={8} fill="currentColor" className="text-amber-400" /> {prop.avgRating.toFixed(1)}
                    </span>
                  )}
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm ${
                    prop.status === "published" ? "bg-emerald-500/30 text-emerald-300" : "bg-amber-500/30 text-amber-300"
                  }`}>{prop.status}</span>
                </div>
                <div className="absolute bottom-2 left-3">
                  <h3 className="text-sm font-bold text-foreground drop-shadow-sm">{prop.name}</h3>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <MapPin size={7} /> {prop.location} · {prop.category}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="p-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><CalendarCheck size={9} className="text-blue-400" /> {prop.bookings.length} bookings</span>
                    <span className="flex items-center gap-0.5"><Users size={9} className="text-emerald-400" /> {prop.uniqueGuests} guests</span>
                    <span className="flex items-center gap-0.5"><Utensils size={9} className="text-amber-400" /> {prop.orders.length} orders</span>
                  </div>
                  <p className="text-sm font-bold text-foreground tabular-nums">₹{prop.totalRevenue.toLocaleString("en-IN")}</p>
                </div>

                {prop.topItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prop.topItems.slice(0, 3).map((item, j) => (
                      <span key={j} className="text-[8px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground">
                        {item.emoji} {item.name} ({item.count})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedProperty && (
          <PropertyDetailDrawer
            property={selectedProperty}
            users={usersMap}
            onClose={() => setSelectedProperty(null)}
            onUserClick={handleUserClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
