/**
 * Native share & clipboard using Capacitor plugins.
 * Falls back to Web APIs on non-native platforms.
 */
import { Capacitor } from "@capacitor/core";
import type { Property } from "@/data/properties";

function buildShareData(property: Property) {
  return {
    title: `${property.name} — Hushh`,
    text: `Check out ${property.name} in ${property.location} on Hushh! ⭐ ${property.rating} · Starting at ₹${property.basePrice.toLocaleString()}`,
    url: `${window.location.origin}/?property=${property.id}`,
  };
}

export async function nativeShare(opts: { title: string; text: string; url?: string }): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
        dialogTitle: opts.title,
      });
      return true;
    } catch { return false; }
  }
  // Web fallback
  if (navigator.share) {
    try { await navigator.share(opts); return true; } catch { return false; }
  }
  return nativeCopy(`${opts.text}\n${opts.url || ""}`);
}

export async function nativeCopy(text: string): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Clipboard } = await import("@capacitor/clipboard");
      await Clipboard.write({ string: text });
      return true;
    } catch { /* fall through */ }
  }
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

export async function shareProperty(property: Property): Promise<boolean> {
  const data = buildShareData(property);
  return nativeShare(data);
}

export function getWhatsAppShareUrl(property: Property): string {
  const data = buildShareData(property);
  return `https://wa.me/?text=${encodeURIComponent(`${data.text}\n${data.url}`)}`;
}

export function getTwitterShareUrl(property: Property): string {
  const data = buildShareData(property);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`;
}

export function shareReferralCode(code: string) {
  const text = `Join me on Hushh! Use my referral code ${code} and we both earn 100 reward points! 🎉`;
  const url = `${window.location.origin}/?ref=${code}`;
  nativeShare({ title: "Join Hushh", text, url });
}
