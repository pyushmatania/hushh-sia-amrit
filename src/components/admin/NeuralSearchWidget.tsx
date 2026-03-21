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
...
            <HushhBot size={52} state="speaking" />
...
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
