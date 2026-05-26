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
  { key: 'messages',       href: 'teacher-chat.html',            icon: '💬', label: 'Messages'       },
  { key: 'attendance',     href: 'teacher-attendance.html',      icon: '📋', label: 'Attendance'     },
  { key: 'homework',       href: 'teacher-homework.html',        icon: '📚', label: 'Homework'       },
  { key: 'books',          href: 'teacher-books.html',           icon: '📖', label: 'Books'          },
  { key: 'payments',       href: 'teacher-payments.html',        icon: '💳', label: 'Payments'       },
  { key: 'reports',        href: 'teacher-reports.html',         icon: '📊', label: 'Assessments'    },
  { key: 'registration',   href: 'teacher-registration.html',    icon: '📝', label: 'Re-registration'},
];

function renderPortalNav(activeKey, portalType) {
  const links = portalType === 'teacher' ? TEACHER_NAV : PARENT_NAV;
  const nav = document.createElement('nav');
  nav.className = 'portal-nav';
  nav.innerHTML = links.map(link =>
    `<a href="${link.href}" class="portal-nav-link${link.key === activeKey ? ' active' : ''}">${link.icon} ${link.label}</a>`
  ).join('');
  const header = document.querySelector('.app-header');
  if (header) header.insertAdjacentElement('afterend', nav);
}
