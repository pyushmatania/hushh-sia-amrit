import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, emoji, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
      className="flex flex-col items-center justify-center px-10 pt-16 pb-8"
    >
      {/* Animated icon ring */}
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {emoji ? (
              <span className="text-3xl">{emoji}</span>
            ) : (
              <Icon size={32} className="text-primary" />
            )}
          </div>
        </div>
        {/* Decorative ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-dashed border-primary/15"
        />
      </motion.div>

      <h3 className="text-lg font-bold text-foreground text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed max-w-[260px]">
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="mt-5 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg"
          style={{ boxShadow: "0 4px 20px hsl(var(--primary) / 0.3)" }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
