import { WifiOff } from "lucide-react";
import { useNativeOnlineStatus } from "@/lib/native-network";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/** Detect slow connection via Network Information API */
function useSlowConnection() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (!conn) return;

    const check = () => {
      const effectiveType = conn.effectiveType;
      // 2g or slow-2g are definitely slow; 3g can also be sluggish
      setIsSlow(effectiveType === "slow-2g" || effectiveType === "2g");
    };

    check();
    conn.addEventListener("change", check);
    return () => conn.removeEventListener("change", check);
  }, []);

  return isSlow;
}

export default function OfflineBanner() {
  const { isOnline } = useNativeOnlineStatus();
  const isSlow = useSlowConnection();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-[9999] bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center gap-2 py-2 px-4"
        >
          <WifiOff size={14} />
          You're offline — some features may be unavailable
        </motion.div>
      )}
      {isOnline && isSlow && (
        <motion.div
          key="slow"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-[9999] bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-2 py-2 px-4"
        >
          Slow connection detected — images may load slowly
        </motion.div>
      )}
    </AnimatePresence>
  );
}
