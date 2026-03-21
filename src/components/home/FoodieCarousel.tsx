import { useRef, useState, useEffect, useCallback, memo } from "react";
import { VolumeX, Volume2, Bookmark } from "lucide-react";
import { type Property } from "@/data/properties";
import { AccentFrame, AccentTag } from "@/components/shared/AccentFrame";

import videoThali from "@/assets/video-tribal-thali.mp4.asset.json";
import videoBbq from "@/assets/video-bbq-grill.mp4.asset.json";
import videoCandlelight from "@/assets/video-candlelight.mp4.asset.json";
import videoChai from "@/assets/video-chai-pour.mp4.asset.json";
import videoRooftop from "@/assets/video-rooftop-dinner.mp4.asset.json";
import { Flame, Sparkles } from "lucide-react";

const foodieVideos = [videoThali.url, videoBbq.url, videoCandlelight.url, videoChai.url, videoRooftop.url];
const foodieOverlays = ["taste the tradition", "sizzle & spice", "rustic flavors", "farm to fire", "under the sky"];

type FoodieAccent = {
  color: string;
  tag: { label: string; bg: string; icon?: React.ReactNode };
};

const foodieAccents: FoodieAccent[] = [
  { color: "hsl(43 96% 56%)", tag: { label: "MUST TRY", bg: "linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 45%))", icon: <Flame size={11} className="text-primary-foreground" /> } },
  { color: "hsl(var(--primary))", tag: { label: "CURATED", bg: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", icon: <Sparkles size={11} className="text-primary-foreground" /> } },
  { color: "hsl(350 80% 55%)", tag: { label: "CHEF'S PICK", bg: "linear-gradient(135deg, hsl(350 80% 55%), hsl(320 70% 50%))", icon: <Sparkles size={11} className="text-primary-foreground" /> } },
  { color: "hsl(25 90% 55%)", tag: { label: "LOCAL FAVORITE", bg: "linear-gradient(135deg, hsl(25 90% 55%), hsl(8 85% 54%))", icon: <Sparkles size={11} className="text-primary-foreground" /> } },
  { color: "hsl(var(--primary))", tag: { label: "TRENDING", bg: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", icon: <Sparkles size={11} className="text-primary-foreground" /> } },
];

interface FoodieCarouselProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

const FoodieVideoCard = memo(function FoodieVideoCard({
  property, videoSrc, overlayText, isActive, onTap, accent,
}: {
  property: Property; videoSrc: string; overlayText: string; isActive: boolean; onTap: () => void; accent: FoodieAccent;
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
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: [0, 0.1], rootMargin: "400px" }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="shrink-0 cursor-pointer"
      style={{
        width: "85vw", maxWidth: "380px", scrollSnapAlign: "center",
        opacity: isActive ? 1 : 0.7,
        transform: isActive ? "scale(1)" : "scale(0.95)",
        transition: "opacity 0.3s, transform 0.3s",
      }}
      onClick={onTap}
    >
      <div className="relative" style={{ height: "65vh", maxHeight: "520px" }}>
        <AccentFrame color={accent.color} radius="20px" glowAlpha={0.08} />
        <div className="relative w-full h-full overflow-hidden rounded-[20px]" style={{ border: "1px solid hsl(var(--border) / 0.24)" }}>
          {!videoReady && (
            <div className="absolute inset-0 z-[2] pointer-events-none">
              <img src={property.images[0]} alt={property.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 video-buffer-shimmer" />
            </div>
          )}
          {shouldLoad && (
            <video
              ref={videoRef}
              src={videoSrc}
              muted={muted}
              autoPlay
              loop
              playsInline
              preload="auto"
              onCanPlayThrough={() => setVideoReady(true)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.5s" }}
            />
          )}
          <AccentTag tag={accent.tag} className="absolute top-4 left-4 z-10" />
          <button
            onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-10"
            style={{ background: "hsl(var(--foreground) / 0.36)" }}
          >
            {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
          </button>
          <div className="absolute inset-0 flex items-end pointer-events-none" style={{ paddingBottom: "35%" }}>
            <p className="text-[26px] font-black italic text-white/90 leading-[1.15] px-5" style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.5)" }}>
              {overlayText}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.25) 70%, transparent 100%)" }}>
            <div className="flex items-end justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-[20px] font-extrabold text-white leading-tight line-clamp-2" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{property.name}</h3>
                <p className="text-[13px] text-white/75 font-medium mt-1">{property.description}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ml-3 shrink-0" style={{ background: "hsl(var(--foreground) / 0.36)" }}>
                <Bookmark size={18} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

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
      <div ref={scrollRef} onScroll={handleScroll} className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {items.map((p, i) => (
          <FoodieVideoCard key={p.id} property={p} videoSrc={foodieVideos[i % foodieVideos.length]} overlayText={foodieOverlays[i % foodieOverlays.length]} isActive={i === activeIndex} accent={foodieAccents[i % foodieAccents.length]} onTap={() => onPropertyTap(p)} />
        ))}
      </div>
    </div>
  );
}
