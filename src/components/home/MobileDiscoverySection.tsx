/**
 * MobileDiscoverySection — A mixed-card discovery block for mobile only.
 * Contains: 5 vertical video cards (swipeable), 1 Cinematic game card,
 * 1 Polaroid tape card, 1 Stacked boarding pass (3 items).
 */
import { useRef, useState, useEffect, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Property } from "@/data/properties";
import PropertyCardCinematic from "./PropertyCardCinematic";
import PropertyCardPolaroid from "./PropertyCardPolaroid";
import PropertyCardStack from "./PropertyCardStack";
import { Star, ArrowRight, Clock, Flame, VolumeX, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

// ─── Video imports per category ───
import videoBonfire from "@/assets/video-bonfire-night.mp4.asset.json";
import videoPool from "@/assets/video-pool-lights.mp4.asset.json";
import videoBbq from "@/assets/video-bbq-grill.mp4.asset.json";
import videoDj from "@/assets/video-dj-lights.mp4.asset.json";
import videoRooftop from "@/assets/video-rooftop-dinner.mp4.asset.json";
import videoPickleball from "@/assets/video-pickleball.mp4.asset.json";
import videoVillaNight from "@/assets/video-villa-night.mp4.asset.json";
import videoFarmhouseDinner from "@/assets/video-farmhouse-dinner.mp4.asset.json";
import videoWorkPod from "@/assets/video-work-pod.mp4.asset.json";
import videoCoupleRetreat from "@/assets/video-couple-retreat.mp4.asset.json";
import videoCandleDinner from "@/assets/video-candle-dinner.mp4.asset.json";
import videoBirthdayParty from "@/assets/video-birthday-party.mp4.asset.json";
import videoTribalDance from "@/assets/video-tribal-dance.mp4.asset.json";
import videoSportsAction from "@/assets/video-sports-action.mp4.asset.json";
import videoMovieNight from "@/assets/video-movie-night.mp4.asset.json";
import videoChefCooking from "@/assets/video-chef-cooking.mp4.asset.json";
import videoDecorSetup from "@/assets/video-decor-setup.mp4.asset.json";
import videoRideService from "@/assets/video-ride-service.mp4.asset.json";
import videoCandlelight from "@/assets/video-candlelight.mp4.asset.json";
import videoChai from "@/assets/video-chai-pour.mp4.asset.json";
import videoTribalThali from "@/assets/video-tribal-thali.mp4.asset.json";
// Curation videos
import videoCurationChill from "@/assets/video-curation-chill.mp4.asset.json";
import videoCurationParty from "@/assets/video-curation-party.mp4.asset.json";
import videoCurationRomantic from "@/assets/video-curation-romantic.mp4.asset.json";
import videoCurationBbq from "@/assets/video-curation-bbq.mp4.asset.json";
import videoCurationSpa from "@/assets/video-curation-spa.mp4.asset.json";
import videoCurationYoga from "@/assets/video-curation-yoga.mp4.asset.json";
import videoCurationStargazing from "@/assets/video-curation-stargazing.mp4.asset.json";
import videoCurationSundowner from "@/assets/video-curation-sundowner.mp4.asset.json";
import videoCurationMovie from "@/assets/video-curation-movie.mp4.asset.json";
import videoCurationGame from "@/assets/video-curation-game.mp4.asset.json";
import videoCurationTeam from "@/assets/video-curation-team.mp4.asset.json";
import videoCurationWork from "@/assets/video-curation-work.mp4.asset.json";

// 10 unique videos per category (section1 = first 5, section2 = last 5)
const discoveryVideos: Record<string, string[]> = {
  home: [
    videoBonfire.url, videoPool.url, videoBbq.url, videoDj.url, videoRooftop.url,
    videoCandleDinner.url, videoTribalDance.url, videoPickleball.url, videoChefCooking.url, videoCandlelight.url,
  ],
  stay: [
    videoVillaNight.url, videoFarmhouseDinner.url, videoPool.url, videoCoupleRetreat.url, videoWorkPod.url,
    videoBonfire.url, videoRooftop.url, videoCandlelight.url, videoChai.url, videoTribalThali.url,
  ],
  experience: [
    videoCandleDinner.url, videoBirthdayParty.url, videoTribalDance.url, videoSportsAction.url, videoMovieNight.url,
    videoDj.url, videoPickleball.url, videoBbq.url, videoBonfire.url, videoRooftop.url,
  ],
  service: [
    videoChefCooking.url, videoDecorSetup.url, videoRideService.url, videoDj.url, videoBbq.url,
    videoCandlelight.url, videoChai.url, videoTribalThali.url, videoRooftop.url, videoFarmhouseDinner.url,
  ],
  curation: [
    videoCurationChill.url, videoCurationParty.url, videoCurationRomantic.url, videoCurationBbq.url, videoCurationSpa.url,
    videoCurationYoga.url, videoCurationStargazing.url, videoCurationSundowner.url, videoCurationMovie.url, videoCurationGame.url,
  ],
};

const discoveryOverlays: Record<string, string[]> = {
  home: ["feel the vibe", "dive in", "sizzle & smoke", "drop the beat", "under the stars", "candlelit magic", "tribal rhythms", "game on", "chef's table", "golden hour"],
  stay: ["your private escape", "farm to table", "chill by the pool", "just us two", "work in peace", "warmth awaits", "sky high", "glow up", "tea time", "tribal feast"],
  experience: ["romance redefined", "celebrate big", "tribal rhythms", "game on", "cinema magic", "drop the beat", "rally mode", "smoky nights", "bonfire glow", "starlit dining"],
  service: ["flavours on fire", "set the scene", "ride in style", "sound check", "smoky perfection", "glow hour", "chai ritual", "tribal feast", "sky dining", "farm vibes"],
  curation: ["chill mode", "party on", "love story", "bbq vibes", "spa day", "zen flow", "star gazing", "sundowner", "movie magic", "game night"],
};

interface MobileDiscoverySectionProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
  wishlist?: string[];
  onToggleWishlist?: (id: string) => void;
  sectionTitle: string;
  sectionEmoji: string;
  offset?: number;
  category?: string;
}

