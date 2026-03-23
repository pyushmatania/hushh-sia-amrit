import { Heart, Star, Camera, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/properties";
import OptimizedImage from "@/components/shared/OptimizedImage";

/**
 * PropertyCardPolaroid — a scrapbook-style instant photo with branded Hushh
 * washi-tape strips, corner stickers, a postage stamp, and handwritten caption.
 */

interface PropertyCardPolaroidProps {
  property: Property;
  index: number;
  onTap: (property: Property) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

const tilts = [-2.5, 1.8, -1.2, 2.5, -0.6, 1.5];

const tapeGradients = [
  "linear-gradient(135deg, hsl(280 80% 65%), hsl(320 85% 60%))",
  "linear-gradient(135deg, hsl(35 95% 60%), hsl(15 90% 55%))",
  "linear-gradient(135deg, hsl(170 70% 50%), hsl(200 80% 55%))",
  "linear-gradient(135deg, hsl(45 95% 60%), hsl(30 90% 55%))",
  "linear-gradient(135deg, hsl(260 75% 60%), hsl(220 80% 55%))",
  "linear-gradient(135deg, hsl(340 80% 60%), hsl(10 85% 55%))",
];

const captions = [
  "memories here ✨",
  "can't wait to go back",
  "best spot ever 🌿",
  "golden hour vibes ☀️",
  "our happy place 💛",
  "weekend escape 🎶",
];

const stickerEmojis = ["📌", "⭐", "🔥", "💜", "✈️", "🎯"];

export default function PropertyCardPolaroid({ property, index, onTap, isWishlisted = false, onToggleWishlist }: PropertyCardPolaroidProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const tilt = tilts[index % tilts.length];
  const tapeGrad = tapeGradients[index % tapeGradients.length];
  const caption = captions[index % captions.length];
  const sticker = stickerEmojis[index % stickerEmojis.length];

  return (
    <div
      className="mx-auto cursor-pointer active:scale-[0.94] transition-transform"
      onClick={() => onTap(property)}
      style={{
        width: "78%",
        maxWidth: "310px",
        transform: `rotate(${tilt}deg)`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Top branded washi tape with texture */}
      <div
        className="mx-auto relative z-10 flex items-center justify-center gap-1 overflow-hidden"
        style={{
          width: "110px",
          height: "24px",
          background: tapeGrad,
          borderRadius: "2px",
          transform: `rotate(${-tilt * 0.4}deg) translateY(12px)`,
          boxShadow: "0 2px 8px hsl(var(--foreground) / 0.15)",
          opacity: 0.85,
        }}
      >
        {/* Tape texture overlay — fibrous/frosted look */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23t)' opacity='0.35'/%3E%3C/svg%3E\")",
          mixBlendMode: "overlay",
          opacity: 0.6,
        }} />
        {/* Frosted edge lines */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "hsl(0 0% 100% / 0.35)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "hsl(0 0% 0% / 0.15)" }} />
        <Sparkles size={8} className="text-white/80 relative z-10" />
        <span className="text-[7px] font-black text-white/90 tracking-[0.15em] uppercase relative z-10">
          hushh
        </span>
        <Sparkles size={8} className="text-white/80 relative z-10" />
      </div>

      {/* Photo card body */}
      <div
        className="relative overflow-visible"
        style={{
          background: "hsl(var(--card))",
          padding: "12px 12px 0 12px",
          borderRadius: "5px",
          boxShadow:
            "0 12px 44px hsl(var(--foreground) / 0.18), 0 2px 10px hsl(var(--foreground) / 0.12), inset 0 0 0 1px hsl(var(--border) / 0.12)",
        }}
      >
        {/* Corner sticker - top right */}
        <div
          className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "hsl(var(--card))",
            boxShadow: "0 2px 8px hsl(var(--foreground) / 0.15)",
            border: "2px solid hsl(var(--border) / 0.2)",
          }}
        >
          <span className="text-sm">{sticker}</span>
        </div>

        {/* Side tape strip with texture */}
        <div
          className="absolute -left-3 top-1/3 z-20 overflow-hidden"
          style={{
            width: "18px",
            height: "50px",
            background: tapeGrad,
            borderRadius: "2px",
            transform: "rotate(-8deg)",
            opacity: 0.65,
            boxShadow: "0 1px 4px hsl(var(--foreground) / 0.1)",
          }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)' opacity='0.4'/%3E%3C/svg%3E\")",
            mixBlendMode: "overlay",
          }} />
        </div>

        {/* Photo area */}
        <div className="relative aspect-[4/3] overflow-hidden" style={{ borderRadius: "3px" }}>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-secondary animate-pulse">
              <div className="absolute inset-0 shimmer-bg" />
            </div>
          )}
          <OptimizedImage
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 78vw, 310px"
            onImageLoad={() => setImgLoaded(true)}
            showSkeleton={false}
          />

          {/* Heart */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(property.id); }}
            className="absolute top-2 right-2 active:scale-125 transition-transform z-10"
          >
            <Heart
              size={18}
              className={`drop-shadow-lg transition-colors ${isWishlisted ? "fill-primary text-primary" : "fill-foreground/20 text-white"}`}
              strokeWidth={2}
            />
          </button>

          {/* Camera date stamp */}
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full z-10"
            style={{ background: "hsl(var(--foreground) / 0.45)", backdropFilter: "blur(8px)" }}
          >
            <Camera size={10} className="text-white" />
            <span className="text-[9px] text-white/90 font-mono tracking-wide">
              {new Date().toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
            </span>
          </div>

          {/* Film grain texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay opacity-20"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Bottom branded strip */}
        <div
          className="mt-2 mx-auto flex items-center justify-center gap-1 py-1 rounded-full"
          style={{
            width: "90px",
            background: tapeGrad,
            opacity: 0.25,
          }}
        >
          <span className="text-[6px] font-bold text-white tracking-[0.2em] uppercase">hushh · verified</span>
        </div>

        {/* Caption area */}
        <div className="py-3 px-1">
          <h3
            className="text-[15px] font-bold text-foreground leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {property.name}
          </h3>

          {/* Handwritten caption */}
          <p
            className="text-[11px] text-muted-foreground mt-1 italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "{caption}"
          </p>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star size={10} className="fill-primary text-primary" />
              <span className="text-[11px] font-semibold text-foreground">{property.rating}</span>
              <span className="text-[10px] text-muted-foreground ml-0.5">{property.location}</span>
            </div>
            <span className="text-[13px] font-extrabold text-gradient-warm">₹{property.basePrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Bottom-right accent tape */}
        <div
          className="absolute -bottom-1 -right-2 z-20 overflow-hidden"
          style={{
            width: "55px",
            height: "16px",
            background: tapeGrad,
            borderRadius: "2px",
            transform: "rotate(12deg)",
            opacity: 0.55,
          }}
        >
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' opacity='0.4'/%3E%3C/svg%3E\")",
            mixBlendMode: "overlay",
          }} />
        </div>
      </div>
    </div>
  );
}
