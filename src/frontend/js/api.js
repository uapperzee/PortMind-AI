/**
 * PortMind AI — Frontend API Client
 * js/api.js
 *
 * Provides a clean async interface to the backend REST API.
 * Automatically falls back to the embedded local data (data.js) if the
 * backend server is not reachable — so the app works both standalone
 * (file:// / local) and with the Express backend running.
 *
 * Usage (from any page script):
 *   const vessels = await API.getVessels();
 *   const vessel  = await API.getVessel('V-104');
 *   const result  = await API.simulate({ type:'Weather', severity:'High', duration:12 });
 *
 * Include this file AFTER data.js and BEFORE any page JS:
 *   <script src="js/data.js"></script>
 *   <script src="js/api.js"></script>
 *   <script src="js/app.js"></script>
 */

'use strict';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const API_CONFIG = {
  // Base URL of the Express backend.
  // When running via `node server.js`, this is http://localhost:3001/api
  // Change to your production URL when deploying, e.g. https://portmind.example.com/api
  baseURL:        'http://localhost:3001/api',

  // Timeout in milliseconds before assuming the server is offline
  timeoutMs:      3000,

  // Whether to show a toast when switching between live/offline mode
  showModeToasts: true
};

// ─── INTERNAL STATE ───────────────────────────────────────────────────────────
let _serverOnline    = null;  // null = not checked yet, true/false after first probe
let _lastModeToastTs = 0;     // prevent spamming toasts

// ─── LOW-LEVEL FETCH WRAPPER ──────────────────────────────────────────────────
/**
 * Fetch a JSON endpoint from the backend with timeout.
 * Resolves with parsed JSON or rejects on network/timeout/HTTP error.
 */
