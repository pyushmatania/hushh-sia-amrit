import { motion } from "framer-motion";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
import { hapticSelection } from "@/lib/haptics";
import type { Property } from "@/data/properties";

export interface ExperiencePack {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  slot: string;
  price: number;
  originalPrice?: number;
  includes: string[];
  tags: string[];
  mood: ("romantic" | "party" | "chill" | "work")[];
  propertyId: string; // maps to a property for booking
  gradient: string;
  badge?: string;
}

// ─── CURATED EXPERIENCE PACKS ───
export const experiencePacks: ExperiencePack[] = [
  {
    id: "ep-1",
    name: "After Hours Chill",
    tagline: "Bonfire + Maggi + Old music under the stars",
    emoji: "🌙",
    slot: "7 PM – 11 PM",
    price: 999,
    originalPrice: 1499,
    includes: ["Bonfire 🔥", "Maggi station 🍜", "Beer bucket 🍺", "Old Hindi playlist 🎵", "Marshmallows"],
    tags: ["chill", "night", "budget"],
    mood: ["chill"],
    propertyId: "1", // Firefly Villa
    gradient: "from-indigo-600/80 to-slate-900/60",
    badge: "🔥 Popular",
  },
  {
    id: "ep-2",
    name: "Just Us Night",
    tagline: "Candles + Dinner + Music — just you two",
    emoji: "💑",
    slot: "6 PM – 10 PM",
    price: 1499,
    originalPrice: 2499,
    includes: ["Candle setup 🕯️", "3-course dinner 🍽️", "Soft music 🎵", "Rose petals 🌹", "Photo spot 📸"],
    tags: ["romantic", "private", "couple"],
    mood: ["romantic"],
    propertyId: "10", // Anniversary Garden
    gradient: "from-pink-600/80 to-rose-900/60",
    badge: "💕 #1 Pick",
  },
  {
    id: "ep-3",
    name: "Party Scene Pack",
    tagline: "Speaker + Lights + Snacks + Drinks — go wild",
    emoji: "🎉",
    slot: "7 PM – 12 AM",
    price: 1999,
    originalPrice: 3499,
    includes: ["JBL speakers 🔊", "Party lights 💡", "Snack platter 🍕", "Drink station 🍹", "Fog machine 💨"],
    tags: ["party", "group", "trending"],
    mood: ["party"],
    propertyId: "9", // Birthday Hall
    gradient: "from-amber-500/80 to-orange-800/60",
    badge: "🎉 Trending",
  },
  {
    id: "ep-4",
    name: "BBQ Bonfire Night",
    tagline: "BBQ + Fire + Drinks + Stargazing",
    emoji: "🔥",
    slot: "6 PM – 10 PM",
    price: 1499,
    originalPrice: 2299,
    includes: ["BBQ platter 🍗", "Bonfire 🔥", "Drinks 🍺", "Stargazing 🌌", "S'mores kit"],
    tags: ["evening", "chill", "foodie"],
    mood: ["chill", "party"],
    propertyId: "1", // Firefly Villa
    gradient: "from-red-600/80 to-orange-900/60",
  },
  {
    id: "ep-5",
    name: "Movie Night",
    tagline: "Projector + Popcorn + Blankets + Drinks",
    emoji: "🎬",
    slot: "8 PM – 11 PM",
    price: 999,
    originalPrice: 1699,
    includes: ["25ft screen 🎬", "Popcorn 🍿", "Bean bags 🛋️", "Drinks 🍹", "Blankets"],
    tags: ["entertainment", "chill"],
    mood: ["chill"],
    propertyId: "19", // Movie Amphitheater
    gradient: "from-violet-600/80 to-purple-900/60",
  },
  {
    id: "ep-6",
    name: "Game Night",
    tagline: "PS5 + Snacks + Competition mode ON",
    emoji: "🎮",
    slot: "7 PM – 11 PM",
    price: 799,
    originalPrice: 1299,
    includes: ["PS5 console 🎮", "Board games 🎲", "Pizza 🍕", "Drinks 🥤", "Score board"],
    tags: ["fun", "gaming", "budget"],
    mood: ["party", "chill"],
    propertyId: "7", // Karaoke Cube
    gradient: "from-green-600/80 to-emerald-900/60",
  },
  {
    id: "ep-7",
    name: "Work Escape",
    tagline: "WiFi + Coffee + Quiet space — focus mode",
    emoji: "💻",
    slot: "10 AM – 4 PM",
    price: 299,
    originalPrice: 599,
    includes: ["High-speed WiFi ⚡", "Unlimited coffee ☕", "Quiet workspace 🔇", "Snacks 🍪", "Power backup"],
    tags: ["work", "daytime", "budget"],
    mood: ["work"],
    propertyId: "21", // Work Pod
    gradient: "from-cyan-600/80 to-teal-900/60",
    badge: "💸 Best Value",
  },
  {
    id: "ep-8",
    name: "Team Work Day",
    tagline: "Meeting setup + Snacks + Team space",
    emoji: "👥",
    slot: "11 AM – 5 PM",
    price: 499,
    originalPrice: 899,
    includes: ["Seating for 8 💺", "Whiteboard 📋", "Snacks 🍪", "Coffee ☕", "Projector 📽️"],
    tags: ["team", "work", "corporate"],
    mood: ["work"],
    propertyId: "21",
    gradient: "from-blue-600/80 to-indigo-900/60",
  },
];

