import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hushh.jeypore",
  appName: "Hushh Jeypore",
  webDir: "dist",
  // Live-update mode: loads the app from the Lovable deployment
  // This lets the app update without a new APK release.
  server: {
    url: "https://hushh-jeypore.lovable.app?forceHideBadge=true",
    cleartext: false,
    androidScheme: "https",
    // Allow all origins for native plugin AJAX calls
    allowNavigation: [
      "*.supabase.co",
      "*.supabase.in",
      "hushh-jeypore.lovable.app",
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    // Only enable debugging in dev — production APK should have this false
    webContentsDebuggingEnabled: false,
    backgroundColor: "#050505",
  },
  plugins: {
    SplashScreen: {
      // We control the splash via our React SplashScreen component.
      // Hide the native splash as fast as possible.
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: "#050505",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#a65eed",
      sound: "default",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#050505",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
    Geolocation: {
      // Request only "when in use" by default; background needs explicit ask
    },
    Camera: {
      // Photo library and camera permission strings
    },
  },
};

export default config;
