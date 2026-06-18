---
title: SCG Tuitions App - Version History
domain: projects
level: reference
status: active
tags: [scg-tuitions, versioning, changelog, beta]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions — Version History

## Current: `v1.2.7-beta`

## Changelog

| Version | Date | What Changed |
|---|---|---|
| `v1.2.0-beta` | Jun 2026 | Initial beta — full portal: login, chat, attendance, homework, books, payments, assessments, re-registration, invoice |
| `v1.2.1-beta` | Jun 2026 | Fixed GitHub Actions deploy — `FIREBASE_TOKEN` secret + token quoting |
| `v1.2.2-beta` | Jun 2026 | Version badge made visible (was `rgba(0,0,0,0.18)` — invisible) |
| `v1.2.3-beta` | Jun 2026 | Version badge: solid black on white pill |
| `v1.2.4-beta` | Jun 2026 | Mobile responsive layout + CSS cache bust `?v=3` |
| `v1.2.5-beta` | Jun 2026 | `Cache-Control: no-cache` headers in `firebase.json` |
| `v1.2.6-beta` | Jun 2026 | Hamburger menu + slide-in drawer for mobile |
| `v1.2.7-beta` | Jun 2026 | CSS cache bust `?v=3` → `?v=7` — fixes stale CSS on all browsers |

## Version Bump Checklist (every push)

1. `css/style.css` line ~704 — change `content: 'vX.X.X-beta'`
2. All 21 HTML files — bump CSS query param:
   ```bash
   sed -i 's/style.css?v=7/style.css?v=8/g' *.html
   ```
3. Update this note and [[SCG Tuitions - Overview]]

## Version Badge CSS

Located in `css/style.css` around line 702:

```css
body::after {
  content: 'v1.2.7-beta';
  position: fixed;
  bottom: 10px; right: 14px;
  font-size: 12px; font-family: monospace; font-weight: 600;
  color: #000; background: #fff;
  padding: 3px 8px; border-radius: 20px;
  pointer-events: none; z-index: 9999;
}
```

## Why We Bump `?v=N`

Browser cached `style.css?v=3` before `Cache-Control: no-cache` headers existed. A new `?v=N` is a URL the browser has never seen → must fetch fresh. See [[SCG Tuitions - Caching & Deploy]] for full explanation.

## Related Notes

- [[SCG Tuitions - Overview]]
- [[SCG Tuitions - Caching & Deploy]]
