// ─── SCG Tuitions — Firebase Configuration ───────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyB1DQ7netegwoxIflP79uzyxWpoDUGvylQ",
  authDomain:        "scg-tuitions.firebaseapp.com",
  projectId:         "scg-tuitions",
  storageBucket:     "scg-tuitions.firebasestorage.app",
  messagingSenderId: "998205532847",
  appId:             "1:998205532847:web:f4fb5eaac1e9a4c1e6825a",
  measurementId:     "G-HEM997VNEG"
};

// VAPID key for web push notifications
// Go to: Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = "BKJhIo0VtNHNirHWlRZyI3QRtEYIgj_zw-W2KNh7g3jZOfz75clrgPdex-sZrnoqZcyy4-gJNAgj8wBCrza4eaI";

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
