import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Bell, Clock, ChevronRight, Sparkles, Calendar,
  CheckCircle2, Send, ArrowLeft, Phone, MoreVertical, Search,
  Image, Smile, Mic, Check, CheckCheck, Pin, Archive,
  HeadphonesIcon, ShieldCheck, Star, Gift, Megaphone, X, Loader2,
  MapPin, History, Plane,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, type Conversation, type Message } from "@/hooks/use-messages";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from "date-fns";

/* ═══ Types ═══ */
interface Notification {
  id: string;
  type: "booking" | "promo" | "reminder" | "review" | "reward" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
  accent: string;
  cta?: { label: string; action?: string };
}

/* ═══ Static Data ═══ */
const notifications: Notification[] = [
  {
    id: "n1", type: "booking",
    title: "Booking Confirmed! 🎉",
    body: "Your evening slot at Koraput Garden House on Mar 18 is confirmed. Show the QR code at entry.",
    time: "2 min ago", read: false,
    icon: "🎫", accent: "from-emerald-500/20 to-emerald-500/5",
    cta: { label: "View Booking" },
  },
  {
    id: "n2", type: "promo",
    title: "Weekend Special 🔥",
    body: "Get 20% off all bonfire experiences this weekend. Use code FIRE20 at checkout.",
    time: "1 hour ago", read: false,
    icon: "🎁", accent: "from-amber-500/20 to-amber-500/5",
    cta: { label: "Claim Offer" },
  },
  {
    id: "n3", type: "reminder",
    title: "Tomorrow's Trip 📍",
    body: "Don't forget your visit to The Firefly Villa tomorrow at 4 PM. Directions have been shared.",
    time: "3 hours ago", read: true,
    icon: "📍", accent: "from-primary/20 to-primary/5",
    cta: { label: "Get Directions" },
  },
  {
    id: "n4", type: "reward",
    title: "You earned 150 pts! ⭐",
    body: "Your loyalty points from The Firefly Villa visit have been credited. You're now Gold tier!",
    time: "1 day ago", read: true,
    icon: "⭐", accent: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    id: "n5", type: "review",
    title: "Rate Your Experience",
    body: "How was your visit to The Firefly Villa? Share your feedback and earn 50 extra loyalty points.",
    time: "2 days ago", read: true,
    icon: "💬", accent: "from-violet-500/20 to-violet-500/5",
    cta: { label: "Write Review" },
  },
  {
    id: "n6", type: "system",
    title: "New Feature: Map View 🗺️",
    body: "Explore all venues near you on our new interactive map. Tap to try it out!",
    time: "3 days ago", read: true,
    icon: "🗺️", accent: "from-sky-500/20 to-sky-500/5",
    cta: { label: "Explore Map" },
  },
];

type TripStatus = "active" | "upcoming" | "past" | "support";

const mockThreads = [
  {
    id: "c1", name: "Hushh Concierge", avatar: "💎", lastMessage: "Your refund has been processed successfully.",
    time: "Yesterday", unread: 0, online: true, verified: true, role: "Support",
    typing: false, pinned: true,
    tripStatus: "support" as TripStatus, tripLabel: "24/7 Support",
  },
  {
    id: "c2", name: "Koraput Garden Host", avatar: "🏡", lastMessage: "Welcome! Looking forward to hosting you tomorrow.",
    time: "2 hours ago", unread: 2, online: true, verified: true, role: "Superhost",
    typing: true, pinned: false,
    tripStatus: "active" as TripStatus, tripLabel: "Mar 18 · Evening Slot",
  },
  {
    id: "c5", name: "Chef Meera", avatar: "👩‍🍳", lastMessage: "The bonfire dinner setup is ready! Come anytime after 7.",
    time: "1 hour ago", unread: 1, online: true, verified: true, role: "Chef",
    typing: false, pinned: false,
    tripStatus: "active" as TripStatus, tripLabel: "Mar 18 · Evening Slot",
  },
  {
    id: "c3", name: "Firefly Villa Host", avatar: "🌿", lastMessage: "Hope you enjoyed your stay! Come back during monsoon 🌧️",
    time: "Mar 10", unread: 0, online: false, verified: false, role: "Host",
    typing: false, pinned: false,
    tripStatus: "past" as TripStatus, tripLabel: "Mar 8-10 · Weekend Stay",
  },
  {
    id: "c4", name: "Chef Arjun", avatar: "👨‍🍳", lastMessage: "I'll prepare the tribal thali for your group. See you at 7!",
    time: "Mar 8", unread: 0, online: false, verified: true, role: "Service Provider",
    typing: false, pinned: false,
    tripStatus: "past" as TripStatus, tripLabel: "Mar 8-10 · Weekend Stay",
  },
  {
    id: "c6", name: "Rooftop Lounge Host", avatar: "🌃", lastMessage: "Thanks for visiting! Your review means a lot to us.",
    time: "Feb 25", unread: 0, online: false, verified: true, role: "Host",
    typing: false, pinned: false,
    tripStatus: "past" as TripStatus, tripLabel: "Feb 24-25 · Night Slot",
  },
];

