// Firebase Messaging Service Worker
// Handles background push notifications when the browser tab is not in focus

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyB1DQ7netegwoxIflP79uzyxWpoDUGvylQ",
  authDomain:        "scg-tuitions.firebaseapp.com",
  projectId:         "scg-tuitions",
  storageBucket:     "scg-tuitions.firebasestorage.app",
  messagingSenderId: "998205532847",
  appId:             "1:998205532847:web:f4fb5eaac1e9a4c1e6825a"
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
      const existing = wins.find(w => w.url.includes('parent-chat.html'));
      if (existing) return existing.focus();
      return clients.openWindow('/parent-chat.html');
    })
  );
});
