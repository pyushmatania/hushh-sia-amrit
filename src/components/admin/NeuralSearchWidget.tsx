import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Sparkles, BrainCircuit, Terminal, Activity,
  CircuitBoard, Bot, Cpu, Zap, X
} from "lucide-react";
import { playAIThinkingSound, playAISuccessSound, playAIErrorSound, playAIKeystroke } from "@/lib/ai-sounds";

/* ─── Orbiting dots around icon ─── */
function OrbitDots() {
  return (
    <div className="absolute inset-0">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          style={{ top: "50%", left: "50%", transformOrigin: "0 0" }}
          animate={{
            rotate: [i * 120, i * 120 + 360],
            x: [12, 12],
            y: [-1, -1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
        />
      ))}
    </div>
  );
}

/* ─── Scan line ─── */
function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none z-0"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), transparent)" }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ─── Neural thinking ─── */
function NeuralThinking() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      className="relative border border-primary/20 rounded-xl overflow-hidden mx-4 mb-4"
      style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--card)))" }}
    >
      <div className="p-4 flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <BrainCircuit size={16} className="text-primary" />
        </motion.div>
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary font-display">Analyzing data streams</span>
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
          {/* Data stream bars */}
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <motion.div
                key={i}
                className="h-1 rounded-full bg-primary/30"
                style={{ width: 4 + Math.random() * 16 }}
                animate={{ opacity: [0.2, 0.9, 0.2], scaleX: [0.5, 1, 0.5] }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.06 }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {["Querying", "Processing", "Reasoning"].map((step, i) => (
            <motion.span
              key={step}
              className="text-[7px] font-mono text-primary/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
            >
              {step}...
            </motion.span>
          ))}
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

/* ─── Typewriter answer ─── */
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
      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-display">
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

/* ─── Main Neural Search Widget ─── */
interface NeuralSearchWidgetProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  examples: string[];
  onSearch: (query: string) => Promise<string>;
  compact?: boolean;
}

export default function NeuralSearchWidget({
  title = "Neural Search",
  subtitle,
  placeholder = "Query: revenue trends, guest patterns...",
  examples,
  onSearch,
  compact = false,
}: NeuralSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setAnswer(null);
    playAIThinkingSound();
    try {
      const result = await onSearch(query);
      playAISuccessSound();
      setAnswer(result);
    } catch {
      playAIErrorSound();
      setAnswer("Sorry, couldn't process the query. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative rounded-2xl border border-primary/15 overflow-hidden transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.03))",
        boxShadow: focused ? "0 0 24px -4px hsl(var(--primary) / 0.12)" : "none",
      }}
    >
      <ScanLine />

      <div className={`${compact ? "p-3" : "p-4"} relative z-10`}>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <motion.div
            className="relative w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(270 80% 65% / 0.1))" }}
            animate={{
              boxShadow: [
                "0 0 0 0 hsl(var(--primary) / 0)",
                "0 0 14px 3px hsl(var(--primary) / 0.12)",
                "0 0 0 0 hsl(var(--primary) / 0)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <OrbitDots />
            <CircuitBoard size={15} className="text-primary relative z-10" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-display">
              {title}
              <span className="flex items-center gap-1 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity size={7} /> Live
              </span>
            </h3>
            {subtitle && (
              <p className="text-[9px] text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground/50 font-mono">
            <Cpu size={8} />
            <span>v3.0</span>
          </div>
        </div>

        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Terminal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
            <motion.div
              className="absolute -inset-px rounded-xl pointer-events-none"
              animate={focused ? {
                boxShadow: [
                  "0 0 0 1px hsl(var(--primary) / 0.15)",
                  "0 0 6px 1px hsl(var(--primary) / 0.1)",
                  "0 0 0 1px hsl(var(--primary) / 0.15)",
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <input
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full pl-9 pr-3 h-10 rounded-xl text-xs border border-primary/10 bg-background/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition font-display"
            />
          </div>
          <motion.button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            whileTap={{ scale: 0.93 }}
            className="relative px-4 h-10 rounded-xl text-primary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(270 80% 60%))",
              boxShadow: "0 4px 14px -2px hsl(var(--primary) / 0.25)",
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={14} />
              </motion.div>
            ) : (
              <Send size={14} />
            )}
            <span className="relative z-10">Ask</span>
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
              className="text-[9px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition font-display"
            >
              {eq}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && <NeuralThinking />}
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
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(270 80% 65% / 0.08))" }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                >
                  <Bot size={13} className="text-primary" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <TypewriterAnswer content={answer} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <motion.button
                  onClick={() => setAnswer(null)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[9px] text-muted-foreground/50 hover:text-foreground transition flex items-center gap-1"
                >
                  <X size={8} /> Dismiss
                </motion.button>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[8px] text-muted-foreground/30 flex items-center gap-1 font-mono"
                >
                  <Zap size={7} /> Neural Engine v3
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