const mockMessages: Record<string, Array<{ id: string; text: string; sender: "user" | "other"; time: string; reactions?: string[]; status?: "sent" | "delivered" | "read"; imageUrl?: string }>> = {
  c1: [
    { id: "m1", text: "Hi, I need help with my Ember Grounds refund", sender: "user", time: "Yesterday 10:30 AM", status: "read" },
    { id: "m2", text: "Sure! Let me check your booking details. One moment please… 🔍", sender: "other", time: "Yesterday 10:31 AM" },
    { id: "m3", text: "I found your booking #HUSHH-X7K2. The refund of ₹2,499 has been initiated.", sender: "other", time: "Yesterday 10:32 AM" },
    { id: "m4", text: "Your refund has been processed successfully. It will reflect in 3-5 business days. Is there anything else I can help with?", sender: "other", time: "Yesterday 10:33 AM" },
    { id: "m5", text: "Thank you so much! That was super fast 🙏", sender: "user", time: "Yesterday 10:34 AM", status: "read", reactions: ["❤️"] },
    { id: "m6", text: "Happy to help! Have a wonderful day ahead! ✨", sender: "other", time: "Yesterday 10:34 AM", reactions: ["👍"] },
  ],
  c2: [
    { id: "m7", text: "Hi! I've booked the evening slot for Mar 18. Any parking instructions?", sender: "user", time: "2 hours ago", status: "delivered" },
    { id: "m8", text: "Welcome! Looking forward to hosting you tomorrow. 🌸", sender: "other", time: "2 hours ago" },
    { id: "m9", text: "Free parking is available right at the entrance gate. I'll share the location pin shortly.", sender: "other", time: "2 hours ago" },
  ],
  c3: [
    { id: "m10", text: "The villa was absolutely magical! Thank you for the warm hospitality.", sender: "user", time: "Mar 10, 8:00 PM", status: "read" },
    { id: "m11", text: "So glad you loved it! 🌟", sender: "other", time: "Mar 10, 8:10 PM", reactions: ["❤️"] },
    { id: "m12", text: "Hope you enjoyed your stay! Come back during monsoon season — the fireflies are incredible. 🌧️✨", sender: "other", time: "Mar 10, 8:15 PM" },
  ],
  c4: [
    { id: "m13", text: "Hi Chef Arjun! Can you prepare a tribal thali for 6 guests?", sender: "user", time: "Mar 8, 3:00 PM", status: "read" },
    { id: "m14", text: "Absolutely! I'll prepare the tribal thali for your group. The menu includes badi chura, pakhala, ambil, and more. See you at 7!", sender: "other", time: "Mar 8, 3:15 PM" },
    { id: "m15", text: "Sounds amazing! Can't wait 🍛", sender: "user", time: "Mar 8, 3:16 PM", status: "read", reactions: ["🔥"] },
  ],
  c5: [
    { id: "m16", text: "Hi Chef Meera! What's on the menu tonight?", sender: "user", time: "1 hour ago", status: "delivered" },
    { id: "m17", text: "Tonight we have a special bonfire menu — bamboo chicken, tribal dal, and rice cooked in banana leaf 🔥", sender: "other", time: "1 hour ago" },
    { id: "m18", text: "The bonfire dinner setup is ready! Come anytime after 7.", sender: "other", time: "1 hour ago" },
  ],
  c6: [
    { id: "m19", text: "Beautiful rooftop setup! Thank you for the amazing evening 🌃", sender: "user", time: "Feb 25, 10:00 PM", status: "read" },
    { id: "m20", text: "Thanks for visiting! Your review means a lot to us. Hope to see you again soon! ⭐", sender: "other", time: "Feb 25, 10:30 PM", reactions: ["❤️"] },
  ],
};

