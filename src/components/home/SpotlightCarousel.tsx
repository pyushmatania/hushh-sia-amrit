import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { VolumeX, Volume2, Bookmark, Flame, Zap, Sparkles } from "lucide-react";
import { type Property } from "@/data/properties";
import { AccentFrame, AccentTag } from "@/components/shared/AccentFrame";

// Home / generic
import videoBonfire from "@/assets/video-bonfire-night.mp4.asset.json";
import videoPool from "@/assets/video-pool-lights.mp4.asset.json";
import videoBbq from "@/assets/video-bbq-grill.mp4.asset.json";
import videoDj from "@/assets/video-dj-lights.mp4.asset.json";
import videoRooftop from "@/assets/video-rooftop-dinner.mp4.asset.json";
import videoPickleball from "@/assets/video-pickleball.mp4.asset.json";
// Stay
import videoVillaNight from "@/assets/video-villa-night.mp4.asset.json";
import videoFarmhouseDinner from "@/assets/video-farmhouse-dinner.mp4.asset.json";
import videoWorkPod from "@/assets/video-work-pod.mp4.asset.json";
import videoCoupleRetreat from "@/assets/video-couple-retreat.mp4.asset.json";
// Experience
import videoCandleDinner from "@/assets/video-candle-dinner.mp4.asset.json";
import videoBirthdayParty from "@/assets/video-birthday-party.mp4.asset.json";
import videoTribalDance from "@/assets/video-tribal-dance.mp4.asset.json";
import videoSportsAction from "@/assets/video-sports-action.mp4.asset.json";
import videoMovieNight from "@/assets/video-movie-night.mp4.asset.json";
// Service
import videoChefCooking from "@/assets/video-chef-cooking.mp4.asset.json";
import videoDecorSetup from "@/assets/video-decor-setup.mp4.asset.json";
import videoRideService from "@/assets/video-ride-service.mp4.asset.json";

// Category-specific video pools
const videosByCategory: Record<string, string[]> = {
  home: [videoBonfire.url, videoPool.url, videoBbq.url, videoDj.url, videoRooftop.url, videoPickleball.url],
  stay: [videoVillaNight.url, videoFarmhouseDinner.url, videoPool.url, videoCoupleRetreat.url, videoWorkPod.url, videoBonfire.url],
  experience: [videoCandleDinner.url, videoBirthdayParty.url, videoTribalDance.url, videoSportsAction.url, videoMovieNight.url, videoDj.url],
  service: [videoChefCooking.url, videoDecorSetup.url, videoRideService.url, videoDj.url, videoBbq.url, videoChefCooking.url],
  curation: [videoBonfire.url, videoCandleDinner.url, videoBirthdayParty.url, videoWorkPod.url, videoMovieNight.url, videoCoupleRetreat.url],
};

const overlaysByCategory: Record<string, string[]> = {
  home: ["feel the vibe", "dive in", "sizzle & smoke", "into its groove", "under the stars", "game on"],
  stay: ["your private escape", "farm to table", "chill by the pool", "just us two", "work in peace", "warmth awaits"],
  experience: ["romance redefined", "celebrate big", "tribal rhythms", "game on", "cinema magic", "drop the beat"],
  service: ["flavours on fire", "set the scene", "ride in style", "sound check", "smoky perfection", "taste the magic"],
  curation: ["after hours", "just us", "party mode", "focus time", "movie magic", "escape together"],
};

type VideoAccent = {
  color: string;
  tag: { label: string; bg: string; icon?: React.ReactNode };
};

const accentStyles: VideoAccent[] = [
  {
    color: "hsl(0 85% 55%)",
    tag: {
      label: "TONIGHT'S PICK",
      bg: "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 95% 55%))",
      icon: <Flame size={11} className="text-primary-foreground" />,
    },
  },
  {
    color: "hsl(var(--primary))",
    tag: {
      label: "CURATED",
      bg: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
      icon: <Sparkles size={11} className="text-primary-foreground" />,
    },
  },
  {
    color: "hsl(280 90% 60%)",
    tag: {
      label: "HUSHH LIVE",
      bg: "linear-gradient(135deg, hsl(280 90% 60%), hsl(200 90% 55%))",
      icon: <Zap size={11} className="text-primary-foreground" />,
    },
  },
  {
    color: "hsl(43 96% 56%)",
    tag: {
      label: "LIMITED SLOTS",
      bg: "linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 45%))",
      icon: <Sparkles size={11} className="text-primary-foreground" />,
    },
  },
  {
    color: "hsl(270 80% 65%)",
    tag: {
      label: "EDITOR'S PICK",
      bg: "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%))",
      icon: <Sparkles size={11} className="text-primary-foreground" />,
    },
  },
  {
    color: "hsl(var(--primary))",
    tag: {
      label: "TRENDING",
      bg: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
      icon: <Sparkles size={11} className="text-primary-foreground" />,
    },
  },
];

