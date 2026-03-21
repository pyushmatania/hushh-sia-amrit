import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Sparkles, TrendingUp, Users, IndianRupee,
  Loader2, Maximize2, Minimize2, Zap, Terminal, Cpu, Activity,
  BrainCircuit, Wand2, CircuitBoard, Globe, Database, Shield,
  BarChart3, Layers
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { playAIThinkingSound, playAISuccessSound, playAIActionSound, playAIErrorSound, playAIKeystroke } from "@/lib/ai-sounds";

interface Message {
  role: "user" | "assistant";
  content: string;
  hadActions?: boolean;
  timestamp?: number;
}

const quickPrompts = [
  { icon: IndianRupee, text: "Revenue summary this month", color: "from-emerald-500/20 to-emerald-500/5", accent: "text-emerald-400" },
  { icon: TrendingUp, text: "Top performing property", color: "from-blue-500/20 to-blue-500/5", accent: "text-blue-400" },
  { icon: Users, text: "User growth insights", color: "from-amber-500/20 to-amber-500/5", accent: "text-amber-400" },
  { icon: Zap, text: "Move Coca Cola to top of inventory", color: "from-primary/20 to-primary/5", accent: "text-primary" },
];

const capabilities = [
  { icon: Database, label: "Data Query", desc: "Search across all tables" },
  { icon: Zap, label: "CRUD Actions", desc: "Create, update, delete records" },
  { icon: BarChart3, label: "Analytics", desc: "Revenue & trend analysis" },
  { icon: Shield, label: "Smart Ops", desc: "Reorder, price, inventory" },
];

