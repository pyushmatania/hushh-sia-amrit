import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Mic, X, Sparkles, Activity, Copy, Check, Wand2,
  ChevronDown, ArrowRight, IndianRupee, Calendar, Users, Package,
  Star, FileText, Megaphone, ClipboardList, BarChart3, CreditCard,
  Shield, Settings, Truck, TrendingUp, Target, Globe, Bot,
  HelpCircle,
} from "lucide-react";
import { playAIThinkingSound, playAISuccessSound, playAIErrorSound } from "@/lib/ai-sounds";
import HushhBot from "./HushhBot";

/* ─── Context-aware example categories ─── */
interface ExampleItem { text: string; desc: string }
interface ExampleCategory { id: string; label: string; icon: typeof IndianRupee; color: string; examples: ExampleItem[] }

const ALL_CATEGORIES: ExampleCategory[] = [
  {
    id: "revenue", label: "Revenue & Finance", icon: IndianRupee, color: "text-emerald-500",
    examples: [
      { text: "Revenue summary this month", desc: "Total earnings, breakdowns by property" },
      { text: "Compare this week vs last week revenue", desc: "Trend analysis with % change" },
      { text: "What was our best earning day?", desc: "Peak revenue day with details" },
      { text: "Show average booking value by property", desc: "Per-property pricing insights" },
      { text: "List all refunds processed this month", desc: "Refund amounts and reasons" },
      { text: "Revenue forecast for next week", desc: "AI-predicted earnings estimate" },
      { text: "Show payment method distribution", desc: "UPI vs card vs cash breakdown" },
      { text: "Which day of the week earns the most?", desc: "Day-wise revenue patterns" },
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
      { text: "Average group size per booking", desc: "Guest count insights" },
      { text: "Bookings with extra mattresses", desc: "Add-on demand analysis" },
      { text: "Peak booking hours analysis", desc: "When do most bookings happen?" },
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
      { text: "Guests who haven't visited in 30 days", desc: "Re-engagement targets" },
      { text: "Average customer lifetime value", desc: "LTV calculation across tiers" },
      { text: "Compare spending: Gold vs Platinum", desc: "Tier-wise revenue contribution" },
    ],
  },
  {
    id: "inventory", label: "Inventory & Menu", icon: Package, color: "text-orange-500",
    examples: [
      { text: "Low stock inventory alerts", desc: "Items below threshold" },
      { text: "Most ordered items this week", desc: "Popular menu items" },
      { text: "Update price of Chai to ₹30", desc: "Quick price adjustments" },
      { text: "Add new item: Mango Lassi at ₹60", desc: "Create inventory items" },
      { text: "Move Coca Cola to top of inventory", desc: "Reorder items instantly" },
      { text: "Show items never ordered", desc: "Dead stock identification" },
      { text: "Category-wise inventory breakdown", desc: "Drinks, food, snacks summary" },
      { text: "Items with highest profit margin", desc: "Revenue per item analysis" },
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
      { text: "Property utilization rate", desc: "Slots filled vs available" },
      { text: "Compare properties by revenue per guest", desc: "Efficiency metrics" },
      { text: "Show property amenity popularity", desc: "Which amenities attract more bookings" },
    ],
  },
  {
    id: "reviews", label: "Reviews & Feedback", icon: FileText, color: "text-violet-500",
    examples: [
      { text: "Find all 5-star reviews from last week", desc: "Positive feedback highlights" },
      { text: "Show negative reviews needing response", desc: "Reputation management" },
      { text: "Average rating by property", desc: "Quality benchmarks" },
      { text: "Most common feedback themes", desc: "Sentiment analysis" },
      { text: "Reviews mentioning food quality", desc: "Keyword-based filtering" },
      { text: "Response rate to negative reviews", desc: "Engagement tracking" },
    ],
  },
  {
    id: "marketing", label: "Marketing & Coupons", icon: Megaphone, color: "text-rose-500",
    examples: [
      { text: "Create a 15% off coupon for weekends", desc: "Generate promo codes" },
      { text: "Show active campaigns", desc: "Current promotions" },
      { text: "Which coupon has the most uses?", desc: "Campaign effectiveness" },
      { text: "Create a new promotional campaign", desc: "Marketing automation" },
      { text: "Show referral program performance", desc: "Codes used, users acquired" },
      { text: "Best performing discount type", desc: "Flat vs percentage analysis" },
    ],
  },
  {
    id: "staff", label: "Staff & Operations", icon: ClipboardList, color: "text-cyan-500",
    examples: [
      { text: "Show pending staff tasks", desc: "Unfinished work items" },
      { text: "Staff attendance today", desc: "Who's checked in" },
      { text: "Assign cleaning task to morning shift", desc: "Task delegation" },
      { text: "Show overtime hours this month", desc: "Labor cost tracking" },
      { text: "Pending leave requests", desc: "Approval queue" },
      { text: "Staff salary status this month", desc: "Payment tracking" },
    ],
  },
  {
    id: "analytics", label: "Analytics & Trends", icon: BarChart3, color: "text-indigo-500",
    examples: [
      { text: "Weekly booking trends", desc: "7-day rolling analysis" },
      { text: "Revenue growth rate month over month", desc: "Growth trajectory" },
      { text: "Customer acquisition funnel", desc: "Signup → First booking rate" },
      { text: "Seasonal demand patterns", desc: "Which months are busiest?" },
      { text: "Average time between repeat bookings", desc: "Customer retention cycle" },
      { text: "Year-to-date performance summary", desc: "Comprehensive business overview" },
    ],
  },
  {
    id: "payments", label: "Payments & Billing", icon: CreditCard, color: "text-teal-500",
    examples: [
      { text: "Pending payment collections", desc: "Outstanding amounts" },
      { text: "Show all split payments", desc: "Group payment tracking" },
      { text: "Failed payment attempts today", desc: "Payment issues" },
      { text: "Average payment processing time", desc: "Checkout speed metrics" },
      { text: "Total refunds issued this month", desc: "Refund volume and amount" },
    ],
  },
  {
    id: "automation", label: "Automation & Actions", icon: Settings, color: "text-gray-500",
    examples: [
      { text: "Run low stock check", desc: "Scan inventory and alert" },
      { text: "Auto-assign orders to available staff", desc: "Smart task routing" },
      { text: "Generate weekly digest email", desc: "Automated reporting" },
      { text: "Update all expired coupons to inactive", desc: "Bulk cleanup" },
      { text: "Send reminder to unverified guests", desc: "Engagement automation" },
    ],
  },
];

