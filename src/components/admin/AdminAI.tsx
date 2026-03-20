import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, Sparkles, TrendingUp, Users, IndianRupee,
  Loader2, Maximize2, Minimize2, Zap, Terminal, Cpu, Activity,
  BrainCircuit, Wand2, CircuitBoard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { playAIThinkingSound, playAISuccessSound, playAIActionSound, playAIErrorSound } from "@/lib/ai-sounds";

interface Message {
  role: "user" | "assistant";
  content: string;
  hadActions?: boolean;
  timestamp?: number;
}

const quickPrompts = [
  { icon: IndianRupee, text: "Revenue summary this month", gradient: "from-emerald-500/20 to-emerald-500/5" },
  { icon: TrendingUp, text: "Top performing property", gradient: "from-blue-500/20 to-blue-500/5" },
  { icon: Users, text: "User growth insights", gradient: "from-amber-500/20 to-amber-500/5" },
  { icon: Zap, text: "Move Coca Cola to top of inventory", gradient: "from-primary/20 to-primary/5" },
];

/* ─── Animated neural network background ─── */
function NeuralBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2,
            height: 2,
            background: "hsl(var(--primary))",
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
            boxShadow: [
              "0 0 4px hsl(var(--primary) / 0.3)",
              "0 0 12px hsl(var(--primary) / 0.6)",
              "0 0 4px hsl(var(--primary) / 0.3)",
            ],
          }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), transparent)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ─── Thinking animation ─── */
function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative rounded-2xl border border-primary/20 overflow-hidden max-w-[85%]"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.5))" }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "inset 0 0 20px hsl(var(--primary) / 0.05)",
              "inset 0 0 30px hsl(var(--primary) / 0.12)",
              "inset 0 0 20px hsl(var(--primary) / 0.05)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="px-4 py-3 flex items-center gap-3 relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <BrainCircuit size={16} className="text-primary" />
          </motion.div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">Processing neural query</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-[10px] text-primary/60"
              >
                ●
              </motion.span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full bg-primary/40"
                  style={{ width: 8 + Math.random() * 16 }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scaleX: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}

/* ─── Typewriter effect for AI responses ─── */
function TypewriterText({ content, onComplete }: { content: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      // Show 2-4 chars at a time for speed
      const chunk = Math.min(i * 3, content.length);
      setDisplayed(content.slice(0, chunk));
      if (chunk >= content.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
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
            className="relative w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(270 80% 65% / 0.15))" }}
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0)",
                "0 0 20px 4px hsl(var(--primary) / 0.15)",
                "0 0 0 0 hsl(var(--primary) / 0)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <CircuitBoard size={20} className="text-primary" />
            <motion.div
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Neural Command
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                v2.0
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Activity size={10} className="text-emerald-400" />
              <span>Online</span>
              <span className="text-muted-foreground/40">•</span>
              <span>Ask anything or execute commands</span>
            </p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-secondary transition active:scale-95">
          {expanded ? <Minimize2 size={18} className="text-muted-foreground" /> : <Maximize2 size={18} className="text-muted-foreground" />}
        </button>
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="relative rounded-2xl border border-primary/15 overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.04))" }}>
            <NeuralBackground />
            <div className="relative z-10 p-8 text-center">
              <motion.div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(270 80% 65% / 0.1))" }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 hsl(var(--primary) / 0)",
                    "0 0 30px 8px hsl(var(--primary) / 0.1)",
                    "0 0 0 0 hsl(var(--primary) / 0)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Wand2 size={28} className="text-primary" />
              </motion.div>
              <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Hushh Neural Engine
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Natural language interface for your business operations.
                Ask questions, analyze data, or <strong className="text-foreground">execute actions directly</strong>.
              </p>
              <div className="flex items-center justify-center gap-4 mt-4 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><Cpu size={10} className="text-primary/60" /> Analytics</span>
                <span className="flex items-center gap-1"><Zap size={10} className="text-amber-400/60" /> Actions</span>
                <span className="flex items-center gap-1"><Terminal size={10} className="text-emerald-400/60" /> CRUD</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((qp, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(qp.text)}
                className={`group relative rounded-xl border border-border bg-gradient-to-br ${qp.gradient} p-3.5 text-left hover:border-primary/30 transition-all overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <qp.icon size={16} className="text-primary shrink-0 mb-1.5 relative z-10" />
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
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                    <Bot size={12} className="text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/10"
                    : "border border-border/60 shadow-sm"
                }`}
                style={msg.role === "assistant" ? { background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--secondary) / 0.5))" } : undefined}
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
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-foreground text-foreground/90 leading-relaxed"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "12.5px" }}>
                        {i === messages.length - 1 && msg.role === "assistant" ? (
                          <TypewriterText content={msg.content} />
                        ) : (
                          <SimpleMarkdown content={msg.content} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{msg.content}</span>
                  )}
                  {msg.timestamp && (
                    <p className="text-[8px] text-muted-foreground/50 mt-1.5 text-right tabular-nums">
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
                  "0 0 8px 1px hsl(var(--primary) / 0.15)",
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
              className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              disabled={loading}
            />
          </div>
          <motion.button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            whileTap={{ scale: 0.93 }}
            className="px-4 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground disabled:opacity-40 transition shadow-lg shadow-primary/10 hover:shadow-primary/20"
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
          <p className="text-[9px] text-muted-foreground/40 flex items-center gap-1">
            <Sparkles size={8} /> Powered by Hushh Neural Engine
          </p>
          <p className="text-[9px] text-muted-foreground/40">
            Press Enter to send
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
