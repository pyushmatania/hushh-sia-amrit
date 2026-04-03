import { QRCodeSVG } from "qrcode.react";

interface BookingQRCodeProps {
  bookingId: string;
  size?: number;
  className?: string;
  minimal?: boolean;
}

/* ── Tiny SVG doodle icons themed around Hushh: villas, food, drinks, experiences ── */
const DoodleVilla = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x="0" y="6" width="16" height="10" rx="1.5" fill="none" stroke="#d4a853" strokeWidth="1.2" />
    <polygon points="8,0 0,6 16,6" fill="none" stroke="#9333ea" strokeWidth="1.2" />
    <rect x="6" y="10" width="4" height="6" rx="0.5" fill="none" stroke="#d4a853" strokeWidth="0.8" />
    <rect x="2" y="8" width="3" height="3" rx="0.3" fill="#9333ea" opacity="0.25" />
  </g>
);

const DoodleFood = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx="7" cy="10" rx="7" ry="4" fill="none" stroke="#d4a853" strokeWidth="1.2" />
    <path d="M3,8 Q7,2 11,8" fill="none" stroke="#9333ea" strokeWidth="1" />
    <circle cx="5" cy="7" r="1" fill="#d4a853" opacity="0.5" />
    <circle cx="9" cy="6" r="0.8" fill="#9333ea" opacity="0.4" />
  </g>
);

const DoodleDrink = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M2,0 L0,14 H10 L8,0 Z" fill="none" stroke="#d4a853" strokeWidth="1.1" />
    <path d="M1,5 H9" stroke="#9333ea" strokeWidth="0.8" opacity="0.5" />
    <circle cx="5" cy="9" r="1.5" fill="#9333ea" opacity="0.2" />
    <line x1="8" y1="0" x2="13" y2="-3" stroke="#d4a853" strokeWidth="0.8" />
    <circle cx="13" cy="-4" r="1.5" fill="none" stroke="#d4a853" strokeWidth="0.8" />
  </g>
);

const DoodlePool = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx="8" cy="6" rx="8" ry="5" fill="#9333ea" opacity="0.08" stroke="#9333ea" strokeWidth="1" />
    <path d="M2,5 Q5,3 8,5 Q11,7 14,5" fill="none" stroke="#d4a853" strokeWidth="0.9" />
    <path d="M2,7 Q5,5 8,7 Q11,9 14,7" fill="none" stroke="#d4a853" strokeWidth="0.7" opacity="0.5" />
  </g>
);

const DoodleStar = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8,10 5,8 2,10 2.5,6.5 0,4 3.5,3.5" fill="#d4a853" opacity="0.35" stroke="#d4a853" strokeWidth="0.7" />
  </g>
);

const DoodleMusic = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle cx="3" cy="10" r="2.5" fill="none" stroke="#9333ea" strokeWidth="1" />
    <line x1="5.5" y1="10" x2="5.5" y2="1" stroke="#9333ea" strokeWidth="1" />
    <path d="M5.5,1 Q9,0 9,3" fill="none" stroke="#d4a853" strokeWidth="1" />
  </g>
);

const DoodleCamera = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x="0" y="3" width="14" height="9" rx="1.5" fill="none" stroke="#d4a853" strokeWidth="1.1" />
    <circle cx="7" cy="7.5" r="3" fill="none" stroke="#9333ea" strokeWidth="1" />
    <circle cx="7" cy="7.5" r="1" fill="#9333ea" opacity="0.3" />
    <rect x="4" y="1" width="6" height="2" rx="0.8" fill="none" stroke="#d4a853" strokeWidth="0.8" />
  </g>
);

const DoodleFire = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M5,12 Q0,8 3,4 Q4,6 5,4 Q6,2 7,0 Q9,4 10,4 Q8,6 9,8 Q12,8 7,12 Z" fill="#d4a853" opacity="0.2" stroke="#d4a853" strokeWidth="0.9" />
    <path d="M6,12 Q4,10 5,7 Q6,9 7,7 Q9,10 7,12 Z" fill="#9333ea" opacity="0.25" />
  </g>
);

