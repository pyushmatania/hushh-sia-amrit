import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Smartphone, Loader2, Mail, MessageSquare, Tag, Calendar, Volume2, VolumeX, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { SettingRow, SectionHeader, ToggleSwitch } from "./SettingRow";

export default function NotificationSettings() {
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
    orderUpdates: true,
    loyaltyAlerts: true,
    priceDrops: false,
  });
  const [quietHours, setQuietHours] = useState(false);

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
      const { data: { user } } = await supabase.auth.getUser();
      toast({ title: "Sending test notification...", description: "You'll receive it in a few seconds" });
      setTimeout(async () => {
        try {
          if (user) {
            await supabase.functions.invoke('send-push-notification', {
              body: { user_id: user.id, payload: { title: "🎉 Test Notification", body: "Push notifications are working! You'll receive booking updates here.", url: "/" } }
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

  const categories = [
    { title: "Bookings & Trips", items: [
      { key: "bookingUpdates" as const, icon: Calendar, label: "Booking updates", desc: "Confirmations, cancellations, changes" },
      { key: "reminders" as const, icon: Clock, label: "Trip reminders", desc: "Upcoming visit & check-in alerts" },
      { key: "orderUpdates" as const, icon: Bell, label: "Order updates", desc: "Food order status and delivery" },
    ]},
    { title: "Engagement", items: [
      { key: "promotions" as const, icon: Tag, label: "Promotions & deals", desc: "Special offers, flash sales, and discounts" },
      { key: "loyaltyAlerts" as const, icon: Bell, label: "Loyalty rewards", desc: "Points earned, tier upgrades, rewards" },
      { key: "priceDrops" as const, icon: Tag, label: "Price drop alerts", desc: "Notify when wishlisted properties drop in price" },
    ]},
    { title: "Communication", items: [
      { key: "chatMessages" as const, icon: MessageSquare, label: "Chat messages", desc: "Host and support messages" },
      { key: "emailDigest" as const, icon: Mail, label: "Weekly email digest", desc: "Summary of activity and deals" },
    ]},
  ];

  return (
    <div className="space-y-1">
      {/* Push notification hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-4"
        style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone size={16} className="text-primary" />
              <p className="text-sm font-bold text-foreground">Push Notifications</p>
            </div>
            <p className="text-xs text-muted-foreground">
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
            className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-primary flex items-center justify-center gap-1.5"
            style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)" }}
          >
            {isSendingTest ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
            Send test notification
          </motion.button>
        )}
      </motion.div>

      {/* Quiet hours */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between py-4 border-b border-border">
        <div className="flex items-center gap-3 flex-1 mr-4">
          <VolumeX size={16} className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">Quiet Hours</p>
            <p className="text-xs text-muted-foreground">{quietHours ? "10 PM — 8 AM · No notifications" : "Receive notifications anytime"}</p>
          </div>
        </div>
        <ToggleSwitch enabled={quietHours} onChange={setQuietHours} />
      </motion.div>

      {/* Sound toggle */}
      <SettingRow
        icon={settings.sound ? Volume2 : VolumeX}
        label="Notification sound"
        desc="Play sound for new notifications"
        right={<ToggleSwitch enabled={settings.sound} onChange={() => toggle("sound")} />}
      />

      {/* Categorized toggles */}
      {categories.map(cat => (
        <div key={cat.title}>
          <SectionHeader title={cat.title} />
          {cat.items.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
            >
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
    </div>
  );
}
