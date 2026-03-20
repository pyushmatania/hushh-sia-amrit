import { motion, AnimatePresence } from "framer-motion";
import PublicProfileScreen from "./PublicProfileScreen";
import {
  ChevronRight, Bell, Settings, HelpCircle, LogOut,
  Shield, Gift, Star, Sun, Moon, Monitor, BadgeCheck,
  CreditCard, Globe, Accessibility, FileText, Heart,
  Award, Zap, Calendar, TrendingUp, Crown, Pencil, LogIn
} from "lucide-react";
import { useState, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import AuthScreen from "./AuthScreen";
import profileAvatar from "@/assets/profile-avatar.png";
import pastTripsImg from "@/assets/past-trips-card.png";
import connectionsImg from "@/assets/connections-card.png";
import becomeHostImg from "@/assets/become-host.png";
import EditProfileSheet from "./EditProfileSheet";
import SettingsSheet from "./SettingsSheet";
import LoyaltyScreen from "./LoyaltyScreen";
import ReferralScreen from "./ReferralScreen";

const themeOptions = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "Auto", icon: Monitor },
];

const settingsMenu = [
  { icon: Settings, label: "Account settings", settingKey: "" },
  { icon: CreditCard, label: "Payments & payouts", settingKey: "" },
  { icon: Shield, label: "Login & security", settingKey: "security" },
  { icon: Bell, label: "Notifications", settingKey: "notifications" },
  { icon: Globe, label: "Language & region", settingKey: "language" },
  { icon: Accessibility, label: "Accessibility", settingKey: "accessibility" },
  { icon: Gift, label: "Refer a friend", sublabel: "Earn ₹200", badge: "NEW", settingKey: "" },
  { icon: Star, label: "Loyalty points", sublabel: "320 pts", settingKey: "" },
  { icon: HelpCircle, label: "Help centre", settingKey: "" },
  { icon: FileText, label: "Terms & privacy", settingKey: "" },
];

const achievements = [
  { icon: "🔥", title: "Early Adopter", description: "Joined in the first 100 users" },
  { icon: "⭐", title: "5-Star Guest", description: "Maintained perfect rating" },
  { icon: "🎉", title: "Party Starter", description: "Booked 3+ party venues" },
  { icon: "💑", title: "Romantico", description: "Booked a couple experience" },
];

const recentActivity = [
  { icon: "🏊", title: "The Firefly Villa", subtitle: "Evening slot · 2 guests", date: "Mar 10" },
  { icon: "🌌", title: "Koraput Garden House", subtitle: "Night slot · 4 guests", date: "Feb 28" },
  { icon: "🔥", title: "Ember Grounds", subtitle: "Full Day · 12 guests", date: "Feb 14" },
];

interface ProfileScreenProps {
  onHostTap?: () => void;
}

export default function ProfileScreen({ onHostTap }: ProfileScreenProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeSetting, setActiveSetting] = useState("");
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || "Guest Explorer",
    location: "Jeypore, India",
    bio: "Explorer of hidden gems 🌿 Love bonfires, stargazing, and good coffee.",
  });

  const handleSaveProfile = useCallback((updated: typeof profile) => {
    setProfile(updated);
  }, []);

  const handleSettingTap = useCallback((key: string, label: string) => {
    if (label === "Refer a friend") { setShowReferral(true); return; }
    if (label === "Loyalty points") { setShowLoyalty(true); return; }
    if (key) setActiveSetting(key);
  }, []);

  // Show auth screen as overlay
  if (showAuth) {
    return (
      <div className="min-h-screen relative">
        <AuthScreen />
        <button
          onClick={() => setShowAuth(false)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white text-sm font-medium"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-mesh min-h-screen">
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
          className="w-10 h-10 rounded-full glass flex items-center justify-center relative"
        >
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full" />
        </motion.button>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-5 rounded-3xl glass p-6 relative"
      >
        {/* Edit & View Public Profile buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPublicProfile(true)}
            className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Globe size={14} className="text-primary" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEditProfile(true)}
            className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
          >
            <Pencil size={14} className="text-primary" />
          </motion.button>
        </div>

        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary border-2 border-primary/30 glow-sm">
                <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                <BadgeCheck size={16} className="text-primary-foreground" />
              </div>
            </div>
            <h3 className="font-bold text-xl text-foreground mt-3">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.location}</p>
          </div>
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

        {/* Bio */}
        {profile.bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border/40 leading-relaxed"
          >
            {profile.bio}
          </motion.p>
        )}
      </motion.div>

      {/* Membership Badge — opens Loyalty screen */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={() => setShowLoyalty(true)}
        className="mx-5 mt-4 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <Crown size={28} className="text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Gold Member</p>
          <p className="text-xs text-muted-foreground">320 loyalty points · ₹200 cashback available</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </motion.div>

      {/* Quick Stats Row */}
      <div className="mx-5 mt-4 grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, value: "5", label: "Bookings", color: "text-primary" },
          { icon: Heart, value: "8", label: "Wishlisted", color: "text-primary" },
          { icon: TrendingUp, value: "₹12K", label: "Total Spent", color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.05 }}
            className="glass rounded-2xl p-3 text-center"
          >
            <stat.icon size={20} className={`${stat.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="mx-5 mt-5"
      >
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Award size={16} className="text-primary" /> Achievements
        </h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {achievements.map((a, i) => (
            <div key={i} className="shrink-0 glass rounded-2xl p-3 w-[130px] text-center">
              <span className="text-3xl block mb-1">{a.icon}</span>
              <p className="text-xs font-bold text-foreground">{a.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{a.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-5 mt-5"
      >
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Zap size={16} className="text-primary" /> Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity.map((item, i) => (
            <div key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{item.date}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Two Cards Grid */}
      <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-2xl glass p-4 cursor-pointer"
        >
          <div className="h-28 flex items-center justify-center mb-2">
            <img src={pastTripsImg} alt="Past trips" className="h-full object-contain" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Past trips</h4>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl glass p-4 cursor-pointer relative"
        >
          <span className="absolute top-3 right-3 text-[9px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">NEW</span>
          <div className="h-28 flex items-center justify-center mb-2">
            <img src={connectionsImg} alt="Connections" className="h-full object-contain" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Connections</h4>
        </motion.div>
      </div>

      {/* Become a Host */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        onClick={onHostTap}
        className="mx-5 mt-4 rounded-2xl glass p-5 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
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
        transition={{ delay: 0.34 }}
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
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
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
        transition={{ delay: 0.36 }}
        className="mx-5 mt-5"
      >
        {settingsMenu.map((item, i) => (
          <button
            key={item.label}
            onClick={() => handleSettingTap(item.settingKey, item.label)}
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
        {user ? (
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground underline underline-offset-4">
            <LogOut size={16} /> Log out
          </button>
        ) : (
          <button onClick={() => setShowAuth(true)} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary">
            <LogIn size={16} /> Sign in / Sign up
          </button>
        )}
      </motion.div>

      {/* Version */}
      <p className="text-center text-[11px] text-muted-foreground pb-4">Hushh v1.0 · Made in Jeypore ❤️</p>

      {/* Sheets */}
      <EditProfileSheet
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
      <SettingsSheet
        open={!!activeSetting}
        onClose={() => setActiveSetting("")}
        settingType={activeSetting}
      />
      <AnimatePresence>
        {showLoyalty && (
          <LoyaltyScreen onBack={() => setShowLoyalty(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showReferral && (
          <ReferralScreen onBack={() => setShowReferral(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPublicProfile && user && (
          <PublicProfileScreen userId={user.id} onBack={() => setShowPublicProfile(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
