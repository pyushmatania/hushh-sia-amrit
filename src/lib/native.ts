/**
 * Capacitor native platform detection & initialization.
 * All plugin calls are wrapped in try/catch so a missing or misconfigured
 * native dependency never crashes the app.
 */
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === "android";
export const isIOS = Capacitor.getPlatform() === "ios";

export async function initNativePlugins() {
  if (!isNative) return;

  // ── Splash screen ─────────────────────────────────────────────────────
  // Hide immediately — the React SplashScreen component handles the branded splash.
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 0 });
  } catch {}

  // ── Status bar ────────────────────────────────────────────────────────
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#050505" });
    if (isAndroid) {
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch {}

  // ── Portrait lock ─────────────────────────────────────────────────────
  try {
    const { ScreenOrientation } = await import("@capacitor/screen-orientation");
    await ScreenOrientation.lock({ orientation: "portrait" });
  } catch {}

  // ── Keyboard (iOS-specific) ───────────────────────────────────────────
  if (isIOS) {
    try {
      const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      await Keyboard.setScroll({ isDisabled: false });
    } catch {}
  }

  // ── Android back button ───────────────────────────────────────────────
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

  // ── Deep links ────────────────────────────────────────────────────────
  try {
    const { App: CapApp } = await import("@capacitor/app");
    CapApp.addListener("appUrlOpen", (event) => {
      try {
        const url = new URL(event.url);
        const path = url.pathname + url.search;
        if (path && path !== "/") {
          window.history.pushState(null, "", path);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      } catch {}
    });
  } catch {}

  // ── Push notifications ────────────────────────────────────────────────
  // Only register after the app is fully loaded to avoid startup crashes.
  // The PushNotifications plugin requires Firebase (google-services.json).
  // If Firebase is not configured, this silently fails.
  setTimeout(async () => {
    try {
      const { PushNotifications } = await import("@capacitor/push-notifications");

      const permResult = await PushNotifications.checkPermissions();

      if (permResult.receive === "denied") {
        console.warn("[Native Push] Permission denied by user.");
        return;
      }

      if (permResult.receive === "prompt" || permResult.receive === "prompt-with-rationale") {
        const requestResult = await PushNotifications.requestPermissions();
        if (requestResult.receive !== "granted") {
          console.warn("[Native Push] User declined permission.");
          return;
        }
      }

      await PushNotifications.register();

      PushNotifications.addListener("registration", (token) => {
        console.log("[Native Push] FCM token:", token.value.slice(0, 20) + "…");
        localStorage.setItem("hushh_native_push_token", token.value);
        // Dispatch event so the app can pick up the token for Supabase storage
        window.dispatchEvent(new CustomEvent("hushh:push-token", { detail: token.value }));
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.warn("[Native Push] Registration error:", err.error);
      });

      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("[Native Push] Received:", notification.title);
        window.dispatchEvent(new CustomEvent("hushh:notification", { detail: notification }));
      });

      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        console.log("[Native Push] Tapped:", action.notification.title);
        // Navigate to the URL in the notification data if present
        const url = action.notification.data?.url;
        if (url) {
          try {
            const path = new URL(url).pathname;
            window.history.pushState(null, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          } catch {}
        }
      });
    } catch (err) {
      // Firebase not configured or push not available — fail silently
      console.warn("[Native Push] Not available:", err);
    }
  }, 3000); // Delay so startup is never blocked
}

// ── Camera permission helper ──────────────────────────────────────────────
export async function requestCameraPermission(): Promise<boolean> {
  if (!isNative) return true;
  try {
    const { Camera } = await import("@capacitor/camera");
    const result = await Camera.requestPermissions({ permissions: ["camera", "photos"] });
    return result.camera === "granted" || result.camera === "limited";
  } catch {
    return false;
  }
}

// ── Location permission helper ────────────────────────────────────────────
export async function requestLocationPermission(): Promise<boolean> {
  if (!isNative) return true;
  try {
    const { Geolocation } = await import("@capacitor/geolocation");
    const result = await Geolocation.requestPermissions();
    return result.location === "granted";
  } catch {
    return false;
  }
}

// ── Current location ──────────────────────────────────────────────────────
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const { Geolocation } = await import("@capacitor/geolocation");
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}
