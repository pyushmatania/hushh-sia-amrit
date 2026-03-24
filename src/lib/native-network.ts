/**
 * Network status using Capacitor Network plugin.
 * Falls back to browser online/offline events.
 */
import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export function useNativeOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (Capacitor.isNativePlatform()) {
      import("@capacitor/network").then(async ({ Network }) => {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);

        const handle = await Network.addListener("networkStatusChange", (s) => {
          setIsOnline(s.connected);
          setConnectionType(s.connectionType);
        });
        cleanup = () => { handle.remove(); };
      }).catch(() => {
        // Fall back to browser events
        setIsOnline(navigator.onLine);
      });
    } else {
      setIsOnline(navigator.onLine);
      const on = () => setIsOnline(true);
      const off = () => setIsOnline(false);
      window.addEventListener("online", on);
      window.addEventListener("offline", off);
      cleanup = () => {
        window.removeEventListener("online", on);
        window.removeEventListener("offline", off);
      };
    }

    return () => { cleanup?.(); };
  }, []);

  return { isOnline, connectionType };
}
