import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronRight } from "lucide-react";
import { properties } from "@/data/properties";

interface Trip {
  id: string;
  propertyId: string;
  date: string;
  slot: string;
  guests: number;
  total: number;
  status: "upcoming" | "completed" | "cancelled";
  bookingId: string;
}

const trips: Trip[] = [
  { id: "1", propertyId: "2", date: "Mar 18, 2026", slot: "Evening · 4-8 PM", guests: 4, total: 3199, status: "upcoming", bookingId: "HUSHH-A3K92F" },
  { id: "2", propertyId: "1", date: "Mar 15, 2026", slot: "Night · 8 PM-12 AM", guests: 2, total: 2499, status: "completed", bookingId: "HUSHH-B7M41D" },
  { id: "3", propertyId: "3", date: "Mar 10, 2026", slot: "Full Day", guests: 15, total: 8999, status: "cancelled", bookingId: "HUSHH-C2P68Q" },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  upcoming: { bg: "bg-primary/10", text: "text-primary", label: "Upcoming" },
  completed: { bg: "bg-success/10", text: "text-success", label: "Completed" },
  cancelled: { bg: "bg-destructive/10", text: "text-destructive", label: "Cancelled" },
};

export default function TripsScreen() {
  return (
    <div className="pb-24">
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

      <div className="px-5 space-y-4">
        {trips.map((trip, i) => {
          const property = properties.find((p) => p.id === trip.propertyId);
          if (!property) return null;
          const status = statusStyles[trip.status];

          return (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border overflow-hidden"
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
                    <button className="flex items-center gap-1 text-xs font-semibold text-primary">
                      View Details <ChevronRight size={14} />
                    </button>
                  )}
                  {trip.status === "completed" && (
                    <button className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      Book Again <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
