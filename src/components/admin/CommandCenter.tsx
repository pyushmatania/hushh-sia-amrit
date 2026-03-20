import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IndianRupee, CalendarCheck, Eye, Users, TrendingUp,
  ArrowUpRight, Flame, Clock, Sparkles, Send, Loader2,
  BrainCircuit, Terminal, Activity, Zap, CircuitBoard, Bot, Cpu
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import LiveActivityFeed from "./LiveActivityFeed";
import LiveOrdersWidget from "./LiveOrdersWidget";
import BookingHeatmap from "./BookingHeatmap";
import WeeklyDigestPreview from "./WeeklyDigestPreview";
import { Input } from "@/components/ui/input";
import type { AdminPage } from "./AdminLayout";
import { playAIThinkingSound, playAISuccessSound, playAIErrorSound } from "@/lib/ai-sounds";

interface Stats {
  revenue: number;
  bookings: number;
  activeListings: number;
  totalUsers: number;
}

function AnimatedCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(value / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString("en-IN")}</span>;
}

const smartCards = [
  { icon: Flame, text: "7–11 PM slots 85% full tonight", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: TrendingUp, text: "Couple experiences trending +40%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Clock, text: "Low bookings tomorrow 12–4 PM", color: "text-amber-400", bg: "bg-amber-500/10" },
];

const mockChartData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  revenue: Math.floor(Math.random() * 15000) + 5000,
}));

/* ─── Neural scanning line ─── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none z-0"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.2), transparent)" }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ─── AI Thinking animation ─── */
function AIThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      className="relative border border-primary/20 rounded-xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--card)))" }}
    >
      <div className="p-4 flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <BrainCircuit size={16} className="text-primary" />
        </motion.div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Analyzing data streams
            </span>
            <motion.div className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1 h-1 rounded-full bg-primary"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={i}
                className="h-1 rounded-full bg-primary/30"
                style={{ width: 6 + Math.random() * 20 }}
                animate={{ opacity: [0.3, 0.8, 0.3], scaleX: [0.6, 1, 0.6] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        </div>
      </div>
      <motion.div
        className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

/* ─── Typewriter for answer ─── */
function TypewriterAnswer({ content, onDone }: { content: string; onDone?: () => void }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText("");
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      setText(content.slice(0, Math.min(i, content.length)));
      if (i >= content.length) { clearInterval(iv); onDone?.(); }
    }, 10);
    return () => clearInterval(iv);
  }, [content]);

  return (
    <div className="relative">
      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {text}
      </p>
      {text.length < content.length && (
        <motion.span
          className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
      )}
    </div>
  );
}

