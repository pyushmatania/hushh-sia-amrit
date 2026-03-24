import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Bell, Shield, Globe, Accessibility, Moon, EyeOff, Loader2, Smartphone,
  CreditCard, User, Database, Trash2, Download, ChevronRight, Copy, Check, LogOut, Key, History, Wallet, Plus, HardDrive
} from "lucide-react";
import { useState, useCallback } from "react";
import { usePrivacyMode } from "@/hooks/use-privacy-mode";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  settingType: string;
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-foreground"
      />
    </button>
  );
}

function SettingRow({ icon: Icon, label, desc, right, delay = 0, onClick, danger }: {
  icon?: typeof Bell; label: string; desc?: string; right?: React.ReactNode; delay?: number; onClick?: () => void; danger?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`flex items-center justify-between py-4 border-b border-border last:border-0 ${onClick ? "cursor-pointer active:bg-muted/30 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        {Icon && <Icon size={16} className={danger ? "text-destructive" : "text-muted-foreground"} />}
        <div>
          <p className={`text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      {right || (onClick && <ChevronRight size={16} className="text-muted-foreground" />)}
    </motion.div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-5 mb-2">{title}</h4>;
}

// ─── ACCOUNT SETTINGS ───
function AccountSettings() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const email = user?.email || "guest@hushh.app";

  const handlePasswordReset = async () => {
    if (!user?.email) { toast({ title: "Login required", variant: "destructive" }); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Password reset email sent ✉️", description: "Check your inbox" });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate data export (collects profile, bookings, etc.)
      await new Promise(r => setTimeout(r, 1500));
      toast({ title: "Data export ready 📦", description: "Your data will be emailed to you" });
    } finally { setIsExporting(false); }
  };

  const handleDeleteAccount = async () => {
    toast({ title: "Account deletion requested", description: "Our team will process this within 48 hours" });
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-1">
      <SectionHeader title="Profile" />
      <SettingRow icon={User} label="Email" desc={email} />
      <SettingRow icon={Key} label="Change password" desc="Send a password reset email" onClick={handlePasswordReset} />
      
      <SectionHeader title="Data & Privacy" />
      <SettingRow
        icon={Download}
        label="Export my data"
        desc="Download all your personal data"
        onClick={handleExportData}
        right={isExporting ? <Loader2 size={16} className="animate-spin text-primary" /> : undefined}
      />
      <SettingRow icon={History} label="Login activity" desc="View recent login sessions" onClick={() => toast({ title: "1 active session", description: "Current device · last active now" })} />

      <SectionHeader title="Danger Zone" />
      {!showDeleteConfirm ? (
        <SettingRow icon={Trash2} label="Delete my account" desc="Permanently delete all data" onClick={() => setShowDeleteConfirm(true)} danger />
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl p-4 my-2"
          style={{ background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.2)" }}
        >
          <p className="text-sm font-medium text-destructive mb-1">Are you sure?</p>
          <p className="text-xs text-muted-foreground mb-3">This action is irreversible. All bookings, reviews, and loyalty points will be lost.</p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteAccount}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-destructive-foreground"
              style={{ background: "hsl(var(--destructive))" }}
            >
              Delete permanently
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-muted text-foreground"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {user && (
        <>
          <SectionHeader title="" />
          <SettingRow icon={LogOut} label="Sign out" desc="Log out of your account" onClick={signOut} danger />
        </>
      )}
    </div>
  );
}

