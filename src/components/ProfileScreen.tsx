import { motion } from "framer-motion";
import {
  User, ChevronRight, MapPin, Calendar, Star,
  Settings, HelpCircle, LogOut, Bell, Shield, Gift, Heart
} from "lucide-react";

const menuSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal info", sublabel: "Name, phone, email" },
      { icon: Shield, label: "Login & Security", sublabel: "Password, 2FA" },
      { icon: Bell, label: "Notifications", sublabel: "Push, email, SMS" },
    ],
  },
  {
    title: "Rewards",
    items: [
      { icon: Gift, label: "Referral Program", sublabel: "Earn ₹200 per invite", badge: "NEW" },
      { icon: Star, label: "Loyalty Points", sublabel: "320 points earned" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Centre", sublabel: "FAQ & support" },
      { icon: Settings, label: "App Settings", sublabel: "Theme, language" },
    ],
  },
];

interface BookingHistoryItem {
  id: string;
  property: string;
  date: string;
  amount: number;
  status: "completed" | "upcoming" | "cancelled";
}

const bookingHistory: BookingHistoryItem[] = [
  { id: "1", property: "The Firefly Villa", date: "Yesterday", amount: 2499, status: "completed" },
  { id: "2", property: "Koraput Garden House", date: "Mar 12", amount: 3199, status: "upcoming" },
  { id: "3", property: "Ember Grounds", date: "Mar 5", amount: 5999, status: "cancelled" },
];

const statusColors: Record<string, string> = {
  completed: "bg-success/10 text-success",
  upcoming: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function ProfileScreen() {
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Profile
        </motion.h1>
      </div>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-3 rounded-2xl border border-border p-5 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User size={28} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground">Guest User</h3>
          <p className="text-sm text-muted-foreground">Sign in for a personalised experience</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground shrink-0" />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-5 mt-4 grid grid-cols-3 gap-3"
      >
        {[
          { value: "3", label: "Bookings", icon: Calendar },
          { value: "2", label: "Wishlist", icon: Heart },
          { value: "320", label: "Points", icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border p-3 text-center">
            <stat.icon size={18} className="text-primary mx-auto mb-1.5" />
            <span className="text-lg font-bold text-foreground block">{stat.value}</span>
            <span className="text-[11px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5 mt-6"
      >
        <h3 className="font-semibold text-base text-foreground mb-3">Recent Bookings</h3>
        <div className="space-y-2">
          {bookingHistory.map((booking) => (
            <div key={booking.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground block truncate">{booking.property}</span>
                <span className="text-xs text-muted-foreground">{booking.date} · ₹{booking.amount.toLocaleString()}</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full capitalize ${statusColors[booking.status]}`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Menu Sections */}
      {menuSections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + si * 0.05 }}
          className="mx-5 mt-6"
        >
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">{section.title}</h3>
          <div className="rounded-2xl border border-border overflow-hidden">
            {section.items.map((item, i) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors ${
                  i < section.items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <item.icon size={18} className="text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.sublabel}</span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mx-5 mt-6 mb-4"
      >
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-[11px] text-muted-foreground pb-4">Hushh v1.0 · Made in Jeypore ❤️</p>
    </div>
  );
}
