self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()); });

self.addEventListener('push', (event) => {
  let data = {
    title: 'Hushh Jeypore',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    image: null,
    actions: [],
    tag: 'hushh-notification',
    silent: false,
    vibrate: [200, 100, 200],
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        url: payload.url || data.url,
        image: payload.image || null,
        actions: payload.actions || [],
        tag: payload.tag || data.tag,
        silent: payload.silent || false,
        vibrate: payload.vibrate || data.vibrate,
      };
    }
  } catch (e) {
    try { if (event.data) data.body = event.data.text(); } catch (_) {}
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    renotify: true,
    requireInteraction: false,
    data: { url: data.url },
    silent: data.silent,
    vibrate: data.vibrate,
  };

  // Rich notification: add image if provided (shows large image on iOS/Android)
  if (data.image) {
    options.image = data.image;
  }

  // Actions (max 2 on most platforms)
  if (data.actions && data.actions.length > 0) {
    options.actions = data.actions.slice(0, 2);
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(() =>
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls =>
        cls.forEach(c => c.postMessage({ type: 'PUSH_RECEIVED', payload: data }))
      )
    ).catch(() => {})
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      for (const c of cls) {
        if (c.url.includes(self.location.origin) && 'focus' in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
