import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import {
  MessageCircle, Bell, ChevronRight, Send, ArrowLeft, Phone, MoreVertical, Search,
  Image, Smile, Mic, Check, CheckCheck, Pin, Archive, ArchiveRestore,
  HeadphonesIcon, ShieldCheck, X, Loader2,
  MapPin, History, Calendar,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, type Conversation, type Message } from "@/hooks/use-messages";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from "date-fns";
import { useAppConfig } from "@/hooks/use-app-config";

/* ═══ Types ═══ */
interface Notification {
  id: string;
  type: "booking" | "promo" | "reminder" | "review" | "reward" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
  cta?: { label: string; action?: string };
}

/* ═══ Static Data ═══ */
const notifications: Notification[] = [
  { id: "n1", type: "booking", title: "Booking Confirmed", body: "Your evening slot at Koraput Garden House on Mar 18 is confirmed.", time: "2 min ago", read: false, icon: "🎫", cta: { label: "View Booking" } },
  { id: "n2", type: "promo", title: "Weekend Special", body: "Get 20% off all bonfire experiences this weekend. Use code FIRE20.", time: "1 hour ago", read: false, icon: "🎁", cta: { label: "Claim Offer" } },
  { id: "n3", type: "reminder", title: "Tomorrow's Trip", body: "Don't forget your visit to The Firefly Villa tomorrow at 4 PM.", time: "3 hours ago", read: true, icon: "📍", cta: { label: "Get Directions" } },
  { id: "n4", type: "reward", title: "150 pts earned", body: "Loyalty points from The Firefly Villa visit credited. Gold tier!", time: "1 day ago", read: true, icon: "⭐" },
  { id: "n5", type: "review", title: "Rate Your Experience", body: "Share feedback on The Firefly Villa and earn 50 bonus points.", time: "2 days ago", read: true, icon: "💬", cta: { label: "Write Review" } },
  { id: "n6", type: "system", title: "New: Map View", body: "Explore all venues near you on our new interactive map.", time: "3 days ago", read: true, icon: "🗺️", cta: { label: "Explore" } },
];

type TripStatus = "active" | "upcoming" | "past" | "support";

const mockThreads = [
  { id: "c1", name: "Hushh Concierge", avatar: "💎", lastMessage: "Your refund has been processed successfully.", time: "Yesterday", unread: 0, online: true, verified: true, role: "Support", typing: false, pinned: true, tripStatus: "support" as TripStatus, tripLabel: "24/7 Support" },
  { id: "c2", name: "Koraput Garden Host", avatar: "🏡", lastMessage: "Welcome! Looking forward to hosting you tomorrow.", time: "2h ago", unread: 2, online: true, verified: true, role: "Superhost", typing: true, pinned: false, tripStatus: "active" as TripStatus, tripLabel: "Mar 18 · Evening Slot" },
  { id: "c5", name: "Chef Meera", avatar: "👩‍🍳", lastMessage: "The bonfire dinner setup is ready! Come anytime after 7.", time: "1h ago", unread: 1, online: true, verified: true, role: "Chef", typing: false, pinned: false, tripStatus: "active" as TripStatus, tripLabel: "Mar 18 · Evening Slot" },
  { id: "c3", name: "Firefly Villa Host", avatar: "🌿", lastMessage: "Hope you enjoyed your stay! Come back during monsoon.", time: "Mar 10", unread: 0, online: false, verified: false, role: "Host", typing: false, pinned: false, tripStatus: "past" as TripStatus, tripLabel: "Mar 8-10 · Weekend Stay" },
  { id: "c4", name: "Chef Arjun", avatar: "👨‍🍳", lastMessage: "I'll prepare the tribal thali for your group. See you at 7!", time: "Mar 8", unread: 0, online: false, verified: true, role: "Service", typing: false, pinned: false, tripStatus: "past" as TripStatus, tripLabel: "Mar 8-10 · Weekend Stay" },
  { id: "c6", name: "Rooftop Lounge Host", avatar: "🌃", lastMessage: "Thanks for visiting! Your review means a lot.", time: "Feb 25", unread: 0, online: false, verified: true, role: "Host", typing: false, pinned: false, tripStatus: "past" as TripStatus, tripLabel: "Feb 24-25 · Night Slot" },
];

