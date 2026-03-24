import { useState, memo, useCallback } from "react";
import iconHome from "@/assets/icon-home.webp";
import iconStays from "@/assets/icon-stays-new.webp";
import iconExperiences from "@/assets/icon-experiences-new.webp";
import iconServices from "@/assets/icon-services-new.webp";
import iconCurations from "@/assets/icon-curations.webp";

interface Category {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

const categories: Category[] = [
  { id: "home", label: "Home", icon: iconHome },
  { id: "stay", label: "Stays", icon: iconStays },
  { id: "experience", label: "Experiences", icon: iconExperiences },
  { id: "service", label: "Services", icon: iconServices },
  { id: "curation", label: "Curations", icon: iconCurations, badge: "🔥" },
];

const AnimatedIcon = memo(function AnimatedIcon({ cat, isActive }: { cat: Category; isActive: boolean }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-14 h-14">
      {!loaded && (
        <div className="absolute inset-0 rounded-xl bg-secondary overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
        </div>
      )}
      <img
        src={cat.icon}
        alt={cat.label}
        className={`w-14 h-14 object-contain category-icon ${isActive ? "category-icon-active" : ""}`}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        width={56}
        height={56}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? (isActive ? 1 : 0.85) : 0 }}
      />
    </div>
  );
});

interface CategoryBarProps {
  active: string;
  onChange: (id: string) => void;
}

export default memo(function CategoryBar({ active, onChange }: CategoryBarProps) {
  const handleClick = useCallback((id: string) => onChange(id), [onChange]);

  return (
    <div className="flex justify-around px-0 md:justify-center md:gap-6 lg:gap-8">
      {categories.map((cat) => {
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className="relative flex flex-col items-center gap-1 px-1.5 pt-2 pb-2.5 shrink-0 group min-w-0 flex-1 md:flex-none md:px-4 md:rounded-xl md:hover:bg-muted/50 md:transition-colors md:cursor-pointer"
          >
            <div className="relative h-14 flex items-center justify-center">
              <AnimatedIcon cat={cat} isActive={isActive} />
              {cat.badge && (
                <span className="absolute -top-0.5 -right-1 text-[9px] leading-none">
                  {cat.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] md:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/70"
            }`}>
              {cat.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full cat-underline glow-radiate"
                style={{ background: "hsl(var(--primary))" }} />
            )}
          </button>
        );
      })}
    </div>
  );
});
