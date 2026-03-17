import { motion } from "framer-motion";
import { Check, MapPin, Calendar, Users, QrCode } from "lucide-react";
import type { Property } from "@/data/properties";

interface BookingConfirmationProps {
  property: Property;
  slotId: string;
  guests: number;
  total: number;
  onDone: () => void;
}

export default function BookingConfirmation({ property, slotId, guests, total, onDone }: BookingConfirmationProps) {
  const slot = property.slots.find((s) => s.id === slotId)!;
  const bookingId = `HUSHH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 bg-background overflow-y-auto"
    >
      {/* Confetti-like particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--accent))" : "hsl(var(--tertiary))" }}
          initial={{
            x: "50vw",
            y: "30vh",
            scale: 0,
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 60}vh`,
            scale: [0, 1, 0],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: Math.random() * 0.5,
          }}
        />
      ))}

      <div className="flex flex-col items-center justify-start pt-20 px-6">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.3 }}
          className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Check size={36} className="text-success" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="font-display text-3xl font-extrabold text-foreground text-center"
        >
          You're all set! 🤫
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-sm mt-2"
        >
          Booking ID: {bookingId}
        </motion.p>

        {/* Booking card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="glass-card w-full mt-8 p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <img src={property.images[0]} alt={property.name} className="w-14 h-14 rounded-xl object-cover" />
            <div>
              <h3 className="font-bold text-foreground">{property.name}</h3>
              <p className="text-xs text-muted-foreground">{property.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} /> <span>{slot.label} · {slot.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users size={14} /> <span>{guests} guests</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total paid</span>
            <span className="text-accent font-bold text-lg">₹{total.toLocaleString()}</span>
          </div>

          {/* QR Code placeholder */}
          <div className="flex flex-col items-center pt-3 border-t border-border">
            <div className="w-24 h-24 bg-foreground/5 rounded-xl flex items-center justify-center border border-border">
              <QrCode size={48} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Show this at entry</p>
          </div>
        </motion.div>

        {/* Entry instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="glass-card w-full mt-4 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-primary" />
            <h4 className="font-semibold text-sm text-foreground">How to get there</h4>
          </div>
          <p className="text-xs text-muted-foreground">{property.entryInstructions}</p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="w-full mt-6 space-y-3 pb-10"
        >
          <button
            onClick={onDone}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shimmer-btn"
          >
            Go to My Bookings
          </button>
          <button className="w-full py-3 rounded-2xl bg-secondary text-foreground font-medium text-sm">
            Share with Friends
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
