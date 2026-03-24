import { useRef, useState, useCallback, type ReactNode } from "react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

const THRESHOLD = 80;

type PullDirection = "idle" | "pending" | "vertical" | "horizontal";

export default function PullToRefresh({ children, onRefresh, className = "" }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const pullDirection = useRef<PullDirection>("idle");

  const isInsideNoPullArea = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return !!target.closest('[data-no-pull-refresh="true"]');
  }, []);

  const getScrollContainer = useCallback((target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return containerRef.current;
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
    if (isInsideNoPullArea(e.target)) { pullDirection.current = "idle"; startPoint.current = null; return; }
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
      if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) { pullDirection.current = "horizontal"; return; }
      if (dy > 6) { pullDirection.current = "vertical"; } else { return; }
    }
    if (pullDirection.current !== "vertical") return;
    e.preventDefault();
    setPullY(Math.max(0, dy) * 0.45);
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDirection.current !== "vertical") { resetGesture(); return; }
    resetGesture();
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(60);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
  }, [pullY, onRefresh, refreshing, resetGesture]);

  const handleTouchCancel = useCallback(() => {
    resetGesture();
    setPullY(0);
  }, [resetGesture]);

  const spinnerOpacity = pullY < 10 ? 0 : Math.min(1, pullY / THRESHOLD);
  const spinnerScale = 0.5 + (Math.min(pullY, THRESHOLD) / THRESHOLD) * 0.5;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Spinner — only render when pulling */}
      {(pullY > 10 || refreshing) && (
        <div
          className="absolute left-1/2 z-10 flex items-center justify-center pointer-events-none"
          style={{ transform: `translateX(-50%)`, top: pullY - 40, opacity: spinnerOpacity }}
        >
          <div
            className="w-9 h-9 rounded-full border-[2.5px] border-primary/30 border-t-primary"
            style={{
              transform: `scale(${spinnerScale})`,
              animation: refreshing ? "spin 0.8s linear infinite" : "none",
            }}
          />
        </div>
      )}

      <div
        ref={containerRef}
        style={{ transform: pullY > 0 ? `translateY(${pullY}px)` : undefined, transition: pullY === 0 ? "transform 0.25s ease-out" : "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className="min-h-screen"
      >
        {children}
      </div>
    </div>
  );
}
