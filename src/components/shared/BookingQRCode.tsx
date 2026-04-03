import { QRCodeSVG } from "qrcode.react";

interface BookingQRCodeProps {
  bookingId: string;
  size?: number;
  className?: string;
}

export default function BookingQRCode({ bookingId, size = 128, className = "" }: BookingQRCodeProps) {
  const qrPayload = JSON.stringify({
    type: "hushh_checkin",
    bid: bookingId,
  });

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* QR with rounded container and logo overlay */}
      <div className="relative bg-white p-4 rounded-3xl shadow-lg" style={{ borderRadius: "24px" }}>
        <QRCodeSVG
          value={qrPayload}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#1a1a2e"
          imageSettings={{
            src: "/app-icon.png",
            x: undefined,
            y: undefined,
            height: Math.round(size * 0.22),
            width: Math.round(size * 0.22),
            excavate: true,
          }}
        />
        {/* Branded ring around center logo */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-primary/30 pointer-events-none"
          style={{
            width: Math.round(size * 0.26),
            height: Math.round(size * 0.26),
          }}
        />
      </div>
      {/* Branding below */}
      <div className="flex items-center gap-1.5 mt-3 opacity-60">
        <img src="/app-icon.png" alt="Hushh" className="w-4 h-4 rounded-sm" />
        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Hushh Check-in</span>
      </div>
    </div>
  );
}
