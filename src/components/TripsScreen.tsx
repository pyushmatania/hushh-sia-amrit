import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useAnimation, useScroll, PanInfo } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Clock, ChevronRight, Ticket, QrCode, Users, X, Utensils, ShoppingCart, Shield, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { useRef, useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import { Calendar } from "@/components/ui/calendar";
import type { Booking } from "@/pages/Index";
import OrderHistorySection from "./OrderHistorySection";
import LiveOrderingSheet from "./LiveOrderingSheet";
import IdentityUploadSheet from "./IdentityUploadSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import EmptyState from "./shared/EmptyState";
import BookingQRCode from "./shared/BookingQRCode";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { format } from "date-fns";

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

/* ── 3D Floating QR Card ── */
function FloatingQRCard() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        <RoundedBox args={[3.2, 3.2, 0.08]} radius={0.15} smoothness={4}>
          <meshPhysicalMaterial color="#f8f5ff" roughness={0.15} metalness={0.05} clearcoat={1} clearcoatRoughness={0.1} />
        </RoundedBox>
        <RoundedBox args={[3.3, 3.3, 0.06]} radius={0.16} smoothness={4} position={[0, 0, -0.02]}>
          <meshStandardMaterial color="#d4a853" roughness={0.3} metalness={0.7} />
        </RoundedBox>
        <RoundedBox args={[3.4, 3.4, 0.04]} radius={0.17} smoothness={4} position={[0, 0, -0.04]}>
          <meshStandardMaterial color="#9333ea" roughness={0.4} metalness={0.5} transparent opacity={0.6} />
        </RoundedBox>
      </group>
    </Float>
  );
}

