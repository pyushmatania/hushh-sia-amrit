import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef } from "react";

interface BookingQRCodeProps {
  bookingId: string;
  size?: number;
  className?: string;
}

export default function BookingQRCode({ bookingId, size = 180, className = "" }: BookingQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrPayload = JSON.stringify({ type: "hushh_checkin", bid: bookingId });

  const logoSize = Math.round(size * 0.24);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Premium container */}
      <div
        className="relative p-5 rounded-[28px] shadow-2xl"
        style={{
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