const mockMessages: Record<string, Array<{ id: string; text: string; sender: "user" | "other"; time: string; reactions?: string[]; status?: "sent" | "delivered" | "read"; imageUrl?: string }>> = {
  c1: [
    { id: "m1", text: "Hi, I need help with my Ember Grounds refund", sender: "user", time: "Yesterday 10:30 AM", status: "read" },
    { id: "m2", text: "Sure! Let me check your booking details. One moment please… 🔍", sender: "other", time: "Yesterday 10:31 AM" },
    { id: "m3", text: "I found your booking #HUSHH-X7K2. The refund of ₹2,499 has been initiated.", sender: "other", time: "Yesterday 10:32 AM" },
    { id: "m4", text: "Your refund has been processed successfully. It will reflect in 3-5 business days.", sender: "other", time: "Yesterday 10:33 AM" },
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
    { id: "m14", text: "Absolutely! I'll prepare the tribal thali for your group. See you at 7!", sender: "other", time: "Mar 8, 3:15 PM" },
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

const quickReplies = ["Thanks! 🙏", "When should I arrive?", "Can I bring pets?", "Is parking available?", "See you there!"];

/* ═══ Helpers ═══ */
async function uploadChatImage(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("chat-images").upload(path, file, { contentType: file.type });
  if (error) return null;
  const { data } = supabase.storage.from("chat-images").getPublicUrl(path);
  return data.publicUrl;
}

function formatDateHeader(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  } catch { return dateStr; }
}

function MessageStatus({ status }: { status?: "sent" | "delivered" | "read" }) {
  if (!status) return null;
  if (status === "read") return <CheckCheck size={12} className="text-primary" />;
  if (status === "delivered") return <CheckCheck size={12} className="text-muted-foreground/50" />;
  return <Check size={12} className="text-muted-foreground/50" />;
}

/* ═══ Minimal Components ═══ */

function ImagePreviewBar({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="px-4 pb-2">
      <div className="relative inline-block rounded-2xl overflow-hidden border border-border">
        <img src={url} alt="Preview" className="w-16 h-16 object-cover" />
        <button onClick={onRemove} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/60 text-background flex items-center justify-center"><X size={10} /></button>
      </div>
    </motion.div>
  );
}

function ImageBubble({ url, onClick }: { url: string; onClick?: () => void }) {
  return <motion.img src={url} alt="" onClick={onClick} className="rounded-2xl max-w-[200px] max-h-[200px] object-cover cursor-pointer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }} />;
}

function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" onClick={onClose}><X size={18} className="text-white" /></button>
      <img src={url} alt="" className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl" />
    </motion.div>
  );
}