const quickReplies = [
  "Thanks! 🙏",
  "When should I arrive?",
  "Can I bring pets?",
  "Is parking available?",
  "See you there!",
];

/* ═══ Image Upload Helper ═══ */
async function uploadChatImage(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("chat-images").upload(path, file, { contentType: file.type });
  if (error) { console.error("Upload error:", error); return null; }
  const { data } = supabase.storage.from("chat-images").getPublicUrl(path);
  return data.publicUrl;
}

/* ═══ Image Preview Bar ═══ */
function ImagePreviewBar({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="px-4 pb-2">
      <div className="relative inline-block rounded-xl overflow-hidden border border-border bg-secondary">
        <img src={url} alt="Preview" className="w-20 h-20 object-cover" />
        <button onClick={onRemove}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/70 text-background flex items-center justify-center">
          <X size={12} />
        </button>
      </div>
    </motion.div>
  );
}

/* ═══ Image Message Bubble ═══ */
function ImageBubble({ url, onClick }: { url: string; onClick?: () => void }) {
  return (
    <motion.img
      src={url} alt="Shared image"
      onClick={onClick}
      className="rounded-xl max-w-[220px] max-h-[220px] object-cover cursor-pointer"
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.95 }}
    />
  );
}

/* ═══ Fullscreen Image Viewer ═══ */
function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" onClick={onClose}>
        <X size={20} className="text-white" />
      </button>
      <img src={url} alt="" className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg" />
    </motion.div>
  );
}