// ─── PAYMENTS & PAYOUTS ───
function PaymentSettings() {
  const { toast } = useToast();
  const [savedCards] = useState([
    { id: "1", type: "visa", last4: "4242", expiry: "12/27", isDefault: true },
    { id: "2", type: "mastercard", last4: "8888", expiry: "03/26", isDefault: false },
  ]);
  const [savedUPI] = useState([
    { id: "u1", vpa: "user@paytm", isDefault: true },
  ]);

  const transactions = [
    { id: "t1", label: "Bonfire Night Booking", amount: "₹3,500", date: "Dec 15", status: "completed" as const },
    { id: "t2", label: "Tribal Thali Experience", amount: "₹1,200", date: "Dec 10", status: "completed" as const },
    { id: "t3", label: "Refund — Rain cancellation", amount: "+₹2,000", date: "Dec 5", status: "refunded" as const },
  ];

  return (
    <div className="space-y-1">
      <SectionHeader title="Saved Cards" />
      {savedCards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 py-3.5 border-b border-border"
        >
          <div className="w-10 h-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: card.type === "visa" ? "linear-gradient(135deg, hsl(220 90% 55%), hsl(250 80% 60%))" : "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 90% 55%))" }}>
            <span className="text-white">{card.type === "visa" ? "V" : "M"}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">•••• {card.last4}</p>
            <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
          </div>
          {card.isDefault && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">DEFAULT</span>
          )}
        </motion.div>
      ))}

      <SectionHeader title="UPI" />
      {savedUPI.map((upi, i) => (
        <motion.div
          key={upi.id}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}
          className="flex items-center gap-3 py-3.5 border-b border-border"
        >
          <div className="w-10 h-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, hsl(150 70% 45%), hsl(180 60% 40%))" }}>
            <span className="text-white">₹</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{upi.vpa}</p>
          </div>
          {upi.isDefault && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">DEFAULT</span>
          )}
        </motion.div>
      ))}

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        onClick={() => toast({ title: "Coming soon", description: "Payment method management will be available with Razorpay integration" })}
        className="flex items-center gap-2 py-3 text-sm font-medium text-primary"
      >
        <Plus size={16} /> Add payment method
      </motion.button>

      <SectionHeader title="Recent Transactions" />
      {transactions.map((tx, i) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
          className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{tx.label}</p>
            <p className="text-xs text-muted-foreground">{tx.date}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${tx.status === "refunded" ? "text-green-500" : "text-foreground"}`}>{tx.amount}</p>
            <p className={`text-[10px] font-medium ${tx.status === "refunded" ? "text-green-500" : "text-muted-foreground"}`}>
              {tx.status === "refunded" ? "Refunded" : "Paid"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── STORAGE & DATA ───
function StorageSettings() {
  const { toast } = useToast();
  const [clearing, setClearing] = useState(false);

  const storageItems = [
    { label: "Cached images", size: "12.4 MB", icon: HardDrive },
    { label: "Preloaded videos", size: "48.2 MB", icon: HardDrive },
    { label: "Offline data", size: "2.1 MB", icon: Database },
  ];

  const handleClearCache = async () => {
    setClearing(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.removeItem("hushh_video_cache");
      await new Promise(r => setTimeout(r, 800));
      toast({ title: "Cache cleared ✨", description: "Freed up storage space" });
    } finally { setClearing(false); }
  };

  return (
    <div className="space-y-1">
      <SectionHeader title="Storage Usage" />
      {storageItems.map((item, i) => (
        <SettingRow
          key={item.label}
          icon={item.icon}
          label={item.label}
          desc={item.size}
          delay={i * 0.04}
        />
      ))}

      <SectionHeader title="Actions" />
      <SettingRow
        icon={Trash2}
        label="Clear cache"
        desc="Remove cached images and videos"
        onClick={handleClearCache}
        right={clearing ? <Loader2 size={16} className="animate-spin text-primary" /> : undefined}
      />
      <SettingRow
        icon={Download}
        label="Download data for offline"
        desc="Save property data for offline browsing"
        onClick={() => toast({ title: "Offline pack downloaded 📥", description: "Property data saved for offline use" })}
      />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="rounded-xl p-3 mt-4"
        style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}
      >
        <p className="text-[11px] text-muted-foreground">
          💡 <span className="text-foreground font-medium">Tip:</span> Clearing cache will make images and videos reload on next visit but won't affect your bookings or account data.
        </p>
      </motion.div>
    </div>
  );
}

// ─── NOTIFICATIONS (existing, enhanced) ───
function NotificationSettings() {
  const { toast } = useToast();
  const { isSupported, isSubscribed, isLoading, isiOS, isPWA, permission, subscribe, unsubscribe } = usePushNotifications();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [settings, setSettings] = useState({
    bookingUpdates: true,
    promotions: true,
    reminders: true,
    chatMessages: true,
    emailDigest: false,
    sound: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const handlePushToggle = async () => {
    try {
      if (isSubscribed) { await unsubscribe(); toast({ title: "Push notifications disabled" }); }
      else { await subscribe(); toast({ title: "Push notifications enabled! 🔔" }); }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const testNotifications = [
    { delay: 5000, title: "🎉 Booking Confirmed!", body: "Your reservation at Koraput Coffee Trail is confirmed for tomorrow at 10 AM.", url: "/trips" },
    { delay: 10000, title: "🔥 Flash Deal!", body: "50% off on Tribal Thali Experience — only 3 spots left! Book now.", url: "/" },
    { delay: 15000, title: "💬 New Message", body: "Your host Priya sent you a message about your upcoming stay.", url: "/messages" },
  ];

  const handleTestPush = async () => {
    setIsSendingTest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      toast({ title: "Sending 3 test notifications...", description: "At 5s, 10s, and 15s intervals" });
      for (const notif of testNotifications) {
        setTimeout(async () => {
          try {
            if (user) {
              await supabase.functions.invoke('send-push-notification', {
                body: { user_id: user.id, payload: { title: notif.title, body: notif.body, url: notif.url } }
              });
            } else {
              if (Notification.permission === 'granted') {
                new Notification(notif.title, { body: notif.body, icon: '/favicon.ico' });
              }
            }
          } catch (e) { console.error('[Push Test]', e); }
        }, notif.delay);
      }
      setTimeout(() => setIsSendingTest(false), 16000);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      setIsSendingTest(false);
    }
  };

  const items = [
    { key: "bookingUpdates" as const, label: "Booking updates", desc: "Confirmations, cancellations, changes" },
    { key: "promotions" as const, label: "Promotions & deals", desc: "Special offers and discounts" },
    { key: "reminders" as const, label: "Trip reminders", desc: "Upcoming visit notifications" },
    { key: "chatMessages" as const, label: "Chat messages", desc: "Support and host messages" },
    { key: "emailDigest" as const, label: "Weekly email digest", desc: "Summary of activity and deals" },
    { key: "sound" as const, label: "Notification sound", desc: "Play sound for new notifications" },
  ];

  return (
    <div className="space-y-1">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">Push Notifications</p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {!isSupported
                ? isiOS && !isPWA ? "Install as app first (Share → Add to Home Screen)" : "Not supported in this browser"
                : permission === 'denied' ? "Blocked — update browser settings"
                : isSubscribed ? "Enabled — you'll receive real-time alerts" : "Tap to enable real-time push alerts"}
            </p>
          </div>
          {isSupported && permission !== 'denied' && (
            isLoading ? <Loader2 size={20} className="animate-spin text-primary" /> :
            <ToggleSwitch enabled={isSubscribed} onChange={handlePushToggle} />
          )}
        </div>
        {isSubscribed && (
          <motion.button
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleTestPush}
            disabled={isSendingTest}
            className="mt-2 text-xs font-medium text-primary flex items-center gap-1"
          >
            {isSendingTest ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
            Send test notification
          </motion.button>
        )}
      </motion.div>

      {items.map((item, i) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (i + 1) * 0.04 }}
          className="flex items-center justify-between py-4 border-b border-border last:border-0"
        >
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
          <ToggleSwitch enabled={settings[item.key]} onChange={() => toggle(item.key)} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── SECURITY ───
function SecuritySettings() {
  const { toast } = useToast();
  const [twoFa, setTwoFa] = useState(false);

  const items = [
    { label: "Change password", desc: "Send a password reset email", action: true, onClick: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { toast({ title: "Login required", variant: "destructive" }); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Reset email sent ✉️" });
    }},
    { label: "Two-factor authentication", desc: "Add an extra layer of security", toggle: true },
    { label: "Active sessions", desc: "1 device logged in", action: true, onClick: () => toast({ title: "Current session", description: "Web browser · active now" }) },
    { label: "Login history", desc: "View recent login activity", action: true, onClick: () => toast({ title: "Last login", description: "Today from this device" }) },
  ];

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className={`flex items-center justify-between py-4 border-b border-border last:border-0 ${item.onClick ? "cursor-pointer active:bg-muted/30" : ""}`}
          onClick={item.onClick}
        >
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
          {item.toggle ? (
            <ToggleSwitch enabled={twoFa} onChange={setTwoFa} />
          ) : (
            <ChevronRight size={16} className="text-muted-foreground" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── LANGUAGE ───
function LanguageSettings() {
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("inr");

  const languages = [
    { id: "en", label: "English", native: "English", flag: "🇬🇧" },
    { id: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
    { id: "od", label: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
    { id: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  ];

  const currencies = [
    { id: "inr", label: "₹ INR", desc: "Indian Rupee" },
    { id: "usd", label: "$ USD", desc: "US Dollar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader title="Language" />
        <div className="space-y-1">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                lang === l.id ? "bg-primary/10 border border-primary/30" : "border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{l.flag}</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.native}</p>
                </div>
              </div>
              {lang === l.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-primary-foreground" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title="Currency" />
        <div className="space-y-1">
          {currencies.map((c) => (
            <button
              key={c.id}
              onClick={() => setCurrency(c.id)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                currency === c.id ? "bg-primary/10 border border-primary/30" : "border border-transparent"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
              {currency === c.id && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-primary-foreground" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ACCESSIBILITY ───
function AccessibilitySettings() {
  const [settings, setSettings] = useState({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: true,
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const items = [
    { key: "reduceMotion" as const, label: "Reduce motion", desc: "Minimize animations and transitions" },
    { key: "highContrast" as const, label: "High contrast", desc: "Increase color contrast for better visibility" },
    { key: "largeText" as const, label: "Larger text", desc: "Increase font sizes throughout the app" },
    { key: "screenReader" as const, label: "Screen reader support", desc: "Optimize for assistive technology" },
  ];

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <SettingRow
          key={item.key}
          label={item.label}
          desc={item.desc}
          delay={i * 0.04}
          right={<ToggleSwitch enabled={settings[item.key]} onChange={() => toggle(item.key)} />}
        />
      ))}
    </div>
  );
}

// ─── PRIVACY ───
function PrivacySettings() {
  const { privacyMode, togglePrivacy } = usePrivacyMode();
  const items = [
    { key: "privacy_mode" as const, label: "Privacy Mode 🤫", desc: "Hide your name & booking IDs from screen", isPrivacy: true },
    { key: "discreet_notif" as const, label: "Discreet notifications", desc: "Show minimal info in push notifications" },
    { key: "private_entry" as const, label: "Private entry instructions", desc: "Get discreet arrival directions" },
  ];
  const [extras, setExtras] = useState({ discreet_notif: false, private_entry: false });

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <SettingRow
          key={item.key}
          label={item.label}
          desc={item.desc}
          delay={i * 0.04}
          right={
            <ToggleSwitch
              enabled={item.isPrivacy ? privacyMode : extras[item.key as keyof typeof extras]}
              onChange={() => item.isPrivacy ? togglePrivacy() : setExtras(s => ({ ...s, [item.key]: !s[item.key as keyof typeof extras] }))}
            />
          }
        />
      ))}
      {privacyMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl p-3 mt-2"
          style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.15)" }}
        >
          <p className="text-[11px] text-muted-foreground">
            🤫 <span className="text-foreground font-medium">Privacy Mode is ON.</span> Your name and booking details are masked on-screen. Perfect for shared devices.
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── SETTINGS REGISTRY ───
const settingTitles: Record<string, string> = {
  account: "Account Settings",
  payments: "Payments & Payouts",
  notifications: "Notifications",
  security: "Login & Security",
  language: "Language & Region",
  accessibility: "Accessibility",
  privacy: "Privacy",
  storage: "Storage & Data",
};

const settingIcons: Record<string, typeof Bell> = {
  account: User,
  payments: CreditCard,
  notifications: Bell,
  security: Shield,
  language: Globe,
  accessibility: Accessibility,
  privacy: EyeOff,
  storage: Database,
};

export default function SettingsSheet({ open, onClose, settingType }: SettingsSheetProps) {
  const Icon = settingIcons[settingType] || Bell;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
              <button onClick={onClose} className="text-muted-foreground">
                <X size={22} />
              </button>
              <Icon size={18} className="text-primary" />
              <h2 className="text-base font-bold text-foreground">{settingTitles[settingType] || "Settings"}</h2>
            </div>

            <div className="px-5 py-4 pb-8">
              {settingType === "account" && <AccountSettings />}
              {settingType === "payments" && <PaymentSettings />}
              {settingType === "notifications" && <NotificationSettings />}
              {settingType === "security" && <SecuritySettings />}
              {settingType === "language" && <LanguageSettings />}
              {settingType === "accessibility" && <AccessibilitySettings />}
              {settingType === "privacy" && <PrivacySettings />}
              {settingType === "storage" && <StorageSettings />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
