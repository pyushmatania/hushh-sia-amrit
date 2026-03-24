import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Capacitor } from "@capacitor/core";

const DISMISSED_KEY = "hushh_notif_perm_dismissed";

/**
 * A dismissible banner prompting users to enable browser notifications.
 * Only shows if: logged in, browser supports Notification API, permission is "default".
 */
export default function NotificationPermissionBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    const isNative = Capacitor.isNativePlatform();
    if (!isNative && !("Notification" in window)) return;
    if (!isNative && Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    // On native, check if we already have a push token
    if (isNative && localStorage.getItem("hushh_native_push_token")) return;
    // Delay showing to avoid overwhelming on first load
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, [user]);

  const handleEnable = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive === "granted") {
          await PushNotifications.register();
        }
      } else {
        const result = await Notification.requestPermission();
        if (result === "granted") {
          new window.Notification("Notifications Enabled 🎉", {
            body: "You'll now get alerts for bookings, messages & more.",
            icon: "/favicon.ico",
          });
        }
      }
    } catch {
      // iOS Safari doesn't support this
    }
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-3 right-3 z-[60] glass rounded-2xl p-4 shadow-xl border border-border"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center"
          >
            <X size={12} className="text-muted-foreground" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bell size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Never miss an update
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get instant alerts for bookings, messages & promotions.
              </p>
              <Button
                size="sm"
                onClick={handleEnable}
                className="mt-2.5 rounded-full text-xs h-8 px-4"
              >
                Enable Notifications
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
