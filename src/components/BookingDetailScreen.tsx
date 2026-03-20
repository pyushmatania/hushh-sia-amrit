import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Calendar, Clock, Users, QrCode,
  Phone, MessageCircle, X, AlertTriangle, Check, ChevronRight,
  Navigation, Share2, Plus, Minus, Sparkles, ShoppingBag
} from "lucide-react";
import { useState, useMemo } from "react";
import { properties, addons, type Addon } from "@/data/properties";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/pages/Index";

interface BookingDetailScreenProps {
  booking: Booking;
  onBack: () => void;
  onCancel: (bookingId: string) => void;
  onRebook: (propertyId: string) => void;
}

export default function BookingDetailScreen({ booking, onBack, onCancel, onRebook }: BookingDetailScreenProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAddonsSheet, setShowAddonsSheet] = useState(false);
  const [addonSelections, setAddonSelections] = useState<Record<string, number>>({});
  const [orderedAddons, setOrderedAddons] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const { toast } = useToast();

  const property = properties.find((p) => p.id === booking.propertyId);
  if (!property) return null;

  const isUpcoming = booking.status === "upcoming";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled" || cancelled;

  const addonTotal = useMemo(() => {
    return Object.entries(addonSelections).reduce((sum, [id, qty]) => {
      for (const group of Object.values(addons)) {
        const item = group.find((a) => a.id === id);
        if (item) return sum + item.price * qty * (item.perPerson ? booking.guests : 1);
      }
      return sum;
    }, 0);
  }, [addonSelections, booking.guests]);

  const toggleAddon = (id: string, delta: number) => {
    setAddonSelections((prev) => {
      const next = { ...prev };
      const val = (next[id] || 0) + delta;
      if (val <= 0) delete next[id];
      else next[id] = val;
      return next;
    });
  };

  const handleOrderAddons = () => {
    const items: { name: string; qty: number; price: number }[] = [];
    Object.entries(addonSelections).forEach(([id, qty]) => {
      for (const group of Object.values(addons)) {
        const item = group.find((a) => a.id === id);
        if (item) {
          items.push({ name: item.name, qty, price: item.price * qty * (item.perPerson ? booking.guests : 1) });
        }
      }
    });
    setOrderedAddons((prev) => [...prev, ...items]);
    setAddonSelections({});
    setShowAddonsSheet(false);
    toast({
      title: "🎉 Add-ons Ordered!",
      description: `₹${addonTotal.toLocaleString()} extra added to your trip`,
    });
  };

  const orderedTotal = orderedAddons.reduce((s, a) => s + a.price, 0);

  const handleConfirmCancel = () => {
    setCancelling(true);
    setTimeout(() => {
      onCancel(booking.id);
      setCancelling(false);
      setCancelled(true);
      setShowCancelDialog(false);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-32"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass px-5 py-3">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center"
            whileTap={{ scale: 0.85 }}
          >
            <ArrowLeft size={16} className="text-foreground" />
          </motion.button>
          <div className="flex-1">
            <h2 className="font-semibold text-base text-foreground">Booking Details</h2>
            <p className="text-xs text-muted-foreground">ID: {booking.bookingId}</p>
          </div>
          <motion.button className="w-9 h-9 rounded-full border border-border flex items-center justify-center" whileTap={{ scale: 0.85 }}>
            <Share2 size={14} className="text-foreground" />
          </motion.button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 flex items-center gap-3 ${
            isCancelled
              ? "bg-destructive/10 border border-destructive/20"
              : isCompleted
                ? "bg-success/10 border border-success/20"
                : "bg-primary/10 border border-primary/20"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCancelled ? "bg-destructive/20" : isCompleted ? "bg-success/20" : "bg-primary/20"
          }`}>
            {isCancelled ? <X size={20} className="text-destructive" /> :
             isCompleted ? <Check size={20} className="text-success" /> :
             <Calendar size={20} className="text-primary" />}
          </div>
          <div>
            <p className={`text-sm font-semibold ${
              isCancelled ? "text-destructive" : isCompleted ? "text-success" : "text-primary"
            }`}>
              {isCancelled ? "Booking Cancelled" : isCompleted ? "Trip Completed" : "Upcoming Trip"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isCancelled ? "Refund will be processed in 3-5 days" :
               isCompleted ? "We hope you had a great time!" :
               "Show QR code at entry"}
            </p>
          </div>
        </motion.div>

        {/* Property card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border overflow-hidden"
        >
          <div className="relative h-40">
            <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground text-[15px]">{property.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {property.location}
            </p>
          </div>
        </motion.div>

        {/* Booking info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border p-4 space-y-4"
        >
          <h4 className="font-semibold text-sm text-foreground">Booking Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{booking.date}</p>
                <p className="text-xs text-muted-foreground">Date</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Clock size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{booking.slot}</p>
                <p className="text-xs text-muted-foreground">Time Slot</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                <Users size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{booking.guests} guests</p>
                <p className="text-xs text-muted-foreground">Group size</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border p-4"
        >
          <h4 className="font-semibold text-sm text-foreground mb-3">Payment Summary</h4>
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total paid</span>
            <span className={`font-bold text-lg ${isCancelled ? "line-through text-muted-foreground" : "text-foreground"}`}>
              ₹{booking.total.toLocaleString()}
            </span>
          </div>
          {isCancelled && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-success font-medium">Refund amount</span>
              <span className="font-bold text-lg text-success">₹{booking.total.toLocaleString()}</span>
            </div>
          )}
        </motion.div>

        {/* QR Code - only for upcoming */}
        {isUpcoming && !isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border p-5 flex flex-col items-center"
          >
            <h4 className="font-semibold text-sm text-foreground mb-4">Entry QR Code</h4>
            <div className="w-32 h-32 bg-secondary rounded-2xl flex items-center justify-center mb-3">
              <QrCode size={64} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Show this at the venue entrance</p>
          </motion.div>
        )}

        {/* Entry instructions */}
        {(isUpcoming && !isCancelled) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Navigation size={16} className="text-primary" />
              <h4 className="font-semibold text-sm text-foreground">How to get there</h4>
            </div>
            <p className="text-sm text-muted-foreground">{property.entryInstructions}</p>
            <div className="flex gap-2 mt-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 glass rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-foreground"
              >
                <MapPin size={12} className="text-primary" /> Open Maps
              </a>
              <button className="flex-1 glass rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-foreground">
                <Phone size={12} className="text-primary" /> Call Host
              </button>
            </div>
          </motion.div>
        )}

        {/* Contact host */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
              👤
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground text-sm">Hosted by {property.hostName}</h4>
              <p className="text-xs text-muted-foreground">{property.responseRate} response rate</p>
            </div>
            <button className="glass rounded-full px-3 py-1.5 text-xs font-medium text-foreground flex items-center gap-1">
              <MessageCircle size={12} /> Chat
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 glass px-5 py-3.5 z-40">
        {isUpcoming && !isCancelled ? (
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowCancelDialog(true)}
              className="flex-1 py-3 rounded-xl border border-destructive/30 text-destructive font-semibold text-sm"
              whileTap={{ scale: 0.95 }}
            >
              Cancel Booking
            </motion.button>
            <motion.button
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-primary flex items-center justify-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <Phone size={14} /> Contact Host
            </motion.button>
          </div>
        ) : isCompleted ? (
          <motion.button
            onClick={() => onRebook(booking.propertyId)}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-primary flex items-center justify-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            Book Again <ChevronRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            onClick={onBack}
            className="w-full py-3.5 rounded-xl border border-border text-foreground font-semibold text-sm"
            whileTap={{ scale: 0.95 }}
          >
            Back to Trips
          </motion.button>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      <AnimatePresence>
        {showCancelDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => !cancelling && setShowCancelDialog(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md rounded-t-3xl border border-border bg-card p-6 space-y-5"
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                  <AlertTriangle size={28} className="text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Cancel this booking?</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
                  Your booking at <span className="text-foreground font-medium">{property.name}</span> on{" "}
                  <span className="text-foreground font-medium">{booking.date}</span> will be cancelled.
                </p>
              </div>

              {/* Refund info */}
              <div className="rounded-xl bg-secondary p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking amount</span>
                  <span className="text-foreground font-medium">₹{booking.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-success font-medium">Refund amount</span>
                  <span className="text-success font-medium">₹{booking.total.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Refund will be credited in 3-5 business days</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowCancelDialog(false)}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold text-sm"
                  whileTap={{ scale: 0.95 }}
                >
                  Keep Booking
                </motion.button>
                <motion.button
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  {cancelling ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    "Yes, Cancel"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
