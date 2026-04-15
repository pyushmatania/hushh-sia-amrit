import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import {
  MessageCircle, Send, ArrowLeft, Phone, MoreVertical, Search,
  Image, Smile, Mic, Check, CheckCheck, X, Loader2, Sparkles,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, type Conversation, type Message } from "@/hooks/use-messages";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from "date-fns";
import { useAppConfig } from "@/hooks/use-app-config";
import { useDataMode } from "@/hooks/use-data-mode";

/* ═══ Types ═══ */
interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
  cta?: { label: string };
}

const notifications: Notification[] = [
  { id: "n1", type: "booking", title: "Booking Confirmed", body: "Evening slot at Koraput Garden House on Mar 18.", time: "2m", read: false, icon: "🎫", cta: { label: "View" } },
  { id: "n2", type: "promo", title: "Weekend Special", body: "20% off bonfire experiences. Code: FIRE20", time: "1h", read: false, icon: "🎁", cta: { label: "Claim" } },
  { id: "n3", type: "reminder", title: "Tomorrow's Trip", body: "Firefly Villa at 4 PM — don't forget!", time: "3h", read: true, icon: "📍" },
  { id: "n4", type: "reward", title: "150 pts earned", body: "Gold tier loyalty points credited.", time: "1d", read: true, icon: "⭐" },
  { id: "n5", type: "review", title: "Rate Your Experience", body: "Share feedback and earn 50 bonus points.", time: "2d", read: true, icon: "💬", cta: { label: "Review" } },
];

const mockThreads = [
  { id: "c1", name: "Hushh Concierge", avatar: "💎", lastMessage: "Your refund has been processed successfully.", time: "Yesterday", unread: 0, online: true, verified: true, typing: false, pinned: true },
  { id: "c2", name: "Koraput Garden Host", avatar: "🏡", lastMessage: "Welcome! Looking forward to hosting you.", time: "2h ago", unread: 2, online: true, verified: true, typing: true, pinned: false },
  { id: "c5", name: "Chef Meera", avatar: "👩‍🍳", lastMessage: "The bonfire dinner setup is ready!", time: "1h ago", unread: 1, online: true, verified: true, typing: false, pinned: false },
  { id: "c3", name: "Firefly Villa Host", avatar: "🌿", lastMessage: "Come back during monsoon season!", time: "Mar 10", unread: 0, online: false, verified: false, typing: false, pinned: false },
  { id: "c4", name: "Chef Arjun", avatar: "👨‍🍳", lastMessage: "Tribal thali for your group — see you at 7!", time: "Mar 8", unread: 0, online: false, verified: true, typing: false, pinned: false },
];

const mockMessages: Record<string, Array<{ id: string; text: string; sender: "user" | "other"; time: string; status?: "sent" | "delivered" | "read"; imageUrl?: string }>> = {
  c1: [
    { id: "m1", text: "Hi, I need help with my Ember Grounds refund", sender: "user", time: "Yesterday 10:30 AM", status: "read" },
    { id: "m2", text: "Sure! Let me check your booking details. 🔍", sender: "other", time: "Yesterday 10:31 AM" },
    { id: "m3", text: "Refund of ₹2,499 has been initiated for booking #HUSHH-X7K2.", sender: "other", time: "Yesterday 10:32 AM" },
    { id: "m4", text: "It will reflect in 3-5 business days.", sender: "other", time: "Yesterday 10:33 AM" },
    { id: "m5", text: "Thank you so much! 🙏", sender: "user", time: "Yesterday 10:34 AM", status: "read" },
    { id: "m6", text: "Happy to help! ✨", sender: "other", time: "Yesterday 10:34 AM" },
  ],
  c2: [
    { id: "m7", text: "Any parking instructions for Mar 18?", sender: "user", time: "2 hours ago", status: "delivered" },
    { id: "m8", text: "Welcome! Free parking at the entrance gate. 🌸", sender: "other", time: "2 hours ago" },
  ],
  c3: [
    { id: "m10", text: "The villa was magical! Thank you!", sender: "user", time: "Mar 10, 8:00 PM", status: "read" },
    { id: "m12", text: "Come back during monsoon — the fireflies are incredible. 🌧️✨", sender: "other", time: "Mar 10, 8:15 PM" },
  ],
  c4: [
    { id: "m13", text: "Can you prepare a tribal thali for 6?", sender: "user", time: "Mar 8, 3:00 PM", status: "read" },
    { id: "m14", text: "Absolutely! See you at 7! 🍛", sender: "other", time: "Mar 8, 3:15 PM" },
  ],
  c5: [
    { id: "m16", text: "What's on the menu tonight?", sender: "user", time: "1 hour ago", status: "delivered" },
    { id: "m17", text: "Bamboo chicken, tribal dal, rice in banana leaf 🔥", sender: "other", time: "1 hour ago" },
    { id: "m18", text: "The bonfire dinner setup is ready!", sender: "other", time: "1 hour ago" },
  ],
};

