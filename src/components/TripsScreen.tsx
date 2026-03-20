import { motion, useMotionValue, useTransform, useSpring, useAnimation, useScroll, PanInfo } from "framer-motion";
import { MapPin, Calendar, Clock, ChevronRight, Ticket, QrCode, Users, X, Utensils, ShoppingCart, Shield, Upload } from "lucide-react";
import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import PullToRefresh from "./PullToRefresh";
import type { Booking } from "@/pages/Index";
import OrderHistorySection from "./OrderHistorySection";
import LiveOrderingSheet from "./LiveOrderingSheet";
import IdentityUploadSheet from "./IdentityUploadSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface TripsScreenProps {
  bookings: Booking[];
  onViewDetail: (booking: Booking) => void;
  onRebook: (propertyId: string) => void;
  onCancel?: (bookingId: string) => void;
}

const statusConfig: Record<string, { gradient: string; glow: string; label: string; dotColor: string }> = {
  active: {
    gradient: "from-success/80 to-success/40",
    glow: "shadow-[0_8px_32px_-8px_hsla(160,60%,42%,0.5)]",
    label: "Checked In",
    dotColor: "bg-success",
  },
  upcoming: {
    gradient: "from-primary/80 to-primary/40",
    glow: "shadow-[0_8px_32px_-8px_hsla(270,80%,65%,0.5)]",
    label: "Upcoming",
    dotColor: "bg-primary",
  },
  completed: {
    gradient: "from-muted-foreground/60 to-muted-foreground/30",
    glow: "",
    label: "Completed",
    dotColor: "bg-muted-foreground",
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
  onOrderFood,
}: {
  booking: Booking;
  index: number;
  onViewDetail: (b: Booking) => void;
  onRebook: (id: string) => void;
  onCancel?: (id: string) => void;
  onOrderFood?: (b: Booking) => void;
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
        <TiltCard booking={booking} index={index} onViewDetail={onViewDetail} onRebook={onRebook} onOrderFood={onOrderFood} />
      </motion.div>
    </div>
  );
}

function TiltCard({
  booking,
  index,
  onViewDetail,
  onRebook,
  onOrderFood,
}: {
  booking: Booking;
  index: number;
  onViewDetail: (b: Booking) => void;
  onRebook: (id: string) => void;
  onOrderFood?: (b: Booking) => void;
}) {
  const { properties } = usePropertiesData();
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const rotateX = useSpring(useTransform(y, [-150, 150], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-150, 150], [-12, 12]), { stiffness: 300, damping: 30 });
  const glareOpacity = useTransform(x, [-150, 0, 150], [0.15, 0, 0.15]);

  const property = properties.find((p) => p.id === booking.propertyId);
  if (!property) return null;

  const status = statusConfig[booking.status] || statusConfig.upcoming;

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handlePointerLeave = () => { x.set(0); y.set(0); };

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
        className="relative rounded-3xl overflow-hidden cursor-pointer transition-shadow duration-300"
        whileHover={{ y: -4 }}
      >
        {/* Multi-layer depth shadow */}
        <div className="absolute -inset-[1px] rounded-3xl pointer-events-none" style={{
          boxShadow: `0 2px 4px hsla(0,0%,0%,0.3), 0 8px 16px hsla(0,0%,0%,0.25), 0 16px 32px hsla(0,0%,0%,0.2), 0 24px 48px -8px hsla(270,60%,50%,0.15), inset 0 1px 0 hsla(0,0%,100%,0.08)`,
        }} />

        <div className="relative bg-card rounded-3xl overflow-hidden border border-border/40" style={{
          boxShadow: `inset 0 1px 0 hsla(0,0%,100%,0.06), inset 0 -1px 0 hsla(0,0%,0%,0.2)`,
        }}>
          {/* Background image */}
          <div className="relative h-[220px] overflow-hidden">
            <motion.img src={property.images[0]} alt={property.name} className="w-full h-[260px] object-cover" style={{ y: imgY }} />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <motion.div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at 30% 20%, hsla(270, 80%, 75%, 0.2) 0%, transparent 50%)`,
              opacity: glareOpacity,
            }} />

            {/* Status pill */}
            <div className="absolute top-4 right-4" style={{ transform: "translateZ(30px)" }}>
              <div className={`flex items-center gap-1.5 bg-gradient-to-r ${status.gradient} backdrop-blur-md px-3 py-1.5 rounded-full`} style={{ boxShadow: "0 4px 12px hsla(0,0%,0%,0.3)" }}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${booking.status === "active" ? "animate-pulse" : ""}`} />
                <span className="text-[11px] font-semibold text-primary-foreground">{status.label}</span>
              </div>
            </div>

            {/* QR badge for upcoming/active */}
            {(booking.status === "upcoming" || booking.status === "active") && (
              <motion.div
                className="absolute top-4 left-4 w-10 h-10 glass rounded-xl flex items-center justify-center"
                style={{ transform: "translateZ(25px)", boxShadow: "0 4px 16px hsla(0,0%,0%,0.3)" }}
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <QrCode size={18} className="text-foreground" />
              </motion.div>
            )}
          </div>

          {/* Card content */}
          <div className="relative px-5 pb-5 -mt-8" style={{ transform: "translateZ(20px)" }}>
            <div className="rounded-2xl p-4 space-y-3 border border-border/40" style={{
              background: "linear-gradient(135deg, hsla(0,0%,100%,0.06) 0%, hsla(0,0%,100%,0.02) 100%)",
              backdropFilter: "blur(20px) saturate(1.4)",
              boxShadow: `0 4px 16px hsla(0,0%,0%,0.3), inset 0 1px 0 hsla(0,0%,100%,0.08)`,
            }}>
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

              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-secondary/80 rounded-lg px-2.5 py-1.5 text-xs text-foreground" style={{ boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.04), 0 1px 2px hsla(0,0%,0%,0.15)" }}>
                  <Calendar size={12} className="text-primary" /> {booking.date}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary/80 rounded-lg px-2.5 py-1.5 text-xs text-foreground" style={{ boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.04), 0 1px 2px hsla(0,0%,0%,0.15)" }}>
                  <Clock size={12} className="text-primary" /> {booking.slot}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary/80 rounded-lg px-2.5 py-1.5 text-xs text-foreground" style={{ boxShadow: "inset 0 1px 0 hsla(0,0%,100%,0.04), 0 1px 2px hsla(0,0%,0%,0.15)" }}>
                  <Users size={12} className="text-primary" /> {booking.guests}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground font-mono tracking-wide">{booking.bookingId}</span>
                {booking.status === "active" && onOrderFood && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onOrderFood(booking); }}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                    style={{ background: "hsl(160 84% 39%)", color: "white" }}
                  >
                    <Utensils size={12} /> Order Food
                  </button>
                )}
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

          <div className="absolute bottom-0 left-2 right-2 h-[6px] rounded-b-3xl pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, hsla(0,0%,0%,0.25))" }} />
        </div>

        <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/[0.06]" />
        <div className="absolute top-2 bottom-2 -left-[1px] w-[2px] pointer-events-none rounded-l-3xl" style={{ background: "linear-gradient(to right, hsla(0,0%,0%,0.3), transparent)" }} />
        <div className="absolute top-2 bottom-2 -right-[1px] w-[2px] pointer-events-none rounded-r-3xl" style={{ background: "linear-gradient(to left, hsla(0,0%,0%,0.3), transparent)" }} />
      </motion.div>
    </motion.div>
  );
}

