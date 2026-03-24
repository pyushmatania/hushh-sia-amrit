import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hushh.jeypore",
  appName: "Hushh Jeypore",
  webDir: "dist",
  server: {
    url: "https://hushh-jeypore.lovable.app?forceHideBadge=true",
    cleartext: true,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: "#050505",
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      backgroundColor: "#050505",
      androidScaleType: "CENTER_CROP",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_notification",
      iconColor: "#a65eed",
      sound: "default",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#050505",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
