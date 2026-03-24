import { motion, AnimatePresence, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { useAppConfig } from "@/hooks/use-app-config";
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
  Wind, Tag, Check, BedDouble, Layers
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useSlotAvailability } from "@/hooks/use-slot-availability";
import { shareProperty } from "@/lib/share";
import { useToast } from "@/hooks/use-toast";
import { hapticMedium, hapticSuccess } from "@/lib/haptics";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import type { Property } from "@/data/properties";
import { addons } from "@/data/properties";
import { usePropertiesData } from "@/contexts/PropertiesContext";
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
  stay: { label: "STAY", emoji: "🏡", bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  experience: { label: "EXPERIENCE", emoji: "🎉", bg: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  service: { label: "SERVICE", emoji: "🛎️", bg: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  curation: { label: "CURATION", emoji: "✨", bg: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20" },
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

function RelatedPropertyRow({ relatedProperty, added, onToggle, onViewDetails }: { 
  relatedProperty: Property; 
  added: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cheapestSlot = relatedProperty.slots.filter(s => s.available).sort((a, b) => a.price - b.price)[0];

  return (
    <div className={`rounded-xl overflow-hidden transition-all border ${added ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-foreground/[0.02]"}`}>
      {/* Main row — tap to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
      >
        <div className="relative shrink-0">
          <img
            src={relatedProperty.images[0]}
            alt={relatedProperty.name}
            className="w-12 h-12 rounded-xl object-cover"
            loading="lazy"
          />
          {added && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
            >
              <Check size={10} className="text-primary-foreground" />
            </motion.div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{relatedProperty.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{relatedProperty.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!added ? (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="text-[10px] font-bold text-primary border border-primary/30 bg-primary/10 px-3 py-1.5 rounded-full"
            >
              + ₹{cheapestSlot?.price.toLocaleString() || relatedProperty.basePrice.toLocaleString()}
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="text-[10px] font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              <Check size={10} /> Added
            </button>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Expanded — compact info panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1.5 border-t border-border/30 space-y-2">
              {relatedProperty.highlights.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {relatedProperty.highlights.slice(0, 4).map((h, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-foreground/[0.05] text-foreground/60">
                      {h}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star size={9} className="fill-primary text-primary" />
                  <span className="font-medium text-foreground">{relatedProperty.rating}</span>
                  ({relatedProperty.reviewCount})
                </span>
                <span>•</span>
                <span>{relatedProperty.slotsLeft} slots left</span>
                <span>•</span>
                <span>Up to {relatedProperty.capacity} ppl</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                className="text-[10px] text-primary font-medium flex items-center gap-1"
              >
                View full details →
              </button>
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
  onBook: (property: Property, slotId: string, guests: number, date: Date, extras?: Property[], roomsCount?: number, extraMattresses?: number) => void;
  onPropertyTap?: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function PropertyDetail({ property, onBack, onBook, onPropertyTap, isWishlisted = false, onToggleWishlist }: PropertyDetailProps) {
  const { properties: allProperties } = usePropertiesData();
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [expanded, setExpanded] = useState(false);
  const [enhanceOpen, setEnhanceOpen] = useState(false);
  const [addedExtraIds, setAddedExtraIds] = useState<Set<string>>(new Set());
  const [roomsCount, setRoomsCount] = useState(1);
  const [extraMattressCount, setExtraMattressCount] = useState(0);

  const appConfig = useAppConfig();
  const ROOM_CAPACITY = appConfig.room_capacity;
  const EXTRA_MATTRESS_PRICE = appConfig.extra_mattress_price;
  const isStayProp = property.primaryCategory === "stay";

  const roomInfo = useMemo(() => {
    if (!isStayProp) return null;
    const totalRooms = Math.max(1, Math.floor((property.capacity || 6) / ROOM_CAPACITY));
    const maxGuestsForRooms = roomsCount * ROOM_CAPACITY + extraMattressCount;
    return {
      totalRooms,
      maxGuestsForRooms,
      maxMattresses: roomsCount, // max 1 per room
      isOverCapacity: roomsCount > totalRooms,
    };
  }, [isStayProp, roomsCount, extraMattressCount, property.capacity]);

  // Smart recommendations
  const smartTip = useMemo(() => {
    if (!isStayProp || !roomInfo) return null;
    const maxGuests = roomsCount * ROOM_CAPACITY + extraMattressCount;
    if (guests > maxGuests) {
      const neededRooms = Math.ceil(guests / ROOM_CAPACITY);
      const neededWithMattress = Math.ceil(guests / (ROOM_CAPACITY + 1));
      if (neededWithMattress <= roomInfo.totalRooms && extraMattressCount < neededWithMattress) {
        return { type: "mattress" as const, message: `Add ${neededWithMattress - extraMattressCount} mattress to fit ${guests} guests`, action: () => { setExtraMattressCount(neededWithMattress); } };
      }
      if (neededRooms <= roomInfo.totalRooms) {
        return { type: "room" as const, message: `Upgrade to ${neededRooms} rooms for ${guests} guests`, action: () => { setRoomsCount(neededRooms); setExtraMattressCount(0); } };
      }
      return { type: "over" as const, message: `Max capacity: ${roomInfo.totalRooms * (ROOM_CAPACITY + 1)} guests with mattresses` };
    }
    if (guests === maxGuests && extraMattressCount === 0 && roomsCount < roomInfo.totalRooms) {
      return null; // perfect fit
    }
    return null;
  }, [isStayProp, guests, roomsCount, extraMattressCount, roomInfo]);

  const toggleExtra = useCallback((id: string) => {
    setAddedExtraIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const addedExtras = allProperties.filter(p => addedExtraIds.has(p.id));
  const liked = isWishlisted;
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

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const selectedDate = dateRange?.from || null;
  const nightCount = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const isStay = property.primaryCategory === "stay";

  // Wire DB slot availability when date is selected
  const dateStr = selectedDate ? selectedDate.toISOString().split("T")[0] : undefined;
  const { slots: dbSlots, getSlotAvailability: getDbSlotAvail } = useSlotAvailability(
    property.id,
    dateStr
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-30 bg-mesh overflow-y-auto pb-28 md:pb-8"
    >
      {/* Hero — Mobile Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden md:hidden">
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
          <motion.button onClick={onBack} className="w-9 h-9 rounded-full glass flex items-center justify-center" whileTap={{ scale: 0.85 }}>
            <ArrowLeft size={18} className="text-foreground" />
          </motion.button>
          <div className="flex gap-2">
            <motion.button className="w-9 h-9 rounded-full glass flex items-center justify-center" whileTap={{ scale: 0.85 }} onClick={async () => { await shareProperty(property); }}>
              <Share2 size={16} className="text-foreground" />
            </motion.button>
            <motion.button onClick={() => { hapticMedium(); onToggleWishlist?.(property.id); }} className="w-9 h-9 rounded-full glass flex items-center justify-center" whileTap={{ scale: 1.2 }}>
              <Heart size={16} className={`transition-colors duration-200 ${liked ? "fill-primary text-primary" : "text-foreground"}`} />
            </motion.button>
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <motion.button key={i} onClick={() => { setImgIndex(i); setImgLoaded(false); }} className="rounded-full" animate={{ width: i === imgIndex ? 18 : 6, height: 6, backgroundColor: i === imgIndex ? "hsl(0 0% 96%)" : "hsla(0 0% 96% / 0.5)" }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
          ))}
        </div>
        {property.tags.length > 0 && (
          <div className="absolute bottom-10 left-4 flex gap-2">
            {property.tags.map((tag) => (
              <span key={tag} className="text-[11px] font-semibold glass px-3 py-1.5 rounded-full text-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Hero — Desktop Bento Grid */}
      <div className="hidden md:block md:pt-20 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex-1 truncate">{property.name}</h1>
          <div className="flex gap-2">
            <button onClick={async () => { await shareProperty(property); }} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <Share2 size={16} className="text-foreground" />
            </button>
            <button onClick={() => { hapticMedium(); onToggleWishlist?.(property.id); }} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">
              <Heart size={16} className={`transition-colors duration-200 ${liked ? "fill-primary text-primary" : "text-foreground"}`} />
            </button>
          </div>
        </div>
        <div className="relative grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden max-h-[480px] lg:max-h-[540px] 2xl:max-h-[600px]">
          <div className="col-span-2 row-span-2 relative group cursor-pointer" onClick={() => setImgIndex(0)}>
            <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300" />
          </div>
          {property.images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative group cursor-pointer" onClick={() => setImgIndex(i + 1)}>
              <img src={img} alt={`${property.name} ${i + 2}`} className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300" loading="lazy" />
            </div>
          ))}
          <button className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-background transition-colors z-10">
            Show all {property.images.length} photos
          </button>
        </div>
        {property.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {property.tags.map((tag) => (
              <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary text-foreground border border-border">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Content — two-column on desktop */}
      <div className="md:flex md:gap-8 md:px-8 lg:px-16 xl:px-24 2xl:px-32 md:mt-8">
      <div className="px-5 pt-5 md:px-0 md:pt-0 md:flex-1 md:min-w-0">
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
               <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
               <Tag size={10} /> {property.discountLabel}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-semibold text-foreground md:hidden">{property.name}</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
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
        <p className="text-[15px] text-foreground leading-relaxed md:text-base lg:text-lg">
          <span className="md:hidden">{expanded ? property.fullDescription : property.fullDescription.slice(0, 150) + "..."}</span>
          <span className="hidden md:inline">{property.fullDescription}</span>
        </p>
        <button onClick={() => setExpanded(!expanded)} className="text-foreground underline underline-offset-2 text-sm font-semibold mt-2 flex items-center gap-1 md:hidden">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

        {/* Date picker — Calendar with range support for stays */}
        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <CalendarIcon size={18} className="text-primary" /> {isStay ? "Select dates" : "Select a date"}
          <span className="text-[10px] font-medium text-destructive ml-1">*required</span>
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3">
          {isStay ? "Tap check-in then check-out date" : "Tap a date to continue"}
        </p>

        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all",
              dateRange?.from ? "border-primary/40 bg-primary/[0.04]" : "border-border hover:border-foreground/30"
            )}>
              <CalendarIcon size={18} className="text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1">
                {dateRange?.from ? (
                  dateRange.to && isStay ? (
                    <>
                      {format(dateRange.from, "d MMM")} → {format(dateRange.to, "d MMM")}
                      <span className="text-xs text-muted-foreground ml-2">({nightCount} night{nightCount !== 1 ? "s" : ""})</span>
                    </>
                  ) : (
                    format(dateRange.from, "EEEE, d MMMM yyyy")
                  )
                ) : (
                  <span className="text-muted-foreground">{isStay ? "Check-in → Check-out" : "Pick a date"}</span>
                )}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {isStay ? (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(val) => setDateRange(val)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                numberOfMonths={1}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            ) : (
              <Calendar
                mode="single"
                selected={dateRange?.from}
                onSelect={(val) => setDateRange(val ? { from: val, to: val } : undefined)}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                numberOfMonths={1}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            )}
          </PopoverContent>
        </Popover>

        {!selectedDate && (
          <p className="text-[11px] text-destructive/80 mt-2 flex items-center gap-1">
            <CalendarIcon size={11} /> Please select {isStay ? "dates" : "a date"} to continue
          </p>
        )}

        {isStay && nightCount > 0 && selectedSlotData && (
          <div className="mt-2 px-3 py-2 rounded-xl bg-primary/[0.06] border border-primary/20">
            <p className="text-[11px] text-foreground">
              <span className="font-semibold">{nightCount} night{nightCount !== 1 ? "s" : ""}</span>
              <span className="text-muted-foreground"> × ₹{selectedSlotData?.price.toLocaleString()} = </span>
              <span className="font-bold text-primary">₹{(selectedSlotData.price * nightCount).toLocaleString()}</span>
            </p>
          </div>
        )}

        <div className="border-b border-border my-5" />

        {/* Time slots */}
        {(() => {
          // For multi-day stays, only show Full Day slot
          const isMultiDay = isStay && nightCount > 1;
          const filteredSlots = isMultiDay
            ? property.slots.filter(s => s.label === "Full Day")
            : property.slots;

          return (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-1">Choose your slot</h3>
              {isMultiDay && (
                <p className="text-[11px] text-muted-foreground mb-3">
                  Multi-day stays are full-day bookings only
                </p>
              )}
              {!isMultiDay && <div className="mb-3" />}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredSlots.map((slot) => {
                  const tagConfig: Record<string, { label: string; color: string; bg: string }> = {
                    almost_full: { label: "Almost Full", color: "text-red-700 dark:text-red-400", bg: "bg-red-500/15" },
                    best_price: { label: "Best Price", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/15" },
                    trending: { label: "Trending", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-500/15" },
                    last_slot: { label: "Last Slot!", color: "text-red-700 dark:text-red-400", bg: "bg-red-500/15" },
                    couple_pick: { label: "Couple Pick", color: "text-pink-700 dark:text-pink-400", bg: "bg-pink-500/15" },
                    work_best: { label: "Work Best", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/15" },
                  };
                  const slotTag = slot.tag ? tagConfig[slot.tag] : null;

                  return (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && setSelectedSlot(slot.id)}
                      disabled={!slot.available}
                      className={`p-3.5 rounded-xl text-left border transition-all relative overflow-hidden ${
                        selectedSlot === slot.id
                          ? "border-primary bg-primary/[0.08] shadow-sm glow-sm"
                          : slot.available
                            ? "border-border hover:border-foreground/40"
                            : "border-border opacity-35"
                      }`}
                    >
                      {/* Smart tag */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{slot.label}</span>
                        {slot.popular && !slot.tag && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">Popular</span>}
                        {slotTag && (
                          <span className={`text-[8px] ${slotTag.bg} ${slotTag.color} px-1.5 py-0.5 rounded font-bold`}>
                            {slotTag.label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {slot.time}
                      </span>
                      {/* Viewers microcopy */}
                      {slot.viewersNow && slot.viewersNow > 0 && (
                        <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium mt-1 animate-pulse">
                          👀 {slot.viewersNow} people viewing
                        </p>
                      )}
                      {/* DB availability overlay */}
                      {(() => {
                        const dbAvail = dbSlots.length > 0
                          ? dbSlots.find(ds => ds.label.toLowerCase() === slot.label.toLowerCase())
                          : null;
                        const avail = dbAvail ? getDbSlotAvail(dbAvail.id) : null;
                        if (avail && avail.remainingCapacity > 0 && avail.remainingCapacity <= 5) {
                          return (
                            <p className="text-[9px] text-destructive font-medium mt-0.5">
                              {avail.remainingCapacity} spot{avail.remainingCapacity !== 1 ? "s" : ""} left
                            </p>
                          );
                        }
                        return null;
                      })()}
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        {slot.available ? (
                          <>
                            <span className="font-semibold text-sm text-gradient-warm">₹{slot.price.toLocaleString()}</span>
                            {slot.originalPrice && (
                              <span className="text-[10px] text-muted-foreground line-through">₹{slot.originalPrice.toLocaleString()}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-destructive font-medium">Booked</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          );
        })()}

        <div className="border-b border-border my-5" />

        {/* ═══════ ROOM & GUEST SELECTOR ═══════ */}
        {isStayProp && roomInfo ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BedDouble size={18} className="text-primary" /> Rooms & Guests
            </h3>
            <p className="text-xs text-muted-foreground -mt-2">{roomInfo.totalRooms} rooms available · {ROOM_CAPACITY} guests per room</p>

            {/* Rooms stepper */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Rooms</p>
                <p className="text-[10px] text-muted-foreground">{ROOM_CAPACITY} guests per room</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { const nr = Math.max(1, roomsCount - 1); setRoomsCount(nr); setExtraMattressCount(Math.min(extraMattressCount, nr)); const maxG = nr * ROOM_CAPACITY + Math.min(extraMattressCount, nr); if (guests > maxG) setGuests(maxG); }}
                  disabled={roomsCount <= 1}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Minus size={14} className="text-foreground" />
                </button>
                <span className="text-lg font-bold text-foreground w-6 text-center">{roomsCount}</span>
                <button
                  onClick={() => { const nr = Math.min(roomInfo.totalRooms, roomsCount + 1); setRoomsCount(nr); }}
                  disabled={roomsCount >= roomInfo.totalRooms}
                  className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Plus size={14} className="text-primary" />
                </button>
              </div>
            </div>

            {/* Extra mattress stepper */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Extra Mattress</p>
                <p className="text-[10px] text-muted-foreground">₹{EXTRA_MATTRESS_PRICE}/night · +1 guest per room</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { const nm = Math.max(0, extraMattressCount - 1); setExtraMattressCount(nm); const maxG = roomsCount * ROOM_CAPACITY + nm; if (guests > maxG) setGuests(maxG); }}
                  disabled={extraMattressCount <= 0}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Minus size={14} className="text-foreground" />
                </button>
                <span className="text-lg font-bold text-foreground w-6 text-center">{extraMattressCount}</span>
                <button
                  onClick={() => setExtraMattressCount(Math.min(roomInfo.maxMattresses, extraMattressCount + 1))}
                  disabled={extraMattressCount >= roomInfo.maxMattresses}
                  className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Plus size={14} className="text-primary" />
                </button>
              </div>
            </div>

            {/* Guest stepper */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Guests</p>
                <p className="text-[10px] text-muted-foreground">
                  Max {roomInfo.maxGuestsForRooms} with current setup
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={guests <= 1}
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Minus size={14} className="text-foreground" />
                </button>
                <span className="text-lg font-bold text-foreground w-6 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(roomInfo.maxGuestsForRooms, guests + 1))}
                  disabled={guests >= roomInfo.maxGuestsForRooms}
                  className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                >
                  <Plus size={14} className="text-primary" />
                </button>
              </div>
            </div>

            {/* Smart recommendation */}
            {smartTip && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
                  smartTip.type === "over" 
                    ? "bg-destructive/10 border border-destructive/20" 
                    : "bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                <span className="text-base">{smartTip.type === "over" ? "⚠️" : "💡"}</span>
                <p className="text-xs text-foreground flex-1">{smartTip.message}</p>
                {"action" in smartTip && smartTip.action && (
                  <button
                    onClick={smartTip.action}
                    className="text-[10px] font-bold text-primary bg-primary/15 px-3 py-1.5 rounded-full shrink-0"
                  >
                    Apply
                  </button>
                )}
              </motion.div>
            )}

            {/* Summary */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
              <BedDouble size={12} className="text-primary" />
              <span>{roomsCount} room{roomsCount > 1 ? "s" : ""}</span>
              <span className="text-border">·</span>
              <Users size={12} />
              <span>{guests} guest{guests > 1 ? "s" : ""}</span>
              {extraMattressCount > 0 && (
                <>
                  <span className="text-border">·</span>
                  <Layers size={12} className="text-amber-700 dark:text-amber-400" />
                  <span className="text-amber-700 dark:text-amber-400 font-medium">{extraMattressCount} mattress (+₹{(extraMattressCount * EXTRA_MATTRESS_PRICE).toLocaleString()})</span>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Non-stay: simple guest selector */
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
        )}

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
                            <RelatedPropertyRow key={exp.id} relatedProperty={exp} added={addedExtraIds.has(exp.id)} onToggle={() => toggleExtra(exp.id)} onViewDetails={() => onPropertyTap?.(exp)} />
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
                            <RelatedPropertyRow key={svc.id} relatedProperty={svc} added={addedExtraIds.has(svc.id)} onToggle={() => toggleExtra(svc.id)} onViewDetails={() => onPropertyTap?.(svc)} />
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
          propertyId={property.id}
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
            <span className="text-foreground font-medium">₹{Math.round(property.basePrice * appConfig.service_fee_percent / 100).toLocaleString()}</span>
          </div>
          {property.primaryCategory !== "service" && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground/80">Cleaning fee</span>
              <span className="text-foreground font-medium">₹{appConfig.cleaning_fee}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="text-foreground font-semibold">Estimated total</span>
            <span className="text-gradient-warm font-bold">
              ₹{(property.basePrice + Math.round(property.basePrice * appConfig.service_fee_percent / 100) + (property.primaryCategory !== "service" ? appConfig.cleaning_fee : 0)).toLocaleString()}
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
              <p className="text-xs text-muted-foreground">Up to {appConfig.free_cancel_hours} hours before check-in</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{appConfig.partial_refund_percent}% refund</p>
              <p className="text-xs text-muted-foreground">{appConfig.partial_refund_hours}-{appConfig.free_cancel_hours} hours before check-in</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-destructive mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">No refund</p>
              <p className="text-xs text-muted-foreground">Less than {appConfig.partial_refund_hours} hours before check-in</p>
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

      {/* Desktop Sticky Booking Sidebar */}
      <div className="hidden md:block md:w-[38%] lg:w-[35%] md:shrink-0">
        <div className="sticky top-24 rounded-2xl border border-border shadow-xl shadow-black/10 p-6 bg-card space-y-5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">₹{selectedSlotData?.price.toLocaleString() || property.basePrice.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/ {selectedSlotData?.label.toLowerCase() || "slot"}</span>
          </div>

          {/* Date picker inline */}
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                dateRange?.from ? "border-primary/40 bg-primary/[0.04]" : "border-border hover:border-foreground/30"
              )}>
                <CalendarIcon size={16} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1">
                  {dateRange?.from ? (
                    dateRange.to && isStay ? (
                      <>{format(dateRange.from, "d MMM")} → {format(dateRange.to, "d MMM")} <span className="text-xs text-muted-foreground">({nightCount}N)</span></>
                    ) : format(dateRange.from, "d MMM yyyy")
                  ) : (
                    <span className="text-muted-foreground">{isStay ? "Check-in → Check-out" : "Pick a date"}</span>
                  )}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {isStay ? (
                <Calendar mode="range" selected={dateRange} onSelect={(val) => setDateRange(val)} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} numberOfMonths={1} initialFocus className={cn("p-3 pointer-events-auto")} />
              ) : (
                <Calendar mode="single" selected={dateRange?.from} onSelect={(val) => setDateRange(val ? { from: val, to: val } : undefined)} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} numberOfMonths={1} initialFocus className={cn("p-3 pointer-events-auto")} />
              )}
            </PopoverContent>
          </Popover>

          {/* Slot selector */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Time Slot</p>
            <div className="grid grid-cols-2 gap-2">
              {property.slots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && setSelectedSlot(slot.id)}
                  disabled={!slot.available}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedSlot === slot.id
                      ? "border-primary bg-primary/[0.08] shadow-sm"
                      : slot.available ? "border-border hover:border-foreground/30" : "border-border opacity-35"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{slot.label}</p>
                  <p className="text-xs text-muted-foreground">{slot.time}</p>
                  <p className="text-sm font-semibold text-foreground mt-1">₹{slot.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Guest stepper */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Guests</p>
              <p className="text-xs text-muted-foreground">Max {property.capacity}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1} className="w-9 h-9 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:bg-secondary transition-colors">
                <Minus size={14} className="text-foreground" />
              </button>
              <span className="text-lg font-bold text-foreground w-6 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(property.capacity, guests + 1))} disabled={guests >= property.capacity} className="w-9 h-9 rounded-full border border-border flex items-center justify-center disabled:opacity-30 hover:bg-secondary transition-colors">
                <Plus size={14} className="text-foreground" />
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            {selectedSlotData && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">₹{selectedSlotData.price.toLocaleString()} × {isStay && nightCount > 0 ? `${nightCount} night${nightCount !== 1 ? "s" : ""}` : "1 slot"}</span>
                  <span className="text-foreground font-medium">₹{(selectedSlotData.price * (isStay && nightCount > 0 ? nightCount : 1)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST 18%</span>
                  <span className="text-foreground font-medium">₹{Math.round(selectedSlotData.price * 0.18).toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-foreground font-bold">Total</span>
                  <span className="text-lg font-bold text-foreground">₹{Math.round(selectedSlotData.price * 1.18 * (isStay && nightCount > 0 ? nightCount : 1)).toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <motion.button
            onClick={() => selectedSlotData && selectedDate && onBook(property, selectedSlot!, guests, selectedDate, addedExtras.length > 0 ? addedExtras : undefined, isStayProp ? roomsCount : undefined, isStayProp ? extraMattressCount : undefined)}
            disabled={!selectedSlotData || !selectedDate}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-radiate-pulse"
            whileTap={{ scale: 0.97 }}
          >
            {selectedSlotData && selectedDate ? `Book Now` : "Select date & slot"}
          </motion.button>
          <p className="text-center text-xs text-muted-foreground">You won't be charged yet</p>
        </div>
      </div>
      </div>

      {/* Sticky bottom — mobile only */}
      <AnimatePresence>
        {selectedSlotData && selectedDate && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 px-5 py-3.5 flex items-center justify-between z-40 backdrop-blur-xl bg-card/90 dark:bg-card/70 md:hidden"
          >
            <div>
              <span className="font-semibold text-gradient-warm text-lg">₹{selectedSlotData.price.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm"> / {selectedSlotData.label.toLowerCase()}</span>
              <p className="text-xs text-muted-foreground">
                {isStayProp && <><BedDouble size={10} className="inline text-primary mr-0.5" />{roomsCount}R · </>}
                {guests} guests · {format(selectedDate, "d MMM")}
                {extraMattressCount > 0 && <span className="text-amber-700 dark:text-amber-400 font-medium"> · +{extraMattressCount}🛏️</span>}
                {addedExtras.length > 0 && <span className="text-primary font-medium"> · +{addedExtras.length} extra{addedExtras.length > 1 ? "s" : ""}</span>}
              </p>
            </div>
            <motion.button
              onClick={() => onBook(property, selectedSlot!, guests, selectedDate, addedExtras.length > 0 ? addedExtras : undefined, isStayProp ? roomsCount : undefined, isStayProp ? extraMattressCount : undefined)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm glow-primary"
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Reserve{addedExtras.length > 0 ? ` (${addedExtras.length + 1})` : ""}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
