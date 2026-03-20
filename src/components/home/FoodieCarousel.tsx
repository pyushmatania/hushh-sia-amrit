import { useRef, useState, useEffect, useCallback } from "react";
import { VolumeX, Volume2, Bookmark, Flame, Sparkles } from "lucide-react";
import { type Property } from "@/data/properties";

import videoThali from "@/assets/video-tribal-thali.mp4.asset.json";
import videoBbq from "@/assets/video-bbq-grill.mp4.asset.json";
import videoCandlelight from "@/assets/video-candlelight.mp4.asset.json";
import videoChai from "@/assets/video-chai-pour.mp4.asset.json";
import videoRooftop from "@/assets/video-rooftop-dinner.mp4.asset.json";

const foodieVideos = [videoThali.url, videoBbq.url, videoCandlelight.url, videoChai.url, videoRooftop.url];
const foodieOverlays = ["taste the tradition", "sizzle & spice", "rustic flavors", "farm to fire", "under the sky"];

type FoodieAccent = {
  color: string;
  side: "left" | "right" | "top";
  tag: { label: string; bg: string; icon: React.ReactNode };
} | null;

const foodieAccents: FoodieAccent[] = [
  {
    color: "hsl(43 96% 56%)",
    side: "left",
    tag: { label: "MUST TRY", bg: "linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 45%))", icon: <Flame size={11} className="text-white" /> },
  },
  null,
  {
    color: "hsl(350 80% 55%)",
    side: "right",
    tag: { label: "CHEF'S PICK", bg: "linear-gradient(135deg, hsl(350 80% 55%), hsl(320 70% 50%))", icon: <Sparkles size={11} className="text-white" /> },
  },
  null,
  null,
];

function getAccentBorderStyle(color: string, side: string): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", pointerEvents: "none", zIndex: 2, borderRadius: "20px" };
  if (side === "left") return { ...base, inset: 0, borderLeft: `2.5px solid ${color}`, maskImage: "linear-gradient(to bottom, transparent 5%, black 30%, black 70%, transparent 95%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 5%, black 30%, black 70%, transparent 95%)" };
  if (side === "right") return { ...base, inset: 0, borderRight: `2.5px solid ${color}`, maskImage: "linear-gradient(to bottom, transparent 5%, black 30%, black 70%, transparent 95%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 5%, black 30%, black 70%, transparent 95%)" };
  return { ...base, inset: 0, borderTop: `2.5px solid ${color}`, maskImage: "linear-gradient(to right, transparent 5%, black 30%, black 70%, transparent 95%)", WebkitMaskImage: "linear-gradient(to right, transparent 5%, black 30%, black 70%, transparent 95%)" };
}

function getGlowGradient(color: string, side: string): string {
  if (side === "left") return `linear-gradient(to right, ${color}12 0%, transparent 25%)`;
  if (side === "right") return `linear-gradient(to left, ${color}12 0%, transparent 25%)`;
  return `linear-gradient(to bottom, ${color}12 0%, transparent 25%)`;
}

interface FoodieCarouselProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

function FoodieVideoCard({
  property, videoSrc, overlayText, isActive, onTap, accent,
}: {
  property: Property; videoSrc: string; overlayText: string;
  isActive: boolean; onTap: () => void; accent: FoodieAccent;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          const video = videoRef.current;
          if (video && entry.intersectionRatio > 0.5) video.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: [0, 0.5], rootMargin: "200px" }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="shrink-0 cursor-pointer"
      style={{
        width: "85vw", maxWidth: "380px",
        scrollSnapAlign: "center",
        opacity: isActive ? 1 : 0.7,
        transform: isActive ? "scale(1)" : "scale(0.95)",
        transition: "opacity 0.3s, transform 0.3s",
      }}
      onClick={onTap}
    >
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{
          height: "65vh", maxHeight: "520px",
          border: accent ? "none" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: accent ? getAccentShadow(accent.color, accent.side) : undefined,
        }}
      >
        {accent && (
          <div
            className="absolute inset-0 z-[1] pointer-events-none rounded-[20px]"
            style={{ background: getGlowGradient(accent.color, accent.side) }}
          />
        )}

        <img src={property.images[0]} alt={property.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoReady ? 0 : 1, transition: "opacity 0.5s" }}
          loading="lazy" />
        {shouldLoad && (
          <video ref={videoRef} src={videoSrc} muted={muted} loop playsInline
            preload="metadata" onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.5s" }} />
        )}

        {accent?.tag && (
          <span
            className="absolute top-4 left-4 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10"
            style={{ background: accent.tag.bg, color: "white", letterSpacing: "0.08em" }}
          >
            {accent.tag.icon}
            {accent.tag.label}
          </span>
        )}

        <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-10"
          style={{ background: "rgba(60,60,60,0.7)" }}>
          {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-bold italic text-white/70"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
            {overlayText}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{property.name}</h3>
              <p className="text-[13px] text-white/60 mt-1">{property.description}</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ml-3 shrink-0"
              style={{ background: "rgba(60,60,60,0.7)" }}>
              <Bookmark size={18} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FoodieCarousel({ properties, onPropertyTap }: FoodieCarouselProps) {
  const diningProps = properties.filter((p) => p.category.includes("dining")).slice(0, 5);
  const items = diningProps.length >= 3 ? diningProps : properties.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const cardWidth = el.firstElementChild?.getBoundingClientRect().width || 300;
      setActiveIndex(Math.round(el.scrollLeft / (cardWidth + 12)));
    });
  }, []);

  return (
    <div>
      <div ref={scrollRef} onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {items.map((p, i) => (
          <FoodieVideoCard key={p.id} property={p}
            videoSrc={foodieVideos[i % foodieVideos.length]}
            overlayText={foodieOverlays[i % foodieOverlays.length]}
            isActive={i === activeIndex}
            accent={foodieAccents[i % foodieAccents.length]}
            onTap={() => onPropertyTap(p)} />
        ))}
      </div>
    </div>
  );
}
