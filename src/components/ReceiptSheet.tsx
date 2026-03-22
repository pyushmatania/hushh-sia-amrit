import { motion } from "framer-motion";
import { X, Download, Share2, Receipt, MapPin, Calendar as CalendarIcon, Clock, Users, CreditCard } from "lucide-react";
import type { Booking } from "@/pages/Index";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import { useAppConfig } from "@/hooks/use-app-config";
import { useRef } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  booking: Booking;
}

export default function ReceiptSheet({ open, onClose, booking }: Props) {
  const { properties } = usePropertiesData();
  const appConfig = useAppConfig();
  const brandName = appConfig.app_name || "Hushh";
  const property = properties.find(p => p.id === booking.propertyId);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${property?.name || "Booking"}`,
          text: `Booking ${booking.bookingId}\n${property?.name}\n${booking.date} · ${booking.slot}\n₹${booking.total.toLocaleString()}`,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(
        `🧾 Booking Receipt\n${property?.name}\nDate: ${booking.date}\nSlot: ${booking.slot}\nGuests: ${booking.guests}\nTotal: ₹${booking.total.toLocaleString()}\nBooking ID: ${booking.bookingId}`
      );
      toast.success("Receipt copied to clipboard!");
    }
  };

  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-card z-10 px-5 pt-4 pb-3 border-b border-border/50">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Receipt size={16} className="text-primary" /> Digital Receipt
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Share2 size={14} className="text-muted-foreground" />
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5" ref={receiptRef}>
          {/* Receipt Card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 text-center border-b border-border/50">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🧾</span>
              </div>
              <h4 className="text-lg font-bold text-foreground">Payment Receipt</h4>
              <p className="text-xs text-muted-foreground mt-1">{brandName} Experiences</p>
            </div>

            {/* Property Info */}
            <div className="p-4 border-b border-dashed border-border/50">
              <div className="flex items-center gap-3">
                {property && (
                  <img src={property.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{property?.name || "Property"}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {property?.location || "Location"}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-4 space-y-3 border-b border-dashed border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon size={12} /> Date
                </span>
                <span className="text-xs font-medium text-foreground">{booking.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} /> Time Slot
                </span>
                <span className="text-xs font-medium text-foreground">{booking.slot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Users size={12} /> Guests
                </span>
                <span className="text-xs font-medium text-foreground">{booking.guests} people</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CreditCard size={12} /> Status
                </span>
                <span className={`text-xs font-semibold capitalize ${
                  booking.status === "completed" ? "text-emerald-500" :
                  booking.status === "active" ? "text-emerald-500" :
                  booking.status === "cancelled" ? "text-destructive" :
                  "text-primary"
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="p-4 border-b border-dashed border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Booking Total</span>
                <span className="text-xs text-foreground">₹{booking.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Platform Fee</span>
                <span className="text-xs text-foreground">₹49</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-sm font-bold text-foreground">Total Paid</span>
                <span className="text-lg font-bold text-foreground">₹{booking.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Booking ID & Footer */}
            <div className="p-4 text-center space-y-2">
              <div className="inline-block px-3 py-1.5 rounded-lg bg-secondary">
                <p className="text-[10px] text-muted-foreground">Booking ID</p>
                <p className="text-xs font-mono font-bold text-foreground">{booking.bookingId}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">Thank you for choosing Hushh ❤️</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
