import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }

    // Get user's conversation IDs
    const { data: convos } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

    if (!convos || convos.length === 0) { setUnreadCount(0); return; }

    const ids = convos.map((c) => c.id);
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", ids)
      .eq("read", false)
      .neq("sender_id", user.id);

    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("unread-badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchCount]);

  return unreadCount;
}
