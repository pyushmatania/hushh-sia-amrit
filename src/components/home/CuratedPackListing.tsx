import { useRef, useState, useEffect } from "react";
import { Clock, ArrowRight, Sparkles, VolumeX, Volume2 } from "lucide-react";
import { hapticSelection } from "@/lib/haptics";
import type { ExperiencePack } from "@/components/home/CuratedPackCard";
import { AccentFrame, AccentTag } from "@/components/shared/AccentFrame";

// Pack images (fallback posters)
import packChillNight from "@/assets/pack-chill-night.webp";
import packRomanticNight from "@/assets/pack-romantic-night.webp";
import packPartyScene from "@/assets/pack-party-scene.webp";
import packBbqBonfire from "@/assets/pack-bbq-bonfire.webp";
import packMovieNight from "@/assets/pack-movie-night.webp";
import packGameNight from "@/assets/pack-game-night.webp";
import packWorkEscape from "@/assets/pack-work-escape.webp";
import packTeamWork from "@/assets/pack-team-work.webp";

// Unique generated videos per curation theme
import videoCurationChill from "@/assets/video-curation-chill.mp4.asset.json";
import videoCurationParty from "@/assets/video-curation-party.mp4.asset.json";
import videoCurationRomantic from "@/assets/video-curation-romantic.mp4.asset.json";
import videoCurationBbq from "@/assets/video-curation-bbq.mp4.asset.json";
import videoCurationMovie from "@/assets/video-curation-movie.mp4.asset.json";
import videoCurationGame from "@/assets/video-curation-game.mp4.asset.json";
import videoCurationWork from "@/assets/video-curation-work.mp4.asset.json";
import videoCurationTeam from "@/assets/video-curation-team.mp4.asset.json";
// New curation videos
import videoCurationSunsetWine from "@/assets/video-curation-sunset-wine.mp4.asset.json";
import videoCurationStargazing from "@/assets/video-curation-stargazing.mp4.asset.json";
import videoCurationProposal from "@/assets/video-curation-proposal.mp4.asset.json";
import videoCurationHoneymoon from "@/assets/video-curation-honeymoon.mp4.asset.json";
import videoCurationSundowner from "@/assets/video-curation-sundowner.mp4.asset.json";
import videoCurationHoli from "@/assets/video-curation-holi.mp4.asset.json";
import videoCurationCollegeReunion from "@/assets/video-curation-college-reunion.mp4.asset.json";
import videoCurationLadiesNight from "@/assets/video-curation-ladies-night.mp4.asset.json";
import videoCurationYoga from "@/assets/video-curation-yoga.mp4.asset.json";
import videoCurationDetox from "@/assets/video-curation-detox.mp4.asset.json";
import videoCurationSpa from "@/assets/video-curation-spa.mp4.asset.json";
import videoCurationPottery from "@/assets/video-curation-pottery.mp4.asset.json";
import videoCurationAnniversary from "@/assets/video-curation-anniversary.mp4.asset.json";
import videoCurationMehndi from "@/assets/video-curation-mehndi.mp4.asset.json";
import videoCurationBabyShower from "@/assets/video-curation-baby-shower.mp4.asset.json";
import videoCurationFarewell from "@/assets/video-curation-farewell.mp4.asset.json";
import videoCurationTribalThali from "@/assets/video-curation-tribal-thali.mp4.asset.json";
import videoCurationBbqMasterclass from "@/assets/video-curation-bbq-masterclass.mp4.asset.json";
import videoCurationPizzaMovie from "@/assets/video-curation-pizza-movie.mp4.asset.json";
import videoCurationFarmBreakfast from "@/assets/video-curation-farm-breakfast.mp4.asset.json";
import videoCurationDeepWork from "@/assets/video-curation-deep-work.mp4.asset.json";
import videoCurationBrainstorm from "@/assets/video-curation-brainstorm.mp4.asset.json";
import videoCurationSunriseHike from "@/assets/video-curation-sunrise-hike.mp4.asset.json";
import videoCurationCycling from "@/assets/video-curation-cycling.mp4.asset.json";
import videoCurationReading from "@/assets/video-curation-reading.mp4.asset.json";

