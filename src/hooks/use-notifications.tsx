import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { mockNotifications } from "@/data/mock-users";
import { useDataMode } from "./use-data-mode";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  icon: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const fetch = useCallback(async () => {
    if (!user) {
      // Guest mode — show mock notifications
      setNotifications(mockNotifications as Notification[]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    if (user) {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    }
  }, [user]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    }
  }, [user]);

  return { notifications, unreadCount, loading, markAsRead, markAllRead, refresh: fetch };
}