const quickReplies = ["Thanks! 🙏", "When should I arrive?", "Can I bring pets?", "Is parking available?"];

/* ═══ Helpers ═══ */
async function uploadChatImage(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("chat-images").upload(path, file, { contentType: file.type });
  if (error) return null;
  return supabase.storage.from("chat-images").getPublicUrl(path).data.publicUrl;
}

function MessageStatus({ status }: { status?: "sent" | "delivered" | "read" }) {
  if (!status) return null;
  if (status === "read") return <CheckCheck size={11} className="text-primary" />;
  if (status === "delivered") return <CheckCheck size={11} className="text-muted-foreground/40" />;
  return <Check size={11} className="text-muted-foreground/40" />;
}

function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" onClick={onClose}><X size={18} className="text-white" /></button>
      <img src={url} alt="" className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl" />
    </motion.div>
  );
}

/* ═══ Thread Row ═══ */
function ThreadRow({ thread, onClick }: {
  thread: { id: string; name: string; avatar: string; lastMessage: string; time: string; unread: number; online: boolean; typing: boolean; pinned: boolean };
  onClick: () => void;
}) {
  const hasUnread = thread.unread > 0;

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-5 py-3 active:bg-muted/20 transition-colors text-left"
      whileTap={{ scale: 0.985 }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
          hasUnread ? "bg-primary/10" : "bg-muted/50"
        }`}>
          {thread.avatar}
        </div>
        {thread.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-[14px] truncate ${hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
            {thread.name}
          </span>
          <span className={`text-[11px] shrink-0 ${hasUnread ? "text-primary font-medium" : "text-muted-foreground/40"}`}>
            {thread.time}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          {thread.typing ? (
            <span className="text-[13px] text-primary font-medium italic">typing…</span>
          ) : (
            <span className={`text-[13px] truncate ${hasUnread ? "text-foreground/70" : "text-muted-foreground/50"}`}>
              {thread.lastMessage}
            </span>
          )}
          {hasUnread && (
            <span className="shrink-0 min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/* ═══ Chat View (shared between mock & real) ═══ */
function ChatShell({
  name, avatar, online, typing, onBack,
  messages: chatMessages,
  onSend,
  userId,
  sending,
}: {
  name: string; avatar: React.ReactNode; online: boolean; typing?: boolean; onBack: () => void;
  messages: Array<{ id: string; text: string; isUser: boolean; time: string; status?: "sent" | "delivered" | "read"; imageUrl?: string }>;
  onSend: (text: string) => void;
  userId?: string;
  sending?: boolean;
}) {
  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    onSend(msg);
    setInput("");
    setShowQuick(false);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border/20 bg-background/95 backdrop-blur-md shrink-0">
        <button onClick={onBack} className="text-foreground active:scale-90 transition-transform -ml-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative shrink-0">{avatar}</div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-foreground truncate leading-tight">{name}</p>
            <p className="text-[11px] text-muted-foreground/50 leading-tight">
              {typing ? (
                <span className="text-primary">typing…</span>
              ) : online ? "Online" : "Last seen recently"}
            </p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors">
          <Phone size={16} />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {chatMessages.map((msg, i) => {
          const prevMsg = chatMessages[i - 1];
          const showDate = !prevMsg || msg.time.split(",")[0] !== prevMsg.time.split(",")[0];

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-[10px] font-medium text-muted-foreground/35 bg-muted/20 px-3 py-0.5 rounded-full">
                    {msg.time.split(",")[0] || msg.time}
                  </span>
                </div>
              )}
              <div className={`flex mb-1 ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  msg.isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/30 text-foreground rounded-bl-sm"
                }`}>
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt=""
                      className="rounded-xl max-w-[200px] max-h-[200px] object-cover cursor-pointer mb-1"
                      onClick={() => setViewingImage(msg.imageUrl!)}
                    />
                  )}
                  {msg.text && <p className="text-[13px] leading-relaxed">{msg.text}</p>}
                  <div className={`flex items-center justify-end gap-1 mt-0.5 ${
                    msg.isUser ? "text-primary-foreground/35" : "text-muted-foreground/30"
                  }`}>
                    <span className="text-[9px]">{msg.time.includes(",") ? msg.time.split(",")[1]?.trim() : msg.time}</span>
                    {msg.isUser && <MessageStatus status={msg.status} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start mt-1">
            <div className="bg-muted/30 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/25"
                  animate={{ y: [0, -4, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuick && chatMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="px-4 pb-1.5 flex gap-1.5 overflow-x-auto hide-scrollbar"
          >
            {quickReplies.map(reply => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full border border-border/40 text-foreground/70 bg-background active:scale-95 transition-transform whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-3 py-2 border-t border-border/15 bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-1.5">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground/40 active:scale-90 hover:text-foreground transition-colors">
            <Image size={18} />
          </button>
          <div className="flex-1 bg-muted/20 rounded-full flex items-end border border-border/10">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              onFocus={() => setShowQuick(false)}
              placeholder="Message…"
              className="flex-1 bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/30 outline-none"
            />
            <button className="px-3 py-2.5 text-muted-foreground/30 hover:text-muted-foreground transition-colors">
              <Smile size={16} />
            </button>
          </div>
          {input.trim() ? (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => handleSend()}
              disabled={sending}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={14} className="text-primary-foreground animate-spin" />
              ) : (
                <Send size={14} className="text-primary-foreground ml-0.5" />
              )}
            </motion.button>
          ) : (
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground/40 active:scale-90 hover:text-foreground transition-colors">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewingImage && <ImageViewer url={viewingImage} onClose={() => setViewingImage(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ Mock Chat View ═══ */
function MockChatView({ threadId, thread, onBack }: { threadId: string; thread: typeof mockThreads[0]; onBack: () => void }) {
  const [messages, setMessages] = useState(mockMessages[threadId] || []);

  const handleSend = (text: string) => {
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, text, sender: "user" as const, time: "Just now", status: "sent" as const }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: `r-${Date.now()}`, text: "Thanks for your message! I'll get back shortly. 😊", sender: "other" as const, time: "Just now" }]);
    }, 1500);
  };

  const chatMessages = messages.map(m => ({
    id: m.id, text: m.text, isUser: m.sender === "user", time: m.time, status: m.status, imageUrl: m.imageUrl,
  }));

  return (
    <ChatShell
      name={thread.name}
      avatar={<div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center text-base">{thread.avatar}</div>}
      online={thread.online}
      typing={thread.typing}
      onBack={onBack}
      messages={chatMessages}
      onSend={handleSend}
    />
  );
}

/* ═══ Realtime Chat View ═══ */
function RealtimeChatView({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { user } = useAuth();
  const { fetchMessages, sendMessage, markAsRead } = useMessages();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages(conversation.id).then(msgs => { setMessages(msgs); markAsRead(conversation.id); });
  }, [conversation.id, fetchMessages, markAsRead]);

  useEffect(() => {
    const channel = supabase.channel(`chat-${conversation.id}`).on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
      (payload: any) => { setMessages(prev => [...prev, payload.new as Message]); if (payload.new.sender_id !== user?.id) markAsRead(conversation.id); }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversation.id, user?.id, markAsRead]);

  const handleSend = async (text: string) => {
    if (sending) return;
    setSending(true);
    await sendMessage(conversation.id, text);
    setSending(false);
  };

  const chatMessages = messages.map(m => ({
    id: m.id,
    text: m.content.replace(/\[image:.*?\]\s?/, "").trim(),
    isUser: m.sender_id === user?.id,
    time: format(new Date(m.created_at), "MMM d, h:mm a"),
    imageUrl: m.content.match(/\[image:(.*?)\]/)?.[1],
  }));

  const emoji = conversation.other_user_name.includes("Support") ? "💎" : "🏡";

  return (
    <ChatShell
      name={conversation.other_user_name}
      avatar={
        conversation.other_user_avatar
          ? <img src={conversation.other_user_avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
          : <div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center text-base">{emoji}</div>
      }
      online={conversation.online}
      onBack={onBack}
      messages={chatMessages}
      onSend={handleSend}
      userId={user?.id}
      sending={sending}
    />
  );
}

/* ═══ Main Screen ═══ */
export default function MessagesScreen() {
  const { user } = useAuth();
  const { conversations, loading } = useMessages();
  const appConfig = useAppConfig();
  const { isRealMode } = useDataMode();
  const brandName = appConfig.app_name || "Hushh";
  const [tab, setTab] = useState<"chats" | "updates">("chats");
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [activeMockThread, setActiveMockThread] = useState<typeof mockThreads[0] | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const dynamicMockThreads = useMemo(() =>
    isRealMode ? [] : mockThreads.map(t => t.id === "c1" ? { ...t, name: `${brandName} Concierge` } : t),
    [brandName, isRealMode]
  );

  const dynamicNotifications = useMemo(() => isRealMode ? [] : notifications, [isRealMode]);

  const unreadNotifCount = dynamicNotifications.filter(n => !n.read && !readNotifications.has(n.id)).length;
  const unreadChatCount = user
    ? conversations.reduce((s, c) => s + c.unread_count, 0)
    : dynamicMockThreads.reduce((s, t) => s + t.unread, 0);

  const chatThreads = user
    ? conversations.map(c => ({
        id: c.id, name: c.other_user_name,
        avatar: c.other_user_name.includes("Support") ? "💎" : "🏡",
        lastMessage: c.last_message,
        time: formatDistanceToNow(new Date(c.last_message_time), { addSuffix: true }),
        unread: c.unread_count, online: false, typing: false, pinned: false,
        conversation: c,
      }))
    : dynamicMockThreads.map(t => ({ ...t, conversation: null as Conversation | null }));

  const filteredChats = searchQuery
    ? chatThreads.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : chatThreads;

  return (
    <div className="pb-24 min-h-screen bg-background md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Messages</h1>
          <button
            onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(""); }}
            className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
          >
            {showSearch ? <X size={15} /> : <Search size={15} />}
          </button>
        </div>

        {/* Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full bg-muted/20 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/30 outline-none border border-border/10 focus:border-primary/20 transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 p-0.5 rounded-xl bg-muted/20 mb-1">
          {(["chats", "updates"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 py-2 text-[13px] font-medium rounded-lg transition-all ${
                tab === t ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              {tab === t && (
                <motion.div
                  layoutId="msgTab"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center justify-center gap-1.5">
                {t === "chats" ? "Chats" : "Updates"}
                {((t === "chats" && unreadChatCount > 0) || (t === "updates" && unreadNotifCount > 0)) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === "chats" && (
          <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {/* Concierge banner */}
            <div className="px-5 py-2">
              <button
                onClick={() => {
                  if (user && conversations.length > 0) setActiveConvo(conversations[0]);
                  else if (!user) setActiveMockThread(dynamicMockThreads[0]);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-primary/[0.06] border border-primary/10 active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-semibold text-foreground">{brandName} Concierge</p>
                  <p className="text-[11px] text-muted-foreground/50">Get instant help with bookings</p>
                </div>
                <ArrowLeft size={14} className="text-primary/40 rotate-180" />
              </button>
            </div>

            {/* Thread list */}
            <div>
              {filteredChats.map(t => (
                <ThreadRow
                  key={t.id}
                  thread={t}
                  onClick={() => {
                    if (t.conversation) setActiveConvo(t.conversation);
                    else setActiveMockThread(dynamicMockThreads.find(mt => mt.id === t.id) || null);
                  }}
                />
              ))}
            </div>

            {filteredChats.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full bg-muted/20 mx-auto mb-3 flex items-center justify-center">
                  <MessageCircle size={22} className="text-muted-foreground/20" />
                </div>
                <p className="text-sm font-medium text-foreground/60">No conversations yet</p>
                <p className="text-xs text-muted-foreground/35 mt-1">Messages from hosts will appear here</p>
              </div>
            )}
          </motion.div>
        )}

        {tab === "updates" && (
          <motion.div key="updates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="px-5">
            {dynamicNotifications.map((notif, i) => {
              const isRead = notif.read || readNotifications.has(notif.id);
              return (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setReadNotifications(prev => new Set(prev).add(notif.id))}
                  className={`w-full flex items-start gap-3 py-3.5 text-left active:bg-muted/10 transition-colors ${
                    i > 0 ? "border-t border-border/10" : ""
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{notif.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[13px] leading-snug ${isRead ? "font-medium text-foreground/50" : "font-semibold text-foreground"}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground/35 shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground/50 mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                    {notif.cta && (
                      <span className="inline-flex items-center mt-1 text-[11px] font-semibold text-primary">
                        {notif.cta.label}
                      </span>
                    )}
                  </div>
                  {!isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat overlays */}
      <AnimatePresence>
        {activeConvo && <RealtimeChatView conversation={activeConvo} onBack={() => setActiveConvo(null)} />}
        {activeMockThread && <MockChatView threadId={activeMockThread.id} thread={activeMockThread} onBack={() => setActiveMockThread(null)} />}
      </AnimatePresence>
    </div>
  );
}
