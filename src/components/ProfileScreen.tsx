import { motion } from "framer-motion";
import {
  ChevronRight, Bell, Settings, HelpCircle, LogOut,
  Shield, Gift, Star, Sun, Moon, Monitor, BadgeCheck,
  CreditCard, Globe, Accessibility, FileText, Heart,
  MapPin, Camera, Award, Flame, Edit3
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import profileAvatar from "@/assets/profile-avatar.png";
import bannerImg from "@/assets/profile-banner-jeypore.jpg";
import pastTripsImg from "@/assets/past-trips-card.png";
import connectionsImg from "@/assets/connections-card.png";
import becomeHostImg from "@/assets/become-host.png";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

const themeOptions = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "Auto", icon: Monitor },
];

const achievements = [
  { emoji: "🔥", label: "Fire Starter", desc: "Attended 3 bonfires" },
  { emoji: "⭐", label: "Explorer", desc: "Visited 5 venues" },
  { emoji: "💎", label: "VIP Guest", desc: "Spent ₹10,000+" },
  { emoji: "📸", label: "Storyteller", desc: "Shared 10 photos" },
];

const settingsMenu = [
  { icon: Settings, label: "Account settings" },
  { icon: CreditCard, label: "Payments & payouts" },
  { icon: Shield, label: "Login & security" },
  { icon: Bell, label: "Notifications" },
  { icon: Globe, label: "Language & region" },
  { icon: Accessibility, label: "Accessibility" },
  { icon: Gift, label: "Refer a friend", sublabel: "Earn ₹200", badge: "NEW" },
  { icon: Star, label: "Loyalty points", sublabel: "320 pts" },
  { icon: HelpCircle, label: "Help centre" },
  { icon: FileText, label: "Terms & privacy" },
];

export default function ProfileScreen() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="pb-24 bg-mesh min-h-screen">
      {/* Scenic Banner with Avatar Overlay */}
      <div className="relative h-[200px] overflow-hidden">
        <motion.img
          src={bannerImg}
          alt="Jeypore"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />

        {/* Firefly particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3, height: 3,
              background: "hsla(55, 90%, 70%, 0.7)",
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 50}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}

        {/* Header buttons */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold text-white"
          >
            Profile
          </motion.h1>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "hsla(0,0%,100%,0.15)", backdropFilter: "blur(10px)" }}>
              <Edit3 size={16} className="text-white" />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "hsla(0,0%,100%,0.15)", backdropFilter: "blur(10px)" }}>
              <Bell size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Avatar overlapping banner */}
      <div className="px-5 -mt-14 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-5 shadow-xl"
        >
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary/40 glow-sm">
                <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <BadgeCheck size={14} className="text-primary-foreground" />
              </div>
              <button className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center">
                <Camera size={10} className="text-foreground" />
              </button>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-bold text-xl text-foreground">Akash</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin size={12} /> Jeypore, Odisha
              </p>
              <p className="text-xs text-muted-foreground mt-1">Member since 2024</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-around mt-5 pt-4 border-t border-border">
            {[
              { value: "5", label: "Trips", icon: "🗺️" },
              { value: "4.8", label: "Rating", icon: "⭐" },
              { value: "320", label: "Points", icon: "💎" },
              { value: "12", label: "Photos", icon: "📸" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <span className="text-lg mb-0.5">{stat.icon}</span>
                <span className="text-lg font-bold text-foreground">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <div className="px-5 mt-5">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Award size={16} className="text-primary" /> Achievements
        </h2>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="shrink-0 glass rounded-2xl p-3 w-[120px] text-center"
            >
              <span className="text-3xl block mb-1.5">{ach.emoji}</span>
              <p className="text-xs font-bold text-foreground">{ach.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{ach.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Memory Wall — Past Photos */}
      <div className="px-5 mt-5">
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Heart size={16} className="text-primary" /> Memory Wall
        </h2>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
          {[property1, property2, property3, property2, property1, property3].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.04 }}
              className={`overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500 cursor-pointer"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Two Cards Grid: Past Trips + Connections */}
      <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl glass p-4 cursor-pointer group"
        >
          <div className="h-24 flex items-center justify-center mb-2">
            <img src={pastTripsImg} alt="Past trips" className="h-full object-contain group-hover:scale-105 transition-transform" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Past trips</h4>
          <p className="text-[10px] text-muted-foreground">5 memories</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl glass p-4 cursor-pointer group relative"
        >
          <span className="absolute top-3 right-3 text-[9px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            NEW
          </span>
          <div className="h-24 flex items-center justify-center mb-2">
            <img src={connectionsImg} alt="Connections" className="h-full object-contain group-hover:scale-105 transition-transform" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Connections</h4>
          <p className="text-[10px] text-muted-foreground">8 friends</p>
        </motion.div>
      </div>

      {/* Loyalty Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mx-5 mt-5 glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-primary" />
            <h3 className="font-bold text-sm text-foreground">Loyalty Level</h3>
          </div>
          <span className="text-xs font-bold text-gradient px-2 py-0.5 rounded-full bg-primary/10">Silver</span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))" }}
            initial={{ width: "0%" }}
            animate={{ width: "64%" }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">320 / 500 points</span>
          <span className="text-[10px] text-primary font-medium">180 to Gold ✨</span>
        </div>
      </motion.div>

      {/* Become a Host Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="mx-5 mt-5 rounded-2xl overflow-hidden relative cursor-pointer group"
      >
        <img src={property3} alt="" className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 p-5 flex items-center gap-4">
          <img src={becomeHostImg} alt="Host" className="w-14 h-14 object-contain shrink-0" />
          <div>
            <h4 className="font-bold text-base text-white">Become a host</h4>
            <p className="text-xs text-white/70 mt-0.5">Earn up to ₹50,000/month</p>
          </div>
          <ChevronRight size={18} className="text-white/50 ml-auto" />
        </div>
      </motion.div>

      {/* Theme Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-5 mt-6"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Appearance</h3>
        <div className="rounded-2xl glass p-1.5 flex gap-1">
          {themeOptions.map((opt) => {
            const isActive = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="themeToggle"
                    className="absolute inset-0 bg-secondary rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <opt.icon size={16} />
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Settings Menu */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="mx-5 mt-5"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Settings</h3>
        <div className="glass rounded-2xl overflow-hidden">
          {settingsMenu.map((item, i) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3.5 py-3.5 px-4 text-left ${
                i < settingsMenu.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0">
                <item.icon size={16} className="text-foreground" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] text-foreground flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </span>
                {item.sublabel && (
                  <span className="text-[11px] text-muted-foreground">{item.sublabel}</span>
                )}
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Sign out */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mx-5 mt-6 mb-4">
        <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-destructive">
          <LogOut size={16} /> Log out
        </button>
      </motion.div>

      <p className="text-center text-[11px] text-muted-foreground pb-4">Hushh v1.0 · Made in Jeypore ❤️</p>
    </div>
  );
}
