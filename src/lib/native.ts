/**
 * Capacitor native platform detection & initialization.
 */
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === "android";
export const isIOS = Capacitor.getPlatform() === "ios";

export async function initNativePlugins() {
  if (!isNative) return;

  // Hide Capacitor splash screen immediately (we use our own React splash)
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {}

  // Status bar
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#050505" });
    if (isAndroid) {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch {}

  // Lock portrait
  try {
    const { ScreenOrientation } = await import("@capacitor/screen-orientation");
    await ScreenOrientation.lock({ orientation: "portrait" });
  } catch {}

  // Keyboard on iOS
  if (isIOS) {
    try {
      const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      await Keyboard.setScroll({ isDisabled: false });
    } catch {}
  }

  // Android back button
  if (isAndroid) {
    try {
      const { App: CapApp } = await import("@capacitor/app");
      CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.minimizeApp();
        }
      });
    } catch {}
  }

  // Deep links
  try {
    const { App: CapApp } = await import("@capacitor/app");
    CapApp.addListener("appUrlOpen", (event) => {
      const url = new URL(event.url);
      const path = url.pathname + url.search;
      if (path) {
        window.location.hash = "";
        window.history.pushState(null, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    });
  } catch {}

  // Push notifications
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const permResult = await PushNotifications.checkPermissions();
    if (permResult.receive === "prompt") {
      await PushNotifications.requestPermissions();
    }
    await PushNotifications.register();

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
  } catch {}
}
