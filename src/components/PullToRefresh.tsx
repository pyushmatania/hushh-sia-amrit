import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

const THRESHOLD = 80;

type PullDirection = "idle" | "pending" | "vertical" | "horizontal";

export default function PullToRefresh({ children, onRefresh, className = "" }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const pullDirection = useRef<PullDirection>("idle");
  const dragY = useMotionValue(0);
  const spinnerOpacity = useTransform(dragY, [0, 40, THRESHOLD], [0, 0.5, 1]);
  const spinnerScale = useTransform(dragY, [0, THRESHOLD], [0.5, 1]);
  const spinnerRotate = useTransform(dragY, [0, THRESHOLD * 2], [0, 360]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const el = containerRef.current;
    if (el && el.scrollTop <= 0) {
      startPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pullDirection.current = "pending";
      return;
    }
    pullDirection.current = "idle";
    startPoint.current = null;
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (refreshing || !startPoint.current || pullDirection.current === "idle") return;

    const dx = e.touches[0].clientX - startPoint.current.x;
    const dy = e.touches[0].clientY - startPoint.current.y;

    if (pullDirection.current === "pending") {
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) {
        pullDirection.current = "horizontal";
        return;
      }
      if (dy > 6) {
        pullDirection.current = "vertical";
      } else {
        return;
      }
    }

    if (pullDirection.current !== "vertical") return;

    e.preventDefault();
    const dampened = Math.max(0, dy) * 0.45;
    dragY.set(dampened);
  }, [dragY, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDirection.current !== "vertical") {
      pullDirection.current = "idle";
      startPoint.current = null;
      return;
    }

    pullDirection.current = "idle";
    startPoint.current = null;

    const currentDrag = dragY.get();
    if (currentDrag >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      animate(dragY, 60, { type: "spring", stiffness: 300, damping: 25 });
      await onRefresh();
      setRefreshing(false);
    }
    animate(dragY, 0, { type: "spring", stiffness: 300, damping: 25 });
  }, [dragY, onRefresh, refreshing]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
        style={{ top: useTransform(dragY, (v) => v - 40), opacity: spinnerOpacity, scale: spinnerScale }}
      >
        <motion.div
          className="w-9 h-9 rounded-full border-[2.5px] border-primary/30 border-t-primary"
          style={{ rotate: refreshing ? undefined : spinnerRotate }}
          animate={refreshing ? { rotate: 360 } : undefined}
          transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: "linear" } : undefined}
        />
      </motion.div>

      <motion.div
        ref={containerRef}
        style={{ y: dragY }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
