import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, BellOff, Check, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  onBack: () => void;
}

export default function NotificationCenter({ onBack }: NotificationCenterProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-background flex items-center justify-center"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: "100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 md:px-8 lg:px-16 xl:px-24 2xl:px-32 md:pt-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft size={20} className="text-foreground" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
          >
            <CheckCheck size={14} /> Mark all read
          </motion.button>
        )}
      </div>

      {/* Notifications List */}
      <div className="px-4 mt-2 space-y-2">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <BellOff size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">All caught up!</p>
            <p className="text-xs text-muted-foreground">You have no notifications yet.</p>
          </div>
        )}

        <AnimatePresence>
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !n.read && markAsRead(n.id)}
              className={`glass rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition-all ${
                !n.read ? "border-l-2 border-l-primary" : "opacity-70"
              }`}
            >
              <span className="text-2xl mt-0.5">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {n.read && (
                <Check size={14} className="text-muted-foreground/50 shrink-0 mt-1" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
