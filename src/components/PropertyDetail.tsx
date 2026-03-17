import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Heart, Star, BadgeCheck, MapPin, ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onBook: (property: Property, slotId: string, guests: number) => void;
}

export default function PropertyDetail({ property, onBack, onBook }: PropertyDetailProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  const selectedSlotData = property.slots.find((s) => s.id === selectedSlot);

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
      className="fixed inset-0 z-30 bg-background overflow-y-auto pb-28"
    >
      {/* Hero */}
      <div className="relative aspect-[4/5] max-h-[50vh]">
        <img src={property.images[imgIndex]} alt={property.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-10 h-10 rounded-full glass-surface flex items-center justify-center">
            <ArrowLeft size={20} className="text-foreground" />
          </motion.button>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full glass-surface flex items-center justify-center">
              <Share2 size={18} className="text-foreground" />
            </button>
            <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-full glass-surface flex items-center justify-center">
              <Heart size={18} className={liked ? "fill-primary text-primary" : "text-foreground"} />
            </button>
          </div>
        </div>

        {/* Image dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <button key={i} onClick={() => setImgIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-foreground w-5" : "bg-foreground/30"}`} />
          ))}
        </div>

        <div className="absolute bottom-4 left-4">
          <h1 className="font-display text-3xl font-extrabold text-foreground">{property.name}</h1>
        </div>
      </div>

      {/* Quick info */}
      <div className="px-4 py-3 flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1"><Star size={14} className="text-accent fill-accent" /> {property.rating} ({property.reviewCount})</span>
        <span className="flex items-center gap-1"><MapPin size={14} className="text-muted-foreground" /> {property.location}</span>
        {property.verified && <span className="flex items-center gap-1"><BadgeCheck size={14} className="text-primary" /> Verified</span>}
      </div>

      {/* Description */}
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expanded ? property.fullDescription : property.fullDescription.slice(0, 120) + "..."}
        </p>
        <button onClick={() => setExpanded(!expanded)} className="text-primary text-sm font-medium mt-1 flex items-center gap-1">
          {expanded ? <>Less <ChevronUp size={14} /></> : <>Read more <ChevronDown size={14} /></>}
        </button>
      </div>

      {/* Amenities */}
      <div className="px-4 pb-4">
        <h3 className="font-display text-lg font-bold mb-3 text-foreground">What's here</h3>
        <div className="grid grid-cols-2 gap-2">
          {property.amenities.map((amenity, i) => (
            <div key={amenity} className="glass-card p-3 flex items-center gap-2">
              <span className="text-lg">{property.amenityIcons[i]}</span>
              <span className="text-sm text-foreground">{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Date picker */}
      <div className="px-4 pb-4">
        <h3 className="font-display text-lg font-bold mb-3 text-foreground">Pick your date</h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {dates.map((date, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(i)}
              className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl transition-all ${
                selectedDate === i ? "bg-primary/15 border border-primary/30 glow-primary" : "bg-card border border-transparent"
              }`}
            >
              <span className="text-[10px] text-muted-foreground uppercase">{date.toLocaleDateString("en-IN", { weekday: "short" })}</span>
              <span className={`text-lg font-bold ${selectedDate === i ? "text-primary" : "text-foreground"}`}>{date.getDate()}</span>
              <span className="text-[10px] text-muted-foreground">{date.toLocaleDateString("en-IN", { month: "short" })}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="px-4 pb-4">
        <h3 className="font-display text-lg font-bold mb-3 text-foreground">Choose your slot</h3>
        <div className="space-y-2">
          {property.slots.map((slot) => (
            <motion.button
              key={slot.id}
              whileTap={slot.available ? { scale: 0.97 } : {}}
              onClick={() => slot.available && setSelectedSlot(slot.id)}
              disabled={!slot.available}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                selectedSlot === slot.id
                  ? "bg-primary/15 border-2 border-primary glow-primary"
                  : slot.available
                    ? "bg-card border border-border hover:border-primary/30"
                    : "bg-card/50 border border-border opacity-50"
              }`}
            >
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{slot.label}</span>
                  {slot.popular && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">🔥 Popular</span>}
                </div>
                <span className="text-xs text-muted-foreground">{slot.time}</span>
              </div>
              <div className="text-right">
                {slot.available ? (
                  <span className="font-bold text-accent">₹{slot.price.toLocaleString()}</span>
                ) : (
                  <span className="text-xs text-destructive font-medium">Booked</span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Guest selector */}
      <div className="px-4 pb-6">
        <h3 className="font-display text-lg font-bold mb-3 text-foreground">How many guests?</h3>
        <div className="flex items-center gap-4 glass-card p-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <Minus size={18} className="text-foreground" />
          </motion.button>
          <span className="text-2xl font-bold text-foreground min-w-[3ch] text-center">{guests}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setGuests(Math.min(30, guests + 1))}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <Plus size={18} className="text-foreground" />
          </motion.button>
          <span className="text-sm text-muted-foreground ml-2">people</span>
        </div>
      </div>

      {/* Sticky bottom */}
      <AnimatePresence>
        {selectedSlotData && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 glass-surface border-t border-border/50 p-4 flex items-center justify-between z-40"
          >
            <div>
              <span className="text-accent font-bold text-xl">₹{selectedSlotData.price.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm"> / {selectedSlotData.label.toLowerCase()}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onBook(property, selectedSlot!, guests)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold text-sm shimmer-btn"
            >
              Secure the Vibe
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
