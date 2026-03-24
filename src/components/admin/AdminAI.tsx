import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Zap, Maximize2, Minimize2, Sparkles,
  IndianRupee, TrendingUp, Users, Database, BarChart3, Shield,
  Copy, Check, Mic, Trash2, Clock, ArrowRight, Wand2, BrainCircuit,
  ChevronDown, ChevronRight as ChevRight, Package, Calendar, Star,
  FileText, Settings, Megaphone, Tag, UtensilsCrossed, UserCheck,
  ClipboardList, Wallet, HelpCircle, BookOpen, CreditCard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { playAIThinkingSound, playAISuccessSound, playAIActionSound, playAIErrorSound } from "@/lib/ai-sounds";
import HushhBot from "./HushhBot";
import { ALL_CATEGORIES, type ExampleCategory } from "./NeuralSearchWidget";

/* ─── Rotating placeholder ─── */
const ROTATING_PLACEHOLDERS = [
  "Show me today's revenue breakdown...",
  "Which properties have the most bookings?",
  "Create a 15% off coupon for weekends...",
  "How many orders are pending right now?",
  "List low stock inventory items...",
  "Who are the top 5 spending customers?",
  "Compare this week vs last week revenue...",
  "Show me all upcoming bookings for tomorrow...",
];

function useRotatingPlaceholder(userInput: string) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (userInput) return;
    const text = ROTATING_PLACEHOLDERS[index];
    let charIdx = 0;
    setDisplayed(""); setTyping(true);
    const typeTimer = setInterval(() => {
      charIdx++;
      setDisplayed(text.slice(0, charIdx));
      if (charIdx >= text.length) { clearInterval(typeTimer); setTyping(false); }
    }, 35);
    return () => clearInterval(typeTimer);
  }, [index, userInput]);

  useEffect(() => {
    if (userInput || typing) return;
    const pause = setTimeout(() => setIndex(prev => (prev + 1) % ROTATING_PLACEHOLDERS.length), 2000);
    return () => clearTimeout(pause);
  }, [typing, userInput]);

  return userInput ? "" : displayed;
}

interface Message { role: "user" | "assistant"; content: string; hadActions?: boolean; timestamp?: number; }

/* ─── Category-wise examples ─── */
interface ExampleCategory {
  id: string;
  label: string;
  icon: typeof IndianRupee;
  color: string;
  examples: { text: string; desc: string }[];
}

const exampleCategories: ExampleCategory[] = [
  {
    id: "revenue", label: "Revenue & Finance", icon: IndianRupee, color: "text-emerald-500",
    examples: [
      { text: "Revenue summary this month", desc: "Total earnings, breakdowns by property" },
      { text: "Compare this week vs last week revenue", desc: "Trend analysis with % change" },
      { text: "What was our best earning day?", desc: "Peak revenue day with details" },
      { text: "Show average booking value by property", desc: "Per-property pricing insights" },
      { text: "List all refunds processed this month", desc: "Refund amounts and reasons" },
    ],
  },
  {
    id: "bookings", label: "Bookings", icon: Calendar, color: "text-blue-500",
    examples: [
      { text: "Show all pending bookings", desc: "Bookings awaiting confirmation" },
      { text: "Upcoming bookings for tomorrow", desc: "Next day's schedule" },
      { text: "Compare weekend vs weekday bookings", desc: "Occupancy patterns" },
      { text: "Which slots are most popular?", desc: "Morning/afternoon/evening trends" },
      { text: "Show cancellation rate this month", desc: "Booking drop-off analysis" },
    ],
  },
  {
    id: "guests", label: "Guests & Loyalty", icon: Users, color: "text-amber-500",
    examples: [
      { text: "Who are the top 5 spending customers?", desc: "High-value guest profiles" },
      { text: "Guest insights & loyalty stats", desc: "Tier distribution and points" },
      { text: "How many new users joined this week?", desc: "Growth metrics" },
      { text: "Show Gold tier members", desc: "Premium customer list" },
      { text: "Which guest has the most bookings?", desc: "Most frequent visitor" },
    ],
  },
  {
    id: "inventory", label: "Inventory & Menu", icon: Package, color: "text-orange-500",
    examples: [
      { text: "Low stock inventory alerts", desc: "Items below threshold" },
      { text: "Move Coca Cola to top of inventory", desc: "Reorder items instantly" },
      { text: "Most ordered items this week", desc: "Popular menu items" },
      { text: "Update price of Chai to ₹30", desc: "Quick price adjustments" },
      { text: "Add new item: Mango Lassi at ₹60", desc: "Create inventory items" },
    ],
  },
  {
    id: "properties", label: "Properties", icon: Star, color: "text-pink-500",
    examples: [
      { text: "Top performing property", desc: "Highest revenue venue" },
      { text: "Which property needs attention?", desc: "Low rating or occupancy alerts" },
      { text: "Show all property ratings", desc: "Rating leaderboard" },
      { text: "Properties with no bookings this week", desc: "Underperforming venues" },
      { text: "Update Firefly Villa price to ₹9000", desc: "Quick pricing changes" },
    ],
  },
  {
    id: "reviews", label: "Reviews", icon: FileText, color: "text-violet-500",
    examples: [
      { text: "Find all 5-star reviews from last week", desc: "Positive feedback highlights" },
      { text: "Show negative reviews needing response", desc: "Reputation management" },
      { text: "Average rating by property", desc: "Quality benchmarks" },
      { text: "Most common feedback themes", desc: "Sentiment analysis" },
    ],
  },
  {
    id: "marketing", label: "Marketing & Coupons", icon: Megaphone, color: "text-rose-500",
    examples: [
      { text: "Create a 15% off coupon for weekends", desc: "Generate promo codes" },
      { text: "Show active campaigns", desc: "Current promotions" },
      { text: "Which coupon has the most uses?", desc: "Campaign effectiveness" },
      { text: "Create a new promotional campaign", desc: "Marketing automation" },
    ],
  },
  {
    id: "staff", label: "Staff & Operations", icon: ClipboardList, color: "text-cyan-500",
    examples: [
      { text: "Show pending staff tasks", desc: "Unfinished work items" },
      { text: "Staff attendance today", desc: "Who's checked in" },
      { text: "Assign cleaning task to morning shift", desc: "Task delegation" },
      { text: "Show overtime hours this month", desc: "Labor cost tracking" },
    ],
  },
];

