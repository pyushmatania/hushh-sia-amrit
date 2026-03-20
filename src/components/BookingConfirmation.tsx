import { motion } from "framer-motion";
import { Check, MapPin, Calendar, Users, QrCode, Clock, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { Property } from "@/data/properties";
import LiveOrderingSheet from "./LiveOrderingSheet";

interface BookingConfirmationProps {
  property: Property;
  slotId: string;
  guests: number;
  date: Date;
  total: number;
  onDone: () => void;
}

export default function BookingConfirmation({ property, slotId, guests, date, total, onDone }: BookingConfirmationProps) {
  const slot = property.slots.find((s) => s.id === slotId)!;
  const bookingId = `HUSHH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const [orderingOpen, setOrderingOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto"
    >
      <div className="flex flex-col items-center justify-start pt-20 px-6">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-5"
        >
          <Check size={32} className="text-success" strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-semibold text-foreground text-center"
        >
          You're all set!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-sm mt-1"
        >
          Booking ID: {bookingId}
        </motion.p>

        {/* Booking card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full mt-8 rounded-2xl border border-border p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <img src={property.images[0]} alt={property.name} className="w-14 h-14 rounded-xl object-cover" />
            <div>
              <h3 className="font-semibold text-foreground">{property.name}</h3>
              <p className="text-xs text-muted-foreground">{property.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Calendar size={14} /> {format(date, "EEEE, d MMMM yyyy")}</span>
            <span className="flex items-center gap-2"><Clock size={14} /> {slot.label} · {slot.time}</span>
            <span className="flex items-center gap-2"><Users size={14} /> {guests} guests</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total paid</span>
            <span className="text-foreground font-semibold text-lg">₹{total.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center pt-3 border-t border-border">
            <div className="w-24 h-24 bg-secondary rounded-xl flex items-center justify-center">
              <QrCode size={48} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Show this at entry</p>
          </div>
        </motion.div>

        {/* Entry instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full mt-4 rounded-2xl border border-border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-primary" />
            <h4 className="font-semibold text-sm text-foreground">How to get there</h4>
          </div>
          <p className="text-sm text-muted-foreground">{property.entryInstructions}</p>
        </motion.div>

        {/* Actions */}
        <div className="w-full mt-6 space-y-3 pb-10">
          <motion.button
            onClick={onDone}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm animate-pulse-glow"
            whileTap={{ scale: 0.96 }}
          >
            Go to My Trips
          </motion.button>
          <button className="w-full py-3 rounded-lg border border-foreground text-foreground font-medium text-sm">
            Share with Friends
          </button>
        </div>
      </div>
    </motion.div>
  );
}
