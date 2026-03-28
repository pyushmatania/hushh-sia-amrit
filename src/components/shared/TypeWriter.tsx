/**
 * TypeWriter — typed.js-style typewriter effect using pure React.
 * Cycles through an array of strings with typing/deleting animation.
 */
import { useState, useEffect, useCallback, memo } from "react";

interface TypeWriterProps {
  strings: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

const TypeWriter = memo(function TypeWriter({
  strings,
  className = "",
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseDuration = 2000,
}: TypeWriterProps) {
  const [text, setText] = useState("");
  const [stringIndex, setStringIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const current = strings[stringIndex];
    if (!isDeleting) {
      if (text.length < current.length) {
        setText(current.slice(0, text.length + 1));
        return typingSpeed;
      } else {
        setIsDeleting(true);
        return pauseDuration;
      }
    } else {
      if (text.length > 0) {
        setText(current.slice(0, text.length - 1));
        return deletingSpeed;
      } else {
        setIsDeleting(false);
        setStringIndex((i) => (i + 1) % strings.length);
        return typingSpeed;
      }
    }
  }, [text, stringIndex, isDeleting, strings, typingSpeed, deletingSpeed, pauseDuration]);

  useEffect(() => {
    const delay = tick();
    const timer = setTimeout(() => {
      tick(); // force re-render via state changes in tick
    }, delay);
    return () => clearTimeout(timer);
  }, [text, isDeleting, stringIndex]);

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
});

export default TypeWriter;