/* ─── Context-to-category mapping ─── */
const CONTEXT_CATEGORY_MAP: Record<string, string[]> = {
  clients: ["guests", "analytics", "payments"],
  bookings: ["bookings", "revenue", "properties"],
  orders: ["inventory", "staff", "revenue"],
  inventory: ["inventory", "automation", "analytics"],
  properties: ["properties", "bookings", "reviews"],
  reviews: ["reviews", "properties", "guests"],
  campaigns: ["marketing", "analytics", "guests"],
  coupons: ["marketing", "revenue", "analytics"],
  staff: ["staff", "automation", "payments"],
  analytics: ["analytics", "revenue", "bookings"],
  finance: ["revenue", "payments", "analytics"],
  dashboard: ["revenue", "bookings", "guests", "inventory"],
  settings: ["automation", "staff", "properties"],
  loyalty: ["guests", "marketing", "analytics"],
};

function getContextCategories(contextKey?: string): ExampleCategory[] {
  if (!contextKey) return ALL_CATEGORIES.slice(0, 4);
  const ids = CONTEXT_CATEGORY_MAP[contextKey] || [];
  const matched = ids.map(id => ALL_CATEGORIES.find(c => c.id === id)).filter(Boolean) as ExampleCategory[];
  return matched.length > 0 ? matched : ALL_CATEGORIES.slice(0, 3);
}

/* ─── Floating particles ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-primary/8"
          style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2, left: `${10 + (i * 14) % 80}%`, top: `${15 + (i * 19) % 55}%` }}
          animate={{ y: [0, -15 - i * 4, 0], opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, delay: i * 0.4 }} />
      ))}
    </div>
  );
}

/* ─── Thinking ─── */
function ThinkingPulse() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mx-4 mb-4">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/15 bg-primary/5 relative overflow-hidden">
        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
        <HushhBot size={32} state="thinking" />
        <div className="flex-1 relative z-10">
          <span className="text-[11px] font-semibold text-primary">Analyzing...</span>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div key={i} className="h-1 rounded-full bg-primary/30" style={{ width: 6 + Math.random() * 12 }}
                animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.5, 1, 0.5] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Typewriter ─── */
