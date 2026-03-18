import { type Variants } from "framer-motion";

// Page transition variants
export const pageSlideUp: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export const pageSlideRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Stagger children
export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Card press effect
export const cardPress = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring" as const, stiffness: 400, damping: 20 },
};

// Heart pop animation
export const heartPop: Variants = {
  initial: { scale: 1 },
  liked: {
    scale: [1, 1.4, 0.9, 1.1, 1],
    transition: { duration: 0.5, times: [0, 0.2, 0.4, 0.7, 1] },
  },
  unliked: {
    scale: [1, 0.8, 1],
    transition: { duration: 0.3 },
  },
};

// Bounce in for confirmation / success
export const bounceIn: Variants = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 },
  },
};

// Slide overlay (search, map)
export const overlaySlideUp: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } },
  exit: { opacity: 0, y: "100%", transition: { duration: 0.25 } },
};
