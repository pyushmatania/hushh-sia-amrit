import { useState, useEffect, useCallback, useMemo } from "react";
import { format as fnsFormat } from "date-fns";

// ── Persisted keys ──────────────────────────────────────────
const LS_KEY = "hushh_locale_settings";

export interface LocaleSettings {
  lang: string;          // "en", "hi", etc.
  currency: string;      // "inr", "usd", etc.
  timezone: string;      // "ist", "utc", etc.
  dateFormat: string;    // "dmy", "mdy", "ymd", "relative"
  timeFormat: "12h" | "24h";
  tempUnit: string;      // "celsius" | "fahrenheit"
  distUnit: string;      // "km" | "miles"
}

const defaults: LocaleSettings = {
  lang: "en",
  currency: "inr",
  timezone: "ist",
  dateFormat: "dmy",
  timeFormat: "12h",
  tempUnit: "celsius",
  distUnit: "km",
};

function load(): LocaleSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return { ...defaults };
}

function save(s: LocaleSettings) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}

// ── Singleton so all hooks share one state ──────────────────
let cached: LocaleSettings = load();
let listeners: Array<() => void> = [];
const notify = () => listeners.forEach((l) => l());

export function updateLocaleSettings(partial: Partial<LocaleSettings>) {
  cached = { ...cached, ...partial };
  save(cached);
  notify();
}

export function getLocaleSettings(): LocaleSettings {
  return cached;
}

// ── Timezone offsets (minutes from UTC) ─────────────────────
const tzOffsets: Record<string, number> = {
  ist: 330, utc: 0, est: -300, pst: -480, gst: 240,
};

// ── Currency symbols ────────────────────────────────────────
const currencySymbols: Record<string, string> = {
  inr: "₹", usd: "$", eur: "€", gbp: "£", aed: "د.إ",
};

// ── Hook ────────────────────────────────────────────────────
export function useLocaleSettings() {
  const [settings, setSettings] = useState<LocaleSettings>(cached);

  useEffect(() => {
    const handler = () => setSettings({ ...cached });
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  const update = useCallback((partial: Partial<LocaleSettings>) => {
    updateLocaleSettings(partial);
  }, []);

  /** Get the current real time adjusted for the user's chosen timezone */
  const nowInTimezone = useCallback((): Date => {
    const now = new Date();
    const offset = tzOffsets[settings.timezone] ?? 330; // default IST
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcMs + offset * 60000);
  }, [settings.timezone]);

  /** Format a date string/Date according to user prefs */
  const formatDate = useCallback((input: string | Date): string => {
    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);

    if (settings.dateFormat === "relative") {
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      if (diff === -1) return "Tomorrow";
      if (diff > 1 && diff < 7) return `${diff} days ago`;
    }

    switch (settings.dateFormat) {
      case "mdy": return fnsFormat(d, "MM/dd/yyyy");
      case "ymd": return fnsFormat(d, "yyyy-MM-dd");
      case "dmy":
      default:    return fnsFormat(d, "dd/MM/yyyy");
    }
  }, [settings.dateFormat]);

  /** Format a date in a short human-readable form (e.g., "15 Apr 2026") */
  const formatDateShort = useCallback((input: string | Date): string => {
    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);
    switch (settings.dateFormat) {
      case "mdy": return fnsFormat(d, "MMM d, yyyy");
      case "ymd": return fnsFormat(d, "yyyy MMM d");
      case "dmy":
      default:    return fnsFormat(d, "d MMM yyyy");
    }
  }, [settings.dateFormat]);

  /** Format time according to 12h/24h preference */
  const formatTime = useCallback((input: string | Date): string => {
    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);
    return settings.timeFormat === "24h"
      ? fnsFormat(d, "HH:mm")
      : fnsFormat(d, "h:mm a");
  }, [settings.timeFormat]);

  /** Format a time string like "14:00" to user's preference */
  const formatTimeString = useCallback((timeStr: string): string => {
    if (!timeStr || !timeStr.includes(":")) return timeStr;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    if (settings.timeFormat === "24h") {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  }, [settings.timeFormat]);

  /** Format date+time together */
  const formatDateTime = useCallback((input: string | Date): string => {
    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) return String(input);
    return `${formatDateShort(d)} · ${formatTime(d)}`;
  }, [formatDateShort, formatTime]);

  /** Currency symbol */
  const currencySymbol = currencySymbols[settings.currency] ?? "₹";

  /** Format currency amount */
  const formatCurrency = useCallback((amount: number): string => {
    const sym = currencySymbols[settings.currency] ?? "₹";
    return `${sym}${amount.toLocaleString("en-IN")}`;
  }, [settings.currency]);

  /** Get time-of-day greeting based on real current hour */
  const getGreeting = useCallback((): { text: string; emoji: string; period: "morning" | "afternoon" | "evening" | "night" } => {
    const now = nowInTimezone();
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", emoji: "☀️", period: "morning" };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", emoji: "🌤️", period: "afternoon" };
    if (hour >= 17 && hour < 21) return { text: "Good Evening", emoji: "🌅", period: "evening" };
    return { text: "Good Night", emoji: "🌙", period: "night" };
  }, [nowInTimezone]);

  /** Live clock that updates every minute */
  const [currentTime, setCurrentTime] = useState(() => nowInTimezone());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(nowInTimezone()), 60000);
    return () => clearInterval(interval);
  }, [nowInTimezone]);

  return {
    settings,
    update,
    nowInTimezone,
    formatDate,
    formatDateShort,
    formatTime,
    formatTimeString,
    formatDateTime,
    currencySymbol,
    formatCurrency,
    getGreeting,
    currentTime,
  };
}
