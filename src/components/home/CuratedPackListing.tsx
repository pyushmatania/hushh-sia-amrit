import { useRef, useState, useEffect } from "react";
import { Clock, ArrowRight, Sparkles, VolumeX, Volume2 } from "lucide-react";
import { hapticSelection } from "@/lib/haptics";
import type { ExperiencePack } from "@/components/home/CuratedPackCard";
import { AccentFrame, AccentTag } from "@/components/shared/AccentFrame";

// Pack images (fallback posters)
import packChillNight from "@/assets/pack-chill-night.jpg";
import packRomanticNight from "@/assets/pack-romantic-night.jpg";
import packPartyScene from "@/assets/pack-party-scene.jpg";
import packBbqBonfire from "@/assets/pack-bbq-bonfire.jpg";
import packMovieNight from "@/assets/pack-movie-night.jpg";
import packGameNight from "@/assets/pack-game-night.jpg";
import packWorkEscape from "@/assets/pack-work-escape.jpg";
import packTeamWork from "@/assets/pack-team-work.jpg";

// Unique generated videos per curation theme
import videoCurationChill from "@/assets/video-curation-chill.mp4.asset.json";
import videoCurationParty from "@/assets/video-curation-party.mp4.asset.json";
import videoCurationRomantic from "@/assets/video-curation-romantic.mp4.asset.json";
import videoCurationBbq from "@/assets/video-curation-bbq.mp4.asset.json";
import videoCurationMovie from "@/assets/video-curation-movie.mp4.asset.json";
import videoCurationGame from "@/assets/video-curation-game.mp4.asset.json";
import videoCurationWork from "@/assets/video-curation-work.mp4.asset.json";
import videoCurationTeam from "@/assets/video-curation-team.mp4.asset.json";

const packMedia: Record<string, { poster: string; video: string }> = {
  // DB UUIDs
  "afc5ded6-c6cf-45c7-bc3c-e9e9e8c939ac": { poster: packChillNight, video: videoCurationChill.url },
  "99e244ea-e3df-4674-8177-03533b906f49": { poster: packPartyScene, video: videoCurationParty.url },
  "12269e8f-5d2e-4406-87f9-359603ba474a": { poster: packRomanticNight, video: videoCurationRomantic.url },
  "990fd140-1ee6-41d4-bf95-7e0461ef7942": { poster: packBbqBonfire, video: videoCurationBbq.url },
  "d2f8cc4f-ae9a-4fab-83a6-1a803e273d38": { poster: packMovieNight, video: videoCurationMovie.url },
  "78e62799-1125-4db2-9e49-7527c7d02eb7": { poster: packGameNight, video: videoCurationGame.url },
  "96e01ca0-f198-4c1a-8b36-690d5e91d2e1": { poster: packWorkEscape, video: videoCurationWork.url },
  "3b9a0f7b-ba37-4a75-9ef7-897d11f4e8ff": { poster: packTeamWork, video: videoCurationTeam.url },
  // Legacy static IDs
  "ep-1": { poster: packChillNight, video: videoCurationChill.url },
  "ep-2": { poster: packRomanticNight, video: videoCurationRomantic.url },
  "ep-3": { poster: packPartyScene, video: videoCurationParty.url },
  "ep-4": { poster: packBbqBonfire, video: videoCurationBbq.url },
  "ep-5": { poster: packMovieNight, video: videoCurationMovie.url },
  "ep-6": { poster: packGameNight, video: videoCurationGame.url },
  "ep-7": { poster: packWorkEscape, video: videoCurationWork.url },
  "ep-8": { poster: packTeamWork, video: videoCurationTeam.url },
};

// Accent config helper
const accentDef = (color: string, label: string, bg: string, icon?: React.ReactNode) => ({ color, tag: { label, bg, icon } });

const accentPresets = {
  chill: accentDef("hsl(270 80% 65%)", "🔥 POPULAR", "linear-gradient(135deg, hsl(270 80% 65%), hsl(320 80% 60%))", <Sparkles size={11} className="text-primary-foreground" />),
  romantic: accentDef("hsl(340 75% 55%)", "💕 #1 PICK", "linear-gradient(135deg, hsl(340 75% 55%), hsl(320 80% 60%))", <Sparkles size={11} className="text-primary-foreground" />),
  party: accentDef("hsl(35 95% 55%)", "🎉 TRENDING", "linear-gradient(135deg, hsl(35 95% 50%), hsl(15 90% 50%))", <Sparkles size={11} className="text-primary-foreground" />),
  bbq: accentDef("hsl(0 85% 55%)", "🔥 HOT", "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 95% 55%))"),
  movie: accentDef("hsl(280 90% 60%)", "🎬 CINEMA", "linear-gradient(135deg, hsl(280 90% 60%), hsl(260 80% 55%))"),
  game: accentDef("hsl(150 80% 45%)", "🎮 FUN", "linear-gradient(135deg, hsl(150 80% 45%), hsl(170 75% 40%))"),
  work: accentDef("hsl(190 80% 50%)", "💸 BEST VALUE", "linear-gradient(135deg, hsl(190 80% 50%), hsl(210 80% 50%))", <Sparkles size={11} className="text-primary-foreground" />),
  team: accentDef("hsl(220 75% 55%)", "👥 TEAM", "linear-gradient(135deg, hsl(220 75% 55%), hsl(250 70% 55%))"),
};

