/**
 * Lenis smooth-scroll initializer.
 * Called once in App.tsx to wrap the entire page in buttery inertia scrolling.
 * Respects prefers-reduced-motion, mobile devices, and low-end hardware.
 */
import Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

/** Detect low-end device via hardware concurrency and memory */
function isLowEndDevice(): boolean {
  const nav = navigator as any;
  const cores = nav.hardwareConcurrency || 2;
  const memory = nav.deviceMemory || 4; // GB
  // Consider low-end if <= 4 cores or <= 2GB RAM
  if (cores <= 4 || memory <= 2) return true;
  return false;
}

/** Detect touch-primary (mobile) device */
function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function initLenis() {
  if (lenisInstance) return lenisInstance;

  // Skip on reduced-motion preference
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null;

  // Disable on mobile/touch devices — native scroll is smoother and more reliable
  if (isTouchDevice()) return null;

  // Disable on low-end devices to avoid jank
  if (isLowEndDevice()) return null;

  lenisInstance = new Lenis({
    duration: 0.8, // Reduced from 1.1 for snappier feel
    easing: (t: number) => 1 - Math.pow(1 - t, 3), // Simpler cubic ease-out (no Math.pow with decimals)
    touchMultiplier: 1.0,
    infinite: false,
  });

  // Only run RAF when Lenis is actually animating
  let isScrolling = false;

  lenisInstance.on("scroll", () => {
    if (!isScrolling) {
      isScrolling = true;
      startRaf();
    }
  });

  function startRaf() {
    function raf(time: number) {
      if (!lenisInstance) return;
      lenisInstance.raf(time);
      // Check if still animating
      if (lenisInstance.isScrolling) {
        rafId = requestAnimationFrame(raf);
      } else {
        isScrolling = false;
        rafId = null;
      }
    }
    rafId = requestAnimationFrame(raf);
  }

  // Initial RAF to handle page load scroll
  startRaf();

  return lenisInstance;
}

export function destroyLenis() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lenisInstance?.destroy();
  lenisInstance = null;
}
