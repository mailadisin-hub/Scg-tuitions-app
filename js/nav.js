const PARENT_NAV = [
  { key: 'messages',       href: 'parent-chat.html',         icon: '💬', label: 'Messages'    },
  { key: 'attendance',     href: 'parent-attendance.html',   icon: '📋', label: 'Attendance'  },
  { key: 'homework',       href: 'parent-homework.html',     icon: '📚', label: 'Homework'    },
  { key: 'books',          href: 'parent-books.html',        icon: '📖', label: 'Books'       },
  { key: 'payments',       href: 'parent-payments.html',     icon: '💳', label: 'Payments'    },
  { key: 'reports',        href: 'parent-reports.html',      icon: '📊', label: 'Reports'     },
  { key: 'registration',   href: 'parent-registration.html', icon: '📝', label: 'Re-register' },
];

const TEACHER_NAV = [
  { key: 'messages',   href: 'teacher-chat.html',       icon: '💬', label: 'Messages'    },
  { key: 'attendance', href: 'teacher-attendance.html', icon: '📋', label: 'Attendance'  },
  { key: 'homework',   href: 'teacher-homework.html',   icon: '📚', label: 'Homework'    },
  { key: 'books',      href: 'teacher-books.html',      icon: '📖', label: 'Books'       },
  { key: 'reports',    href: 'teacher-reports.html',    icon: '📊', label: 'Assessments' },
];

const ADMIN_NAV = [
  { key: 'dashboard',    href: 'admin.html',              icon: '🏠', label: 'Dashboard'      },
  { key: 'payments',     href: 'admin-payments.html',     icon: '💳', label: 'Payments'        },
  { key: 'registration', href: 'admin-registration.html', icon: '📝', label: 'Re-registration' },
];

function renderPortalNav(activeKey, portalType) {
  const links = portalType === 'admin'   ? ADMIN_NAV
              : portalType === 'teacher' ? TEACHER_NAV
              : PARENT_NAV;

  // Desktop sticky nav bar
  const nav = document.createElement('nav');
  nav.className = 'portal-nav';
  nav.innerHTML = links.map(link =>
    `<a href="${link.href}" class="portal-nav-link${link.key === activeKey ? ' active' : ''}">${link.icon} ${link.label}</a>`
  ).join('');
  const header = document.querySelector('.app-header');
  if (header) header.insertAdjacentElement('afterend', nav);

  // Hamburger button — appended to header-right (mobile only via CSS)
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    const btn = document.createElement('button');
    btn.className = 'hamburger-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = `<span></span><span></span><span></span>`;
    btn.onclick = openDrawer;
    headerRight.appendChild(btn);
  }

  // Dark overlay behind drawer
  const overlay = document.createElement('div');
  overlay.className = 'drawer-overlay';
  overlay.onclick = closeDrawer;
  document.body.appendChild(overlay);

  // Slide-in drawer
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.id = 'nav-drawer';
  drawer.innerHTML = `
    <div class="drawer-header">
      <div class="drawer-brand">
        <div class="drawer-logo-icon">SCG</div>
        <div>
          <div class="drawer-brand-name">SCG Tuitions</div>
          <div class="drawer-brand-role">${portalType.charAt(0).toUpperCase() + portalType.slice(1)} Portal</div>
        </div>
      </div>
      <button class="drawer-close-btn" onclick="closeDrawer()">✕</button>
    </div>
    <nav class="drawer-nav">
      ${links.map(link => `
        <a href="${link.href}" class="drawer-link${link.key === activeKey ? ' active' : ''}">
          <span class="drawer-icon">${link.icon}</span>
          <span>${link.label}</span>
          ${link.key === activeKey ? '<span class="drawer-active-dot"></span>' : ''}
        </a>
      `).join('')}
    </nav>
    <div class="drawer-footer">
      <button class="drawer-signout-btn" onclick="signOut()">Sign Out</button>
    </div>
  `;
  document.body.appendChild(drawer);
}

function openDrawer() {
  document.getElementById('nav-drawer').classList.add('open');
  document.querySelector('.drawer-overlay').classList.add('open');
  document.querySelector('.hamburger-btn').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('nav-drawer').classList.remove('open');
  document.querySelector('.drawer-overlay').classList.remove('open');
  document.querySelector('.hamburger-btn').classList.remove('open');
  document.body.style.overflow = '';
}