export default function BookingQRCode({ bookingId, size = 180, className = "", minimal = false }: BookingQRCodeProps) {
  const qrPayload = JSON.stringify({ type: "hushh_checkin", bid: bookingId });
  const logoSize = Math.round(size * 0.24);

  if (minimal) {
    return (
      <div className={`inline-flex flex-col items-center ${className}`}>
        <QRCodeSVG value={qrPayload} size={size} level="H" bgColor="transparent" fgColor="currentColor" />
      </div>
    );
  }

  // Doodle positions relative to the outer container – arranged around the QR
  const padding = 40; // space around QR for doodles
  const totalSize = size + padding * 2;

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Premium container */}
      <div
        className="relative rounded-[28px] shadow-2xl"
        style={{
          padding: `${padding}px`,
          background: "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,245,255,0.95))",
          boxShadow: "0 8px 40px rgba(139,92,246,0.15), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* Gold-purple gradient border ring */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            padding: "1.5px",
            background: "linear-gradient(135deg, #d4a853, #b78628, #9333ea, #7c3aed, #d4a853)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
            WebkitMaskComposite: "xor",
          }}
        />

        {/* Doodle illustrations layer */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={totalSize}
          height={totalSize}
          viewBox={`0 0 ${totalSize} ${totalSize}`}
          style={{ overflow: "visible" }}
        >
          {/* Top row */}
          <DoodleVilla x={8} y={6} s={0.9} />
          <DoodleStar x={34} y={2} s={0.7} />
          <DoodleFood x={size * 0.4 + padding} y={4} s={0.85} />
          <DoodleCamera x={size * 0.7 + padding} y={8} s={0.75} />
          <DoodleStar x={totalSize - 22} y={12} s={0.6} />

          {/* Left side */}
          <DoodleDrink x={6} y={size * 0.3 + padding} s={0.8} />
          <DoodleMusic x={4} y={size * 0.55 + padding} s={0.75} />
          <DoodleFire x={8} y={size * 0.78 + padding} s={0.7} />

          {/* Right side */}
          <DoodlePool x={size + padding + 4} y={size * 0.25 + padding} s={0.7} />
          <DoodleStar x={totalSize - 16} y={size * 0.5 + padding} s={0.65} />
          <DoodleVilla x={size + padding + 2} y={size * 0.7 + padding} s={0.7} />

          {/* Bottom row */}
          <DoodleMusic x={12} y={totalSize - 18} s={0.7} />
          <DoodleFood x={size * 0.35 + padding} y={totalSize - 16} s={0.7} />
          <DoodleDrink x={size * 0.6 + padding} y={totalSize - 20} s={0.75} />
          <DoodleStar x={totalSize - 24} y={totalSize - 16} s={0.6} />
        </svg>

        {/* QR Code */}
        <QRCodeSVG
          value={qrPayload}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="transparent"
          fgColor="#1a1a2e"
          imageSettings={{
            src: "/app-icon.png",
            x: undefined,
            y: undefined,
            height: logoSize,
            width: logoSize,
            excavate: true,
          }}
        />

        {/* Logo ring with gradient border */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl pointer-events-none"
          style={{
            width: logoSize + 10,
            height: logoSize + 10,
            padding: "2px",
            background: "linear-gradient(135deg, #d4a853, #9333ea, #d4a853)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
            WebkitMaskComposite: "xor",
          }}
        />

        {/* Corner accents */}
        {[
          "top-3 left-3",
          "top-3 right-3 rotate-90",
          "bottom-3 right-3 rotate-180",
          "bottom-3 left-3 -rotate-90",
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} pointer-events-none`}
            style={{
              width: 14,
              height: 14,
              borderTop: "2.5px solid",
              borderLeft: "2.5px solid",
              borderImage: "linear-gradient(135deg, #d4a853, #9333ea) 1",
              borderRadius: "3px 0 0 0",
            }}
          />
        ))}
      </div>

      {/* Premium signature branding */}
      <div className="flex flex-col items-center mt-4 gap-1.5">
        <div className="flex items-center gap-2">
          <img src="/app-icon.png" alt="Hushh" className="w-5 h-5 rounded-lg shadow-sm" />
          <span
            className="text-sm font-bold tracking-[0.2em] uppercase"
            style={{
              background: "linear-gradient(135deg, #d4a853, #b78628, #9333ea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Hushh
          </span>
        </div>
        <span
          className="text-[9px] font-semibold tracking-[0.3em] uppercase"
          style={{
            background: "linear-gradient(90deg, #d4a853, #9333ea)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Premium Check-in
        </span>
        {/* Decorative line */}
        <div
          className="w-16 h-px mt-0.5"
          style={{ background: "linear-gradient(90deg, transparent, #d4a853, #9333ea, transparent)" }}
        />
      </div>
    </div>
  );
}