function SwipeableCard({
  booking,
  index,
  onViewDetail,
  onRebook,
  onCancel,
  onOrderFood,
  onShowQR,
}: {
  booking: Booking;
  index: number;
  onViewDetail: (b: Booking) => void;
  onRebook: (id: string) => void;
  onCancel?: (id: string) => void;
  onOrderFood?: (b: Booking) => void;
  onShowQR?: (bookingId: string) => void;
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
        <TiltCard booking={booking} index={index} onViewDetail={onViewDetail} onRebook={onRebook} onOrderFood={onOrderFood} onShowQR={onShowQR} />
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
  onShowQR,
}: {
  booking: Booking;
  index: number;
  onViewDetail: (b: Booking) => void;
  onRebook: (id: string) => void;
  onOrderFood?: (b: Booking) => void;
  onShowQR?: (bookingId: string) => void;
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
        {/* Multi-layer depth shadow — light-mode-aware */}
        <div className="absolute -inset-[1px] rounded-3xl pointer-events-none shadow-[0_2px_8px_hsla(260,20%,20%,0.08),0_8px_24px_hsla(260,20%,20%,0.10),0_16px_40px_hsla(270,60%,50%,0.08)] dark:shadow-[0_2px_4px_hsla(0,0%,0%,0.3),0_8px_16px_hsla(0,0%,0%,0.25),0_16px_32px_hsla(0,0%,0%,0.2),0_24px_48px_-8px_hsla(270,60%,50%,0.15)]" />

        <div className="relative bg-card rounded-3xl overflow-hidden border border-border">
          {/* Background image */}
          <div className="relative h-[220px] overflow-hidden">
            <motion.img src={property.images[0]} alt={property.name} className="w-full h-[260px] object-cover" style={{ y: imgY }} />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

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
              <motion.button
                className="absolute top-4 left-4 w-10 h-10 glass rounded-xl flex items-center justify-center z-10"
                style={{ transform: "translateZ(25px)", boxShadow: "0 4px 16px hsla(0,0%,0%,0.3)" }}
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                onClick={(e) => { e.stopPropagation(); onShowQR?.(booking.bookingId); }}
                whileTap={{ scale: 0.9 }}
              >
                <QrCode size={18} className="text-foreground" />
              </motion.button>
            )}
          </div>

          {/* Card content */}
          <div className="relative px-5 pb-5 -mt-8" style={{ transform: "translateZ(20px)" }}>
            <div className="rounded-2xl p-4 space-y-3 border border-border bg-card">
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
                <span className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                  <CalendarIcon size={12} className="text-primary" /> {booking.date}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                  <Clock size={12} className="text-primary" /> {booking.slot}
                </span>
                <span className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                  <Users size={12} className="text-primary" /> {booking.guests}
                </span>
                {booking.roomsCount && booking.roomsCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5 text-xs text-foreground">
                    🛏️ {booking.roomsCount} {booking.roomsCount === 1 ? "room" : "rooms"}
                  </span>
                )}
                {booking.extraMattresses && booking.extraMattresses > 0 && (
                  <span className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-2.5 py-1.5 text-xs text-primary font-medium">
                    🛏️ +{booking.extraMattresses} mattress
                  </span>
                )}
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

        </div>
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
  const { properties } = usePropertiesData();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [orderingBooking, setOrderingBooking] = useState<Booking | null>(null);
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const [idSheetOpen, setIdSheetOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedCalDate, setSelectedCalDate] = useState<Date | undefined>(undefined);
  const [qrBookingId, setQrBookingId] = useState<string | null>(null);
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

  // Build set of booked dates for the calendar
  const bookedDatesMap = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => {
      if (b.status === "cancelled") return;
      const parsed = new Date(b.date);
      if (!isNaN(parsed.getTime())) {
        const key = `${parsed.getFullYear()}-${parsed.getMonth()}-${parsed.getDate()}`;
        map.set(key, [...(map.get(key) || []), b]);
      }
    });
    return map;
  }, [bookings]);

  const bookedDates = useMemo(() =>
    Array.from(bookedDatesMap.keys()).map(key => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m, d);
    }),
    [bookedDatesMap]
  );

  const selectedDateBookings = useMemo(() => {
    if (!selectedCalDate) return [];
    const key = `${selectedCalDate.getFullYear()}-${selectedCalDate.getMonth()}-${selectedCalDate.getDate()}`;
    return bookedDatesMap.get(key) || [];
  }, [selectedCalDate, bookedDatesMap]);

  return (
    <div key={refreshKey} className="pb-24 bg-mesh min-h-screen md:h-[calc(100vh-4rem)] md:overflow-y-auto">
      <div className="px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-6 pb-2">
        <div className="flex items-center justify-between md:max-w-3xl md:mx-auto">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground"
            >
              Your Trips
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-muted-foreground mt-1"
            >
              {onCancel ? "Swipe left on upcoming trips to cancel" : "Manage your bookings"}
            </motion.p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setCalendarOpen(!calendarOpen); setSelectedCalDate(undefined); }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all md:cursor-pointer ${
              calendarOpen ? "bg-primary/10 border-primary/30 text-primary" : "bg-secondary border-border text-muted-foreground md:hover:bg-muted/50"
            }`}
          >
            <CalendarIcon size={18} />
          </motion.button>
        </div>
      </div>

      {/* Booking Calendar */}
      <AnimatePresence>
        {calendarOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32"
          >
            <div className="rounded-2xl border border-border bg-card p-3 mb-3 md:max-w-3xl md:mx-auto">
              <Calendar
                mode="single"
                selected={selectedCalDate}
                onSelect={setSelectedCalDate}
                modifiers={{ booked: bookedDates }}
                modifiersClassNames={{ booked: "bg-primary/20 text-primary font-bold rounded-lg" }}
                className="rounded-xl pointer-events-auto"
              />
              {selectedCalDate && selectedDateBookings.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {selectedDateBookings.length} booking{selectedDateBookings.length > 1 ? "s" : ""} on this date
                  </p>
                  {selectedDateBookings.map(b => {
                    const prop = properties.find(p => p.id === b.propertyId);
                    return (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => onViewDetail(b)}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 border border-border/50 cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        {prop && (
                          <img src={prop.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{prop?.name || "Property"}</p>
                          <p className="text-[10px] text-muted-foreground">{b.slot} · {b.guests} guests</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === "active" ? "bg-success/15 text-success" :
                          b.status === "upcoming" ? "bg-primary/15 text-primary" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {b.status}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {selectedCalDate && selectedDateBookings.length === 0 && (
                <p className="text-center text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  No bookings on this date
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-1 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide md:flex-wrap md:justify-center md:max-w-3xl md:mx-auto">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            const count = counts[tab.value] || 0;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all border md:cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/50 text-muted-foreground hover:border-foreground/20 md:hover:bg-muted/50"
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
        <div className="px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 mb-1 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 md:max-w-3xl md:mx-auto"
          >
            <p className="text-[11px] md:text-xs text-primary font-medium text-center">✨ These are sample trips — book a venue to see your real trips here!</p>
          </motion.div>
        </div>
      )}

      {/* ID Verification Banner */}
      {idVerified === false && (
        <div className="px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 mb-1 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 md:max-w-3xl md:mx-auto"
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
        </div>
      )}

      <IdentityUploadSheet open={idSheetOpen} onClose={() => setIdSheetOpen(false)} />

      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={MapPin}
          emoji={activeFilter === "cancelled" ? "🚫" : activeFilter === "completed" ? "✅" : "🗺️"}
          title={`No ${activeFilter === "all" ? "" : activeFilter + " "}trips`}
          description={activeFilter === "all"
            ? "Your adventures will show up here once you book a property. Start exploring!"
            : `You don't have any ${activeFilter} trips right now.`}
        />
      ) : (
        <div className="px-5 md:px-8 lg:px-16 xl:px-24 2xl:px-32 pt-4 space-y-6 md:max-w-3xl md:mx-auto md:grid md:grid-cols-1 xl:max-w-5xl xl:grid-cols-2 md:gap-5 md:space-y-0">
          {filteredBookings.map((trip, i) => (
            <SwipeableCard
              key={trip.id}
              booking={trip}
              index={i}
              onViewDetail={onViewDetail}
              onRebook={onRebook}
              onCancel={isDemo ? undefined : onCancel}
              onOrderFood={trip.status === "active" ? handleOrderFood : undefined}
              onShowQR={(bid) => setQrBookingId(bid)}
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

      {/* Full-screen 3D QR modal */}
      <AnimatePresence>
        {qrBookingId && (() => {
          const qrBooking = bookings.find(b => b.bookingId === qrBookingId);
          const qrProperty = qrBooking ? properties.find(p => p.id === qrBooking.propertyId) : null;
          const slot = qrProperty?.slots.find(s => s.id === qrBooking?.slot);

          return (
            <motion.div
              key="qr-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center"
              onClick={() => setQrBookingId(null)}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

              {/* Close button */}
              <button
                onClick={() => setQrBookingId(null)}
                className="absolute top-12 right-5 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X size={20} className="text-white" />
              </button>

              {/* 3D Canvas behind QR */}
              <div className="absolute inset-0 pointer-events-none">
                <Suspense fallback={null}>
                  <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <ambientLight intensity={0.4} />
                    <pointLight position={[5, 5, 5]} intensity={0.8} color="#d4a853" />
                    <pointLight position={[-5, -3, 3]} intensity={0.5} color="#9333ea" />
                    <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={0.6} color="#ffffff" />
                    <FloatingQRCard />
                    <Environment preset="city" />
                  </Canvas>
                </Suspense>
              </div>

              {/* QR Code overlay */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10"
                style={{ perspective: "1000px" }}
              >
                <BookingQRCode bookingId={qrBookingId} size={180} />
              </motion.div>

              {/* Booking info card below QR */}
              {qrBooking && qrProperty && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 mt-6 mx-6 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={qrProperty.images[0]}
                      alt={qrProperty.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/20"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{qrProperty.name}</h4>
                      <p className="text-white/50 text-xs flex items-center gap-1">
                        <MapPin size={10} /> {qrProperty.location}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-white/70">
                      <CalendarIcon size={12} className="text-[#d4a853]" />
                      {format(new Date(qrBooking.date), "d MMM yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 text-white/70">
                      <Clock size={12} className="text-[#9333ea]" />
                      {slot?.label || "Confirmed"}
                    </div>
                    <div className="flex items-center gap-1.5 text-white/70">
                      <Users size={12} className="text-[#d4a853]" />
                      {qrBooking.guests} guests
                    </div>
                    <div className="flex items-center gap-1.5 text-white/70">
                      <Ticket size={12} className="text-[#9333ea]" />
                      ₹{qrBooking.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 text-center">
                    <span className="text-[10px] font-mono text-white/40 tracking-wider">{qrBookingId}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
