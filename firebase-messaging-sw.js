// Firebase Messaging Service Worker
// Handles background push notifications when the browser tab is not in focus

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ─── IMPORTANT: paste your Firebase config here too ──────────────────────────
firebase.initializeApp({
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Handle background messages sent via FCM
messaging.onBackgroundMessage(payload => {
  const notif = payload.notification || {};
  const title = notif.title || '📚 SCG Tuitions — Unread Message';
  const body  = notif.body  || 'You have an unread message from your child\'s teacher.';

  self.registration.showNotification(title, {
    body,
    icon:             '/favicon.ico',
    badge:            '/favicon.ico',
    requireInteraction: true,
    data:             payload.data || {},
    actions: [
      { action: 'open', title: 'Open App' },
    ]
  });
});

// Handle notification click — open the parent dashboard
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
      const existing = wins.find(w => w.url.includes('parent-dashboard.html'));
      if (existing) return existing.focus();
      return clients.openWindow('/parent-dashboard.html');
    })
  );
});
