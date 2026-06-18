---
title: SCG Tuitions App - Firebase & Firestore
domain: projects
level: reference
status: active
tags: [scg-tuitions, firebase, firestore, auth, security-rules, data-model]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions — Firebase & Firestore

## Firebase Config (`js/firebase-config.js`)

```js
const firebaseConfig = {
  apiKey:            "AIzaSyB1DQ7netegwoxIflP79uzyxWpoDUGvylQ",
  authDomain:        "scg-tuitions.firebaseapp.com",
  projectId:         "scg-tuitions",
  storageBucket:     "scg-tuitions.firebasestorage.app",
  messagingSenderId: "998205532847",
  appId:             "1:998205532847:web:f4fb5eaac1e9a4c1e6825a"
};
const VAPID_KEY = "BKJhIo0VtNHNirHWlRZyI3QRtEYIgj_zw-W2KNh7g3jZOfz75clrgPdex-sZrnoqZcyy4-gJNAgj8wBCrza4eaI";

firebase.initializeApp(firebaseConfig);
const auth    = firebase.auth();
const db      = firebase.firestore();
const storage = firebase.storage();
```

SDK: Firebase compat v9.23.0 via CDN (Auth, Firestore, Messaging, Storage).

## Auth Flow

1. Register: user picks role → parent or teacher
2. Teacher must enter invite code (validated against `teacherInvites` collection — public read, no auth needed)
3. Firebase Auth user created → `users/{uid}` doc written to Firestore
4. `requireAuth(expectedRole)` in `js/auth.js` guards every page
5. Wrong role → redirected to their correct home. No profile → signed out.

## Firestore Collections

### `users/{uid}`
```js
{
  displayName: string,
  email: string,
  role: "parent" | "teacher" | "admin",
  childName: string,      // parents only
  childYear: string,      // parents only — e.g. "Year 6"
  teacherId: string,      // parents only — UID of their teacher
  createdAt: Timestamp
}
```
> **Action needed:** Set `role: "admin"` for mail.adisin@gmail.com in Firestore Console.

### `conversations/{convId}` + `/messages/{msgId}`
```js
// conversation doc
{
  teacherId, teacherName, parentId, parentName,
  lastMessage: string,
  lastMessageAt: Timestamp,
  parentUnread: number,    // triggers notifications when > 0
  teacherUnread: number,
  createdAt: Timestamp
}
// message sub-doc
{
  senderId, senderName, senderRole: "teacher"|"parent",
  content: string,
  sentAt: Timestamp,
  readAt: Timestamp | null
}
```

### `attendance/{docId}`
```js
{ studentId, studentName, teacherId, date, sessionLabel, status: "present"|"absent"|"late", createdAt }
```

### `homework/{docId}`
```js
{ studentId, studentName, teacherId, sessionDate, sessionLabel, brought: bool, marked: bool, notes, createdAt }
```

### `books/{docId}`
```js
{ studentId, studentName, teacherId, halfTerm, titles: string[], givenAt, notes }
```

### `payments/{docId}`
```js
{
  parentId, studentName, parentName, teacherId,
  termName, amountDue: number (pence), dueDate,
  paid: bool, paidAt, paymentMethod,
  stripePaymentLink: string,    // pasted from Stripe dashboard
  sumupPaymentLink: string | null,
  invoiceNumber: string,        // e.g. "SCG-2026-001"
  notes, createdAt
}
```

### `assessments/{docId}`
```js
{ studentId, studentName, teacherId, name, date, score, notes, fileUrl, fileName, createdAt }
```
> Requires Firebase Storage on Blaze plan for PDF uploads.

### `registrations/{docId}`
```js
{ parentId, parentName, studentName, academicYear, decision: "continue"|"not_continue"|null, decidedAt, createdAt }
```

### `settings/app` (single doc)
```js
{ reregistrationOpen: bool, reregistrationYear: string, reregistrationDeadline: Timestamp|null, updatedAt }
```

### `teacherInvites/{inviteId}`
```js
{ code: string, used: bool, createdBy: string, createdAt }
```

## Security Rules Summary

```
users/           any authed reads; own doc writes; admin updates any
conversations/   teacher + parent in that convo only
  /messages/     same parties; creator writes; no editing
attendance/      teacher creates/updates/deletes; teacher or that studentId reads
homework/        same as attendance
books/           same as attendance
payments/        admin creates/updates; parent (own) or admin reads; no delete
assessments/     teacher creates/updates/deletes (own); teacher or studentId reads
registrations/   parent creates/updates own; teacher reads all
settings/        all authed read; admin writes
teacherInvites/  public read (needed pre-auth during register); admin creates/deletes
```

## Composite Indexes (`firestore.indexes.json`)

| Collection | Field 1 | Field 2 |
|---|---|---|
| conversations | parentId ASC | lastMessageAt DESC |
| conversations | teacherId ASC | lastMessageAt DESC |
| attendance | studentId ASC | date DESC |
| attendance | teacherId ASC | date DESC |
| homework | studentId ASC | sessionDate DESC |
| homework | teacherId ASC | sessionDate DESC |
| books | studentId ASC | givenAt DESC |
| books | teacherId ASC | givenAt DESC |
| payments | parentId ASC | dueDate DESC |
| payments | teacherId ASC | createdAt DESC |
| assessments | studentId ASC | date DESC |
| assessments | teacherId ASC | date DESC |
| registrations | academicYear ASC | decidedAt DESC |
| teacherInvites | code ASC | used ASC |

## Firebase Storage

Path: `/assessments/{studentId}/{assessmentId}/{filename}`
Used for PDF reports uploaded by teacher in `teacher-reports.html`.
**Requires Blaze (pay-as-you-go) plan** — free Spark plan blocks Storage writes.

## Related Notes

- [[SCG Tuitions - Overview]]
- [[SCG Tuitions - Caching & Deploy]]
- [[SCG Tuitions - Payments]]
- [[SCG Tuitions - Mobile & UI]]
