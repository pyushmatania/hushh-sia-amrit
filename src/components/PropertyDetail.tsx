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
  CalendarIcon, Monitor, BatteryCharging, VolumeX,
  Armchair, GlassWater, Bell, Truck, Radio, Disc3,
  Wind, Tag
} from "lucide-react";
import { useState, useCallback } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Property } from "@/data/properties";
import { properties as allProperties, addons } from "@/data/properties";
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
  "Outdoor Dining": <Utensils size={22} strokeWidth={1.5} />,
  "Stargazing Deck": <Star size={22} strokeWidth={1.5} />,
  "Garden": <Trees size={22} strokeWidth={1.5} />,
  "Kitchen Access": <ChefHat size={22} strokeWidth={1.5} />,
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
  "Refreshment Counter": <GlassWater size={22} strokeWidth={1.5} />,
  "Karaoke System": <Mic size={22} strokeWidth={1.5} />,
  "Neon Lighting": <Rainbow size={22} strokeWidth={1.5} />,
  "Snack Bar": <Popcorn size={22} strokeWidth={1.5} />,
  "Sound Proofing": <VolumeX size={22} strokeWidth={1.5} />,
  "AC Room": <Snowflake size={22} strokeWidth={1.5} />,
  "Photo Booth": <Camera size={22} strokeWidth={1.5} />,
  "Props & Costumes": <Theater size={22} strokeWidth={1.5} />,
  "Lake View": <Waves size={22} strokeWidth={1.5} />,
  "Canopy Dining": <Tent size={22} strokeWidth={1.5} />,
  "Private Chef": <ChefHat size={22} strokeWidth={1.5} />,
  "Floating Candles": <Flame size={22} strokeWidth={1.5} />,
  "Acoustic Music": <Guitar size={22} strokeWidth={1.5} />,
  "Flower Decor": <Flower2 size={22} strokeWidth={1.5} />,
  // New amenities
  "High-Speed WiFi": <Wifi size={22} strokeWidth={1.5} />,
  "Work Desk": <Monitor size={22} strokeWidth={1.5} />,
  "Coffee Station": <Coffee size={22} strokeWidth={1.5} />,
  "Power Backup": <BatteryCharging size={22} strokeWidth={1.5} />,
  "Quiet Zone": <VolumeX size={22} strokeWidth={1.5} />,
  "Private Balcony": <Trees size={22} strokeWidth={1.5} />,
  "Mini Bar": <Wine size={22} strokeWidth={1.5} />,
  "Room Service": <Bell size={22} strokeWidth={1.5} />,
  "Deck Lounge": <Armchair size={22} strokeWidth={1.5} />,
  "LED Lights": <Sparkles size={22} strokeWidth={1.5} />,
  "Open Lawn": <Trees size={22} strokeWidth={1.5} />,
  "Catering Space": <Utensils size={22} strokeWidth={1.5} />,
  "AC Vehicles": <Car size={22} strokeWidth={1.5} />,
  "Professional Drivers": <Car size={22} strokeWidth={1.5} />,
  "Real-time Tracking": <MapPin size={22} strokeWidth={1.5} />,
  "24/7 Available": <Clock size={22} strokeWidth={1.5} />,
  "Outstation": <Truck size={22} strokeWidth={1.5} />,
  "DJ Console": <Disc3 size={22} strokeWidth={1.5} />,
  "Fog Machine": <Wind size={22} strokeWidth={1.5} />,
  "Mic": <Mic size={22} strokeWidth={1.5} />,
  "Setup & Teardown": <ShieldCheck size={22} strokeWidth={1.5} />,
};

