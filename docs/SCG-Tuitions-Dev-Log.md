# SCG Tuitions App — Brain Dump

> **How to use in future Claude sessions:**
> Say "read docs/SCG-Tuitions-Dev-Log.md" at the start and I'll have full context.
> Update this file after every push.

---

## Quick Facts

| | |
|---|---|
| **Live URL** | https://scg-tuitions.web.app |
| **Repo** | https://github.com/mailadisin-hub/scg-tuitions-app |
| **Branch** | `claude/scg-tuitions-parent-app-vq48e` |
| **Firebase project** | `scg-tuitions` |
| **Owner email** | mail.adisin@gmail.com |
| **Stack** | Pure HTML / CSS / JS — no framework, no build step |
| **Deploy** | GitHub Actions auto-deploys on every push to branch |
| **Current version** | `v1.2.7-beta` |

---

## Beta Version History

| Version | What changed |
|---|---|
| `v1.2.0-beta` | Initial beta — full portal built: login, register, WhatsApp-style chat, attendance, homework, books, payments, assessments, re-registration, invoice |
| `v1.2.1-beta` | Fixed GitHub Actions deploy — `FIREBASE_TOKEN` secret + token quoting fix |
| `v1.2.2-beta` | Version badge made visible (was `rgba(0,0,0,0.18)` — invisible on dark background) |
| `v1.2.3-beta` | Version badge: solid black `#000` text on white `#fff` pill |
| `v1.2.4-beta` | Mobile responsive layout fixes + CSS cache bust `?v=3` |
| `v1.2.5-beta` | `Cache-Control: no-cache` headers added to `firebase.json` for HTML/CSS/JS |
| `v1.2.6-beta` | Hamburger menu with slide-in drawer for mobile navigation |
| `v1.2.7-beta` | CSS cache bust bumped `?v=3` → `?v=7` to force browsers to drop stale CSS |

**Rule for every future push:**
1. Bump `content: 'vX.X.X-beta'` in `css/style.css` (line ~704)
2. Bump `?v=N` on the CSS `<link>` in ALL 21 HTML files (`sed -i 's/style.css?v=7/style.css?v=8/g' *.html`)
3. Update this file's "Current version" and version history table

---

## File Map

```
/
├── index.html                    ← Login / register page (role selector)
├── admin.html                    ← Admin dashboard
├── admin-payments.html           ← Admin: view/manage all payments
├── admin-registration.html       ← Admin: re-registration overview
│
├── parent-chat.html              ← Parent: WhatsApp-style chat with teacher
├── parent-attendance.html        ← Parent: attendance % + session history
├── parent-homework.html          ← Parent: homework brought/marked log
├── parent-books.html             ← Parent: books received grouped by half-term
├── parent-payments.html          ← Parent: pay via Stripe/SumUp, view history
├── parent-reports.html           ← Parent: assessment scores + PDF download
├── parent-registration.html      ← Parent: re-register for next academic year
├── parent-dashboard.html         ← (legacy page, kept for safety)
│
├── teacher-chat.html             ← Teacher: chat with all parents (split pane)
├── teacher-attendance.html       ← Teacher: mark attendance per session
├── teacher-homework.html         ← Teacher: log homework in/marked
├── teacher-books.html            ← Teacher: record books given per half-term
├── teacher-payments.html         ← Teacher: create payment records, mark paid
├── teacher-reports.html          ← Teacher: upload PDF assessments + scores
├── teacher-registration.html     ← Teacher: open/close re-reg window, view responses
├── teacher-dashboard.html        ← (legacy page, kept for safety)
│
├── invoice.html                  ← Printable invoice (opened via ?paymentId=xxx)
│
├── css/
│   └── style.css                 ← ALL styles. Brand colours in :root at top.
│
├── js/
│   ├── firebase-config.js        ← Firebase app init (Auth, Firestore, Storage, Messaging)
│   ├── auth.js                   ← requireAuth(), renderHeaderUser(), signOut(), helpers
│   ├── nav.js                    ← renderPortalNav() — desktop nav + mobile drawer
│   └── notifications.js          ← Hourly push notification logic
│
├── firebase-messaging-sw.js      ← Service worker for background push notifications
├── manifest.json                 ← PWA manifest
├── favicon.svg                   ← SVG favicon
├── firebase.json                 ← Hosting config: no-cache headers, rewrites, storage
├── firestore.rules               ← Security rules (all collections)
├── firestore.indexes.json        ← All composite indexes
├── storage.rules                 ← Firebase Storage rules
├── SETUP.md                      ← Firebase setup guide for fresh environments
├── docs/
│   └── SCG-Tuitions-Dev-Log.md  ← THIS FILE
└── .github/
    └── workflows/
        └── deploy.yml            ← CI/CD auto-deploy
```

