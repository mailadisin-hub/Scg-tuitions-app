---
title: SCG Tuitions App - Project Learnings
domain: projects
level: reference
status: active
tags: [scg-tuitions, learnings, patterns, firebase, mobile, css, gotchas]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions — Everything Learned Building This

## Firebase Hosting & CDN Caching

### The problem
Firebase Hosting uses Fastly CDN. Default TTL for CSS/JS is very long (days).
After deploying, users on mobile (especially Edge on Android) would still see the old version for hours.

### Layer 1 — firebase.json headers
```json
{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
```
This tells the BROWSER not to cache. But it doesn't help if the browser ALREADY cached the file before these headers were added.

### Layer 2 — query string versioning (the real fix)
```html
<link rel="stylesheet" href="css/style.css?v=7">
```
`style.css?v=3` and `style.css?v=7` are **different URLs** to the browser.
No cache entry for `?v=7` → forced fresh download regardless of any cached headers.

### Rule
Bump `?v=N` with every single push. Never reuse a version number.

### After deploy, propagation takes ~2–5 minutes
Firebase sends a CDN purge signal but edge nodes don't all clear instantly.
After the first propagation, subsequent loads are always instant (fresh due to no-cache headers).

---

## GitHub Actions — Firebase Deploy

### The token quoting bug
```yaml
# BAD — breaks if secret contains special chars, or if secret is empty
run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}

# GOOD — wrap in env + quote
env:
  FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
run: firebase deploy --token "$FIREBASE_TOKEN"
```

If the secret doesn't exist yet, `${{ secrets.FIREBASE_TOKEN }}` expands to empty string.
Firebase CLI then sees `--token` with no argument → error "argument missing".
Always add the GitHub secret BEFORE pushing the workflow file.

### Deploy scope
`--only hosting,firestore` — deploys both Hosting files AND Firestore security rules.
Skips Storage rules (separate flag: `--only storage`).
Skip Firestore indexes if unchanged (they take longer): `--only hosting`.

---

## Firebase Auth — Role-Based Access

### Pattern used
```js
async function requireAuth(expectedRole) {
  return new Promise((resolve, reject) => {
    const unsub = auth.onAuthStateChanged(async user => {
      unsub(); // unsubscribe immediately — one-shot check
      if (!user) { redirect('index.html'); return reject(); }
      const snap = await db.collection('users').doc(user.uid).get();
      const profile = { uid: user.uid, ...snap.data() };
      if (profile.role !== expectedRole) { redirect(roleHome(profile.role)); return reject(); }
      resolve(profile);
    });
  });
}
```

### Key insight
`onAuthStateChanged` fires once on page load (with current user or null).
Unsubscribing immediately (`unsub()`) is correct — you only want one check, not a persistent listener.

### Role routing
- `parent` → `parent-chat.html`
- `teacher` → `teacher-chat.html`
- `admin` → `admin.html`

### Teacher invite codes
Teachers must enter an invite code during registration.
Code validated against `teacherInvites` collection — **public read** rule needed because the user has no auth session yet at registration time.

---

## Firestore Real-Time Patterns

### Unsubscribe pattern
```js
let listener = null;

function subscribe() {
  if (listener) listener(); // unsubscribe previous
  listener = db.collection('x').onSnapshot(snap => { ... });
}

window.addEventListener('beforeunload', () => {
  if (listener) listener(); // clean up on page close
});
```
Always store the unsubscribe function. Always clean up on `beforeunload`.