const filterTabs = [
  { value: "all", label: "All", dotColor: "" },
  { value: "active", label: "Active", dotColor: "bg-success" },
  { value: "upcoming", label: "Upcoming", dotColor: "bg-primary" },
  { value: "completed", label: "Past", dotColor: "bg-muted-foreground" },
  { value: "cancelled", label: "Cancelled", dotColor: "bg-destructive" },
] as const;

export default function TripsScreen({ bookings, onViewDetail, onRebook, onCancel }: TripsScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [orderingBooking, setOrderingBooking] = useState<Booking | null>(null);
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const [idSheetOpen, setIdSheetOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) { setIdVerified(false); return; }
      const { data } = await supabase
        .from("identity_verifications")
        .select("status")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1);
      setIdVerified(data && data.length > 0 && data[0].status === "approved");
    };
    checkVerification();
  }, [user]);

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 800));
    setRefreshKey((k) => k + 1);
  }, []);

  // bookings already includes demo data for guests (from useBookings hook)
  const isDemo = bookings.some((b) => b.id.startsWith("demo-"));

  // Sort: active first, then upcoming, then completed, then cancelled
  const sortedBookings = useMemo(() => {
    const order: Record<string, number> = { active: 0, upcoming: 1, completed: 2, cancelled: 3 };
    return [...bookings].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }, [bookings]);

  const filteredBookings = useMemo(
    () => activeFilter === "all" ? sortedBookings : sortedBookings.filter((b) => b.status === activeFilter),
    [sortedBookings, activeFilter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    bookings.forEach((b) => { c[b.status] = (c[b.status] || 0) + 1; });
    return c;
  }, [bookings]);

  const handleOrderFood = useCallback((booking: Booking) => {
    setOrderingBooking(booking);
  }, []);

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
          {onCancel ? "Swipe left on upcoming trips to cancel" : "Manage your bookings"}
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

      {/* ID Verification Banner */}
      {idVerified === false && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 mt-2 mb-1 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Identity not verified</p>
              <p className="text-[10px] text-muted-foreground">Upload your ID for a smoother check-in experience</p>
            </div>
            <button
              onClick={() => setIdSheetOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-bold shrink-0 active:scale-95 transition-transform flex items-center gap-1"
            >
              <Upload size={10} /> Verify
            </button>
          </div>
        </motion.div>
      )}

      <IdentityUploadSheet open={idSheetOpen} onClose={() => setIdSheetOpen(false)} />

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
              onOrderFood={trip.status === "active" ? handleOrderFood : undefined}
            />
          ))}
        </div>
      )}

      {/* Order History — only for past orders */}
      <OrderHistorySection />

      {/* Live ordering sheet for active trip */}
      {orderingBooking && (() => {
        const orderProp = properties.find(p => p.id === orderingBooking.propertyId);
        return (
          <LiveOrderingSheet
            open={!!orderingBooking}
            onClose={() => setOrderingBooking(null)}
            propertyName={orderProp?.name || ""}
            propertyId={orderingBooking.propertyId}
            bookingId={orderingBooking.bookingId}
          />
        );
      })()}
    </div>
    </PullToRefresh>
  );
}
