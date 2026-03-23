import { useMemo, type ReactNode } from "react";
import { Sparkles, TrendingUp, Award, MapPin } from "lucide-react";
import type { Property } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardWide from "@/components/home/PropertyCardWide";
import PropertyCardFeatured from "@/components/home/PropertyCardFeatured";
import PropertyDuoRow from "@/components/home/PropertyDuoRow";
import PropertyCardStack from "@/components/home/PropertyCardStack";
import PropertyCardCinematic from "@/components/home/PropertyCardCinematic";
import PropertyCardPolaroid from "@/components/home/PropertyCardPolaroid";

/**
 * MixedListingFeed — varied 10-item pattern per cycle:
 *
 *  0: Regular PropertyCard
 *  1: Wide horizontal card
 *  2-3: Duo row (two portrait cards)
 *  4: Cinematic diagonal-split card
 *  5: Polaroid tilted card
 *  6-8: Stacked fan of 3 cards
 *  9: Featured hero card (tall, immersive)
 *
 * Rich interstitials inserted between cycles.
 */

const interstitials: { icon: ReactNode; text: string; sub: string; accent: string }[] = [
  {
    icon: <TrendingUp size={18} className="text-primary" />,
    text: "Trending this week",
    sub: "Based on 2,400+ bookings in Jeypore",
    accent: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(270 80% 65% / 0.12))",
  },
  {
    icon: <Award size={18} style={{ color: "hsl(43 96% 56%)" }} />,
    text: "Guest favourites",
    sub: "Rated 4.8+ by verified guests",
    accent: "linear-gradient(135deg, hsl(43 96% 56% / 0.1), hsl(35 95% 55% / 0.08))",
  },
  {
    icon: <Sparkles size={18} style={{ color: "hsl(270 80% 65%)" }} />,
    text: "Curated by Hushh team",
    sub: "Hand-picked, quality checked",
    accent: "linear-gradient(135deg, hsl(270 80% 65% / 0.1), hsl(320 80% 60% / 0.08))",
  },
  {
    icon: <MapPin size={18} style={{ color: "hsl(150 80% 45%)" }} />,
    text: "Near you",
    sub: "Experiences within 15 min drive",
    accent: "linear-gradient(135deg, hsl(150 80% 45% / 0.1), hsl(170 75% 40% / 0.08))",
  },
];

interface MixedListingFeedProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
  wishlist: string[];
  onToggleWishlist?: (id: string) => void;
}

export default function MixedListingFeed({ properties, onPropertyTap, wishlist, onToggleWishlist }: MixedListingFeedProps) {
  const elements = useMemo(() => {
    const items: ReactNode[] = [];
    let i = 0;
    let cycle = 0;

    while (i < properties.length) {
      const pos = i % 10;

      // Interstitial between cycles
      if (i > 0 && pos === 0) {
        const b = interstitials[cycle % interstitials.length];
        items.push(
          <div key={`break-${cycle}`} className="mx-5 my-1">
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/15"
              style={{ background: b.accent }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--foreground) / 0.06)" }}>
                {b.icon}
              </div>
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
        case 0: // Standard
          items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++;
          break;

        case 1: // Wide
          items.push(<PropertyCardWide key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++;
          break;

        case 2: // Duo row (2 items)
          if (i + 1 < properties.length) {
            items.push(
              <PropertyDuoRow key={`duo-${p.id}`} properties={[p, properties[i + 1]]} startIndex={i} onTap={onPropertyTap} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />
            );
            i += 2;
          } else {
            items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
            i++;
          }
          break;

        case 4: // Cinematic diagonal
          items.push(<PropertyCardCinematic key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++;
          break;

        case 5: // Polaroid
          items.push(<PropertyCardPolaroid key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++;
          break;

        case 6: // Stack (3 items)
          if (i + 2 < properties.length) {
            items.push(
              <PropertyCardStack key={`stack-${p.id}`} properties={[p, properties[i + 1], properties[i + 2]]} startIndex={i} onTap={onPropertyTap} wishlist={wishlist} onToggleWishlist={onToggleWishlist} />
            );
            i += 3;
          } else {
            items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
            i++;
          }
          break;

        case 9: // Featured hero
          items.push(<PropertyCardFeatured key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++;
          break;

        default: // pos 3 consumed by duo, 7-8 consumed by stack, fallback
          items.push(<PropertyCard key={p.id} property={p} index={i} onTap={onPropertyTap} isWishlisted={isWL} onToggleWishlist={onToggleWishlist} />);
          i++;
          break;
      }
    }

    return items;
  }, [properties, onPropertyTap, wishlist, onToggleWishlist]);

  if (properties.length === 0) return null;

  return <div className="space-y-6">{elements}</div>;
}
