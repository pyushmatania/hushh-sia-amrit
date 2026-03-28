/**
 * SpotlightCard — Aceternity-style mouse-tracking spotlight + glowing border.
 * Wrap any card content to add a premium interactive glow effect.
 */
import { useRef, useState, useCallback, memo, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  radius?: number;
}

const SpotlightCard = memo(function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(168, 85, 247, 0.08)",
  borderColor = "rgba(168, 85, 247, 0.15)",
  radius = 200,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: isHovered
          ? `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 60%)`
          : undefined,
      }}
    >
      {/* Glowing border */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            border: `1px solid ${borderColor}`,
            background: `radial-gradient(${radius * 0.8}px circle at ${position.x}px ${position.y}px, ${borderColor}, transparent 50%)`,
            opacity: 0.6,
          }}
        />
      )}
      {children}
    </div>
  );
});

export default SpotlightCard;
