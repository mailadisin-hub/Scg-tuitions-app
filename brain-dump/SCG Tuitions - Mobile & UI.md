---
title: SCG Tuitions App - Mobile & UI
domain: projects
level: reference
status: active
tags: [scg-tuitions, mobile, responsive, hamburger, css, ui]
created: 2026-06-18
last_updated: 2026-06-18
source: claude-code-session
---

# SCG Tuitions — Mobile & UI

## Brand Colours (`css/style.css :root`)

```css
:root {
  --primary:       #1e2d7d;   /* SCG navy */
  --primary-light: #2840a8;
  --primary-dark:  #141d57;   /* header background */
  --accent:        #39b54a;   /* SCG green */
  --accent-light:  #4dc85f;
  --orange:        #f7941d;   /* SCG orange (pencil) */
  --bg:            #f4f7ff;
  --card:          #ffffff;
  --border:        #e2e8f8;
  --text:          #1a1f3c;
  --text-muted:    #6b7280;
  --shadow:        0 2px 12px rgba(30,45,125,0.08);
  --radius:        12px;
}
```

Login page gradient: `linear-gradient(135deg, #0d2137, #1a3a5c, #1e4d7b)`

All page colours use `var(--*)` — only `:root` needs changing for a rebrand.

## Header Structure (every page)

```html
<header class="app-header">
  <div class="header-left">
    <div class="logo-icon">SCG</div>
    <div class="logo-text">
      <div class="logo-name">SCG Tuitions</div>
      <div class="logo-tagline">Parent Portal</div>
    </div>
  </div>
  <div class="header-right">
    <div class="user-badge" id="user-badge"></div>
    <button class="btn-logout" onclick="signOut()">Sign Out</button>
    <!-- hamburger injected here by nav.js -->
  </div>
</header>
```

`renderHeaderUser(profile)` in `js/auth.js` fills `#user-badge` with initials avatar + `.user-name` span + role pill.

## Mobile Breakpoint (≤600px)

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

`100dvh` = dynamic viewport height — shrinks when mobile browser chrome (address bar) appears/disappears. Avoids the iOS/Android "100vh too tall" bug.

## Hamburger Menu (`js/nav.js`)

`renderPortalNav(activeKey, portalType)` injects both desktop nav AND hamburger on every page.

### Hamburger button
```html
<button class="hamburger-btn">
  <span></span><span></span><span></span>
</button>
```
Three `<span>` elements animated with CSS transforms:
- Top span: `translateY(7px) rotate(45deg)`
- Middle span: `opacity: 0; scaleX(0)`
- Bottom span: `translateY(-7px) rotate(-45deg)`

### Slide-in drawer
Drawer slides in from left (`transform: translateX(-100%)` → `translateX(0)`).
Dark overlay behind it. Clicking overlay closes drawer.

```js
function openDrawer() {
  document.getElementById('nav-drawer').classList.add('open');
  document.querySelector('.drawer-overlay').classList.add('open');
  document.querySelector('.hamburger-btn').classList.add('open');
  document.body.style.overflow = 'hidden';   // lock scroll behind drawer
}
function closeDrawer() {
  // reverse of above
  document.body.style.overflow = '';
}
```

### Drawer contents
- Brand header: SCG logo + portal name
- Nav links with emoji icons + active dot indicator
- Sign Out button at bottom (calls `signOut()` from `js/auth.js`)

## Nav Link Sets

```js
PARENT_NAV  = [Messages, Attendance, Homework, Books, Payments, Reports, Re-register]
TEACHER_NAV = [Messages, Attendance, Homework, Books, Assessments]
ADMIN_NAV   = [Dashboard, Payments, Re-registration]
```

## Chat Layout

Split-pane: conversation sidebar (left) + chat window (right).

```css
.chat-layout { display: grid; grid-template-columns: 300px 1fr; height: calc(100dvh - 64px); overflow: hidden; }
```

Mobile: collapses to single column. Sidebar shown first; selecting a conversation hides sidebar and shows chat window (class toggle on `.chat-layout`).

## Devices Tested On

- Microsoft Edge on Android (3 devices — teacher's phone, dad's phone, own phone)
- Confirmed: hamburger shows, drawer slides in, layout correct

## Related Notes

- [[SCG Tuitions - Overview]]
- [[SCG Tuitions - Version History]]
- [[SCG Tuitions - Caching & Deploy]]
