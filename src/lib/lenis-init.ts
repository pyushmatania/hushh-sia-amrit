/**
 * Lenis smooth-scroll initializer.
 * Called once in App.tsx to wrap the entire page in buttery inertia scrolling.
 * Respects prefers-reduced-motion and mobile performance.
 */
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function initLenis() {
  if (lenisInstance) return lenisInstance;

  // Skip on reduced-motion preference
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null;

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time: number) {
    lenisInstance?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenisInstance;
}

export function destroyLenis() {
  lenisInstance?.destroy();
  lenisInstance = null;
}