function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let idx = 0; setDisplayed(""); setDone(false);
    const iv = setInterval(() => { idx++; setDisplayed(text.slice(0, idx)); if (idx >= text.length) { clearInterval(iv); setDone(true); } }, 12);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{displayed}{!done && <motion.span className="inline-block w-[2px] h-[1em] bg-primary/60 ml-0.5 align-text-bottom" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />}</span>;
}

/* ─── Rich answer ─── */
function AnswerCard({ content, onDismiss }: { content: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="border-t border-primary/10 overflow-hidden">
      <div className="p-4 bg-gradient-to-br from-primary/[0.03] to-card relative">
        <div className="flex items-start gap-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
            <HushhBot size={36} state="speaking" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <MarkdownRender content={content} />
          </div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
          <button onClick={onDismiss} className="text-[10px] text-muted-foreground/50 hover:text-foreground transition flex items-center gap-1"><X size={9} /> Dismiss</button>
          <div className="flex items-center gap-3">
            <button onClick={copy} className="text-[10px] text-muted-foreground/50 hover:text-primary transition flex items-center gap-1">
              {copied ? <Check size={9} className="text-emerald-400" /> : <Copy size={9} />} {copied ? "Copied" : "Copy"}
            </button>
            <span className="text-[8px] text-muted-foreground/30 flex items-center gap-1 font-mono"><Wand2 size={7} /> Hushh AI</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Markdown ─── */
function MarkdownRender({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="text-xs text-foreground leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-sm mt-2 text-foreground">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-sm mt-2 text-foreground">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="font-bold mt-2 text-foreground">{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 list-disc text-foreground/80">{formatInline(line.slice(2))}</li>;
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-foreground/80">{formatInline(line.replace(/^\d+\.\s/, ""))}</li>;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-foreground/85">{formatInline(line)}</p>;
      })}
    </div>
  );
}

function formatInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    return part;
  });
}

/* ─── Voice wave ─── */
function VoiceWave() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-[3px] h-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div key={i} className="w-[3px] rounded-full bg-red-400" animate={{ height: [6, 14 + i * 2, 6] }} transition={{ duration: 0.35 + i * 0.04, repeat: Infinity, delay: i * 0.05 }} />
      ))}
    </motion.div>
  );
}

