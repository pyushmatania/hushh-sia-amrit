import { forwardRef, type CSSProperties, type ReactNode } from "react";

export interface AccentTagConfig {
  label: string;
  bg: string;
  icon?: ReactNode;
}

interface AccentFrameProps {
  color: string;
  radius?: string;
  glowAlpha?: number;
}

const EDGE_THICKNESS = 2.5;
const CORNER_SIZE = 18;

function withAlpha(color: string, alpha: number): string {
  const hslMatch = color.match(/^hsl\((.+)\)$/);
  if (hslMatch) {
    return `hsl(${hslMatch[1]} / ${alpha})`;
  }

  return color;
}

const edgeBaseStyle: CSSProperties = {
  position: "absolute",
  pointerEvents: "none",
  zIndex: 3,
};

export const AccentFrame = forwardRef<HTMLDivElement, AccentFrameProps>(function AccentFrame({ color, radius = "1rem", glowAlpha = 0.08 }: AccentFrameProps, ref) {
  return (
    <>
      {/* Left edge – fades downward */}
      <div
        style={{
          ...edgeBaseStyle,
          left: 0,
          top: CORNER_SIZE,
          bottom: 0,
          width: `${EDGE_THICKNESS}px`,
          background: `linear-gradient(to bottom, ${color} 0%, ${color} 40%, transparent 85%)`,
        }}
      />
      {/* Top edge – fades rightward */}
      <div
        style={{
          ...edgeBaseStyle,
          left: CORNER_SIZE,
          top: 0,
          right: 0,
          height: `${EDGE_THICKNESS}px`,
          background: `linear-gradient(to right, ${color} 0%, ${color} 30%, transparent 70%)`,
        }}
      />
      {/* Rounded corner piece – single rounded L */}
      <div
        style={{
          ...edgeBaseStyle,
          left: 0,
          top: 0,
          width: `${CORNER_SIZE}px`,
          height: `${CORNER_SIZE}px`,
          borderTopLeftRadius: radius,
          borderLeft: `${EDGE_THICKNESS}px solid ${color}`,
          borderTop: `${EDGE_THICKNESS}px solid ${color}`,
        }}
      />
      {/* Subtle glow */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none rounded-[inherit]"
        style={{
          background: `radial-gradient(ellipse at top left, ${withAlpha(color, glowAlpha)} 0%, transparent 55%)`,
        }}
      />
    </>
  );
}

interface AccentTagProps {
  tag: AccentTagConfig;
  className?: string;
}

export const AccentTag = forwardRef<HTMLSpanElement, AccentTagProps>(function AccentTag({ tag, className = "absolute top-3 left-3 z-10" }, ref) {
  return (
    <span
      ref={ref}
      className={`${className} text-[10px] font-bold tracking-wider pl-3 pr-4 py-1.5 flex items-center gap-1 shadow-lg`}
      style={{
        background: tag.bg,
        color: "hsl(var(--primary-foreground))",
        letterSpacing: "0.08em",
        clipPath: "polygon(0 0, 100% 0, 90% 100%, 8% 100%, 0 58%)",
        borderRadius: "6px 14px 12px 6px",
      }}
    >
      {tag.icon}
      {tag.label}
    </span>
  );
});
