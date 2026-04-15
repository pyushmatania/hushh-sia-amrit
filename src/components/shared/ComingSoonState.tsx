import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ComingSoonStateProps {
  emoji?: string;
  title?: string;
  description?: string;
  variant?: "full" | "section";
}

const categoryMessages: Record<string, { emoji: string; title: string; description: string }> = {
  stays: {
    emoji: "🏡",
    title: "Stunning stays coming soon",
    description: "We're curating the finest villas, farmhouses & retreats in your area. Stay tuned!",
  },
  experiences: {
    emoji: "🎭",
    title: "Experiences launching soon",
    description: "Adventure, culture & celebrations — exciting experiences are being crafted for you.",
  },
  services: {
    emoji: "✨",
    title: "Premium services on the way",
    description: "Chef bookings, décor setups & more — our service partners are gearing up.",
  },
  curations: {
    emoji: "🎁",
    title: "Curated bundles arriving soon",
    description: "Hand-picked combos designed by locals — perfect evenings, one tap away.",
  },
  trips: {
    emoji: "🗺️",
    title: "No trips yet",
    description: "Once you book your first experience, it'll show up here. Your adventure awaits!",
  },
  wishlists: {
    emoji: "💜",
    title: "Your wishlist is empty",
    description: "Tap the heart on any listing to save it here for later.",
  },
  messages: {
    emoji: "💬",
    title: "No conversations yet",
    description: "When you book a stay or experience, you can chat directly with the host here.",
  },
  notifications: {
    emoji: "🔔",
    title: "All caught up!",
    description: "You'll receive booking confirmations, offers & updates here.",
  },
  connections: {
    emoji: "👋",
    title: "No connections yet",
    description: "Connect with fellow travellers and hosts after your first experience.",
  },
  loyalty: {
    emoji: "⭐",
    title: "Rewards await you",
    description: "Book your first experience to start earning points and unlock exclusive perks.",
  },
  reviews: {
    emoji: "📝",
    title: "No reviews yet",
    description: "Reviews from verified guests will appear here once published.",
  },
  default: {
    emoji: "🚀",
    title: "Coming soon",
    description: "We're working on something exciting. Check back shortly!",
  },
};

export function getComingSoonMessage(category: string) {
  return categoryMessages[category] || categoryMessages.default;
}

export default function ComingSoonState({
  emoji,
  title,
  description,
  variant = "full",
}: ComingSoonStateProps) {
  const msg = categoryMessages.default;
  const finalEmoji = emoji || msg.emoji;
  const finalTitle = title || msg.title;
  const finalDesc = description || msg.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 24 }}
      className={`flex flex-col items-center justify-center text-center ${
        variant === "full" ? "px-10 pt-20 pb-12" : "px-8 py-12"
      }`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring" }}
        className="relative mb-5"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center rotate-3">
          <span className="text-4xl">{finalEmoji}</span>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles size={16} className="text-primary/60" />
        </motion.div>
      </motion.div>

      <h3 className="text-lg font-bold text-foreground">{finalTitle}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[280px]">
        {finalDesc}
      </p>
    </motion.div>
  );
}
