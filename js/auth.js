// ─── Shared Auth Utilities ───────────────────────────────────────────────────

// Redirect if not logged in; return current user profile from Firestore
async function requireAuth(expectedRole) {
  return new Promise((resolve, reject) => {
    const unsub = auth.onAuthStateChanged(async user => {
      unsub();
      if (!user) {
        window.location.href = 'index.html';
        return reject('not-authed');
      }
      try {
        const snap = await db.collection('users').doc(user.uid).get();
        if (!snap.exists) {
          await auth.signOut();
          window.location.href = 'index.html';
          return reject('no-profile');
        }
        const profile = { uid: user.uid, ...snap.data() };
        if (expectedRole && profile.role !== expectedRole) {
          // Redirect to correct dashboard
          window.location.href = profile.role === 'teacher'
            ? 'teacher-dashboard.html'
            : 'parent-dashboard.html';
          return reject('wrong-role');
        }
        resolve(profile);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Render the logged-in user badge in the header
function renderHeaderUser(profile) {
  const badge = document.getElementById('user-badge');
  if (!badge) return;

  const initials = profile.displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleClass = profile.role === 'teacher' ? 'teacher' : 'parent';
  badge.innerHTML = `
    <div class="user-avatar">${initials}</div>
    <span>${profile.displayName}</span>
    <span class="role-pill ${roleClass}">${profile.role}</span>`;
}

// Sign out and redirect
async function signOut() {
  stopAllNotifications && stopAllNotifications();
  await auth.signOut();
  window.location.href = 'index.html';
}

// Format a Firestore timestamp for display
function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = now - d;

  if (diff < 60_000)   return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 172_800_000) return 'Yesterday';

  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Set alert element content
function setAlert(elId, type, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'flex';
}

function clearAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.style.display = 'none';
}