function formatDateHeader(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function MessageStatus({ status }: { status?: "sent" | "delivered" | "read" }) {
  if (!status) return null;
  if (status === "read") return <CheckCheck size={13} className="text-sky-400" />;
  if (status === "delivered") return <CheckCheck size={13} className="text-muted-foreground/60" />;
  return <Check size={13} className="text-muted-foreground/60" />;
}

/* ═══ Typing Indicator ═══ */
function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/40"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══ Tab Pill ═══ */
function TabPill({ active, label, count, icon: Icon, onClick }: {
  active: boolean; label: string; count?: number; icon: typeof Bell; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`relative flex-1 px-3 py-2.5 rounded-2xl text-[13px] font-semibold transition-all ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
      {active && (
        <motion.div layoutId="msgTab" className="absolute inset-0 bg-primary rounded-2xl" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
      )}
      <span className="relative flex items-center justify-center gap-1.5">
        <Icon size={15} />
        {label}
        {count !== undefined && count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-[9px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ${
              active ? "bg-primary-foreground/25 text-primary-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </span>
    </button>
  );
}

/* ═══ Notification Card ═══ */
function NotificationCard({ notif, index, isRead, onRead }: {
  notif: Notification; index: number; isRead: boolean; onRead: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + index * 0.04, duration: 0.35 }}
      onClick={onRead}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.98] ${
        isRead ? "bg-secondary/30" : "bg-gradient-to-r " + notif.accent
      }`}
      style={{ border: isRead ? "1px solid hsl(var(--border))" : "1px solid hsl(var(--primary) / 0.15)" }}
    >
      {/* Unread indicator bar */}
      {!isRead && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-primary" />
      )}

      <div className="p-4 pl-5">
        <div className="flex gap-3">
          <div className="text-2xl shrink-0 mt-0.5">{notif.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`text-[13px] leading-tight ${isRead ? "font-medium text-foreground/80" : "font-semibold text-foreground"}`}>
                {notif.title}
              </h4>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{notif.time}</span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{notif.body}</p>
            {notif.cta && (
              <button className="mt-2.5 text-[11px] font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                {notif.cta.label} <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Chat Thread Card with Swipe Gestures ═══ */
function ThreadCard({ thread, index, onClick, onPin, onArchive }: {
  thread: typeof mockThreads[0]; index: number; onClick: () => void;
  onPin?: (id: string) => void; onArchive?: (id: string) => void;
}) {
  const [swipeState, setSwipeState] = useState<"idle" | "pin" | "archive">("idle");
  const [dismissed, setDismissed] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 80;

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipedFar = Math.abs(info.offset.x) > SWIPE_THRESHOLD || Math.abs(info.velocity.x) > 500;
    if (swipedFar && info.offset.x > 0) {
      // Swiped right → pin/unpin
      onPin?.(thread.id);
      setSwipeState("idle");
    } else if (swipedFar && info.offset.x < 0) {
      // Swiped left → archive
      setDismissed(true);
      setTimeout(() => onArchive?.(thread.id), 300);
    }
    setSwipeState("idle");
  };

  if (dismissed) {
    return (
      <motion.div
        initial={{ height: "auto", opacity: 1 }}
        animate={{ height: 0, opacity: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 + index * 0.04, duration: 0.35 }}
      className="relative rounded-2xl overflow-hidden"
      ref={constraintsRef}
    >
      {/* Background actions revealed on swipe */}
      <div className="absolute inset-0 flex">
        {/* Right-swipe: Pin action (left side) */}
        <div className={`flex items-center justify-center w-1/2 transition-colors duration-200 ${
          swipeState === "pin" ? "bg-amber-500" : "bg-amber-500/70"
        }`}>
          <motion.div
            animate={{ scale: swipeState === "pin" ? 1.2 : 1 }}
            className="flex flex-col items-center gap-1"
          >
            <Pin size={20} className="text-white rotate-45" />
            <span className="text-[10px] font-bold text-white">
              {thread.pinned ? "Unpin" : "Pin"}
            </span>
          </motion.div>
        </div>
        {/* Left-swipe: Archive action (right side) */}
        <div className={`flex items-center justify-center w-1/2 transition-colors duration-200 ${
          swipeState === "archive" ? "bg-red-500" : "bg-red-500/70"
        }`}>
          <motion.div
            animate={{ scale: swipeState === "archive" ? 1.2 : 1 }}
            className="flex flex-col items-center gap-1"
          >
            <Archive size={20} className="text-white" />
            <span className="text-[10px] font-bold text-white">Archive</span>
          </motion.div>
        </div>
      </div>

      {/* Draggable card foreground */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.15}
        onDrag={(_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) setSwipeState("pin");
          else if (info.offset.x < -SWIPE_THRESHOLD) setSwipeState("archive");
          else setSwipeState("idle");
        }}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        className={`relative z-10 rounded-2xl cursor-pointer transition-shadow ${
          thread.unread > 0 ? "bg-primary/[0.04]" : "bg-secondary/30"
        }`}
        style={{
          border: thread.unread > 0 ? "1px solid hsl(var(--primary) / 0.15)" : "1px solid hsl(var(--border))",
          backgroundColor: "hsl(var(--background))",
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="p-3.5">
          <div className="flex gap-3 items-center">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-[52px] h-[52px] rounded-2xl bg-secondary flex items-center justify-center text-2xl"
                style={{ boxShadow: thread.unread > 0 ? "0 0 0 2px hsl(var(--primary) / 0.2)" : "none" }}>
                {thread.avatar}
              </div>
              {thread.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[2.5px] border-background" />
              )}
              {thread.pinned && (
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500/90 flex items-center justify-center">
                  <Pin size={10} className="text-white rotate-45" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className={`text-[14px] truncate ${thread.unread > 0 ? "font-bold" : "font-medium"} text-foreground`}>
                    {thread.name}
                  </h4>
                  {thread.verified && <ShieldCheck size={13} className="text-primary shrink-0" />}
                </div>
                <span className={`text-[10px] whitespace-nowrap shrink-0 ${thread.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {thread.time}
                </span>
              </div>

              {/* Role badge */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground">
                  {thread.role}
                </span>
              </div>

              {/* Last message + unread */}
              <div className="flex items-center justify-between gap-2 mt-1">
                {thread.typing ? (
                  <p className="text-[12px] text-primary font-medium italic flex items-center gap-1">
                    typing
                    <span className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-1 h-1 rounded-full bg-primary inline-block"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                  </p>
                ) : (
                  <p className={`text-[12px] truncate ${thread.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {thread.lastMessage}
                  </p>
                )}
                {thread.unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 min-w-[22px] h-[22px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1"
                  >
                    {thread.unread}
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══ Mock Chat View ═══ */
function MockChatView({ threadId, thread, onBack }: {
  threadId: string; thread: typeof mockThreads[0]; onBack: () => void;
}) {
  const [messages, setMessages] = useState(mockMessages[threadId] || []);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg && !pendingImage) return;

    const imageUrl = pendingImage ? URL.createObjectURL(pendingImage) : undefined;
    setMessages((prev) => [...prev, {
      id: `u-${Date.now()}`, text: msg || "", sender: "user", time: "Just now", status: "sent" as const,
      imageUrl,
    }]);
    setInput("");
    setPendingImage(null);
    setShowQuickReplies(false);

    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: `r-${Date.now()}`, text: imageUrl ? "Nice photo! 📸" : "Thanks for your message! I'll get back to you shortly. 😊",
        sender: "other", time: "Just now",
      }]);
    }, 2000);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPendingImage(file);
    }
    e.target.value = "";
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: typeof messages }[] = [];
    let currentDate = "";
    messages.forEach(msg => {
      const dateStr = msg.time.split(",")[0] || msg.time;
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ date: dateStr, msgs: [msg] });
      } else {
        groups[groups.length - 1].msgs.push(msg);
      }
    });
    return groups;
  }, [messages]);

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-md"
        style={{ boxShadow: "0 1px 12px hsl(var(--foreground) / 0.05)" }}>
        <button onClick={onBack} className="text-foreground active:scale-90 transition-transform">
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">{thread.avatar}</div>
            {thread.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-foreground truncate">{thread.name}</p>
              {thread.verified && <ShieldCheck size={12} className="text-primary shrink-0" />}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              {thread.online ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active now</>
              ) : (
                <>Last seen recently</>
              )}
            </p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <Phone size={16} className="text-foreground" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <MoreVertical size={16} className="text-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            {/* Date header */}
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] font-medium text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">
                {formatDateHeader(group.date)}
              </span>
            </div>
            <div className="space-y-2">
              {group.msgs.map((msg, i) => {
                const isUser = msg.sender === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.25 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className="relative max-w-[80%]">
                      <div className={`rounded-2xl px-4 py-2.5 ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}
                        style={isUser ? { boxShadow: "0 2px 8px hsl(var(--primary) / 0.25)" } : undefined}
                      >
                        {msg.imageUrl && (
                          <ImageBubble url={msg.imageUrl} onClick={() => setViewingImage(msg.imageUrl!)} />
                        )}
                        {msg.text && <p className="text-[13px] leading-relaxed">{msg.text}</p>}
                        <div className={`flex items-center justify-end gap-1 mt-1 ${isUser ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                          <span className="text-[10px]">
                            {msg.time.includes(",") ? msg.time.split(",")[1]?.trim() : msg.time}
                          </span>
                          {isUser && <MessageStatus status={msg.status} />}
                        </div>
                      </div>
                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`absolute -bottom-2.5 ${isUser ? "left-2" : "right-2"} flex gap-0.5`}>
                          {msg.reactions.map((r, ri) => (
                            <span key={ri} className="text-sm bg-secondary border border-border rounded-full px-1.5 py-0.5 shadow-sm">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {thread.typing && (
          <div className="mt-3">
            <TypingBubble />
          </div>
        )}
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar"
          >
            {quickReplies.map((reply, i) => (
              <motion.button
                key={reply}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSend(reply)}
                className="shrink-0 text-[11px] font-medium px-3 py-2 rounded-xl border border-primary/20 text-primary bg-primary/5 active:scale-95 transition-transform whitespace-nowrap"
              >
                {reply}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      <AnimatePresence>
        {pendingImage && <ImagePreviewBar file={pendingImage} onRemove={() => setPendingImage(null)} />}
      </AnimatePresence>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border bg-background/95 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
              <Image size={18} />
            </button>
          </div>
          <div className="flex-1 bg-secondary rounded-2xl flex items-end">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onFocus={() => setShowQuickReplies(false)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button className="px-3 py-3 text-muted-foreground active:scale-90 transition-transform">
              <Smile size={18} />
            </button>
          </div>
          {(input.trim() || pendingImage) ? (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => handleSend()}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center active:scale-90 transition-transform"
              style={{ boxShadow: "0 2px 8px hsl(var(--primary) / 0.3)" }}
            >
              <Send size={17} className="text-primary-foreground ml-0.5" />
            </motion.button>
          ) : (
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {viewingImage && <ImageViewer url={viewingImage} onClose={() => setViewingImage(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ Real-time Chat View (DB-backed) ═══ */
function RealtimeChatView({ conversation, onBack }: { conversation: Conversation; onBack: () => void }) {
  const { user } = useAuth();
  const { fetchMessages, sendMessage, markAsRead } = useMessages();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages(conversation.id).then((msgs) => {
      setMessages(msgs);
      markAsRead(conversation.id);
    });
  }, [conversation.id, fetchMessages, markAsRead]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          if (payload.new.sender_id !== user?.id) markAsRead(conversation.id);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversation.id, user?.id, markAsRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if ((!msg && !pendingImage) || sending) return;
    setSending(true);
    setShowQuickReplies(false);

    let finalMsg = msg;
    if (pendingImage && user) {
      setUploadingImage(true);
      const imageUrl = await uploadChatImage(pendingImage, user.id);
      setUploadingImage(false);
      if (imageUrl) {
        finalMsg = msg ? `[image:${imageUrl}] ${msg}` : `[image:${imageUrl}]`;
      }
      setPendingImage(null);
    }

    if (finalMsg) {
      await sendMessage(conversation.id, finalMsg);
    }
    setInput("");
    setSending(false);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPendingImage(file);
    }
    e.target.value = "";
  };

  const avatarEmoji = conversation.other_user_name.includes("Support") ? "💎" : "🏡";

  // Group by date
  const groupedMessages = useMemo(() => {
    const groups: { date: Date; msgs: Message[] }[] = [];
    messages.forEach(msg => {
      const d = new Date(msg.created_at);
      if (groups.length === 0 || !isSameDay(groups[groups.length - 1].date, d)) {
        groups.push({ date: d, msgs: [msg] });
      } else {
        groups[groups.length - 1].msgs.push(msg);
      }
    });
    return groups;
  }, [messages]);

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-md"
        style={{ boxShadow: "0 1px 12px hsl(var(--foreground) / 0.05)" }}>
        <button onClick={onBack} className="text-foreground active:scale-90 transition-transform"><ArrowLeft size={22} /></button>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative">
            {conversation.other_user_avatar ? (
              <img src={conversation.other_user_avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">{avatarEmoji}</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{conversation.other_user_name}</p>
            <p className="text-[11px] text-muted-foreground">Chat</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <Phone size={16} className="text-foreground" />
        </button>
        <button className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform">
          <MoreVertical size={16} className="text-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] font-medium text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">
                {isToday(group.date) ? "Today" : isYesterday(group.date) ? "Yesterday" : format(group.date, "MMM d, yyyy")}
              </span>
            </div>
            <div className="space-y-2">
              {group.msgs.map((msg, i) => {
                const isUser = msg.sender_id === user?.id;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
                    }`} style={isUser ? { boxShadow: "0 2px 8px hsl(var(--primary) / 0.25)" } : undefined}>
                      {/* Check for image in content */}
                      {msg.content.includes("[image:") && (
                        <ImageBubble
                          url={msg.content.match(/\[image:(.*?)\]/)?.[1] || ""}
                          onClick={() => setViewingImage(msg.content.match(/\[image:(.*?)\]/)?.[1] || "")}
                        />
                      )}
                      {(() => {
                        const textOnly = msg.content.replace(/\[image:.*?\]\s?/, "").trim();
                        return textOnly ? <p className="text-[13px] leading-relaxed">{textOnly}</p> : null;
                      })()}
                      <p className={`text-[10px] mt-1 text-right ${isUser ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                        {format(new Date(msg.created_at), "h:mm a")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuickReplies && messages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
            {quickReplies.map((reply, i) => (
              <motion.button key={reply} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                onClick={() => handleSend(reply)}
                className="shrink-0 text-[11px] font-medium px-3 py-2 rounded-xl border border-primary/20 text-primary bg-primary/5 active:scale-95 transition-transform whitespace-nowrap">
                {reply}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      <AnimatePresence>
        {pendingImage && <ImagePreviewBar file={pendingImage} onRemove={() => setPendingImage(null)} />}
      </AnimatePresence>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border bg-background/95 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
            <Image size={18} />
          </button>
          <div className="flex-1 bg-secondary rounded-2xl flex items-end">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              onFocus={() => setShowQuickReplies(false)}
              placeholder="Type a message..." className="flex-1 bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground outline-none" />
            <button className="px-3 py-3 text-muted-foreground"><Smile size={18} /></button>
          </div>
          {(input.trim() || pendingImage) ? (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => handleSend()} disabled={sending || uploadingImage}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 active:scale-90 transition-transform"
              style={{ boxShadow: "0 2px 8px hsl(var(--primary) / 0.3)" }}>
              {uploadingImage ? <Loader2 size={17} className="text-primary-foreground animate-spin" /> : <Send size={17} className="text-primary-foreground ml-0.5" />}
            </motion.button>
          ) : (
            <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground active:scale-90 transition-transform">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {viewingImage && <ImageViewer url={viewingImage} onClose={() => setViewingImage(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ Main Screen ═══ */
export default function MessagesScreen() {
  const { user } = useAuth();
  const { conversations, loading } = useMessages();
  const [tab, setTab] = useState<"notifications" | "chats">("chats");
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [activeMockThread, setActiveMockThread] = useState<typeof mockThreads[0] | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(["c1"]));
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  const handlePin = useCallback((id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleArchive = useCallback((id: string) => {
    setArchivedIds(prev => new Set(prev).add(id));
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read && !readNotifications.has(n.id)).length;
  const unreadChatCount = user
    ? conversations.reduce((sum, c) => sum + c.unread_count, 0)
    : mockThreads.reduce((sum, t) => sum + t.unread, 0);

  const markRead = (id: string) => setReadNotifications((prev) => new Set(prev).add(id));

  const chatThreads = user
    ? conversations.map((c) => ({
        id: c.id, name: c.other_user_name,
        avatar: c.other_user_name.includes("Support") ? "💎" : "🏡",
        lastMessage: c.last_message,
        time: formatDistanceToNow(new Date(c.last_message_time), { addSuffix: true }),
        unread: c.unread_count, online: false, verified: false, role: "Host" as string,
        typing: false, pinned: pinnedIds.has(c.id), conversation: c,
        tripStatus: "active" as TripStatus, tripLabel: "Current Trip",
      }))
    : mockThreads.map((t) => ({ ...t, pinned: pinnedIds.has(t.id), conversation: null as Conversation | null }));

  const visibleChats = chatThreads.filter(t => !archivedIds.has(t.id));
  const filteredChats = searchQuery
    ? visibleChats.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    : visibleChats;

  const pinnedChats = filteredChats.filter(t => t.pinned);
  const activeTrip = filteredChats.filter(t => !t.pinned && (t.tripStatus === "active" || t.tripStatus === "upcoming"));
  const pastTrips = filteredChats.filter(t => !t.pinned && t.tripStatus === "past");
  const supportChats = filteredChats.filter(t => !t.pinned && t.tripStatus === "support");

  return (
    <div className="pb-24 min-h-screen" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--secondary) / 0.3) 100%)" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground">
            Messages
          </motion.h1>
          <div className="flex items-center gap-2">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-90 transition-transform"
            >
              {showSearch ? <X size={17} className="text-foreground" /> : <Search size={17} className="text-foreground" />}
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/30 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="mx-5 mb-4 flex gap-1 p-1 rounded-2xl border border-border bg-secondary/40 backdrop-blur-sm"
      >
        <TabPill active={tab === "chats"} label="Chats" count={unreadChatCount} icon={MessageCircle} onClick={() => setTab("chats")} />
        <TabPill active={tab === "notifications"} label="Updates" count={unreadNotifCount} icon={Bell} onClick={() => setTab("notifications")} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-5 mb-5 flex gap-2.5">
        <button
          onClick={() => {
            setTab("chats");
            if (user && conversations.length > 0) setActiveConvo(conversations[0]);
            else if (!user) setActiveMockThread(mockThreads[0]);
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold active:scale-[0.97] transition-transform"
          style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.25)" }}
        >
          <HeadphonesIcon size={16} /> Chat with Concierge
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-foreground text-[13px] font-medium bg-secondary/50 active:scale-[0.97] transition-transform">
          <Phone size={16} /> Call
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ═══ Chats Tab ═══ */}
        {tab === "chats" && (
          <motion.div key="chats" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }} className="px-5">

            {/* Pinned */}
            {pinnedChats.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1">
                  <Pin size={10} className="rotate-45" /> Pinned
                </p>
                <div className="space-y-2">
                  {pinnedChats.map((t, i) => (
                    <ThreadCard key={t.id} thread={t} index={i} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                      if (t.conversation) setActiveConvo(t.conversation);
                      else setActiveMockThread(mockThreads.find(mt => mt.id === t.id) || null);
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Current Trip */}
            {activeTrip.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center">
                    <Plane size={10} className="text-emerald-500" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">Current Trip</p>
                  <div className="flex-1 h-px bg-emerald-500/10" />
                </div>
                {/* Trip context banner */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-2.5 px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-emerald-500 shrink-0" />
                    <p className="text-[11px] text-emerald-400 font-medium">{activeTrip[0]?.tripLabel}</p>
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">ACTIVE</span>
                  </div>
                </motion.div>
                <div className="space-y-2">
                  {activeTrip.map((t, i) => (
                    <ThreadCard key={t.id} thread={t} index={i + pinnedChats.length} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                      if (t.conversation) setActiveConvo(t.conversation);
                      else setActiveMockThread(mockThreads.find(mt => mt.id === t.id) || null);
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Support */}
            {supportChats.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
                    <HeadphonesIcon size={10} className="text-primary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-primary">Support</p>
                  <div className="flex-1 h-px bg-primary/10" />
                </div>
                <div className="space-y-2">
                  {supportChats.map((t, i) => (
                    <ThreadCard key={t.id} thread={t} index={i + pinnedChats.length + activeTrip.length} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                      if (t.conversation) setActiveConvo(t.conversation);
                      else setActiveMockThread(mockThreads.find(mt => mt.id === t.id) || null);
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Trips */}
            {pastTrips.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-5 rounded-md bg-muted-foreground/10 flex items-center justify-center">
                    <History size={10} className="text-muted-foreground" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Past Trips</p>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {pastTrips.map((t, i) => {
                    // Group label for trip
                    const prevTrip = pastTrips[i - 1];
                    const showTripLabel = !prevTrip || prevTrip.tripLabel !== t.tripLabel;
                    return (
                      <div key={t.id}>
                        {showTripLabel && (
                          <div className="flex items-center gap-2 mb-1.5 mt-1">
                            <Calendar size={10} className="text-muted-foreground/60" />
                            <p className="text-[10px] text-muted-foreground/60 font-medium">{t.tripLabel}</p>
                          </div>
                        )}
                        <ThreadCard thread={t} index={i + pinnedChats.length + activeTrip.length + supportChats.length} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                          if (t.conversation) setActiveConvo(t.conversation);
                          else setActiveMockThread(mockThreads.find(mt => mt.id === t.id) || null);
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredChats.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle size={36} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold text-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Messages from hosts will appear here</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══ Notifications Tab ═══ */}
        {tab === "notifications" && (
          <motion.div key="notifs" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25 }} className="px-5 space-y-2.5">

            {/* Unread section */}
            {notifications.filter(n => !n.read && !readNotifications.has(n.id)).length > 0 && (
              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">New</p>
            )}
            {notifications.map((notif, i) => {
              const isRead = notif.read || readNotifications.has(notif.id);
              // Add "Earlier" label before first read item
              const prevIsUnread = i > 0 && !notifications[i - 1].read && !readNotifications.has(notifications[i - 1].id);
              return (
                <div key={notif.id}>
                  {isRead && prevIsUnread && (
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-4 mb-1">Earlier</p>
                  )}
                  <NotificationCard notif={notif} index={i} isRead={isRead} onRead={() => markRead(notif.id)} />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat View Overlays */}
      <AnimatePresence>
        {activeConvo && <RealtimeChatView conversation={activeConvo} onBack={() => setActiveConvo(null)} />}
        {activeMockThread && (
          <MockChatView
            threadId={activeMockThread.id}
            thread={activeMockThread}
            onBack={() => setActiveMockThread(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
