import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { hapticMedium } from "@/lib/haptics";
import type { Notification } from "@/hooks/use-notifications";

/**
 * Listens for new notifications via Realtime and fires
 * in-app toasts + browser Notification API alerts.
 * Mount once at app root level.
 */
export default function NotificationToastProvider() {
  const { user } = useAuth();
  const { toast } = useToast();
  const permissionRef = useRef<NotificationPermission>("default");

  // Track browser permission
  useEffect(() => {
    if ("Notification" in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("push-toast-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as Notification;

          // Haptic feedback
          hapticMedium();

          // In-app toast
          toast({
            title: `${n.icon} ${n.title}`,
            description: n.body,
          });

          // Browser notification (if permitted)
          if (
            "Notification" in window &&
            Notification.permission === "granted" &&
            document.visibilityState === "hidden"
          ) {
            try {
              new window.Notification(n.title, {
                body: n.body,
                icon: "/favicon.ico",
                tag: n.id,
              });
            } catch {
              // Safari / iOS may not support constructor
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return null;
}
