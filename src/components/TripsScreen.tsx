import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronRight, Ticket, QrCode, Users } from "lucide-react";
import { useRef, useState } from "react";
import { properties } from "@/data/properties";
import type { Booking } from "@/pages/Index";

interface TripsScreenProps {
  bookings: Booking[];
  onViewDetail: (booking: Booking) => void;
  onRebook: (propertyId: string) => void;
}

const statusConfig: Record<string, { gradient: string; glow: string; label: string; dotColor: string }> = {
  upcoming: {
    gradient: "from-primary/80 to-primary/40",
    glow: "shadow-[0_8px_32px_-8px_hsla(270,80%,65%,0.5)]",
    label: "Upcoming",
    dotColor: "bg-primary",
  },
  completed: {
    gradient: "from-success/80 to-success/40",
    glow: "shadow-[0_8px_32px_-8px_hsla(160,60%,42%,0.4)]",
    label: "Completed",
    dotColor: "bg-success",
  },
  cancelled: {
    gradient: "from-destructive/60 to-destructive/30",
    glow: "shadow-[0_8px_32px_-8px_hsla(0,72%,55%,0.3)]",
    label: "Cancelled",
    dotColor: "bg-destructive",
  },
};

function TiltCard({
  booking,
  index,
  onViewDetail,
  onRebook,
}: {
  booking: Booking;
  index: number;
  onViewDetail: (b: Booking) => void;
  onRebook: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-150, 150], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-150, 150], [-12, 12]), { stiffness: 300, damping: 30 });
  const glareX = useTransform(x, [-150, 150], [0, 100]);
  const glareY = useTransform(y, [-150, 150], [0, 100]);
  const glareOpacity = useTransform(x, [-150, 0, 150], [0.15, 0, 0.15]);

  const property = properties.find((p) => p.id === booking.propertyId);
  if (!property) return null;

  const status = statusConfig[booking.status];

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.12, type: "spring", stiffness: 200, damping: 20 }}
      style={{ perspective: 800 }}
      className="w-full"
    >
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={() => onViewDetail(booking)}
        className={`relative rounded-3xl overflow-hidden cursor-pointer ${status.glow} transition-shadow duration-300`}
      >
        {/* Background image with overlay */}
        <div className="relative h-[220px]">
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />

          {/* Holographic glare effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: useTransform(
                [glareX, glareY] as any,
                ([gx, gy]: number[]) =>
                  `radial-gradient(circle at ${gx}% ${gy}%, hsla(270, 80%, 75%, var(--glare-opacity)) 0%, transparent 60%)`
              ),
              opacity: glareOpacity,
            }}
          />

          {/* Status pill */}
          <div className="absolute top-4 right-4" style={{ transform: "translateZ(30px)" }}>
            <div className={`flex items-center gap-1.5 bg-gradient-to-r ${status.gradient} backdrop-blur-md px-3 py-1.5 rounded-full`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`} />
              <span className="text-[11px] font-semibold text-primary-foreground">{status.label}</span>
            </div>
          </div>

          {/* Floating QR mini badge for upcoming */}
          {booking.status === "upcoming" && (
            <motion.div
              className="absolute top-4 left-4 w-10 h-10 glass rounded-xl flex items-center justify-center"
              style={{ transform: "translateZ(25px)" }}
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <QrCode size={18} className="text-foreground" />
            </motion.div>
          )}
        </div>

        {/* Card content — floating above */}
        <div
          className="relative px-5 pb-5 -mt-8"
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Glass info card */}
          <div className="glass rounded-2xl p-4 space-y-3">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-base text-foreground truncate">{property.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {property.location}
                </p>
              </div>
              <span className="text-foreground font-bold text-lg shrink-0 text-gradient-warm">
                ₹{booking.total.toLocaleString()}
              </span>
            </div>

            {/* Info chips */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                <Calendar size={12} className="text-primary" /> {booking.date}
              </span>
              <span className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                <Clock size={12} className="text-primary" /> {booking.slot}
              </span>
              <span className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                <Users size={12} className="text-primary" /> {booking.guests}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground font-mono tracking-wide">{booking.bookingId}</span>
              {booking.status === "upcoming" && (
                <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                  View <ChevronRight size={14} />
                </span>
              )}
              {booking.status === "completed" && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRebook(booking.propertyId); }}
                  className="flex items-center gap-1 text-xs font-semibold text-foreground"
                >
                  Book Again <ChevronRight size={14} />
                </button>
              )}
              {booking.status === "cancelled" && (
                <span className="text-xs text-destructive/70">Refund processing</span>
              )}
            </div>
          </div>
        </div>

        {/* Subtle border shine */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none border border-border/30" />
      </motion.div>
    </motion.div>
  );
}

export default function TripsScreen({ bookings, onViewDetail, onRebook }: TripsScreenProps) {
  return (
    <div className="pb-24 bg-mesh min-h-screen">
      <div className="px-5 pt-6 pb-2">
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
          <motion.div
            className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-5"
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ perspective: 600, transformStyle: "preserve-3d" }}
          >
            <Ticket size={36} className="text-muted-foreground" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No trips yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-[260px]">
            When you book a venue or experience, it will show up here.
          </p>
        </motion.div>
      ) : (
        <div className="px-5 pt-4 space-y-6">
          {bookings.map((trip, i) => (
            <TiltCard
              key={trip.id}
              booking={trip}
              index={i}
              onViewDetail={onViewDetail}
              onRebook={onRebook}
            />
          ))}
        </div>
      )}
    </div>
  );
}
