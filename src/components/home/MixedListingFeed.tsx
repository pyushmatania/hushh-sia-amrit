import { useMemo, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Sparkles, TrendingUp, Award, MapPin, Heart, Star } from "lucide-react";
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

    // Desktop: creative bento grid with varied card sizes
    if (!isMobile) {
      while (i < properties.length && rendered < visibleCount) {
        const pos = i % 8;
        const p = properties[i];
        const isWL = wishlist.includes(p.id);

        // Pos 0: Hero wide card spanning 2 cols
        if (pos === 0 && i + 1 < properties.length) {
          const p2 = properties[i + 1];
          items.push(
            <div key={`hero-${p.id}`} className="col-span-2 lg:col-span-3 xl:col-span-4">
              <div className="grid grid-cols-5 gap-4" style={{ height: 360 }}>
                {/* Large left */}
                <div
                  className="col-span-3 relative rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => onPropertyTap(p)}
                >
                  <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
                      ✨ FEATURED
                    </span>
                  </div>
                  {onToggleWishlist && (
                    <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="absolute top-4 right-4">
                      <Heart size={22} className={isWL ? "fill-primary text-primary" : "fill-foreground/20 text-background"} />
                    </button>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.name}</h3>
                    <p className="text-sm text-white/65 mt-1">{p.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /><span className="text-sm font-bold text-white">{p.rating}</span></span>
                      <span className="text-sm text-white/50">{p.location}</span>
                      <span className="ml-auto text-lg font-bold text-white">₹{Math.min(...p.slots.filter(s => s.available).map(s => s.price)).toLocaleString()}<span className="text-xs text-white/40">+</span></span>
                    </div>
                  </div>
                </div>
                {/* Right stack */}
                <div className="col-span-2 flex flex-col gap-4">
                  <div
                    className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => onPropertyTap(p2)}
                  >
                    <img src={p2.images[0]} alt={p2.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    {onToggleWishlist && (
                      <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p2.id); }} className="absolute top-3 right-3">
                        <Heart size={20} className={wishlist.includes(p2.id) ? "fill-primary text-primary" : "fill-foreground/20 text-background"} />
                      </button>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-base font-bold text-white">{p2.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-white/60">{p2.location}</span>
                        <span className="text-sm font-bold text-white">₹{Math.min(...p2.slots.filter(s => s.available).map(s => s.price)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {i + 2 < properties.length && (
                    <div
                      className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer group"
                      onClick={() => onPropertyTap(properties[i + 2])}
                    >
                      <img src={properties[i + 2].images[0]} alt={properties[i + 2].name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-base font-bold text-white">{properties[i + 2].name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-white/60">{properties[i + 2].location}</span>
                          <span className="text-sm font-bold text-white">₹{Math.min(...properties[i + 2].slots.filter(s => s.available).map(s => s.price)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
          i += Math.min(3, properties.length - i);
          rendered += 3;
          continue;
        }

        // Pos 3-4: Horizontal editorial row with image left, info right
        if (pos === 3) {
          items.push(
            <div key={`editorial-${p.id}`} className="col-span-2 lg:col-span-3 xl:col-span-4">
              <div
                className="flex gap-5 rounded-2xl overflow-hidden cursor-pointer group hover:shadow-elevated transition-all"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.3)", height: 200 }}
                onClick={() => onPropertyTap(p)}
              >
                <div className="relative w-[320px] shrink-0 overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-center">
                  <span className="text-[9px] font-bold tracking-widest text-primary uppercase">{Array.isArray(p.category) ? p.category[0] : p.category}</span>
                  <h3 className="text-xl font-bold text-foreground mt-1 leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{p.description}</p>
                  <div className="flex items-center gap-3 mt-auto pt-3">
                    <span className="flex items-center gap-1"><Star size={12} className="fill-primary text-primary" /><span className="text-sm font-medium text-foreground">{p.rating}</span></span>
                    <span className="text-xs text-muted-foreground">{p.location}</span>
                    <span className="ml-auto text-lg font-bold text-foreground">₹{Math.min(...p.slots.filter(s => s.available).map(s => s.price)).toLocaleString()}<span className="text-xs text-muted-foreground"> onwards</span></span>
                  </div>
                </div>
              </div>
            </div>
          );
          i++; rendered++;
          continue;
        }

        // Default: standard card
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
