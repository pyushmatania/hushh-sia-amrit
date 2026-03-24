import { useNativeOnlineStatus } from "@/lib/native-network";

/** Re-export using native Capacitor network detection */
export function useOnlineStatus() {
  const { isOnline } = useNativeOnlineStatus();
  return isOnline;
}
