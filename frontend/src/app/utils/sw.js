
console.log('initializing sw')

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  const data = event.data ? event.data.json() : { title: 'Default Title', body: 'Default Body' };
  const options = {
    body: data.body,
    // icon: '/browser/assets/icon.png', // Update asset paths if needed
    // badge: '/browser/assets/badge.png'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});