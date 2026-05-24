# SCG Tuitions Parent Portal — Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `scg-tuitions`
3. Disable Google Analytics (optional)
4. Click **Create project**

## 2. Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Sign-in method → **Email/Password** → Enable → Save

## 3. Enable Firestore

1. **Firestore Database** → **Create database**
2. Choose **Production mode** → Select region (e.g. `europe-west2` for UK)
3. Click **Done**

## 4. Deploy Firestore Rules

In your terminal (with Firebase CLI installed):
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` into the **Rules** tab in Firebase Console.

## 5. Add Firebase to the Web App

1. Firebase Console → **Project Settings** (gear icon) → **General**
2. Under "Your apps" → click the Web icon `</>`
3. Register app (name: `scg-parent-portal`)
4. Copy the `firebaseConfig` object
5. Paste it into **both**:
   - `js/firebase-config.js` (replace the `YOUR_*` placeholders)
   - `firebase-messaging-sw.js` (replace the `YOUR_*` placeholders)

## 6. Enable Cloud Messaging (for push notifications)

1. Firebase Console → **Project Settings** → **Cloud Messaging**
2. Under "Web Push certificates" → **Generate key pair**
3. Copy the **Key pair** (VAPID public key)
4. Paste it into `js/firebase-config.js` as the value of `VAPID_KEY`

## 7. Deploy to Firebase Hosting (free)

```bash
firebase init hosting   # select your project, set public dir to "."
firebase deploy --only hosting
```

Your app will be live at `https://scg-tuitions.web.app` (or your custom domain).

## 8. Create the First Teacher Account

1. Open the app → click **Register**
2. Select role: **Teacher / Tutor**
3. Register with the teacher's email

## How Notifications Work

- Parents who keep the browser tab open receive **hourly browser notifications** until they confirm reading a message.
- When the parent clicks **"I have read the message"**, all reminders for that message stop immediately.
- Notifications also work when the browser is minimised (but tab is open).
- For truly reliable background push notifications (browser fully closed), Firebase Cloud Functions are needed (requires Blaze billing plan).

## Firestore Indexes Required

Add this composite index in Firebase Console → Firestore → Indexes:

| Collection | Fields | Query scope |
|---|---|---|
| `messages` | `toUserId` ASC, `createdAt` DESC | Collection |
| `messages` | `fromUserId` ASC, `createdAt` DESC | Collection |
