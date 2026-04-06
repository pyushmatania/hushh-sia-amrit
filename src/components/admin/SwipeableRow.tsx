import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Pencil, Trash2, ChevronLeft } from "lucide-react";
import { hapticLight, hapticMedium, hapticHeavy } from "@/lib/haptics";

// Tiny synthesized swipe sounds via AudioContext
function playSwipeReveal() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    setTimeout(() => ctx.close(), 200);
  } catch {}
}

function playSwipeClose() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
    setTimeout(() => ctx.close(), 200);
  } catch {}
}

function playDeleteTap() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    setTimeout(() => ctx.close(), 250);
  } catch {}
}

function playEditTap() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
    setTimeout(() => ctx.close(), 200);
  } catch {}
}

interface SwipeableRowProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  showHint?: boolean;
}

const HINT_KEY = "swipeable-row-hint-shown";

export default function SwipeableRow({ children, onEdit, onDelete, className = "", showHint = false }: SwipeableRowProps) {
  const x = useMotionValue(0);
  const [swiped, setSwiped] = useState<"none" | "left">("none");
  const [hinting, setHinting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredHaptic = useRef(false);

  const ACTION_WIDTH = 140;

  const editOpacity = useTransform(x, [-ACTION_WIDTH, -60, 0], [1, 0.6, 0]);

  // Show hint animation once
  useEffect(() => {
    if (!showHint) return;
    const seen = sessionStorage.getItem(HINT_KEY);
    if (seen) return;
    const timeout = setTimeout(() => {
      setHinting(true);
      sessionStorage.setItem(HINT_KEY, "1");
      setTimeout(() => setHinting(false), 2400);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [showHint]);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    if (info.offset.x < -50 && !hasTriggeredHaptic.current) {
      hasTriggeredHaptic.current = true;
      hapticMedium();
    }
    if (info.offset.x > -30) {
      hasTriggeredHaptic.current = false;
    }
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    hasTriggeredHaptic.current = false;
    if (info.offset.x < -50) {
      setSwiped("left");
      playSwipeReveal();
      hapticLight();
    } else {
      if (swiped === "left") {
        playSwipeClose();
        hapticLight();
      }
      setSwiped("none");
    }
  }, [swiped]);

  const close = useCallback(() => {
    setSwiped("none");
    playSwipeClose();
    hapticLight();
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Action buttons behind */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-stretch z-0"
        style={{ opacity: swiped === "left" || hinting ? 1 : editOpacity }}
      >
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); playEditTap(); hapticLight(); onEdit(); close(); }}
            className="w-[70px] flex flex-col items-center justify-center gap-1 bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
          >
            <Pencil size={16} />
            <span className="text-[10px] font-semibold">Edit</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); playDeleteTap(); hapticHeavy(); onDelete(); close(); }}
            className="w-[70px] flex flex-col items-center justify-center gap-1 bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"
          >
            <Trash2 size={16} />
            <span className="text-[10px] font-semibold">Delete</span>
          </button>
        )}
      </motion.div>

      {/* Swipe hint overlay */}
      <AnimatePresence>
        {hinting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-end pr-4"
          >
            <motion.div
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: [0, -20, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, times: [0, 0.4, 1], ease: "easeInOut" }}
              className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm"
            >
              <ChevronLeft size={14} className="animate-pulse" />
              Swipe to edit
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: hinting ? -60 : swiped === "left" ? -ACTION_WIDTH : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ x: hinting ? undefined : x, touchAction: "pan-y" }}
        className="relative z-10 bg-card"
        onClick={() => { if (swiped === "left") { close(); } }}
      >
        {children}
      </motion.div>
    </div>
  );
}