import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import {
  ArrowLeft, Share2, Heart, Star, BadgeCheck, MapPin,
  ChevronDown, ChevronUp, Minus, Plus, Droplets, Flame,
  Music, Car, Beef, Sparkles, Wifi, Trees, Clapperboard,
  Sofa, Headphones, Wine, Users, MessageCircle, Clock,
  ShieldCheck, Tent, Footprints, Palette, Bird, Drum,
  Activity, Trophy, Mic, Rainbow, Popcorn, Volume2,
  Snowflake, Camera, Theater, Waves, ChefHat, Guitar,
  Flower2, Gamepad2, Navigation, Phone, CalendarX2,
  Shield, Zap, Info, Coffee, Utensils, ParkingCircle,
  CalendarIcon
} from "lucide-react";
import { useState, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Property } from "@/data/properties";
import ReviewSection from "@/components/ReviewSection";

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
  onBook: (property: Property, slotId: string, guests: number, date: Date) => void;
}

export default function PropertyDetail({ property, onBack, onBook }: PropertyDetailProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const heroX = useMotionValue(0);
  const heroOpacity = useTransform(heroX, [-120, 0, 120], [0.4, 1, 0.4]);

  const handleHeroDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      setImgIndex((i) => (i === property.images.length - 1 ? 0 : i + 1));
      setImgLoaded(false);
    } else if (info.offset.x > threshold) {
      setImgIndex((i) => (i === 0 ? property.images.length - 1 : i - 1));
      setImgLoaded(false);
    }
    animate(heroX, 0, { type: "spring", stiffness: 300, damping: 30 });
  }, [property.images.length, heroX]);

  const selectedSlotData = property.slots.find((s) => s.id === selectedSlot);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const displayedReviews = showAllReviews ? property.reviews : property.reviews.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-28"
    >
      {/* Hero */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-secondary animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/50 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>
        )}
        <motion.img
          key={imgIndex}
          src={property.images[imgIndex]}
          alt={property.name}
          className="w-full h-full object-cover touch-pan-y"
          style={{ x: heroX, opacity: heroOpacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleHeroDragEnd}
          onLoad={() => setImgLoaded(true)}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
          <motion.button
            onClick={onBack}
            className="w-9 h-9 rounded-full glass flex items-center justify-center"
            whileTap={{ scale: 0.85 }}
          >
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <div className="flex gap-2">
            <motion.button className="w-9 h-9 rounded-full glass flex items-center justify-center" whileTap={{ scale: 0.85 }}>
              <Share2 size={16} className="text-foreground" />
            </motion.button>
            <motion.button
              onClick={() => setLiked(!liked)}
              className="w-9 h-9 rounded-full glass flex items-center justify-center"
              whileTap={{ scale: 1.2 }}
            >
              <Heart size={16} className={`transition-colors duration-200 ${liked ? "fill-primary text-primary" : "text-foreground"}`} />
            </motion.button>
          </div>
        </div>
        {/* Animated dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setImgIndex(i); setImgLoaded(false); }}
              className="rounded-full"
              animate={{
                width: i === imgIndex ? 18 : 6,
                height: 6,
                backgroundColor: i === imgIndex ? "hsl(0 0% 96%)" : "hsla(0 0% 96% / 0.5)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5 text-left transition-all hover:border-foreground/40">
              <CalendarIcon size={18} className="text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {format(selectedDate, "EEEE, d MMMM yyyy")}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

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

        {/* Location & Map */}
        <h3 className="text-lg font-semibold text-foreground mb-3">📍 Location</h3>
        <p className="text-sm text-muted-foreground mb-3">{property.location}</p>
        
        {/* Embedded Map */}
        <div className="rounded-2xl overflow-hidden border border-border mb-3 aspect-[16/9]">
          <iframe
            title="Property Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(property.location)}&zoom=14`}
          />
        </div>

        <div className="glass rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <Navigation size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">How to get there</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{property.entryInstructions}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 glass rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-foreground"
          >
            <MapPin size={14} className="text-primary" /> Open in Maps
          </a>
          <button className="flex-1 glass rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-foreground">
            <Phone size={14} className="text-primary" /> Call Host
          </button>
        </div>

        <div className="border-b border-border my-5" />

        {/* Nearby Attractions */}
        <h3 className="text-lg font-semibold text-foreground mb-3">🗺️ What's Nearby</h3>
        <div className="space-y-2 mb-5">
          {[
            { icon: <Coffee size={16} />, name: "Cafes & Restaurants", distance: "0.5 km" },
            { icon: <ParkingCircle size={16} />, name: "Public Parking", distance: "0.2 km" },
            { icon: <Utensils size={16} />, name: "Local Street Food", distance: "0.8 km" },
            { icon: <Trees size={16} />, name: "Jagannath Sagar Lake", distance: "1.2 km" },
            { icon: <Camera size={16} />, name: "Koraput Museum", distance: "3.5 km" },
          ].map((place, i) => (
            <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
              <span className="text-primary">{place.icon}</span>
              <span className="text-sm text-foreground flex-1">{place.name}</span>
              <span className="text-xs text-muted-foreground">{place.distance}</span>
            </div>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Pricing Breakdown */}
        <h3 className="text-lg font-semibold text-foreground mb-3">💰 Pricing Details</h3>
        <div className="glass rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/80">Base price (per slot)</span>
            <span className="text-foreground font-medium">₹{property.basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/80">Service fee</span>
            <span className="text-foreground font-medium">₹{Math.round(property.basePrice * 0.1).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/80">Cleaning fee</span>
            <span className="text-foreground font-medium">₹199</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="text-foreground font-semibold">Estimated total</span>
            <span className="text-gradient-warm font-bold">₹{(property.basePrice + Math.round(property.basePrice * 0.1) + 199).toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">* Final price depends on selected slot & guest count</p>
        </div>

        <div className="border-b border-border my-5" />

        {/* Cancellation Policy */}
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <CalendarX2 size={18} className="text-primary" /> Cancellation Policy
        </h3>
        <div className="glass rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Free cancellation</p>
              <p className="text-xs text-muted-foreground">Up to 48 hours before check-in</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">50% refund</p>
              <p className="text-xs text-muted-foreground">24-48 hours before check-in</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">No refund</p>
              <p className="text-xs text-muted-foreground">Less than 24 hours before check-in</p>
            </div>
          </div>
        </div>

        <div className="border-b border-border my-5" />

        {/* Safety & Hygiene */}
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield size={18} className="text-primary" /> Safety & Hygiene
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {[
            { icon: <ShieldCheck size={16} />, text: "Verified property" },
            { icon: <Activity size={16} />, text: "First aid available" },
            { icon: <Zap size={16} />, text: "Fire extinguisher" },
            { icon: <Sparkles size={16} />, text: "Deep cleaned" },
            { icon: <Camera size={16} />, text: "CCTV in common areas" },
            { icon: <Phone size={16} />, text: "24/7 host support" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
              <span className="text-primary shrink-0">{item.icon}</span>
              <span className="text-xs text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        <div className="border-b border-border my-5" />

        {/* Good to Know */}
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Info size={18} className="text-primary" /> Good to Know
        </h3>
        <div className="glass rounded-2xl p-4 mb-8 space-y-3">
          {[
            { q: "Is there parking?", a: "Yes, free parking is available for up to 5 vehicles." },
            { q: "Can I bring my own food?", a: "Outside food is allowed at most venues. Check house rules." },
            { q: "Is the property wheelchair accessible?", a: "Please contact the host for accessibility details." },
            { q: "Are pets allowed?", a: "Varies by property. Check the house rules section above." },
          ].map((faq, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-foreground">{faq.q}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{faq.a}</p>
            </div>
          ))}
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
            <motion.button
              onClick={() => onBook(property, selectedSlot!, guests, selectedDate)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm glow-primary"
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Reserve
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
