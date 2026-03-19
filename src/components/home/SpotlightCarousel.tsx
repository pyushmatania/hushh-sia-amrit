import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { VolumeX, Volume2, Bookmark } from "lucide-react";
import { type Property } from "@/data/properties";

import videoBonfire from "@/assets/video-bonfire-night.mp4.asset.json";
import videoPool from "@/assets/video-pool-lights.mp4.asset.json";
import videoBbq from "@/assets/video-bbq-grill.mp4.asset.json";
import videoDj from "@/assets/video-dj-lights.mp4.asset.json";
import videoRooftop from "@/assets/video-rooftop-dinner.mp4.asset.json";
import videoPickleball from "@/assets/video-pickleball.mp4.asset.json";

const spotlightVideos = [
  videoBonfire.url,
  videoPool.url,
  videoBbq.url,
  videoDj.url,
  videoRooftop.url,
  videoPickleball.url,
];

const overlayTexts = ["feel the vibe", "dive in", "sizzle & smoke", "into its groove", "under the stars", "game on"];

interface SpotlightCarouselProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

function VideoCard({
  property,
  videoSrc,
  overlayText,
  isActive,
  onTap,
}: {
  property: Property;
  videoSrc: string;
  overlayText: string;
  isActive: boolean;
  onTap: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [saved, setSaved] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // IntersectionObserver for autoplay
  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    if (!video || !card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="spotlight-card shrink-0 relative rounded-[20px] overflow-hidden cursor-pointer will-change-transform"
      style={{
        width: "85vw",
        maxWidth: "380px",
        height: "70vh",
        maxHeight: "580px",
        scrollSnapAlign: "center",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: isActive ? 1 : 0.7,
        transform: isActive ? "scale(1)" : "scale(0.95)",
      }}
      onClick={onTap}
    >
      {/* Fallback image */}
      <img
        src={property.images[0]}
        alt={property.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: videoReady ? 0 : 1, transition: "opacity 0.5s" }}
      />

      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => setVideoReady(true)}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.5s" }}
      />

      {/* Mute toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-10"
        style={{ background: "rgba(60,60,60,0.7)" }}
      >
        {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
      </button>

      {/* Editorial overlay text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p
          className="text-3xl font-bold italic text-white/70"
          style={{
            fontFamily: "'Playfair Display', serif",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}
        >
          {overlayText}
        </p>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 p-5"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
      >
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-primary mb-1">
              {new Date(Date.now() + Math.random() * 604800000).toLocaleDateString("en-IN", {
                weekday: "short", day: "numeric", month: "short",
              })}, 7:00 PM
            </p>
            <h3 className="text-[20px] font-bold text-white leading-tight line-clamp-2">
              {property.name}
            </h3>
            <p className="text-[13px] text-white/60 mt-1">{property.location}</p>
          </div>
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ml-3 shrink-0"
            style={{ background: "rgba(60,60,60,0.7)" }}
          >
            <Bookmark size={18} className={saved ? "text-primary fill-primary" : "text-white"} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default function SpotlightCarousel({ properties, onPropertyTap }: SpotlightCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const topProperties = properties.slice(0, 6);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const cardWidth = el.firstElementChild?.getBoundingClientRect().width || 300;
    const gap = 12;
    setActiveIndex(Math.round(el.scrollLeft / (cardWidth + gap)));
  }, []);

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {topProperties.map((p, i) => (
          <VideoCard
            key={p.id}
            property={p}
            videoSrc={spotlightVideos[i % spotlightVideos.length]}
            overlayText={overlayTexts[i % overlayTexts.length]}
            isActive={i === activeIndex}
            onTap={() => onPropertyTap(p)}
          />
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {topProperties.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
