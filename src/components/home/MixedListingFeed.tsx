import { useMemo, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Sparkles, TrendingUp, Award, MapPin } from "lucide-react";
import type { Property } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardWide from "@/components/home/PropertyCardWide";
import PropertyCardFeatured from "@/components/home/PropertyCardFeatured";
import PropertyDuoRow from "@/components/home/PropertyDuoRow";
import PropertyCardStack from "@/components/home/PropertyCardStack";
import PropertyCardCinematic from "@/components/home/PropertyCardCinematic";
import PropertyCardPolaroid from "@/components/home/PropertyCardPolaroid";
import { useIsMobile } from "@/hooks/use-mobile";

const interstitials: { icon: ReactNode; text: string; sub: string; accent: string }[] = [
  { icon: <TrendingUp size={18} className="text-primary" />, text: "Trending this week", sub: "Based on 2,400+ bookings in Jeypore", accent: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(270 80% 65% / 0.12))" },
  { icon: <Award size={18} style={{ color: "hsl(43 96% 56%)" }} />, text: "Guest favourites", sub: "Rated 4.8+ by verified guests", accent: "linear-gradient(135deg, hsl(43 96% 56% / 0.1), hsl(35 95% 55% / 0.08))" },
  { icon: <Sparkles size={18} style={{ color: "hsl(270 80% 65%)" }} />, text: "Curated by Hushh team", sub: "Hand-picked, quality checked", accent: "linear-gradient(135deg, hsl(270 80% 65% / 0.1), hsl(320 80% 60% / 0.08))" },
  { icon: <MapPin size={18} style={{ color: "hsl(150 80% 45%)" }} />, text: "Near you", sub: "Experiences within 15 min drive", accent: "linear-gradient(135deg, hsl(150 80% 45% / 0.1), hsl(170 75% 40% / 0.08))" },
];

interface MixedListingFeedProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

/** How many items to render initially — rest load on scroll */
const INITIAL_BATCH = 4;
const BATCH_SIZE = 3;

export default function MixedListingFeed({ properties, onPropertyTap, wishlist, onToggleWishlist }: MixedListingFeedProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Reset visible count when properties change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [properties]);

  // IntersectionObserver to load more items as user scrolls
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + BATCH_SIZE, properties.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [properties.length]);

  const elements = useMemo(() => {
    const items: ReactNode[] = [];
    let i = 0;
    let cycle = 0;
    let rendered = 0;

    // Desktop: uniform clean grid — all PropertyCard
    if (!isMobile) {
      while (i < properties.length && rendered < visibleCount) {
        const p = properties[i];
        const isWL = wishlist.includes(p.id);
        items.push(
          <PropertyCard
            key={p.id}
            property={p}
            index={i}
            onTap={onPropertyTap}
            isWishlisted={isWL}
            onToggleWishlist={onToggleWishlist}
          />
        );
        i++;
        rendered++;
      }
      return items;
    }

    // Mobile: creative mixed feed (unchanged)
    while (i < properties.length && rendered < visibleCount) {
      const pos = i % 10;

      if (i > 0 && pos === 0) {
        const b = interstitials[cycle % interstitials.length];
        items.push(
          <div key={`break-${cycle}`} className="mx-5 my-1">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/15" style={{ background: b.accent }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--foreground) / 0.06)" }}>{b.icon}</div>
              <div>
                <p className="text-[13px] font-bold text-foreground">{b.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.sub}</p>
              </div>
            </div>
          </div>
        );
        cycle++;
      }

      const p = properties[i];
      const isWL = wishlist.includes(p.id);

      switch (pos) {
        case 0:
          items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++;
          break;
        case 1:
          items.push(<PropertyCardWide key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++;
          break;
        case 2:
          if (i + 1 < properties.length) {
            items.push(<PropertyDuoRow key={`duo-${p.id}`} properties={[p, properties[i + 1]]} startIndex={i} onTap={onPropertyTap} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />);
            i += 2; rendered += 2;
          } else {
            items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
            i++; rendered++;
          }
          break;
        case 4:
          items.push(<PropertyCardCinematic key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++;
          break;
        case 5:
          items.push(<PropertyCardPolaroid key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++;
          break;
        case 6:
          if (i + 2 < properties.length) {
            items.push(<PropertyCardStack key={`stack-${p.id}`} properties={[p, properties[i + 1], properties[i + 2]]} startIndex={i} onTap={onPropertyTap} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />);
            i += 3; rendered += 3;
          } else {
            items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
            i++; rendered++;
          }
          break;
        case 9:
          items.push(<PropertyCardFeatured key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++;
          break;
        default:
          items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++;
          break;
      }
    }

    return items;
  }, [properties, onPropertyTap, wishlist, onToggleWishlist, visibleCount, isMobile]);

  if (properties.length === 0) return null;

  return (
    <div className="space-y-6 md:px-8 lg:px-16 xl:px-24 2xl:px-32">
      <div className={isMobile ? "space-y-6" : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8"}>
        {elements}
      </div>
      {visibleCount < properties.length && (
        <div ref={sentinelRef} className="h-px" />
      )}
    </div>
  );
}
