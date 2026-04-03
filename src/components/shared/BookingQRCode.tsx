import { QRCodeSVG } from "qrcode.react";

interface BookingQRCodeProps {
  bookingId: string;
  size?: number;
  className?: string;
}

export default function BookingQRCode({ bookingId, size = 128, className = "" }: BookingQRCodeProps) {
  // Encode booking ID as a unique QR payload
  const qrPayload = JSON.stringify({
    type: "hushh_checkin",
    bid: bookingId,
    ts: Date.now(),
  });

  return (
    <div className={`bg-white p-3 rounded-2xl inline-flex ${className}`}>
      <QRCodeSVG
        value={qrPayload}
        size={size}
        level="M"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#1a1a2e"
      />
    </div>
  );
}
