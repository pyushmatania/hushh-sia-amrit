import { motion, useMotionValue, useTransform, useSpring, useAnimation, PanInfo } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronRight, Ticket, QrCode, Users, X } from "lucide-react";
import { useRef, useState, useCallback, useMemo } from "react";
import { properties } from "@/data/properties";
import PullToRefresh from "./PullToRefresh";
import type { Booking } from "@/pages/Index";

interface TripsScreenProps {
  bookings: Booking[];
  onViewDetail: (booking: Booking) => void;
  onRebook: (propertyId: string) => void;
  onCancel?: (bookingId: string) => void;
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

function SwipeableCard({
  booking,
  index,
  onViewDetail,
  onRebook,
  onCancel,
}: {
  booking: Booking;
  index: number;
  onViewDetail: (b: Booking) => void;
  onRebook: (id: string) => void;
  onCancel?: (id: string) => void;
}) {
  const controls = useAnimation();
  const swipeX = useMotionValue(0);
  const bgOpacity = useTransform(swipeX, [-150, -80, 0], [1, 0.8, 0]);
  const bgScale = useTransform(swipeX, [-150, -80, 0], [1, 0.9, 0.8]);
  const canSwipe = booking.status === "upcoming" && !!onCancel;

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (!canSwipe) {
      controls.start({ x: 0 });
      return;
    }
    if (info.offset.x < -120) {
      await controls.start({ x: -400, opacity: 0, transition: { duration: 0.3 } });
      onCancel!(booking.id);
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Cancel background */}
      {canSwipe && (
        <motion.div
          className="absolute inset-0 bg-destructive/90 rounded-3xl flex items-center justify-end pr-8"
          style={{ opacity: bgOpacity, scale: bgScale }}
        >
          <div className="flex flex-col items-center gap-1 text-white">
            <X size={24} />
            <span className="text-xs font-semibold">Cancel</span>
          </div>
        </motion.div>
      )}

      <motion.div
        animate={controls}
        style={{ x: swipeX }}
        drag={canSwipe ? "x" : false}
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        <TiltCard booking={booking} index={index} onViewDetail={onViewDetail} onRebook={onRebook} />
      </motion.div>
    </div>
  );
}

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
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              background: "radial-gradient(circle at 50% 50%, hsla(270, 80%, 75%, 0.25) 0%, transparent 60%)",
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

// Demo trips shown when no real bookings exist
const demoTrips: Booking[] = [
  {
    id: "demo-1",
    propertyId: "1",
    date: "Mar 25, 2026",
    slot: "Evening · 6 PM – 11 PM",
    guests: 4,
    total: 8500,
    status: "upcoming",
    bookingId: "HUSHH-DEMO01",
  },
  {
    id: "demo-2",
    propertyId: "2",
    date: "Mar 10, 2026",
    slot: "Full Day · 10 AM – 10 PM",
    guests: 8,
    total: 15200,
    status: "completed",
    bookingId: "HUSHH-DEMO02",
  },
  {
    id: "demo-3",
    propertyId: "3",
    date: "Feb 14, 2026",
    slot: "Night · 8 PM – 1 AM",
    guests: 2,
    total: 6000,
    status: "cancelled",
    bookingId: "HUSHH-DEMO03",
  },
];

const filterTabs = [
  { value: "all", label: "All", dotColor: "" },
  { value: "upcoming", label: "Upcoming", dotColor: "bg-primary" },
  { value: "completed", label: "Completed", dotColor: "bg-success" },
  { value: "cancelled", label: "Cancelled", dotColor: "bg-destructive" },
] as const;

export default function TripsScreen({ bookings, onViewDetail, onRebook, onCancel }: TripsScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
    setRefreshKey((k) => k + 1);
  }, []);

  const allBookings = useMemo(() => bookings.length > 0 ? bookings : demoTrips, [bookings]);
  const isDemo = bookings.length === 0;

  const filteredBookings = useMemo(
    () => activeFilter === "all" ? allBookings : allBookings.filter((b) => b.status === activeFilter),
    [allBookings, activeFilter]
  );

  // Count per status
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allBookings.length };
    allBookings.forEach((b) => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [allBookings]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div key={refreshKey} className="pb-24 bg-mesh min-h-screen">
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
          {onCancel ? "Swipe left on upcoming trips to cancel" : "Manage your upcoming and past bookings"}
        </motion.p>
      </div>

      {/* Filter tabs */}
      <div className="px-5 pt-1 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            const count = counts[tab.value] || 0;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all border ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/50 text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {tab.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`} />}
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-5 mt-1 mb-1 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20"
        >
          <p className="text-[11px] text-primary font-medium text-center">✨ These are sample trips — book a venue to see your real trips here!</p>
        </motion.div>
      )}

      {filteredBookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center pt-16 px-5"
        >
          <p className="text-sm text-muted-foreground">No {activeFilter} trips</p>
        </motion.div>
      ) : (
        <div className="px-5 pt-4 space-y-6">
          {filteredBookings.map((trip, i) => (
            <SwipeableCard
              key={trip.id}
              booking={trip}
              index={i}
              onViewDetail={onViewDetail}
              onRebook={onRebook}
              onCancel={isDemo ? undefined : onCancel}
            />
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}
