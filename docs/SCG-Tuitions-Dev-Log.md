# SCG Tuitions App — Dev Log

> Pull this file into Claude Code sessions with: "read docs/SCG-Tuitions-Dev-Log.md"
> Update it after every push.

---

## Project Overview

**Live URL:** https://scg-tuitions.web.app  
**Repo:** https://github.com/mailadisin-hub/scg-tuitions-app  
**Branch:** `claude/scg-tuitions-parent-app-vq48e`  
**Stack:** Pure HTML / CSS / JS — no framework. Firebase Auth + Firestore + Hosting.  
**Deploy:** GitHub Actions auto-deploys on every push to branch. Secret: `FIREBASE_TOKEN` in repo settings.

---

## Beta Version History

| Version | Date | What Changed |
|---|---|---|
| `v1.2.0-beta` | Jun 2026 | Initial beta — login, chat, attendance, homework, books, payments, assessments, re-registration, invoice |
| `v1.2.1-beta` | Jun 2026 | Fixed GitHub Actions deploy (FIREBASE_TOKEN secret + quoting fix) |
| `v1.2.2-beta` | Jun 2026 | Version badge made visible (was 18% opacity — invisible) |
| `v1.2.3-beta` | Jun 2026 | Version badge: solid black text on white pill |
| `v1.2.4-beta` | Jun 2026 | Mobile responsive layout + CSS cache bust `?v=3` |
| `v1.2.5-beta` | Jun 2026 | No-cache headers in firebase.json (instant CDN updates) |
| `v1.2.6-beta` | Jun 2026 | Hamburger menu with slide-in drawer for mobile |
| `v1.2.7-beta` | Jun 2026 | CSS cache bust bumped to `?v=7` — fixes browsers serving stale CSS |

**Rule:** Every push bumps the beta number. Bump both the `content: 'vX.X.X-beta'` in `css/style.css` AND the `?v=N` on all HTML `<link>` tags.

---

## File Map

```
index.html                    ← Login / register page
admin.html                    ← Admin dashboard
admin-payments.html           ← Admin: view all payments
admin-registration.html       ← Admin: re-registration responses

parent-chat.html              ← Parent: WhatsApp-style chat
parent-attendance.html        ← Parent: attendance % + session list
parent-homework.html          ← Parent: homework brought/marked log
parent-books.html             ← Parent: books received per half-term
parent-payments.html          ← Parent: pay via Stripe/SumUp + history
parent-reports.html           ← Parent: assessment scores + PDF download
parent-registration.html      ← Parent: re-register for next year
parent-dashboard.html         ← (legacy, kept for safety)

teacher-chat.html             ← Teacher: chat with all parents
teacher-attendance.html       ← Teacher: mark attendance
teacher-homework.html         ← Teacher: log homework in/marked
teacher-books.html            ← Teacher: record books given
teacher-payments.html         ← Teacher: create payment records, mark paid
teacher-reports.html          ← Teacher: upload PDF assessments + scores
teacher-registration.html     ← Teacher: open/close re-reg window, view responses

invoice.html                  ← Printable invoice (opened from payment record)

css/style.css                 ← All styles. Brand colours in :root variables.
js/auth.js                    ← requireAuth(), renderHeaderUser(), signOut(), helpers
js/nav.js                     ← renderPortalNav() — desktop nav bar + mobile drawer
js/firebase-config.js         ← Firebase app init (Auth, Firestore, Storage, Messaging)
js/notifications.js           ← Hourly push notification logic

firebase.json                 ← Hosting config: no-cache headers, rewrites
firestore.rules               ← Security rules
firestore.indexes.json        ← Composite indexes
storage.rules                 ← Firebase Storage rules
.github/workflows/deploy.yml  ← CI/CD auto-deploy
```

---

## Brand Colours (css/style.css `:root`)

```css
--primary:       #1e2d7d;   /* SCG navy */
--primary-light: #2840a8;
--primary-dark:  #141d57;
--accent:        #39b54a;   /* SCG green */
--accent-light:  #4dc85f;
--orange:        #f7941d;   /* SCG orange (pencil) */
```

---

## Firestore Collections

| Collection | Who writes | Who reads |
|---|---|---|
| `users/{uid}` | Auth on register | Self + teacher |
| `conversations/{id}` | Teacher creates | Teacher + parent in convo |
| `conversations/{id}/messages/{id}` | Sender | Teacher + parent in convo |
| `attendance/{id}` | Teacher | Teacher + that student's parent |
| `homework/{id}` | Teacher | Teacher + that student's parent |
| `books/{id}` | Teacher | Teacher + that student's parent |
| `payments/{id}` | Teacher | Teacher + that parent |
| `assessments/{id}` | Teacher | Teacher + that student's parent |
| `registrations/{id}` | Parent | Parent + teacher |
| `settings/app` | Teacher | All authenticated |

---

## Firestore User Document Shape

```js
{
  displayName: "Jane Smith",
  email: "jane@example.com",
  role: "parent",          // "parent" | "teacher" | "admin"
  childName: "Oliver",     // parents only
  childYear: "Year 6",     // parents only
  teacherId: "uid-of-teacher",  // parents only — links parent to teacher
  createdAt: Timestamp
}
```

---

## Known Issues / Pending

- [ ] Firebase Storage must be on **Blaze plan** for PDF assessment uploads (teacher-reports.html)
- [ ] Set admin role: Firestore → `users` collection → `mail.adisin@gmail.com` doc → `role: "admin"`
- [ ] App Store / Play Store prep: PNG icons (192×192, 512×512, 180×180), iOS meta tags, privacy policy page

---

## Mobile Architecture

- **≤600px**: desktop nav hidden, hamburger button shown
- Hamburger opens slide-in drawer from left (`js/nav.js` → `renderPortalNav()`)
- Drawer has brand header, nav links with emoji icons, Sign Out at bottom
- Body scroll locked (`overflow: hidden`) while drawer open
- Chat pages use `height: calc(100dvh - 56px)` for correct mobile full-height

---

## Caching Strategy

- `firebase.json` sets `Cache-Control: no-cache, no-store, must-revalidate` on all HTML/CSS/JS
- All HTML files link CSS as `css/style.css?v=N` — bump N with every deploy
- Current: `?v=7` → next push uses `?v=8`
- Firebase CDN purges automatically on `firebase deploy`
- After a deploy, updates appear within ~2–5 min (CDN propagation), then instantly on next load

---

## GitHub Actions Deploy

```yaml
# .github/workflows/deploy.yml
- name: Deploy to Firebase
  env:
    FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
  run: firebase deploy --project scg-tuitions --only hosting,firestore --token "$FIREBASE_TOKEN"
```

Secret `FIREBASE_TOKEN` must be set in: Repo Settings → Secrets → Actions.

---

## Payments Flow

1. Teacher creates payment record in `teacher-payments.html` — pastes Stripe Payment Link URL
2. Parent sees "Pay with Stripe" button in `parent-payments.html` — opens Stripe in new tab
3. After parent pays, teacher clicks "Mark as paid" → updates Firestore `paid: true`
4. Parent can view/print invoice via `invoice.html?paymentId=xxx`

No API keys in app code. No backend/webhook needed.

---

## Next Planned Features (from backlog)

- App Store / Play Store submission (PWA → native wrapper)
- Offline fallback page
- Push notifications for new messages (Firebase Cloud Messaging — partial implementation exists)
