import { type Variants, type Transition } from "framer-motion";

// ──────────────────────────────────────────────────────────────────
// Emil Kowalski–inspired Animation System
// Best practices: ease-out defaults, <300ms durations, spring physics,
// blur-in reveals, staggered entrances, momentum-aware interactions.
// ──────────────────────────────────────────────────────────────────

// ─── EASING PRESETS ──────────────────────────────────────────────
// iOS-style drawer/sheet easing
export const EASE_IOS = [0.32, 0.72, 0, 1] as const;
// Default ease-out for most transitions
export const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;
// Smooth ease-out for subtle moves
export const EASE_OUT_SMOOTH = [0.22, 1, 0.36, 1] as const;
// Snappy ease for quick UI feedback
export const EASE_SNAPPY = [0.16, 1, 0.3, 1] as const;
// Elastic overshoot for playful elements
export const EASE_ELASTIC = [0.34, 1.56, 0.64, 1] as const;

// ─── SPRING PRESETS ──────────────────────────────────────────────
export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 400, damping: 30 };
export const SPRING_BOUNCY: Transition = { type: "spring", stiffness: 300, damping: 15 };
export const SPRING_SMOOTH: Transition = { type: "spring", stiffness: 200, damping: 24 };
export const SPRING_HEAVY: Transition = { type: "spring", stiffness: 120, damping: 20, mass: 1.2 };
export const SPRING_IOS_SHEET: Transition = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 };

// ─── PAGE TRANSITIONS ───────────────────────────────────────────
export const pageSlideUp: Variants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.28, ease: [...EASE_OUT_SMOOTH] } },
  exit: { opacity: 0, y: -10, filter: "blur(2px)", transition: { duration: 0.18 } },
};

export const pageSlideRight: Variants = {
  initial: { opacity: 0, x: 50, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: [...EASE_OUT_SMOOTH] } },
  exit: { opacity: 0, x: -25, filter: "blur(2px)", transition: { duration: 0.18 } },
};

export const pageFade: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [...EASE_OUT] } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.12 } },
};

// ─── BLUR-IN REVEAL (Emil Kowalski signature) ───────────────────
export const blurIn: Variants = {
  initial: { opacity: 0, filter: "blur(8px)", y: 8 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.35, ease: [...EASE_OUT_SMOOTH] } },
  exit: { opacity: 0, filter: "blur(4px)", y: -4, transition: { duration: 0.15 } },
};

export const blurInScale: Variants = {
  initial: { opacity: 0, filter: "blur(10px)", scale: 0.92 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1, transition: { duration: 0.4, ease: [...EASE_OUT_SMOOTH] } },
  exit: { opacity: 0, filter: "blur(6px)", scale: 0.96, transition: { duration: 0.2 } },
};

// ─── STAGGER SYSTEM ─────────────────────────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.03, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.32, ease: [...EASE_OUT_SMOOTH] } },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.9, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.3, ease: [...EASE_OUT_SMOOTH] } },
};

// ─── CARD INTERACTIONS ──────────────────────────────────────────
// Modest press scale — never animate from scale(0)
export const cardPress = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 22 },
};

export const cardHover = {
  whileHover: { y: -3, boxShadow: "0 12px 40px -8px hsl(var(--primary) / 0.15)" },
  transition: { duration: 0.25, ease: EASE_OUT_SMOOTH as unknown as number[] },
};

export const cardPressDeep = {
  whileTap: { scale: 0.94, rotateX: 2 },
  transition: { type: "spring" as const, stiffness: 500, damping: 25 },
};

// ─── HEART / LIKE ANIMATIONS ────────────────────────────────────
export const heartPop: Variants = {
  initial: { scale: 1 },
  liked: {
    scale: [1, 1.3, 0.85, 1.1, 1],
    rotate: [0, -8, 8, -4, 0],
    transition: { duration: 0.45, times: [0, 0.2, 0.4, 0.7, 1], ease: [...EASE_ELASTIC] },
  },
  unliked: {
    scale: [1, 0.85, 1],
    transition: { duration: 0.25, ease: [...EASE_OUT] },
  },
};

// ─── BOUNCE / SUCCESS ───────────────────────────────────────────
export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.4, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 18, delay: 0.08 },
  },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.6 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

// ─── OVERLAY / SHEET / DRAWER ───────────────────────────────────
export const overlaySlideUp: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0, transition: { ...SPRING_IOS_SHEET } },
  exit: { opacity: 0, y: "100%", transition: { duration: 0.22, ease: [...EASE_IOS] } },
};

export const drawerSlideRight: Variants = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { ...SPRING_IOS_SHEET } },
  exit: { x: "100%", transition: { duration: 0.25, ease: [...EASE_IOS] } },
};

export const modalScale: Variants = {
  initial: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.28, ease: [...EASE_OUT_SMOOTH] } },
  exit: { opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.15 } },
};

export const backdropFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// ─── TEXT ANIMATIONS ────────────────────────────────────────────
export const textRevealUp: Variants = {
  initial: { opacity: 0, y: 20, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [...EASE_OUT_SMOOTH] } },
};

export const textRevealChar: Variants = {
  initial: { opacity: 0, y: 30, rotateX: 40 },
  animate: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.35, ease: [...EASE_OUT_SMOOTH] } },
};

// ─── BADGE / NOTIFICATION POP ───────────────────────────────────
export const badgePop: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 15 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.12 } },
};

// ─── SHIMMER / SKELETON ─────────────────────────────────────────
export const shimmer: Variants = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
};

// ─── SUBTLE FLOAT (idle animation) ──────────────────────────────
export const subtleFloat: Variants = {
  animate: {
    y: [0, -4, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── LIST ITEM SLIDE-IN ─────────────────────────────────────────
export const listSlideIn: Variants = {
  initial: { opacity: 0, x: -12, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.25, ease: [...EASE_OUT_SMOOTH] } },
  exit: { opacity: 0, x: 12, filter: "blur(2px)", transition: { duration: 0.15 } },
};

// ─── TAB INDICATOR ──────────────────────────────────────────────
export const tabIndicator = {
  layoutTransition: { type: "spring" as const, stiffness: 500, damping: 30 },
};

// ─── MAGNETIC HOVER (for buttons) ───────────────────────────────
// Usage: Apply translateX/Y via onPointerMove with spring physics
export const magneticConfig = {
  stiffness: 150,
  damping: 15,
  mass: 0.1,
};

// ─── TOOLTIP TIMING ─────────────────────────────────────────────
export const tooltipVariants: Variants = {
  initial: { opacity: 0, y: 4, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: [...EASE_OUT] } },
  exit: { opacity: 0, y: 2, scale: 0.98, transition: { duration: 0.1 } },
};

// ─── TOAST STACKING ─────────────────────────────────────────────
export const toastEnter: Variants = {
  initial: { opacity: 0, y: 50, scale: 0.9, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { ...SPRING_SNAPPY } },
  exit: { opacity: 0, y: -20, scale: 0.95, filter: "blur(2px)", transition: { duration: 0.2 } },
};

// ─── NUMBER TICKER (utility) ────────────────────────────────────
// Use with motion.span and animate={{ y }} to create rolling number effects
export const numberRoll: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: "0%", opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  exit: { y: "-100%", opacity: 0, transition: { duration: 0.2 } },
};

// ─── PRESENCE ENTER/EXIT PRESETS ────────────────────────────────
export const presenceFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 } as Transition,
};

export const presenceSlideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } as Transition,
};
