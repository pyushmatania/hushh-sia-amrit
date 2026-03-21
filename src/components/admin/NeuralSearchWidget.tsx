import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Mic, X, Sparkles, Activity, Copy, Check, Wand2
} from "lucide-react";
import { playAIThinkingSound, playAISuccessSound, playAIErrorSound } from "@/lib/ai-sounds";
import HushhBot from "./HushhBot";

/* ─── Floating particles background ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 17) % 60}%`,
          }}
          animate={{
            y: [0, -20 - i * 5, 0],
            x: [0, (i % 2 ? 8 : -8), 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

/* ─── Thinking animation ─── */
function ThinkingPulse() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.95 }}
      className="mx-4 mb-4"
    >
      <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/15 bg-primary/5 relative overflow-hidden">
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <HushhBot size={46} state="thinking" />
        <div className="flex-1 relative z-10">
          <span className="text-[11px] font-semibold text-primary font-display">Analyzing...</span>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="h-1 rounded-full bg-primary/30"
                style={{ width: 6 + Math.random() * 12 }}
                animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.5, 1, 0.5] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Typewriter text ─── */
function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    setDisplayed("");
    setDone(false);
    const iv = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) { clearInterval(iv); setDone(true); }
    }, 12);
    return () => clearInterval(iv);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-primary/60 ml-0.5 align-text-bottom"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  );
}

/* ─── Rich answer card ─── */
function AnswerCard({ content, onDismiss }: { content: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="border-t border-primary/10 overflow-hidden"
    >
      <div className="p-4 bg-gradient-to-br from-primary/[0.03] to-card relative">
        {/* Subtle sparkle overlay */}
        <motion.div
          className="absolute top-2 right-2"
          animate={{ rotate: [0, 180, 360], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles size={10} className="text-primary/20" />
        </motion.div>

        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
          >
            <HushhBot size={52} state="speaking" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <MarkdownRender content={content} />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mt-3 pt-2 border-t border-border/30"
        >
          <button onClick={onDismiss} className="text-[10px] text-muted-foreground/50 hover:text-foreground transition flex items-center gap-1">
            <X size={9} /> Dismiss
          </button>
          <div className="flex items-center gap-3">
            <button onClick={copy} className="text-[10px] text-muted-foreground/50 hover:text-primary transition flex items-center gap-1">
              {copied ? <Check size={9} className="text-emerald-400" /> : <Copy size={9} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="text-[8px] text-muted-foreground/30 flex items-center gap-1 font-mono">
              <Wand2 size={7} /> Hushh AI
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Markdown renderer ─── */
function MarkdownRender({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="text-xs text-foreground leading-relaxed space-y-1 font-display">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <motion.h3 key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="font-bold text-sm mt-2 text-foreground">{line.slice(4)}</motion.h3>;
        if (line.startsWith("## ")) return <motion.h2 key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="font-bold text-sm mt-2 text-foreground">{line.slice(3)}</motion.h2>;
        if (line.startsWith("# ")) return <motion.h1 key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="font-bold mt-2 text-foreground">{line.slice(2)}</motion.h1>;
        if (line.startsWith("- ") || line.startsWith("* ")) return (
          <motion.li key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="ml-4 list-disc text-foreground/80">{formatInline(line.slice(2))}</motion.li>
        );
        if (/^\d+\.\s/.test(line)) return (
          <motion.li key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="ml-4 list-decimal text-foreground/80">{formatInline(line.replace(/^\d+\.\s/, ""))}</motion.li>
        );
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="text-foreground/85">{formatInline(line)}</motion.p>;
      })}
    </div>
  );
}

function formatInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    return part;
  });
}

/* ─── Voice wave visualizer ─── */
function VoiceWave() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-[3px] h-6"
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-red-400"
          animate={{ height: [6, 14 + i * 2, 6] }}
          transition={{ duration: 0.35 + i * 0.04, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
    </motion.div>
  );
}

/* ─── Main Widget ─── */
interface NeuralSearchWidgetProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  examples: string[];
  onSearch: (query: string) => Promise<string>;
  compact?: boolean;
}

export default function NeuralSearchWidget({
  title = "Hushh AI",
  subtitle,
  placeholder = "Ask anything about your data...",
  examples,
  onSearch,
  compact = false,
}: NeuralSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

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

  const startHold = useCallback(() => {
    setIsHolding(true);
    if ("vibrate" in navigator) navigator.vibrate(30);
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setQuery(text);
        setIsHolding(false);
      };
      recognition.onerror = () => setIsHolding(false);
      recognition.onend = () => setIsHolding(false);
      recognition.start();
      (window as any).__hushhRecognition = recognition;
    }
  }, []);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    if ((window as any).__hushhRecognition) {
      (window as any).__hushhRecognition.stop();
    }
  }, []);

  const botState = loading ? "thinking" : isHolding ? "listening" : answer ? "success" : "idle";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="relative rounded-2xl border border-primary/15 overflow-hidden transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--primary) / 0.03))",
        boxShadow: focused ? "0 0 30px -4px hsl(var(--primary) / 0.15)" : "0 4px 20px -8px hsl(var(--primary) / 0.06)",
      }}
    >
      <FloatingParticles />

      <div className={`${compact ? "p-3" : "p-5"} relative z-10`}>
        {/* Centered Avatar + Title */}
        <div className="flex flex-col items-center mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <HushhBot size={compact ? 86 : 112} state={botState} />
          </motion.div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-display mt-1">
            {title}
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1 text-[8px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              <Activity size={7} /> Live
            </motion.span>
          </h3>
          {subtitle && <p className="text-[9px] text-muted-foreground mt-0.5 text-center">{subtitle}</p>}
        </div>

        {/* Input below avatar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <motion.div
              animate={focused ? { boxShadow: "0 0 0 2px hsl(var(--primary) / 0.15)" } : { boxShadow: "0 0 0 0px transparent" }}
              className="rounded-xl"
            >
              <input
                placeholder={placeholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full pl-3 pr-3 h-10 rounded-xl text-xs border border-primary/10 bg-background/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition font-display"
              />
            </motion.div>
          </div>
          {/* Hold-to-speak */}
          <motion.button
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition relative ${
              isHolding
                ? "bg-red-500/20 border-red-400/40 text-red-400"
                : "bg-secondary/50 border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30"
            }`}
          >
            <AnimatePresence mode="wait">
              {isHolding ? (
                <motion.div key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <VoiceWave />
                </motion.div>
              ) : (
                <motion.div key="mic" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <Mic size={16} />
                </motion.div>
              )}
            </AnimatePresence>
            {isHolding && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-red-400/50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </motion.button>
          {/* Send */}
          <motion.button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.05 }}
            className="px-4 h-10 rounded-xl text-primary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(270 80% 60%))",
              boxShadow: "0 4px 14px -2px hsl(var(--primary) / 0.25)",
            }}
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <Loader2 size={14} />
              </motion.div>
            ) : (
              <motion.div animate={{ x: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Send size={14} />
              </motion.div>
            )}
          </motion.button>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
          {examples.map((eq, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.04, type: "spring", damping: 20 }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuery(eq)}
              className="text-[9px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground/70 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition font-display"
            >
              {eq}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Loading */}
      <AnimatePresence>{loading && <ThinkingPulse />}</AnimatePresence>

      {/* Answer */}
      <AnimatePresence>
        {answer && !loading && <AnswerCard content={answer} onDismiss={() => setAnswer(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
