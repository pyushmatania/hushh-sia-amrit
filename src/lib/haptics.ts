/**
 * Haptic feedback utility using the Web Vibration API.
 * Falls back silently on unsupported devices.
 */

import { Capacitor } from "@capacitor/core";

let HapticsPlugin: typeof import("@capacitor/haptics").Haptics | null = null;

// Eagerly load the native haptics plugin when in a Capacitor shell
if (Capacitor.isNativePlatform()) {
  import("@capacitor/haptics").then((m) => {
    HapticsPlugin = m.Haptics;
  }).catch(() => {});
}

export function hapticLight() {
  if (HapticsPlugin) {
    HapticsPlugin.impact({ style: "LIGHT" as any }).catch(() => {});
    return;
  }
  navigator.vibrate?.(10);
}

export function hapticMedium() {
  if (HapticsPlugin) {
    HapticsPlugin.impact({ style: "MEDIUM" as any }).catch(() => {});
    return;
  }
  navigator.vibrate?.(25);
}

export function hapticHeavy() {
  if (HapticsPlugin) {
    HapticsPlugin.impact({ style: "HEAVY" as any }).catch(() => {});
    return;
  }
  navigator.vibrate?.([30, 10, 30]);
}

export function hapticSuccess() {
  if (HapticsPlugin) {
    HapticsPlugin.notification({ type: "SUCCESS" as any }).catch(() => {});
    return;
  }
  navigator.vibrate?.([10, 30, 10, 30, 50]);
}

export function hapticError() {
  if (HapticsPlugin) {
    HapticsPlugin.notification({ type: "ERROR" as any }).catch(() => {});
    return;
  }
  navigator.vibrate?.([50, 50, 50]);
}

export function hapticSelection() {
  if (HapticsPlugin) {
    HapticsPlugin.selectionStart().catch(() => {});
    return;
  }
  navigator.vibrate?.(5);
}