/* ─── Vertical Video Card with real video background ─── */
const VerticalVideoCard = memo(function VerticalVideoCard({
  property, onTap, index, videoSrc, overlayText,
}: {
  property: Property; onTap: (p: Property) => void; index: number; videoSrc: string; overlayText: string;
}) {
  const cheapest = Math.min(...property.slots.filter(s => s.available).map(s => s.price));
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting) videoRef.current?.pause();
      },
      { threshold: 0.3, rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVisible) return;
    v.play().catch(() => {});
    return () => { v.pause(); };
  }, [isVisible]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={() => onTap(property)}
      className="shrink-0 w-[160px] cursor-pointer active:scale-[0.95] transition-transform select-none"
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          height: 240,
          border: "1px solid hsl(var(--border) / 0.2)",
          boxShadow: "0 6px 24px hsl(var(--foreground) / 0.08)",
        }}
      >
        {/* Fallback image */}
        <img
          src={property.images[0]}
          alt={property.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Video layer */}
        {isVisible && (
          <video
            ref={videoRef}
            src={videoSrc}
            muted={muted}
            loop
            playsInline
            preload="none"
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 w-full h-full object-cover z-[1] pointer-events-none"
            style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.4s", filter: "blur(0.4px)" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-[2]" />

        {/* Mute toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: "hsl(var(--foreground) / 0.5)" }}
        >
          {muted ? <VolumeX size={10} className="text-white/80" /> : <Volume2 size={10} className="text-white/80" />}
        </button>

        {/* Top badges */}
        {property.slotsLeft > 0 && property.slotsLeft <= 3 && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full z-10" style={{ background: "hsl(0 80% 50% / 0.85)" }}>
            <Flame size={8} className="text-white" />
            <span className="text-[7px] font-bold text-white">{property.slotsLeft} LEFT</span>
          </div>
        )}

        {/* Overlay text */}
        <div className="absolute z-[3] left-0 right-0 flex items-end pointer-events-none" style={{ bottom: "42%" }}>
          <p className="text-[14px] font-black italic text-white/85 leading-tight px-2.5"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >{overlayText}</p>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-[3]">
          <h4 className="text-[11px] font-bold text-white leading-tight line-clamp-2">{property.name}</h4>
          <div className="flex items-center gap-1 mt-1">
            <Star size={8} className="fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-bold text-white">{property.rating}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[13px] font-bold text-white">₹{cheapest.toLocaleString()}<span className="text-[8px] text-white/40">+</span></span>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.8)" }}>
              <ArrowRight size={9} className="text-primary-foreground" />
            </div>
          </div>
        </div>
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] z-[4]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(280 80% 60%), transparent)" }} />
      </div>
    </motion.div>
  );
});

export default function MobileDiscoverySection({
  properties,
  onPropertyTap,
  wishlist = [],
  onToggleWishlist,
  sectionTitle,
  sectionEmoji,
  offset = 0,
  category = "home",
}: MobileDiscoverySectionProps) {
  const isMobile = useIsMobile();
  if (!isMobile || properties.length < 5) return null;

  const safeIdx = (i: number) => (offset + i) % properties.length;
  const videoCards = Array.from({ length: 5 }, (_, i) => properties[safeIdx(i)]);
  const gameCardProp = properties[safeIdx(5)];
  const polaroidProp = properties[safeIdx(6)];
  const stackProps = [properties[safeIdx(7)], properties[safeIdx(8)], properties[safeIdx(9)]].filter(Boolean);

  // Pick videos: use offset to select section1 (0-4) or section2 (5-9)
  const catVideos = discoveryVideos[category] || discoveryVideos.home;
  const catOverlays = discoveryOverlays[category] || discoveryOverlays.home;
  const videoOffset = offset >= 5 ? 5 : 0;

  return (
    <div className="mt-6 space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4">
        <span className="text-lg">{sectionEmoji}</span>
        <h2 className="text-base font-bold text-foreground">{sectionTitle}</h2>
      </div>

      {/* 1. Vertical video cards — swipeable row */}
      <div
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {videoCards.map((p, i) => (
          <VerticalVideoCard
            key={`vc-${p.id}-${i}`}
            property={p}
            onTap={onPropertyTap}
            index={i}
            videoSrc={catVideos[(videoOffset + i) % catVideos.length]}
            overlayText={catOverlays[(videoOffset + i) % catOverlays.length]}
          />
        ))}
      </div>

      {/* 2. Cinematic Game Card */}
      {gameCardProp && (
        <div className="px-2">
          <PropertyCardCinematic
            property={gameCardProp}
            index={offset}
            onTap={onPropertyTap}
            isWishlisted={wishlist.includes(gameCardProp.id)}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      )}

      {/* 3. Polaroid Tape Card */}
      {polaroidProp && (
        <div className="py-2">
          <PropertyCardPolaroid
            property={polaroidProp}
            index={offset + 1}
            onTap={onPropertyTap}
            isWishlisted={wishlist.includes(polaroidProp.id)}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      )}

      {/* 4. Stacked Boarding Pass (3 items) */}
      {stackProps.length >= 2 && (
        <div className="px-2">
          <PropertyCardStack
            properties={stackProps}
            startIndex={offset + 2}
            onTap={onPropertyTap}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      )}
    </div>
  );
}