async function _apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const res = await fetch(`${API_CONFIG.baseURL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Check whether the backend is reachable.
 * Updates _serverOnline and shows a mode-change toast if the state changed.
 */
async function _probeServer() {
  try {
    await _apiFetch('/health');
    if (_serverOnline !== true) {
      _serverOnline = true;
      _maybeToast(
        'Live Data Connected',
        'PortMind AI is connected to the backend server. Data is live.',
        'success'
      );
    }
  } catch {
    if (_serverOnline !== false) {
      _serverOnline = false;
      _maybeToast(
        'Offline Mode Active',
        'Backend server not detected. Using embedded demo data.',
        'info'
      );
    }
  }
  return _serverOnline;
}

function _maybeToast(title, msg, type) {
  if (!API_CONFIG.showModeToasts) return;
  const now = Date.now();
  if (now - _lastModeToastTs < 5000) return; // debounce
  _lastModeToastTs = now;
  // showToast is defined in app.js — safe to call after DOMContentLoaded
  if (typeof showToast === 'function') showToast(title, msg, type, 5000);
}

/**
 * Main API call wrapper.
 * Tries the backend first; on failure falls back to the localFallback function.
 *
 * @param {string}   apiPath      - e.g. '/vessels'
 * @param {Function} localFallback - () => localData  (synchronous, from data.js)
 * @param {Object}   fetchOptions  - optional fetch options (method, body, etc.)
 * @returns {Promise<any>}
 */
async function _call(apiPath, localFallback, fetchOptions = {}) {
  // First call: probe to see if server is up
  if (_serverOnline === null) await _probeServer();

  if (_serverOnline) {
    try {
      return await _apiFetch(apiPath, fetchOptions);
    } catch (err) {
      console.warn(`[PortMind API] ${apiPath} failed (${err.message}) — falling back to local data`);
      _serverOnline = false;
      _maybeToast('Switched to Offline Mode', 'Backend unreachable. Using local demo data.', 'info');
    }
  }

  // Offline fallback — call the local data.js function
  if (typeof localFallback === 'function') return localFallback();
  return null;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────
const API = {

  /** Check if the backend is currently reachable */
  isOnline() { return _serverOnline === true; },

  /** Re-probe the server (useful after a network change) */
  probe: _probeServer,

  // ── VESSELS ────────────────────────────────────────────────────────────────
  async getVessels(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const path   = '/vessels' + (params ? '?' + params : '');
    const data   = await _call(path, () => ({ vessels: getVessels(), count: getVessels().length }));
    return data?.vessels ?? [];
  },

  async getVessel(id) {
    const data = await _call(`/vessels/${id}`, () => getVesselById(id));
    return data?.id ? data : data; // backend returns object directly; fallback too
  },

  // ── BERTHS ─────────────────────────────────────────────────────────────────
  async getBerths(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const path   = '/berths' + (params ? '?' + params : '');
    const data   = await _call(path, () => ({ berths: getBerths(), count: getBerths().length }));
    return data?.berths ?? [];
  },

  async getBerth(id) {
    const data = await _call(`/berths/${id}`, () => getBerthById(id));
    return data;
  },

  // ── CRANES ─────────────────────────────────────────────────────────────────
  async getCranes(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const path   = '/cranes' + (params ? '?' + params : '');
    const data   = await _call(path, () => ({ cranes: getCranes(), count: getCranes().length }));
    return data?.cranes ?? [];
  },

  async getCrane(id) {
    const data = await _call(`/cranes/${id}`, () => getCraneById(id));
    return data;
  },

  // ── YARD ───────────────────────────────────────────────────────────────────
  async getYard() {
    const data = await _call('/yard', () => getYard());
    return data;
  },

  // ── DISRUPTIONS ────────────────────────────────────────────────────────────
  async getDisruptions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const path   = '/disruptions' + (params ? '?' + params : '');
    const data   = await _call(path, () => ({ disruptions: getDisruptions(), count: getDisruptions().length }));
    return data?.disruptions ?? [];
  },

  async getDisruption(id) {
    const data = await _call(`/disruptions/${id}`, () => getDisruptions().find(d => d.id === id) || null);
    return data;
  },

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  async getNotifications() {
    const data = await _call('/notifications', () => ({ notifications: getNotifications(), count: getNotifications().length }));
    return data?.notifications ?? [];
  },

  // ── PORT STATS / KPIs ──────────────────────────────────────────────────────
  async getStats() {
    const data = await _call('/stats', () => ({
      generatedAt:      new Date().toISOString(),
      vesselsInPort:    getVesselsInPort(),
      arrivalsNext24h:  getArrivalsNext24h(),
      congestionRisk:   getPortCongestionRisk(),
      avgWaitingTime:   parseFloat(getAverageWaitingTime()),
      yardUtilisation:  getYardUtilisationPct(),
      craneUtilisation: getOverallCraneUtilisation(),
      criticalVessels:  getCriticalVessels().length,
      activeDisruptions:getActiveDisruptions().length
    }));
    return data;
  },

  // ── AI SIMULATION ──────────────────────────────────────────────────────────
  async simulate(params = {}) {
    return _call(
      '/simulate',
      () => null, // no local fallback — simulator.js handles the offline case itself
      { method: 'POST', body: JSON.stringify(params) }
    );
  },

  // ── BERTH OPTIMISATION ─────────────────────────────────────────────────────
  async optimiseBerths() {
    return _call(
      '/optimise/berths',
      () => null, // berths.js has its own local OPTIMISATION_DATA fallback
      { method: 'POST', body: JSON.stringify({}) }
    );
  },

  // ── VESSEL ACTIONS ─────────────────────────────────────────────────────────
  async vesselAction(vesselId, action, extras = {}) {
    return _call(
      `/vessels/${vesselId}/action`,
      () => ({ status:'submitted', message: `Action "${action}" submitted (offline mode).`, disclaimer:'Simulated.' }),
      { method: 'POST', body: JSON.stringify({ action, ...extras }) }
    );
  },

  // ── CRANE REASSIGNMENT ─────────────────────────────────────────────────────
  async reassignCrane(craneId, targetBerth, reason = '') {
    return _call(
      `/cranes/${craneId}/reassign`,
      () => ({ status:'submitted', message:`Crane ${craneId} reassignment submitted (offline mode).` }),
      { method: 'POST', body: JSON.stringify({ targetBerth, reason }) }
    );
  },

  // ── YARD REDISTRIBUTION ────────────────────────────────────────────────────
  async redistributeYard(fromZone, toZone, teuCount, reason = '') {
    return _call(
      '/yard/redistribute',
      () => ({ status:'submitted', message:`Redistribution submitted (offline mode).` }),
      { method: 'POST', body: JSON.stringify({ fromZone, toZone, teuCount, reason }) }
    );
  }
};

// ─── EXPOSE GLOBALLY ─────────────────────────────────────────────────────────
window.API = API;

// Probe server on load — non-blocking, just sets the internal state
// so the first real API call doesn't have to wait for a probe
document.addEventListener('DOMContentLoaded', () => {
  _probeServer().catch(() => {}); // always resolves, never throws
});
