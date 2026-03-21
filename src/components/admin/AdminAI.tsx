import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Zap, Maximize2, Minimize2, Sparkles,
  IndianRupee, TrendingUp, Users, Database, BarChart3, Shield,
  Copy, Check, Mic, RefreshCw, Trash2, Clock, ArrowRight, Wand2, BrainCircuit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { playAIThinkingSound, playAISuccessSound, playAIActionSound, playAIErrorSound } from "@/lib/ai-sounds";
import HushhBot from "./HushhBot";

const ROTATING_PLACEHOLDERS = [
  "Show me today's revenue breakdown...",
  "Which properties have the most bookings?",
  "Create a 15% off coupon for weekends...",
  "How many orders are pending right now?",
  "List low stock inventory items...",
  "Who are the top 5 spending customers?",
  "Compare this week vs last week revenue...",
  "Show me all upcoming bookings for tomorrow...",
  "What's the average booking value this month?",
  "Find all 5-star reviews from last week...",
];

function useRotatingPlaceholder(userInput: string) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (userInput) return; // stop when user is typing
    const text = ROTATING_PLACEHOLDERS[index];
    let charIdx = 0;
    setDisplayed("");
    setTyping(true);

    const typeTimer = setInterval(() => {
      charIdx++;
      setDisplayed(text.slice(0, charIdx));
      if (charIdx >= text.length) {
        clearInterval(typeTimer);
        setTyping(false);
      }
    }, 35);

    return () => clearInterval(typeTimer);
  }, [index, userInput]);

  useEffect(() => {
    if (userInput) return;
    if (typing) return;
    const pause = setTimeout(() => {
      setIndex(prev => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 2000);
    return () => clearTimeout(pause);
  }, [typing, userInput]);

  return userInput ? "" : displayed;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  hadActions?: boolean;
  timestamp?: number;
}

const quickPrompts = [
  { icon: IndianRupee, text: "Revenue summary this month", color: "from-emerald-500/15 to-emerald-500/5", accent: "text-emerald-500", emoji: "💰" },
  { icon: TrendingUp, text: "Top performing property", color: "from-blue-500/15 to-blue-500/5", accent: "text-blue-500", emoji: "📊" },
  { icon: Users, text: "Guest insights & loyalty stats", color: "from-amber-500/15 to-amber-500/5", accent: "text-amber-500", emoji: "👥" },
  { icon: Zap, text: "Move Coca Cola to top of inventory", color: "from-primary/15 to-primary/5", accent: "text-primary", emoji: "⚡" },
  { icon: BarChart3, text: "Compare weekend vs weekday bookings", color: "from-pink-500/15 to-pink-500/5", accent: "text-pink-500", emoji: "📈" },
  { icon: Database, text: "Low stock inventory alerts", color: "from-orange-500/15 to-orange-500/5", accent: "text-orange-500", emoji: "📦" },
];

const capabilities = [
  { icon: Database, label: "Query Data", desc: "Search all tables instantly", color: "bg-blue-500/10 text-blue-500" },
  { icon: Zap, label: "Execute Actions", desc: "Create, update, delete records", color: "bg-amber-500/10 text-amber-500" },
  { icon: BarChart3, label: "Analytics", desc: "Revenue & trend insights", color: "bg-emerald-500/10 text-emerald-500" },
  { icon: Shield, label: "Smart Ops", desc: "Reorder, pricing, inventory", color: "bg-purple-500/10 text-purple-500" },
];

const exampleQueries = [
  "What was our best day this month?",
  "Show me all pending bookings",
  "Which property needs attention?",
  "Update prices for weekend slots",
  "Create a new promotional campaign",
  "Who are our top 5 spenders?",
];

/* ─── Floating particles ─── */
function FloatingParticles({ count = 6 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/8"
          style={{
            width: 2 + (i % 3) * 2,
            height: 2 + (i % 3) * 2,
            left: `${8 + (i * 14) % 80}%`,
            top: `${10 + (i * 18) % 70}%`,
          }}
          animate={{
            y: [0, -15 - i * 4, 0],
            x: [0, (i % 2 ? 6 : -6), 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  );
}

/* ─── Voice wave visualizer ─── */
function VoiceWaveVisualizer() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-[3px] h-6"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-red-400"
          animate={{ height: [5, 14 + i * 2, 5] }}
          transition={{ duration: 0.35 + i * 0.04, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
    </motion.div>
  );
}

/* ─── Thinking indicator ─── */
function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-start gap-2.5 max-w-[85%]"
      >
        <HushhBot size={32} state="thinking" />
        <div className="rounded-2xl border border-primary/15 px-4 py-3 bg-primary/[0.04] relative overflow-hidden">
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-[11px] font-semibold text-primary font-display"
              >
                Thinking...
              </motion.span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <BrainCircuit size={10} className="text-primary/40" />
              </motion.div>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full bg-primary/30"
                  style={{ width: 5 + Math.random() * 14 }}
                  animate={{ opacity: [0.2, 1, 0.2], scaleX: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Typewriter for assistant messages ─── */
function TypewriterContent({ content, isLatest }: { content: string; isLatest: boolean }) {
  const [displayed, setDisplayed] = useState(isLatest ? "" : content);
  const [done, setDone] = useState(!isLatest);

  useEffect(() => {
    if (!isLatest) { setDisplayed(content); setDone(true); return; }
    let idx = 0;
    setDisplayed("");
    setDone(false);
    const iv = setInterval(() => {
      idx += 2;
      setDisplayed(content.slice(0, idx));
      if (idx >= content.length) { clearInterval(iv); setDone(true); }
    }, 8);
    return () => clearInterval(iv);
  }, [content, isLatest]);

  return (
    <div className="text-xs leading-relaxed space-y-1 font-display">
      <RichMarkdown content={displayed} />
      {!done && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-primary/60 ml-0.5 align-text-bottom"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

/* ─── Message bubble ─── */
function MessageBubble({ msg, isLatest }: { msg: Message; isLatest: boolean }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="mr-2 shrink-0 mt-1"
        >
          <HushhBot size={30} state={msg.hadActions ? "success" : "idle"} />
        </motion.div>
      )}
      <div className={`max-w-[82%]`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "text-primary-foreground shadow-lg"
              : "border border-border/50 shadow-sm"
          }`}
          style={isUser
            ? { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(270 80% 60%))", boxShadow: "0 4px 16px -4px hsl(var(--primary) / 0.3)" }
            : { background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.3))" }
          }
        >
          {!isUser && msg.hadActions && (
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit"
            >
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
                <Zap size={10} />
              </motion.div>
              Actions executed
            </motion.div>
          )}

          {isUser ? (
            <span className="text-sm font-display">{msg.content}</span>
          ) : (
            <TypewriterContent content={msg.content} isLatest={isLatest} />
          )}

          <div className="flex items-center justify-between mt-1.5">
            {msg.timestamp && (
              <span className="text-[8px] text-muted-foreground/40 font-mono flex items-center gap-0.5">
                <Clock size={7} />
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {!isUser && (
              <button onClick={copy} className="text-[9px] text-muted-foreground/40 hover:text-primary transition flex items-center gap-0.5 ml-auto">
                {copied ? <Check size={8} className="text-emerald-400" /> : <Copy size={8} />}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Rich markdown ─── */
function RichMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-sm mt-2 text-foreground">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-sm mt-2 text-foreground">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="font-bold mt-2 text-foreground">{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("* "))
          return <li key={i} className="ml-4 list-disc text-foreground/80">{fmtInline(line.slice(2))}</li>;
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-foreground/80">{fmtInline(line.replace(/^\d+\.\s/, ""))}</li>;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-foreground/85">{fmtInline(line)}</p>;
      })}
    </>
  );
}

function fmtInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    return part;
  });
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

    // Build rich summary
    const totalRevenue = bookings.reduce((s, b) => s + Number(b.total), 0);
    const orderRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
    const avgBookingValue = bookings.length ? Math.round(totalRevenue / bookings.length) : 0;
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "N/A";
    const lowStockItems = inventory.filter(i => i.stock <= i.low_stock_threshold);
    const statusBreakdown = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const tierBreakdown = profiles.reduce((acc, p) => { acc[p.tier] = (acc[p.tier] || 0) + 1; return acc; }, {} as Record<string, number>);

    setContext({
      summary: {
        totalRevenue,
        orderRevenue,
        combinedRevenue: totalRevenue + orderRevenue,
        totalBookings: bookings.length,
        totalUsers: profiles.length,
        activeListings: listings.filter(l => l.status === "published").length,
        totalListings: listings.length,
        totalOrders: orders.length,
        avgBookingValue,
        avgRating,
        lowStockCount: lowStockItems.length,
        activeCampaigns: (campaignsRes.data ?? []).filter(c => c.active).length,
        activeCoupons: (couponsRes.data ?? []).filter(c => c.active).length,
        pendingTasks: (staffTasksRes.data ?? []).filter(t => t.status === "pending").length,
        bookingStatusBreakdown: statusBreakdown,
        userTierBreakdown: tierBreakdown,
      },
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    playAIThinkingSound();

    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: allMessages.map(m => ({ role: m.role, content: m.content })),
            context,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        playAIErrorSound();
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${err.error || "Something went wrong"}`, timestamp: Date.now() }]);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      data.actions_performed ? playAIActionSound() : playAISuccessSound();

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content || "Done!",
        hadActions: data.actions_performed,
        timestamp: Date.now(),
      }]);

      if (data.actions_performed) {
        window.dispatchEvent(new Event("hushh:listings-updated"));
        loadContext();
      }
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
      const recog = new SR();
      recog.lang = "en-IN";
      recog.continuous = false;
      recog.interimResults = false;
      recog.onresult = (e: any) => {
        setInput(e.results[0][0].transcript);
        setIsHolding(false);
      };
      recog.onerror = () => setIsHolding(false);
      recog.onend = () => setIsHolding(false);
      recog.start();
      (window as any).__hushhRecog = recog;
    }
  }, []);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    if ((window as any).__hushhRecog) (window as any).__hushhRecog.stop();
  }, []);

  const clearChat = () => { setMessages([]); };

  const botState = loading ? "thinking" : isHolding ? "listening" : messages.length === 0 ? "idle" : "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="space-y-4 relative"
    >
      <FloatingParticles count={10} />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
            <HushhBot size={48} state={botState} />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2 font-display">
              Hushh AI Assistant
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              >
                Online
              </motion.span>
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Wand2 size={10} className="text-primary/40" />
              Ask questions, analyze data, or execute actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9, rotate: -90 }}
              onClick={clearChat}
              className="p-2 rounded-xl hover:bg-secondary transition border border-border/50"
            >
              <Trash2 size={16} className="text-muted-foreground" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl hover:bg-secondary transition border border-border/50"
          >
            {expanded ? <Minimize2 size={16} className="text-muted-foreground" /> : <Maximize2 size={16} className="text-muted-foreground" />}
          </motion.button>
        </div>
      </div>

      {/* Empty state */}
      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4 relative z-10"
          >
            {/* Hero */}
            <motion.div
              className="relative rounded-2xl border border-primary/15 overflow-hidden p-6 text-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.06))" }}
            >
              <FloatingParticles count={5} />
              <motion.div
                className="flex justify-center mb-4"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, delay: 0.1 }}
              >
                <HushhBot size={72} state="idle" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base font-bold text-foreground mb-1 font-display"
              >
                Hello! How can I help you today?
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed mb-4"
              >
                I can query your data, generate analytics, manage inventory, and execute actions — all through natural language.
              </motion.p>

              {/* Input bar below avatar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Ask anything or give a command..."
                    className="w-full bg-background/50 border border-border rounded-xl pl-4 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition font-display"
                    disabled={loading}
                  />
                </div>
                <motion.button
                  onPointerDown={startHold}
                  onPointerUp={stopHold}
                  onPointerLeave={stopHold}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center border transition ${
                    isHolding
                      ? "bg-red-500/20 border-red-400/40 text-red-400"
                      : "bg-secondary/50 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isHolding ? (
                      <motion.div key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <VoiceWaveVisualizer />
                      </motion.div>
                    ) : (
                      <motion.div key="mic" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <Mic size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isHolding && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-red-400/40"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 h-11 rounded-xl text-primary-foreground disabled:opacity-40 transition overflow-hidden flex items-center relative"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(270 80% 60%))",
                    boxShadow: "0 4px 14px -2px hsl(var(--primary) / 0.25)",
                  }}
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 size={18} />
                    </motion.div>
                  ) : (
                    <motion.div animate={{ x: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Send size={18} />
                    </motion.div>
                  )}
                </motion.button>
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-[9px] text-muted-foreground/40 flex items-center gap-1 font-mono">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={8} />
                  </motion.div>
                  Hushh AI · Hold 🎤 to speak
                </p>
                <p className="text-[9px] text-muted-foreground/40 font-mono">Enter ↵</p>
              </div>

              {/* Capabilities */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={cap.label}
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.08, type: "spring", damping: 20 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="flex items-center gap-2 text-left p-2.5 rounded-xl border border-border/50 bg-secondary/20 cursor-default"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${cap.color}`}
                    >
                      <cap.icon size={13} />
                    </motion.div>
                    <div>
                      <span className="text-[10px] font-semibold text-foreground block">{cap.label}</span>
                      <span className="text-[8px] text-muted-foreground">{cap.desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick prompts */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Try asking</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((qp, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05, type: "spring", damping: 20 }}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    onClick={() => sendMessage(qp.text)}
                    className={`group relative rounded-xl border border-border/60 bg-gradient-to-br ${qp.color} p-3 text-left hover:border-primary/30 transition-all`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        className="text-base"
                      >
                        {qp.emoji}
                      </motion.span>
                      <qp.icon size={12} className={qp.accent} />
                    </div>
                    <span className="text-[10px] font-medium text-foreground block leading-tight">{qp.text}</span>
                    <ArrowRight size={10} className="absolute bottom-2.5 right-2.5 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Example queries strip */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">More examples</p>
              <div className="flex flex-wrap gap-1.5">
                {exampleQueries.map((eq, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.04, type: "spring", damping: 20 }}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(eq)}
                    className="text-[9px] px-2.5 py-1.5 rounded-full border border-border/60 text-muted-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition font-display"
                  >
                    "{eq}"
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4 relative z-10"
          >
            {/* Input bar below header when chatting */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask anything or give a command..."
                  className="w-full bg-card border border-border rounded-xl pl-4 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition font-display"
                  disabled={loading}
                />
              </div>
              <motion.button
                onPointerDown={startHold}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center border transition ${
                  isHolding
                    ? "bg-red-500/20 border-red-400/40 text-red-400"
                    : "bg-secondary/50 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isHolding ? (
                    <motion.div key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <VoiceWaveVisualizer />
                    </motion.div>
                  ) : (
                    <motion.div key="mic" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                      <Mic size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                whileTap={{ scale: 0.93 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 h-11 rounded-xl text-primary-foreground disabled:opacity-40 transition overflow-hidden flex items-center relative"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(270 80% 60%))",
                  boxShadow: "0 4px 14px -2px hsl(var(--primary) / 0.25)",
                }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 size={18} />
                  </motion.div>
                ) : (
                  <motion.div animate={{ x: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Send size={18} />
                  </motion.div>
                )}
              </motion.button>
            </div>

            {/* Chat messages */}
            <div
              ref={scrollRef}
              className={`rounded-2xl border border-border/50 overflow-y-auto transition-all relative ${expanded ? "h-[60vh]" : "h-[45vh]"}`}
              style={{ background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--background) / 0.5))" }}
            >
              <FloatingParticles count={4} />
              <div className="p-4 space-y-4 relative z-10">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1 && msg.role === "assistant"} />
                ))}
                <AnimatePresence>{loading && <ThinkingIndicator />}</AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
