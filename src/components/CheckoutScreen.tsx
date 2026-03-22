import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Tag, CreditCard, Smartphone, Banknote, ChevronRight, Shield, Clock, Users, MapPin, CalendarIcon, X, Heart, Bookmark, Pencil, Minus, Plus, Check as CheckIcon, AlertTriangle, BedDouble, Layers } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import type { Property } from "@/data/properties";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import { Calendar } from "@/components/ui/calendar";
import { checkBookingConflict, type ConflictResult } from "@/hooks/use-bookings";

interface CheckoutScreenProps {
  property: Property;
  slotId: string;
  guests: number;
  date: Date;
  selections: Record<string, number>;
  total: number;
  onBack: () => void;
  onConfirm: (total: number, roomsCount?: number, extraMattresses?: number) => void;
  extras?: Property[];
  isWishlisted?: boolean;
  onToggleWishlist?: (propertyId: string) => void;
  roomsCount?: number;
  extraMattresses?: number;
}

const paymentMethods = [
  { id: "upi", label: "UPI / Google Pay", icon: Smartphone, sublabel: "Instant payment" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, sublabel: "Visa, Mastercard, RuPay" },
  { id: "cod", label: "Pay at Venue", icon: Banknote, sublabel: "Cash or card on arrival" },
];

export default function CheckoutScreen({ property, slotId, guests: initialGuests, date: initialDate, selections: initialSelections, total: initialTotal, onBack, onConfirm, extras: initialExtras, isWishlisted, onToggleWishlist, roomsCount: propRoomsCount, extraMattresses: propExtraMattresses }: CheckoutScreenProps) {
  const { addons } = usePropertiesData();
  const [liveDate, setLiveDate] = useState<Date>(initialDate);
  const [liveGuests, setLiveGuests] = useState(initialGuests);
  const [editingDate, setEditingDate] = useState(false);
  const [editingGuests, setEditingGuests] = useState(false);
  const slot = property.slots.find((s) => s.id === slotId)!;
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [extras, setExtras] = useState<Property[]>(initialExtras || []);
  const [liveSelections, setLiveSelections] = useState<Record<string, number>>(initialSelections);
  const [conflict, setConflict] = useState<ConflictResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [extraMattressCount, setExtraMattressCount] = useState(0);

  const ROOM_CAPACITY = 2;
  const EXTRA_MATTRESS_PRICE = 500; // ₹500 per extra mattress
  const isStay = property.primaryCategory === "stay";

  // Room allocation logic for stays
  const roomInfo = useMemo(() => {
    if (!isStay) return null;
    const totalRooms = Math.max(1, Math.floor((property.capacity || 6) / ROOM_CAPACITY));
    const roomsNeeded = Math.ceil(liveGuests / ROOM_CAPACITY);
    const fitsExactly = liveGuests % ROOM_CAPACITY === 0;
    const oddGuest = !fitsExactly ? 1 : 0; // 1 person needs mattress if odd
    const suggestedMattresses = oddGuest;
    const canFitWithMattress = liveGuests <= roomsNeeded * (ROOM_CAPACITY + 1);
    const roomsWithoutMattress = Math.ceil(liveGuests / ROOM_CAPACITY);
    const roomsWithMattress = Math.ceil(liveGuests / (ROOM_CAPACITY + 1));
    const isOverCapacity = roomsWithMattress > totalRooms;

    return {
      totalRooms,
      roomsNeeded: extraMattressCount > 0 ? roomsWithMattress : roomsWithoutMattress,
      fitsExactly,
      oddGuest,
      suggestedMattresses,
      canFitWithMattress,
      isOverCapacity,
      maxMattresses: Math.min(roomsWithMattress, totalRooms), // max 1 per room
    };
  }, [isStay, liveGuests, property.capacity, extraMattressCount]);

  // Auto-suggest mattress when guest count is odd for stays
  useEffect(() => {
    if (roomInfo && roomInfo.oddGuest > 0 && extraMattressCount === 0) {
      // Don't auto-set, just suggest via UI
    }
  }, [roomInfo]);

  // Check for booking conflicts when date or slot changes
  useEffect(() => {
    const check = async () => {
      setCheckingConflict(true);
      const dateStr = liveDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
      const slotStr = `${slot.label} · ${slot.time}`;
      const result = await checkBookingConflict(property.id, dateStr, slotStr);
      setConflict(result);
      setCheckingConflict(false);
    };
    check();
  }, [liveDate, property.id, slot]);

  const removeAddon = (id: string) => {
    setLiveSelections(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const removeExtra = (id: string) => {
    setExtras(prev => prev.filter(e => e.id !== id));
  };

  // Recalculate addon total from live selections
  const addonTotal = Object.entries(liveSelections).reduce((sum, [id, qty]) => {
    for (const group of Object.values(addons)) {
      const item = group.find((a) => a.id === id);
      if (item) return sum + item.price * qty * (item.perPerson ? liveGuests : 1);
    }
    return sum;
  }, 0);

  const extrasTotal = (extras || []).reduce((sum, ext) => {
    const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
    return sum + (cheapest?.price || ext.basePrice);
  }, 0);

  const mattressTotal = isStay ? extraMattressCount * EXTRA_MATTRESS_PRICE : 0;
  const baseTotal = slot.price + addonTotal;
  const discount = couponApplied ? Math.round((baseTotal + extrasTotal + mattressTotal) * 0.1) : 0;
  const platformFee = 49;
  const finalTotal = baseTotal + extrasTotal + mattressTotal - discount + platformFee;

  // Build line items from live selections
  const lineItems: { id: string; name: string; qty: number; unitPrice: number; subtotal: number }[] = [];
  Object.entries(liveSelections).forEach(([id, qty]) => {
    for (const group of Object.values(addons)) {
      const item = group.find((a) => a.id === id);
      if (item) {
        const unitPrice = item.price * (item.perPerson ? liveGuests : 1);
        lineItems.push({ id, name: item.name, qty, unitPrice: item.price, subtotal: unitPrice * qty });
      }
    }
  });

  const handleApplyCoupon = () => {
    if (coupon.toLowerCase() === "hushh10" || coupon.toLowerCase() === "welcome") {
      setCouponApplied(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-36"
    >
      {/* Header with progress */}
      <div className="sticky top-0 z-10 glass px-5 py-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-base text-foreground">Confirm & Pay</h2>
            <p className="text-xs text-muted-foreground">Review your booking details</p>
          </div>
          {onToggleWishlist && (
            <motion.button
              onClick={() => onToggleWishlist(property.id)}
              whileTap={{ scale: 0.85 }}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center"
            >
              <Heart
                size={16}
                className={isWishlisted ? "text-red-500 fill-red-500" : "text-muted-foreground"}
              />
            </motion.button>
          )}
        </div>
        {/* Step progress indicator */}
        <div className="flex items-center gap-1.5">
          {["Details", "Add-ons", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-1.5 flex-1">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1 rounded-full overflow-hidden bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: i * 0.15, duration: 0.4 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground">{step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Booking Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <img src={property.images[0]} alt={property.name} className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">{property.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {property.location}
              </p>
            </div>
            {/* Saved indicator */}
            {isWishlisted && (
              <span className="text-[9px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 font-semibold">Saved ♥</span>
            )}
          </div>
          <div className="flex gap-2 text-xs text-muted-foreground flex-wrap mt-3">
            {/* Editable date */}
            <button
              onClick={() => { setEditingDate(!editingDate); setEditingGuests(false); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/80 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <CalendarIcon size={12} /> {format(liveDate, "EEE, d MMM")}
              <Pencil size={9} className="text-primary ml-0.5" />
            </button>
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/80">
              <Clock size={12} /> {slot.label} · {slot.time}
            </span>
            {/* Editable guests — mandatory */}
            <button
              onClick={() => { setEditingGuests(!editingGuests); setEditingDate(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/80 border transition-colors ${
                liveGuests < 1 ? "border-destructive/50 ring-1 ring-destructive/30" : "border-border/50 hover:border-primary/30"
              }`}
            >
              <Users size={12} className={liveGuests < 1 ? "text-destructive" : ""} />
              <span className={liveGuests < 1 ? "text-destructive font-medium" : ""}>
                {liveGuests < 1 ? "Select guests *" : `${liveGuests} guests`}
              </span>
              <Pencil size={9} className="text-primary ml-0.5" />
            </button>
          </div>

          {/* Inline date editor */}
          <AnimatePresence>
            {editingDate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="rounded-xl border border-primary/20 bg-secondary/50 p-2">
                  <Calendar
                    mode="single"
                    selected={liveDate}
                    onSelect={(d) => { if (d) { setLiveDate(d); setEditingDate(false); } }}
                    disabled={(d) => d < new Date()}
                    className="rounded-xl"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline guest editor */}
          <AnimatePresence>
            {editingGuests && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-secondary/50 px-4 py-3">
                  <span className="text-sm text-foreground font-medium">Guests</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setLiveGuests(Math.max(1, liveGuests - 1))}
                      disabled={liveGuests <= 1}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                    >
                      <Minus size={14} className="text-foreground" />
                    </button>
                    <span className="text-lg font-bold text-foreground w-6 text-center">{liveGuests}</span>
                    <button
                      onClick={() => setLiveGuests(Math.min(property.capacity || 50, liveGuests + 1))}
                      className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus size={14} className="text-primary" />
                    </button>
                  </div>
                  <button
                    onClick={() => setEditingGuests(false)}
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <CheckIcon size={12} className="text-primary-foreground" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Room Allocation — Clean stepper style */}
        {isStay && roomInfo && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className={`rounded-2xl border p-4 space-y-4 ${roomInfo.isOverCapacity ? "border-destructive/40 bg-destructive/5" : "border-border"}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <BedDouble size={16} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Room & Bed Setup</h4>
                <p className="text-[10px] text-muted-foreground">{ROOM_CAPACITY} guests per room · {roomInfo.totalRooms} rooms available</p>
              </div>
            </div>

            {/* Rooms stepper */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Rooms</p>
                <p className="text-[10px] text-muted-foreground">
                  {roomInfo.roomsNeeded} recommended for {liveGuests} guests
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    const newRooms = Math.max(1, roomInfo.roomsNeeded - 1);
                    const maxGuests = newRooms * ROOM_CAPACITY + Math.min(extraMattressCount, newRooms);
                    if (liveGuests > maxGuests) return; // can't reduce below what's needed
                  }}
                  disabled
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30"
                >
                  <Minus size={14} className="text-foreground" />
                </button>
                <span className="text-lg font-bold text-foreground w-6 text-center">{roomInfo.roomsNeeded}</span>
                <button
                  disabled
                  className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center disabled:opacity-30"
                >
                  <Plus size={14} className="text-primary" />
                </button>
              </div>
            </div>

            {/* Extra mattress stepper */}
            {!roomInfo.isOverCapacity && (
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Extra Mattress</p>
                  <p className="text-[10px] text-muted-foreground">
                    ₹{EXTRA_MATTRESS_PRICE}/night · Max 1 per room
                  </p>
                  {roomInfo.oddGuest > 0 && extraMattressCount === 0 && (
                    <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                      💡 Suggested: {roomInfo.suggestedMattresses} mattress for odd guest
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setExtraMattressCount(Math.max(0, extraMattressCount - 1))}
                    disabled={extraMattressCount <= 0}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    <Minus size={14} className="text-foreground" />
                  </button>
                  <span className="text-lg font-bold text-foreground w-6 text-center">{extraMattressCount}</span>
                  <button
                    onClick={() => setExtraMattressCount(Math.min(roomInfo.maxMattresses, extraMattressCount + 1))}
                    disabled={extraMattressCount >= roomInfo.maxMattresses}
                    className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    <Plus size={14} className="text-primary" />
                  </button>
                </div>
              </div>
            )}

            {/* Summary bar */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BedDouble size={12} className="text-primary" />
              <span>{roomInfo.roomsNeeded} room{roomInfo.roomsNeeded > 1 ? "s" : ""}</span>
              <span className="text-border">·</span>
              <Users size={12} />
              <span>{liveGuests} guests</span>
              {extraMattressCount > 0 && (
                <>
                  <span className="text-border">·</span>
                  <Layers size={12} className="text-amber-400" />
                  <span className="text-amber-400 font-medium">{extraMattressCount} mattress (+₹{(extraMattressCount * EXTRA_MATTRESS_PRICE).toLocaleString()})</span>
                </>
              )}
              {roomInfo.isOverCapacity && (
                <span className="text-destructive font-semibold ml-auto">⚠️ Over capacity</span>
              )}
            </div>

            {roomInfo.isOverCapacity && (
              <p className="text-[10px] text-destructive font-medium">
                Only {roomInfo.totalRooms} rooms available. Please reduce to {roomInfo.totalRooms * (ROOM_CAPACITY + 1)} guests max.
              </p>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {conflict?.hasConflict && (() => {
            const existingGuests = conflict.existingBookings.reduce((s, b) => s + b.guests, 0);
            const totalGuests = existingGuests + liveGuests;
            const isStay = property.primaryCategory === "stay";
            const maxCapacity = property.capacity || (isStay ? 6 : 15);
            const roomCapacity = 2;
            const extraMattress = 1;
            const rooms = isStay ? Math.max(1, Math.floor(maxCapacity / roomCapacity)) : 0;
            const maxWithMattress = isStay ? rooms * (roomCapacity + extraMattress) : maxCapacity;
            const isOverCapacity = totalGuests > maxWithMattress;
            const roomsNeeded = isStay ? Math.ceil(totalGuests / (roomCapacity + extraMattress)) : 0;
            const needsMattress = isStay && totalGuests > roomsNeeded * roomCapacity;

            return (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`rounded-2xl border p-4 ${isOverCapacity ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isOverCapacity ? "bg-destructive/15" : "bg-amber-500/15"}`}>
                    <AlertTriangle size={18} className={isOverCapacity ? "text-destructive" : "text-amber-400"} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground">
                      {isOverCapacity ? "🚨 Over Capacity" : isStay ? "🛏️ Room Allocation" : "👥 Slot has bookings"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {conflict.existingBookings.length} existing booking{conflict.existingBookings.length > 1 ? "s" : ""} · {existingGuests} guests already confirmed + your {liveGuests} = {totalGuests} total
                    </p>
                    {isStay ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] font-medium text-foreground">
                          {rooms} rooms available ({roomCapacity} per room + {extraMattress} extra mattress)
                        </p>
                        {isOverCapacity ? (
                          <p className="text-[10px] text-destructive font-semibold">
                            Needs {roomsNeeded} rooms but only {rooms} available. Consider splitting across dates.
                          </p>
                        ) : (
                          <p className="text-[10px] text-amber-500 font-medium">
                            Suggest {roomsNeeded} room{roomsNeeded > 1 ? "s" : ""}
                            {needsMattress ? " with extra mattress for odd guest" : ""}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className={`text-[10px] font-medium mt-1.5 ${isOverCapacity ? "text-destructive" : "text-amber-400"}`}>
                        {isOverCapacity
                          ? `Max ${maxWithMattress} guests allowed. Consider a different slot.`
                          : `${totalGuests}/${maxWithMattress} capacity used. You can still book.`}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border p-4 space-y-3"
        >
          <h4 className="font-semibold text-sm text-foreground">Price breakdown</h4>
          
          {/* Base slot */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{slot.label} slot</span>
            <span className="text-foreground font-medium">₹{slot.price.toLocaleString()}</span>
          </div>

          {/* Add-on items with remove button */}
          <AnimatePresence>
            {lineItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between text-sm gap-2"
              >
                <span className="text-muted-foreground flex-1 truncate">
                  {item.name} {item.qty > 1 ? `× ${item.qty}` : ""}
                </span>
                <span className="text-foreground font-medium shrink-0">₹{item.subtotal.toLocaleString()}</span>
                <button
                  onClick={() => removeAddon(item.id)}
                  className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors shrink-0"
                >
                  <X size={10} className="text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Extra experiences/services */}
          {extras.length > 0 && (
            <>
              <div className="border-t border-border/50 pt-2 mt-1">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">Added Extras</span>
              </div>
              <AnimatePresence>
                {extras.map((ext) => {
                  const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
                  const price = cheapest?.price || ext.basePrice;
                  return (
                    <motion.div
                      key={ext.id}
                      initial={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <img src={ext.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <span className="text-muted-foreground flex-1 truncate">{ext.name}</span>
                      <span className="text-foreground font-medium">₹{price.toLocaleString()}</span>
                      <button
                        onClick={() => removeExtra(ext.id)}
                        className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors shrink-0"
                      >
                        <X size={10} className="text-muted-foreground" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </>
          )}

          {/* Extra mattress charge */}
          {mattressTotal > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <BedDouble size={12} /> Extra mattress × {extraMattressCount}
              </span>
              <span className="text-foreground font-medium">₹{mattressTotal.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee</span>
            <span className="text-foreground font-medium">₹{platformFee}</span>
          </div>

          {/* Discount */}
          {couponApplied && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex justify-between text-sm"
            >
              <span className="text-success font-medium">Coupon discount (10%)</span>
              <span className="text-success font-medium">-₹{discount.toLocaleString()}</span>
            </motion.div>
          )}

          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-lg text-foreground">₹{finalTotal.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Coupon */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border p-4"
        >
          <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
            <Tag size={14} className="text-primary" /> Apply coupon
          </h4>
          {couponApplied ? (
            <div className="flex items-center gap-2 bg-success/10 rounded-xl px-4 py-3">
              <span className="text-success text-sm font-medium">✓ Coupon applied — 10% off!</span>
              <button onClick={() => { setCouponApplied(false); setCoupon(""); }} className="ml-auto text-xs text-muted-foreground underline">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter code (try HUSHH10)"
                className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-foreground text-background px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
              >
                Apply
              </button>
            </div>
          )}
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border p-4"
        >
          <h4 className="font-semibold text-sm text-foreground mb-3">Payment method</h4>
          <div className="space-y-2">
            {paymentMethods.map((method) => {
              const isSelected = selectedPayment === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-foreground bg-foreground/[0.03]"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    <method.icon size={18} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-foreground">{method.label}</span>
                    <p className="text-[11px] text-muted-foreground">{method.sublabel}</p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <span className="text-primary-foreground text-[10px]">✓</span>
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2"
        >
          <Shield size={14} />
          <span>Secure payment · Instant confirmation · Free cancellation</span>
        </motion.div>
      </div>

      {/* Sticky Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 glass px-5 py-3.5 z-40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">
            {paymentMethods.find(m => m.id === selectedPayment)?.label}
          </span>
          {couponApplied && <span className="text-xs text-success font-medium">10% off applied</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-xl text-gradient-warm">₹{finalTotal.toLocaleString()}</span>
          <button
            onClick={() => {
              if (liveGuests < 1) {
                setEditingGuests(true);
                return;
              }
              onConfirm(finalTotal, isStay ? roomInfo?.roomsNeeded : undefined, isStay ? extraMattressCount : undefined);
            }}
            disabled={liveGuests < 1}
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 glow-primary disabled:opacity-50"
          >
            Pay Now <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
