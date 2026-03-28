/**
 * TypeWriter — typed.js-style typewriter effect using pure React.
 * Cycles through an array of strings with typing/deleting animation.
 */
import { useState, useEffect, memo } from "react";

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

  useEffect(() => {
    if (!strings.length) return;

    const current = strings[stringIndex] ?? "";
    const delay = !isDeleting
      ? text.length < current.length
        ? typingSpeed
        : pauseDuration
      : text.length > 0
        ? deletingSpeed
        : typingSpeed;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
          return;
        }
        setIsDeleting(true);
        return;
      }

      if (text.length > 0) {
        setText(current.slice(0, text.length - 1));
        return;
      }

      setIsDeleting(false);
      setStringIndex((i) => (i + 1) % strings.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, stringIndex, isDeleting, strings, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
});

export default TypeWriter;