const packMedia: Record<string, { poster: string; video: string }> = {
  // Original 8 DB UUIDs
  "afc5ded6-c6cf-45c7-bc3c-e9e9e8c939ac": { poster: packChillNight, video: videoCurationChill.url },
  "99e244ea-e3df-4674-8177-03533b906f49": { poster: packPartyScene, video: videoCurationParty.url },
  "12269e8f-5d2e-4406-87f9-359603ba474a": { poster: packRomanticNight, video: videoCurationRomantic.url },
  "990fd140-1ee6-41d4-bf95-7e0461ef7942": { poster: packBbqBonfire, video: videoCurationBbq.url },
  "d2f8cc4f-ae9a-4fab-83a6-1a803e273d38": { poster: packMovieNight, video: videoCurationMovie.url },
  "78e62799-1125-4db2-9e49-7527c7d02eb7": { poster: packGameNight, video: videoCurationGame.url },
  "96e01ca0-f198-4c1a-8b36-690d5e91d2e1": { poster: packWorkEscape, video: videoCurationWork.url },
  "3b9a0f7b-ba37-4a75-9ef7-897d11f4e8ff": { poster: packTeamWork, video: videoCurationTeam.url },
  // New 25 curations
  "56892cc3-1e6e-4115-8526-bb30f54fc0a8": { poster: packRomanticNight, video: videoCurationSunsetWine.url },
  "48b07927-4042-46e6-b662-68b89d5788e9": { poster: packChillNight, video: videoCurationStargazing.url },
  "a190b5ed-bd7f-4473-bb68-c0ca6e5ee48b": { poster: packRomanticNight, video: videoCurationProposal.url },
  "29a24212-5bb3-47c9-9afc-194bdb097f3d": { poster: packRomanticNight, video: videoCurationHoneymoon.url },
  "b57ebad6-0ab1-4868-a718-7a026907dfa9": { poster: packPartyScene, video: videoCurationSundowner.url },
  "02e0a874-f86c-48f0-9eba-729eb279899d": { poster: packPartyScene, video: videoCurationCollegeReunion.url },
  "5b5bf118-948a-4a6d-80a8-e594962ee927": { poster: packPartyScene, video: videoCurationHoli.url },
  "4c9e57ca-7cc4-4b44-9f0b-b6553fbd78b7": { poster: packPartyScene, video: videoCurationLadiesNight.url },
  "2a7dbb62-ffa4-4b75-a505-2037862d055e": { poster: packChillNight, video: videoCurationYoga.url },
  "e24468f4-1bc9-4898-aa8e-595778a06105": { poster: packChillNight, video: videoCurationDetox.url },
  "32c20d30-9f82-4911-b371-43b181814dfc": { poster: packChillNight, video: videoCurationSpa.url },
  "36be07ae-d02b-4d1b-b142-d266616eeac6": { poster: packChillNight, video: videoCurationReading.url },
  "04d93188-1bd4-4851-84f7-379a8adbbe0d": { poster: packBbqBonfire, video: videoCurationTribalThali.url },
  "ecd2cca3-8f2b-4e38-8867-112da1b1b13e": { poster: packBbqBonfire, video: videoCurationBbqMasterclass.url },
  "b086e9f3-f3a6-4531-9191-8cc26187e5ea": { poster: packMovieNight, video: videoCurationPizzaMovie.url },
  "5cb2cb1d-a204-45a4-b87a-3ff6457dbcb5": { poster: packBbqBonfire, video: videoCurationFarmBreakfast.url },
  "ff114a79-a69e-41a1-ad1c-0d3779970e1b": { poster: packWorkEscape, video: videoCurationDeepWork.url },
  "27a40efc-1fe3-4780-811b-e2e7beb11b85": { poster: packTeamWork, video: videoCurationBrainstorm.url },
  "8651c0eb-2b37-42ec-b115-c812626beb4c": { poster: packChillNight, video: videoCurationSunriseHike.url },
  "a35bf365-f267-4360-bdc7-4cd67899df5f": { poster: packChillNight, video: videoCurationPottery.url },
  "766cce59-2d45-4d2e-9776-6c2a1988e51e": { poster: packChillNight, video: videoCurationCycling.url },
  "43e6415d-db5c-4de9-8475-c37ad12b4d68": { poster: packPartyScene, video: videoCurationMehndi.url },
  "02b62760-41d5-479d-bf95-aeb990ec3e86": { poster: packPartyScene, video: videoCurationBabyShower.url },
  "bcbb0e06-9790-45ec-9881-700558443bcc": { poster: packBbqBonfire, video: videoCurationFarewell.url },
  "dd841c9f-5986-4c32-ac00-2198c0e09838": { poster: packRomanticNight, video: videoCurationAnniversary.url },
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
  // Original 8 DB UUIDs
  "afc5ded6-c6cf-45c7-bc3c-e9e9e8c939ac": accentPresets.chill,
  "99e244ea-e3df-4674-8177-03533b906f49": accentPresets.party,
  "12269e8f-5d2e-4406-87f9-359603ba474a": accentPresets.romantic,
  "990fd140-1ee6-41d4-bf95-7e0461ef7942": accentPresets.bbq,
  "d2f8cc4f-ae9a-4fab-83a6-1a803e273d38": accentPresets.movie,
  "78e62799-1125-4db2-9e49-7527c7d02eb7": accentPresets.game,
  "96e01ca0-f198-4c1a-8b36-690d5e91d2e1": accentPresets.work,
  "3b9a0f7b-ba37-4a75-9ef7-897d11f4e8ff": accentPresets.team,
  // New 25 curations
  "56892cc3-1e6e-4115-8526-bb30f54fc0a8": accentPresets.romantic,  // Sunset Wine
  "48b07927-4042-46e6-b662-68b89d5788e9": accentPresets.chill,     // Stargazing
  "a190b5ed-bd7f-4473-bb68-c0ca6e5ee48b": accentPresets.romantic,  // Proposal
  "29a24212-5bb3-47c9-9afc-194bdb097f3d": accentPresets.romantic,  // Honeymoon
  "b57ebad6-0ab1-4868-a718-7a026907dfa9": accentPresets.party,     // Sundowner
  "02e0a874-f86c-48f0-9eba-729eb279899d": accentPresets.party,     // College Reunion
  "5b5bf118-948a-4a6d-80a8-e594962ee927": accentPresets.party,     // Holi
  "4c9e57ca-7cc4-4b44-9f0b-b6553fbd78b7": accentPresets.party,     // Ladies Night
  "2a7dbb62-ffa4-4b75-a505-2037862d055e": accentPresets.chill,     // Yoga
  "e24468f4-1bc9-4898-aa8e-595778a06105": accentPresets.chill,     // Detox
  "32c20d30-9f82-4911-b371-43b181814dfc": accentPresets.chill,     // Spa
  "36be07ae-d02b-4d1b-b142-d266616eeac6": accentPresets.chill,     // Reading
  "04d93188-1bd4-4851-84f7-379a8adbbe0d": accentPresets.bbq,       // Tribal Thali
  "ecd2cca3-8f2b-4e38-8867-112da1b1b13e": accentPresets.bbq,       // BBQ Masterclass
  "b086e9f3-f3a6-4531-9191-8cc26187e5ea": accentPresets.movie,     // Pizza Movie
  "5cb2cb1d-a204-45a4-b87a-3ff6457dbcb5": accentPresets.bbq,       // Farm Breakfast
  "ff114a79-a69e-41a1-ad1c-0d3779970e1b": accentPresets.work,      // Deep Work
  "27a40efc-1fe3-4780-811b-e2e7beb11b85": accentPresets.team,      // Brainstorm
  "8651c0eb-2b37-42ec-b115-c812626beb4c": accentPresets.game,      // Sunrise Hike
  "a35bf365-f267-4360-bdc7-4cd67899df5f": accentPresets.chill,     // Pottery
  "766cce59-2d45-4d2e-9776-6c2a1988e51e": accentPresets.game,      // Cycling
  "43e6415d-db5c-4de9-8475-c37ad12b4d68": accentPresets.party,     // Mehndi
  "02b62760-41d5-479d-bf95-aeb990ec3e86": accentPresets.party,     // Baby Shower
  "bcbb0e06-9790-45ec-9881-700558443bcc": accentPresets.bbq,       // Farewell
  "dd841c9f-5986-4c32-ac00-2198c0e09838": accentPresets.romantic,  // Anniversary
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
  const [shouldLoad, setShouldLoad] = useState(index === 0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          if (videoRef.current) videoRef.current.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: [0, 0.1], rootMargin: "40px" }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="cursor-pointer px-5 md:px-0 group active:scale-[0.97] transition-transform select-none"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => { hapticSelection(); onTap(pack); }}
    >
      {/* Video area */}
      <div className="relative md:rounded-[20px] md:overflow-hidden md:hover:shadow-elevated md:transition-shadow h-[70vh] max-h-[520px] md:h-[60vh] md:max-h-[500px]">
        <div className="md:hidden"><AccentFrame color={accent.color} radius="20px" glowAlpha={0.08} /></div>
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
                loading={index === 0 ? "eager" : "lazy"}
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
              autoPlay
              loop
              playsInline
              preload={index === 0 ? "auto" : "none"}
              onCanPlay={() => setVideoReady(true)}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ opacity: videoReady ? 1 : 0, transition: "opacity 0.3s", filter: "blur(0.6px)" }}
            />
          )}

          {/* Accent tag - hide on desktop for cleaner look */}
          <AccentTag tag={accent.tag} className="absolute top-4 left-4 z-10 md:hidden" />

          {/* Mute toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
            className="absolute top-4 right-4 md:top-5 md:right-5 w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center z-10 md:hover:scale-110 md:transition-transform md:cursor-pointer md:opacity-0 md:group-hover:opacity-100"
            style={{ background: "hsl(var(--foreground) / 0.36)", backdropFilter: "blur(8px)" }}
          >
            {muted ? <VolumeX size={18} className="text-white md:w-4 md:h-4" /> : <Volume2 size={18} className="text-white md:w-4 md:h-4" />}
          </button>

          {/* Savings badge - hide on desktop, show inline in bottom on desktop */}
          {savings > 0 && (
            <div className="absolute top-4 right-16 md:hidden px-2.5 py-1 rounded-full z-10" style={{ background: "hsl(160 84% 39% / 0.9)" }}>
              <span className="text-[10px] font-bold text-white">Save ₹{savings}</span>
            </div>
          )}

          {/* Tagline - smaller on desktop */}
          <div className="absolute left-0 right-0 pointer-events-none px-5 md:px-6" style={{ bottom: "52%" }}>
            <p
              className="text-[15px] md:text-base font-bold italic text-white/80 leading-snug"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              {pack.tagline}
            </p>
          </div>

          {/* Bottom content */}
          <div
            className="absolute bottom-0 left-0 right-0 p-5 md:p-6"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.25) 70%, transparent 100%)" }}
          >
            <span className="text-3xl md:text-2xl">{pack.emoji}</span>
            <h3 className="text-[22px] md:text-xl font-extrabold text-white leading-tight mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>
              {pack.name}
            </h3>

            {/* Slot */}
            <div className="flex items-center gap-1.5 mt-2 md:mt-1.5">
              <Clock size={13} className="text-white/70 md:w-3.5 md:h-3.5" />
              <span className="text-[12px] md:text-xs text-white/80 font-semibold tracking-wide">{pack.slot}</span>
            </div>

            {/* Includes chips - show fewer on desktop */}
            <div className="flex flex-wrap gap-1.5 md:gap-1.5 mt-2.5 md:mt-2">
              {pack.includes.slice(0, 4).map((item, i) => (
                <span key={i} className="text-[10px] md:text-[10px] px-2.5 py-1 md:px-2 md:py-0.5 rounded-full text-white/90 font-medium border border-white/20 md:hidden" style={{ background: "hsl(var(--foreground) / 0.22)", backdropFilter: "blur(4px)" }}>
                  {item}
                </span>
              ))}
              {/* Desktop: show only 2 chips */}
              {pack.includes.slice(0, 2).map((item, i) => (
                <span key={`d-${i}`} className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full text-white/90 font-medium border border-white/15" style={{ background: "hsl(var(--foreground) / 0.18)" }}>
                  {item}
                </span>
              ))}
              {pack.includes.length > 4 && (
                <span className="text-[10px] px-2.5 py-1 rounded-full text-primary font-bold md:hidden" style={{ background: "hsl(var(--primary) / 0.25)" }}>
                  +{pack.includes.length - 4} more
                </span>
              )}
              {pack.includes.length > 2 && (
                <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full text-primary font-bold" style={{ background: "hsl(var(--primary) / 0.2)" }}>
                  +{pack.includes.length - 2} more
                </span>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between mt-3 md:mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-xl font-extrabold text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>₹{pack.price}</span>
                {pack.originalPrice && (
                  <span className="text-[12px] md:text-xs text-white/50 line-through font-medium">₹{pack.originalPrice}</span>
                )}
                {savings > 0 && (
                  <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "hsl(160 84% 39% / 0.85)" }}>
                    Save ₹{savings}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-5 py-2.5 md:px-4 md:py-2 rounded-full text-[13px] md:text-xs font-bold active:scale-95 transition-transform shadow-lg md:hover:bg-primary/90 md:cursor-pointer" style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.4)" }}>
                Book Now <ArrowRight size={13} className="md:w-3.5 md:h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
