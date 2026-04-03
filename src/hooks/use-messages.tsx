import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  online: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (!convos) { setLoading(false); return; }

    const enriched: Conversation[] = await Promise.all(
      convos.map(async (c: any) => {
        const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;

        // Get other user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", otherId)
          .maybeSingle();

        // Get last message
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get unread count
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .eq("read", false)
          .neq("sender_id", user.id);

        return {
          id: c.id,
          participant_1: c.participant_1,
          participant_2: c.participant_2,
          created_at: c.created_at,
          updated_at: c.updated_at,
          other_user_name: profile?.display_name || "Host",
          other_user_avatar: profile?.avatar_url,
          last_message: lastMsg?.content || "Start a conversation",
          last_message_time: lastMsg?.created_at || c.created_at,
          unread_count: count || 0,
          online: false,
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    return (data as Message[]) || [];
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user) return;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });
    // Update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  }, [user]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);
    fetchConversations();
  }, [user, fetchConversations]);

  const startConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) return existing.id;

    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({ participant_1: user.id, participant_2: otherUserId })
      .select("id")
      .single();

    if (newConvo) {
      fetchConversations();
      return newConvo.id;
    }
    return null;
  }, [user, fetchConversations]);

  return { conversations, loading, fetchMessages, sendMessage, markAsRead, startConversation };
}
