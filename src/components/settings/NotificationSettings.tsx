import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Smartphone, Loader2, Mail, MessageSquare, Tag, Calendar, Volume2, VolumeX, Clock, Zap, Star, Users, ShoppingBag, AlertCircle, Heart, Image, MapPin, Sparkles, Gift, ChefHat, PartyPopper, RefreshCw, Send, Play, Square, Timer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader, ToggleSwitch } from "./SettingRow";

const PUSH_TEST_NOTIFICATIONS = [
  {
    key: "image",
    label: "📸 Image Notification",
    icon: Image,
    color: "from-pink-500 to-rose-500",
    payload: {
      title: "New Gallery Photo! 📸",
      body: "A stunning sunset was captured at The Firefly Villa. Swipe to see the full gallery.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      tag: "test-image",
    },
  },
  {
    key: "personalized",
    label: "👤 Personalized",
    icon: Users,
    color: "from-violet-500 to-purple-500",
    payload: {
      title: "Hey {name}! 👋",
      body: "Welcome back, {name}! Based on your history, we found 3 new experiences near {location}.",
      tag: "test-personalized",
    },
  },
  {
    key: "location",
    label: "📍 Location Alert",
    icon: MapPin,
    color: "from-emerald-500 to-teal-500",
    payload: {
      title: "You're near a hidden gem! 📍",
      body: "Koraput Garden House is 2km away — a live bonfire night starts at 7 PM tonight. 🔥",
      image: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=800&q=80",
      tag: "test-location",
    },
  },
  {
    key: "booking",
    label: "🎫 Booking Confirmed",
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
    payload: {
      title: "Booking Confirmed! 🎉",
      body: "Your evening slot at The Firefly Villa on Dec 28 is locked in. Check-in at 3 PM. ID: HUSHH-2847",
      tag: "test-booking",
    },
  },
  {
    key: "order",
    label: "🍽️ Order Ready",
    icon: ChefHat,
    color: "from-orange-500 to-amber-500",
    payload: {
      title: "Your order is ready! 🍽️",
      body: "Farm-to-table thali with masala chai is waiting at Counter 2. Enjoy your meal!",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
      tag: "test-order",
    },
  },
  {
    key: "stylish",
    label: "✨ Stylish Alert",
    icon: Sparkles,
    color: "from-fuchsia-500 to-pink-500",
    payload: {
      title: "✨ New Drop: Curated Experiences",
      body: "Stargazing Retreat, Sunrise Yoga & Tribal Thali — exclusive curations just launched. Be first to book!",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      tag: "test-stylish",
    },
  },
  {
    key: "festival",
    label: "🎊 Festival Offer",
    icon: PartyPopper,
    color: "from-yellow-500 to-orange-500",
    payload: {
      title: "🎊 Holi Special — 40% OFF!",
      body: "Celebrate with colors & curations! Use code HOLI40 on all outdoor experiences. Valid till Mar 26.",
      image: "https://images.unsplash.com/photo-1576398289164-c48dc021b4e1?w=800&q=80",
      tag: "test-festival",
    },
  },
  {
    key: "reward",
    label: "🏆 Loyalty Reward",
    icon: Gift,
    color: "from-cyan-500 to-blue-500",
    payload: {
      title: "You unlocked Gold Tier! 🏆",
      body: "500 pts earned! Enjoy priority booking, free upgrades & exclusive member perks.",
      tag: "test-reward",
    },
  },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSupported, isSubscribed, isLoading, isiOS, isPWA, permission, subscribe, unsubscribe } = usePushNotifications();
  const [isSendingTest, setIsSendingTest] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auto-repeat push timer
  const [pushTimer, setPushTimer] = useState(0); // 0 = off, seconds
  const [pushTimerActive, setPushTimerActive] = useState(false);
  const pushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pushIndexRef = useRef(0);
  const [pushSentCount, setPushSentCount] = useState(0);

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
  const [displayName, setDisplayName] = useState("Guest");
  const [userLocation, setUserLocation] = useState("Jeypore");

  // Fetch profile data
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, location").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        if (data?.location) setUserLocation(data.location);
      });
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [user]);

  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const handlePushToggle = async () => {
    try {
      if (isSubscribed) { await unsubscribe(); toast({ title: "Push notifications disabled" }); }
      else { await subscribe(); toast({ title: "Push notifications enabled! 🔔" }); }
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
  };

  // Send a REAL iOS push notification via the edge function
  const sendPushNotification = useCallback(async (testNotif: typeof PUSH_TEST_NOTIFICATIONS[0]) => {
    setIsSendingTest(testNotif.key);
    try {
      const payload: Record<string, any> = { ...testNotif.payload };
      payload.title = payload.title.replace(/\{name\}/g, displayName);
      payload.body = payload.body.replace(/\{name\}/g, displayName).replace(/\{location\}/g, userLocation);
      payload.url = "/";
      payload.icon = "/icon-192.png";

      let pushSent = 0;

      if (user) {
        // Try real push via edge function
        try {
          const { data, error } = await supabase.functions.invoke("send-push-notification", {
            body: { user_id: user.id, payload },
          });
          if (!error) pushSent = data?.sent || 0;
        } catch {}

        // Also insert into notifications table for in-app tracking
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: testNotif.key,
          title: payload.title,
          body: payload.body,
          icon: testNotif.label.split(" ")[0],
        });
      }

      // Always show in-app toast as fallback / confirmation
      toast({
        title: `${testNotif.label.split(" ")[0]} ${payload.title}`,
        description: payload.body,
      });

      // Try browser notification if permitted (works without auth)
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const opts: NotificationOptions = { body: payload.body, icon: "/icon-192.png", tag: payload.tag };
          if (payload.image) (opts as any).image = payload.image;
          new window.Notification(payload.title, opts);
        } catch {}
      }

      setPushSentCount(c => c + 1);
    } catch (err: any) {
      toast({ title: "Notification failed", description: err.message, variant: "destructive" });
    }
    setIsSendingTest(null);
  }, [user, displayName, userLocation, toast]);

  // Send all test pushes
  const sendAllPushNotifications = async () => {
    setIsSendingTest("all");
    for (let i = 0; i < PUSH_TEST_NOTIFICATIONS.length; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, (pushTimer || 5) * 1000));
      await sendPushNotification(PUSH_TEST_NOTIFICATIONS[i]);
    }
    setIsSendingTest(null);
  };

  // Auto-repeat timer — cycles through notification types
  const startPushTimer = useCallback(() => {
    if (pushTimer === 0) return;
    setPushTimerActive(true);
    pushIndexRef.current = 0;
    setPushSentCount(0);

    // Send first one immediately
    const firstNotif = PUSH_TEST_NOTIFICATIONS[0];
    sendPushNotification(firstNotif);
    pushIndexRef.current = 1;

    pushTimerRef.current = setInterval(() => {
      const notif = PUSH_TEST_NOTIFICATIONS[pushIndexRef.current % PUSH_TEST_NOTIFICATIONS.length];
      sendPushNotification(notif);
      pushIndexRef.current++;
    }, pushTimer * 1000);
  }, [pushTimer, sendPushNotification]);

  const stopPushTimer = useCallback(() => {
    if (pushTimerRef.current) clearInterval(pushTimerRef.current);
    pushTimerRef.current = null;
    setPushTimerActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (pushTimerRef.current) clearInterval(pushTimerRef.current); };
  }, []);

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
  const timerOptions = [
    { label: "5s", value: 5 },
    { label: "10s", value: 10 },
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
              <p className="text-sm font-bold text-foreground">iOS Push Notifications</p>
              {unreadCount > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">{unreadCount} unread</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isSupported
                ? isiOS && !isPWA ? "Install as app first (Share → Add to Home Screen)" : "Not supported in this browser"
                : permission === 'denied' ? "Blocked — update browser settings"
                : isSubscribed ? "✅ Enabled — real iOS push alerts active" : "Tap to enable real-time push alerts"}
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

      {/* ═══════════ iOS PUSH TEST SECTION ═══════════ */}
      <SectionHeader title="Test iOS Push Notifications" />
      <p className="text-[11px] text-muted-foreground -mt-2 mb-3 px-1">
        These send <span className="font-bold text-foreground">real iOS push notifications</span> to your device. Some include rich images. Make sure push is enabled above.
      </p>

      {/* Send all button */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={sendAllPushNotifications}
        disabled={!!isSendingTest}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-primary-foreground flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md disabled:opacity-40 mb-2">
        {isSendingTest === "all" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Send All ({pushTimer || 5}s interval)
      </motion.button>

      {/* Individual test buttons */}
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {PUSH_TEST_NOTIFICATIONS.map((tn, i) => {
          const hasImage = !!tn.payload.image;
          return (
            <motion.button
              key={tn.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              disabled={!!isSendingTest}
              onClick={() => sendPushNotification(tn)}
              className="relative overflow-hidden rounded-xl p-3 text-left transition-all disabled:opacity-40 border border-border bg-card hover:shadow-md group"
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
                  {hasImage && (
                    <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-pink-500/15 text-pink-600 dark:text-pink-400">📷 IMAGE</span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-foreground leading-tight">{tn.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-2">
                  {tn.payload.body.replace(/\{name\}/g, displayName).replace(/\{location\}/g, userLocation)}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ═══════════ AUTO-REPEAT PUSH TIMER ═══════════ */}
      <SectionHeader title="Auto-Repeat Push Timer" />
      <div className="rounded-2xl p-4 mb-4 border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <Timer size={16} className={pushTimerActive ? "text-primary animate-pulse" : "text-muted-foreground"} />
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground">
              {pushTimerActive ? `🔴 Running — every ${pushTimer}s` : "Send push notifications on repeat"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {pushTimerActive ? `${pushSentCount} notification(s) sent so far` : "Cycles through all 8 notification types"}
            </p>
          </div>
        </div>

        {/* Interval selector */}
        <div className="flex gap-1.5">
          {timerOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { if (!pushTimerActive) setPushTimer(opt.value); }}
              disabled={pushTimerActive}
              className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                pushTimer === opt.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted disabled:opacity-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Start / Stop */}
        <div className="flex gap-2">
          {!pushTimerActive ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startPushTimer}
              disabled={pushTimer === 0 || !isSubscribed}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-emerald-500 text-white shadow-md disabled:opacity-40"
            >
              <Play size={14} /> Start Timer ({pushTimer}s)
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={stopPushTimer}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-destructive text-destructive-foreground shadow-md"
            >
              <Square size={14} /> Stop Timer
            </motion.button>
          )}
        </div>

        {!isSubscribed && (
          <p className="text-[10px] text-destructive font-semibold text-center">⚠ Enable push notifications above first</p>
        )}
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
