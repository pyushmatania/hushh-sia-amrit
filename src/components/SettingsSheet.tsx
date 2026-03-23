import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Bell, Shield, Globe, Accessibility, Moon, EyeOff, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { usePrivacyMode } from "@/hooks/use-privacy-mode";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
              // Guest mode — use browser Notification API directly
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
      {/* Push Notification Toggle */}
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

function SecuritySettings() {
  const items = [
    { label: "Change password", desc: "Update your account password", action: true },
    { label: "Two-factor authentication", desc: "Add an extra layer of security", toggle: false },
    { label: "Active sessions", desc: "1 device logged in", action: true },
    { label: "Login history", desc: "View recent login activity", action: true },
  ];

  const [twoFa, setTwoFa] = useState(false);

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center justify-between py-4 border-b border-border last:border-0"
        >
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
          {item.label === "Two-factor authentication" ? (
            <ToggleSwitch enabled={twoFa} onChange={setTwoFa} />
          ) : (
            <ChevronLeft size={16} className="text-muted-foreground rotate-180" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function LanguageSettings() {
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("inr");

  const languages = [
    { id: "en", label: "English", native: "English" },
    { id: "hi", label: "Hindi", native: "हिन्दी" },
    { id: "od", label: "Odia", native: "ଓଡ଼ିଆ" },
    { id: "te", label: "Telugu", native: "తెలుగు" },
  ];

  const currencies = [
    { id: "inr", label: "₹ INR", desc: "Indian Rupee" },
    { id: "usd", label: "$ USD", desc: "US Dollar" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Language</h4>
        <div className="space-y-1">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all ${
                lang === l.id ? "bg-primary/10 border border-primary/30" : "border border-transparent"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.native}</p>
              </div>
              {lang === l.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Currency</h4>
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        <motion.div
          key={item.key}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
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
        <motion.div
          key={item.key}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center justify-between py-4 border-b border-border last:border-0"
        >
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
          </div>
          <ToggleSwitch
            enabled={item.isPrivacy ? privacyMode : extras[item.key as keyof typeof extras]}
            onChange={() => item.isPrivacy ? togglePrivacy() : setExtras(s => ({ ...s, [item.key]: !s[item.key as keyof typeof extras] }))}
          />
        </motion.div>
      ))}
      {privacyMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
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

const settingTitles: Record<string, string> = {
  notifications: "Notifications",
  security: "Login & Security",
  language: "Language & Region",
  accessibility: "Accessibility",
  privacy: "Privacy",
};

const settingIcons: Record<string, typeof Bell> = {
  notifications: Bell,
  security: Shield,
  language: Globe,
  accessibility: Accessibility,
  privacy: EyeOff,
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
              {settingType === "notifications" && <NotificationSettings />}
              {settingType === "security" && <SecuritySettings />}
              {settingType === "language" && <LanguageSettings />}
              {settingType === "accessibility" && <AccessibilitySettings />}
              {settingType === "privacy" && <PrivacySettings />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
