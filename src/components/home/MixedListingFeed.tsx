import { useMemo, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { Sparkles, TrendingUp, Award, MapPin, Heart, Star, ArrowRight, ArrowLeft, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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

const INITIAL_BATCH = 4;
const BATCH_SIZE = 3;

/* ─── Desktop Card Variants ─── */

function DesktopOverlayCard({ p, onTap, isWL, onToggleWishlist }: { p: Property; onTap: (p: Property) => void; isWL: boolean; onToggleWishlist?: (id: string) => void }) {
  const cheapest = Math.min(...p.slots.filter(s => s.available).map(s => s.price));
  return (
    <div
      onClick={() => onTap(p)}
      className="rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{ height: 320, border: "1px solid hsl(var(--border) / 0.15)" }}
    >
      <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5 group-hover:from-black/95 transition-all duration-500" />
      
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>✨ FEATURED</span>
        {onToggleWishlist && (
          <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--foreground) / 0.2)", backdropFilter: "blur(10px)" }}>
            <Heart size={16} className={isWL ? "fill-primary text-primary" : "text-white"} />
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 transition-transform duration-500 translate-y-6 group-hover:translate-y-0">
        <h3 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.name}</h3>
        <p className="text-sm text-white/55 mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{p.description}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /><span className="text-sm font-bold text-white">{p.rating}</span></span>
          <span className="text-xs text-white/50">{p.location}</span>
          <span className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            ₹{cheapest.toLocaleString()}+ <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

function DesktopGlassCard({ p, onTap, isWL, onToggleWishlist }: { p: Property; onTap: (p: Property) => void; isWL: boolean; onToggleWishlist?: (id: string) => void }) {
  const cheapest = Math.min(...p.slots.filter(s => s.available).map(s => s.price));
  return (
    <div
      onClick={() => onTap(p)}
      className="rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: "hsl(var(--card) / 0.8)", border: "1px solid hsl(var(--border) / 0.25)", boxShadow: "0 8px 32px hsl(var(--foreground) / 0.06)" }}
    >
      <div className="relative h-[180px] overflow-hidden">
        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {onToggleWishlist && (
          <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="absolute top-3 right-3">
            <Heart size={18} className={isWL ? "fill-primary text-primary" : "fill-foreground/20 text-background"} />
          </button>
        )}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background: "hsl(var(--primary) / 0.9)", color: "hsl(var(--primary-foreground))" }}>
          ₹{cheapest.toLocaleString()}+
        </div>
      </div>
      <div className="p-4">
        <span className="text-[9px] font-bold tracking-[0.15em] text-primary uppercase">{Array.isArray(p.category) ? p.category[0] : p.category}</span>
        <h4 className="text-base font-bold text-foreground leading-tight mt-1">{p.name}</h4>
        <div className="flex items-center gap-2 mt-2">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-foreground">{p.rating}</span>
          <span className="text-xs text-muted-foreground ml-auto">{p.location}</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>
          View Details <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}

function DesktopPanoCard({ p, onTap, isWL, onToggleWishlist }: { p: Property; onTap: (p: Property) => void; isWL: boolean; onToggleWishlist?: (id: string) => void }) {
  const cheapest = Math.min(...p.slots.filter(s => s.available).map(s => s.price));
  return (
    <div
      onClick={() => onTap(p)}
      className="col-span-2 lg:col-span-3 xl:col-span-4 rounded-2xl overflow-hidden cursor-pointer group relative"
      style={{ height: 200, border: "1px solid hsl(var(--border) / 0.2)" }}
    >
      <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0.7) 45%, transparent 100%)" }} />
      {onToggleWishlist && (
        <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="absolute top-4 right-4 z-10">
          <Heart size={20} className={isWL ? "fill-primary text-primary" : "fill-foreground/20 text-foreground/40"} />
        </button>
      )}
      <div className="absolute inset-0 flex items-center p-6">
        <div className="flex-1 max-w-[55%]">
          <span className="text-[9px] font-bold tracking-[0.15em] text-primary uppercase">{Array.isArray(p.category) ? p.category[0] : p.category}</span>
          <h3 className="text-xl font-bold text-foreground leading-tight mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.name}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /><span className="text-sm font-bold text-foreground">{p.rating}</span></div>
            <span className="text-xs text-muted-foreground">{p.location}</span>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ml-auto group-hover:scale-105 transition-transform" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              ₹{cheapest.toLocaleString()}+ <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopMinimalCard({ p, onTap, isWL, onToggleWishlist }: { p: Property; onTap: (p: Property) => void; isWL: boolean; onToggleWishlist?: (id: string) => void }) {
  const cheapest = Math.min(...p.slots.filter(s => s.available).map(s => s.price));
  return (
    <div onClick={() => onTap(p)} className="rounded-2xl overflow-hidden cursor-pointer group" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.3)" }}>
      <div className="relative h-[160px] overflow-hidden">
        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {onToggleWishlist && (
          <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="absolute top-3 right-3">
            <Heart size={16} className={isWL ? "fill-primary text-primary" : "fill-foreground/20 text-background"} />
          </button>
        )}
      </div>
      <div className="p-3.5">
        <h4 className="text-sm font-bold text-foreground leading-tight line-clamp-1">{p.name}</h4>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" /><span className="text-xs font-medium text-foreground">{p.rating}</span></div>
          <span className="text-sm font-bold text-primary">₹{cheapest.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Magazine / Editorial Card ─── */
function DesktopEditorialCard({ p, onTap, isWL, onToggleWishlist }: { p: Property; onTap: (p: Property) => void; isWL: boolean; onToggleWishlist?: (id: string) => void }) {
  const cheapest = Math.min(...p.slots.filter(s => s.available).map(s => s.price));
  return (
    <div onClick={() => onTap(p)} className="col-span-2 rounded-2xl overflow-hidden cursor-pointer group relative" style={{ height: 260, border: "1px solid hsl(var(--border) / 0.2)" }}>
      <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--background) / 0.92) 0%, hsl(var(--background) / 0.6) 50%, transparent 100%)" }} />
      
      <div className="absolute top-5 left-5 z-10">
        <span className="text-[9px] font-bold tracking-[0.2em] px-3 py-1 rounded-full" style={{ background: "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%))", color: "#fff" }}>EDITOR'S CHOICE</span>
      </div>
      
      {onToggleWishlist && (
        <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="absolute top-5 right-5 z-10">
          <Heart size={20} className={isWL ? "fill-primary text-primary" : "fill-foreground/10 text-foreground/40"} />
        </button>
      )}
      
      <div className="absolute inset-0 flex items-center p-8">
        <div className="max-w-[50%]">
          <span className="text-[10px] font-bold tracking-[0.15em] text-primary uppercase">{Array.isArray(p.category) ? p.category[0] : p.category}</span>
          <h3 className="text-2xl font-black text-foreground leading-tight mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>{p.name}</h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /><span className="text-sm font-bold text-foreground">{p.rating}</span></div>
            <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold group-hover:scale-105 transition-transform" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              ₹{cheapest.toLocaleString()}+ <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Gradient Accent Card ─── */
function DesktopAccentCard({ p, onTap, isWL, onToggleWishlist }: { p: Property; onTap: (p: Property) => void; isWL: boolean; onToggleWishlist?: (id: string) => void }) {
  const cheapest = Math.min(...p.slots.filter(s => s.available).map(s => s.price));
  const gradients = [
    "linear-gradient(135deg, hsl(270 80% 65% / 0.15), hsl(320 80% 60% / 0.1))",
    "linear-gradient(135deg, hsl(200 80% 55% / 0.15), hsl(170 75% 45% / 0.1))",
    "linear-gradient(135deg, hsl(35 95% 55% / 0.15), hsl(15 90% 50% / 0.1))",
  ];
  return (
    <div onClick={() => onTap(p)} className="rounded-2xl overflow-hidden cursor-pointer group" style={{ background: gradients[Math.abs(p.name.length) % 3], border: "1px solid hsl(var(--border) / 0.2)" }}>
      <div className="relative h-[200px] overflow-hidden rounded-t-2xl">
        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {onToggleWishlist && (
          <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--foreground) / 0.2)", backdropFilter: "blur(8px)" }}>
            <Heart size={14} className={isWL ? "fill-primary text-primary" : "text-white"} />
          </button>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.9)", color: "hsl(var(--primary-foreground))" }}>
          <Sparkles size={10} />
          <span className="text-[10px] font-bold">TOP RATED</span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-base font-bold text-foreground leading-tight">{p.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.location}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" /><span className="text-xs font-bold text-foreground">{p.rating}</span></div>
          <div className="flex items-center gap-1 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">
            ₹{cheapest.toLocaleString()}+ <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MixedListingFeed({ properties, onPropertyTap, wishlist, onToggleWishlist }: MixedListingFeedProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [desktopShowAll, setDesktopShowAll] = useState(false);
  const overflowScrollRef = useRef<HTMLDivElement>(null);
  const [overflowCanLeft, setOverflowCanLeft] = useState(false);
  const [overflowCanRight, setOverflowCanRight] = useState(false);
  const CARDS_PER_PAGE = 4;
  const COLS = 4;
  const ROWS_INITIAL = 3;

  useEffect(() => { setVisibleCount(INITIAL_BATCH); }, [properties]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(prev => Math.min(prev + BATCH_SIZE, properties.length));
    }, { rootMargin: "400px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [properties.length]);

  const updateArrows = useCallback(() => {
    const el = desktopScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = desktopScrollRef.current;
    if (!el || isMobile) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener("scroll", updateArrows);
  }, [isMobile, updateArrows, properties]);

  const scrollDesktop = useCallback((dir: "left" | "right") => {
    const el = desktopScrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-listing-card]")?.getBoundingClientRect().width || 300;
    const scrollAmount = (cardWidth + 24) * CARDS_PER_PAGE;
    el.scrollBy({ left: dir === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" });
  }, []);

  const updateOverflowArrows = useCallback(() => {
    const el = overflowScrollRef.current;
    if (!el) return;
    setOverflowCanLeft(el.scrollLeft > 10);
    setOverflowCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = overflowScrollRef.current;
    if (!el || isMobile || desktopShowAll) return;
    updateOverflowArrows();
    el.addEventListener("scroll", updateOverflowArrows, { passive: true });
    const ro = new ResizeObserver(updateOverflowArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateOverflowArrows); ro.disconnect(); };
  }, [updateOverflowArrows, isMobile, desktopShowAll, properties]);

  const scrollOverflow = useCallback((dir: "left" | "right") => {
    const el = overflowScrollRef.current;
    if (!el) return;
    const cardW = el.querySelector("[data-overflow-card]")?.getBoundingClientRect().width || 260;
    el.scrollBy({ left: dir === "left" ? -cardW * 2 : cardW * 2, behavior: "smooth" });
  }, []);

  // Mobile: creative mixed feed elements
  const mobileElements = useMemo(() => {
    if (!isMobile) return [];
    const items: ReactNode[] = [];
    let i = 0;
    let cycle = 0;
    let rendered = 0;

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
          i++; rendered++; break;
        case 1:
          items.push(<PropertyCardWide key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++; break;
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
          i++; rendered++; break;
        case 5:
          items.push(<PropertyCardPolaroid key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++; break;
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
          i++; rendered++; break;
        default:
          items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++; rendered++; break;
      }
    }
    return items;
  }, [properties, onPropertyTap, wishlist, onToggleWishlist, visibleCount, isMobile]);

  if (properties.length === 0) return null;

  /* ─── Desktop: 3-row grid + swipeable overflow row + Show More ─── */

  if (!isMobile) {
    const gridItems = properties.slice(0, COLS * ROWS_INITIAL);
    const overflowItems = properties.slice(COLS * ROWS_INITIAL);
    const allVisible = desktopShowAll ? properties : gridItems;

    const renderCard = (p: Property) => {
      const isWL = wishlist.includes(p.id);
      const cheapest = Math.min(...p.slots.filter(s => s.available).map(s => s.price));
      return (
        <div
          key={p.id}
          className="cursor-pointer group"
          onClick={() => onPropertyTap(p)}
        >
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            {onToggleWishlist && (
              <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center">
                <Heart size={20} className={isWL ? "fill-primary text-primary" : "fill-foreground/30 text-white"} strokeWidth={isWL ? 0 : 2} />
              </button>
            )}
            {p.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {p.images.slice(0, 5).map((_, di) => (
                  <div key={di} className={`w-1.5 h-1.5 rounded-full ${di === 0 ? "bg-white" : "bg-white/50"}`} />
                ))}
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground leading-tight line-clamp-1 flex-1">{p.name}</h4>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <Star size={12} className="fill-foreground text-foreground" />
                <span className="text-sm text-foreground">{p.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{p.location}</p>
            <p className="text-sm text-foreground mt-1">
              <span className="font-semibold">₹{cheapest.toLocaleString()}</span>
              <span className="text-muted-foreground"> per slot</span>
            </p>
          </div>
        </div>
      );
    };

    return (
      <div className="md:px-8 lg:px-16 xl:px-24 2xl:px-32">
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {allVisible.map(renderCard)}
        </div>

        {/* Swipeable overflow row — only when not showing all & there are overflow items */}
        {!desktopShowAll && overflowItems.length > 0 && (
          <div className="relative mt-8">
            {overflowCanLeft && (
              <button
                onClick={() => scrollOverflow("left")}
                className="absolute -left-5 top-1/3 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center border border-border/40 shadow-md hover:scale-110 transition-all cursor-pointer"
                style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {overflowCanRight && (
              <button
                onClick={() => scrollOverflow("right")}
                className="absolute -right-5 top-1/3 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center border border-border/40 shadow-md hover:scale-110 transition-all cursor-pointer"
                style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
              >
                <ChevronRight size={18} />
              </button>
            )}
            <div
              ref={overflowScrollRef}
              className="flex gap-6 overflow-x-auto hide-scrollbar pb-2"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {overflowItems.map((p) => (
                <div key={p.id} data-overflow-card className="shrink-0" style={{ width: "calc((100% - 72px) / 4)", minWidth: 220, scrollSnapAlign: "start" }}>
                  {renderCard(p)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show more / Show less */}
        {properties.length > COLS * ROWS_INITIAL && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setDesktopShowAll(prev => !prev)}
              className="px-8 py-3 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            >
              {desktopShowAll
                ? "Show less"
                : `Show more (${overflowItems.length} more)`}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ─── Mobile: Creative mixed feed (unchanged) ─── */
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {mobileElements}
      </div>
      {visibleCount < properties.length && (
        <div ref={sentinelRef} className="h-px" />
      )}
    </div>
  );
}
