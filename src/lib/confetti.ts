/**
 * canvas-confetti wrapper — lightweight celebratory effects.
 * Used for booking success, spin-wheel wins, and milestone achievements.
 */
import confetti from "canvas-confetti";

/** Classic celebration burst */
export function fireCelebration() {
  const duration = 2500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#a855f7", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#a855f7", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

/** Quick burst from center (spin wins) */
export function fireSpinWin() {
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.5 },
    colors: ["#a855f7", "#f59e0b", "#10b981", "#ec4899", "#6366f1"],
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });
}

/** Stars burst (milestone) */
export function fireStars() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.4 },
    shapes: ["star"],
    colors: ["#fbbf24", "#f59e0b", "#d97706"],
    scalar: 1.4,
  });
}

/** Gentle side shower */
export function fireSubtle() {
  confetti({
    particleCount: 30,
    angle: 90,
    spread: 120,
    origin: { y: 0.35 },
    colors: ["#a855f7", "#c084fc"],
    gravity: 0.8,
    ticks: 150,
  });
}
