import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronRight, Ticket } from "lucide-react";
import { properties } from "@/data/properties";
import type { Booking } from "@/pages/Index";

interface TripsScreenProps {
  bookings: Booking[];
  onViewDetail: (booking: Booking) => void;
  onRebook: (propertyId: string) => void;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  upcoming: { bg: "bg-primary/10", text: "text-primary", label: "Upcoming" },
  completed: { bg: "bg-success/10", text: "text-success", label: "Completed" },
  cancelled: { bg: "bg-destructive/10", text: "text-destructive", label: "Cancelled" },
};

export default function TripsScreen({ bookings, onViewDetail, onRebook }: TripsScreenProps) {
  return (
    <div className="pb-24 bg-mesh min-h-screen">
      <div className="px-5 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Your Trips
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          Manage your upcoming and past bookings
        </motion.p>
      </div>

      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-5 pt-20"
        >
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Ticket size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No trips yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-[260px]">
            When you book a venue or experience, it will show up here.
          </p>
        </motion.div>
      ) : (
        <div className="px-5 space-y-4">
          {bookings.map((trip, i) => {
            const property = properties.find((p) => p.id === trip.propertyId);
            if (!property) return null;
            const status = statusStyles[trip.status];

            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-border overflow-hidden cursor-pointer"
                onClick={() => onViewDetail(trip)}
                whileTap={{ scale: 0.98 }}
              >
                {/* Image */}
                <div className="relative h-32">
                  <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
                  <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[15px] text-foreground truncate">{property.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {property.location}
                      </p>
                    </div>
                    <span className="text-foreground font-bold text-base shrink-0">₹{trip.total.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {trip.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {trip.slot}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-[11px] text-muted-foreground">ID: {trip.bookingId}</span>
                    {trip.status === "upcoming" && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                        View Details <ChevronRight size={14} />
                      </span>
                    )}
                    {trip.status === "completed" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRebook(trip.propertyId); }}
                        className="flex items-center gap-1 text-xs font-semibold text-foreground"
                      >
                        Book Again <ChevronRight size={14} />
                      </button>
                    )}
                    {trip.status === "cancelled" && (
                      <span className="text-xs text-muted-foreground">Cancelled</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