/* ─── AI Command Search — Futuristic redesign ─── */
function AdminAISearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    playAIThinkingSound();
    try {
      const [bookingsRes, ordersRes, orderItemsRes, profilesRes, listingsRes, reviewsRes, inventoryRes] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("order_items").select("*").limit(500),
        supabase.from("profiles").select("display_name, tier, loyalty_points, location, created_at, user_id").limit(100),
        supabase.from("host_listings").select("id, name, category, base_price, capacity, status").limit(50),
        supabase.from("reviews").select("property_id, rating, content, created_at").limit(100),
        supabase.from("inventory").select("name, emoji, stock, category, unit_price, available").limit(100),
      ]);

      const listingMap = new Map<string, string>();
      (listingsRes.data ?? []).forEach(l => listingMap.set(l.id, l.name));
      const oiMap = new Map<string, any[]>();
      (orderItemsRes.data ?? []).forEach(item => {
        const list = oiMap.get(item.order_id) || [];
        list.push(item);
        oiMap.set(item.order_id, list);
      });

      const context = {
        properties: listingsRes.data ?? [],
        bookings: (bookingsRes.data ?? []).map(b => ({ ...b, propertyName: listingMap.get(b.property_id) })),
        orders: (ordersRes.data ?? []).map(o => ({
          ...o, propertyName: listingMap.get(o.property_id),
          items: (oiMap.get(o.id) || []).map((i: any) => `${i.item_emoji}${i.item_name} x${i.quantity}`).join(", "),
        })),
        clients: profilesRes.data ?? [],
        reviews: (reviewsRes.data ?? []).map(r => ({ ...r, propertyName: listingMap.get(r.property_id) })),
        inventory: inventoryRes.data ?? [],
        summary: {
          totalRevenue: (bookingsRes.data ?? []).reduce((s, b) => s + Number(b.total), 0),
          totalBookings: (bookingsRes.data ?? []).length,
          totalOrders: (ordersRes.data ?? []).length,
          totalClients: (profilesRes.data ?? []).length,
        },
      };

      const resp = await supabase.functions.invoke("property-history-ai", {
        body: { query, context: JSON.stringify(context), mode: "general" },
      });
      if (resp.error) throw resp.error;
      playAISuccessSound();
      setAnswer(resp.data?.answer || "No answer found.");
    } catch (e) {
      console.error(e);
      playAIErrorSound();
      setAnswer("Sorry, couldn't process the query. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "What was our busiest day this month?",
    "Which property generates the most revenue?",
    "Top 5 most ordered food items",
    "Compare weekday vs weekend bookings",
    "Which clients are at risk of churning?",
    "Predict tomorrow's demand",
  ];

  return (
    <div className="relative rounded-2xl border border-primary/15 overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.03))" }}>
      <ScanLine />

      <div className="p-4 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(270 80% 65% / 0.1))" }}
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0)",
                "0 0 12px 2px hsl(var(--primary) / 0.12)",
                "0 0 0 0 hsl(var(--primary) / 0)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <CircuitBoard size={15} className="text-primary" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Neural Search
              <span className="flex items-center gap-1 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity size={7} /> Live
              </span>
            </h3>
          </div>
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Terminal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
            <Input
              placeholder="Query: revenue trends, guest patterns, inventory..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="pl-9 h-10 rounded-xl text-xs border-primary/10 focus:border-primary/30 focus:ring-primary/20"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
          </div>
          <motion.button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            whileTap={{ scale: 0.93 }}
            className="px-4 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition shadow-lg shadow-primary/10"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={14} />
              </motion.div>
            ) : (
              <Send size={14} />
            )}
            Ask
          </motion.button>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {examples.map((eq, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              onClick={() => setQuery(eq)}
              className="text-[9px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {eq}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <AIThinkingBubble />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer */}
      <AnimatePresence>
        {answer && !loading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-primary/10"
          >
            <div className="p-4" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.04), hsl(var(--card)))" }}>
              <div className="flex items-start gap-2.5">
                <motion.div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "hsl(var(--primary) / 0.12)" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Bot size={12} className="text-primary" />
                </motion.div>
                <TypewriterAnswer content={answer} />
              </div>
              <motion.button
                onClick={() => setAnswer(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 text-[9px] text-muted-foreground/50 hover:text-foreground transition flex items-center gap-1"
              >
                <Sparkles size={8} /> Dismiss
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CommandCenter({ onNavigate }: { onNavigate?: (page: AdminPage) => void }) {
  const [stats, setStats] = useState<Stats>({ revenue: 0, bookings: 0, activeListings: 0, totalUsers: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("total, status"),
      supabase.from("host_listings").select("id, status"),
      supabase.from("profiles").select("id"),
    ]).then(([bookingsRes, listingsRes, usersRes]) => {
      const bookings = bookingsRes.data ?? [];
      const listings = listingsRes.data ?? [];
      const users = usersRes.data ?? [];
      setStats({
        revenue: bookings.reduce((s, b) => s + Number(b.total), 0),
        bookings: bookings.length,
        activeListings: listings.filter(l => l.status === "published").length,
        totalUsers: users.length,
      });
    });
  }, []);

  const statCards = [
    { label: "Total Revenue", value: stats.revenue, prefix: "₹", icon: IndianRupee, color: "from-primary/20 to-primary/5", iconColor: "text-primary", change: "+12.5%" },
    { label: "Total Bookings", value: stats.bookings, prefix: "", icon: CalendarCheck, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400", change: "+8.2%" },
    { label: "Active Listings", value: stats.activeListings, prefix: "", icon: Eye, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400", change: "+3" },
    { label: "Total Users", value: stats.totalUsers, prefix: "", icon: Users, color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400", change: "+24" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of your operations</p>
      </div>

      {/* AI Command Search */}
      <AdminAISearch />


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border border-border bg-gradient-to-br ${card.color} p-4 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={20} className={card.iconColor} />
              <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-400">
                <ArrowUpRight size={12} /> {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              <AnimatedCounter value={card.value} prefix={card.prefix} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {smartCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className={`${card.bg} rounded-xl p-3 flex items-center gap-3 border border-border`}
          >
            <card.icon size={18} className={card.color} />
            <p className="text-sm text-foreground font-medium">{card.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Live Orders Widget - pinned to top */}
      <LiveOrdersWidget onViewAll={() => onNavigate?.("orders")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BookingHeatmap />
        <LiveActivityFeed />
      </div>

      <WeeklyDigestPreview />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-border bg-card p-4"
      >
        <h3 className="text-sm font-bold text-foreground mb-4">Revenue Trend (14 days)</h3>
        <div className="h-[200px] md:h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270,80%,65%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(270,80%,65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(260,10%,55%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(260,18%,10%)", border: "1px solid hsl(260,15%,16%)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "hsl(0,0%,96%)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(270,80%,65%)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
