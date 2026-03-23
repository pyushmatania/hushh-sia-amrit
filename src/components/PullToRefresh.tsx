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

  const isInsideNoPullArea = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest('[data-no-pull-refresh="true"]');
  }, []);

  const getScrollContainer = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) {
      return containerRef.current;
    }

    const explicitContainer = target.closest<HTMLElement>('[data-pull-scroll-container="true"]');
    if (explicitContainer) return explicitContainer;

    const fallbackContainer = containerRef.current?.querySelector<HTMLElement>('[data-pull-scroll-container="true"]');
    return fallbackContainer ?? containerRef.current;
  }, []);

  const resetGesture = useCallback(() => {
    pullDirection.current = "idle";
    startPoint.current = null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;

    if (isInsideNoPullArea(e.target)) {
      pullDirection.current = "idle";
      startPoint.current = null;
      return;
    }

    const scrollContainer = getScrollContainer(e.target);

    if ((scrollContainer?.scrollTop ?? 0) <= 0) {
      startPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pullDirection.current = "pending";
      return;
    }
    resetGesture();
  }, [refreshing, isInsideNoPullArea, getScrollContainer, resetGesture]);

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
      resetGesture();
      return;
    }

    resetGesture();

    const currentDrag = dragY.get();
    if (currentDrag >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      animate(dragY, 60, { type: "spring", stiffness: 300, damping: 25 });
      await onRefresh();
      setRefreshing(false);
    }
    animate(dragY, 0, { type: "spring", stiffness: 300, damping: 25 });
  }, [dragY, onRefresh, refreshing, resetGesture]);

  const handleTouchCancel = useCallback(() => {
    resetGesture();
    animate(dragY, 0, { type: "spring", stiffness: 300, damping: 25 });
  }, [dragY, resetGesture]);

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
        onTouchCancel={handleTouchCancel}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
