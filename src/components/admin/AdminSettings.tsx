import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Sun, Moon, Shield, Bell, Palette, Building2, DollarSign, Loader2, CalendarX2, Phone, Award, Clock } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { useAppConfig, updateAppConfig, loadAppConfig } from "@/hooks/use-app-config";
import { useToast } from "@/hooks/use-toast";

function ConfigRow({ item, value, saving, onSave }: { item: { key: string; label: string; description: string; icon: string }; value: string | number; saving: boolean; onSave: (val: string) => void }) {
  const [localVal, setLocalVal] = useState(String(value));
  useEffect(() => { setLocalVal(String(value)); }, [value]);
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3 flex-1 mr-4">
        <span className="text-lg">{item.icon}</span>
        <div>
          <p className="text-sm font-medium text-foreground">{item.label}</p>
          <p className="text-[11px] text-muted-foreground">{item.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={localVal}
          onChange={e => setLocalVal(e.target.value)}
          onBlur={() => { if (localVal && localVal !== String(value)) onSave(localVal); }}
          className="w-28 text-right text-sm rounded-xl h-8"
        />
        {saving && <Loader2 size={14} className="animate-spin text-primary" />}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const appConfig = useAppConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    autoConfirmBookings: false,
    requireVerification: true,
    notifyNewBooking: true,
    notifyLowStock: true,
    notifyNewOrder: true,
    maintenanceMode: false,
  });

  const updateToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveConfigValue = async (key: string, value: string) => {
    setSaving(key);
    await updateAppConfig(key, value);
    await loadAppConfig();
    setSaving(null);
    toast({ title: "Setting saved", description: `${key.replace(/_/g, ' ')} updated` });
  };

  const configSections = [
    {
      title: "Pricing & Fees",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      items: [
        { key: "extra_mattress_price", label: "Extra Mattress Price (₹)", description: "Price per extra mattress per night", icon: "🛏️" },
        { key: "room_capacity", label: "Guests per Room", description: "Number of guests that fit in one room", icon: "👥" },
        { key: "platform_fee", label: "Platform Fee (₹)", description: "Fixed platform fee per booking", icon: "💳" },
        { key: "service_fee_percent", label: "Service Fee (%)", description: "Percentage service fee on bookings", icon: "📊" },
        { key: "coupon_discount_percent", label: "Coupon Discount (%)", description: "Default coupon discount percentage", icon: "🏷️" },
        { key: "max_mattresses_per_room", label: "Max Mattresses per Room", description: "Maximum extra mattresses allowed per room", icon: "🛌" },
        { key: "cleaning_fee", label: "Cleaning Fee (₹)", description: "Cleaning fee charged per booking", icon: "🧹" },
        { key: "gst_percent", label: "GST (%)", description: "Goods & Services Tax percentage", icon: "🧾" },
      ],
    },
    {
      title: "Cancellation Policy",
      icon: CalendarX2,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      items: [
        { key: "free_cancel_hours", label: "Free Cancel Window (hrs)", description: "Hours before check-in for full refund", icon: "✅" },
        { key: "partial_refund_percent", label: "Partial Refund (%)", description: "Refund percentage for late cancellation", icon: "💸" },
        { key: "partial_refund_hours", label: "Partial Refund Window (hrs)", description: "Hours before check-in for partial refund", icon: "⏳" },
      ],
    },
    {
      title: "Booking Rules",
      icon: Clock,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
      items: [
        { key: "min_booking_advance_hours", label: "Min Advance Booking (hrs)", description: "Minimum hours in advance to book", icon: "⏰" },
        { key: "check_in_time", label: "Check-in Time", description: "Standard check-in time for stays", icon: "🔑" },
        { key: "check_out_time", label: "Check-out Time", description: "Standard check-out time for stays", icon: "🚪" },
        { key: "max_guests_per_booking", label: "Max Guests per Booking", description: "Maximum guests allowed per single booking", icon: "👨‍👩‍👧‍👦" },
      ],
    },
    {
      title: "Loyalty & Referrals",
      icon: Award,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
      items: [
        { key: "loyalty_points_per_booking", label: "Points per Booking", description: "Loyalty points awarded per completed booking", icon: "⭐" },
        { key: "referral_reward_points", label: "Referral Reward Points", description: "Points awarded for successful referral", icon: "🎁" },
      ],
    },
    {
      title: "Support & Contact",
      icon: Phone,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10",
      items: [
        { key: "support_phone", label: "Support Phone", description: "Customer support phone number", icon: "📞" },
        { key: "support_email", label: "Support Email", description: "Customer support email address", icon: "📧" },
        { key: "whatsapp_number", label: "WhatsApp Number", description: "WhatsApp support number", icon: "💬" },
      ],
    },
  ];

  const toggleSections = [
    {
      title: "Booking Automation",
      icon: Shield,
      color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10",
      items: [
        { id: "autoConfirmBookings", label: "Auto-confirm Bookings", description: "Automatically confirm new bookings" },
        { id: "requireVerification", label: "Require ID Verification", description: "Require identity verification before check-in" },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      items: [
        { id: "notifyNewBooking", label: "New Booking Alerts", description: "Get notified on new bookings" },
        { id: "notifyLowStock", label: "Low Stock Alerts", description: "Alert when inventory is low" },
        { id: "notifyNewOrder", label: "New Order Alerts", description: "Alert on new food orders" },
      ],
    },
    {
      title: "Appearance",
      icon: Palette,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
      items: [
        { id: "maintenanceMode", label: "Maintenance Mode", description: "Show maintenance page to guests" },
      ],
    },
  ];

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shadow-sm">
              <Settings size={20} className="text-zinc-600 dark:text-zinc-300" />
            </div>
            Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure app preferences and rules</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9, rotate: resolvedTheme === "dark" ? -30 : 30 }}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-xs font-medium text-foreground hover:bg-secondary transition"
        >
          {resolvedTheme === "dark" ? <><Sun size={14} className="text-amber-400" /> Light</> : <><Moon size={14} className="text-indigo-500" /> Dark</>}
        </motion.button>
      </div>

      <div className="space-y-4">
        {/* Config sections (editable values from DB) */}
        {configSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.04 }}
            className="rounded-2xl bg-card border border-border/80 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/60">
              <div className={`w-8 h-8 rounded-lg ${section.color} flex items-center justify-center`}>
                <section.icon size={16} />
              </div>
              <span className="text-sm font-semibold text-foreground">{section.title}</span>
            </div>
            <div className="divide-y divide-border/60">
              {section.items.map(item => (
                <ConfigRow
                  key={item.key}
                  item={item}
                  value={(appConfig as any)[item.key]}
                  saving={saving === item.key}
                  onSave={(val) => saveConfigValue(item.key, val)}
                />
              ))}
            </div>
          </motion.div>
        ))}

        {/* Toggle sections (local state) */}
        {toggleSections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (configSections.length + si) * 0.04 }}
            className="rounded-2xl bg-card border border-border/80 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/60">
              <div className={`w-8 h-8 rounded-lg ${section.color} flex items-center justify-center`}>
                <section.icon size={16} />
              </div>
              <span className="text-sm font-semibold text-foreground">{section.title}</span>
            </div>
            <div className="divide-y divide-border/60">
              {section.items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateToggle(item.id)}
                    className={`w-11 h-6 rounded-full flex items-center transition-colors ${toggles[item.id] ? "bg-primary" : "bg-muted"}`}
                  >
                    <motion.div
                      animate={{ x: toggles[item.id] ? 22 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-sm"
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
