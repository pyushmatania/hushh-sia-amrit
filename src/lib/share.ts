import type { Property } from "@/data/properties";

interface ShareData {
  title: string;
  text: string;
  url: string;
}

function buildShareData(property: Property): ShareData {
  return {
    title: `${property.name} — Hushh`,
    text: `Check out ${property.name} in ${property.location} on Hushh! ⭐ ${property.rating} · Starting at ₹${property.basePrice.toLocaleString()}`,
    url: `${window.location.origin}/?property=${property.id}`,
  };
}

export async function shareProperty(property: Property) {
  const data = buildShareData(property);

  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      // User cancelled
      return false;
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
    return true;
  } catch {
    return false;
  }
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

  if (navigator.share) {
    navigator.share({ title: "Join Hushh", text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
  }
}
