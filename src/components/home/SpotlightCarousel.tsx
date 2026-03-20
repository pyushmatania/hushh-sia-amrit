import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { VolumeX, Volume2, Bookmark, Flame, Zap, Sparkles } from "lucide-react";
import { type Property } from "@/data/properties";

import videoBonfire from "@/assets/video-bonfire-night.mp4.asset.json";
import videoPool from "@/assets/video-pool-lights.mp4.asset.json";
import videoBbq from "@/assets/video-bbq-grill.mp4.asset.json";
import videoDj from "@/assets/video-dj-lights.mp4.asset.json";
import videoRooftop from "@/assets/video-rooftop-dinner.mp4.asset.json";
import videoPickleball from "@/assets/video-pickleball.mp4.asset.json";

const spotlightVideos = [
  videoBonfire.url, videoPool.url, videoBbq.url,
  videoDj.url, videoRooftop.url, videoPickleball.url,
];
const overlayTexts = ["feel the vibe", "dive in", "sizzle & smoke", "into its groove", "under the stars", "game on"];

type VideoAccent = {
  color: string;
  side: "left" | "right" | "top";
  tag: { label: string; bg: string; icon: React.ReactNode };
} | null;

const accentStyles: VideoAccent[] = [
  {
    color: "hsl(0 85% 55%)",
    side: "left",
    tag: { label: "TONIGHT'S PICK", bg: "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 95% 55%))", icon: <Flame size={11} className="text-white" /> },
  },
  null,
  {
    color: "hsl(280 90% 60%)",
    side: "right",
    tag: { label: "HUSHH LIVE", bg: "linear-gradient(135deg, hsl(280 90% 60%), hsl(200 90% 55%))", icon: <Zap size={11} className="text-white" /> },
  },
  null,
  {
    color: "hsl(270 80% 65%)",
    side: "left",
    tag: { label: "EDITOR'S PICK", bg: "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%))", icon: <Sparkles size={11} className="text-white" /> },
  },
  null,
];

function AccentBorder({ color, radius }: { color: string; radius: string }) {
  return (
    <>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "2.5px", zIndex: 3,
        pointerEvents: "none", borderRadius: radius,
        background: color,
        maskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 85%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 40%, transparent 85%)",
      }} />
      <div style={{
        position: "absolute", left: 0, top: 0, right: 0, height: "2.5px", zIndex: 3,
        pointerEvents: "none", borderRadius: radius,
        background: color,
        maskImage: "linear-gradient(to right, black 0%, black 30%, transparent 70%)",
        WebkitMaskImage: "linear-gradient(to right, black 0%, black 30%, transparent 70%)",
      }} />
    </>
  );
}

function AccentTag({ tag }: { tag: { label: string; bg: string; icon: React.ReactNode } }) {
  return (
    <span
      className="absolute top-4 left-4 text-[10px] font-bold tracking-wider pl-3 pr-4 py-1.5 flex items-center gap-1 shadow-lg z-10"
      style={{
        background: tag.bg, color: "white", letterSpacing: "0.08em",
        clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)",
        borderRadius: "4px 8px 8px 4px",
      }}
    >
      {tag.icon}
      {tag.label}
    </span>
  );
}

interface SpotlightCarouselProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

function VideoCard({
  property, videoSrc, overlayText, isActive, onTap, dateLabel, accent,
}: {
  property: Property; videoSrc: string; overlayText: string;
  isActive: boolean; onTap: () => void; dateLabel: string; accent: VideoAccent;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [saved, setSaved] = useState(false);
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
          height: "70vh", maxHeight: "580px",
          border: accent ? "none" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Fading accent border */}
        {accent && <div style={getAccentBorderStyle(accent.color, accent.side)} />}
        {/* Subtle glow overlay */}
        {accent && (
          <div
            className="absolute inset-0 z-[1] pointer-events-none rounded-[20px]"
            style={{ background: getGlowGradient(accent.color, accent.side) }}
          />
        )}

        <img
          src={property.images[0]} alt={property.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoReady ? 0 : 1, transition: "opacity 0.5s" }}
          loading="lazy"
        />
        {shouldLoad && (
          <video
            ref={videoRef} src={videoSrc} muted={muted} loop playsInline
            preload="metadata" onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.5s" }}
          />
        )}

        {/* Accent tag */}
        {accent?.tag && (
          <span
            className="absolute top-4 left-4 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10"
            style={{ background: accent.tag.bg, color: "white", letterSpacing: "0.08em" }}
          >
            {accent.tag.icon}
            {accent.tag.label}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-10"
          style={{ background: "rgba(60,60,60,0.7)" }}
        >
          {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-3xl font-bold italic text-white/70"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            {overlayText}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-primary mb-1">{dateLabel}</p>
              <h3 className="text-[20px] font-bold text-white leading-tight line-clamp-2">{property.name}</h3>
              <p className="text-[13px] text-white/60 mt-1">{property.location}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ml-3 shrink-0 active:scale-110 transition-transform"
              style={{ background: "rgba(60,60,60,0.7)" }}
            >
              <Bookmark size={18} className={saved ? "text-primary fill-primary" : "text-white"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpotlightCarousel({ properties, onPropertyTap }: SpotlightCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const topProperties = properties.slice(0, 6);
  const rafRef = useRef<number>(0);

  const dateLabels = useMemo(() =>
    topProperties.map((_, i) => {
      const d = new Date(Date.now() + (i + 1) * 86400000);
      return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + ", 7:00 PM";
    }), [topProperties.length]);

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
        {topProperties.map((p, i) => (
          <VideoCard key={p.id} property={p}
            videoSrc={spotlightVideos[i % spotlightVideos.length]}
            overlayText={overlayTexts[i % overlayTexts.length]}
            isActive={i === activeIndex} dateLabel={dateLabels[i]}
            accent={accentStyles[i % accentStyles.length]}
            onTap={() => onPropertyTap(p)} />
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {topProperties.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"}`} />
        ))}
      </div>
    </div>
  );
}
