import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, Heart, Star, BadgeCheck, MapPin,
  ChevronDown, ChevronUp, Minus, Plus, Droplets, Flame,
  Music, Car, Beef, Sparkles, Wifi, Trees, Clapperboard,
  Sofa, Headphones, Wine, Users, MessageCircle, Clock,
  ShieldCheck, Tent, Footprints, Palette, Bird, Drum,
  Activity, Trophy, Mic, Rainbow, Popcorn, Volume2,
  Snowflake, Camera, Theater, Waves, ChefHat, Guitar,
  Flower2, Gamepad2, Navigation, Phone, CalendarX2,
  Shield, Zap, Info, Coffee, Utensils, ParkingCircle
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
  "WiFi": <Wifi size={22} strokeWidth={1.5} />,
  "Washroom": <ShieldCheck size={22} strokeWidth={1.5} />,
  "Board Games": <Gamepad2 size={22} strokeWidth={1.5} />,
  "Stage Area": <Theater size={22} strokeWidth={1.5} />,
  "Rooftop Lounge": <Sofa size={22} strokeWidth={1.5} />,
  "Cocktail Bar": <Wine size={22} strokeWidth={1.5} />,
  "City View": <Sparkles size={22} strokeWidth={1.5} />,
  "Ambient Lighting": <Sparkles size={22} strokeWidth={1.5} />,
  "Elevator Access": <ShieldCheck size={22} strokeWidth={1.5} />,
  "AC Indoor Backup": <Snowflake size={22} strokeWidth={1.5} />,
  "Camping Tents": <Tent size={22} strokeWidth={1.5} />,
  "Nature Trail": <Footprints size={22} strokeWidth={1.5} />,
  "Tribal Art": <Palette size={22} strokeWidth={1.5} />,
  "Campfire": <Flame size={22} strokeWidth={1.5} />,
  "Bird Watching": <Bird size={22} strokeWidth={1.5} />,
  "Drum Circle": <Drum size={22} strokeWidth={1.5} />,
  "Clean Washrooms": <ShieldCheck size={22} strokeWidth={1.5} />,
  "First Aid": <Activity size={22} strokeWidth={1.5} />,
  "Pickleball Court": <Trophy size={22} strokeWidth={1.5} />,
  "Cricket Net": <Trophy size={22} strokeWidth={1.5} />,
  "Turf Ground": <Trophy size={22} strokeWidth={1.5} />,
  "Floodlights": <Sparkles size={22} strokeWidth={1.5} />,
  "Changing Room": <ShieldCheck size={22} strokeWidth={1.5} />,
  "Refreshment Counter": <Wine size={22} strokeWidth={1.5} />,
  "Karaoke System": <Mic size={22} strokeWidth={1.5} />,
  "Neon Lighting": <Rainbow size={22} strokeWidth={1.5} />,
  "Snack Bar": <Popcorn size={22} strokeWidth={1.5} />,
  "Sound Proofing": <Volume2 size={22} strokeWidth={1.5} />,
  "AC Room": <Snowflake size={22} strokeWidth={1.5} />,
  "Photo Booth": <Camera size={22} strokeWidth={1.5} />,
  "Props & Costumes": <Theater size={22} strokeWidth={1.5} />,
  "Lake View": <Waves size={22} strokeWidth={1.5} />,
  "Canopy Dining": <Tent size={22} strokeWidth={1.5} />,
  "Private Chef": <ChefHat size={22} strokeWidth={1.5} />,
  "Floating Candles": <Flame size={22} strokeWidth={1.5} />,
  "Acoustic Music": <Guitar size={22} strokeWidth={1.5} />,
  "Flower Decor": <Flower2 size={22} strokeWidth={1.5} />,
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
  const [showAllReviews, setShowAllReviews] = useState(false);

  const selectedSlotData = property.slots.find((s) => s.id === selectedSlot);

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(0);

  const displayedReviews = showAllReviews ? property.reviews : property.reviews.slice(0, 2);

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
        {/* Tags overlay */}
        {property.tags.length > 0 && (
          <div className="absolute bottom-10 left-4 flex gap-2">
            {property.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-semibold glass px-3 py-1.5 rounded-full text-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pt-5">
        <h1 className="text-2xl font-semibold text-foreground">{property.name}</h1>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1 text-foreground font-medium">
            <Star size={14} className="fill-foreground" /> {property.rating}
          </span>
          <span>·</span>
          <span>{property.reviewCount} reviews</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><MapPin size={13} /> {property.location}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Users size={13} /> Up to {property.capacity}</span>
        </div>
        {property.verified && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
            <BadgeCheck size={16} className="text-primary" />
            <span>Verified property</span>
          </div>
        )}

        <div className="border-b border-border my-5" />

        {/* Highlights */}
        <h3 className="text-lg font-semibold text-foreground mb-3">✨ Highlights</h3>
        <div className="grid grid-cols-1 gap-2 mb-5">
          {property.highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 glass rounded-xl px-4 py-3"
            >
              <span className="text-primary text-lg">✦</span>
              <span className="text-sm text-foreground">{h}</span>
            </motion.div>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Description */}
        <p className="text-[15px] text-foreground leading-relaxed">
          {expanded ? property.fullDescription : property.fullDescription.slice(0, 150) + "..."}
        </p>
        <button onClick={() => setExpanded(!expanded)} className="text-foreground underline underline-offset-2 text-sm font-semibold mt-2 flex items-center gap-1">
          {expanded ? <>Show less <ChevronUp size={14} /></> : <>Show more <ChevronDown size={14} /></>}
        </button>

        <div className="border-b border-border my-5" />

        {/* Host Info */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
              👤
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Hosted by {property.hostName}</h4>
              <p className="text-xs text-muted-foreground">Host since {property.hostSince} · {property.responseRate} response rate</p>
            </div>
            <button className="glass rounded-full px-3 py-1.5 text-xs font-medium text-foreground flex items-center gap-1">
              <MessageCircle size={12} /> Chat
            </button>
          </div>
        </div>

        {/* Amenities */}
        <h3 className="text-lg font-semibold text-foreground mb-4">What this place offers</h3>
        <div className="grid grid-cols-2 gap-3">
          {property.amenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-3 glass rounded-xl px-3 py-3">
              <span className="text-foreground shrink-0">
                {amenityIconMap[amenity] || <Sparkles size={22} strokeWidth={1.5} />}
              </span>
              <span className="text-[13px] text-foreground">{amenity}</span>
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
                  ? "border-primary bg-primary/[0.08] shadow-sm glow-sm"
                  : slot.available
                    ? "border-border hover:border-foreground/40"
                    : "border-border opacity-35"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-foreground">{slot.label}</span>
                {slot.popular && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">Popular</span>}
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock size={10} /> {slot.time}
              </span>
              <div className="mt-1.5">
                {slot.available ? (
                  <span className="font-semibold text-sm text-gradient-warm">₹{slot.price.toLocaleString()}</span>
                ) : (
                  <span className="text-xs text-destructive font-medium">Booked</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Guest selector */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Guests</h3>
            <p className="text-sm text-muted-foreground">Max {property.capacity} people</p>
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
              onClick={() => setGuests(Math.min(property.capacity, guests + 1))}
              disabled={guests >= property.capacity}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                guests >= property.capacity ? "border-border text-border" : "border-muted-foreground text-foreground"
              }`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="border-b border-border my-5" />

        {/* House Rules */}
        <h3 className="text-lg font-semibold text-foreground mb-3">📋 House Rules</h3>
        <div className="space-y-2 mb-5">
          {property.rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-foreground">
              <span className="text-lg">{rule.icon}</span>
              <span>{rule.text}</span>
            </div>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Reviews */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Star size={18} className="fill-primary text-primary" /> {property.rating} · {property.reviewCount} reviews
          </h3>
        </div>
        <div className="space-y-4 mb-4">
          {displayedReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{review.avatar}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={10} className="fill-primary text-primary" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
            </motion.div>
          ))}
        </div>
        {property.reviews.length > 2 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="text-foreground underline underline-offset-2 text-sm font-semibold mb-6 flex items-center gap-1"
          >
            {showAllReviews ? "Show fewer reviews" : `Show all ${property.reviews.length} reviews`}
          </button>
        )}

        <div className="border-b border-border my-5" />

        {/* Location */}
        <h3 className="text-lg font-semibold text-foreground mb-2">📍 Location</h3>
        <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
        <div className="glass rounded-2xl p-4 mb-6">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="font-semibold">How to get there:</span> {property.entryInstructions}
          </p>
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
              <span className="font-semibold text-gradient-warm text-lg">₹{selectedSlotData.price.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm"> / {selectedSlotData.label.toLowerCase()}</span>
              <p className="text-xs text-muted-foreground">{guests} guests</p>
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
