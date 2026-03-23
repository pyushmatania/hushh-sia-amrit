import { useMemo, type ReactNode } from "react";
import type { Property } from "@/data/properties";
import PropertyCard from "@/components/PropertyCard";
import PropertyCardWide from "@/components/home/PropertyCardWide";
import PropertyCardFeatured from "@/components/home/PropertyCardFeatured";
import PropertyDuoRow from "@/components/home/PropertyDuoRow";

/**
 * MixedListingFeed — renders properties in a visually varied pattern:
 *
 * Pattern per 6 items:
 *  0: Regular PropertyCard
 *  1: Wide horizontal card
 *  2-3: Duo row (two portrait cards side by side)
 *  4: Featured hero card (tall, immersive)
 *  5: Regular PropertyCard
 *
 * Interstitial banners inserted between cycles for extra visual breaks.
 */

const interstitials = [
  { emoji: "🔥", text: "Trending this week in Jeypore", accent: "hsl(0 85% 55% / 0.12)" },
  { emoji: "💫", text: "Hand-picked by our local team", accent: "hsl(270 80% 65% / 0.12)" },
  { emoji: "🏆", text: "Top rated by 500+ guests", accent: "hsl(43 96% 56% / 0.12)" },
  { emoji: "🌙", text: "Perfect for tonight", accent: "hsl(220 75% 55% / 0.12)" },
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
      const pos = i % 6;

      // Insert interstitial banner between cycles (after every 6 items)
      if (i > 0 && pos === 0) {
        const banner = interstitials[cycle % interstitials.length];
        items.push(
          <div key={`interstitial-${cycle}`} className="mx-5 my-2">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border/20"
              style={{ background: banner.accent }}
            >
              <span className="text-2xl">{banner.emoji}</span>
              <p className="text-[13px] font-semibold text-foreground">{banner.text}</p>
            </div>
          </div>
        );
        cycle++;
      }

      switch (pos) {
        case 0: // Regular card
          items.push(
            <PropertyCard
              key={properties[i].id}
              property={properties[i]}
              index={i}
              onTap={onPropertyTap}
              isWishlisted={wishlist.includes(properties[i].id)}
              onToggleWishlist={onToggleWishlist}
            />
          );
          i++;
          break;

        case 1: // Wide horizontal card
          items.push(
            <PropertyCardWide
              key={properties[i].id}
              property={properties[i]}
              index={i}
              onTap={onPropertyTap}
              isWishlisted={wishlist.includes(properties[i].id)}
              onToggleWishlist={onToggleWishlist}
            />
          );
          i++;
          break;

        case 2: // Duo row (uses 2 items)
          if (i + 1 < properties.length) {
            items.push(
              <PropertyDuoRow
                key={`duo-${properties[i].id}`}
                properties={[properties[i], properties[i + 1]]}
                startIndex={i}
                onTap={onPropertyTap}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
              />
            );
            i += 2;
          } else {
            // Only 1 item left, render as regular
            items.push(
              <PropertyCard
                key={properties[i].id}
                property={properties[i]}
                index={i}
                onTap={onPropertyTap}
                isWishlisted={wishlist.includes(properties[i].id)}
                onToggleWishlist={onToggleWishlist}
              />
            );
            i++;
          }
          break;

        case 4: // Featured hero card
          items.push(
            <PropertyCardFeatured
              key={properties[i].id}
              property={properties[i]}
              index={i}
              onTap={onPropertyTap}
              isWishlisted={wishlist.includes(properties[i].id)}
              onToggleWishlist={onToggleWishlist}
            />
          );
          i++;
          break;

        default: // pos 3 was consumed by duo, pos 5 = regular
          items.push(
            <PropertyCard
              key={properties[i].id}
              property={properties[i]}
              index={i}
              onTap={onPropertyTap}
              isWishlisted={wishlist.includes(properties[i].id)}
              onToggleWishlist={onToggleWishlist}
            />
          );
          i++;
          break;
      }
    }

    return items;
  }, [properties, onPropertyTap, wishlist, onToggleWishlist]);

  if (properties.length === 0) return null;

  return <div className="space-y-5">{elements}</div>;
}
