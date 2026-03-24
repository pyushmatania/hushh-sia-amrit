/**
 * Capacitor native platform detection & initialization.
 * Provides a single source of truth for "are we in a native app?"
 * and initialises native plugins on startup.
 */
import { Capacitor } from "@capacitor/core";

/** true when running inside a Capacitor native shell (Android/iOS) */
export const isNative = Capacitor.isNativePlatform();

/** true specifically on Android */
export const isAndroid = Capacitor.getPlatform() === "android";

/** true specifically on iOS */
export const isIOS = Capacitor.getPlatform() === "ios";

/**
 * Initialise native-only plugins.
 * Call once from App.tsx on mount.
 */
export async function initNativePlugins() {
  if (!isNative) return;

  // Status bar — dark content, transparent overlay
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#050505" });
    if (isAndroid) {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch {
    // Plugin may not be available
  }

  // Register for push notifications
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const permResult = await PushNotifications.checkPermissions();
    if (permResult.receive === "prompt") {
      await PushNotifications.requestPermissions();
    }
    await PushNotifications.register();

    // Listen for registration token
    PushNotifications.addListener("registration", (token) => {
      console.log("[Native Push] Token:", token.value);
      localStorage.setItem("hushh_native_push_token", token.value);
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.warn("[Native Push] Registration error:", err.error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("[Native Push] Received:", notification.title);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("[Native Push] Action:", action.notification.title);
    });
  } catch {
    // Push not available
  }
}