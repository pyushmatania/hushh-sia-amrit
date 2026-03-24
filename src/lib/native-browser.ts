/**
 * In-app browser for external links using Capacitor Browser plugin.
 * Falls back to window.open on web.
 */
import { Capacitor } from "@capacitor/core";

export async function openExternalUrl(url: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url, presentationStyle: "popover" });
      return;
    } catch { /* fall through */ }
  }
  window.open(url, "_blank", "noopener");
}

export async function closeInAppBrowser() {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.close();
    } catch { /* ignore */ }
  }
}