const quickPrompts = [
  { text: "Revenue summary this month", emoji: "💰", color: "text-emerald-500" },
  { text: "Top performing property", emoji: "📊", color: "text-blue-500" },
  { text: "Low stock inventory alerts", emoji: "📦", color: "text-orange-500" },
  { text: "Upcoming bookings for tomorrow", emoji: "📅", color: "text-pink-500" },
];

/* ─── Subcomponents ─── */

function VoiceWaveVisualizer() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-[3px] h-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div key={i} className="w-[3px] rounded-full bg-red-400" animate={{ height: [5, 14 + i * 2, 5] }} transition={{ duration: 0.35 + i * 0.04, repeat: Infinity, delay: i * 0.05 }} />
      ))}
    </motion.div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 max-w-[85%]">
        <HushhBot size={28} state="thinking" />
        <div className="rounded-2xl border border-primary/10 px-4 py-3 bg-card relative overflow-hidden">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
          <div className="relative z-10 flex items-center gap-2">
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-[11px] font-medium text-primary">Thinking…</motion.span>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><BrainCircuit size={10} className="text-primary/40" /></motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TypewriterContent({ content, isLatest }: { content: string; isLatest: boolean }) {
  const [displayed, setDisplayed] = useState(isLatest ? "" : content);
  const [done, setDone] = useState(!isLatest);
  useEffect(() => {
    if (!isLatest) { setDisplayed(content); setDone(true); return; }
    let idx = 0; setDisplayed(""); setDone(false);
    const iv = setInterval(() => { idx += 2; setDisplayed(content.slice(0, idx)); if (idx >= content.length) { clearInterval(iv); setDone(true); } }, 8);
    return () => clearInterval(iv);
  }, [content, isLatest]);

  return (
    <div className="text-xs leading-relaxed space-y-1">
      <RichMarkdown content={displayed} />
      {!done && <motion.span className="inline-block w-[2px] h-[1em] bg-primary/60 ml-0.5 align-text-bottom" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />}
    </div>
  );
}