### Sub-collections for chat
Conversations as parent docs, messages as sub-collection:
- Listing conversations is cheap (doesn't fetch message content)
- Real-time listener on sub-collection only when that conversation is open
- `FieldValue.increment(1)` for unread counts — atomic, no race conditions
- `FieldValue.serverTimestamp()` for all timestamps — consistent even if client clock is wrong

### Composite index requirement
Any Firestore query with `where(...).orderBy(...)` on DIFFERENT fields requires a composite index.
e.g. `.where('studentId', '==', uid).orderBy('date', 'desc')` → needs `(studentId ASC, date DESC)` index.
All indexes are in `firestore.indexes.json` and deployed with `firebase deploy --only firestore`.

### Security rule helpers
```js
function isTeacher() { return isAuthed() && userRole() == 'teacher'; }
function isAdmin()   { return isAuthed() && userRole() == 'admin'; }
function isStaff()   { return isTeacher() || isAdmin(); }
```
`userRole()` does a `get()` call — costs one Firestore read per rule evaluation.
Keep helper functions to avoid repeating this.

---

## Mobile CSS — Lessons

### `100dvh` vs `100vh`
`100vh` on iOS Safari includes the browser chrome (address bar) in the height calculation.
Results in content being cut off behind the address bar.
`100dvh` (dynamic viewport height) automatically adjusts as the chrome shows/hides.
```css
.chat-layout { height: calc(100dvh - 56px); } /* correct on mobile */
```

### Hamburger → ✕ animation in pure CSS
```css
.hamburger-btn.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger-btn.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger-btn.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
```
Three `<span>` elements, each `display: block; width: 18px; height: 2px`.
Class toggle drives the animation. No JS needed for the visual.

### Scroll lock behind drawer
```js
document.body.style.overflow = 'hidden'; // open
document.body.style.overflow = '';       // close
```
Without this, the page scrolls behind the open drawer on mobile.

### Slide-in drawer
```css
.drawer { transform: translateX(-100%); transition: transform 0.28s ease; }
.drawer.open { transform: translateX(0); }
```
Keep transition under 300ms — feels instant but still smooth.

### Media query breakpoint
`600px` — good breakpoint for "phone vs everything else".
At 600px: hide desktop nav, show hamburger.
Don't try to make the desktop nav work on mobile — just hide it.

---

## Page Boot Pattern (used on every page)

```js
(async () => {
  try {
    currentUser = await requireAuth('parent'); // or 'teacher' or 'admin'
    renderHeaderUser(currentUser);             // fills #user-badge
    renderPortalNav('messages', 'parent');     // injects nav + hamburger
    document.getElementById('main-content').style.display = 'block';
    // ... page-specific setup
  } catch {} // requireAuth rejects + redirects on failure
})();
```

Main content hidden (`display:none`) until auth confirmed — prevents flash of content.
IIFE (immediately invoked) wraps the async boot sequence.

---

## Payments — No-Backend Integration

### Pattern: Payment Links
Teacher creates a Stripe Payment Link from the Stripe dashboard.
Copies the URL. Pastes it into the app form.
Parent clicks a button that opens the URL in a new tab.
No API keys. No webhooks. No server.

Works identically for SumUp. Teacher has both — parent sees whichever buttons have URLs set.

### Manual reconciliation
Teacher sees payments list → clicks "Mark as paid" after Stripe notifies them.
Firestore update: `{ paid: true, paidAt: serverTimestamp(), paymentMethod: 'stripe' }`

### Invoice generation
`invoice.html?paymentId=xxx` — reads the Firestore doc, renders HTML, `window.print()` for PDF.
`@media print { .no-print { display: none; } }` hides buttons in print view.

---

## PWA (Progressive Web App) Notes

### manifest.json
```json
{
  "display": "standalone",    // hides browser chrome when added to home screen
  "start_url": "/index.html",
  "theme_color": "#141d57"    // status bar colour on Android
}
```

### When installed to home screen
Browser cache and PWA cache are separate.
User clearing browser cache does NOT clear PWA cache.
If user installs the PWA AND clears browser cache, they may still see old version from PWA cache.
Fix: update the service worker (increment cache version in `firebase-messaging-sw.js`).

### Icons currently missing
`manifest.json` only has the SVG favicon. App stores need:
- `192x192` PNG
- `512x512` PNG  
- `180x180` PNG (Apple Touch Icon)

---

## Notifications

### Browser notifications (implemented)
`Notification.requestPermission()` → fires hourly via `setInterval`.
Tracks state in `localStorage` (last shown time, count).
Stops when parent opens the conversation (calls `stopMessageNotifications(convoId)`).
`requireInteraction: true` — notification stays until user dismisses (important for hourly reminders).

### Background push (partial — needs Blaze plan)
`firebase-messaging-sw.js` service worker registered.
VAPID key configured.
BUT: Firebase Cloud Messaging background push requires Cloud Functions, which needs Blaze plan.

### In-app toast
Separate from browser notifications.
`showToast(title, body, icon)` → appends `.toast` div to `#toast-container`, auto-removes after 6s.
Fade-out CSS animation: `toast.classList.add('fade-out')` then `toast.remove()` after 320ms.

---

## HTML Page Structure (template)

Every page follows this exact pattern:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SCG Tuitions — [Page Name]</title>
  <link rel="stylesheet" href="css/style.css?v=7">  <!-- bump v= each deploy -->
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#141d57">
</head>
<body>
  <header class="app-header"> ... </header>
  <div id="main-content" style="display:none;"> ... </div>
  <div id="toast-container"></div>
  <!-- Firebase CDN scripts (always in this order) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"></script>
  <script src="js/firebase-config.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/nav.js"></script>
  <script> /* page logic */ </script>
</body>
</html>
```

Script load order matters: firebase-config.js must come before auth.js, nav.js must come after auth.js.

---

## Key Decisions Made

| Decision | Alternative considered | Why this way |
|---|---|---|
| Pure HTML/CSS/JS | React / Vue | No build step, simpler deploy, owner can edit files directly |
| Firebase compat SDK | Firebase modular (v9+) | Compat works as global `firebase.*` — no bundler needed |
| Stripe Payment Links | Stripe.js + backend | No server needed, teacher already has Stripe account |
| Manual "mark paid" | Stripe webhooks | No backend, simpler, teacher confirms payment themselves |
| Sub-collection for messages | Array field | Sub-collections are cheaper to query and scale properly |
| `onSnapshot` everywhere | `get()` + polling | Real-time updates without any polling or refresh |
| Hamburger drawer | Scrollable nav bar | Drawer is more native-feeling on mobile, no horizontal scroll |
| `100dvh` for chat height | `100vh` | Fixes iOS Safari address bar cutting off content |
| `?v=N` cache busting | Hashed filenames | No build step required, simple to bump manually |

---

## Related Notes

- [[SCG Tuitions - Overview]]
- [[SCG Tuitions - Complete Inventory]]
- [[SCG Tuitions - Firebase & Firestore]]
- [[SCG Tuitions - Mobile & UI]]
- [[SCG Tuitions - Caching & Deploy]]
- [[SCG Tuitions - Payments]]
- [[SCG Tuitions - Version History]]
