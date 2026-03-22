import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MessageCircle as WhatsAppIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PublicProfileScreen from "./PublicProfileScreen";
import {
  ChevronRight, Bell, Settings, HelpCircle, LogOut,
  Shield, Gift, Star, Sun, Moon, Monitor, BadgeCheck,
  CreditCard, Globe, Accessibility, FileText, Heart,
  Award, Zap, Calendar, TrendingUp, Crown, Pencil, LogIn, EyeOff,
  MapPin, Clock, Users, ArrowLeft, ChevronLeft
} from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import type { Booking } from "@/pages/Index";
import { usePropertiesData } from "@/contexts/PropertiesContext";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import AuthScreen from "./AuthScreen";
import profileAvatar from "@/assets/profile-avatar.webp";
import pastTripsImg from "@/assets/past-trips-card.webp";
import connectionsImg from "@/assets/connections-card.webp";
import becomeHostImg from "@/assets/become-host.webp";
import EditProfileSheet from "./EditProfileSheet";
import SettingsSheet from "./SettingsSheet";
import LoyaltyScreen from "./LoyaltyScreen";
import ReferralScreen from "./ReferralScreen";
import AppDocumentation from "./AppDocumentation";
import IdentityUploadSheet from "./IdentityUploadSheet";

const themeOptions = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "Auto", icon: Monitor },
];

