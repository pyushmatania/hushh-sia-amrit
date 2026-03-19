import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { VolumeX, Bookmark } from "lucide-react";
import { type Property } from "@/data/properties";

interface FoodieCarouselProps {
  properties: Property[];
  onPropertyTap: (property: Property) => void;
}

const foodieOverlays = [
  "taste the tradition",
  "sizzle & spice",
  "rustic flavors",
  "farm to fire",
];

export default function FoodieCarousel({ properties, onPropertyTap }: FoodieCarouselProps) {
  const diningProps = properties.filter((p) => p.category.includes("dining")).slice(0, 5);
  // If not enough dining, fill with others
  const items = diningProps.length >= 3 ? diningProps : properties.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth * 0.85 + 12;
    setActiveIndex(Math.round(scrollLeft / cardWidth));
  };

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((p, i) => (
          <motion.div
            key={p.id}
            className="shrink-0 relative rounded-[20px] overflow-hidden cursor-pointer"
            style={{
              width: "85vw",
              maxWidth: "380px",
              height: "55vh",
              maxHeight: "440px",
              scrollSnapAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: i === activeIndex ? 1 : 0.7,
              transform: i === activeIndex ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.3s, transform 0.3s",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPropertyTap(p)}
          >
            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />

            <div
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
              style={{ background: "rgba(60,60,60,0.7)" }}
            >
              <VolumeX size={18} className="text-foreground" />
            </div>

            {/* Overlaid text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p
                className="text-3xl font-bold italic text-white/70"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  textShadow: "0 2px 20px rgba(0,0,0,0.6)",
                }}
              >
                {foodieOverlays[i % foodieOverlays.length]}
              </p>
            </div>

            <div
              className="absolute bottom-0 left-0 right-0 p-5"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-[13px] text-white/60 mt-1">{p.description}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md ml-3"
                  style={{ background: "rgba(60,60,60,0.7)" }}
                >
                  <Bookmark size={18} className="text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