function MessageBubble({ msg, isLatest }: { msg: Message; isLatest: boolean }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const copy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 25 }} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <div className="mr-2 shrink-0 mt-1"><HushhBot size={26} state={msg.hadActions ? "success" : "idle"} /></div>}
      <div className="max-w-[82%]">
        <div className={`rounded-2xl px-3.5 py-2.5 ${isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border/50"}`}>
          {!isUser && msg.hadActions && (
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-medium text-emerald-500 bg-emerald-500/8 px-2 py-1 rounded-lg w-fit">
              <Zap size={9} /> Actions executed
            </div>
          )}
          {isUser ? <span className="text-[13px]">{msg.content}</span> : <TypewriterContent content={msg.content} isLatest={isLatest} />}
          <div className="flex items-center justify-between mt-1">
            {msg.timestamp && <span className="text-[8px] text-muted-foreground/40"><Clock size={7} className="inline mr-0.5" />{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
            {!isUser && <button onClick={copy} className="text-muted-foreground/30 hover:text-primary transition ml-auto">{copied ? <Check size={9} className="text-emerald-500" /> : <Copy size={9} />}</button>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RichMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return <>{lines.map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-sm mt-2 text-foreground">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-sm mt-2 text-foreground">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} className="font-bold mt-2 text-foreground">{line.slice(2)}</h1>;
    if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 list-disc text-foreground/80">{fmtInline(line.slice(2))}</li>;
    if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-foreground/80">{fmtInline(line.replace(/^\d+\.\s/, ""))}</li>;
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i} className="text-foreground/85">{fmtInline(line)}</p>;
  })}</>;
}

function fmtInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    return part;
  });
}

