import { motion } from "framer-motion";
import { MessageCircle, Bell, Clock, ChevronRight, Sparkles, Calendar, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  type: "notification" | "chat" | "promo";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
  iconColor: string;
  iconBg: string;
}

const messages: Message[] = [
  {
    id: "1",
    type: "notification",
    title: "Booking Confirmed! 🎉",
    body: "Your evening slot at Koraput Garden House on Mar 18 is confirmed. Show the QR code at entry.",
    time: "2 min ago",
    read: false,
    icon: CheckCircle2,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
  {
    id: "2",
    type: "promo",
    title: "Weekend Special 🔥",
    body: "Get 20% off all bonfire experiences this weekend. Use code FIRE20 at checkout.",
    time: "1 hour ago",
    read: false,
    icon: Sparkles,
    iconColor: "text-gold",
    iconBg: "bg-gold/10",
  },
  {
    id: "3",
    type: "notification",
    title: "Reminder: Tomorrow's Trip",
    body: "Don't forget your visit to The Firefly Villa tomorrow at 4 PM. Directions have been shared.",
    time: "3 hours ago",
    read: true,
    icon: Calendar,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    id: "4",
    type: "chat",
    title: "Hushh Support",
    body: "Hi! Thanks for reaching out. Your refund for Ember Grounds has been processed. It will reflect in 3-5 business days.",
    time: "Yesterday",
    read: true,
    icon: MessageCircle,
    iconColor: "text-muted-foreground",
    iconBg: "bg-secondary",
  },
  {
    id: "5",
    type: "notification",
    title: "Rate Your Experience ⭐",
    body: "How was your visit to The Firefly Villa? Share your feedback and earn 50 loyalty points.",
    time: "2 days ago",
    read: true,
    icon: Bell,
    iconColor: "text-muted-foreground",
    iconBg: "bg-secondary",
  },
];

export default function MessagesScreen() {
  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="pb-24 bg-mesh min-h-screen">
      <div className="px-5 pt-6 pb-2">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Messages
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground mt-1"
        >
          {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
        </motion.p>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mx-5 mt-3 mb-5 flex gap-3"
      >
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          <MessageCircle size={16} /> Chat with us
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground text-sm font-medium">
          <Clock size={16} /> Call support
        </button>
      </motion.div>

      {/* Messages List */}
      <div className="px-5 space-y-2">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={`rounded-2xl border p-4 cursor-pointer transition-all hover:bg-secondary/30 ${
              msg.read ? "border-border" : "border-primary/20 bg-primary/[0.02]"
            }`}
          >
            <div className="flex gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.iconBg}`}>
                <msg.icon size={18} className={msg.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm truncate ${msg.read ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
                    {msg.title}
                  </h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{msg.time}</span>
                    {!msg.read && <div className="w-2 h-2 rounded-full bg-primary" />}
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
        ))}
      </div>
    </div>
  );
}
