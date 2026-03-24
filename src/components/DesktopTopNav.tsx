import { useState, useRef, useEffect } from "react";
import { Search, Heart, MapPin, MessageCircle, Bell, Sun, Moon, User, LogOut, Settings, Gift, Share2, LayoutDashboard, ChevronDown } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useAppConfig } from "@/hooks/use-app-config";
import profileAvatar from "@/assets/profile-avatar.webp";

const navLinks = [
  { id: "home", label: "Explore", icon: Search },
  { id: "wishlists", label: "Wishlists", icon: Heart },
  { id: "bookings", label: "Trips", icon: MapPin },
  { id: "messages", label: "Messages", icon: MessageCircle },
];

interface DesktopTopNavProps {
  active: string;
  onChange: (tab: string) => void;
  messageBadge?: number;
  onNotificationTap?: () => void;
}

export default function DesktopTopNav({ active, onChange, messageBadge = 0, onNotificationTap }: DesktopTopNavProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { unreadCount: notifCount } = useNotifications();
  const appConfig = useAppConfig();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-8 lg:px-16 xl:px-24 2xl:px-32 backdrop-blur-xl border-b border-border/50" style={{ background: "hsl(var(--background) / 0.85)" }}>
      {/* Left: Logo */}
      <button onClick={() => onChange("home")} className="flex items-center gap-2 md:cursor-pointer group">
        <span className="text-xl">🏠</span>
        <span className="text-lg font-bold tracking-wider font-display text-foreground group-hover:text-primary transition-colors">
          {appConfig.app_name || "HUSHH"}
        </span>
      </button>

      {/* Center: Nav links */}
      <nav className="flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = active === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onChange(link.id)}
              className={`relative px-5 py-2 text-sm font-medium transition-colors md:cursor-pointer rounded-lg ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {link.id === "messages" && messageBadge > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
                  {messageBadge > 99 ? "99+" : messageBadge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={onNotificationTap}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all md:cursor-pointer"
        >
          <Bell size={20} />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all md:cursor-pointer"
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full border border-border/50 pl-1 pr-3 py-1 hover:shadow-md hover:border-border transition-all md:cursor-pointer"
          >
            <img src={profileAvatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-elevated py-2 z-50">
              {[
                { label: "Profile", icon: User, tab: "profile" },
                { label: "Settings", icon: Settings, tab: "profile" },
                { label: "Loyalty & Rewards", icon: Gift, tab: "profile" },
                { label: "Referrals", icon: Share2, tab: "profile" },
                { label: "Host Dashboard", icon: LayoutDashboard, tab: "hostDashboard" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    onChange(item.tab);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 flex items-center gap-3 transition-colors md:cursor-pointer"
                >
                  <item.icon size={16} className="text-muted-foreground" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-border my-1" />
              <button className="w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-colors md:cursor-pointer">
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
