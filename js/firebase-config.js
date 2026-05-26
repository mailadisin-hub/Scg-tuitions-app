// ─────────────────────────────────────────────────────────────────────────────
// FILL IN YOUR FIREBASE PROJECT CONFIG BELOW
// Go to: Firebase Console → Project Settings → General → Your apps → Web app
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// VAPID key for web push notifications
// Go to: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = "YOUR_VAPID_PUBLIC_KEY";

firebase.initializeApp(firebaseConfig);

const auth    = firebase.auth();
const db      = firebase.firestore();
const storage = firebase.storage();

let messaging = null;
try {
  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
    if (VAPID_KEY !== "YOUR_VAPID_PUBLIC_KEY") {
      messaging.usePublicVapidKey(VAPID_KEY);
    }
  }
} catch (e) {
  console.warn("Firebase Messaging not supported in this browser:", e.message);
}
