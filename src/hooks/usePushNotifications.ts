import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

const VAPID_PUBLIC_KEY = 'BG1pTfhyjNsScfEnyuW_YVgxhhkFPajS-KOrhkLRVs_u6e5LaPGt_itjHfTTeKBD82B_gBd9e4qvM8J4Msmmw_E';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const normalized = base64String.trim();
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const base64 = (normalized + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function subscribeWithCompatibility(
  registration: ServiceWorkerRegistration,
  appServerKey: Uint8Array<ArrayBuffer>,
) {
  try {
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey as BufferSource,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);

    // Safari fallback: retry using a plain ArrayBuffer payload.
    if (msg.includes('applicationServerKey') || msg.includes('P-256')) {
      const keyBuffer = appServerKey.buffer.slice(
        appServerKey.byteOffset,
        appServerKey.byteOffset + appServerKey.byteLength,
      );

      return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuffer,
      });
    }

    // Some browsers keep a stale subscription with another VAPID key.
    if (msg.includes('different application server key')) {
      const existing = await registration.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();
      return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey as BufferSource,
      });
    }

    throw error;
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isiOS, setIsiOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  useEffect(() => {
    const nativePlatform = Capacitor.isNativePlatform();
    setIsNativeApp(nativePlatform);

    // In native apps, push is handled by @capacitor/push-notifications (see native.ts)
    if (nativePlatform) {
      setIsSupported(true);
      // Check if we already have a token from native registration
      const nativeToken = localStorage.getItem('hushh_native_push_token');
      setIsSubscribed(!!nativeToken);
      setPermission('granted');
      return;
    }

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsiOS(isIOSDevice);
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsPWA(isPWAMode);

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(isIOSDevice && !isPWAMode ? false : supported);

    if ('Notification' in window) setPermission(Notification.permission);
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;
      const reg = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (!reg) { setIsSubscribed(false); return; }
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch { setIsSubscribed(false); }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) throw new Error('Push notifications are not supported');
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') throw new Error('Notification permission denied');

      const registration = await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      if (appServerKey.length !== 65 || appServerKey[0] !== 0x04) {
        throw new Error('Invalid VAPID public key format');
      }

      const subscription = await subscribeWithCompatibility(registration, appServerKey);

      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      if (!p256dhKey || !authKey) throw new Error('Failed to get subscription keys');

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('push_subscriptions' as any)
          .upsert({ user_id: user.id, endpoint: subscription.endpoint, p256dh, auth }, { onConflict: 'user_id,endpoint' });
        if (error) throw error;
      } else {
        // Guest mode — store locally, will sync on login
        localStorage.setItem('hushh_push_sub', JSON.stringify({ endpoint: subscription.endpoint, p256dh, auth }));
      }
      setIsSubscribed(true);
    } finally { setIsLoading(false); }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (!reg) { setIsSubscribed(false); return; }
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await (supabase.from('push_subscriptions' as any) as any).delete().eq('user_id', user.id).eq('endpoint', sub.endpoint);
      }
      setIsSubscribed(false);
    } finally { setIsLoading(false); }
  }, []);

  const nativeSubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive === 'granted') {
        await PushNotifications.register();
        setPermission('granted');
        setIsSubscribed(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    isiOS,
    isPWA,
    subscribe: isNativeApp ? nativeSubscribe : subscribe,
    unsubscribe,
  };
}
