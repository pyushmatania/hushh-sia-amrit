import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Heart, Star, BadgeCheck, MapPin,
  ChevronDown, ChevronUp, Minus, Plus, Droplets, Flame,
  Music, Car, Beef, Sparkles, Wifi, Trees, Clapperboard,
  Sofa, Headphones, Wine, MessageCircle, Phone, Shield,
  Clock, Users, Award, Camera, ThumbsUp
} from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import profileAvatar from "@/assets/profile-avatar.png";

const amenityIconMap: Record<string, React.ReactNode> = {
  "Private Pool": <Droplets size={20} strokeWidth={1.5} />,
  "Bonfire Pit": <Flame size={20} strokeWidth={1.5} />,
  "Bonfire Circle": <Flame size={20} strokeWidth={1.5} />,
  "Sound System": <Music size={20} strokeWidth={1.5} />,
  "Free Parking": <Car size={20} strokeWidth={1.5} />,
  "Parking": <Car size={20} strokeWidth={1.5} />,
  "BBQ Area": <Beef size={20} strokeWidth={1.5} />,
  "Fairy Lights": <Sparkles size={20} strokeWidth={1.5} />,
  "Outdoor Dining": <Beef size={20} strokeWidth={1.5} />,
  "Stargazing Deck": <Star size={20} strokeWidth={1.5} />,
  "Garden": <Trees size={20} strokeWidth={1.5} />,
  "Kitchen Access": <Beef size={20} strokeWidth={1.5} />,
  "Hammocks": <Sofa size={20} strokeWidth={1.5} />,
  "Movie Screen": <Clapperboard size={20} strokeWidth={1.5} />,
  "Lounge Seating": <Sofa size={20} strokeWidth={1.5} />,
  "DJ Booth": <Headphones size={20} strokeWidth={1.5} />,
  "Bar Counter": <Wine size={20} strokeWidth={1.5} />,
  "Dance Floor": <Music size={20} strokeWidth={1.5} />,
};