/* ═══ Tab ═══ */
function Tab({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative px-5 py-2">
      {active && (
        <motion.div layoutId="msgTabPill" className="absolute inset-0 bg-foreground rounded-full" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
      )}
      <span className={`relative text-[13px] font-medium flex items-center gap-1.5 ${active ? "text-background" : "text-muted-foreground"}`}>
        {label}
        {count !== undefined && count > 0 && (
          <span className={`text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ${active ? "bg-background/20 text-background" : "bg-primary text-primary-foreground"}`}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>
    </button>
  );
}

/* ═══ Notification Card — Clean ═══ */
function NotificationCard({ notif, index, isRead, onRead }: { notif: Notification; index: number; isRead: boolean; onRead: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onRead}
      className={`relative rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98] ${
        isRead ? "bg-card" : "bg-card border-l-[3px] border-l-primary"
      }`}
      style={{ border: isRead ? "1px solid hsl(var(--border))" : undefined }}
    >
      <div className="flex gap-3">
        <span className="text-xl shrink-0">{notif.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-[13px] leading-snug ${isRead ? "font-medium text-foreground/70" : "font-semibold text-foreground"}`}>{notif.title}</h4>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{notif.time}</span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{notif.body}</p>
          {notif.cta && (
            <button className="mt-2 text-[11px] font-semibold text-primary flex items-center gap-0.5 hover:gap-1.5 transition-all">
              {notif.cta.label} <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Thread Card — Minimal & Premium ═══ */
function ThreadCard({ thread, index, onClick, onPin, onArchive }: {
  thread: typeof mockThreads[0]; index: number; onClick: () => void;
  onPin?: (id: string) => void; onArchive?: (id: string) => void;
}) {
  const [swipeState, setSwipeState] = useState<"idle" | "pin" | "archive">("idle");
  const [dismissed, setDismissed] = useState(false);
  const SWIPE_THRESHOLD = 55;
  const dragX = useMotionValue(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  const handleDragStart = (_: any, info: { point: { x: number } }) => {
    isDragging.current = false;
    dragStartX.current = info.point.x;
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const totalDrag = Math.abs(info.offset.x);
    const fast = Math.abs(info.velocity.x) > 400;
    const triggered = totalDrag > SWIPE_THRESHOLD || fast;

    if (triggered && info.offset.x > 0) {
      // Pin/Unpin
      animate(dragX, 0, { type: "spring", stiffness: 500, damping: 35 });
      onPin?.(thread.id);
    } else if (triggered && info.offset.x < 0) {
      // Archive — slide fully off then collapse
      animate(dragX, -400, { type: "spring", stiffness: 300, damping: 30 });
      setDismissed(true);
      setTimeout(() => onArchive?.(thread.id), 350);
    } else {
      // Snap back
      animate(dragX, 0, { type: "spring", stiffness: 500, damping: 35 });
    }
    setSwipeState("idle");

    // Only mark as dragged if moved more than 8px (prevents tap-vs-drag conflict)
    if (totalDrag > 8) isDragging.current = true;
    setTimeout(() => { isDragging.current = false; }, 80);
  };

  const handleTap = () => { if (!isDragging.current) onClick(); };

  if (dismissed) return <motion.div initial={{ height: "auto", opacity: 1 }} animate={{ height: 0, opacity: 0, marginBottom: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden" />;

  const hasUnread = thread.unread > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 + index * 0.03, duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Swipe reveal backgrounds */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className={`flex items-center pl-5 w-1/2 transition-colors duration-150 ${swipeState === "pin" ? "bg-amber-500" : "bg-amber-500/50"}`}>
          <div className="flex flex-col items-center gap-0.5">
            <Pin size={16} className="text-white rotate-45" />
            <span className="text-[9px] text-white/90 font-semibold">{thread.pinned ? "Unpin" : "Pin"}</span>
          </div>
        </div>
        <div className={`flex items-center justify-end pr-5 w-1/2 transition-colors duration-150 ${swipeState === "archive" ? "bg-destructive" : "bg-destructive/50"}`}>
          <div className="flex flex-col items-center gap-0.5">
            <Archive size={16} className="text-white" />
            <span className="text-[9px] text-white/90 font-semibold">Archive</span>
          </div>
        </div>
      </div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 140 }}
        dragElastic={0.08}
        dragMomentum={false}
        dragDirectionLock
        style={{ x: dragX, touchAction: "pan-y" }}
        onDragStart={handleDragStart}
        onDrag={(_, info) => {
          if (info.offset.x > SWIPE_THRESHOLD) setSwipeState("pin");
          else if (info.offset.x < -SWIPE_THRESHOLD) setSwipeState("archive");
          else setSwipeState("idle");
        }}
        onDragEnd={handleDragEnd}
        onClick={handleTap}
        className="relative z-10 bg-card rounded-2xl cursor-pointer border border-border/50 hover:border-border transition-colors"
      >
        <div className="px-4 py-3.5">
          <div className="flex gap-3 items-center">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                hasUnread ? "bg-primary/10" : "bg-secondary"
              }`}>
                {thread.avatar}
              </div>
              {thread.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
              )}
              {thread.pinned && (
                <div className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                  <Pin size={8} className="text-white rotate-45" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className={`text-[14px] truncate ${hasUnread ? "font-semibold" : "font-medium"} text-foreground`}>{thread.name}</h4>
                  {thread.verified && <ShieldCheck size={12} className="text-primary shrink-0 opacity-70" />}
                </div>
                <span className={`text-[10px] whitespace-nowrap shrink-0 ${hasUnread ? "text-primary font-medium" : "text-muted-foreground"}`}>{thread.time}</span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                {thread.typing ? (
                  <p className="text-[12px] text-primary/80 font-medium flex items-center gap-1">
                    typing
                    <span className="flex gap-0.5">{[0, 1, 2].map(i => (
                      <motion.span key={i} className="w-1 h-1 rounded-full bg-primary/60 inline-block" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                    ))}</span>
                  </p>
                ) : (
                  <p className={`text-[12px] truncate ${hasUnread ? "text-foreground/80" : "text-muted-foreground"}`}>{thread.lastMessage}</p>
                )}
                {hasUnread && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
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

/* ═══ Section Label ═══ */
function SectionLabel({ icon: Icon, label, color = "text-muted-foreground" }: { icon: typeof MapPin; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-1">
      <Icon size={11} className={color} />
      <p className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${color}`}>{label}</p>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

/* ═══ Mock Chat View ═══ */
function MockChatView({ threadId, thread, onBack }: { threadId: string; thread: typeof mockThreads[0]; onBack: () => void }) {
  const [messages, setMessages] = useState(mockMessages[threadId] || []);
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg && !pendingImage) return;
    const imageUrl = pendingImage ? URL.createObjectURL(pendingImage) : undefined;
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, text: msg || "", sender: "user", time: "Just now", status: "sent" as const, imageUrl }]);
    setInput(""); setPendingImage(null); setShowQuickReplies(false);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: `r-${Date.now()}`, text: imageUrl ? "Nice photo! 📸" : "Thanks for your message! I'll get back to you shortly. 😊", sender: "other", time: "Just now" }]);
    }, 2000);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) setPendingImage(file);
    e.target.value = "";
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string; msgs: typeof messages }[] = [];
    let currentDate = "";
    messages.forEach(msg => {
      const dateStr = msg.time.split(",")[0] || msg.time;
      if (dateStr !== currentDate) { currentDate = dateStr; groups.push({ date: dateStr, msgs: [msg] }); }
      else groups[groups.length - 1].msgs.push(msg);
    });
    return groups;
  }, [messages]);

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background">
        <button onClick={onBack} className="text-foreground active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg">{thread.avatar}</div>
            {thread.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-[2px] border-background" />}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">{thread.name}</p>
            <p className="text-[10px] text-muted-foreground">{thread.online ? "Online" : "Last seen recently"}</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"><Phone size={14} className="text-foreground" /></button>
        <button className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"><MoreVertical size={14} className="text-foreground" /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] font-medium text-muted-foreground/60 bg-secondary/50 px-3 py-1 rounded-full">{formatDateHeader(group.date)}</span>
            </div>
            <div className="space-y-1.5">
              {group.msgs.map((msg, i) => {
                const isUser = msg.sender === "user";
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015, duration: 0.2 }} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className="relative max-w-[78%]">
                      <div className={`rounded-2xl px-3.5 py-2.5 ${isUser ? "bg-primary text-primary-foreground rounded-br-lg" : "bg-card border border-border/50 text-foreground rounded-bl-lg"}`}>
                        {msg.imageUrl && <ImageBubble url={msg.imageUrl} onClick={() => setViewingImage(msg.imageUrl!)} />}
                        {msg.text && <p className="text-[13px] leading-relaxed">{msg.text}</p>}
                        <div className={`flex items-center justify-end gap-1 mt-0.5 ${isUser ? "text-primary-foreground/40" : "text-muted-foreground/60"}`}>
                          <span className="text-[9px]">{msg.time.includes(",") ? msg.time.split(",")[1]?.trim() : msg.time}</span>
                          {isUser && <MessageStatus status={msg.status} />}
                        </div>
                      </div>
                      {msg.reactions?.length ? (
                        <div className={`absolute -bottom-2 ${isUser ? "left-2" : "right-2"} flex gap-0.5`}>
                          {msg.reactions.map((r, ri) => <span key={ri} className="text-xs bg-card border border-border rounded-full px-1 shadow-sm">{r}</span>)}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        {thread.typing && (
          <div className="flex justify-start mt-3">
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-lg px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map(i => <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" animate={{ y: [0, -5, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
            {quickReplies.map((reply, i) => (
              <motion.button key={reply} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                onClick={() => handleSend(reply)} className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full border border-border text-foreground bg-card active:scale-95 transition-transform whitespace-nowrap">
                {reply}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{pendingImage && <ImagePreviewBar file={pendingImage} onRemove={() => setPendingImage(null)} />}</AnimatePresence>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-border/50 bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"><Image size={16} /></button>
          <div className="flex-1 bg-card border border-border/50 rounded-full flex items-end">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} onFocus={() => setShowQuickReplies(false)}
              placeholder="Message…" className="flex-1 bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none" />
            <button className="px-3 py-2.5 text-muted-foreground/50"><Smile size={16} /></button>
          </div>
          {(input.trim() || pendingImage) ? (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => handleSend()} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-transform">
              <Send size={15} className="text-primary-foreground ml-0.5" />
            </motion.button>
          ) : (
            <button className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"><Mic size={16} /></button>
          )}
        </div>
      </div>
      <AnimatePresence>{viewingImage && <ImageViewer url={viewingImage} onClose={() => setViewingImage(null)} />}</AnimatePresence>
    </motion.div>
  );
}

/* ═══ Realtime Chat View ═══ */
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

  useEffect(() => { fetchMessages(conversation.id).then(msgs => { setMessages(msgs); markAsRead(conversation.id); }); }, [conversation.id, fetchMessages, markAsRead]);
  useEffect(() => {
    const channel = supabase.channel(`chat-${conversation.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
      (payload: any) => { setMessages(prev => [...prev, payload.new as Message]); if (payload.new.sender_id !== user?.id) markAsRead(conversation.id); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversation.id, user?.id, markAsRead]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if ((!msg && !pendingImage) || sending) return;
    setSending(true); setShowQuickReplies(false);
    let finalMsg = msg;
    if (pendingImage && user) {
      setUploadingImage(true);
      const imageUrl = await uploadChatImage(pendingImage, user.id);
      setUploadingImage(false);
      if (imageUrl) finalMsg = msg ? `[image:${imageUrl}] ${msg}` : `[image:${imageUrl}]`;
      setPendingImage(null);
    }
    if (finalMsg) await sendMessage(conversation.id, finalMsg);
    setInput(""); setSending(false);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) setPendingImage(file);
    e.target.value = "";
  };

  const avatarEmoji = conversation.other_user_name.includes("Support") ? "💎" : "🏡";
  const groupedMessages = useMemo(() => {
    const groups: { date: Date; msgs: Message[] }[] = [];
    messages.forEach(msg => {
      const d = new Date(msg.created_at);
      if (groups.length === 0 || !isSameDay(groups[groups.length - 1].date, d)) groups.push({ date: d, msgs: [msg] });
      else groups[groups.length - 1].msgs.push(msg);
    });
    return groups;
  }, [messages]);

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background">
        <button onClick={onBack} className="text-foreground active:scale-90 transition-transform"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative">
            {conversation.other_user_avatar ? <img src={conversation.other_user_avatar} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg">{avatarEmoji}</div>}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">{conversation.other_user_name}</p>
            <p className="text-[10px] text-muted-foreground">Chat</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"><Phone size={14} className="text-foreground" /></button>
        <button className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center"><MoreVertical size={14} className="text-foreground" /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {groupedMessages.map((group, gi) => (
          <div key={gi}>
            <div className="flex items-center justify-center my-4">
              <span className="text-[10px] font-medium text-muted-foreground/60 bg-secondary/50 px-3 py-1 rounded-full">
                {isToday(group.date) ? "Today" : isYesterday(group.date) ? "Yesterday" : format(group.date, "MMM d, yyyy")}
              </span>
            </div>
            <div className="space-y-1.5">
              {group.msgs.map((msg, i) => {
                const isUser = msg.sender_id === user?.id;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${isUser ? "bg-primary text-primary-foreground rounded-br-lg" : "bg-card border border-border/50 text-foreground rounded-bl-lg"}`}>
                      {msg.content.includes("[image:") && <ImageBubble url={msg.content.match(/\[image:(.*?)\]/)?.[1] || ""} onClick={() => setViewingImage(msg.content.match(/\[image:(.*?)\]/)?.[1] || "")} />}
                      {(() => { const t = msg.content.replace(/\[image:.*?\]\s?/, "").trim(); return t ? <p className="text-[13px] leading-relaxed">{t}</p> : null; })()}
                      <p className={`text-[9px] mt-0.5 text-right ${isUser ? "text-primary-foreground/40" : "text-muted-foreground/60"}`}>{format(new Date(msg.created_at), "h:mm a")}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showQuickReplies && messages.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
            {quickReplies.map((reply, i) => (
              <motion.button key={reply} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                onClick={() => handleSend(reply)} className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full border border-border text-foreground bg-card active:scale-95 transition-transform whitespace-nowrap">
                {reply}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{pendingImage && <ImagePreviewBar file={pendingImage} onRemove={() => setPendingImage(null)} />}</AnimatePresence>

      <div className="px-3 py-2.5 border-t border-border/50 bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground active:scale-90"><Image size={16} /></button>
          <div className="flex-1 bg-card border border-border/50 rounded-full flex items-end">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} onFocus={() => setShowQuickReplies(false)}
              placeholder="Message…" className="flex-1 bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none" />
            <button className="px-3 py-2.5 text-muted-foreground/50"><Smile size={16} /></button>
          </div>
          {(input.trim() || pendingImage) ? (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => handleSend()} disabled={sending || uploadingImage}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center disabled:opacity-50 active:scale-90 transition-transform">
              {uploadingImage ? <Loader2 size={15} className="text-primary-foreground animate-spin" /> : <Send size={15} className="text-primary-foreground ml-0.5" />}
            </motion.button>
          ) : (
            <button className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground active:scale-90"><Mic size={16} /></button>
          )}
        </div>
      </div>
      <AnimatePresence>{viewingImage && <ImageViewer url={viewingImage} onClose={() => setViewingImage(null)} />}</AnimatePresence>
    </motion.div>
  );
}

/* ═══ Main Screen ═══ */
export default function MessagesScreen() {
  const { user } = useAuth();
  const { conversations, loading } = useMessages();
  const appConfig = useAppConfig();
  const brandName = appConfig.app_name || "Hushh";
  const [tab, setTab] = useState<"notifications" | "chats">("chats");
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [activeMockThread, setActiveMockThread] = useState<typeof mockThreads[0] | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set(["c1"]));
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);

  const dynamicMockThreads = useMemo(() => mockThreads.map(t => t.id === "c1" ? { ...t, name: `${brandName} Concierge` } : t), [brandName]);

  const handlePin = useCallback((id: string) => { setPinnedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }, []);
  const handleArchive = useCallback((id: string) => { setArchivedIds(prev => new Set(prev).add(id)); }, []);
  const handleUnarchive = useCallback((id: string) => { setArchivedIds(prev => { const next = new Set(prev); next.delete(id); return next; }); }, []);

  const unreadNotifCount = notifications.filter(n => !n.read && !readNotifications.has(n.id)).length;
  const unreadChatCount = user ? conversations.reduce((s, c) => s + c.unread_count, 0) : dynamicMockThreads.reduce((s, t) => s + t.unread, 0);
  const markRead = (id: string) => setReadNotifications(prev => new Set(prev).add(id));

  const chatThreads = user
    ? conversations.map(c => ({ id: c.id, name: c.other_user_name, avatar: c.other_user_name.includes("Support") ? "💎" : "🏡", lastMessage: c.last_message, time: formatDistanceToNow(new Date(c.last_message_time), { addSuffix: true }), unread: c.unread_count, online: false, verified: false, role: "Host" as string, typing: false, pinned: pinnedIds.has(c.id), conversation: c, tripStatus: "active" as TripStatus, tripLabel: "Current Trip" }))
    : dynamicMockThreads.map(t => ({ ...t, pinned: pinnedIds.has(t.id), conversation: null as Conversation | null }));

  const visibleChats = chatThreads.filter(t => !archivedIds.has(t.id));
  const archivedChats = chatThreads.filter(t => archivedIds.has(t.id));
  const filteredChats = searchQuery ? visibleChats.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) : visibleChats;
  const pinnedChats = filteredChats.filter(t => t.pinned);
  const activeTrip = filteredChats.filter(t => !t.pinned && (t.tripStatus === "active" || t.tripStatus === "upcoming"));
  const pastTrips = filteredChats.filter(t => !t.pinned && t.tripStatus === "past");
  const supportChats = filteredChats.filter(t => !t.pinned && t.tripStatus === "support");

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-5">
          <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-[26px] font-bold text-foreground tracking-tight">
            Messages
          </motion.h1>
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center active:scale-90 transition-transform">
            {showSearch ? <X size={16} className="text-foreground" /> : <Search size={16} className="text-foreground" />}
          </motion.button>
        </div>

        {/* Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search…"
                  className="w-full bg-card border border-border/50 rounded-full pl-10 pr-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 transition-colors" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="inline-flex p-1 rounded-full bg-secondary/40 border border-border/30">
          <Tab active={tab === "chats"} label="Chats" count={unreadChatCount} onClick={() => setTab("chats")} />
          <Tab active={tab === "notifications"} label="Updates" count={unreadNotifCount} onClick={() => setTab("notifications")} />
        </motion.div>
      </div>

      {/* Concierge CTA */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mx-5 mb-5 flex gap-2">
        <button onClick={() => {
          setTab("chats");
          if (user && conversations.length > 0) setActiveConvo(conversations[0]);
          else if (!user) setActiveMockThread(dynamicMockThreads[0]);
        }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground text-[13px] font-medium active:scale-[0.97] transition-transform">
          <HeadphonesIcon size={15} /> Chat with Concierge
        </button>
        <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border text-foreground text-[13px] font-medium bg-card active:scale-[0.97] transition-transform">
          <Phone size={14} /> Call
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === "chats" && (
          <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="px-5">

            {pinnedChats.length > 0 && (
              <div className="mb-5">
                <SectionLabel icon={Pin} label="Pinned" />
                <div className="space-y-2">
                  {pinnedChats.map((t, i) => (
                    <ThreadCard key={t.id} thread={t} index={i} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                      if (t.conversation) setActiveConvo(t.conversation);
                      else setActiveMockThread(dynamicMockThreads.find(mt => mt.id === t.id) || null);
                    }} />
                  ))}
                </div>
              </div>
            )}

            {activeTrip.length > 0 && (
              <div className="mb-5">
                <SectionLabel icon={MapPin} label="Current Trip" color="text-emerald-500" />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <MapPin size={11} className="text-emerald-500 shrink-0" />
                    <p className="text-[11px] text-emerald-500/80 font-medium">{activeTrip[0]?.tripLabel}</p>
                    <span className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">ACTIVE</span>
                  </div>
                </motion.div>
                <div className="space-y-2">
                  {activeTrip.map((t, i) => (
                    <ThreadCard key={t.id} thread={t} index={i + pinnedChats.length} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                      if (t.conversation) setActiveConvo(t.conversation);
                      else setActiveMockThread(dynamicMockThreads.find(mt => mt.id === t.id) || null);
                    }} />
                  ))}
                </div>
              </div>
            )}

            {supportChats.length > 0 && (
              <div className="mb-5">
                <SectionLabel icon={HeadphonesIcon} label="Support" color="text-primary" />
                <div className="space-y-2">
                  {supportChats.map((t, i) => (
                    <ThreadCard key={t.id} thread={t} index={i + pinnedChats.length + activeTrip.length} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                      if (t.conversation) setActiveConvo(t.conversation);
                      else setActiveMockThread(dynamicMockThreads.find(mt => mt.id === t.id) || null);
                    }} />
                  ))}
                </div>
              </div>
            )}

            {pastTrips.length > 0 && (
              <div className="mb-5">
                <SectionLabel icon={History} label="Past Trips" />
                <div className="space-y-2">
                  {pastTrips.map((t, i) => {
                    const prevTrip = pastTrips[i - 1];
                    const showTripLabel = !prevTrip || prevTrip.tripLabel !== t.tripLabel;
                    return (
                      <div key={t.id}>
                        {showTripLabel && (
                          <div className="flex items-center gap-1.5 mb-1 mt-1">
                            <Calendar size={9} className="text-muted-foreground/40" />
                            <p className="text-[10px] text-muted-foreground/50 font-medium">{t.tripLabel}</p>
                          </div>
                        )}
                        <ThreadCard thread={t} index={i + pinnedChats.length + activeTrip.length + supportChats.length} onPin={handlePin} onArchive={handleArchive} onClick={() => {
                          if (t.conversation) setActiveConvo(t.conversation);
                          else setActiveMockThread(dynamicMockThreads.find(mt => mt.id === t.id) || null);
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Archived button */}
            {archivedChats.length > 0 && !showArchived && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowArchived(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border/50 active:scale-[0.98] transition-transform mb-4"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Archive size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-medium text-foreground">Archived</p>
                  <p className="text-[11px] text-muted-foreground">{archivedChats.length} conversation{archivedChats.length !== 1 ? "s" : ""}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </motion.button>
            )}

            {/* Archived messages view (inline) */}
            <AnimatePresence>
              {showArchived && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel icon={Archive} label="Archived" />
                    <button onClick={() => setShowArchived(false)} className="text-[10px] font-semibold text-primary px-2 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                      Hide
                    </button>
                  </div>
                  <div className="space-y-2">
                    {archivedChats.map((t, i) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="relative rounded-2xl bg-card border border-border/50 overflow-hidden"
                      >
                        <div className="px-4 py-3.5 flex gap-3 items-center">
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl opacity-60">
                            {t.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-medium text-foreground/70 truncate">{t.name}</h4>
                            <p className="text-[12px] text-muted-foreground truncate mt-0.5">{t.lastMessage}</p>
                          </div>
                          <button
                            onClick={() => handleUnarchive(t.id)}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold active:scale-95 transition-transform"
                          >
                            <ArchiveRestore size={12} />
                            Unarchive
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredChats.length === 0 && archivedChats.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-secondary/50 mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle size={28} className="text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium text-foreground/80">No conversations yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Messages from hosts will appear here</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "notifications" && (
          <motion.div key="notifs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="px-5 space-y-2">
            {notifications.filter(n => !n.read && !readNotifications.has(n.id)).length > 0 && (
              <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">New</p>
            )}
            {notifications.map((notif, i) => {
              const isRead = notif.read || readNotifications.has(notif.id);
              const prevIsUnread = i > 0 && !notifications[i - 1].read && !readNotifications.has(notifications[i - 1].id);
              return (
                <div key={notif.id}>
                  {isRead && prevIsUnread && <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mt-4 mb-1">Earlier</p>}
                  <NotificationCard notif={notif} index={i} isRead={isRead} onRead={() => markRead(notif.id)} />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeConvo && <RealtimeChatView conversation={activeConvo} onBack={() => setActiveConvo(null)} />}
        {activeMockThread && <MockChatView threadId={activeMockThread.id} thread={activeMockThread} onBack={() => setActiveMockThread(null)} />}
      </AnimatePresence>
    </div>
  );
}
