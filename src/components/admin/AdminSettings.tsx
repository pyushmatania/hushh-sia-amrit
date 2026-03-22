import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Sun, Moon, Globe, IndianRupee, Clock, Shield, Bell, Palette, Building2, ChevronRight, ToggleLeft, ToggleRight, DollarSign, BedDouble, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/ui/input";
import { useAppConfig, updateAppConfig, loadAppConfig } from "@/hooks/use-app-config";
import { useToast } from "@/hooks/use-toast";

function PricingRow({ item, value, saving, onSave }: { item: { key: string; label: string; description: string; icon: string }; value: number; saving: boolean; onSave: (val: string) => void }) {
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
          type="number"
          value={localVal}
          onChange={e => setLocalVal(e.target.value)}
          onBlur={() => { if (localVal && localVal !== String(value)) onSave(localVal); }}
          className="w-24 text-right text-sm rounded-xl h-8"
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

  const [settings, setSettings] = useState<Record<string, any>>({
    autoConfirmBookings: false,
    requireVerification: true,
    notifyNewBooking: true,
    notifyLowStock: true,
    notifyNewOrder: true,
    currency: "INR",
    timezone: "Asia/Kolkata",
    taxRate: "18",
    defaultSlotDuration: "4",
    maxGuestsDefault: "20",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    maintenanceMode: false,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveConfigValue = async (key: string, value: string) => {
    setSaving(key);
    await updateAppConfig(key, value);
    await loadAppConfig();
    setSaving(null);
    toast({ title: "Setting saved", description: `${key.replace(/_/g, ' ')} updated` });
  };

  const pricingItems = [
    { key: "extra_mattress_price", label: "Extra Mattress Price (₹)", description: "Price per extra mattress per night", icon: "🛏️" },
    { key: "room_capacity", label: "Guests per Room", description: "Number of guests that fit in one room", icon: "👥" },
    { key: "platform_fee", label: "Platform Fee (₹)", description: "Fixed platform fee per booking", icon: "💳" },
    { key: "service_fee_percent", label: "Service Fee (%)", description: "Percentage service fee on bookings", icon: "📊" },
    { key: "coupon_discount_percent", label: "Coupon Discount (%)", description: "Default coupon discount percentage", icon: "🏷️" },
    { key: "max_mattresses_per_room", label: "Max Mattresses per Room", description: "Maximum extra mattresses allowed per room", icon: "🛌" },
  ];

  const sections = [
    {
      title: "Pricing & Fees",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      type: "pricing" as const,
    },
    {
      title: "General",
      icon: Building2,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10",
      type: "settings" as const,
      items: [
        { id: "currency", label: "Currency", description: "Display currency for prices", type: "select" as const, options: ["INR", "USD", "EUR", "GBP"] },
        { id: "timezone", label: "Timezone", description: "Default timezone for scheduling", type: "select" as const, options: ["Asia/Kolkata", "Asia/Dubai", "America/New_York", "Europe/London"] },
        { id: "taxRate", label: "Tax Rate (%)", description: "Applied to all transactions", type: "input" as const },
      ],
    },
    {
      title: "Property Defaults",
      icon: Clock,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
      type: "settings" as const,
      items: [
        { id: "defaultSlotDuration", label: "Default Slot (hrs)", description: "Default booking slot duration", type: "input" as const },
        { id: "maxGuestsDefault", label: "Max Guests", description: "Default guest capacity", type: "input" as const },
        { id: "checkInTime", label: "Check-in Time", description: "Standard check-in time", type: "input" as const },
        { id: "checkOutTime", label: "Check-out Time", description: "Standard check-out time", type: "input" as const },
      ],
    },
    {
      title: "Booking Rules",
      icon: Shield,
      color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10",
      type: "settings" as const,
      items: [
        { id: "autoConfirmBookings", label: "Auto-confirm Bookings", description: "Automatically confirm new bookings", type: "toggle" as const },
        { id: "requireVerification", label: "Require ID Verification", description: "Require identity verification before check-in", type: "toggle" as const },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      type: "settings" as const,
      items: [
        { id: "notifyNewBooking", label: "New Booking Alerts", description: "Get notified on new bookings", type: "toggle" as const },
        { id: "notifyLowStock", label: "Low Stock Alerts", description: "Alert when inventory is low", type: "toggle" as const },
        { id: "notifyNewOrder", label: "New Order Alerts", description: "Alert on new food orders", type: "toggle" as const },
      ],
    },
    {
      title: "Appearance",
      icon: Palette,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
      type: "settings" as const,
      items: [
        { id: "maintenanceMode", label: "Maintenance Mode", description: "Show maintenance page to guests", type: "toggle" as const },
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
          {resolvedTheme === "dark" ? <><Sun size={14} className="text-amber-400" /> Light Mode</> : <><Moon size={14} className="text-indigo-500" /> Dark Mode</>}
        </motion.button>
      </div>

      <div className="space-y-4">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
            className="rounded-2xl bg-card border border-border/80 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/60">
              <div className={`w-8 h-8 rounded-lg ${section.color} flex items-center justify-center`}>
                <section.icon size={16} />
              </div>
              <span className="text-sm font-semibold text-foreground">{section.title}</span>
            </div>

            {section.type === "pricing" ? (
              <div className="divide-y divide-border/60">
                {pricingItems.map(item => (
                  <PricingRow key={item.key} item={item} value={(appConfig as any)[item.key]} saving={saving === item.key} onSave={(val) => saveConfigValue(item.key, val)} />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {(section.items || []).map(item => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    </div>

                    {item.type === "toggle" && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateSetting(item.id, !settings[item.id])}
                        className={`w-11 h-6 rounded-full flex items-center transition-colors ${settings[item.id] ? "bg-primary" : "bg-muted"}`}
                      >
                        <motion.div
                          animate={{ x: settings[item.id] ? 22 : 2 }}
                          className="w-5 h-5 rounded-full bg-white shadow-sm"
                        />
                      </motion.button>
                    )}

                    {item.type === "select" && (
                      <select
                        value={settings[item.id]}
                        onChange={e => updateSetting(item.id, e.target.value)}
                        className="text-[11px] bg-muted border border-border rounded-xl px-2.5 py-1.5 text-foreground min-w-[100px]"
                      >
                        {item.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}

                    {item.type === "input" && (
                      <Input
                        value={settings[item.id]}
                        onChange={e => updateSetting(item.id, e.target.value)}
                        className="w-24 text-right text-sm rounded-xl h-8"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