const fakeReviews = [
  { name: "Priya", rating: 5, text: "Absolutely magical! The bonfire under the stars was unforgettable. Will definitely come back!", date: "2 weeks ago", avatar: "🧕" },
  { name: "Rahul", rating: 5, text: "Best private pool experience in Jeypore. The hosts were super friendly and the setup was perfect.", date: "1 month ago", avatar: "👨" },
  { name: "Sneha", rating: 4, text: "Beautiful venue! Great for a romantic date night. The fairy lights made it so dreamy.", date: "2 months ago", avatar: "👩" },
];

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
      {/* Hero with parallax feel */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          key={imgIndex}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "hsla(0,0%,0%,0.3)", backdropFilter: "blur(10px)" }}>
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "hsla(0,0%,0%,0.3)", backdropFilter: "blur(10px)" }}>
              <Share2 size={16} className="text-white" />
            </button>
            <button onClick={() => setLiked(!liked)} className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "hsla(0,0%,0%,0.3)", backdropFilter: "blur(10px)" }}>
              <Heart size={16} className={liked ? "fill-primary text-primary" : "text-white"} />
            </button>
          </div>
        </div>

        {/* Image counter badge */}
        <div className="absolute bottom-4 right-4 glass rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <Camera size={12} className="text-foreground" />
          <span className="text-[11px] font-medium text-foreground">{imgIndex + 1}/{property.images.length}</span>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <button key={i} onClick={() => setImgIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-white w-5" : "bg-white/40"}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5">
        {/* Tags */}
        <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
          {property.tags.map((tag) => (
            <span key={tag} className="shrink-0 text-[11px] font-semibold glass px-3 py-1.5 rounded-full text-foreground">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight">{property.name}</h1>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1 text-foreground font-semibold">
            <Star size={14} className="fill-primary text-primary" /> {property.rating}
          </span>
          <span>·</span>
          <span className="underline cursor-pointer">{property.reviewCount} reviews</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><MapPin size={13} /> {property.location}</span>
        </div>
        {property.verified && (
          <div className="flex items-center gap-1.5 mt-2.5 glass rounded-full px-3 py-1.5 w-fit">
            <BadgeCheck size={14} className="text-primary" />
            <span className="text-xs font-medium text-foreground">Verified property</span>
          </div>
        )}

        <div className="border-b border-border my-5" />

        {/* Quick Highlights */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Clock, label: "2-hour slots", detail: "Flexible timing" },
            { icon: Users, label: `Up to 30`, detail: "Guest capacity" },
            { icon: Shield, label: "Verified", detail: "Safety checked" },
          ].map((h, i) => (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass rounded-2xl p-3 text-center"
            >
              <h.icon size={20} className="text-primary mx-auto mb-1.5" />
              <p className="text-xs font-bold text-foreground">{h.label}</p>
              <p className="text-[10px] text-muted-foreground">{h.detail}</p>
            </motion.div>
          ))}
        </div>

        {/* Description */}
        <p className="text-[15px] text-foreground leading-relaxed">
          {expanded ? property.fullDescription : property.fullDescription.slice(0, 150) + "..."}
        </p>
        <button onClick={() => setExpanded(!expanded)} className="text-primary text-sm font-semibold mt-2 flex items-center gap-1">
          {expanded ? <>Show less <ChevronUp size={14} /></> : <>Show more <ChevronDown size={14} /></>}
        </button>

        <div className="border-b border-border my-5" />

        {/* Host Info */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
                <img src={profileAvatar} alt="Host" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-card" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-foreground">Hosted by Ravi</h4>
                <BadgeCheck size={14} className="text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Superhost · 2 years hosting</p>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <MessageCircle size={16} className="text-foreground" />
              </button>
              <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <Phone size={16} className="text-foreground" />
              </button>
            </div>
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Award size={14} className="text-gold" />
              <span className="text-xs text-foreground">98% response rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-success" />
              <span className="text-xs text-foreground">Replies in 5 min</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <h3 className="text-lg font-bold text-foreground mb-3">What this place offers</h3>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {property.amenities.map((amenity, i) => (
            <motion.div
              key={amenity}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className="flex items-center gap-3 glass rounded-xl px-3 py-2.5"
            >
              <span className="text-primary">
                {amenityIconMap[amenity] || <Sparkles size={20} strokeWidth={1.5} />}
              </span>
              <span className="text-xs font-medium text-foreground">{amenity}</span>
            </motion.div>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Reviews Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Star size={18} className="fill-primary text-primary" /> {property.rating} · {property.reviewCount} reviews
            </h3>
          </div>

          {/* Rating breakdown */}
          <div className="glass rounded-2xl p-4 mb-4">
            {[
              { label: "Cleanliness", value: 4.9 },
              { label: "Experience", value: 4.8 },
              { label: "Value", value: 4.7 },
              { label: "Safety", value: 5.0 },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3 mb-2 last:mb-0">
                <span className="text-xs text-muted-foreground w-20">{r.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(r.value / 5) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground w-7 text-right">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Review cards */}
          <div className="space-y-3">
            {fakeReviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{review.name}</p>
                    <p className="text-[10px] text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} size={10} className="fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{review.text}</p>
                <button className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                  <ThumbsUp size={10} /> Helpful
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="border-b border-border my-5" />

        {/* Date picker */}
        <h3 className="text-lg font-bold text-foreground mb-3">Select a date</h3>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {dates.map((date, i) => {
            const isToday = i === 0;
            const isSelected = selectedDate === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(i)}
                className={`shrink-0 flex flex-col items-center w-[52px] py-2.5 rounded-2xl transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground glow-sm"
                    : "glass text-foreground"
                }`}
              >
                <span className="text-[10px] uppercase opacity-70 font-medium">
                  {isToday ? "Today" : date.toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
                <span className="text-lg font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="border-b border-border my-5" />

        {/* Time slots */}
        <h3 className="text-lg font-bold text-foreground mb-3">Choose your slot</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {property.slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => slot.available && setSelectedSlot(slot.id)}
              disabled={!slot.available}
              className={`p-3.5 rounded-2xl text-left transition-all ${
                selectedSlot === slot.id
                  ? "glass border-2 border-primary glow-sm"
                  : slot.available
                    ? "glass hover:border-primary/30"
                    : "glass opacity-35"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-foreground">{slot.label}</span>
                {slot.popular && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">🔥 Hot</span>}
              </div>
              <span className="text-xs text-muted-foreground">{slot.time}</span>
              <div className="mt-1.5">
                {slot.available ? (
                  <span className="font-bold text-sm text-gradient-warm">₹{slot.price.toLocaleString()}</span>
                ) : (
                  <span className="text-xs text-destructive font-medium">Sold out</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Guest selector */}
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Guests</h3>
            <p className="text-sm text-muted-foreground">How many people?</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              disabled={guests <= 1}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                guests <= 1 ? "glass opacity-40" : "glass text-foreground"
              }`}
            >
              <Minus size={14} />
            </button>
            <span className="text-lg font-bold text-foreground w-6 text-center">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(30, guests + 1))}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-foreground"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Entry instructions */}
        <div className="glass rounded-2xl p-4 mb-5">
          <h4 className="text-sm font-bold text-foreground mb-1.5 flex items-center gap-2">
            <MapPin size={14} className="text-primary" /> How to get there
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{property.entryInstructions}</p>
        </div>

        {/* Safety */}
        <div className="glass rounded-2xl p-4 mb-6">
          <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Shield size={14} className="text-success" /> Safety features
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {["First aid kit", "Fire extinguisher", "CCTV (common areas)", "24/7 support"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-xs text-foreground">{item}</span>
              </div>
            ))}
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
              <span className="font-bold text-lg text-gradient-warm">₹{selectedSlotData.price.toLocaleString()}</span>
              <span className="text-muted-foreground text-xs block">{selectedSlotData.label} · {selectedSlotData.time}</span>
            </div>
            <button
              onClick={() => onBook(property, selectedSlot!, guests)}
              className="bg-primary text-primary-foreground px-7 py-3 rounded-2xl font-bold text-sm glow-primary"
            >
              Reserve
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
