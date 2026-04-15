import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Tag, CreditCard, Smartphone, Banknote, ChevronRight, Shield, Clock, Users, MapPin, CalendarIcon, X, Heart, Bookmark, Pencil, Minus, Plus, Check as CheckIcon, AlertTriangle, BedDouble, Layers } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Property } from "@/data/properties";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import { Calendar } from "@/components/ui/calendar";
import { checkBookingConflict, type ConflictResult } from "@/hooks/use-bookings";
import { useAppConfig } from "@/hooks/use-app-config";
import { useSlotAvailability } from "@/hooks/use-slot-availability";

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
  const slot = property.slots.find((s) => s.id === slotId) || property.slots[0] || { id: slotId, label: "Slot", time: "", price: property.basePrice, available: true, popular: false };
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponDiscountType, setCouponDiscountType] = useState<"percentage" | "flat">("percentage");
  const [couponError, setCouponError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [extras, setExtras] = useState<Property[]>(initialExtras || []);
  const [liveSelections, setLiveSelections] = useState<Record<string, number>>(initialSelections);
  const [conflict, setConflict] = useState<ConflictResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const extraMattressCount = propExtraMattresses ?? 0;

  const appConfig = useAppConfig();
  const ROOM_CAPACITY = appConfig.room_capacity;
  const EXTRA_MATTRESS_PRICE = appConfig.extra_mattress_price;
  const isStay = property.primaryCategory === "stay";

  const roomsForConfirm = propRoomsCount ?? null;

  // Slot capacity enforcement
  const dateStr = format(liveDate, "yyyy-MM-dd");
  const { slots: dbSlots, getSlotAvailability, loading: slotsLoading } = useSlotAvailability(property.id, dateStr);
  const matchedDbSlot = dbSlots.find(s => s.label === slot?.label);
  const slotCapacity = matchedDbSlot ? getSlotAvailability(matchedDbSlot.id) : null;
  const isSlotFull = slotCapacity ? !slotCapacity.isAvailable || slotCapacity.remainingCapacity <= 0 : false;
  const spotsLeft = slotCapacity?.remainingCapacity ?? null;

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
  const discount = couponApplied
    ? couponDiscountType === "percentage"
      ? Math.round((baseTotal + extrasTotal + mattressTotal) * couponDiscount / 100)
      : couponDiscount
    : 0;
  const platformFee = appConfig.platform_fee;
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

  const handleApplyCoupon = useCallback(async () => {
    if (!coupon.trim()) return;
    setCouponError("");
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", coupon.trim())
      .eq("active", true)
      .maybeSingle();

    if (!data) {
      setCouponError("Invalid or expired coupon");
      setCouponApplied(false);
      return;
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("This coupon has expired");
      setCouponApplied(false);
      return;
    }

    // Check usage limit
    if (data.max_uses && data.uses >= data.max_uses) {
      setCouponError("This coupon has reached its usage limit");
      setCouponApplied(false);
      return;
    }

    // Check minimum order
    const subtotal = baseTotal + extrasTotal + mattressTotal;
    if (data.min_order && subtotal < Number(data.min_order)) {
      setCouponError(`Minimum order ₹${Number(data.min_order).toLocaleString()} required`);
      setCouponApplied(false);
      return;
    }

    setCouponDiscountType(data.discount_type === "flat" ? "flat" : "percentage");
    setCouponDiscount(Number(data.discount_value));
    setCouponApplied(true);
  }, [coupon, baseTotal, extrasTotal, mattressTotal]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-36 md:pb-8"
      style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
    >
      {/* Header with progress */}
      <div className="sticky top-0 z-10 glass px-5 py-3 space-y-2.5 md:pt-20">
        <div className="md:max-w-5xl md:mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full border border-border flex items-center justify-center md:hover:bg-secondary transition-colors">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-base md:text-2xl text-foreground">Confirm & Pay</h2>
            <p className="text-xs md:text-sm text-muted-foreground">Review your booking details</p>
          </div>
          {onToggleWishlist && (
            <motion.button onClick={() => onToggleWishlist(property.id)} whileTap={{ scale: 0.85 }} className="w-9 h-9 rounded-full border border-border flex items-center justify-center md:hover:bg-secondary transition-colors">
              <Heart size={16} className={isWishlisted ? "text-red-500 fill-red-500" : "text-muted-foreground"} />
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {["Details", "Add-ons", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-1.5 flex-1">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1 rounded-full overflow-hidden bg-secondary">
                  <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: i * 0.15, duration: 0.4 }} className="h-full rounded-full bg-primary" />
                </div>
                <span className="text-[9px] md:text-xs font-medium text-muted-foreground">{step}</span>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="md:flex md:gap-8 md:max-w-5xl md:mx-auto md:px-8 md:mt-6">

        {/* LEFT COLUMN */}
        <div className="px-5 py-4 space-y-5 md:px-0 md:flex-1 md:min-w-0">
          {/* Booking Summary Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <img src={property.images[0]} alt={property.name} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm md:text-lg truncate">{property.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={11} /> {property.location}
                </p>
              </div>
              {isWishlisted && (
                <span className="text-[9px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 font-semibold">Saved ♥</span>
              )}
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground flex-wrap mt-3">
              <button onClick={() => { setEditingDate(!editingDate); setEditingGuests(false); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/80 border border-border/50 hover:border-primary/30 transition-colors">
                <CalendarIcon size={12} /> {format(liveDate, "EEE, d MMM")}
                <Pencil size={9} className="text-primary ml-0.5" />
              </button>
              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/80">
                <Clock size={12} /> {slot.label} · {slot.time}
              </span>
              <button onClick={() => { setEditingGuests(!editingGuests); setEditingDate(false); }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/80 border transition-colors ${liveGuests < 1 ? "border-destructive/50 ring-1 ring-destructive/30" : "border-border/50 hover:border-primary/30"}`}>
                <Users size={12} className={liveGuests < 1 ? "text-destructive" : ""} />
                <span className={liveGuests < 1 ? "text-destructive font-medium" : ""}>{liveGuests < 1 ? "Select guests *" : `${liveGuests} guests`}</span>
                <Pencil size={9} className="text-primary ml-0.5" />
              </button>
            </div>

            <AnimatePresence>
              {editingDate && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                  <div className="rounded-xl border border-primary/20 bg-secondary/50 p-2">
                    <Calendar mode="single" selected={liveDate} onSelect={(d) => { if (d) { setLiveDate(d); setEditingDate(false); } }} disabled={(d) => d < new Date()} className="rounded-xl" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {editingGuests && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                  <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-secondary/50 px-4 py-3">
                    <span className="text-sm text-foreground font-medium">Guests</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setLiveGuests(Math.max(1, liveGuests - 1))} disabled={liveGuests <= 1} className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform">
                        <Minus size={14} className="text-foreground" />
                      </button>
                      <span className="text-lg font-bold text-foreground w-6 text-center">{liveGuests}</span>
                      <button onClick={() => setLiveGuests(Math.min(property.capacity || 50, liveGuests + 1))} className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center active:scale-90 transition-transform">
                        <Plus size={14} className="text-primary" />
                      </button>
                    </div>
                    <button onClick={() => setEditingGuests(false)} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <CheckIcon size={12} className="text-primary-foreground" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Room summary */}
          {isStay && propRoomsCount && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><BedDouble size={16} className="text-primary" /></div>
                <h4 className="font-semibold text-sm text-foreground">Room Allocation</h4>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><BedDouble size={12} className="text-primary" /> {propRoomsCount} room{propRoomsCount > 1 ? "s" : ""}</span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1"><Users size={12} /> {liveGuests} guests</span>
                {extraMattressCount > 0 && (
                  <>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1 text-amber-400 font-medium"><Layers size={12} /> {extraMattressCount} mattress (+₹{(extraMattressCount * EXTRA_MATTRESS_PRICE).toLocaleString()})</span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Conflict warning */}
          <AnimatePresence>
            {conflict?.hasConflict && (() => {
              const existingGuests = conflict.existingBookings.reduce((s, b) => s + b.guests, 0);
              const totalGuests = existingGuests + liveGuests;
              const maxCapacity = property.capacity || (isStay ? 6 : 15);
              const roomCapacity = 2;
              const extraMattress = 1;
              const rooms = isStay ? Math.max(1, Math.floor(maxCapacity / roomCapacity)) : 0;
              const maxWithMattress = isStay ? rooms * (roomCapacity + extraMattress) : maxCapacity;
              const isOverCapacity = totalGuests > maxWithMattress;
              const roomsNeeded = isStay ? Math.ceil(totalGuests / (roomCapacity + extraMattress)) : 0;
              const needsMattress = isStay && totalGuests > roomsNeeded * roomCapacity;
              return (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className={`rounded-2xl border p-4 ${isOverCapacity ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isOverCapacity ? "bg-destructive/15" : "bg-amber-500/15"}`}>
                      <AlertTriangle size={18} className={isOverCapacity ? "text-destructive" : "text-amber-400"} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground">{isOverCapacity ? "🚨 Over Capacity" : isStay ? "🛏️ Room Allocation" : "👥 Slot has bookings"}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{conflict.existingBookings.length} existing booking{conflict.existingBookings.length > 1 ? "s" : ""} · {existingGuests} guests already + your {liveGuests} = {totalGuests} total</p>
                      {isStay ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-[11px] font-medium text-foreground">{rooms} rooms available ({roomCapacity} per room + {extraMattress} extra mattress)</p>
                          <p className={`text-[10px] font-medium ${isOverCapacity ? "text-destructive" : "text-amber-400"}`}>
                            {isOverCapacity ? `Needs ${roomsNeeded} rooms but only ${rooms} available.` : `Suggest ${roomsNeeded} room${roomsNeeded > 1 ? "s" : ""}${needsMattress ? " with extra mattress" : ""}`}
                          </p>
                        </div>
                      ) : (
                        <p className={`text-[10px] font-medium mt-1.5 ${isOverCapacity ? "text-destructive" : "text-amber-400"}`}>
                          {isOverCapacity ? `Max ${maxWithMattress} guests allowed.` : `${totalGuests}/${maxWithMattress} capacity used.`}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Add-ons detail — mobile price breakdown (hidden on desktop, shown in right column) */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border p-4 space-y-3 md:hidden">
            <h4 className="font-semibold text-sm text-foreground">Price breakdown</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{slot.label} slot</span>
              <span className="text-foreground font-medium">₹{slot.price.toLocaleString()}</span>
            </div>
            <AnimatePresence>
              {lineItems.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }} transition={{ duration: 0.2 }} className="flex items-center justify-between text-sm gap-2">
                  <span className="text-muted-foreground flex-1 truncate">{item.name} {item.qty > 1 ? `× ${item.qty}` : ""}</span>
                  <span className="text-foreground font-medium shrink-0">₹{item.subtotal.toLocaleString()}</span>
                  <button onClick={() => removeAddon(item.id)} className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors shrink-0"><X size={10} className="text-muted-foreground" /></button>
                </motion.div>
              ))}
            </AnimatePresence>
            {extras.length > 0 && (
              <>
                <div className="border-t border-border/50 pt-2 mt-1"><span className="text-[11px] font-semibold text-primary uppercase tracking-wide">Added Extras</span></div>
                <AnimatePresence>
                  {extras.map((ext) => {
                    const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
                    return (
                      <motion.div key={ext.id} initial={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 text-sm">
                        <img src={ext.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="text-muted-foreground flex-1 truncate">{ext.name}</span>
                        <span className="text-foreground font-medium">₹{(cheapest?.price || ext.basePrice).toLocaleString()}</span>
                        <button onClick={() => removeExtra(ext.id)} className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center hover:bg-destructive/10 shrink-0"><X size={10} className="text-muted-foreground" /></button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
            {mattressTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><BedDouble size={12} /> Extra mattress × {extraMattressCount}</span>
                <span className="text-foreground font-medium">₹{mattressTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="text-foreground font-medium">₹{platformFee}</span>
            </div>
            {couponApplied && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex justify-between text-sm">
                <span className="text-success font-medium">Coupon discount ({couponDiscountType === "percentage" ? `${couponDiscount}%` : `₹${couponDiscount}`})</span>
                <span className="text-success font-medium">-₹{discount.toLocaleString()}</span>
              </motion.div>
            )}
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-lg text-foreground">₹{finalTotal.toLocaleString()}</span>
            </div>
          </motion.div>

          {/* Coupon */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border p-4 md:p-6">
            <h4 className="font-semibold text-sm md:text-base text-foreground mb-3 flex items-center gap-2">
              <Tag size={14} className="text-primary" /> Apply coupon
            </h4>
            {couponApplied ? (
              <div className="flex items-center gap-2 bg-success/10 rounded-xl px-4 py-3">
                <span className="text-success text-sm font-medium">✓ Coupon applied — {couponDiscountType === "percentage" ? `${couponDiscount}%` : `₹${couponDiscount}`} off!</span>
                <button onClick={() => { setCouponApplied(false); setCoupon(""); setCouponError(""); }} className="ml-auto text-xs text-muted-foreground underline">Remove</button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2 md:max-w-sm">
                  <input type="text" value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }} placeholder="Enter coupon code"
                    className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors md:focus:ring-2 md:focus:ring-primary/20" />
                  <button onClick={handleApplyCoupon} className="bg-foreground text-background px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 md:hover:brightness-110 transition">Apply</button>
                </div>
                {couponError && <p className="text-xs text-destructive font-medium">{couponError}</p>}
              </div>
            )}
          </motion.div>

          {/* Payment Method */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-border p-4 md:p-6">
            <h4 className="font-semibold text-sm md:text-base text-foreground mb-3">Payment method</h4>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all md:hover:border-foreground/30 ${isSelected ? "border-foreground bg-foreground/[0.03]" : "border-border"}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? "bg-primary/10" : "bg-secondary"}`}>
                      <method.icon size={18} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-foreground">{method.label}</span>
                      <p className="text-[11px] text-muted-foreground">{method.sublabel}</p>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground text-[10px]">✓</span>
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Security badge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
            <Shield size={14} />
            <span>Secure payment · Instant confirmation · Free cancellation</span>
          </motion.div>
        </div>

        {/* RIGHT COLUMN — Desktop Sticky Price Card */}
        <div className="hidden md:block md:w-[40%] lg:w-[38%] md:shrink-0 md:pt-4">
          <div className="sticky top-24 rounded-2xl border border-border shadow-xl shadow-black/10 p-6 bg-card space-y-4">
            <h3 className="text-xl font-bold text-foreground">Price Breakdown</h3>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{slot.label} slot</span>
              <span className="text-foreground font-medium">₹{slot.price.toLocaleString()}</span>
            </div>

            {lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                <span className="text-muted-foreground flex-1 truncate">{item.name} {item.qty > 1 ? `× ${item.qty}` : ""}</span>
                <span className="text-foreground font-medium shrink-0">₹{item.subtotal.toLocaleString()}</span>
                <button onClick={() => removeAddon(item.id)} className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-colors shrink-0">
                  <X size={10} className="text-muted-foreground" />
                </button>
              </div>
            ))}

            {extras.length > 0 && (
              <>
                <div className="border-t border-border/50 pt-2"><span className="text-[11px] font-semibold text-primary uppercase tracking-wide">Added Extras</span></div>
                {extras.map((ext) => {
                  const cheapest = ext.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];
                  return (
                    <div key={ext.id} className="flex items-center gap-2 text-sm">
                      <img src={ext.images[0]} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <span className="text-muted-foreground flex-1 truncate">{ext.name}</span>
                      <span className="text-foreground font-medium">₹{(cheapest?.price || ext.basePrice).toLocaleString()}</span>
                      <button onClick={() => removeExtra(ext.id)} className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center hover:bg-destructive/10 shrink-0"><X size={10} className="text-muted-foreground" /></button>
                    </div>
                  );
                })}
              </>
            )}

            {mattressTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><BedDouble size={12} /> Mattress × {extraMattressCount}</span>
                <span className="text-foreground font-medium">₹{mattressTotal.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="text-foreground font-medium">₹{platformFee}</span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-success font-medium">Discount ({couponDiscountType === "percentage" ? `${couponDiscount}%` : `₹${couponDiscount}`})</span>
                <span className="text-success font-medium">-₹{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-1">
              <div className="flex justify-between">
                <span className="text-foreground font-bold">Grand Total</span>
                <span className="text-2xl font-bold text-foreground">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {isSlotFull && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle size={16} className="text-destructive shrink-0" />
                <p className="text-xs text-destructive font-medium">This slot is fully booked for the selected date. Please choose a different date or slot.</p>
              </div>
            )}

            {!isSlotFull && spotsLeft !== null && spotsLeft <= 5 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left for this slot!</p>
              </div>
            )}

            <motion.button
              onClick={() => {
                if (liveGuests < 1) { setEditingGuests(true); return; }
                onConfirm(finalTotal, roomsForConfirm ?? undefined, isStay ? extraMattressCount : undefined);
              }}
              disabled={liveGuests < 1 || isSlotFull}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-radiate-pulse"
              whileTap={{ scale: 0.97 }}
            >
              {isSlotFull ? "Slot Fully Booked" : `Pay ₹${finalTotal.toLocaleString()} →`}
            </motion.button>

            <div className="flex items-center justify-center gap-3 pt-1">
              <Smartphone size={16} className="text-muted-foreground" />
              <CreditCard size={16} className="text-muted-foreground" />
              <Banknote size={16} className="text-muted-foreground" />
            </div>
            <p className="text-center text-xs text-muted-foreground">🔒 Secure · Instant confirmation</p>
          </div>
        </div>
      </div>

      {/* Sticky Pay Button — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 glass px-5 py-3.5 z-40 md:hidden">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{paymentMethods.find(m => m.id === selectedPayment)?.label}</span>
          {couponApplied && <span className="text-xs text-success font-medium">{couponDiscountType === "percentage" ? `${couponDiscount}%` : `₹${couponDiscount}`} off applied</span>}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-xl text-gradient-warm">₹{finalTotal.toLocaleString()}</span>
          <button
            onClick={() => {
              if (liveGuests < 1) { setEditingGuests(true); return; }
              onConfirm(finalTotal, roomsForConfirm ?? undefined, isStay ? extraMattressCount : undefined);
            }}
            disabled={liveGuests < 1 || isSlotFull}
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 glow-radiate disabled:opacity-50"
          >
            Pay Now <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
