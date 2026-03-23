self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()); });

self.addEventListener('push', (event) => {
  let data = { title: 'Hushh Jeypore', body: 'You have a new notification', icon: '/icon-192.png', badge: '/icon-192.png', url: '/' };
  try {
    if (event.data) {
      const payload = event.data.json();
      data = { title: payload.title || data.title, body: payload.body || data.body, icon: payload.icon || data.icon, badge: payload.badge || data.badge, url: payload.url || data.url };
    }
  } catch (e) {
    try { if (event.data) data.body = event.data.text(); } catch (_) {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body, icon: data.icon, badge: data.badge, tag: 'hushh-notification', renotify: true, requireInteraction: false, data: { url: data.url },
    }).then(() =>
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls =>
        cls.forEach(c => c.postMessage({ type: 'PUSH_RECEIVED', payload: data }))
      )
    ).catch(() => {})
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
      for (const c of cls) { if (c.url.includes(self.location.origin) && 'focus' in c) { c.navigate(url); return c.focus(); } }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