/* ─── Collapsible Category ─── */
function CategoryRow({ cat, onSend, onFill }: { cat: ExampleCategory; onSend: (t: string) => void; onFill: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? cat.examples : cat.examples.slice(0, 3);

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-secondary/20 transition-colors">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-secondary/60 ${cat.color}`}>
          <cat.icon size={13} />
        </div>
        <span className="text-[11px] font-semibold text-foreground flex-1">{cat.label}</span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums mr-1">{cat.examples.length}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} className="text-muted-foreground/40" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-0.5">
              {visible.map((ex, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                  className="group flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => onFill(ex.text)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground/85 truncate">{ex.text}</p>
                    <p className="text-[9px] text-muted-foreground/50 truncate">{ex.desc}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onSend(ex.text); }} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <ArrowRight size={11} className="text-primary" />
                  </button>
                </motion.div>
              ))}
              {cat.examples.length > 3 && (
                <button onClick={() => setShowAll(!showAll)} className="text-[10px] text-primary font-medium px-2.5 py-1 flex items-center gap-1 hover:underline">
                  {showAll ? "Show less" : `+${cat.examples.length - 3} more`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Widget ─── */
interface NeuralSearchWidgetProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  examples?: string[];
  onSearch: (query: string) => Promise<string>;
  compact?: boolean;
  /** Context key for page-specific examples: "clients", "bookings", "orders", etc. */
  contextKey?: string;
}

export default function NeuralSearchWidget({
  title = "Hushh AI",
  subtitle,
  placeholder = "Ask anything about your data...",
  examples,
  onSearch,
  compact = false,
  contextKey,
}: NeuralSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const contextCategories = getContextCategories(contextKey);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true); setAnswer(null);
    playAIThinkingSound();
    try { const result = await onSearch(query); playAISuccessSound(); setAnswer(result); }
    catch { playAIErrorSound(); setAnswer("Sorry, couldn't process the query. Try again."); }
    finally { setLoading(false); }
  };

  const startHold = useCallback(() => {
    setIsHolding(true);
    if ("vibrate" in navigator) navigator.vibrate(30);
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const r = new SR(); r.lang = "en-IN"; r.continuous = false; r.interimResults = false;
      r.onresult = (e: any) => { setQuery(e.results[0][0].transcript); setIsHolding(false); };
      r.onerror = () => setIsHolding(false); r.onend = () => setIsHolding(false);
      r.start(); (window as any).__hushhRecog = r;
    }
  }, []);

  const stopHold = useCallback(() => { setIsHolding(false); if ((window as any).__hushhRecog) (window as any).__hushhRecog.stop(); }, []);

  const botState = loading ? "thinking" : isHolding ? "listening" : answer ? "success" : "idle";

  // Merge legacy examples with context categories for chips
  const chipExamples = examples || contextCategories[0]?.examples.slice(0, 5).map(e => e.text) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", damping: 25 }}
      className="relative rounded-2xl border border-border/60 overflow-hidden transition-all duration-300 bg-card"
      style={{ boxShadow: focused ? "0 0 24px -4px hsl(var(--primary) / 0.12)" : "0 2px 12px -4px hsl(var(--foreground) / 0.06)" }}>
      <FloatingParticles />

      <div className={`${compact ? "p-3" : "p-4"} relative z-10`}>
        {/* Avatar + Title */}
        <div className="flex flex-col items-center mb-3">
          <motion.div whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }} transition={{ duration: 0.4 }}>
            <HushhBot size={compact ? 52 : 64} state={botState} />
          </motion.div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mt-1">
            {title}
            <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Activity size={7} /> Live
            </motion.span>
          </h3>
          {subtitle && <p className="text-[9px] text-muted-foreground mt-0.5 text-center">{subtitle}</p>}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input placeholder={placeholder} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              className="w-full pl-3 pr-3 h-10 rounded-xl text-xs border border-border/60 bg-background/60 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition" />
          </div>
          <motion.button onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${isHolding ? "bg-red-500/15 border-red-400/30 text-red-400" : "bg-secondary/50 border-border/60 text-muted-foreground hover:text-primary"}`}>
            <AnimatePresence mode="wait">
              {isHolding ? <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><VoiceWave /></motion.div> : <Mic size={16} />}
            </AnimatePresence>
          </motion.button>
          <motion.button onClick={handleSearch} disabled={loading || !query.trim()} whileTap={{ scale: 0.93 }}
            className="px-4 h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </motion.button>
        </div>

        {/* Quick example chips */}
        {!answer && (
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
            {chipExamples.slice(0, 5).map((eq, i) => (
              <motion.button key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03 }}
                whileTap={{ scale: 0.95 }} onClick={() => setQuery(eq)}
                className="text-[9px] px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition">
                {eq}
              </motion.button>
            ))}
          </div>
        )}

        {/* Context-aware categories */}
        {!answer && !loading && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                {contextKey ? `${contextKey.charAt(0).toUpperCase() + contextKey.slice(1)} insights` : "Browse examples"}
              </p>
              <button onClick={() => setShowAllCategories(!showAllCategories)} className="text-[9px] text-primary font-medium flex items-center gap-0.5">
                {showAllCategories ? "Show less" : "All categories"} <ChevronDown size={9} className={showAllCategories ? "rotate-180" : ""} />
              </button>
            </div>
            {(showAllCategories ? ALL_CATEGORIES : contextCategories).map(cat => (
              <CategoryRow key={cat.id} cat={cat} onSend={(t) => { setQuery(t); setTimeout(() => handleSearch(), 100); }} onFill={setQuery} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>{loading && <ThinkingPulse />}</AnimatePresence>
      <AnimatePresence>{answer && !loading && <AnswerCard content={answer} onDismiss={() => setAnswer(null)} />}</AnimatePresence>
    </motion.div>
  );
}

export { ALL_CATEGORIES, type ExampleCategory };
