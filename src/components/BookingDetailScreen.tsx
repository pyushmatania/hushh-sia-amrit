import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Calendar, Clock, Users, QrCode,
  Phone, MessageCircle, X, AlertTriangle, Check, ChevronRight,
  Navigation, Share2, Plus, Minus, Sparkles, ShoppingBag,
  Utensils, Star, Shield, Wifi, Music, Flame, Home, Info,
  Camera, Receipt, Split
} from "lucide-react";
import { useState, useMemo } from "react";
import type { Addon } from "@/data/properties";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/pages/Index";
import LiveOrderingSheet from "./LiveOrderingSheet";
import BookingPhotosSheet from "./BookingPhotosSheet";
import ReceiptSheet from "./ReceiptSheet";
import SplitPaymentSheet from "./SplitPaymentSheet";

interface BookingDetailScreenProps {
  booking: Booking;
  onBack: () => void;
  onCancel: (bookingId: string) => void;
  onRebook: (propertyId: string) => void;
}

export default function BookingDetailScreen({ booking, onBack, onCancel, onRebook }: BookingDetailScreenProps) {
  const { properties, addons } = usePropertiesData();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAddonsSheet, setShowAddonsSheet] = useState(false);
  const [showFoodOrder, setShowFoodOrder] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [addonSelections, setAddonSelections] = useState<Record<string, number>>({});
  const [orderedAddons, setOrderedAddons] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const { toast } = useToast();

  const property = useMemo(() => properties.find((p) => p.id === booking.propertyId), [booking.propertyId]);

  const addonTotal = useMemo(() => {
    return Object.entries(addonSelections).reduce((sum, [id, qty]) => {
      for (const group of Object.values(addons)) {
        const item = group.find((a) => a.id === id);
        if (item) return sum + item.price * qty * (item.perPerson ? booking.guests : 1);
      }
      return sum;
    }, 0);
  }, [addonSelections, booking.guests]);

  const orderedTotal = useMemo(() => orderedAddons.reduce((s, a) => s + a.price, 0), [orderedAddons]);

  if (!property) return null;

  const isActive = booking.status === "active";
  const isUpcoming = booking.status === "upcoming";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled" || cancelled;

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
                : isActive
                  ? "bg-success/10 border border-success/20"
                  : "bg-primary/10 border border-primary/20"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isCancelled ? "bg-destructive/20" : isCompleted ? "bg-success/20" : isActive ? "bg-success/20" : "bg-primary/20"
          }`}>
            {isCancelled ? <X size={20} className="text-destructive" /> :
             isCompleted ? <Check size={20} className="text-success" /> :
             isActive ? <Flame size={20} className="text-success" /> :
             <Calendar size={20} className="text-primary" />}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${
              isCancelled ? "text-destructive" : isCompleted ? "text-success" : isActive ? "text-success" : "text-primary"
            }`}>
              {isCancelled ? "Booking Cancelled" : isCompleted ? "Trip Completed" : isActive ? "You're Checked In!" : "Upcoming Trip"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isCancelled ? "Refund will be processed in 3-5 days" :
               isCompleted ? "We hope you had a great time!" :
               isActive ? "Enjoy your stay — order food & services anytime" :
               "Show QR code at entry"}
            </p>
          </div>
          {isActive && (
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          )}
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
            {isActive && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/90 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold text-white">LIVE</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground text-[15px]">{property.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {property.location}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-foreground">
                <Star size={11} className="text-amber-500 fill-amber-500" /> {property.rating}
              </span>
              <span className="text-xs text-muted-foreground">({property.reviewCount} reviews)</span>
              <span className="text-xs text-muted-foreground">· Up to {property.capacity} guests</span>
            </div>
          </div>
        </motion.div>

        {/* 🍽️ Order Food CTA — only for active trips */}
        {isActive && !isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="rounded-2xl overflow-hidden border-2 border-success/30"
            style={{ background: "linear-gradient(135deg, hsl(160 60% 42% / 0.1) 0%, hsl(160 60% 42% / 0.04) 100%)" }}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(160 84% 39%)" }}>
                  <Utensils size={16} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Order Food & Drinks</h4>
                  <p className="text-[11px] text-muted-foreground">Delivered right to your spot — snacks, meals, drinks & more</p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowFoodOrder(true)}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "hsl(160 84% 39%)", color: "white", boxShadow: "0 4px 16px hsl(160 84% 39% / 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Utensils size={14} /> Browse Menu & Order
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Property details — amenities & highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-border p-4 space-y-3"
        >
          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Info size={14} className="text-primary" /> About this place
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{property.fullDescription}</p>

          {/* Highlights */}
          {property.highlights.length > 0 && (
            <div className="space-y-1.5 pt-2">
              {property.highlights.slice(0, 4).map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">✨</span>
                  {h}
                </div>
              ))}
            </div>
          )}

          {/* Amenities */}
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity, i) => (
                <span key={i} className="flex items-center gap-1 bg-secondary/80 rounded-lg px-2.5 py-1.5 text-[11px] text-foreground">
                  <span>{property.amenityIcons[i] || "•"}</span> {amenity}
                </span>
              ))}
            </div>
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

        {/* ✨ Enhance Your Trip — add experiences & services */}
        {(isActive || isUpcoming || isCompleted) && !isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Enhance Your Trip</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Add food, decor, music, activities & more — pay only for what you add.
            </p>

            {/* Quick category chips */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(addons).slice(0, 4).map(([category, items]) => (
                <motion.button
                  key={category}
                  onClick={() => setShowAddonsSheet(true)}
                  className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5 text-xs font-medium text-foreground"
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{items[0].categoryEmoji}</span>
                  {category}
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={() => setShowAddonsSheet(true)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag size={14} /> Browse All Add-ons
            </motion.button>

            {/* Already ordered add-ons */}
            {orderedAddons.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ordered</p>
                {orderedAddons.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{a.name} × {a.qty}</span>
                    <span className="text-foreground font-medium">₹{a.price.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold text-foreground pt-1 border-t border-border/30">
                  <span>Add-on Total</span>
                  <span>₹{orderedTotal.toLocaleString()}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Client Actions */}
        {!isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-2xl border border-border p-4 space-y-3"
          >
            <h4 className="font-semibold text-sm text-foreground">Quick Actions</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/80 border border-border/50 active:scale-95 transition-transform"
              >
                <Receipt size={18} className="text-primary" />
                <span className="text-[10px] font-semibold text-foreground">Receipt</span>
              </button>
              <button
                onClick={() => setShowSplit(true)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/80 border border-border/50 active:scale-95 transition-transform"
              >
                <Split size={18} className="text-primary" />
                <span className="text-[10px] font-semibold text-foreground">Split Bill</span>
              </button>
              <button
                onClick={() => setShowPhotos(true)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/80 border border-border/50 active:scale-95 transition-transform"
              >
                <Camera size={18} className="text-primary" />
                <span className="text-[10px] font-semibold text-foreground">Photos</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Payment summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border p-4"
        >
          <h4 className="font-semibold text-sm text-foreground mb-3">Payment Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Booking</span>
              <span className={`font-medium ${isCancelled ? "line-through text-muted-foreground" : "text-foreground"}`}>
                ₹{booking.total.toLocaleString()}
              </span>
            </div>
            {orderedTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Add-ons</span>
                <span className="font-medium text-foreground">₹{orderedTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Grand Total</span>
              <span className={`font-bold text-lg ${isCancelled ? "line-through text-muted-foreground" : "text-foreground"}`}>
                ₹{(booking.total + orderedTotal).toLocaleString()}
              </span>
            </div>
          </div>
          {isCancelled && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-success font-medium">Refund amount</span>
              <span className="font-bold text-lg text-success">₹{booking.total.toLocaleString()}</span>
            </div>
          )}
        </motion.div>

        {/* QR Code - only for upcoming */}
        {(isUpcoming || isActive) && !isCancelled && (
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
        {((isUpcoming || isActive) && !isCancelled) && (
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
        {isActive && !isCancelled ? (
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowFoodOrder(true)}
              className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "hsl(160 84% 39%)", color: "white", boxShadow: "0 4px 16px hsl(160 84% 39% / 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Utensils size={14} /> Order Food
            </motion.button>
            <motion.button
              onClick={() => setShowAddonsSheet(true)}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-primary flex items-center justify-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={14} /> Add Extras
            </motion.button>
          </div>
        ) : isUpcoming && !isCancelled ? (
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowCancelDialog(true)}
              className="flex-1 py-3 rounded-xl border border-destructive/30 text-destructive font-semibold text-sm"
              whileTap={{ scale: 0.95 }}
            >
              Cancel Booking
            </motion.button>
            <motion.button
              onClick={() => setShowAddonsSheet(true)}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-primary flex items-center justify-center gap-1"
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={14} /> Add Extras
            </motion.button>
          </div>
        ) : isCompleted ? (
          <div className="flex gap-3">
            <motion.button
              onClick={() => onRebook(booking.propertyId)}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-primary flex items-center justify-center gap-2"
              whileTap={{ scale: 0.95 }}
            >
              Book Again <ChevronRight size={16} />
            </motion.button>
          </div>
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
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => !cancelling && setShowCancelDialog(false)}
            />
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

      {/* Add-ons bottom sheet */}
      <AnimatePresence>
        {showAddonsSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowAddonsSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-md rounded-t-3xl border border-border bg-card max-h-[85vh] flex flex-col"
            >
              {/* Sheet header */}
              <div className="px-6 pt-4 pb-3 border-b border-border/50 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Sparkles size={18} className="text-primary" /> Add Extras
                    </h3>
                    <p className="text-xs text-muted-foreground">{booking.guests} guests · prices adjusted per person where applicable</p>
                  </div>
                  <motion.button
                    onClick={() => setShowAddonsSheet(false)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                    whileTap={{ scale: 0.85 }}
                  >
                    <X size={16} className="text-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* Scrollable add-on list */}
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                {Object.entries(addons).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm text-foreground mb-2.5 flex items-center gap-1.5">
                      <span>{items[0].categoryEmoji}</span> {category}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const qty = addonSelections[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            className={`rounded-xl border p-3 flex items-center gap-3 transition-all ${
                              qty > 0 ? "border-primary/30 bg-primary/5" : "border-border"
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg ${
                              qty > 0 ? "bg-primary/15" : "bg-secondary"
                            }`}>
                              {item.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-sm text-foreground truncate">{item.name}</span>
                                {qty > 0 && <Check size={12} className="text-success shrink-0" />}
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                              <span className="text-xs font-medium text-foreground">
                                {item.price === 0 ? "Free" : `₹${item.price}`}
                                {item.perPerson ? "/person" : ""}
                              </span>
                            </div>
                            {item.price > 0 && (
                              <div className="flex items-center gap-2 ml-2 shrink-0">
                                {qty > 0 && (
                                  <motion.button
                                    onClick={() => toggleAddon(item.id, -1)}
                                    className="w-7 h-7 rounded-full border border-muted-foreground/50 flex items-center justify-center"
                                    whileTap={{ scale: 0.85 }}
                                  >
                                    <Minus size={12} className="text-foreground" />
                                  </motion.button>
                                )}
                                {qty > 0 && (
                                  <span className="text-sm font-semibold text-foreground w-4 text-center">{qty}</span>
                                )}
                                <motion.button
                                  onClick={() => toggleAddon(item.id, 1)}
                                  className="w-7 h-7 rounded-full border border-muted-foreground/50 flex items-center justify-center"
                                  whileTap={{ scale: 0.85 }}
                                >
                                  <Plus size={12} className="text-foreground" />
                                </motion.button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sheet footer */}
              <div className="px-6 py-3.5 border-t border-border/50 shrink-0">
                <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                  <span>{Object.keys(addonSelections).length} items selected</span>
                  {addonTotal > 0 && <span>Extra: ₹{addonTotal.toLocaleString()}</span>}
                </div>
                <motion.button
                  onClick={handleOrderAddons}
                  disabled={addonTotal === 0}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-primary flex items-center justify-center gap-2 disabled:opacity-40"
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingBag size={14} />
                  {addonTotal > 0 ? `Order Add-ons · ₹${addonTotal.toLocaleString()}` : "Select items to order"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Food Ordering Sheet */}
      <LiveOrderingSheet
        open={showFoodOrder}
        onClose={() => setShowFoodOrder(false)}
        propertyName={property.name}
        propertyId={booking.propertyId}
        bookingId={booking.bookingId}
      />
    </motion.div>
  );
}