// ─── TONIGHT AT HUSHH — Quick Discovery Tags ───
export const tonightTags = [
  { id: "tonight", emoji: "🌙", label: "Tonight at Hushh", filter: () => true },
  { id: "just_us", emoji: "💑", label: "Just Us Picks", filter: (p: ExperiencePack) => p.mood.includes("romantic") },
  { id: "party_ready", emoji: "🎉", label: "Party Ready", filter: (p: ExperiencePack) => p.mood.includes("party") },
  { id: "work_escape", emoji: "💻", label: "Work Escape", filter: (p: ExperiencePack) => p.mood.includes("work") },
  { id: "under_999", emoji: "💸", label: "Under ₹999", filter: (p: ExperiencePack) => p.price <= 999 },
];

interface CuratedPackCardProps {
  pack: ExperiencePack;
  index: number;
  onTap: (pack: ExperiencePack) => void;
}

export default function CuratedPackCard({ pack, index, onTap }: CuratedPackCardProps) {
  const savings = pack.originalPrice ? pack.originalPrice - pack.price : 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => { hapticSelection(); onTap(pack); }}
      className="shrink-0 w-[280px] rounded-[22px] overflow-hidden text-left relative"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--foreground) / 0.08)",
        boxShadow: "0 8px 32px -8px rgba(0,0,0,0.4)",
      }}
    >
      {/* Gradient header */}
      <div className={`relative h-[120px] bg-gradient-to-br ${pack.gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-20" style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />

        {/* Badge */}
        {pack.badge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-white">{pack.badge}</span>
          </div>
        )}

        {/* Savings badge */}
        {savings > 0 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-white">Save ₹{savings}</span>
          </div>
        )}

        <div className="relative z-10 text-center">
          <span className="text-5xl block mb-1">{pack.emoji}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground leading-tight">{pack.name}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{pack.tagline}</p>
          </div>
          <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
        </div>

        {/* Slot */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <Clock size={11} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">{pack.slot}</span>
        </div>

        {/* Includes preview */}
        <div className="flex flex-wrap gap-1 mt-2">
          {pack.includes.slice(0, 3).map((item, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-foreground/5 text-muted-foreground">
              {item}
            </span>
          ))}
          {pack.includes.length > 3 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
              +{pack.includes.length - 3} more
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-foreground">₹{pack.price}</span>
            {pack.originalPrice && (
              <span className="text-[11px] text-muted-foreground line-through">₹{pack.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
            Book now <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