const categoryLabels: Record<string, { label: string; emoji: string; bg: string }> = {
  stay: { label: "STAY", emoji: "🏡", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  experience: { label: "EXPERIENCE", emoji: "🎉", bg: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  service: { label: "SERVICE", emoji: "🛎️", bg: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  curation: { label: "CURATION", emoji: "✨", bg: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
};

function getNearbyPlaces(category: string) {
  if (category === "service") return [
    { icon: <MapPin size={16} />, name: "Service covers all of Jeypore", distance: "City-wide" },
    { icon: <Phone size={16} />, name: "24/7 customer support", distance: "Always" },
    { icon: <Car size={16} />, name: "Pickup from your location", distance: "On demand" },
  ];
  if (category === "experience") return [
    { icon: <Coffee size={16} />, name: "Cafes & Restaurants", distance: "0.5 km" },
    { icon: <Car size={16} />, name: "Parking Available", distance: "On-site" },
    { icon: <Trees size={16} />, name: "Jagannath Sagar Lake", distance: "1.2 km" },
    { icon: <Camera size={16} />, name: "Photo-worthy spots", distance: "Nearby" },
  ];
  return [
    { icon: <Coffee size={16} />, name: "Cafes & Restaurants", distance: "0.5 km" },
    { icon: <ParkingCircle size={16} />, name: "Public Parking", distance: "0.2 km" },
    { icon: <Utensils size={16} />, name: "Local Street Food", distance: "0.8 km" },
    { icon: <Trees size={16} />, name: "Jagannath Sagar Lake", distance: "1.2 km" },
    { icon: <Camera size={16} />, name: "Koraput Museum", distance: "3.5 km" },
  ];
}

function getFaqs(category: string) {
  if (category === "service") return [
    { q: "How do I book this service?", a: "Select a slot and the service team will arrive at your venue." },
    { q: "Can I cancel or reschedule?", a: "Free cancellation up to 24 hours before. Reschedule anytime." },
    { q: "Do you serve outside Jeypore?", a: "Yes, we cover Koraput district. Extra charges may apply." },
    { q: "Is setup included?", a: "Yes, full setup and teardown is included in the price." },
  ];
  if (category === "experience") return [
    { q: "Do I need to bring anything?", a: "Check the house rules above. Most things are provided." },
    { q: "Is this suitable for kids?", a: "Varies by experience. Check capacity and rules section." },
    { q: "Can I customize the experience?", a: "Yes! Contact the host via chat for custom requests." },
    { q: "What if it rains?", a: "Indoor backup available for most experiences, or free reschedule." },
  ];
  return [
    { q: "Is there parking?", a: "Yes, free parking is available for up to 5 vehicles." },
    { q: "Can I bring my own food?", a: "Outside food is allowed at most venues. Check house rules." },
    { q: "Is the property wheelchair accessible?", a: "Please contact the host for accessibility details." },
    { q: "Are pets allowed?", a: "Varies by property. Check the house rules section above." },
  ];
}

function getSafetyItems(category: string) {
  if (category === "service") return [
    { icon: <ShieldCheck size={16} />, text: "Verified professionals" },
    { icon: <Phone size={16} />, text: "24/7 support line" },
    { icon: <Shield size={16} />, text: "Insured equipment" },
    { icon: <Activity size={16} />, text: "Background-checked staff" },
  ];
  return [
    { icon: <ShieldCheck size={16} />, text: "Verified property" },
    { icon: <Activity size={16} />, text: "First aid available" },
    { icon: <Zap size={16} />, text: "Fire extinguisher" },
    { icon: <Sparkles size={16} />, text: "Deep cleaned" },
    { icon: <Camera size={16} />, text: "CCTV in common areas" },
    { icon: <Phone size={16} />, text: "24/7 host support" },
  ];
}

// ═══════ Add-on UI helpers ═══════

function AddonChip({ addon }: { addon: import("@/data/properties").Addon }) {
  const [added, setAdded] = useState(false);
  return (
    <button
      onClick={() => setAdded(!added)}
      className={`shrink-0 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-left transition-all border ${
        added
          ? "border-primary bg-primary/[0.08] shadow-sm"
          : "border-border hover:border-foreground/30"
      }`}
      style={{ minWidth: "150px" }}
    >
      <span className="text-lg">{addon.categoryEmoji}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{addon.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{addon.description}</p>
        <p className="text-[11px] font-bold text-primary mt-0.5">
          {addon.price === 0 ? "Free" : `₹${addon.price}`}{addon.perPerson ? "/person" : ""}
        </p>
      </div>
      {added && <span className="text-primary text-xs font-bold ml-auto shrink-0">✓</span>}
    </button>
  );
}

function RelatedPropertyRow({ relatedProperty, onTap }: { relatedProperty: Property; onTap: (p: Property) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cheapestSlot = relatedProperty.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];

  return (
    <div className="glass rounded-xl overflow-hidden transition-all">
      {/* Main row — tap to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <img
          src={relatedProperty.images[0]}
          alt={relatedProperty.name}
          className="w-14 h-14 rounded-lg object-cover shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{relatedProperty.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{relatedProperty.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-gradient-warm">₹{relatedProperty.basePrice.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">onwards</p>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-border/50">
              {/* Image strip */}
              <div className="flex gap-1.5 mb-2.5 overflow-x-auto hide-scrollbar">
                {relatedProperty.images.slice(0, 4).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-16 h-12 rounded-lg object-cover shrink-0"
                    loading="lazy"
                  />
                ))}
              </div>

              {/* Quick info */}
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
                {relatedProperty.fullDescription?.slice(0, 120) || relatedProperty.description}...
              </p>

              {/* Highlights */}
              {relatedProperty.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {relatedProperty.highlights.slice(0, 3).map((h, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-foreground/[0.05] text-foreground/70 border border-foreground/[0.08]">
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating + slots */}
              <div className="flex items-center gap-3 mb-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star size={10} className="fill-primary text-primary" />
                  <span className="font-medium text-foreground">{relatedProperty.rating}</span>
                  ({relatedProperty.reviewCount})
                </span>
                <span>{relatedProperty.slotsLeft} slots left</span>
                <span>Up to {relatedProperty.capacity} guests</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTap(relatedProperty);
                  }}
                  className="flex-1 text-[11px] font-medium text-foreground/80 py-2 rounded-lg border border-border text-center"
                >
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTap(relatedProperty);
                  }}
                  className="flex-1 text-[11px] font-semibold text-primary-foreground py-2 rounded-lg bg-primary text-center"
                >
                  Add · ₹{cheapestSlot?.price.toLocaleString() || relatedProperty.basePrice.toLocaleString()}+
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onBook: (property: Property, slotId: string, guests: number, date: Date) => void;
  onPropertyTap?: (property: Property) => void;
}

export default function PropertyDetail({ property, onBack, onBook, onPropertyTap }: PropertyDetailProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [expanded, setExpanded] = useState(false);
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const [liked, setLiked] = useState(false);
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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate next 14 days for the date row
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

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
        {/* Category badge + discount label */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {categoryLabels[property.primaryCategory] && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${categoryLabels[property.primaryCategory].bg}`}>
              {categoryLabels[property.primaryCategory].emoji} {categoryLabels[property.primaryCategory].label}
            </span>
          )}
          {property.propertyType && (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-foreground/5 text-muted-foreground border border-foreground/10">
              {property.propertyType}
            </span>
          )}
          {property.discountLabel && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Tag size={10} /> {property.discountLabel}
            </span>
          )}
        </div>

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
            <span>Verified {property.primaryCategory === "service" ? "service" : "property"}</span>
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

        {/* Date picker — horizontal scrollable row */}
        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary" /> Select a date
          <span className="text-[10px] font-medium text-destructive ml-1">*required</span>
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3">Swipe to see more dates</p>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-5 px-5">
          {dateOptions.map((d, i) => {
            const isSelected = selectedDate && d.getTime() === selectedDate.getTime();
            const isToday = i === 0;
            const dayName = format(d, "EEE");
            const dayNum = format(d, "d");
            const monthName = format(d, "MMM");

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`shrink-0 flex flex-col items-center w-[56px] py-2.5 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/15 shadow-[0_0_16px_-4px_hsl(var(--primary)/0.3)]"
                    : "border-border hover:border-foreground/20"
                }`}
              >
                <span className={`text-[10px] font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                  {isToday ? "Today" : dayName}
                </span>
                <span className={`text-lg font-bold mt-0.5 ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {dayNum}
                </span>
                <span className={`text-[9px] ${isSelected ? "text-primary/70" : "text-muted-foreground"}`}>
                  {monthName}
                </span>
              </button>
            );
          })}
        </div>

        {!selectedDate && (
          <p className="text-[11px] text-destructive/80 mt-2 flex items-center gap-1">
            <CalendarIcon size={11} /> Please select a date to continue
          </p>
        )}

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

        {/* ═══════ ADD-ON EXPERIENCES & SERVICES (Collapsible) ═══════ */}
        {property.primaryCategory === "stay" && (
          <>
            <button
              onClick={() => setEnhanceOpen(!enhanceOpen)}
              className="w-full flex items-center justify-between py-3 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-foreground">Enhance Your Stay</h3>
                  <p className="text-[11px] text-muted-foreground">Add experiences, food & services</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">
                  {allProperties.filter(p => p.primaryCategory === "experience").length + allProperties.filter(p => p.primaryCategory === "service").length}+ options
                </span>
                <motion.div animate={{ rotate: enhanceOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={18} className="text-muted-foreground" />
                </motion.div>
              </div>
            </button>

            <AnimatePresence>
              {enhanceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  {/* Related experiences */}
                  {(() => {
                    const relatedExperiences = allProperties.filter(
                      p => p.id !== property.id && p.primaryCategory === "experience"
                    ).slice(0, 4);
                    if (relatedExperiences.length === 0) return null;
                    return (
                      <div className="mb-4 mt-2">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                          🎉 Available Experiences
                        </h4>
                        <div className="space-y-2">
                          {relatedExperiences.map((exp) => (
                            <RelatedPropertyRow key={exp.id} relatedProperty={exp} onTap={onPropertyTap || (() => {})} />
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Related services */}
                  {(() => {
                    const relatedServices = allProperties.filter(
                      p => p.id !== property.id && p.primaryCategory === "service"
                    ).slice(0, 4);
                    if (relatedServices.length === 0) return null;
                    return (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                          🛎️ Add Services
                        </h4>
                        <div className="space-y-2">
                          {relatedServices.map((svc) => (
                            <RelatedPropertyRow key={svc.id} relatedProperty={svc} onTap={onPropertyTap || (() => {})} />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-b border-border my-5" />
          </>
        )}

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
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star size={18} className="fill-primary text-primary" /> Reviews
        </h3>
        <ReviewSection
          reviews={property.reviews}
          rating={property.rating}
          reviewCount={property.reviewCount}
        />

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
        <h3 className="text-lg font-semibold text-foreground mb-3">
          {property.primaryCategory === "service" ? "📍 Service Area" : "🗺️ What's Nearby"}
        </h3>
        <div className="space-y-2 mb-5">
          {getNearbyPlaces(property.primaryCategory).map((place, i) => (
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
            <span className="text-foreground/80">Base price {property.primaryCategory === "service" ? "(per booking)" : "(per slot)"}</span>
            <span className="text-foreground font-medium">₹{property.basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground/80">{property.primaryCategory === "service" ? "Platform fee" : "Service fee"}</span>
            <span className="text-foreground font-medium">₹{Math.round(property.basePrice * 0.1).toLocaleString()}</span>
          </div>
          {property.primaryCategory !== "service" && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground/80">Cleaning fee</span>
              <span className="text-foreground font-medium">₹199</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="text-foreground font-semibold">Estimated total</span>
            <span className="text-gradient-warm font-bold">
              ₹{(property.basePrice + Math.round(property.basePrice * 0.1) + (property.primaryCategory !== "service" ? 199 : 0)).toLocaleString()}
            </span>
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
          <Shield size={18} className="text-primary" /> {property.primaryCategory === "service" ? "Trust & Safety" : "Safety & Hygiene"}
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {getSafetyItems(property.primaryCategory).map((item, i) => (
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
          {getFaqs(property.primaryCategory).map((faq, i) => (
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
