/**
 * Re-exports from native-share for backward compatibility.
 * All share/clipboard logic now uses Capacitor native plugins.
 */
export {
  shareProperty,
  getWhatsAppShareUrl,
  getTwitterShareUrl,
  shareReferralCode,
  nativeShare,
  nativeCopy,
} from "./native-share";
