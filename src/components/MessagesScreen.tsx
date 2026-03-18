import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Bell, Clock, ChevronRight, Sparkles, Calendar,
  CheckCircle2, Send, ArrowLeft, Phone, MoreVertical
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

/* ── Types ── */
interface Notification {
  id: string;
  type: "notification" | "promo";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
  iconColor: string;
  iconBg: string;
}

interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "other";
  time: string;
}

/* ── Data ── */
const notifications: Notification[] = [
  {
    id: "n1", type: "notification",
    title: "Booking Confirmed! 🎉",
    body: "Your evening slot at Koraput Garden House on Mar 18 is confirmed. Show the QR code at entry.",
    time: "2 min ago", read: false,
    icon: CheckCircle2, iconColor: "text-success", iconBg: "bg-success/10",
  },
  {
    id: "n2", type: "promo",
    title: "Weekend Special 🔥",
    body: "Get 20% off all bonfire experiences this weekend. Use code FIRE20 at checkout.",
    time: "1 hour ago", read: false,
    icon: Sparkles, iconColor: "text-gold", iconBg: "bg-gold/10",
  },
  {
    id: "n3", type: "notification",
    title: "Reminder: Tomorrow's Trip",
    body: "Don't forget your visit to The Firefly Villa tomorrow at 4 PM. Directions have been shared.",
    time: "3 hours ago", read: true,
    icon: Calendar, iconColor: "text-primary", iconBg: "bg-primary/10",
  },
  {
    id: "n4", type: "notification",
    title: "Rate Your Experience ⭐",
    body: "How was your visit to The Firefly Villa? Share your feedback and earn 50 loyalty points.",
    time: "2 days ago", read: true,
    icon: Bell, iconColor: "text-muted-foreground", iconBg: "bg-secondary",
  },
];

const chatThreads: ChatThread[] = [
  {
    id: "c1", name: "Hushh Support", avatar: "💬", lastMessage: "Your refund has been processed.",
    time: "Yesterday", unread: 0, online: true,
    messages: [
      { id: "m1", text: "Hi, I need help with my Ember Grounds refund", sender: "user", time: "Yesterday 10:30 AM" },
      { id: "m2", text: "Sure! Let me check your booking details.", sender: "other", time: "Yesterday 10:31 AM" },
      { id: "m3", text: "Your refund for Ember Grounds has been processed. It will reflect in 3-5 business days.", sender: "other", time: "Yesterday 10:33 AM" },
      { id: "m4", text: "Thank you so much! 🙏", sender: "user", time: "Yesterday 10:34 AM" },
    ],
  },
  {
    id: "c2", name: "Koraput Garden Host", avatar: "🏡", lastMessage: "Welcome! Looking forward to hosting you.",
    time: "2 hours ago", unread: 1, online: true,
    messages: [
      { id: "m5", text: "Hi! I've booked the evening slot for Mar 18. Any parking instructions?", sender: "user", time: "2 hours ago" },
      { id: "m6", text: "Welcome! Looking forward to hosting you. Free parking is available right at the entrance. I'll send you a map pin closer to the date.", sender: "other", time: "2 hours ago" },
    ],
  },
  {
    id: "c3", name: "Firefly Villa Host", avatar: "🌿", lastMessage: "Hope you enjoyed your stay!",
    time: "Mar 10", unread: 0, online: false,
    messages: [
      { id: "m7", text: "The villa was absolutely magical! Thank you for the warm hospitality.", sender: "user", time: "Mar 10 8:00 PM" },
      { id: "m8", text: "Hope you enjoyed your stay! Do visit again during monsoon season — the fireflies are incredible. 🌟", sender: "other", time: "Mar 10 8:15 PM" },
    ],
  },
];

/* ── Tab Pill ── */
function TabPill({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all ${
        active ? "text-primary-foreground" : "text-muted-foreground"
      }`}
    >
      {active && (
        <motion.div
          layoutId="msgTab"
          className="absolute inset-0 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative flex items-center gap-1.5">
        {label}
        {count !== undefined && count > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
          }`}>
            {count}
          </span>
        )}
      </span>
    </button>
  );
}

/* ── Chat View ── */
function ChatView({ thread, onBack }: { thread: ChatThread; onBack: () => void }) {
  const [messages, setMessages] = useState(thread.messages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      sender: "user",
      time: "Just now",
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `reply-${Date.now()}`, text: "Thanks for your message! I'll get back to you shortly. 😊", sender: "other", time: "Just now" },
      ]);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
        <button onClick={onBack} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative">
            <span className="text-2xl">{thread.avatar}</span>
            {thread.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{thread.name}</p>
            <p className="text-[11px] text-muted-foreground">{thread.online ? "Online" : "Offline"}</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <Phone size={16} className="text-foreground" />
        </button>
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <MoreVertical size={16} className="text-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-foreground rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${
                msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim()}
            whileTap={{ scale: 0.85 }}
            className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send size={18} className="text-primary-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Screen ── */
export default function MessagesScreen() {
  const [tab, setTab] = useState<"notifications" | "chats">("notifications");
  const [activeChat, setActiveChat] = useState<ChatThread | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const unreadNotifCount = notifications.filter((n) => !n.read && !readNotifications.has(n.id)).length;
  const unreadChatCount = chatThreads.reduce((sum, t) => sum + t.unread, 0);

  const markRead = (id: string) => setReadNotifications((prev) => new Set(prev).add(id));

  return (
    <div className="pb-24 bg-mesh min-h-screen">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Messages
        </motion.h1>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mx-5 mt-2 mb-4 flex gap-1 p-1 rounded-full border border-border bg-secondary/50"
      >
        <TabPill active={tab === "notifications"} label="Notifications" count={unreadNotifCount} onClick={() => setTab("notifications")} />
        <TabPill active={tab === "chats"} label="Chats" count={unreadChatCount} onClick={() => setTab("chats")} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mx-5 mb-5 flex gap-3"
      >
        <button
          onClick={() => { setTab("chats"); setActiveChat(chatThreads[0]); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          <MessageCircle size={16} /> Chat with us
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground text-sm font-medium">
          <Clock size={16} /> Call support
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Notifications Tab */}
        {tab === "notifications" && (
          <motion.div
            key="notifs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-5 space-y-2"
          >
            {notifications.map((msg, i) => {
              const isRead = msg.read || readNotifications.has(msg.id);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  onClick={() => markRead(msg.id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-all active:scale-[0.98] ${
                    isRead ? "border-border" : "border-primary/20 bg-primary/[0.03]"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.iconBg}`}>
                      <msg.icon size={18} className={msg.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm truncate ${isRead ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
                          {msg.title}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msg.time}</span>
                          {!isRead && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{msg.body}</p>
                    </div>
                  </div>
                  {msg.type === "promo" && (
                    <div className="mt-3 ml-[52px]">
                      <button className="text-xs font-semibold text-primary flex items-center gap-1">
                        Claim Offer <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Chats Tab */}
        {tab === "chats" && (
          <motion.div
            key="chats"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-5 space-y-2"
          >
            {chatThreads.map((thread, i) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                onClick={() => setActiveChat(thread)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all active:scale-[0.98] ${
                  thread.unread > 0 ? "border-primary/20 bg-primary/[0.03]" : "border-border"
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                      {thread.avatar}
                    </div>
                    {thread.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm truncate ${thread.unread > 0 ? "font-semibold" : "font-medium"} text-foreground`}>
                        {thread.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{thread.time}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                      {thread.unread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {thread.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat View Overlay */}
      <AnimatePresence>
        {activeChat && (
          <ChatView thread={activeChat} onBack={() => setActiveChat(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