/* ─── Floating 3D neural orb ─── */
function NeuralOrb({ size = 80 }: { size?: number }) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      {/* Core sphere */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 35%, hsl(270 80% 70% / 0.4), hsl(var(--primary) / 0.15), transparent)",
          boxShadow: "0 0 40px 8px hsl(var(--primary) / 0.1), inset 0 0 20px hsl(270 80% 65% / 0.15)",
        }}
        animate={{
          boxShadow: [
            "0 0 40px 8px hsl(var(--primary) / 0.1), inset 0 0 20px hsl(270 80% 65% / 0.15)",
            "0 0 60px 12px hsl(var(--primary) / 0.18), inset 0 0 30px hsl(270 80% 65% / 0.25)",
            "0 0 40px 8px hsl(var(--primary) / 0.1), inset 0 0 20px hsl(270 80% 65% / 0.15)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Orbit rings */}
      {[0, 60, 120].map((rot, i) => (
        <motion.div
          key={i}
          className="absolute inset-2 rounded-full border border-primary/20"
          style={{ transform: `rotateX(${rot}deg) rotateZ(${i * 30}deg)` }}
          animate={{ rotateZ: [i * 30, i * 30 + 360] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
        />
      ))}
      {/* Orbit dots */}
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
          style={{ top: "50%", left: "50%", transformOrigin: `0 ${size / 2.5}px` }}
          animate={{ rotate: [i * 72, i * 72 + 360], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "linear" }}
        />
      ))}
      {/* Center glow */}
      <motion.div
        className="absolute rounded-full bg-primary/40"
        style={{ width: size * 0.25, height: size * 0.25, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}

/* ─── Neural background with grid + particles ─── */
function NeuralBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />
      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 1.5 + Math.random() * 2,
            height: 1.5 + Math.random() * 2,
            background: "hsl(var(--primary))",
            left: `${5 + i * 8}%`,
            top: `${10 + (i % 4) * 22}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.12), transparent)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ─── Thinking animation — premium ─── */
function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative rounded-2xl border border-primary/20 overflow-hidden max-w-[85%]"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.5))" }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "inset 0 0 20px hsl(var(--primary) / 0.03)",
              "inset 0 0 40px hsl(var(--primary) / 0.08)",
              "inset 0 0 20px hsl(var(--primary) / 0.03)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="px-4 py-3 flex items-center gap-3 relative z-10">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <BrainCircuit size={16} className="text-primary" />
          </motion.div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary font-display">Processing neural query</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-[10px] text-primary/60"
              >●</motion.span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full bg-primary/40"
                  style={{ width: 4 + Math.random() * 14 }}
                  animate={{ opacity: [0.2, 1, 0.2], scaleX: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>
          </div>
        </div>
        <motion.div
          className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}

/* ─── Typewriter ─── */
function TypewriterText({ content, onComplete }: { content: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const chunk = Math.min(i * 3, content.length);
      setDisplayed(content.slice(0, chunk));
      if (chunk >= content.length) { clearInterval(interval); setDone(true); onComplete?.(); }
    }, 12);
    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="relative">
      <SimpleMarkdown content={displayed} />
      {!done && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

export default function AdminAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadContext(); }, []);

  const loadContext = async () => {
    const [bookingsRes, profilesRes, listingsRes, ordersRes] = await Promise.all([
      supabase.from("bookings").select("total, status, date, slot, property_id, created_at"),
      supabase.from("profiles").select("display_name, loyalty_points, tier, created_at"),
      supabase.from("host_listings").select("name, base_price, capacity, status, category, location"),
      supabase.from("orders").select("total, status, created_at"),
    ]);
    const bookings = bookingsRes.data ?? [];
    const profiles = profilesRes.data ?? [];
    const listings = listingsRes.data ?? [];
    const orders = ordersRes.data ?? [];
    setContext({
      summary: {
        totalRevenue: bookings.reduce((s, b) => s + Number(b.total), 0),
        totalBookings: bookings.length,
        totalUsers: profiles.length,
        activeListings: listings.filter(l => l.status === "published").length,
        totalOrders: orders.length,
        orderRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
      },
      bookingsByStatus: bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {} as Record<string, number>),
      topSlots: bookings.reduce((acc, b) => { acc[b.slot] = (acc[b.slot] || 0) + 1; return acc; }, {} as Record<string, number>),
      userTiers: profiles.reduce((acc, p) => { acc[p.tier] = (acc[p.tier] || 0) + 1; return acc; }, {} as Record<string, number>),
      listings: listings.map(l => ({ name: l.name, price: l.base_price, category: l.category, status: l.status })),
      recentBookings: bookings.slice(0, 20).map(b => ({ total: b.total, status: b.status, date: b.date, slot: b.slot, property: b.property_id })),
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

      if (data.actions_performed) {
        playAIActionSound();
      } else {
        playAISuccessSound();
      }

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
    } catch (e) {
      playAIErrorSound();
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to connect to AI. Try again.", timestamp: Date.now() }]);
    }
    setLoading(false);
  }, [messages, loading, context]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(270 80% 65% / 0.15))" }}
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0)",
                "0 0 24px 6px hsl(var(--primary) / 0.15)",
                "0 0 0 0 hsl(var(--primary) / 0)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BrainCircuit size={22} className="text-primary relative z-10" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2 font-display">
              Neural Engine
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full border border-primary/20 font-mono"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(270 80% 65% / 0.05))", color: "hsl(var(--primary))" }}>
                v3.0
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span>Online</span>
              <span className="text-muted-foreground/40">·</span>
              <span>Full CRUD + Analytics</span>
            </p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl hover:bg-secondary transition active:scale-95 border border-border/50">
          {expanded ? <Minimize2 size={18} className="text-muted-foreground" /> : <Maximize2 size={18} className="text-muted-foreground" />}
        </button>
      </div>

      {/* Empty state — premium hero */}
      {messages.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Hero card */}
          <div className="relative rounded-2xl border border-primary/15 overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.04))" }}>
            <NeuralBackground />
            <div className="relative z-10 p-8 flex flex-col items-center text-center">
              <NeuralOrb size={72} />
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-foreground mt-5 mb-1.5 font-display"
              >
                Hushh Neural Engine
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed"
              >
                Your AI-powered command center. Ask questions, analyze data, or{" "}
                <strong className="text-foreground">execute actions directly</strong>.
              </motion.p>

              {/* Capability pills */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-2 mt-4"
              >
                {capabilities.map((cap, i) => (
                  <motion.div
                    key={cap.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-center gap-1.5 text-[9px] px-2.5 py-1.5 rounded-lg border border-border/60 bg-secondary/30"
                  >
                    <cap.icon size={10} className="text-primary/60" />
                    <span className="text-muted-foreground font-medium">{cap.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((qp, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(qp.text)}
                className={`group relative rounded-xl border border-border bg-gradient-to-br ${qp.color} p-3.5 text-left hover:border-primary/30 transition-all overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <qp.icon size={16} className={`${qp.accent} shrink-0 mb-1.5 relative z-10`} />
                <span className="text-[11px] font-medium text-foreground relative z-10 block leading-tight">{qp.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div
          ref={scrollRef}
          className={`rounded-2xl border border-border/60 overflow-y-auto transition-all relative ${expanded ? "h-[60vh]" : "h-[45vh]"}`}
          style={{ background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--background) / 0.5))" }}
        >
          <NeuralBackground />
          <div className="p-4 space-y-4 relative z-10">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <motion.div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 shrink-0 mt-1"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(270 80% 65% / 0.06))" }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <Bot size={13} className="text-primary" />
                  </motion.div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "text-primary-foreground shadow-lg"
                    : "border border-border/60 shadow-sm"
                }`}
                style={msg.role === "user"
                  ? { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(270 80% 60%))", boxShadow: "0 4px 20px -4px hsl(var(--primary) / 0.3)" }
                  : { background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.5))" }
                }
                >
                  {msg.role === "assistant" ? (
                    <div>
                      {msg.hadActions && (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit"
                        >
                          <Zap size={10} />
                          <span>Actions executed successfully</span>
                        </motion.div>
                      )}
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-foreground text-foreground/90 leading-relaxed font-display"
                        style={{ fontSize: "12.5px" }}>
                        {i === messages.length - 1 && msg.role === "assistant" ? (
                          <TypewriterText content={msg.content} />
                        ) : (
                          <SimpleMarkdown content={msg.content} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="font-display">{msg.content}</span>
                  )}
                  {msg.timestamp && (
                    <p className="text-[8px] text-muted-foreground/50 mt-1.5 text-right tabular-nums font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && <ThinkingIndicator />}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="flex gap-2 relative">
          <div className="relative flex-1">
            <motion.div
              className="absolute -inset-px rounded-xl pointer-events-none"
              animate={loading ? {
                boxShadow: [
                  "0 0 0 1px hsl(var(--primary) / 0.1)",
                  "0 0 10px 2px hsl(var(--primary) / 0.12)",
                  "0 0 0 1px hsl(var(--primary) / 0.1)",
                ],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <Terminal size={14} className="text-primary/40" />
            </div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask or command: 'Analyze weekend trends'..."
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition font-display"
              disabled={loading}
            />
          </div>
          <motion.button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            whileTap={{ scale: 0.93 }}
            className="px-4 rounded-xl text-primary-foreground disabled:opacity-40 transition overflow-hidden"
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
            <Sparkles size={8} /> Neural Engine v3.0
          </p>
          <p className="text-[9px] text-muted-foreground/40 font-mono">
            Enter ↵
          </p>
        </div>
      </div>
    </div>
  );
}

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="font-bold mt-2">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={i} className="font-bold mt-2">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="font-bold mt-2">{line.slice(2)}</h1>;
        if (line.startsWith("- ")) return <li key={i} className="ml-4 list-disc">{formatInline(line.slice(2))}</li>;
        if (line.startsWith("* ")) return <li key={i} className="ml-4 list-disc">{formatInline(line.slice(2))}</li>;
        if (line.trim() === "") return <br key={i} />;
        return <p key={i}>{formatInline(line)}</p>;
      })}
    </>
  );
}

function formatInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}
