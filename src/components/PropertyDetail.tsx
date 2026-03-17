import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Heart, Star, BadgeCheck, MapPin,
  ChevronDown, ChevronUp, Minus, Plus, Droplets, Flame,
  Music, Car, Beef, Sparkles
} from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";

const amenityIconMap: Record<string, React.ReactNode> = {
  "Private Pool": <Droplets size={20} strokeWidth={1.5} />,
  "Bonfire Pit": <Flame size={20} strokeWidth={1.5} />,
  "Bonfire Circle": <Flame size={20} strokeWidth={1.5} />,
  "Sound System": <Music size={20} strokeWidth={1.5} />,
  "Free Parking": <Car size={20} strokeWidth={1.5} />,
  "Parking": <Car size={20} strokeWidth={1.5} />,
  "BBQ Area": <Beef size={20} strokeWidth={1.5} />,
  "Fairy Lights": <Sparkles size={20} strokeWidth={1.5} />,
};

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

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-30 bg-background overflow-y-auto pb-28"
    >
      {/* Hero */}
      <div className="relative aspect-[4/3]">
        <img src={property.images[imgIndex]} alt={property.name} className="w-full h-full object-cover" />

        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Share2 size={16} className="text-foreground" />
            </button>
            <button onClick={() => setLiked(!liked)} className="w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Heart size={16} className={liked ? "fill-primary text-primary" : "text-foreground"} />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <button key={i} onClick={() => setImgIndex(i)} className={`w-[6px] h-[6px] rounded-full transition-all ${i === imgIndex ? "bg-foreground" : "bg-foreground/40"}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-1.5">
              {property.name}
              {property.verified && <BadgeCheck size={16} className="text-primary" />}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin size={13} /> {property.location}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star size={14} className="fill-foreground text-foreground" />
            <span className="font-semibold text-foreground">{property.rating}</span>
            <span className="text-muted-foreground">({property.reviewCount})</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-b border-border my-4" />

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {expanded ? property.fullDescription : property.fullDescription.slice(0, 140) + "..."}
        </p>
        <button onClick={() => setExpanded(!expanded)} className="text-foreground underline text-sm font-medium mt-1.5 flex items-center gap-1">
          {expanded ? <>Show less <ChevronUp size={14} /></> : <>Show more <ChevronDown size={14} /></>}
        </button>

        <div className="border-b border-border my-4" />

        {/* Amenities */}
        <h3 className="text-base font-semibold mb-3 text-foreground">What this place offers</h3>
        <div className="space-y-3 mb-2">
          {property.amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {amenityIconMap[amenity] || <Sparkles size={20} strokeWidth={1.5} />}
              </span>
              <span className="text-sm text-foreground">{amenity}</span>
            </div>
          ))}
        </div>

        <div className="border-b border-border my-4" />

        {/* Date picker */}
        <h3 className="text-base font-semibold mb-3 text-foreground">Select a date</h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {dates.map((date, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(i)}
              className={`shrink-0 flex flex-col items-center w-14 py-2.5 rounded-full transition-all border ${
                selectedDate === i
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-foreground hover:border-muted-foreground"
              }`}
            >
              <span className="text-[10px] uppercase opacity-70">{date.toLocaleDateString("en-IN", { weekday: "short" })}</span>
              <span className="text-base font-semibold">{date.getDate()}</span>
            </button>
          ))}
        </div>

        <div className="border-b border-border my-4" />

        {/* Time slots */}
        <h3 className="text-base font-semibold mb-3 text-foreground">Choose a time slot</h3>
        <div className="grid grid-cols-2 gap-2">
          {property.slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => slot.available && setSelectedSlot(slot.id)}
              disabled={!slot.available}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedSlot === slot.id
                  ? "border-foreground bg-foreground/5"
                  : slot.available
                    ? "border-border hover:border-muted-foreground"
                    : "border-border opacity-40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-foreground">{slot.label}</span>
                {slot.popular && <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">Popular</span>}
              </div>
              <span className="text-[11px] text-muted-foreground">{slot.time}</span>
              <div className="mt-1">
                {slot.available ? (
                  <span className="font-semibold text-sm text-foreground">₹{slot.price.toLocaleString()}</span>
                ) : (
                  <span className="text-xs text-destructive">Booked</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="border-b border-border my-4" />

        {/* Guest selector */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">Guests</h3>
            <p className="text-xs text-muted-foreground">How many people?</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                guests <= 1 ? "border-border/50 text-muted-foreground/30" : "border-muted-foreground text-foreground"
              }`}
              disabled={guests <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="text-base font-semibold text-foreground min-w-[2ch] text-center">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(30, guests + 1))}
              className="w-8 h-8 rounded-full border border-muted-foreground flex items-center justify-center text-foreground"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <AnimatePresence>
        {selectedSlotData && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-40"
          >
            <div>
              <span className="font-semibold text-foreground">₹{selectedSlotData.price.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm"> / {selectedSlotData.label.toLowerCase()}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onBook(property, selectedSlot!, guests)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm"
            >
              Reserve
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