const settingsMenu = [
  { icon: Settings, label: "Account settings", settingKey: "" },
  { icon: CreditCard, label: "Payments & payouts", settingKey: "" },
  { icon: Shield, label: "Login & security", settingKey: "security" },
  { icon: Shield, label: "Verify Identity", sublabel: "Upload ID", badge: "NEW", settingKey: "identity" },
  { icon: Bell, label: "Notifications", settingKey: "notifications" },
  { icon: Globe, label: "Language & region", settingKey: "language" },
  { icon: Accessibility, label: "Accessibility", settingKey: "accessibility" },
  { icon: EyeOff, label: "Privacy mode", sublabel: "🤫", settingKey: "privacy" },
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

// recentActivity is now computed from bookings in the component

interface ProfileScreenProps {
  onHostTap?: () => void;
  bookings?: Booking[];
  onViewBookingDetail?: (booking: Booking) => void;
  onRebook?: (propertyId: string) => void;
}

export default function ProfileScreen({ onHostTap, bookings = [], onViewBookingDetail, onRebook }: ProfileScreenProps) {
  const { properties } = usePropertiesData();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeSetting, setActiveSetting] = useState("");
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [showIdentityUpload, setShowIdentityUpload] = useState(false);
  const [showHelpCentre, setShowHelpCentre] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const versionTapCount = useRef(0);
  const versionTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPastTrips, setShowPastTrips] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || "Guest Explorer",
    location: "Jeypore, India",
    bio: "Explorer of hidden gems 🌿 Love bonfires, stargazing, and good coffee.",
  });

  // bookings already includes demo data for guests (from useBookings hook)
  const pastTrips = useMemo(() => bookings.filter(b => b.status === "completed"), [bookings]);

  const recentActivityFromBookings = useMemo(() => {
    return bookings.slice(0, 3).map(b => {
      const prop = properties.find(p => p.id === b.propertyId);
      return {
        icon: prop?.amenityIcons[0] || "🏨",
        title: prop?.name || "Property",
        subtitle: `${b.slot} · ${b.guests} guests`,
        date: b.date.split(",")[0]?.trim() || b.date,
      };
    });
  }, [bookings]);

  const handleSaveProfile = useCallback((updated: typeof profile) => {
    setProfile(updated);
  }, []);

  const handleSettingTap = useCallback((key: string, label: string) => {
    if (label === "Refer a friend") { setShowReferral(true); return; }
    if (label === "Loyalty points") { setShowLoyalty(true); return; }
    if (label === "Verify Identity") { setShowIdentityUpload(true); return; }
    if (label === "Help centre") { setShowHelpCentre(true); return; }
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

      {/* Profile Hero Card — reimagined */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 22 }}
        className="mx-5 mt-5 rounded-[28px] overflow-hidden relative"
        style={{
          background: "linear-gradient(145deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.04) 50%, hsl(var(--background)) 100%)",
          border: "1px solid hsl(var(--primary) / 0.15)",
          boxShadow: "0 8px 32px -8px hsl(var(--primary) / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.05)",
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)" }} />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)" }} />

        <div className="relative p-6">
          {/* Action buttons row */}
          <div className="flex justify-end gap-2 mb-4">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowPublicProfile(true)}
              className="w-9 h-9 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center"
            >
              <Globe size={15} className="text-primary" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowEditProfile(true)}
              className="w-9 h-9 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center"
            >
              <Pencil size={15} className="text-primary" />
            </motion.button>
          </div>

          {/* Avatar + Info — centered layout */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
              className="relative mb-4"
            >
              <div
                className="w-[100px] h-[100px] rounded-full overflow-hidden border-[3px] border-primary/40"
                style={{ boxShadow: "0 0 28px hsl(var(--primary) / 0.25), 0 0 8px hsl(var(--primary) / 0.15)" }}
              >
                <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 400 }}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
                style={{ boxShadow: "0 2px 12px hsl(var(--primary) / 0.4)" }}
              >
                <BadgeCheck size={17} className="text-primary-foreground" />
              </motion.div>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-foreground"
            >
              {profile.name}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-sm text-muted-foreground mt-0.5"
            >
              {profile.location}
            </motion.p>

            {/* Bio */}
            {profile.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[13px] text-muted-foreground mt-3 max-w-[260px] leading-relaxed"
              >
                {profile.bio}
              </motion.p>
            )}
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3 mt-5"
          >
            {[
              { value: String(bookings.length), label: "Trips", icon: Calendar },
              { value: "4", label: "Reviews", icon: Star },
              { value: "1yr", label: "Member", icon: Award },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className="rounded-2xl py-3 text-center"
                style={{
                  background: "hsl(var(--primary) / 0.06)",
                  border: "1px solid hsl(var(--primary) / 0.1)",
                }}
              >
                <stat.icon size={16} className="text-primary mx-auto mb-1.5" />
                <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Membership Badge — opens Loyalty screen */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setShowLoyalty(true)}
        className="mx-5 mt-4 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--primary) / 0.08) 100%)",
          border: "1px solid hsl(var(--primary) / 0.2)",
          boxShadow: "0 4px 20px -4px hsl(var(--primary) / 0.15)",
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "hsl(var(--primary) / 0.15)" }}
        >
          <Crown size={22} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Gold Member</p>
          <p className="text-xs text-muted-foreground">320 loyalty points · ₹200 cashback available</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </motion.div>

      {/* Quick Stats Row */}
      <div className="mx-5 mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, value: String(bookings.filter(b => b.status !== "cancelled").length), label: "Bookings", color: "text-primary" },
            { icon: Heart, value: "8", label: "Wishlisted", color: "text-primary" },
            { icon: TrendingUp, value: `₹${(bookings.reduce((s, b) => s + (b.status !== "cancelled" ? b.total : 0), 0) / 1000).toFixed(0)}K`, label: "Total Spent", color: "text-primary" },
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
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {achievements.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.24 + i * 0.06 }}
              className="shrink-0 rounded-[20px] p-4 w-[140px] text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.04) 50%, hsl(var(--background)) 100%)",
                border: "1px solid hsl(var(--primary) / 0.15)",
                boxShadow: "0 4px 20px -4px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.05)",
              }}
            >
              <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)" }} />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2.5"
                style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.15)" }}
              >
                <span className="text-2xl">{a.icon}</span>
              </div>
              <p className="text-xs font-bold text-foreground leading-tight">{a.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{a.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-5 mt-5 rounded-[24px] overflow-hidden relative"
        style={{
          background: "linear-gradient(145deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--background)) 100%)",
          border: "1px solid hsl(var(--primary) / 0.12)",
          boxShadow: "0 6px 24px -6px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
        }}
      >
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)" }} />
        <div className="p-5 pb-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(var(--primary) / 0.12)" }}
            >
              <Zap size={15} className="text-primary" />
            </div>
            Recent Activity
          </h3>
        </div>
        <div className="px-5 pb-4 space-y-1.5">
          {recentActivityFromBookings.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="rounded-2xl px-4 py-3.5 flex items-center gap-3.5"
              style={{
                background: "hsl(var(--primary) / 0.05)",
                border: "1px solid hsl(var(--primary) / 0.08)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.12)" }}
              >
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-muted-foreground">{item.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Two Cards Grid */}
      <div className="mx-5 mt-5 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          onClick={() => setShowPastTrips(true)}
          className="rounded-2xl glass p-4 cursor-pointer active:scale-[0.97] transition-transform"
        >
          <div className="h-28 flex items-center justify-center mb-2">
            <img src={pastTripsImg} alt="Past trips" className="h-full object-contain" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Past trips</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">{pastTrips.length} trips</p>
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

      {/* Admin Panel Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="mx-5 mt-5"
      >
        <button
          onClick={() => navigate("/admin")}
          className="w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">Admin Panel</p>
            <p className="text-[10px] text-muted-foreground">Command center & operations</p>
          </div>
          <ChevronRight size={16} className="text-primary" />
        </button>
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

      {/* Version — tap 5× to reveal docs */}
      <p
        className="text-center text-[11px] text-muted-foreground pb-4 cursor-pointer select-none"
        onClick={() => {
          versionTapCount.current += 1;
          if (versionTapTimer.current) clearTimeout(versionTapTimer.current);
          if (versionTapCount.current >= 5) {
            versionTapCount.current = 0;
            setShowDocs(true);
          } else {
            versionTapTimer.current = setTimeout(() => {
              versionTapCount.current = 0;
            }, 2000);
          }
        }}
      >
        Hushh v1.0 · Made in Jeypore ❤️
      </p>

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
      <IdentityUploadSheet open={showIdentityUpload} onClose={() => setShowIdentityUpload(false)} />
      <AnimatePresence>
        {showPublicProfile && (
          <PublicProfileScreen userId={user?.id || "mock-guest"} onBack={() => setShowPublicProfile(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDocs && (
          <AppDocumentation open={showDocs} onClose={() => setShowDocs(false)} />
        )}
      </AnimatePresence>

      {/* Past Trips Full Screen */}
      <AnimatePresence>
        {showPastTrips && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-mesh overflow-y-auto"
          >
            <div className="sticky top-0 z-10 glass px-5 py-3">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowPastTrips(false)}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center"
                  whileTap={{ scale: 0.85 }}
                >
                  <ArrowLeft size={16} className="text-foreground" />
                </motion.button>
                <div className="flex-1">
                  <h2 className="font-semibold text-base text-foreground">Past Trips</h2>
                  <p className="text-xs text-muted-foreground">{pastTrips.length} completed trips</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4 pb-24">
              {pastTrips.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border p-8 text-center"
                >
                  <p className="text-sm font-semibold text-foreground">No past trips yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Completed trips will appear here automatically.</p>
                </motion.div>
              ) : (
                pastTrips.map((trip, i) => {
                  const prop = properties.find(p => p.id === trip.propertyId);
                  if (!prop) return null;
                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 22 }}
                      onClick={() => onViewBookingDetail?.(trip)}
                      className="rounded-2xl border border-border overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                      style={{ boxShadow: "0 4px 16px -4px hsl(0 0% 0% / 0.15)" }}
                    >
                      <div className="relative h-36">
                        <img src={prop.images[0]} alt={prop.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-muted-foreground/80 backdrop-blur-sm px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                          <span className="text-[10px] font-semibold text-white">Completed</span>
                        </div>
                      </div>
                      <div className="p-4 -mt-6 relative">
                        <h3 className="font-bold text-[15px] text-foreground">{prop.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {prop.location}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <span className="flex items-center gap-1 bg-secondary/80 rounded-lg px-2 py-1 text-[11px] text-foreground">
                            <Calendar size={10} className="text-primary" /> {trip.date}
                          </span>
                          <span className="flex items-center gap-1 bg-secondary/80 rounded-lg px-2 py-1 text-[11px] text-foreground">
                            <Clock size={10} className="text-primary" /> {trip.slot.split("·")[0]?.trim()}
                          </span>
                          <span className="flex items-center gap-1 bg-secondary/80 rounded-lg px-2 py-1 text-[11px] text-foreground">
                            <Users size={10} className="text-primary" /> {trip.guests}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
                          <span className="text-xs text-muted-foreground font-mono">{trip.bookingId}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-foreground">₹{trip.total.toLocaleString()}</span>
                            {onRebook && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onRebook(trip.propertyId); }}
                                className="text-xs font-semibold text-primary flex items-center gap-0.5"
                              >
                                Book Again <ChevronRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
