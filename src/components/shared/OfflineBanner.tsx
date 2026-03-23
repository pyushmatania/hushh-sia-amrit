import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-[9999] bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center gap-2 py-2 px-4"
        >
          <WifiOff size={14} />
          You're offline — some features may be unavailable
        </motion.div>
      )}
    </AnimatePresence>
  );
}
