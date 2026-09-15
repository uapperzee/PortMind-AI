/**
 * PortMind AI — Application Shell
 * app.js — Sidebar, navigation, notifications, toasts, shared utilities
 */

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function initSidebar() {
  const sidebar     = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn   = document.getElementById('sidebarToggle');
  const mobileBtn   = document.getElementById('mobileMenuBtn');
  const overlay     = document.getElementById('sidebarOverlay');

  if (!sidebar) return;

  // Restore collapse state
  const isCollapsed = localStorage.getItem('pm_sidebar_collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
    mainContent && mainContent.classList.add('sidebar-collapsed');
  }

  // Desktop toggle
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const col = sidebar.classList.toggle('collapsed');
      mainContent && mainContent.classList.toggle('sidebar-collapsed', col);
      localStorage.setItem('pm_sidebar_collapsed', col);
      updateToggleIcon(col);
    });
  }

  // Mobile toggle
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      overlay && overlay.classList.toggle('visible');
    });
  }

  // Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('visible');
    });
  }

  // Mark active nav item based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if (item.dataset.page === currentPage) {
      item.classList.add('active');
    }
  });
}

function updateToggleIcon(collapsed) {
  const btn = document.getElementById('sidebarToggle');
  if (!btn) return;
  btn.innerHTML = collapsed
    ? `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 8l6-6 1.4 1.4L3.8 8l4.6 4.6L7 14z"/><path d="M8 8l6-6 1.4 1.4-4.6 4.6 4.6 4.6L14 14z"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M15 8l-6-6-1.4 1.4L12.2 8l-4.6 4.6L9 14z"/><path d="M8 8L2 2 .6 3.4 5.2 8 .6 12.6 2 14z"/></svg>`;
}

// ─── TOPBAR CLOCK ─────────────────────────────────────────────────────────────
function initClock() {
  const el = document.getElementById('topbarTime');
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
      + '  ' + now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function initNotifications() {
  const btn     = document.getElementById('notifBtn');
  const panel   = document.getElementById('notifPanel');
  const badge   = document.getElementById('notifBadge');
  const navCount = document.getElementById('notifNavCount');
  const closeBtn = document.getElementById('notifClose');

  if (!btn || !panel) return;

  // Load notifications from data layer
  const notifs = getNotifications();
  const unread = notifs.filter(n => !n.read).length;

  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }
  if (navCount) {
    navCount.textContent = unread;
    navCount.style.display = unread > 0 ? 'inline-flex' : 'none';
  }

  // Render notification list
  renderNotificationPanel(notifs);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  // Sidebar notifications link also opens the panel
  const navBtn = document.getElementById('notifNavBtn');
  if (navBtn) {
    navBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      panel.classList.toggle('open');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('open');
    }
  });
}

function renderNotificationPanel(notifs) {
  const list = document.getElementById('notifList');
  if (!list) return;

  list.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
      <div class="notif-item-header">
        <span class="notif-dot ${n.level}"></span>
        <span class="notif-title">${n.title}</span>
        <span class="notif-time">${n.time}</span>
      </div>
      <p class="notif-msg">${n.message}</p>
    </div>
  `).join('');

  // Mark as read on click
  list.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.remove('unread');
      updateNotifBadge();
    });
  });
}

function updateNotifBadge() {
  const unread = document.querySelectorAll('.notif-item.unread').length;
  const badge    = document.getElementById('notifBadge');
  const navCount = document.getElementById('notifNavCount');
  const countStr = unread > 0 ? String(unread) : '';
  if (badge) {
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'flex' : 'none';
  }
  if (navCount) {
    navCount.textContent = unread;
    navCount.style.display = unread > 0 ? 'inline-flex' : 'none';
  }
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────────────────────────────
/**
 * Show a toast notification.
 * @param {string} title   - Bold first line
 * @param {string} message - Supporting message (optional)
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms before auto-dismiss (default 4000)
 */
function showToast(title, message = '', type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon"></div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);

  // Auto remove
  const remove = () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  const timer = setTimeout(remove, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      closeModal(m.id);
    });
  }
});

// Event delegation for modal close buttons — handles dynamically injected content
document.addEventListener('click', e => {
  // Close button with data-modal-close attribute
  const closeBtn = e.target.closest('[data-modal-close]');
  if (closeBtn) {
    closeModal(closeBtn.dataset.modalClose);
    return;
  }
  // Click on overlay backdrop (not the panel itself)
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('open')) {
    closeModal(e.target.id);
  }
});

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

/** Build a risk bar HTML string */
function buildRiskBar(score) {
  const cls = getRiskClass(score);
  return `
    <div class="risk-bar-wrap">
      <div class="risk-bar">
        <div class="risk-bar-fill ${cls}" style="width:${score}%"></div>
      </div>
      <span class="risk-score-num ${cls}">${score}</span>
    </div>
  `;
}

/** Build a badge HTML string */
function buildBadge(text, cssClass) {
  const cls = cssClass || getStatusClass(text);
  return `<span class="badge ${cls}">${text}</span>`;
}

/** Format number with comma thousands */
function fmtNum(n) {
  return Number(n).toLocaleString();
}

/** Clamp value 0-100 */
function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

/** Get utilisation bar class */
function utilisationClass(pct) {
  if (pct >= 90) return 'critical';
  if (pct >= 75) return 'high';
  if (pct >= 50) return 'medium';
  return 'low';
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initClock();
  initNotifications();
});
