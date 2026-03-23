import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = 'BOZAnbOohkjHyyrTWPRRvQT7FYgNccEd_odHdTLUDmz9vLNvNkznlQCnvNUc7DBEgxR80WBcYhnctqLgafZmXJ4';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const normalized = base64String.trim();
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const base64 = (normalized + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
...
      await navigator.serviceWorker.ready;

      const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      if (appServerKey.length !== 65 || appServerKey[0] !== 0x04) {
        throw new Error('Invalid VAPID public key format');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey as BufferSource,
      });

      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      if (!p256dhKey || !authKey) throw new Error('Failed to get subscription keys');

      const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('push_subscriptions' as any)
        .upsert({ user_id: user.id, endpoint: subscription.endpoint, p256dh, auth }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;
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

  return { isSupported, isSubscribed, permission, isLoading, isiOS, isPWA, subscribe, unsubscribe };
}
