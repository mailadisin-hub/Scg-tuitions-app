---
title: SCG Tuitions App - Overview
domain: projects
level: reference
status: active
tags: [scg-tuitions, firebase, web-app, portal, tuition]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions App — Overview

Parent/teacher portal for SCG Tuitions, Swindon. Pure HTML/CSS/JS, no framework, deployed on Firebase Hosting.

## Quick Facts

| | |
|---|---|
| **Live URL** | https://scg-tuitions.web.app |
| **Repo** | https://github.com/mailadisin-hub/scg-tuitions-app |
| **Branch** | `claude/scg-tuitions-parent-app-vq48e` |
| **Firebase project** | `scg-tuitions` |
| **Owner** | mail.adisin@gmail.com |
| **Stack** | HTML / CSS / JS only — no build step, no framework |
| **Deploy** | GitHub Actions auto-deploys on every push to branch |

## Roles

- **parent** → `parent-chat.html` (home)
- **teacher** → `teacher-chat.html` (home)
- **admin** → `admin.html` (home)

Admin role must be set manually in Firestore: `users/{uid}` → `role: "admin"`. The account `mail.adisin@gmail.com` needs this set.

## Features Shipped

| Feature | Teacher page | Parent page |
|---|---|---|
| Chat (WhatsApp-style) | `teacher-chat.html` | `parent-chat.html` |
| Attendance | `teacher-attendance.html` | `parent-attendance.html` |
| Homework log | `teacher-homework.html` | `parent-homework.html` |
| Books given | `teacher-books.html` | `parent-books.html` |
| Payments | `teacher-payments.html` | `parent-payments.html` |
| Assessment reports | `teacher-reports.html` | `parent-reports.html` |
| Re-registration | `teacher-registration.html` | `parent-registration.html` |
| Invoice | — | `invoice.html?paymentId=xxx` |
| Admin payments | `admin-payments.html` | — |
| Admin re-reg | `admin-registration.html` | — |

## Pending Tasks

- [ ] Set `role: "admin"` in Firestore for mail.adisin@gmail.com
- [ ] Upgrade Firebase to Blaze plan (needed for Storage — PDF uploads)
- [ ] App Store / Play Store prep (icons, iOS meta tags, privacy policy)
- [ ] Offline fallback page

## Related Notes

- [[SCG Tuitions - Version History]]
- [[SCG Tuitions - Firebase & Firestore]]
- [[SCG Tuitions - Mobile & UI]]
- [[SCG Tuitions - Caching & Deploy]]
- [[SCG Tuitions - Payments]]