---

## Firebase Config (js/firebase-config.js)

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

Firebase SDK loaded via CDN — compat v9.23.0:
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js"></script>
```

---

## Brand Colours (css/style.css :root)

```css
:root {
  --primary:       #1e2d7d;   /* SCG navy — matches "11+" and "SCG" in logo */
  --primary-light: #2840a8;   /* lighter navy — hover/active states */
  --primary-dark:  #141d57;   /* deep navy — header background */
  --accent:        #39b54a;   /* SCG green — matches "Tuitions" in logo */
  --accent-light:  #4dc85f;   /* lighter green — hover states */
  --orange:        #f7941d;   /* SCG orange — pencil in logo */
  --bg:            #f4f7ff;   /* near-white with blue tint */
  --card:          #ffffff;
  --border:        #e2e8f8;
  --text:          #1a1f3c;
  --text-muted:    #6b7280;
  --text-light:    #9ca3af;
  --shadow:        0 2px 12px rgba(30,45,125,0.08);
  --shadow-lg:     0 8px 32px rgba(30,45,125,0.14);
  --radius:        12px;
  --radius-sm:     8px;
}
```

Login page gradient: `linear-gradient(135deg, #0d2137, #1a3a5c, #1e4d7b)`

---

## Firestore Data Model

### `users/{uid}`
```js
{
  displayName: "Jane Smith",
  email: "jane@example.com",
  role: "parent",           // "parent" | "teacher" | "admin"
  childName: "Oliver",      // parents only
  childYear: "Year 6",      // parents only
  teacherId: "uid-abc123",  // parents only — links parent to their teacher
  createdAt: Timestamp
}
```

### `conversations/{convId}`
```js
{
  teacherId: string,
  teacherName: string,
  parentId: string,
  parentName: string,
  lastMessage: string,        // preview text for sidebar
  lastMessageAt: Timestamp,
  lastSenderId: string,
  parentUnread: number,       // unread count for parent
  teacherUnread: number,      // unread count for teacher
  createdAt: Timestamp
}
```

### `conversations/{convId}/messages/{msgId}`
```js
{
  senderId: string,
  senderName: string,
  senderRole: "teacher" | "parent",
  content: string,
  sentAt: Timestamp,
  readAt: Timestamp | null    // null until recipient opens conversation
}
```

### `attendance/{docId}`
```js
{
  studentId: string,      // parent's UID
  studentName: string,    // child's name
  teacherId: string,
  date: Timestamp,
  sessionLabel: string,   // e.g. "Week 12 – 18 May 2026"
  status: "present" | "absent" | "late",
  createdAt: Timestamp
}
```

### `homework/{docId}`
```js
{
  studentId: string,
  studentName: string,
  teacherId: string,
  sessionDate: Timestamp,
  sessionLabel: string,
  brought: boolean,       // did student bring homework in
  marked: boolean,        // has teacher marked it
  notes: string,
  createdAt: Timestamp
}
```

### `books/{docId}`
```js
{
  studentId: string,
  studentName: string,
  teacherId: string,
  halfTerm: string,       // e.g. "Autumn 1 2025-26"
  titles: string[],       // array of book/resource names
  givenAt: Timestamp,
  notes: string
}
```

### `payments/{docId}`
```js
{
  parentId: string,
  studentName: string,
  parentName: string,
  teacherId: string,
  termName: string,               // e.g. "Autumn Term 2025"
  amountDue: number,              // in pence (25000 = £250)
  dueDate: Timestamp,
  paid: boolean,
  paidAt: Timestamp | null,
  paymentMethod: "stripe" | "sumup" | "bank" | "cash",
  stripePaymentLink: string,      // URL pasted from Stripe dashboard
  sumupPaymentLink: string | null,
  invoiceNumber: string,          // e.g. "SCG-2025-001"
  notes: string,
  createdAt: Timestamp
}
```

### `assessments/{docId}`
```js
{
  studentId: string,
  studentName: string,
  teacherId: string,
  name: string,           // e.g. "Mock Exam 1 – Nov 2025"
  date: Timestamp,
  score: string,          // e.g. "87/100" or "B+"
  notes: string,
  fileUrl: string | null, // Firebase Storage download URL
  fileName: string | null,
  createdAt: Timestamp
}
```

### `registrations/{docId}`
```js
{
  parentId: string,
  parentName: string,
  studentName: string,
  academicYear: string,                      // e.g. "2026-2027"
  decision: "continue" | "not_continue" | null,
  decidedAt: Timestamp | null,
  createdAt: Timestamp
}
```

### `settings/app` (single document)
```js
{
  reregistrationOpen: boolean,
  reregistrationYear: string,         // e.g. "2026-2027"
  reregistrationDeadline: Timestamp | null,
  updatedAt: Timestamp
}
```

### `teacherInvites/{inviteId}`
```js
{
  code: string,       // e.g. "SCG-TEACH-2025"
  used: boolean,
  createdBy: string,  // admin UID
  createdAt: Timestamp
}
```

---

## Firestore Indexes (firestore.indexes.json)

| Collection | Field 1 | Field 2 |
|---|---|---|
| `messages` | `toUserId` ASC | `createdAt` DESC |
| `messages` | `fromUserId` ASC | `createdAt` DESC |
| `conversations` | `parentId` ASC | `lastMessageAt` DESC |
| `conversations` | `teacherId` ASC | `lastMessageAt` DESC |
| `attendance` | `studentId` ASC | `date` DESC |
| `attendance` | `teacherId` ASC | `date` DESC |
| `homework` | `studentId` ASC | `sessionDate` DESC |
| `homework` | `teacherId` ASC | `sessionDate` DESC |
| `books` | `studentId` ASC | `givenAt` DESC |
| `books` | `teacherId` ASC | `givenAt` DESC |
| `payments` | `parentId` ASC | `dueDate` DESC |
| `payments` | `teacherId` ASC | `createdAt` DESC |
| `assessments` | `studentId` ASC | `date` DESC |
| `assessments` | `teacherId` ASC | `date` DESC |
| `registrations` | `academicYear` ASC | `decidedAt` DESC |
| `teacherInvites` | `createdBy` ASC | `createdAt` DESC |
| `teacherInvites` | `code` ASC | `used` ASC |
| `users` | `role` ASC | `teacherId` ASC | `displayName` ASC |

---

## Firestore Security Rules Summary

```
users/         → any authed user reads; each user writes own doc; admin updates any
conversations/ → only the teacher + parent in that convo can read/update; teacher creates
  /messages/   → same parties read; creator writes; no editing (update: false)
attendance/    → teacher creates/updates/deletes; teacher or that studentId reads
homework/      → same as attendance
books/         → same as attendance
payments/      → admin creates/updates; parent (own) or admin reads; no delete
assessments/   → teacher creates/updates/deletes (own); teacher or studentId reads
registrations/ → parent creates/updates own; teacher reads all
settings/      → all authed read; admin writes
teacherInvites/→ public read (needed before auth exists during register); admin creates/deletes
```

---

## Auth Flow

1. `index.html` — user registers or logs in
2. On register:
   - Role selected: `parent` or `teacher`
   - If teacher: must enter invite code (checked against `teacherInvites` collection)
   - Creates Firebase Auth user
   - Creates `users/{uid}` document in Firestore
   - Redirects to correct portal home
3. On login:
   - `requireAuth(expectedRole)` in `js/auth.js` checks role
   - Wrong role → redirected to correct home page
   - No profile → signed out, back to `index.html`
4. Role routing:
   - `parent` → `parent-chat.html`
   - `teacher` → `teacher-chat.html`
   - `admin` → `admin.html`

---

## Navigation (js/nav.js)

`renderPortalNav(activeKey, portalType)` — called on every page after `requireAuth`.

### Desktop
Renders `<nav class="portal-nav">` inserted after `.app-header`.
Links are emoji + label. Active link has green left border.

### Mobile (≤600px)
- Desktop nav hidden via CSS
- Hamburger button (`<button class="hamburger-btn">`) injected into `.header-right`
- Slide-in drawer from left with: brand header (SCG logo), nav links, Sign Out button
- Overlay (`<div class="drawer-overlay">`) closes drawer on click
- `openDrawer()` / `closeDrawer()` global functions
- `document.body.style.overflow = 'hidden'` locks scroll when drawer open

### Nav link sets
```js
PARENT_NAV  = [Messages, Attendance, Homework, Books, Payments, Reports, Re-register]
TEACHER_NAV = [Messages, Attendance, Homework, Books, Assessments]
ADMIN_NAV   = [Dashboard, Payments, Re-registration]
```

---

## Header HTML Structure (every page)

```html
<header class="app-header">
  <div class="header-left">
    <div class="logo-icon">SCG</div>
    <div class="logo-text">
      <div class="logo-name">SCG Tuitions</div>
      <div class="logo-tagline">Parent Portal</div>  <!-- hidden on mobile -->
    </div>
  </div>
  <div class="header-right">
    <div class="user-badge" id="user-badge"></div>  <!-- filled by renderHeaderUser() -->
    <button class="btn-logout" onclick="signOut()">Sign Out</button>
    <!-- hamburger injected here by nav.js on mobile -->
  </div>
</header>
```

`renderHeaderUser(profile)` in `js/auth.js` fills `#user-badge` with:
- Avatar circle with initials
- `<span class="user-name">` (hidden on mobile via CSS)
- Role pill (`.teacher` / `.parent` / `.admin`)

---

## Mobile CSS Rules (≤600px)

```css
@media (max-width: 600px) {
  .app-header    { height: 56px; padding: 0 16px; }
  .logo-tagline  { display: none; }
  .user-name     { display: none; }
  .btn-logout    { display: none; }
  .hamburger-btn { display: flex; }
  .portal-nav    { display: none; }
  .chat-layout   { height: calc(100dvh - 56px); }
}
```

`100dvh` = dynamic viewport height — accounts for mobile browser chrome (address bar shrinking).

---

## Caching Strategy

### Problem
Firebase CDN caches CSS/JS for days by default. Users see stale app after deploy.

### Solution (layered)
1. `firebase.json` — `Cache-Control: no-cache, no-store, must-revalidate` on HTML/CSS/JS
2. CSS link uses `?v=N` query param — browser treats each `?v=N` as a new URL
3. Every push bumps both the badge content AND `?v=N`

### Why `?v=N` is the real fix
`Cache-Control: no-cache` tells the browser "check server before using cache." But if the browser cached the file BEFORE those headers were added (with the old Firebase default long TTL), it still serves from cache. A new `?v=N` is a URL the browser has never seen → forced fresh download.

### Current state
- HTML: `no-cache, no-store, must-revalidate` + `Pragma: no-cache`
- CSS: `no-cache, no-store, must-revalidate` + `?v=7` in all HTML links
- JS: `no-cache, no-store, must-revalidate`
- Service worker: `no-cache`

After a successful deploy: updates appear in ~2–5 min (CDN propagation). Every subsequent load is instant.

---

## Payments Flow

**No backend. No API keys in app code.**

1. Teacher opens `teacher-payments.html`
2. Fills form: student, term name, amount (£), due date, Stripe Payment Link URL (pasted from Stripe dashboard), optional SumUp URL, invoice number (e.g. `SCG-2026-001`)
3. Saves → `payments` doc created in Firestore
4. Parent opens `parent-payments.html`
5. Sees current term card with **"Pay with Stripe"** button (opens Stripe link in new tab)
6. Parent pays via Stripe
7. Teacher sees payment pending → clicks **"Mark as paid"** → sets `paid: true`, `paidAt: now()`
8. Parent can click **"View Invoice"** → opens `invoice.html?paymentId=xxx`

`invoice.html` fetches the payment doc, renders a printable invoice, `window.print()` for PDF.

---

## GitHub Actions Deploy (.github/workflows/deploy.yml)

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches:
      - claude/scg-tuitions-parent-app-vq48e
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Firebase CLI
        run: npm install -g firebase-tools
      - name: Deploy to Firebase
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: firebase deploy --project scg-tuitions --only hosting,firestore --token "$FIREBASE_TOKEN"
```

**Secret:** `FIREBASE_TOKEN` must exist in: GitHub Repo → Settings → Secrets and variables → Actions.

**Fix if it breaks:** The token arg must be quoted (`"$FIREBASE_TOKEN"`) — unquoted fails if token contains special chars.

---

## Known Bugs / Quirks

| Issue | Cause | Fix applied |
|---|---|---|
| Version badge invisible | `color: rgba(0,0,0,0.18)` — too transparent | Changed to `color: #000; background: #fff` |
| App not updating on mobile after deploy | Browser cached old CSS before no-cache headers existed | Bumped `?v=N` — forces new URL |
| Mobile layout broken on Edge Android | Header overcrowded on small screens | Media query hides nav/logout/name, shows hamburger |
| GitHub Actions `--token argument missing` | `${{ secrets.* }}` was empty (secret not yet set) | User added secret; token wrapped in `env:` block |
| Drawer didn't scroll on Android | `body overflow: hidden` blocked all scroll | Only applied when drawer is open |

---

## Pending Tasks

- [ ] **Set admin role** — Firestore Console → `users` collection → find `mail.adisin@gmail.com` doc → change `role` field to `"admin"`
- [ ] **Firebase Storage Blaze plan** — needed for PDF assessment uploads in `teacher-reports.html`. Free Spark plan blocks Storage writes.
- [ ] **App Store / Play Store prep** — PNG icons needed: 192×192, 512×512, 180×180 (Apple Touch). Add iOS meta tags. Write privacy policy page. Consider Capacitor or PWABuilder wrapper.
- [ ] **Offline fallback page** — service worker catches failed fetches → shows branded offline page

---

## Version Badge Location

`css/style.css` around line 702:
```css
body::after {
  content: 'v1.2.7-beta';   /* ← UPDATE THIS */
  position: fixed;
  bottom: 10px; right: 14px;
  font-size: 12px; font-family: monospace; font-weight: 600;
  color: #000; background: #fff;
  padding: 3px 8px; border-radius: 20px;
  pointer-events: none; z-index: 9999;
}
```

---

## How to Import into Obsidian

Since Claude Code runs in a remote container it can't write directly to your local Obsidian vault.

**Option A (recommended):** Point Obsidian at the repo folder.
1. `git pull` the repo to your PC
2. Open Obsidian → Open folder as vault → select the `Scg-tuitions-app/docs/` folder
3. Obsidian will pick up this file and any future notes

**Option B:** Manual drag.
1. `git pull` the repo
2. Drag `docs/SCG-Tuitions-Dev-Log.md` into your existing Obsidian vault

**To update:** After every Claude session that makes changes, `git pull` → Obsidian auto-refreshes.

---

*Last updated: v1.2.7-beta — June 2026*
