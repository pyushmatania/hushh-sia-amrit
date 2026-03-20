import { motion } from "framer-motion";
import { RotateCcw, MapPin, Calendar, Clock, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { type Property } from "@/data/properties";
import { useDbListings } from "@/hooks/use-db-listings";

interface LastVibeCardProps {
  onRebook: (property: Property) => void;
}

export default function LastVibeCard({ onRebook }: LastVibeCardProps) {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { properties } = useDbListings();

  // Find the most recent completed or upcoming booking
  const lastBooking = bookings.find(
    (b) => b.status === "completed" || b.status === "upcoming"
  );

  const property = lastBooking ? properties.find((p) => p.id === lastBooking.propertyId) : undefined;
  if (!lastBooking || !property) return null;

  return (
    <div className="px-4 pt-3 pb-1">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.10) 0%, hsl(var(--foreground) / 0.03) 100%)",
          border: "1px solid hsl(var(--primary) / 0.18)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.2), transparent 70%)" }}
        />

        <div className="flex gap-3 p-3.5">
          {/* Thumbnail */}
          <div className="w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 relative">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-1 left-1 right-1 flex justify-center">
              <span className="text-[8px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                🔁 Last Vibe
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                Your Last Vibe 🔁
              </p>
              <h4 className="text-sm font-bold text-foreground truncate">{property.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Calendar size={9} /> {lastBooking.date}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Users size={9} /> {lastBooking.guests}
                </span>
              </div>
            </div>
          </div>

          {/* Rebook CTA */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={(e) => {
              e.stopPropagation();
              onRebook(property);
            }}
            className="self-center shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)",
            }}
          >
            <RotateCcw size={12} />
            Rebook
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
