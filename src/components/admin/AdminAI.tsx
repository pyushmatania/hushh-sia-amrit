import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Zap, Maximize2, Minimize2, Sparkles,
  IndianRupee, TrendingUp, Users, Database, BarChart3, Shield,
  Copy, Check, Mic, RefreshCw, Trash2, Clock, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { playAIThinkingSound, playAISuccessSound, playAIActionSound, playAIErrorSound } from "@/lib/ai-sounds";
import HushhBot from "./HushhBot";

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

/* ─── Thinking indicator ─── */
function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-2.5 max-w-[85%]"
      >
        <HushhBot size={32} state="thinking" />
        <div className="rounded-2xl border border-primary/15 px-4 py-3 bg-primary/[0.04]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-primary font-display">Thinking...</span>
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
      </motion.div>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mr-2 shrink-0 mt-1">
          <HushhBot size={30} state={msg.hadActions ? "success" : "idle"} />
        </div>
      )}
      <div className={`max-w-[82%] ${isUser ? "" : ""}`}>
        <div
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
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit"
            >
              <Zap size={10} /> Actions executed
            </motion.div>
          )}

          {isUser ? (
            <span className="text-sm font-display">{msg.content}</span>
          ) : (
            <div className="text-xs leading-relaxed space-y-1 font-display">
              <RichMarkdown content={msg.content} />
            </div>
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
        </div>
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
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadContext(); }, []);

  const loadContext = async () => {
    const [bookingsRes, profilesRes, listingsRes, ordersRes] = await Promise.all([
      supabase.from("bookings").select("total, status, date, slot, property_id, created_at"),
      supabase.from("profiles").select("display_name, loyalty_points, tier, created_at"),
      supabase.from("host_listings").select("name, base_price, capacity, status, category, location"),
      supabase.from("orders").select("total, status, created_at"),
    ]);
    setContext({
      summary: {
        totalRevenue: (bookingsRes.data ?? []).reduce((s, b) => s + Number(b.total), 0),
        totalBookings: (bookingsRes.data ?? []).length,
        totalUsers: (profilesRes.data ?? []).length,
        activeListings: (listingsRes.data ?? []).filter(l => l.status === "published").length,
        totalOrders: (ordersRes.data ?? []).length,
        orderRevenue: (ordersRes.data ?? []).reduce((s, o) => s + Number(o.total), 0),
      },
      listings: (listingsRes.data ?? []).map(l => ({ name: l.name, price: l.base_price, category: l.category, status: l.status })),
      recentBookings: (bookingsRes.data ?? []).slice(0, 20).map(b => ({ total: b.total, status: b.status, date: b.date, slot: b.slot, property: b.property_id })),
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HushhBot size={48} state={botState} />
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2 font-display">
              Hushh AI Assistant
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Online</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Ask questions, analyze data, or execute actions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-2 rounded-xl hover:bg-secondary transition active:scale-95 border border-border/50">
              <Trash2 size={16} className="text-muted-foreground" />
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl hover:bg-secondary transition active:scale-95 border border-border/50">
            {expanded ? <Minimize2 size={16} className="text-muted-foreground" /> : <Maximize2 size={16} className="text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Hero */}
          <div className="relative rounded-2xl border border-primary/15 overflow-hidden p-6 text-center"
            style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.06))" }}>
            <div className="flex justify-center mb-4">
              <HushhBot size={72} state="idle" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1 font-display">
              Hello! How can I help you today?
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              I can query your data, generate analytics, manage inventory, and execute actions — all through natural language.
            </p>

            {/* Capabilities */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center gap-2 text-left p-2.5 rounded-xl border border-border/50 bg-secondary/20"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cap.color}`}>
                    <cap.icon size={13} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-foreground block">{cap.label}</span>
                    <span className="text-[8px] text-muted-foreground">{cap.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick prompts */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Try asking</p>
            <div className="grid grid-cols-2 gap-2">
              {quickPrompts.map((qp, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(qp.text)}
                  className={`group relative rounded-xl border border-border/60 bg-gradient-to-br ${qp.color} p-3 text-left hover:border-primary/30 transition-all`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{qp.emoji}</span>
                    <qp.icon size={12} className={qp.accent} />
                  </div>
                  <span className="text-[10px] font-medium text-foreground block leading-tight">{qp.text}</span>
                  <ArrowRight size={10} className="absolute bottom-2.5 right-2.5 text-muted-foreground/30 group-hover:text-primary/50 transition" />
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
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

      {/* Chat area */}
      {messages.length > 0 && (
        <div
          ref={scrollRef}
          className={`rounded-2xl border border-border/50 overflow-y-auto transition-all relative ${expanded ? "h-[60vh]" : "h-[45vh]"}`}
          style={{ background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--background) / 0.5))" }}
        >
          <div className="p-4 space-y-4">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1} />
            ))}
            {loading && <ThinkingIndicator />}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="relative">
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
          {/* Voice */}
          <motion.button
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            whileTap={{ scale: 0.9 }}
            className={`relative w-11 h-11 rounded-xl flex items-center justify-center border transition ${
              isHolding
                ? "bg-red-500/20 border-red-400/40 text-red-400"
                : "bg-secondary/50 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30"
            }`}
          >
            <Mic size={18} />
            {isHolding && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-red-400/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.button>
          {/* Send */}
          <motion.button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            whileTap={{ scale: 0.93 }}
            className="px-4 h-11 rounded-xl text-primary-foreground disabled:opacity-40 transition overflow-hidden flex items-center"
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
              <Send size={18} />
            )}
          </motion.button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[9px] text-muted-foreground/40 flex items-center gap-1 font-mono">
            <Sparkles size={8} /> Hushh AI · Hold 🎤 to speak
          </p>
          <p className="text-[9px] text-muted-foreground/40 font-mono">Enter ↵</p>
        </div>
      </div>
    </div>
  );
}