/* ─── Collapsible Category Section ─── */
function CategorySection({ cat, onSend, onFill, initialOpen }: { cat: ExampleCategory; onSend: (t: string) => void; onFill: (t: string) => void; initialOpen: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [showAll, setShowAll] = useState(false);
  const visibleExamples = showAll ? cat.examples : cat.examples.slice(0, 3);

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden bg-card/50">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left active:bg-secondary/30 transition-colors">
        <cat.icon size={14} className={cat.color} />
        <span className="text-[12px] font-semibold text-foreground flex-1">{cat.label}</span>
        <span className="text-[10px] text-muted-foreground mr-1">{cat.examples.length}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} className="text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1.5">
              {visibleExamples.map((ex, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="group flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-secondary/40 cursor-pointer transition-colors"
                  onClick={() => onFill(ex.text)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground/90 truncate">{ex.text}</p>
                    <p className="text-[9px] text-muted-foreground/60 truncate">{ex.desc}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onSend(ex.text); }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <ArrowRight size={12} className="text-primary" />
                  </button>
                </motion.div>
              ))}
              {cat.examples.length > 3 && (
                <button onClick={() => setShowAll(!showAll)} className="text-[10px] text-primary font-medium px-2.5 py-1 flex items-center gap-1 hover:underline">
                  {showAll ? "Show less" : `Show ${cat.examples.length - 3} more`}
                  <ChevronDown size={10} className={showAll ? "rotate-180" : ""} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Stats cards ─── */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof IndianRupee; color: string }) {
  return (
    <div className="bg-card border border-border/40 rounded-xl p-3 flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-secondary/60 ${color}`}><Icon size={14} /></div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdminAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const rotatingPlaceholder = useRotatingPlaceholder(input);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadContext(); }, []);

  const loadContext = async () => {
    const [bookingsRes, profilesRes, listingsRes, ordersRes, inventoryRes, curationsRes, campaignsRes, couponsRes, reviewsRes, orderItemsRes, staffTasksRes] = await Promise.all([
      supabase.from("bookings").select("total, status, date, slot, property_id, user_id, booking_id, guests, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("user_id, display_name, loyalty_points, tier, location, created_at"),
      supabase.from("host_listings").select("id, name, base_price, capacity, status, category, location, rating, review_count, tags, primary_category, host_name"),
      supabase.from("orders").select("id, total, status, property_id, user_id, booking_id, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("inventory").select("name, category, emoji, unit_price, stock, available, low_stock_threshold, sort_order"),
      supabase.from("curations").select("name, price, original_price, tagline, slot, mood, tags, active, badge, property_id, sort_order"),
      supabase.from("campaigns").select("title, type, discount_type, discount_value, active, start_date, end_date, target_audience, target_properties"),
      supabase.from("coupons").select("code, discount_type, discount_value, active, uses, max_uses, min_order, expires_at"),
      supabase.from("reviews").select("rating, content, property_id, user_id, verified, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("order_items").select("item_name, item_emoji, quantity, unit_price, order_id").limit(200),
      supabase.from("staff_tasks").select("title, status, priority, assigned_to, property_id, due_date").limit(50),
    ]);

    const bookings = bookingsRes.data ?? [];
    const orders = ordersRes.data ?? [];
    const profiles = profilesRes.data ?? [];
    const listings = listingsRes.data ?? [];
    const inventory = inventoryRes.data ?? [];
    const curations = curationsRes.data ?? [];
    const reviews = reviewsRes.data ?? [];

    const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
    const orderRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const avgBookingValue = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "N/A";
    const lowStockItems = inventory.filter(i => i.stock <= i.low_stock_threshold);
    const statusBreakdown = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const tierBreakdown = profiles.reduce((acc, p) => { acc[p.tier] = (acc[p.tier] || 0) + 1; return acc; }, {} as Record<string, number>);

    setContext({
      summary: { totalRevenue, orderRevenue, combinedRevenue: totalRevenue + orderRevenue, totalBookings: bookings.length, totalUsers: profiles.length, activeListings: listings.filter(l => l.status === "published").length, totalListings: listings.length, totalOrders: orders.length, avgBookingValue, avgRating, lowStockCount: lowStockItems.length, activeCampaigns: (campaignsRes.data ?? []).filter(c => c.active).length, activeCoupons: (couponsRes.data ?? []).filter(c => c.active).length, pendingTasks: (staffTasksRes.data ?? []).filter(t => t.status === "pending").length, bookingStatusBreakdown: statusBreakdown, userTierBreakdown: tierBreakdown },
      listings: listings.map(l => ({ name: l.name, price: l.base_price, capacity: l.capacity, category: l.category, status: l.status, location: l.location, rating: l.rating, reviews: l.review_count, tags: l.tags, host: l.host_name })),
      recentBookings: bookings.slice(0, 30).map(b => ({ total: b.total, status: b.status, date: b.date, slot: b.slot, guests: b.guests, property: b.property_id, user: b.user_id })),
      inventory: inventory.map(i => ({ name: i.name, category: i.category, emoji: i.emoji, price: i.unit_price, stock: i.stock, available: i.available, lowStock: i.stock <= i.low_stock_threshold })),
      curations: curations.map(c => ({ name: c.name, price: c.price, originalPrice: c.original_price, tagline: c.tagline, slot: c.slot, active: c.active, badge: c.badge, mood: c.mood })),
      campaigns: (campaignsRes.data ?? []).map(c => ({ title: c.title, type: c.type, discount: `${c.discount_value}${c.discount_type === "percent" ? "%" : "₹"}`, active: c.active, start: c.start_date, end: c.end_date })),
      coupons: (couponsRes.data ?? []).map(c => ({ code: c.code, discount: `${c.discount_value}${c.discount_type === "percent" ? "%" : "₹"}`, active: c.active, uses: c.uses, maxUses: c.max_uses, minOrder: c.min_order })),
      recentReviews: reviews.slice(0, 20).map(r => ({ rating: r.rating, content: r.content?.slice(0, 100), property: r.property_id, verified: r.verified })),
      topOrderedItems: Object.entries((orderItemsRes.data ?? []).reduce((acc, i) => { acc[i.item_name] = (acc[i.item_name] || 0) + i.quantity; return acc; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, qty]) => ({ name, totalQty: qty })),
      staffTasks: (staffTasksRes.data ?? []).map(t => ({ title: t.title, status: t.status, priority: t.priority })),
      profiles: profiles.map(p => ({ name: p.display_name, points: p.loyalty_points, tier: p.tier, location: p.location })),
    });
  };

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setLoading(true);
    playAIThinkingSound();
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })), context }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        playAIErrorSound();
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${err.error || "Something went wrong"}`, timestamp: Date.now() }]);
        setLoading(false); return;
      }

      const data = await resp.json();
      data.actions_performed ? playAIActionSound() : playAISuccessSound();
      setMessages(prev => [...prev, { role: "assistant", content: data.content || "Done!", hadActions: data.actions_performed, timestamp: Date.now() }]);
      if (data.actions_performed) { window.dispatchEvent(new Event("hushh:listings-updated")); loadContext(); }
    } catch {
      playAIErrorSound();
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to connect. Try again.", timestamp: Date.now() }]);
    }
    setLoading(false);
  }, [messages, loading, context]);

  const startHold = useCallback(() => {
    setIsHolding(true);
    if ("vibrate" in navigator) navigator.vibrate(30);
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SR(); recog.lang = "en-IN"; recog.continuous = false; recog.interimResults = false;
      recog.onresult = (e: any) => { setInput(e.results[0][0].transcript); setIsHolding(false); };
      recog.onerror = () => setIsHolding(false); recog.onend = () => setIsHolding(false);
      recog.start(); (window as any).__hushhRecog = recog;
    }
  }, []);

  const stopHold = useCallback(() => { setIsHolding(false); if ((window as any).__hushhRecog) (window as any).__hushhRecog.stop(); }, []);

  const botState = loading ? "thinking" : isHolding ? "listening" : messages.length === 0 ? "idle" : "success";

  const stats = context?.summary;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HushhBot size={40} state={botState} />
          <div>
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              AI Assistant
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">Online</span>
            </h1>
            <p className="text-[10px] text-muted-foreground">Query data · Analyze · Execute actions</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="p-2 rounded-lg hover:bg-secondary transition"><Trash2 size={14} className="text-muted-foreground" /></button>
          )}
          <button onClick={() => setShowHelp(!showHelp)} className={`p-2 rounded-lg transition ${showHelp ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground"}`}>
            <BookOpen size={14} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-secondary transition">
            {expanded ? <Minimize2 size={14} className="text-muted-foreground" /> : <Maximize2 size={14} className="text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Input bar — always visible */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder={rotatingPlaceholder || "Ask anything…"} disabled={loading}
            className="w-full bg-card border border-border/50 rounded-xl pl-4 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition" />
        </div>
        <button onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${isHolding ? "bg-red-500/15 border-red-400/30 text-red-400" : "bg-secondary/40 border-border/50 text-muted-foreground"}`}>
          <AnimatePresence mode="wait">
            {isHolding ? <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><VoiceWaveVisualizer /></motion.div> : <Mic size={16} />}
          </AnimatePresence>
        </button>
        <motion.button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} whileTap={{ scale: 0.93 }}
          className="w-10 h-10 rounded-xl bg-primary text-primary-foreground disabled:opacity-30 flex items-center justify-center transition">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Empty state ─── */}
        {messages.length === 0 && !showHelp && (
          <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">

            {/* Quick stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Revenue" value={`₹${(stats.combinedRevenue / 1000).toFixed(1)}k`} icon={IndianRupee} color="text-emerald-500" />
                <StatCard label="Bookings" value={stats.totalBookings} icon={Calendar} color="text-blue-500" />
                <StatCard label="Guests" value={stats.totalUsers} icon={Users} color="text-amber-500" />
                <StatCard label="Low Stock" value={stats.lowStockCount} icon={Package} color="text-orange-500" />
              </div>
            )}

            {/* Quick prompts */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick actions</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((qp, i) => (
                  <motion.button key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.96 }} onClick={() => sendMessage(qp.text)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border/40 bg-card hover:border-primary/20 transition-colors text-left">
                    <span className="text-base">{qp.emoji}</span>
                    <span className="text-[11px] font-medium text-foreground/80 leading-tight">{qp.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Category examples — first 3 open, rest collapsed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Browse by category</p>
                <button onClick={() => setShowHelp(true)} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                  All categories <ChevRight size={10} />
                </button>
              </div>
              <div className="space-y-2">
                {exampleCategories.slice(0, 4).map((cat, i) => (
                  <CategorySection key={cat.id} cat={cat} onSend={sendMessage} onFill={setInput} initialOpen={i === 0} />
                ))}
              </div>
            </div>

            {/* Capabilities footer */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 border border-border/30">
              <Wand2 size={14} className="text-primary/60 shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground/70">Powered by AI</span> — Ask in natural language. I can read all your business data, create reports, manage inventory, and execute operational changes.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Help / All categories ─── */}
        {messages.length === 0 && showHelp && (
          <motion.div key="help" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <HelpCircle size={14} className="text-primary" /> What can I help with?
              </h2>
              <button onClick={() => setShowHelp(false)} className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                ← Back
              </button>
            </div>
            <div className="space-y-2">
              {exampleCategories.map((cat, i) => (
                <CategorySection key={cat.id} cat={cat} onSend={(t) => { setShowHelp(false); sendMessage(t); }} onFill={(t) => { setShowHelp(false); setInput(t); }} initialOpen={false} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── Chat area ─── */}
        {messages.length > 0 && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div ref={scrollRef} className={`rounded-2xl border border-border/40 overflow-y-auto transition-all bg-card/30 ${expanded ? "h-[60vh]" : "h-[45vh]"}`}>
              <div className="p-4 space-y-3">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1 && msg.role === "assistant"} />
                ))}
                <AnimatePresence>{loading && <ThinkingIndicator />}</AnimatePresence>
              </div>
            </div>

            {/* Suggestion chips after last message */}
            {!loading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-1.5">
                {["Follow up", "Show more details", "Export this data", "What else can you tell me?"].map((chip, i) => (
                  <button key={i} onClick={() => sendMessage(chip)} className="text-[10px] px-2.5 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition bg-card">
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
