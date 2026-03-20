import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Tag, CreditCard, Smartphone, Banknote, ChevronRight, Shield, Clock, Users, MapPin, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { Property } from "@/data/properties";
import { addons } from "@/data/properties";

interface CheckoutScreenProps {
  property: Property;
  slotId: string;
  guests: number;
  date: Date;
  selections: Record<string, number>;
  total: number;
  onBack: () => void;
  onConfirm: (total: number) => void;
  extras?: Property[];
}

const paymentMethods = [
  { id: "upi", label: "UPI / Google Pay", icon: Smartphone, sublabel: "Instant payment" },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, sublabel: "Visa, Mastercard, RuPay" },
  { id: "cod", label: "Pay at Venue", icon: Banknote, sublabel: "Cash or card on arrival" },
];

export default function CheckoutScreen({ property, slotId, guests, date, selections, total, onBack, onConfirm }: CheckoutScreenProps) {
  const slot = property.slots.find((s) => s.id === slotId)!;
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");

  const discount = couponApplied ? Math.round(total * 0.1) : 0;
  const platformFee = 49;
  const finalTotal = total - discount + platformFee;

  // Build line items from selections
  const lineItems: { name: string; qty: number; unitPrice: number; subtotal: number }[] = [];
  Object.entries(selections).forEach(([id, qty]) => {
    for (const group of Object.values(addons)) {
      const item = group.find((a) => a.id === id);
      if (item) {
        const unitPrice = item.price * (item.perPerson ? guests : 1);
        lineItems.push({ name: item.name, qty, unitPrice: item.price, subtotal: unitPrice * qty });
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
      {/* Header */}
      <div className="sticky top-0 z-10 glass px-5 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft size={16} className="text-foreground" />
          </button>
          <div>
            <h2 className="font-semibold text-base text-foreground">Confirm & Pay</h2>
            <p className="text-xs text-muted-foreground">Review your booking details</p>
          </div>
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
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><CalendarIcon size={12} /> {format(date, "EEE, d MMM")}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {slot.label} · {slot.time}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {guests} guests</span>
          </div>
        </motion.div>

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

          {/* Add-on items */}
          {lineItems.map((item) => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} {item.qty > 1 ? `× ${item.qty}` : ""}
              </span>
              <span className="text-foreground font-medium">₹{item.subtotal.toLocaleString()}</span>
            </div>
          ))}

          {/* Platform fee */}
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
            onClick={() => onConfirm(finalTotal)}
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 glow-primary"
          >
            Pay Now <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
