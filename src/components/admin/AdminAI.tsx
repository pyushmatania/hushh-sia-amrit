import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bot, Send, Sparkles, TrendingUp, Users, IndianRupee,
  CalendarCheck, Loader2, Maximize2, Minimize2, Zap, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  hadActions?: boolean;
}

const quickPrompts = [
  { icon: IndianRupee, text: "Revenue summary this month" },
  { icon: TrendingUp, text: "Top performing property" },
  { icon: Users, text: "User growth insights" },
  { icon: Zap, text: "Move Coca Cola to top of inventory" },
];

export default function AdminAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContext();
  }, []);

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
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

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
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${err.error || "Something went wrong"}` }]);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content || "Done!",
        hadActions: data.actions_performed,
      }]);

      // If AI performed actions, notify the app to refresh data
      if (data.actions_performed) {
        window.dispatchEvent(new Event("hushh:listings-updated"));
        loadContext(); // refresh AI context too
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Failed to connect to AI. Try again." }]);
    }
    setLoading(false);
  }, [messages, loading, context]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot size={22} className="text-primary" /> AI Command Center
          </h1>
          <p className="text-sm text-muted-foreground">Ask anything or tell me to do things</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg hover:bg-secondary transition">
          {expanded ? <Minimize2 size={18} className="text-muted-foreground" /> : <Maximize2 size={18} className="text-muted-foreground" />}
        </button>
      </div>

      {messages.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={24} className="text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Hushh AI Assistant</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Ask questions <strong>or give commands</strong> — I can reorder items, update prices, toggle availability, add/remove items, and more.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((qp, i) => (
              <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }} whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(qp.text)}
                className="rounded-xl border border-border bg-card p-3 text-left hover:bg-secondary transition flex items-center gap-2">
                <qp.icon size={16} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">{qp.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {messages.length > 0 && (
        <div ref={scrollRef}
          className={`rounded-2xl border border-border bg-card overflow-y-auto ${expanded ? "h-[60vh]" : "h-[40vh]"} transition-all`}>
          <div className="p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user" ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}>
                  {msg.role === "assistant" ? (
                    <div>
                      {msg.hadActions && (
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg w-fit">
                          <Zap size={10} /> Actions executed
                        </div>
                      )}
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_strong]:text-foreground">
                        <SimpleMarkdown content={msg.content} />
                      </div>
                    </div>
                  ) : msg.content}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking & executing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Ask or command: 'Move Coca Cola to top'..."
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={loading} />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
          className="px-4 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 transition">
          <Send size={18} />
        </button>
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
