---
title: SCG Tuitions App - Complete Inventory
domain: projects
level: reference
status: active
tags: [scg-tuitions, inventory, files, functions, css-classes, firestore-queries]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions — Complete Inventory

Everything that exists in the codebase, page by page, function by function.

---

## HTML Pages

### `index.html` — Login / Register
- Login form: email + password → `auth.signInWithEmailAndPassword()`
- Register form: name, email, password, role picker, child name/year (parents), invite code (teachers)
- Role picker: parent or teacher (admin assigned manually in Firestore)
- Teacher invite code validated against `teacherInvites` collection before account creation
- On login: `requireAuth()` → redirected to role home
- CSS: login gradient background, two-tab form (login/register)

### `admin.html` — Admin Dashboard
- Stats: total parents, total teachers, total conversations
- User list: all users with role pills
- Teacher invite code generator: creates `teacherInvites` docs
- Assign parents to teachers (sets `teacherId` on parent's user doc)
- Protected by `requireAuth('admin')`

### `admin-payments.html` — Admin Payments
- View all payment records across all parents
- Filter by status (paid / unpaid) and by student
- Create new payment records
- Mark payments as paid
- Protected by `requireAuth('admin')`

### `admin-registration.html` — Admin Re-registration Overview
- View all registration responses for current year
- Counts: continuing, not continuing, pending
- Protected by `requireAuth('admin')`

---

### `parent-chat.html` — Parent Messages (WhatsApp-style)
**Variables:** `currentUser`, `activeConvoId`, `msgsListener`, `convosListener`, `allConvos`

**Boot sequence:**
```js
requireAuth('parent') → renderHeaderUser() → renderPortalNav('messages','parent')
→ subscribeToConversations() → registerServiceWorker()
```

**Functions:**
| Function | What it does |
|---|---|
| `subscribeToConversations()` | `onSnapshot` on `conversations` where `parentId == uid`, ordered by `lastMessageAt DESC` |
| `renderConvoList(convos)` | Builds sidebar HTML — avatar, name, preview, unread badge |
| `openConvo(convoId)` | Shows chat pane, loads messages, marks `parentUnread: 0`, stops notifications |
| `closeChat()` | Hides chat pane (mobile back button), clears `activeConvoId` |
| `renderMessages(msgs)` | Builds bubble HTML — date dividers, mine/theirs alignment, timestamps |
| `sendReply()` | Adds message to sub-collection, updates conversation preview + `teacherUnread: increment(1)` |
| `handleInputKey(e)` | Enter sends, Shift+Enter newline, auto-resizes textarea |
| `handleUnreadNotifications(convos)` | Starts/stops hourly notification per conversation based on `parentUnread` |
| `registerServiceWorker()` | Registers `firebase-messaging-sw.js` |

**Firestore queries:**
- `conversations.where('parentId','==',uid).orderBy('lastMessageAt','desc').onSnapshot()`
- `conversations/{id}/messages.orderBy('sentAt','asc').onSnapshot()`
- `conversations/{id}.update({ parentUnread: 0 })`

---

### `parent-attendance.html` — Parent Attendance
- Stats cards: Total sessions, Present, Absent, Late counts
- Colour-coded progress bar: green ≥85%, amber 70–84%, red <70%
- List of all attendance records for this student
- Protected by `requireAuth('parent')`

**Firestore:** `attendance.where('studentId','==',uid).orderBy('date','desc').onSnapshot()`

### `parent-homework.html` — Parent Homework
- Stats: brought % and marked %
- List: each session with date, ✅/❌ brought, ✅/❌ marked, notes
- Protected by `requireAuth('parent')`

**Firestore:** `homework.where('studentId','==',uid).orderBy('sessionDate','desc').onSnapshot()`

### `parent-books.html` — Parent Books
- Cards grouped by half-term (e.g. "Autumn 1 2025-26")
- Each card: bullet list of book titles + notes
- Protected by `requireAuth('parent')`

**Firestore:** `books.where('studentId','==',uid).orderBy('givenAt','desc').get()`

### `parent-payments.html` — Parent Payments
- Current term card (prominent): amount, due date, status badge
- "Pay with Stripe" button → opens `stripePaymentLink` in new tab
- "Pay with SumUp" button → opens `sumupPaymentLink` in new tab (if set)
- "View Invoice" → opens `invoice.html?paymentId=xxx`
- Payment history: past terms, paid dates
- Protected by `requireAuth('parent')`

**Firestore:** `payments.where('parentId','==',uid).orderBy('dueDate','desc').onSnapshot()`

### `parent-reports.html` — Parent Assessment Reports
- List of assessments: name, date, score badge, teacher notes
- "Download PDF" button → opens `fileUrl` in new tab (Firebase Storage URL)
- Protected by `requireAuth('parent')`

**Firestore:** `assessments.where('studentId','==',uid).orderBy('date','desc').onSnapshot()`

### `parent-registration.html` — Parent Re-registration
- Reads `settings/app` to check if window is open
- If closed: "Re-registration is not yet open" message
- If open: two large buttons — "Continue" / "Not continuing"
- If already decided: shows their decision + date
- Protected by `requireAuth('parent')`

**Firestore:**
- `settings/app.get()`
- `registrations.where('parentId','==',uid).where('academicYear','==',year).get()`
- `registrations.add({...})` on decision

---

### `teacher-chat.html` — Teacher Messages
Same split-pane layout as parent chat but:
- Left sidebar shows ALL parents (teacher's assigned students)
- "New conversation" button: select parent → creates conversation doc if none exists
- Teacher messages on the RIGHT (mine), parent on the LEFT (theirs)
- Unread = `teacherUnread` field

**Firestore:**
- `conversations.where('teacherId','==',uid).orderBy('lastMessageAt','desc').onSnapshot()`
- `conversations.add({teacherId, parentId, ...})` for new conversation

---

### `teacher-attendance.html` — Teacher Attendance
**Left panel — Mark Attendance form:**
- Student select (all assigned parents)
- Date picker (defaults to today)
- Session label text input
- Status select: Present / Absent / Late
- Notes textarea (optional)

**Right panel — Records list:**
- Real-time list filtered by selected student
- Each record: student name, status badge, session label, date, delete button

**Functions:** `markAttendance(e)`, `subscribeAttendance()`, `filterAttendance()`, `renderAttendanceRecords(records)`, `deleteRecord(id)`, `todayISO()`

**Firestore:**
- `attendance.add({...})`
- `attendance.where('teacherId','==',uid).orderBy('date','desc').onSnapshot()`
- `attendance.doc(id).delete()`

---

### `teacher-homework.html` — Teacher Homework
**Form:** student, session date, session label, "Brought in?" toggle, "Marked?" toggle, notes

**Records list:** student, date, brought ✅/❌, marked ✅/❌, notes, delete

**Firestore:**
- `homework.add({...})`
- `homework.where('teacherId','==',uid).orderBy('sessionDate','desc').onSnapshot()`
- `homework.doc(id).delete()`

---

### `teacher-books.html` — Teacher Books
**Form:** student, half-term selector (Autumn 1/2, Spring 1/2, Summer 1/2 + year), dynamic book title inputs (add/remove), notes

**Records:** grouped by half-term; each entry shows student + bullet list of titles

**Firestore:**
- `books.add({ studentId, studentName, teacherId, halfTerm, titles: string[], givenAt, notes })`
- `books.where('teacherId','==',uid).orderBy('givenAt','desc').onSnapshot()`

---

### `teacher-payments.html` — Teacher Payments
**Form:**
- Student select
- Term name (e.g. "Autumn Term 2025-26")
- Amount (£ — stored in pence in Firestore)
- Due date
- Stripe Payment Link URL (paste from Stripe dashboard)
- SumUp Payment Link URL (optional)
- Invoice number (suggested: SCG-YYYY-NNN)
- Notes

**Records list:** student, term, amount, due date, Paid/Unpaid badge, "Mark as paid" button, "View invoice" link

**Firestore:**
- `payments.add({...})`
- `payments.where('teacherId','==',uid).orderBy('createdAt','desc').onSnapshot()` (admin creates, but teacher views)

Note: security rules say only admin can write payments. If teacher needs to create: either grant admin role to teacher or update rules to `isStaff()`.

---

### `teacher-reports.html` — Teacher Assessments
**Form:**
- Student select
- Assessment name (e.g. "Mock Exam 1 – Nov 2025")
- Date
- Score (text — "87/100" or "B+")
- Notes
- PDF file input (optional)

**Upload flow:**
1. If file selected: `uploadBytesResumable()` to Firebase Storage → shows progress bar
2. After upload: `getDownloadURL()` → save URL in Firestore doc
3. If no file: save doc without `fileUrl`

**Records list:** assessment name, date, score badge, "View PDF" button (if fileUrl set), delete

**Firestore:**
- `assessments.add({studentId, studentName, teacherId, name, date, score, notes, fileUrl, fileName, createdAt})`
- `assessments.where('teacherId','==',uid).orderBy('date','desc').onSnapshot()`

**Firebase Storage:** `/assessments/{studentId}/{assessmentId}/{filename}`
Requires Blaze plan.

---

### `teacher-registration.html` — Teacher Re-registration Management
**Settings card:**
- Toggle: Re-registration window open/closed
- Target academic year (e.g. "2026-2027")
- Optional deadline date
- Save → writes `settings/app` doc

**Responses table:**
- All registrations for the current year
- Columns: student name, parent name, decision (✅/❌/⏳ Pending), decided at

**Firestore:**
- `settings/app.set({...})`
- `registrations.where('academicYear','==',year).orderBy('decidedAt','desc').onSnapshot()`

---

### `invoice.html` — Printable Invoice
- No nav bar, no header
- Reads `?paymentId=xxx` from URL: `new URLSearchParams(location.search).get('paymentId')`
- Fetches payment doc from Firestore
- Renders: SCG logo, Swindon address, invoice number, date, student name, term, amount, VAT (0%), total, payment status
- "Print / Save as PDF" → `window.print()`
- `@media print` hides button and cleans layout

---

## JavaScript Files

### `js/firebase-config.js`
Initialises Firebase app. Exports globals: `auth`, `db`, `storage`, `messaging`, `VAPID_KEY`.
Messaging wrapped in try/catch (not supported in all browsers/contexts).

### `js/auth.js`
| Function | Signature | What it does |
|---|---|---|
| `requireAuth` | `(expectedRole?) → Promise<profile>` | Guards pages; redirects if not authed or wrong role |
| `renderHeaderUser` | `(profile) → void` | Fills `#user-badge` with avatar + name + role pill |
| `signOut` | `() → void` | Stops notifications, signs out, redirects to `index.html` |
| `formatTime` | `(timestamp) → string` | "Just now" / "5m ago" / "2h ago" / "Yesterday" / date |
| `formatDate` | `(timestamp) → string` | "18 Jun 2026" |
| `setAlert` | `(elId, type, msg) → void` | Shows styled alert (error/success/info) |
| `clearAlert` | `(elId) → void` | Hides alert element |
| `loadParentsList` | `(teacherId?) → Promise<parent[]>` | Fetches parents assigned to teacher (or all if null) |
| `populateParentSelect` | `(selectId, parents) → void` | Fills `<select>` with parent options |
| `getInitials` | `(name) → string` | "Jane Smith" → "JS" |
| `escHtml` | `(str) → string` | Escapes HTML special chars (XSS prevention) |

### `js/nav.js`
| Function | What it does |
|---|---|
| `renderPortalNav(activeKey, portalType)` | Injects desktop nav bar + hamburger button + overlay + drawer |
| `openDrawer()` | Adds `.open` classes to drawer/overlay/hamburger, locks scroll |
| `closeDrawer()` | Removes `.open` classes, unlocks scroll |

Nav link sets: `PARENT_NAV`, `TEACHER_NAV`, `ADMIN_NAV` (arrays of `{key, href, icon, label}`).

### `js/notifications.js`
| Function | What it does |
|---|---|
| `requestNotificationPermission()` | Requests browser permission |
| `showBrowserNotification(title, body, tag)` | Fires a `Notification` |
| `showToast(title, body, icon)` | Appends `.toast` div to `#toast-container`, auto-removes after 6s |
| `startMessageNotifications(msgId, fromName, subject)` | Starts hourly interval for one conversation |
| `stopMessageNotifications(msgId)` | Clears interval, removes from localStorage |
| `stopAllNotifications()` | Stops all active intervals |
| `resumeNotificationsForUnread(messages)` | Re-starts intervals on page reload |

State stored in `localStorage` key `scg_notif_state`:
```js
{ [msgId]: { lastShownAt: timestamp, count: number } }
```

---

## CSS Classes (css/style.css)

### Layout
| Class | Purpose |
|---|---|
| `.app-header` | Fixed top header bar (navy gradient, 64px desktop / 56px mobile) |
| `.header-left` / `.header-right` | Header flex children |
| `.logo-icon` | Green circle with "SCG" text |
| `.logo-name` / `.logo-tagline` | Header text (tagline hidden on mobile) |
| `.page-wrapper` | Max-width 480px centered (narrow pages) |
| `.page-wrapper-wide` | Max-width 960px centered (two-column pages) |
| `.dashboard-grid` | Two-column grid on desktop, single column on mobile |

### Cards
| Class | Purpose |
|---|---|
| `.card` | White rounded card with shadow |
| `.card-header` | Card top bar with title |
| `.card-body` | Card content area with padding |
| `.card-title` | Card heading text |

### Navigation
| Class | Purpose |
|---|---|
| `.portal-nav` | Desktop sticky nav bar (navy, scrollable) |
| `.portal-nav-link` | Nav link (grey text → white on hover/active) |
| `.portal-nav-link.active` | Active link (white text, green underline border) |
| `.hamburger-btn` | Mobile only hamburger (hidden on desktop) |
| `.drawer` | Slide-in nav drawer |
| `.drawer.open` | Drawer visible (transform: translateX(0)) |
| `.drawer-overlay` | Dark overlay behind drawer |
| `.drawer-header` | Drawer brand area |
| `.drawer-nav` | Drawer link list |
| `.drawer-link` | Individual drawer link |
| `.drawer-link.active` | Active drawer link (green left border, green icon) |
| `.drawer-footer` | Drawer bottom (sign out button) |

### Chat
| Class | Purpose |
|---|---|
| `.chat-layout` | CSS grid: sidebar + chat window |
| `.chat-layout.chat-open` | Mobile: hides sidebar, shows chat window |
| `.chat-sidebar` | Left conversation list panel |
| `.chat-sidebar-header` | Sidebar title bar |
| `.chat-window` | Right chat area |
| `.convo-item` | Conversation list row |
| `.convo-item.has-unread` | Unread conversation (blue tint background) |
| `.convo-item.active` | Currently selected conversation |
| `.convo-avatar` | Circular initials avatar in sidebar |
| `.convo-name` / `.convo-preview` / `.convo-time` | Conversation list text |
| `.chat-messages` | Scrollable messages container |
| `.msg-bubble-wrap` | Message + avatar wrapper |
| `.msg-bubble-wrap.mine` | Aligns to right (flex-direction: row-reverse) |
| `.msg-bubble` | Message text bubble |
| `.msg-bubble.mine` | Right bubble (navy background, white text) |
| `.msg-bubble.theirs` | Left bubble (white background, dark text) |
| `.msg-avatar-sm` | Small circular avatar next to bubble |
| `.msg-time` | Timestamp below bubble |
| `.msg-day-divider` | Date separator between message groups |
| `.chat-window-header` | Active chat top bar (partner name + back button) |
| `.chat-input-bar` | Textarea + send button area at bottom |
| `.chat-input` | Auto-resizing textarea |
| `.chat-send-btn` | Circular green send button |
| `.chat-empty` | Placeholder when no conversation selected |
| `.chat-back-btn` | Mobile back button (visible on mobile, hidden desktop) |

### Forms
| Class | Purpose |
|---|---|
| `.form-group` | Label + input wrapper |
| `.btn` | Base button style |
| `.btn-primary` | Navy filled button |
| `.btn-danger` | Red button (delete) |
| `.btn-sm` | Small button size |
| `.btn-full` | Full width button |
| `.btn-logout` | Header logout button |
| `.alert` | Alert/error message box |
| `.alert-error` / `.alert-success` / `.alert-info` | Alert variants |

### User Badge
| Class | Purpose |
|---|---|
| `.user-badge` | Header user info container |
| `.user-avatar` | Circular initials avatar in header |
| `.user-name` | Display name text (hidden on mobile) |
| `.role-pill` | Coloured role label |
| `.role-pill.teacher` | Blue pill |
| `.role-pill.parent` | Green pill |
| `.role-pill.admin` | Orange pill |

### Status & Data
| Class | Purpose |
|---|---|
| `.badge` | Small pill label |
| `.badge-success` | Green badge (present, paid) |
| `.badge-danger` | Red badge (absent, unpaid, unread count) |
| `.badge-warning` | Amber badge (late) |
| `.badge-info` | Blue badge |
| `.progress-bar-wrap` | Progress bar container |
| `.progress-bar` | Coloured fill bar (attendance %) |
| `.sent-message-item` | Record list row (attendance, homework, etc.) |
| `.sent-msg-header` / `.sent-msg-subject` / `.sent-msg-preview` / `.sent-msg-time` | Record row sections |

### Misc
| Class | Purpose |
|---|---|
| `.loader` | Centered spinner container |
| `.spinner` | Rotating circle animation |
| `.empty-state` | Centered empty state with icon |
| `.empty-icon` | Large emoji in empty state |
| `.toast` | Slide-in notification toast |
| `.toast-icon` / `.toast-body` | Toast content |
| `.toast.fade-out` | Fade animation before removal |

### Version badge
```css
body::after { content: 'v1.2.7-beta'; position: fixed; bottom: 10px; right: 14px; ... }
```

---

## Config Files

### `firebase.json`
- `public: "."` — serves from repo root
- Rewrites: `/` → `/index.html`
- Headers: no-cache for HTML/CSS/JS; Service-Worker-Allowed for SW
- Firestore rules + indexes referenced
- Storage rules referenced

### `firestore.rules`
Security rules. Key helper functions: `isAuthed()`, `uid()`, `userRole()`, `isTeacher()`, `isAdmin()`, `isStaff()`

### `firestore.indexes.json`
18 composite indexes. All required for `where(...).orderBy(...)` multi-field queries.

### `storage.rules`
Rules for Firebase Storage (assessment PDF uploads).

### `manifest.json`
PWA manifest. `display: standalone`. `theme_color: #141d57`. Only SVG icon currently.

### `firebase-messaging-sw.js`
Service worker for Firebase Cloud Messaging (background push notifications).
Must be in root directory. Registered via `navigator.serviceWorker.register('/firebase-messaging-sw.js')`.

### `.github/workflows/deploy.yml`
Auto-deploys on push to `claude/scg-tuitions-parent-app-vq48e`.
Deploys: hosting + firestore rules.

---

## Related Notes

- [[SCG Tuitions - Overview]]
- [[SCG Tuitions - Project Learnings]]
- [[SCG Tuitions - Firebase & Firestore]]
- [[SCG Tuitions - Mobile & UI]]
- [[SCG Tuitions - Caching & Deploy]]
- [[SCG Tuitions - Payments]]
- [[SCG Tuitions - Version History]]
