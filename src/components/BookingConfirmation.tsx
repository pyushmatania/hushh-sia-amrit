import { motion } from "framer-motion";
import { Check, MapPin, Calendar, Users, Clock, ShoppingCart, Shield, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { fireCelebration } from "@/lib/confetti";
import { format } from "date-fns";
import type { Property } from "@/data/properties";
import LiveOrderingSheet from "./LiveOrderingSheet";
import IdentityUploadSheet from "./IdentityUploadSheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAppConfig } from "@/hooks/use-app-config";
import BookingQRCode from "./shared/BookingQRCode";
import { nativeShare } from "@/lib/native-share";

interface BookingConfirmationProps {
  property: Property;
  slotId: string;
  guests: number;
  date: Date;
  total: number;
  onDone: () => void;
  bookingId?: string;
}

export default function BookingConfirmation({ property, slotId, guests, date, total, onDone, bookingId: passedBookingId }: BookingConfirmationProps) {
  const appConfig = useAppConfig();
  const prefix = (appConfig.app_name || "HUSHH").toUpperCase();
  const slot = property.slots.find((s) => s.id === slotId);
  // Use the real booking ID from the DB if available, otherwise generate a display-only fallback
  const [bookingId] = useState(() => passedBookingId || `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [orderingOpen, setOrderingOpen] = useState(false);
  const [idSheetOpen, setIdSheetOpen] = useState(false);
  const [idVerified, setIdVerified] = useState<boolean | null>(null);
  const { user } = useAuth();

  // 🎉 Fire confetti on mount
  useEffect(() => { fireCelebration(); }, []);

  useEffect(() => {
    const check = async () => {
      if (!user) { setIdVerified(false); return; }
      const { data } = await supabase
        .from("identity_verifications")
        .select("status")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1);
      setIdVerified(data && data.length > 0 && data[0].status === "approved");
    };
    check();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(6px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
    >
      <div className="flex flex-col items-center justify-start pt-20 px-6 md:max-w-xl md:mx-auto">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-5"
        >
          <Check size={32} className="text-success" strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-2xl font-semibold text-foreground text-center"
        >
          You're all set!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-sm mt-1"
        >
          Booking ID: {bookingId}
        </motion.p>

        {/* Booking card */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.7, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full mt-8 rounded-2xl border border-border p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <img src={property.images?.[0] || "/placeholder.svg"} alt={property.name} className="w-14 h-14 rounded-xl object-cover" />
            <div>
              <h3 className="font-semibold text-foreground">{property.name}</h3>
              <p className="text-xs text-muted-foreground">{property.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Calendar size={14} /> {format(date, "EEEE, d MMMM yyyy")}</span>
            <span className="flex items-center gap-2"><Clock size={14} /> {slot ? `${slot.label} · ${slot.time}` : "Confirmed slot"}</span>
            <span className="flex items-center gap-2"><Users size={14} /> {guests} guests</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Total paid</span>
            <span className="text-foreground font-semibold text-lg">₹{total.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center pt-3 border-t border-border">
            <BookingQRCode bookingId={bookingId} size={96} />
            <p className="text-xs text-muted-foreground mt-2">Show this at entry</p>
          </div>
        </motion.div>

        {/* Entry instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="w-full mt-4 rounded-2xl border border-border p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-primary" />
            <h4 className="font-semibold text-sm text-foreground">How to get there</h4>
          </div>
          <p className="text-sm text-muted-foreground">{property.entryInstructions}</p>
        </motion.div>

        {/* ID Verification Alert */}
        {idVerified === false && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="w-full mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Shield size={20} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground">Verify your identity</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Upload your ID for faster check-in. Required for all guests.</p>
                <button
                  onClick={() => setIdSheetOpen(true)}
                  className="mt-2 px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold active:scale-95 transition-transform flex items-center gap-1.5"
                >
                  <Upload size={12} /> Upload ID Now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="w-full mt-6 space-y-3 pb-10">
          <motion.button
            onClick={() => setOrderingOpen(true)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <ShoppingCart size={16} /> Order Food & Drinks
          </motion.button>
          <motion.button
            onClick={onDone}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            whileTap={{ scale: 0.96 }}
          >
            Go to My Trips
          </motion.button>
          <button
            onClick={() => nativeShare({
              title: `Booking at ${property.name}`,
              text: `🎉 I just booked ${property.name} on ${format(date, "d MMM yyyy")}! Join me!`,
              url: window.location.href,
            })}
            className="w-full py-3 rounded-lg border border-foreground text-foreground font-medium text-sm"
          >
            Share with Friends
          </button>
        </div>
      </div>

      <LiveOrderingSheet
        open={orderingOpen}
        onClose={() => setOrderingOpen(false)}
        propertyName={property.name}
        propertyId={property.id}
      />
      <IdentityUploadSheet open={idSheetOpen} onClose={() => setIdSheetOpen(false)} />
    </motion.div>
  );
}
