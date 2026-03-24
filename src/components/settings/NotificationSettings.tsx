import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Smartphone, Loader2, Mail, MessageSquare, Tag, Calendar, Volume2, VolumeX, Clock, Zap, Star, Users, ShoppingBag, AlertCircle, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { SectionHeader, ToggleSwitch } from "./SettingRow";

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSupported, isSubscribed, isLoading, isiOS, isPWA, permission, subscribe, unsubscribe } = usePushNotifications();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  useEffect(() => {
    if (!user) return;
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

  const handleTestPush = async () => {
    setIsSendingTest(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      toast({ title: "Sending test notification...", description: "You'll receive it in a few seconds" });
      setTimeout(async () => {
        try {
          if (u) {
            await supabase.functions.invoke('send-push-notification', {
              body: { user_id: u.id, payload: { title: "🎉 Test Notification", body: "Push notifications are working! You'll receive booking updates here.", url: "/" } }
            });
          } else if (Notification.permission === 'granted') {
            new Notification("🎉 Test Notification", { body: "Push notifications are working!", icon: '/favicon.ico' });
          }
        } catch (e) { console.error('[Push Test]', e); }
        setIsSendingTest(false);
      }, 3000);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      setIsSendingTest(false);
    }
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
          {isSubscribed && (
            <motion.button initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} whileTap={{ scale: 0.97 }}
              onClick={handleTestPush} disabled={isSendingTest}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-primary flex items-center justify-center gap-1.5"
              style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
              {isSendingTest ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
              Test notification
            </motion.button>
          )}
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
