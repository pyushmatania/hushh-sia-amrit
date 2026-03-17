import { motion } from "framer-motion";
import {
  ChevronRight, Bell, Settings, HelpCircle, LogOut,
  Shield, Gift, Star, Sun, Moon, Monitor, BadgeCheck,
  CreditCard, Globe, Accessibility, FileText, Heart
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import profileAvatar from "@/assets/profile-avatar.png";
import pastTripsImg from "@/assets/past-trips-card.png";
import connectionsImg from "@/assets/connections-card.png";
import becomeHostImg from "@/assets/become-host.png";

const themeOptions = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "Auto", icon: Monitor },
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
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-1 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[28px] font-bold text-foreground"
        >
          Profile
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center shadow-sm"
        >
          <Bell size={20} className="text-foreground" />
        </motion.button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-5 rounded-3xl bg-card border border-border shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6"
      >
        <div className="flex items-start gap-5">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-border">
                <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                <BadgeCheck size={16} className="text-primary-foreground" />
              </div>
            </div>
            <h3 className="font-bold text-xl text-foreground mt-3">Akash</h3>
            <p className="text-sm text-muted-foreground">Jeypore, India</p>
          </div>

          {/* Stats */}
          <div className="flex-1 flex flex-col justify-center gap-3 pl-2 pt-1">
            <div className="border-b border-border pb-3">
              <span className="text-2xl font-bold text-foreground block leading-tight">5</span>
              <span className="text-xs text-muted-foreground font-medium">Trips</span>
            </div>
            <div className="border-b border-border pb-3">
              <span className="text-2xl font-bold text-foreground block leading-tight">4</span>
              <span className="text-xs text-muted-foreground font-medium">Reviews</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block leading-tight">1</span>
              <span className="text-xs text-muted-foreground font-medium">Year on Hushh</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two Cards Grid: Past Trips + Connections */}
      <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card border border-border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="h-28 flex items-center justify-center mb-2">
            <img src={pastTripsImg} alt="Past trips" className="h-full object-contain" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Past trips</h4>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow relative"
        >
          <span className="absolute top-3 right-3 text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            NEW
          </span>
          <div className="h-28 flex items-center justify-center mb-2">
            <img src={connectionsImg} alt="Connections" className="h-full object-contain" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Connections</h4>
        </motion.div>
      </div>

      {/* Become a Host Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-5 mt-4 rounded-2xl bg-card border border-border shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        <img src={becomeHostImg} alt="Become a host" className="w-16 h-16 object-contain shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-base text-foreground">Become a host</h4>
          <p className="text-sm text-muted-foreground mt-0.5">It's easy to start hosting and earn extra income.</p>
        </div>
      </motion.div>

      {/* Theme Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="mx-5 mt-5"
      >
        <div className="rounded-2xl border border-border p-1.5 flex gap-1">
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
        transition={{ delay: 0.3 }}
        className="mx-5 mt-5"
      >
        {settingsMenu.map((item, i) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3.5 py-4 text-left ${
              i < settingsMenu.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <item.icon size={22} className="text-foreground shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <span className="text-[15px] text-foreground flex items-center gap-2">
                {item.label}
                {item.badge && (
                  <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </span>
              {item.sublabel && (
                <span className="text-xs text-muted-foreground">{item.sublabel}</span>
              )}
            </div>
            <ChevronRight size={18} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </motion.div>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-5 mt-4 mb-4"
      >
        <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground underline underline-offset-4">
          <LogOut size={16} /> Log out
        </button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-[11px] text-muted-foreground pb-4">Hushh v1.0 · Made in Jeypore ❤️</p>
    </div>
  );
}
