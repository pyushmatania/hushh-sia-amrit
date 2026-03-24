/**
 * MobileDiscoverySection — A mixed-card discovery block for mobile only.
 * Contains: 5 vertical video-style cards (swipeable), 1 Cinematic game card,
 * 1 Polaroid tape card, 1 Stacked boarding pass (3 items).
 */
import { useIsMobile } from "@/hooks/use-mobile";
import type { Property } from "@/data/properties";
import PropertyCardCinematic from "./PropertyCardCinematic";
import PropertyCardPolaroid from "./PropertyCardPolaroid";
import PropertyCardStack from "./PropertyCardStack";
import { Star, ArrowRight, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface MobileDiscoverySectionProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
  sectionTitle: string;
  sectionEmoji: string;
  /** offset into properties array to pick different items per section */
  offset?: number;
}

/* ─── Vertical Video-style Card ─── */
function VerticalVideoCard({ property, onTap, index }: { property: Property; onTap: (p: Property) => void; index: number }) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => onTap(property)}
      className="shrink-0 w-[160px] cursor-pointer active:scale-[0.95] transition-transform select-none"
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          height: 240,
          border: "1px solid hsl(var(--border) / 0.2)",
          boxShadow: "0 6px 24px hsl(var(--foreground) / 0.08)",
        }}
      >
        <img
          src={property.images[0]}
          alt={property.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        {/* Top badge */}
        {property.slotsLeft > 0 && property.slotsLeft <= 3 && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: "hsl(0 80% 50% / 0.85)" }}>
            <Flame size={8} className="text-white" />
            <span className="text-[7px] font-bold text-white">{property.slotsLeft} LEFT</span>
          </div>
        )}
        {/* Time badge */}
        <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: "hsl(var(--foreground) / 0.3)", backdropFilter: "blur(6px)" }}>
          <Clock size={7} className="text-white/80" />
          <span className="text-[7px] text-white/80">{property.slots[0]?.label || "Day"}</span>
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <h4 className="text-[12px] font-bold text-white leading-tight line-clamp-2">{property.name}</h4>
          <div className="flex items-center gap-1 mt-1">
            <Star size={8} className="fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-bold text-white">{property.rating}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[13px] font-bold text-white">₹{cheapest.toLocaleString()}<span className="text-[8px] text-white/40">+</span></span>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.8)" }}>
              <ArrowRight size={9} className="text-primary-foreground" />
            </div>
          </div>
        </div>
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(280 80% 60%), transparent)" }} />
      </div>
    </motion.div>
  );
}

export default function MobileDiscoverySection({
  properties,
  onPropertyTap,
  wishlist = [],
  onToggleWishlist,
  sectionTitle,
  sectionEmoji,
  offset = 0,
}: MobileDiscoverySectionProps) {
  const isMobile = useIsMobile();
  if (!isMobile || properties.length < 5) return null;

  // Pick items from different offsets to avoid repetition
  const safeIdx = (i: number) => (offset + i) % properties.length;
  const videoCards = Array.from({ length: 5 }, (_, i) => properties[safeIdx(i)]);
  const gameCardProp = properties[safeIdx(5)];
  const polaroidProp = properties[safeIdx(6)];
  const stackProps = [properties[safeIdx(7)], properties[safeIdx(8)], properties[safeIdx(9)]].filter(Boolean);

  return (
    <div className="mt-6 space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-lg">{sectionEmoji}</span>
        <h2 className="text-base font-bold text-foreground">{sectionTitle}</h2>
      </div>

      {/* 1. Vertical video cards — swipeable row */}
      <div
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {videoCards.map((p, i) => (
          <VerticalVideoCard key={`vc-${p.id}-${i}`} property={p} onTap={onPropertyTap} index={i} />
        ))}
      </div>

      {/* 2. Cinematic Game Card */}
      {gameCardProp && (
        <div className="px-2">
          <PropertyCardCinematic
            property={gameCardProp}
            index={offset}
            onTap={onPropertyTap}
            isWishlisted={wishlist.includes(gameCardProp.id)}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      )}

      {/* 3. Polaroid Tape Card */}
      {polaroidProp && (
        <div className="py-2">
          <PropertyCardPolaroid
            property={polaroidProp}
            index={offset + 1}
            onTap={onPropertyTap}
            isWishlisted={wishlist.includes(polaroidProp.id)}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      )}

      {/* 4. Stacked Boarding Pass (3 items) */}
      {stackProps.length >= 2 && (
        <div className="px-2">
          <PropertyCardStack
            properties={stackProps}
            startIndex={offset + 2}
            onTap={onPropertyTap}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      )}
    </div>
  );
}
