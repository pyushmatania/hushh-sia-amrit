/**
 * Key-value storage using Capacitor Preferences plugin.
 * Falls back to localStorage on web.
 */
import { Capacitor } from "@capacitor/core";

let PrefsPlugin: typeof import("@capacitor/preferences").Preferences | null = null;

if (Capacitor.isNativePlatform()) {
  import("@capacitor/preferences").then((m) => {
    PrefsPlugin = m.Preferences;
  }).catch(() => {});
}

export async function setPreference(key: string, value: string) {
  if (PrefsPlugin) {
    await PrefsPlugin.set({ key, value });
  } else {
    localStorage.setItem(key, value);
  }
}

export async function getPreference(key: string): Promise<string | null> {
  if (PrefsPlugin) {
    const { value } = await PrefsPlugin.get({ key });
    return value;
  }
  return localStorage.getItem(key);
}

export async function removePreference(key: string) {
  if (PrefsPlugin) {
    await PrefsPlugin.remove({ key });
  } else {
    localStorage.removeItem(key);
  }
}
