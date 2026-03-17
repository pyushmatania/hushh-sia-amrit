import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Heart, Star, BadgeCheck, MapPin,
  ChevronDown, ChevronUp, Minus, Plus, Droplets, Flame,
  Music, Car, Beef, Sparkles, Wifi, Trees, Clapperboard,
  Sofa, Headphones, Wine
} from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";

const amenityIconMap: Record<string, React.ReactNode> = {
  "Private Pool": <Droplets size={22} strokeWidth={1.5} />,
  "Bonfire Pit": <Flame size={22} strokeWidth={1.5} />,
  "Bonfire Circle": <Flame size={22} strokeWidth={1.5} />,
  "Sound System": <Music size={22} strokeWidth={1.5} />,
  "Free Parking": <Car size={22} strokeWidth={1.5} />,
  "Parking": <Car size={22} strokeWidth={1.5} />,
  "BBQ Area": <Beef size={22} strokeWidth={1.5} />,
  "Fairy Lights": <Sparkles size={22} strokeWidth={1.5} />,
  "Outdoor Dining": <Beef size={22} strokeWidth={1.5} />,
  "Stargazing Deck": <Star size={22} strokeWidth={1.5} />,
  "Garden": <Trees size={22} strokeWidth={1.5} />,
  "Kitchen Access": <Beef size={22} strokeWidth={1.5} />,
  "Hammocks": <Sofa size={22} strokeWidth={1.5} />,
  "Movie Screen": <Clapperboard size={22} strokeWidth={1.5} />,
  "Lounge Seating": <Sofa size={22} strokeWidth={1.5} />,
  "DJ Booth": <Headphones size={22} strokeWidth={1.5} />,
  "Bar Counter": <Wine size={22} strokeWidth={1.5} />,
  "Dance Floor": <Music size={22} strokeWidth={1.5} />,
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
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-28"
    >
      {/* Hero */}
      <div className="relative aspect-[4/3]">
        <img src={property.images[imgIndex]} alt={property.name} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center">
              <Share2 size={16} className="text-foreground" />
            </button>
            <button onClick={() => setLiked(!liked)} className="w-9 h-9 rounded-full glass flex items-center justify-center">
              <Heart size={16} className={liked ? "fill-primary text-primary" : "text-foreground"} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <button key={i} onClick={() => setImgIndex(i)} className={`w-[6px] h-[6px] rounded-full ${i === imgIndex ? "bg-background" : "bg-background/50"}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-semibold text-foreground">{property.name}</h1>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 text-foreground font-medium">
            <Star size={14} className="fill-foreground" /> {property.rating}
          </span>
          <span>·</span>
          <span>{property.reviewCount} reviews</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><MapPin size={13} /> {property.location}</span>
        </div>
        {property.verified && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
            <BadgeCheck size={16} className="text-primary" />
            <span>Verified property</span>
          </div>
        )}

        <div className="border-b border-border my-5" />

        {/* Description */}
        <p className="text-[15px] text-foreground leading-relaxed">
          {expanded ? property.fullDescription : property.fullDescription.slice(0, 150) + "..."}
        </p>
        <button onClick={() => setExpanded(!expanded)} className="text-foreground underline underline-offset-2 text-sm font-semibold mt-2 flex items-center gap-1">
          {expanded ? <>Show less <ChevronUp size={14} /></> : <>Show more <ChevronDown size={14} /></>}
        </button>

        <div className="border-b border-border my-5" />

        {/* Amenities */}
        <h3 className="text-lg font-semibold text-foreground mb-4">What this place offers</h3>
        <div className="space-y-4">
          {property.amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-4">
              <span className="text-foreground">
                {amenityIconMap[amenity] || <Sparkles size={22} strokeWidth={1.5} />}
              </span>
              <span className="text-[15px] text-foreground">{amenity}</span>
            </div>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Date picker */}
        <h3 className="text-lg font-semibold text-foreground mb-3">Select a date</h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {dates.map((date, i) => {
            const isToday = i === 0;
            const isSelected = selectedDate === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(i)}
                className={`shrink-0 flex flex-col items-center w-[52px] py-2 rounded-full transition-all border ${
                  isSelected
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                <span className="text-[10px] uppercase opacity-60 font-medium">
                  {isToday ? "Today" : date.toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
                <span className="text-lg font-semibold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="border-b border-border my-5" />

        {/* Time slots */}
        <h3 className="text-lg font-semibold text-foreground mb-3">Choose your slot</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {property.slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => slot.available && setSelectedSlot(slot.id)}
              disabled={!slot.available}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                selectedSlot === slot.id
                  ? "border-foreground bg-foreground/[0.03] shadow-sm"
                  : slot.available
                    ? "border-border hover:border-foreground/40"
                    : "border-border opacity-35"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-foreground">{slot.label}</span>
                {slot.popular && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">Popular</span>}
              </div>
              <span className="text-xs text-muted-foreground">{slot.time}</span>
              <div className="mt-1.5">
                {slot.available ? (
                  <span className="font-semibold text-sm text-foreground">₹{slot.price.toLocaleString()}</span>
                ) : (
                  <span className="text-xs text-destructive font-medium">Booked</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Guest selector */}
        <div className="flex items-center justify-between pb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Guests</h3>
            <p className="text-sm text-muted-foreground">How many people?</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                guests <= 1 ? "border-border text-border" : "border-muted-foreground text-foreground"
              }`}
            >
              <Minus size={14} />
            </button>
            <span className="text-base font-medium text-foreground w-6 text-center">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(30, guests + 1))}
              className="w-8 h-8 rounded-full border border-muted-foreground flex items-center justify-center text-foreground"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky bottom */}
      <AnimatePresence>
        {selectedSlotData && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 glass px-5 py-3.5 flex items-center justify-between z-40"
          >
            <div>
              <span className="font-semibold text-foreground">₹{selectedSlotData.price.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm"> / {selectedSlotData.label.toLowerCase()}</span>
            </div>
            <button
              onClick={() => onBook(property, selectedSlot!, guests)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm glow-primary"
            >
              Reserve
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