const packAccents: Record<string, typeof accentPresets.chill> = {
  // DB UUIDs
  "afc5ded6-c6cf-45c7-bc3c-e9e9e8c939ac": accentPresets.chill,
  "99e244ea-e3df-4674-8177-03533b906f49": accentPresets.party,
  "12269e8f-5d2e-4406-87f9-359603ba474a": accentPresets.romantic,
  "990fd140-1ee6-41d4-bf95-7e0461ef7942": accentPresets.bbq,
  "d2f8cc4f-ae9a-4fab-83a6-1a803e273d38": accentPresets.movie,
  "78e62799-1125-4db2-9e49-7527c7d02eb7": accentPresets.game,
  "96e01ca0-f198-4c1a-8b36-690d5e91d2e1": accentPresets.work,
  "3b9a0f7b-ba37-4a75-9ef7-897d11f4e8ff": accentPresets.team,
  // Legacy
  "ep-1": accentPresets.chill,
  "ep-2": accentPresets.romantic,
  "ep-3": accentPresets.party,
  "ep-4": accentPresets.bbq,
  "ep-5": accentPresets.movie,
  "ep-6": accentPresets.game,
  "ep-7": accentPresets.work,
  "ep-8": accentPresets.team,
};

const defaultAccent = {
  color: "hsl(var(--primary))",
  tag: { label: "✨ CURATED", bg: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", icon: <Sparkles size={11} className="text-primary-foreground" /> },
};

interface CuratedPackListingProps {
  pack: ExperiencePack;
  index: number;
  onTap: (pack: ExperiencePack) => void;
}

export default function CuratedPackListing({ pack, index, onTap }: CuratedPackListingProps) {
  const savings = pack.originalPrice ? pack.originalPrice - pack.price : 0;
  const media = packMedia[pack.id] || { poster: packChillNight, video: videoCurationChill.url };
  const accent = packAccents[pack.id] || defaultAccent;

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
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setShouldLoad(true);
          if (videoRef.current) videoRef.current.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          videoRef.current?.pause();
        }
      },
      { threshold: [0, 0.2], rootMargin: "150px" }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="cursor-pointer px-5 group active:scale-[0.97] transition-transform"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => { hapticSelection(); onTap(pack); }}
    >
      {/* Video area — tall like stay listings */}
      <div className="relative" style={{ height: "70vh", maxHeight: "520px" }}>
        <AccentFrame color={accent.color} radius="20px" glowAlpha={0.08} />
        <div
          className="relative w-full h-full overflow-hidden rounded-[20px]"
          style={{ border: "1px solid hsl(var(--border) / 0.24)" }}
        >
          {/* Poster + buffer shimmer */}
          {!videoReady && (
            <div className="absolute inset-0 z-[2] pointer-events-none">
              <img
                src={media.poster}
                alt={pack.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading={index < 2 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 video-buffer-shimmer" />
            </div>
          )}

          {/* Autoplay video */}
          {shouldLoad && (
            <video
              ref={videoRef}
              src={media.video}
              muted={muted}
              loop
              playsInline
              preload="none"
              onCanPlay={() => setVideoReady(true)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.3s" }}
            />
          )}

          {/* Accent tag */}
          <AccentTag tag={accent.tag} className="absolute top-4 left-4 z-10" />

          {/* Mute toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "hsl(var(--foreground) / 0.36)", backdropFilter: "blur(8px)" }}
          >
            {muted ? <VolumeX size={18} className="text-white" /> : <Volume2 size={18} className="text-white" />}
          </button>

          {/* Savings badge */}
          {savings > 0 && (
            <div className="absolute top-4 right-16 px-2.5 py-1 rounded-full z-10" style={{ background: "hsl(160 84% 39% / 0.9)" }}>
              <span className="text-[10px] font-bold text-white">Save ₹{savings}</span>
            </div>
          )}

          {/* Overlay text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p
              className="text-3xl font-bold italic text-white/60"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
            >
              {pack.tagline}
            </p>
          </div>

          {/* Bottom content */}
          <div
            className="absolute bottom-0 left-0 right-0 p-5"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)" }}
          >
            <span className="text-3xl">{pack.emoji}</span>
            <h3 className="text-[20px] font-bold text-white leading-tight mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {pack.name}
            </h3>

            {/* Slot */}
            <div className="flex items-center gap-1.5 mt-2">
              <Clock size={12} className="text-white/50" />
              <span className="text-[11px] text-white/60 font-medium">{pack.slot}</span>
            </div>

            {/* Includes chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {pack.includes.slice(0, 4).map((item, i) => (
                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full text-white/80 border border-white/15" style={{ background: "hsl(var(--foreground) / 0.15)" }}>
                  {item}
                </span>
              ))}
              {pack.includes.length > 4 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full text-primary font-medium" style={{ background: "hsl(var(--primary) / 0.2)" }}>
                  +{pack.includes.length - 4} more
                </span>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-white">₹{pack.price}</span>
                {pack.originalPrice && (
                  <span className="text-[11px] text-white/40 line-through">₹{pack.originalPrice}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform">
                Book Now <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
