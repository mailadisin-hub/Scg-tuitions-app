// ─── Notification Manager ────────────────────────────────────────────────────
// Handles hourly browser notifications for unread messages.
// Notifications repeat every hour until parent acknowledges with
// "I have read the message". Works while the browser tab is open.
// ─────────────────────────────────────────────────────────────────────────────

const NOTIF_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const STORAGE_KEY        = 'scg_notif_state';

const activeIntervals = {};

function getNotifState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function saveNotifState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Request browser notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

// Show a single browser notification
function showBrowserNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const n = new Notification(title, {
    body,
    tag: tag || 'scg-message',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true,
  });

  n.onclick = () => {
    window.focus();
    n.close();
  };
}

// Show an in-app toast
function showToast(title, body, icon = '📨') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-body">
      <strong>${title}</strong>
      <small>${body}</small>
    </div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 320);
  }, 6000);
}

// Start hourly notifications for a single message
function startMessageNotifications(msgId, fromName, subject) {
  if (activeIntervals[msgId]) return; // already running

  const state = getNotifState();

  // Show immediately if it's been > 1 hour (or first time)
  const lastShown = state[msgId]?.lastShownAt || 0;
  const now       = Date.now();

  if (now - lastShown >= NOTIF_INTERVAL_MS || !state[msgId]) {
    _fireNotification(msgId, fromName, subject);
  }

  // Schedule hourly repeats
  activeIntervals[msgId] = setInterval(() => {
    _fireNotification(msgId, fromName, subject);
  }, NOTIF_INTERVAL_MS);
}

function _fireNotification(msgId, fromName, subject) {
  const state = getNotifState();
  const count = (state[msgId]?.count || 0) + 1;

  state[msgId] = { lastShownAt: Date.now(), count };
  saveNotifState(state);

  const title = `📚 SCG Tuitions — Unread Message`;
  const body  = `${fromName}: "${subject}" — Please open the app and confirm you have read this message.`;

  showBrowserNotification(title, body, `msg-${msgId}`);
  showToast('Unread Message', `From ${fromName}: ${subject}`, '📨');

  // Update notification count label in UI if present
  const label = document.getElementById(`notif-count-${msgId}`);
  if (label) label.textContent = `Notified ${count} time${count !== 1 ? 's' : ''}`;
}

// Stop notifications for a message (after acknowledgement)
function stopMessageNotifications(msgId) {
  if (activeIntervals[msgId]) {
    clearInterval(activeIntervals[msgId]);
    delete activeIntervals[msgId];
  }

  const state = getNotifState();
  delete state[msgId];
  saveNotifState(state);
}

// Stop all active notifications
function stopAllNotifications() {
  Object.keys(activeIntervals).forEach(id => stopMessageNotifications(id));
}

// Resume notifications on page reload for still-unread messages
// Pass array of { id, fromName, subject } unread message objects
function resumeNotificationsForUnread(unreadMessages) {
  unreadMessages.forEach(({ id, fromName, subject }) => {
    startMessageNotifications(id, fromName, subject);
  });
}
