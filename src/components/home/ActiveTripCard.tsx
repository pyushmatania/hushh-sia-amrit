import { motion } from "framer-motion";
import { Utensils, MapPin, Calendar, Clock, Users, ChevronRight, Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { type Property } from "@/data/properties";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import LiveOrderingSheet from "@/components/LiveOrderingSheet";

interface ActiveTripCardProps {
  onViewTrip: (property: Property) => void;
}

export default function ActiveTripCard({ onViewTrip }: ActiveTripCardProps) {
  const { properties } = usePropertiesData();
  const { bookings } = useBookings();
  const [orderingOpen, setOrderingOpen] = useState(false);

  const activeBooking = bookings.find((b) => b.status === "active");
  if (!activeBooking) return null;

  const property = properties.find((p) => p.id === activeBooking.propertyId);
  if (!property) return null;

  return (
    <div className="px-4 pt-3 pb-1 md:px-0 md:pt-4 md:pb-2">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden md:rounded-3xl"
        style={{
          background: "linear-gradient(135deg, hsl(160 60% 42% / 0.12) 0%, hsl(var(--foreground) / 0.03) 100%)",
          border: "1px solid hsl(160 60% 42% / 0.25)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-10 -right-10 w-28 h-28 md:w-48 md:h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(160 60% 42% / 0.25), transparent 70%)" }}
        />

        {/* Live pulse indicator */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 rounded-full" style={{ background: "hsl(160 60% 42% / 0.2)" }}>
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse" style={{ background: "hsl(160 84% 39%)" }} />
          <span className="text-[9px] md:text-xs font-bold" style={{ color: "hsl(160 84% 39%)" }}>CHECKED IN</span>
        </div>

        <div className="flex gap-3 p-3.5 md:gap-5 md:p-5">
          {/* Thumbnail */}
          <div className="w-[72px] h-[72px] md:w-[120px] md:h-[120px] rounded-xl md:rounded-2xl overflow-hidden shrink-0 relative">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-1 left-1 right-1 md:bottom-2 md:left-2 md:right-2 flex justify-center">
              <span className="text-[8px] md:text-[10px] font-bold text-white/90 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full" style={{ background: "hsl(160 60% 30% / 0.8)" }}>
                🏨 Now
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 md:py-1">
            <div>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1" style={{ color: "hsl(160 84% 39%)" }}>
                Ongoing Trip ⚡
              </p>
              <h4 className="text-sm md:text-lg font-bold text-foreground truncate">{property.name}</h4>
              <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1.5">
                <span className="text-[10px] md:text-sm text-muted-foreground flex items-center gap-0.5 md:gap-1">
                  <Clock size={9} className="md:w-3.5 md:h-3.5" /> {activeBooking.slot.split("·")[1]?.trim() || activeBooking.slot}
                </span>
                <span className="text-[10px] md:text-sm text-muted-foreground flex items-center gap-0.5 md:gap-1">
                  <Users size={9} className="md:w-3.5 md:h-3.5" /> {activeBooking.guests}
                </span>
              </div>
            </div>
          </div>

          {/* Order Food CTA */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={(e) => {
              e.stopPropagation();
              setOrderingOpen(true);
            }}
            className="self-center shrink-0 flex items-center gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold md:hover:brightness-110 md:transition-all md:cursor-pointer"
            style={{
              background: "hsl(160 84% 39%)",
              color: "white",
              boxShadow: "0 4px 16px hsl(160 84% 39% / 0.3)",
            }}
          >
            <Utensils size={12} className="md:w-4 md:h-4" />
            Order
          </motion.button>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center justify-between px-3.5 pb-3 gap-2 md:px-5 md:pb-4 md:gap-3">
          <button
            onClick={() => onViewTrip(property)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-semibold text-foreground border border-foreground/10 active:scale-[0.97] transition-transform md:hover:bg-foreground/[0.06] md:cursor-pointer"
            style={{ background: "hsl(var(--foreground) / 0.04)" }}
          >
            <MapPin size={11} className="md:w-4 md:h-4" /> View Trip <ChevronRight size={11} className="md:w-4 md:h-4" />
          </button>
        </div>
      </motion.div>

      {/* Live ordering sheet */}
      <LiveOrderingSheet
        open={orderingOpen}
        onClose={() => setOrderingOpen(false)}
        propertyName={property.name}
        propertyId={activeBooking.propertyId}
        bookingId={activeBooking.bookingId}
      />
    </div>
  );
}
