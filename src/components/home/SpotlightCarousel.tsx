import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { VolumeX, Volume2, Bookmark } from "lucide-react";
import { type Property } from "@/data/properties";

interface SpotlightCarouselProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

export default function SpotlightCarousel({ properties, onPropertyTap }: SpotlightCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth * 0.85 + 12;
    setActiveIndex(Math.round(scrollLeft / cardWidth));
  };

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const topProperties = properties.slice(0, 6);

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {topProperties.map((p, i) => (
          <motion.div
            key={p.id}
            className="shrink-0 relative rounded-[20px] overflow-hidden cursor-pointer"
            style={{
              width: "85vw",
              maxWidth: "380px",
              height: "65vh",
              maxHeight: "520px",
              scrollSnapAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: i === activeIndex ? 1 : 0.7,
              transform: i === activeIndex ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.3s, transform 0.3s",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPropertyTap(p)}
          >
            {/* Image as fallback (since we don't have real videos) */}
            <img
              src={p.images[0]}
              alt={p.name}
              className="w-full h-full object-cover"
            />

            {/* Mute button placeholder */}
            <div
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{ background: "rgba(60,60,60,0.7)" }}
            >
              <VolumeX size={18} className="text-foreground" />
            </div>

            {/* Overlay text on image */}
            {i % 2 === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p
                  className="text-3xl font-bold italic text-white/80"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  {["feel the vibe", "under the stars", "into its groove"][i % 3]}
                </p>
              </div>
            )}

            {/* Bottom gradient overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-primary mb-1">
                    {new Date(Date.now() + i * 86400000).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}, 7:00 PM
                  </p>
                  <h3 className="text-[20px] font-bold text-white leading-tight line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-[13px] text-white/60 mt-1">{p.location}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 1.3 }}
                  onClick={(e) => toggleSave(e, p.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ml-3"
                  style={{ background: "rgba(60,60,60,0.7)" }}
                >
                  <Bookmark
                    size={18}
                    className={saved.has(p.id) ? "text-primary fill-primary" : "text-white"}
                  />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dot indicators */}
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
