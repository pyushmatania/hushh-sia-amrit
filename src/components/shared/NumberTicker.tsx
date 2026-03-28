/**
 * NumberTicker — Magic UI-style animated counter.
 * Rolls numbers up/down with spring easing when value changes.
 */
import { useEffect, useRef, useState, memo } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface NumberTickerProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Duration in seconds */
  duration?: number;
  /** Locale for number formatting */
  locale?: string;
}

const NumberTicker = memo(function NumberTicker({
  value,
  className = "",
  prefix = "",
  suffix = "",
  duration = 1.2,
  locale = "en-IN",
}: NumberTickerProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 40,
    stiffness: 100,
    duration: duration * 1000,
  });
  const display = useTransform(spring, (latest) =>
    `${prefix}${Math.round(latest).toLocaleString(locale)}${suffix}`
  );

  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Animate on first intersection, then on every value change
    if (!hasAnimated) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            motionValue.set(value);
            setHasAnimated(true);
            observer.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    } else {
      motionValue.set(value);
    }
  }, [value, hasAnimated, motionValue]);

  return (
    <motion.span ref={ref} className={`tabular-nums ${className}`}>
      {display}
    </motion.span>
  );
});

export default NumberTicker;
