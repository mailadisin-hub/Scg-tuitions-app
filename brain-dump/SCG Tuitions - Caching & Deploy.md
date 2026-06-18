---
title: SCG Tuitions App - Caching & Deploy
domain: projects
level: reference
status: active
tags: [scg-tuitions, firebase, cdn, caching, github-actions, deploy, ci-cd]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions — Caching & Deploy

## GitHub Actions CI/CD

File: `.github/workflows/deploy.yml`

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

**Secret required:** `FIREBASE_TOKEN` in Repo Settings → Secrets and variables → Actions.

Deploy takes ~90 seconds. Deploys both Hosting AND Firestore rules on every push.

### Fix Applied (v1.2.1-beta)
Error was: `option '--token <token>' argument missing`
Cause: `${{ secrets.FIREBASE_TOKEN }}` expanded to empty string — secret hadn't been created yet on first run.
Fix: wrap in `env:` block + quote in shell (`"$FIREBASE_TOKEN"`).

## Firebase Hosting Cache Headers (`firebase.json`)

```json
"headers": [
  {
    "source": "**/*.html",
    "headers": [
      { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
      { "key": "Pragma",        "value": "no-cache" }
    ]
  },
  {
    "source": "**/*.css",
    "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
  },
  {
    "source": "**/*.js",
    "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
  },
  {
    "source": "/firebase-messaging-sw.js",
    "headers": [
      { "key": "Service-Worker-Allowed", "value": "/" },
      { "key": "Cache-Control",          "value": "no-cache" }
    ]
  }
]
```

## The Caching Problem (solved in v1.2.4–v1.2.7)

### Timeline of what went wrong
1. Firebase Hosting default: CSS/JS cached for days at CDN edge
2. Users on Edge (Android) saw old version even after successful deploy
3. Added `Cache-Control: no-cache` headers in firebase.json → didn't immediately fix
4. Root cause: browser had **already cached** `style.css?v=3` with the OLD long-TTL headers
5. Browser doesn't re-check headers on a URL it believes is cached — it just serves from cache

### The real fix: bump `?v=N`
```html
<!-- Old (cached by browser) -->
<link rel="stylesheet" href="css/style.css?v=3">

<!-- New (browser has never seen this URL → must fetch fresh) -->
<link rel="stylesheet" href="css/style.css?v=7">
```

`style.css?v=3` and `style.css?v=7` are **different URLs** to the browser. No cached entry for `?v=7` → forced download.

### Why this is permanent
- Future deploys bump to `?v=8`, `?v=9`, etc.
- No matter how aggressively the browser caches, a new `?v=N` always wins
- Combined with `no-cache` headers: after first load of `?v=N`, subsequent loads will always revalidate with Firebase CDN

### CDN propagation after deploy
After `firebase deploy` completes:
- Firebase sends a purge signal to Fastly CDN
- ~2–5 minutes for all edge nodes to clear
- After that, all users get fresh content on next page load

## Update Protocol

When pushing any change:
1. Bump version badge in `css/style.css`
2. Bump `?v=N` in all HTML files:
   ```bash
   sed -i 's/style.css?v=7/style.css?v=8/g' *.html
   ```
3. Commit + push → GitHub Actions deploys automatically

## Related Notes

- [[SCG Tuitions - Overview]]
- [[SCG Tuitions - Version History]]
- [[SCG Tuitions - Firebase & Firestore]]
