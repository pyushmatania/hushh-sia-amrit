import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Smartphone, Loader2, Mail, MessageSquare, Tag, Calendar, Volume2, VolumeX, Clock, Zap, Star, Users, ShoppingBag, AlertCircle, Heart, Image, MapPin, Sparkles, Gift, ChefHat, PartyPopper, RefreshCw, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader, ToggleSwitch } from "./SettingRow";

const TEST_NOTIFICATIONS = [
  {
    key: "image",
    label: "Image Notification",
    icon: Image,
    color: "from-pink-500 to-rose-500",
    emoji: "🖼️",
    title: "New Photo Added! 📸",
    body: "A stunning sunset photo was uploaded from The Firefly Villa. Tap to view the gallery.",
    type: "image",
  },
  {
    key: "personalized",
    label: "Personalized Data",
    icon: Users,
    color: "from-violet-500 to-purple-500",
    emoji: "👤",
    title: "Hey {name}! 👋",
    body: "Welcome back, {name}! You have 3 new recommendations based on your preferences.",
    type: "user",
  },
  {
    key: "location",
    label: "Location Based",
    icon: MapPin,
    color: "from-emerald-500 to-teal-500",
    emoji: "📍",
    title: "Nearby Experience! 📍",
    body: "You're near Koraput Garden House — a bonfire night is happening tonight at 7 PM. Join in!",
    type: "location",
  },
  {
    key: "booking",
    label: "Booking Confirmed",
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
    emoji: "🎫",
    title: "Booking Confirmed! 🎉",
    body: "Your stay at The Firefly Villa is confirmed for Dec 28. Check-in at 3 PM. Booking ID: HUSHH-2847.",
    type: "booking",
  },
  {
    key: "order",
    label: "Order Prepared",
    icon: ChefHat,
    color: "from-orange-500 to-amber-500",
    emoji: "🍽️",
    title: "Order Ready! 🍽️",
    body: "Your farm-to-table thali with chai is ready for pickup at counter 2. Enjoy your meal!",
    type: "order",
  },
  {
    key: "stylish",
    label: "Stylish Alert",
    icon: Sparkles,
    color: "from-fuchsia-500 to-pink-500",
    emoji: "✨",
    title: "New Collection Dropped ✨",
    body: "Exclusive curated experiences just launched — Stargazing, Sunrise Yoga & more. Be the first to book!",
    type: "system",
  },
  {
    key: "festival",
    label: "Festival Offer",
    icon: PartyPopper,
    color: "from-yellow-500 to-orange-500",
    emoji: "🎊",
    title: "Holi Special — 40% OFF! 🎊",
    body: "Celebrate with us! Use code HOLI40 for 40% off all outdoor experiences. Valid till March 26.",
    type: "promo",
  },
  {
    key: "reward",
    label: "Loyalty Reward",
    icon: Gift,
    color: "from-cyan-500 to-blue-500",
    emoji: "🎁",
    title: "You Unlocked Gold Tier! 🏆",
    body: "Congratulations! 500 pts earned. Enjoy priority booking, free upgrades & exclusive perks.",
    type: "reward",
  },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSupported, isSubscribed, isLoading, isiOS, isPWA, permission, subscribe, unsubscribe } = usePushNotifications();
  const [isSendingTest, setIsSendingTest] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [checkInterval, setCheckInterval] = useState(0); // 0 = off
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [settings, setSettings] = useState({
    bookingUpdates: true,
    promotions: true,
    reminders: true,
    chatMessages: true,
    emailDigest: false,
    sound: true,
    orderUpdates: true,
    loyaltyAlerts: true,
    priceDrops: false,
    reviewReminders: true,
    securityAlerts: true,
    wishlistUpdates: true,
    referralUpdates: true,
  });
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");
  const [vibrate, setVibrate] = useState(true);

  const fetchUnread = async () => {
    if (!user) return;
    const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false);
    setUnreadCount(count || 0);
  };

  useEffect(() => { fetchUnread(); }, [user]);

  // Auto-check interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (checkInterval > 0) {
      intervalRef.current = setInterval(fetchUnread, checkInterval * 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [checkInterval, user]);

  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const handlePushToggle = async () => {
    try {
      if (isSubscribed) { await unsubscribe(); toast({ title: "Push notifications disabled" }); }
      else { await subscribe(); toast({ title: "Push notifications enabled! 🔔" }); }
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  const sendTestNotification = async (testNotif: typeof TEST_NOTIFICATIONS[0]) => {
    setIsSendingTest(testNotif.key);
    try {
      const displayName = user ? (await supabase.from("profiles").select("display_name").eq("user_id", user.id).single()).data?.display_name || "Guest" : "Guest";
      const title = testNotif.title.replace("{name}", displayName);
      const body = testNotif.body.replace("{name}", displayName);

      if (user) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: testNotif.type,
          title,
          body,
          icon: testNotif.emoji,
        });
        toast({ title: `${testNotif.emoji} ${testNotif.label} sent!`, description: "Check your notification center" });
      } else {
        toast({ title: `${testNotif.emoji} ${title}`, description: body });
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
    setIsSendingTest(null);
  };

  const sendAllTestNotifications = async () => {
    setIsSendingTest("all");
    for (const n of TEST_NOTIFICATIONS) {
      await sendTestNotification(n);
      await new Promise(r => setTimeout(r, 500));
    }
    setIsSendingTest(null);
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setUnreadCount(0);
    toast({ title: "All notifications marked as read ✓" });
  };

  const categories = [
    { title: "Bookings & Trips", items: [
      { key: "bookingUpdates" as const, icon: Calendar, label: "Booking updates", desc: "Confirmations, cancellations, modifications" },
      { key: "reminders" as const, icon: Clock, label: "Trip reminders", desc: "Check-in reminders, day-before alerts" },
      { key: "orderUpdates" as const, icon: ShoppingBag, label: "Order updates", desc: "Food order status & delivery tracking" },
    ]},
    { title: "Deals & Rewards", items: [
      { key: "promotions" as const, icon: Tag, label: "Promotions & deals", desc: "Flash sales, seasonal offers, coupons" },
      { key: "loyaltyAlerts" as const, icon: Star, label: "Loyalty rewards", desc: "Points earned, tier upgrades, expiring rewards" },
      { key: "priceDrops" as const, icon: Zap, label: "Price drop alerts", desc: "When wishlisted properties drop in price" },
      { key: "wishlistUpdates" as const, icon: Heart, label: "Wishlist updates", desc: "Availability changes for saved properties" },
    ]},
    { title: "Social & Community", items: [
      { key: "chatMessages" as const, icon: MessageSquare, label: "Chat messages", desc: "Host & support conversations" },
      { key: "reviewReminders" as const, icon: Star, label: "Review reminders", desc: "Prompt to review after your trip" },
      { key: "referralUpdates" as const, icon: Users, label: "Referral updates", desc: "When friends join using your code" },
    ]},
    { title: "Email & Digest", items: [
      { key: "emailDigest" as const, icon: Mail, label: "Weekly email digest", desc: "Summary of activity, deals & recommendations" },
      { key: "securityAlerts" as const, icon: AlertCircle, label: "Security alerts", desc: "Login from new device, password changes" },
    ]},
  ];

  const enabledCount = Object.values(settings).filter(Boolean).length;
  const intervalOptions = [
    { label: "Off", value: 0 },
    { label: "5s", value: 5 },
    { label: "15s", value: 15 },
    { label: "30s", value: 30 },
    { label: "60s", value: 60 },
  ];

  return (
    <div className="space-y-1">
      {/* Push notification hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone size={16} className="text-primary" />
              <p className="text-sm font-bold text-foreground">Push Notifications</p>
              {unreadCount > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">{unreadCount} unread</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isSupported
                ? isiOS && !isPWA ? "Install as app first (Share → Add to Home Screen)" : "Not supported in this browser"
                : permission === 'denied' ? "Blocked — update browser settings"
                : isSubscribed ? "Enabled — real-time alerts active" : "Tap to enable real-time push alerts"}
            </p>
          </div>
          {isSupported && permission !== 'denied' && (
            isLoading ? <Loader2 size={20} className="animate-spin text-primary" /> :
            <ToggleSwitch enabled={isSubscribed} onChange={handlePushToggle} />
          )}
        </div>
        <div className="flex gap-2 mt-3">
          {unreadCount > 0 && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }}
              onClick={handleMarkAllRead}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-foreground flex items-center justify-center gap-1.5 bg-muted/50">
              Mark all read ({unreadCount})
            </motion.button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">{enabledCount}/{Object.keys(settings).length} notification types enabled</p>
      </motion.div>

      {/* Auto-check interval */}
      <SectionHeader title="Check Interval" />
      <div className="rounded-2xl p-3 mb-3 border border-border bg-card">
        <div className="flex items-center gap-2 mb-2.5">
          <RefreshCw size={14} className={`${checkInterval > 0 ? "text-primary animate-spin" : "text-muted-foreground"}`} style={checkInterval > 0 ? { animationDuration: `${checkInterval}s` } : {}} />
          <p className="text-xs font-semibold text-foreground">Auto-check for new notifications</p>
          {checkInterval > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Every {checkInterval}s</span>}
        </div>
        <div className="flex gap-1.5">
          {intervalOptions.map(opt => (
            <button key={opt.value} onClick={() => { setCheckInterval(opt.value); toast({ title: opt.value ? `Checking every ${opt.value}s` : "Auto-check disabled" }); }}
              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                checkInterval === opt.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test Notification Categories */}
      <SectionHeader title="Test Notifications" />
      <div className="space-y-1.5 mb-4">
        <motion.button whileTap={{ scale: 0.97 }} onClick={sendAllTestNotifications}
          disabled={isSendingTest === "all"}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-primary-foreground flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md disabled:opacity-60">
          {isSendingTest === "all" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send All Test Notifications
        </motion.button>

        <div className="grid grid-cols-2 gap-1.5">
          {TEST_NOTIFICATIONS.map((tn, i) => (
            <motion.button
              key={tn.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              disabled={!!isSendingTest}
              onClick={() => sendTestNotification(tn)}
              className="relative overflow-hidden rounded-xl p-3 text-left transition-all disabled:opacity-50 border border-border bg-card hover:shadow-md group"
            >
              <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${tn.color}`} />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tn.color} flex items-center justify-center`}>
                    {isSendingTest === tn.key ? (
                      <Loader2 size={12} className="animate-spin text-white" />
                    ) : (
                      <tn.icon size={12} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm">{tn.emoji}</span>
                </div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">{tn.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{tn.body.replace("{name}", "you")}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quiet hours */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 mr-4">
            <VolumeX size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Quiet Hours</p>
              <p className="text-xs text-muted-foreground">{quietHours ? `${quietStart} — ${quietEnd} · Silent mode` : "Receive notifications anytime"}</p>
            </div>
          </div>
          <ToggleSwitch enabled={quietHours} onChange={setQuietHours} />
        </div>
        {quietHours && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-3 mt-3 pl-7">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground">Start</label>
              <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="w-full mt-0.5 text-xs bg-muted/50 rounded-lg px-2 py-1.5 text-foreground border border-border" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground">End</label>
              <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="w-full mt-0.5 text-xs bg-muted/50 rounded-lg px-2 py-1.5 text-foreground border border-border" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Sound & Vibration */}
      <div className="flex items-center justify-between py-3.5 border-b border-border">
        <div className="flex items-center gap-3 flex-1 mr-4">
          {settings.sound ? <Volume2 size={16} className="text-muted-foreground" /> : <VolumeX size={16} className="text-muted-foreground" />}
          <div>
            <p className="text-sm font-medium text-foreground">Notification sound</p>
            <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
          </div>
        </div>
        <ToggleSwitch enabled={settings.sound} onChange={() => toggle("sound")} />
      </div>
      <div className="flex items-center justify-between py-3.5 border-b border-border">
        <div className="flex items-center gap-3 flex-1 mr-4">
          <Smartphone size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Vibration</p>
            <p className="text-xs text-muted-foreground">Vibrate on new notifications</p>
          </div>
        </div>
        <ToggleSwitch enabled={vibrate} onChange={setVibrate} />
      </div>

      {/* Categories */}
      {categories.map(cat => (
        <div key={cat.title}>
          <SectionHeader title={cat.title} />
          {cat.items.map((item, i) => (
            <motion.div key={item.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                <item.icon size={15} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <ToggleSwitch enabled={settings[item.key]} onChange={() => toggle(item.key)} />
            </motion.div>
          ))}
        </div>
      ))}

      {/* Quick actions */}
      <SectionHeader title="Quick Actions" />
      <div className="flex gap-2">
        <button onClick={() => { setSettings(Object.fromEntries(Object.keys(settings).map(k => [k, true])) as typeof settings); toast({ title: "All notifications enabled" }); }}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-primary" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
          Enable all
        </button>
        <button onClick={() => { setSettings(Object.fromEntries(Object.keys(settings).map(k => [k, false])) as typeof settings); toast({ title: "All notifications disabled" }); }}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground bg-muted/50">
          Disable all
        </button>
      </div>
    </div>
  );
}