interface SpotlightCarouselProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
  category?: string;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
}

function VideoCard({
  property,
  videoSrc,
  overlayText,
  isActive,
  onTap,
  dateLabel,
  accent,
  isSaved,
  onToggleSave,
  isFirst,
}: {
  property: Property;
  videoSrc: string;
  overlayText: string;
  isActive: boolean;
  onTap: () => void;
  dateLabel: string;
  accent: VideoAccent;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  isFirst?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const saved = isSaved ?? false;
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(isFirst ?? false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          setShouldLoad(true);
          const video = videoRef.current;
          if (video) video.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          videoRef.current?.pause();
        }
      },
      { threshold: [0, 0.3], rootMargin: "100px" }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="shrink-0 cursor-pointer"
      style={{
        width: "85vw",
        maxWidth: "380px",
        scrollSnapAlign: "center",
        opacity: isActive ? 1 : 0.7,
        transform: isActive ? "scale(1)" : "scale(0.95)",
        transition: "opacity 0.3s, transform 0.3s",
      }}
      onClick={onTap}
    >
      <div className="relative" style={{ height: "70vh", maxHeight: "580px" }}>
        <AccentFrame color={accent.color} radius="20px" glowAlpha={0.08} />
        <div
          className="relative w-full h-full overflow-hidden rounded-[20px]"
          style={{ border: "1px solid hsl(var(--border) / 0.24)" }}
        >

        <img
          src={property.images[0]}
          alt={property.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoReady ? 0 : 1, transition: "opacity 0.5s" }}
          loading="lazy"
        />
        {shouldLoad && (
          <video
            ref={videoRef}
            src={videoSrc}
            muted={muted}
            autoPlay={isFirst}
            loop
            playsInline
            preload={isFirst ? "auto" : "none"}
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.5s" }}
          />
        )}

        <AccentTag tag={accent.tag} className="absolute top-4 left-4 z-10" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMuted(!muted);
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-10"
          style={{ background: "hsl(var(--foreground) / 0.36)" }}
        >
          {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            className="text-3xl font-bold italic text-white/70"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {overlayText}
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 p-5"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
        >
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-primary mb-1">{dateLabel}</p>
              <h3 className="text-[20px] font-bold text-white leading-tight line-clamp-2">{property.name}</h3>
              <p className="text-[13px] text-white/60 mt-1">{property.location}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave?.(property.id);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ml-3 shrink-0 active:scale-110 transition-transform"
              style={{ background: "hsl(var(--foreground) / 0.36)" }}
            >
              <Bookmark size={18} className={saved ? "text-primary fill-primary" : "text-white"} />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function SpotlightCarousel({ properties, onPropertyTap, category = "home", wishlist = [], onToggleWishlist }: SpotlightCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const topProperties = properties.slice(0, 6);
  const rafRef = useRef<number>(0);

  const videos = videosByCategory[category] || videosByCategory.home;
  const overlays = overlaysByCategory[category] || overlaysByCategory.home;

  const dateLabels = useMemo(
    () =>
      topProperties.map((_, i) => {
        const d = new Date(Date.now() + (i + 1) * 86400000);
        return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + ", 7:00 PM";
      }),
    [topProperties.length]
  );

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
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {topProperties.map((p, i) => (
          <VideoCard
            key={p.id}
            property={p}
            videoSrc={videos[i % videos.length]}
            overlayText={overlays[i % overlays.length]}
            isActive={i === activeIndex}
            dateLabel={dateLabels[i]}
            accent={accentStyles[i % accentStyles.length]}
            onTap={() => onPropertyTap(p)}
            isSaved={wishlist.includes(p.id)}
            onToggleSave={onToggleWishlist}
          />
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {topProperties.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
