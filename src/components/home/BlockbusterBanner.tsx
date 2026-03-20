import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function BlockbusterBanner() {
  return (
    <div className="px-4">
      <div className="relative rounded-[20px] overflow-hidden p-6"
        style={{
          background: "linear-gradient(135deg, hsl(270, 60%, 25%), hsl(320, 50%, 20%), hsl(270, 40%, 15%))",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-gold" />
          <span className="text-xs font-bold tracking-widest uppercase text-gold">Limited Time</span>
        </div>
        <h3 className="text-2xl font-extrabold text-foreground leading-tight">New Year's Eve 2026</h3>
        <p className="text-sm text-foreground/60 mt-1">Bookings open for the biggest night of the year 🥂</p>
        <button
          onClick={() => toast.success("NYE 2026 — Spot reserved! We'll notify you when bookings open.")}
          className="mt-4 px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-primary-foreground active:scale-95 transition-transform">
          Reserve Now
        </button>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, hsl(var(--gold)) 0%, transparent 70%)" }} />
      </div>
    </div>
  );
}
