/**
 * PortMind AI — Berth Management
 * berths.js
 *
 * Features:
 *  - Berth stats strip (total / available / occupied / congested / avg utilisation)
 *  - Visual Gantt timeline with time axis (06:00–06:00+24h)
 *    • Date-aware slot positioning (handles schedules that span midnight)
 *    • Colour-coded blocks: Congested / Occupied / Incoming / Free Slot
 *    • Hover tooltip on each block
 *    • Click block → opens vessel detail toast
 *  - Berth cards grid with filter by status
 *    • Click card → opens berth detail modal
 *  - "Optimise Berths" button → AI comparison panel
 *    • 1.5s simulated analysis delay with spinner
 *    • Current Plan vs AI Plan side-by-side
 *    • Per-vessel: reason + estimated impact
 *    • Overall impact stats banner
 */

// ─── STATE ────────────────────────────────────────────────────────────────────
let berthStatusFilter  = '';
let optimiseHasRun     = false;

// ─── TIMELINE CONSTANTS ───────────────────────────────────────────────────────
// Display window: 06:00 on Day 1 to 06:00 on Day 2 (24h)
const TL_START_HOUR  = 6;          // 06:00
const TL_RANGE_HOURS = 24;         // 24-hour window
const TL_BASE_DATE   = '2026-07-15'; // anchor date for schedule data

/**
 * Convert an ISO datetime string to fractional hours-since-TL_START on the
 * correct day. Handles slots that extend into the next calendar day.
 * @param {string} iso
 * @returns {number} hours offset from TL_START_HOUR (e.g. 20.5 = 20:30 = 14.5h into window)
 */
function isoToWindowHours(iso) {
  const d = new Date(iso);
  // Total minutes since midnight of TL_BASE_DATE
  const baseMs   = new Date(TL_BASE_DATE + 'T00:00:00').getTime();
  const deltaMin = (d.getTime() - baseMs) / 60000;
  return deltaMin / 60; // fractional hours since midnight of base date
}

// ─── RENDER STATS STRIP ───────────────────────────────────────────────────────
function renderBerthStats() {
  const el = document.getElementById('berthStats');
  if (!el) return;

  const berths    = getBerths();
  const available = berths.filter(b => b.status === 'Available').length;
  const occupied  = berths.filter(b => b.status === 'Occupied').length;
  const congested = berths.filter(b => b.status === 'Congested').length;
  const avgUtil   = Math.round(berths.reduce((s,b) => s + b.utilisation, 0) / berths.length);

  const stats = [
    { val: berths.length, label: 'Total Berths',      color: 'var(--text-primary)' },
    { val: available,     label: 'Available',          color: 'var(--status-low)' },
    { val: occupied,      label: 'Occupied',           color: 'var(--accent-blue)' },
    { val: congested,     label: 'Congested',          color: 'var(--status-critical)' },
    { val: avgUtil + '%', label: 'Avg Utilisation',    color: utilisationClass(avgUtil) === 'critical' ? 'var(--status-critical)' : utilisationClass(avgUtil) === 'high' ? 'var(--status-high)' : 'var(--text-primary)' }
  ];

  el.innerHTML = stats.map(s => `
    <div class="bstat">
      <div class="bs-val" style="color:${s.color};">${s.val}</div>
      <div class="bs-label">${s.label}</div>
    </div>
  `).join('');
}

// ─── RENDER TIME AXIS ─────────────────────────────────────────────────────────
function renderTimeAxis() {
  const el = document.getElementById('timelineAxis');
  if (!el) return;

  // Tick marks every 4 hours: 06, 10, 14, 18, 22, 02(next day), 06(next day)
  const ticks = [];
  for (let h = 0; h <= TL_RANGE_HOURS; h += 4) {
    const actualHour = (TL_START_HOUR + h) % 24;
    const label      = String(actualHour).padStart(2,'0') + ':00';
    const leftPct    = (h / TL_RANGE_HOURS) * 100;
    ticks.push({ label, leftPct });
  }

  el.innerHTML = ticks.map(t => `
    <span class="axis-tick" style="left:${t.leftPct.toFixed(1)}%">${t.label}</span>
  `).join('');
}

// ─── RENDER BERTH TIMELINE ────────────────────────────────────────────────────
function renderBerthTimeline() {
  const container = document.getElementById('berthTimeline');
  if (!container) return;

  const berths = getBerths();

  container.innerHTML = berths.map(berth => {
    // Build timeline blocks for each scheduled slot
    const blocks = berth.schedule.map((slot, slotIndex) => {
      // Fractional hours from midnight of base date
      const startAbsH = isoToWindowHours(slot.start);
      const endAbsH   = isoToWindowHours(slot.end);

      // Window runs from TL_START_HOUR (6) to TL_START_HOUR + TL_RANGE_HOURS (30)
      const windowStart = TL_START_HOUR;
      const windowEnd   = TL_START_HOUR + TL_RANGE_HOURS;

      // Clamp to visible window
      const visStart = Math.max(startAbsH, windowStart);
      const visEnd   = Math.min(endAbsH,   windowEnd);

      // Skip if entirely outside window
      if (visEnd <= visStart) return '';

      const leftPct  = ((visStart - windowStart) / TL_RANGE_HOURS) * 100;
      const widthPct = ((visEnd   - visStart)     / TL_RANGE_HOURS) * 100;

      const vessel     = getVesselById(slot.vessel);
      const vName      = vessel?.name || slot.vessel;
      const shortName  = vName.length > 12 ? vName.substring(0, 12) + '…' : vName;

      // Colour logic
      const isCongested = berth.status === 'Congested' && slotIndex === 0;
      let   blockClass  = 'occupied';
      let   bgColour    = '';
      if (isCongested) {
        blockClass = 'congested';
        bgColour   = 'rgba(248,81,73,0.65)';
      } else if (slotIndex === 0) {
        // Current vessel
        bgColour = 'rgba(31,111,235,0.6)';
      } else if (slotIndex === 1) {
        // Next incoming
        bgColour = 'rgba(57,208,224,0.45)';
      } else {
        // Future scheduled
        bgColour = 'rgba(63,185,80,0.35)';
      }

      // Tooltip text
      const tipText = `${vName}  |  ${formatTime(slot.start)} – ${formatTime(slot.end)}${vessel ? '  |  ' + vessel.cargo : ''}`;

      return `
        <div class="timeline-block ${blockClass}"
             style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;background:${bgColour};"
             title="${tipText}"
             onclick="onTimelineBlockClick('${berth.id}','${slot.vessel}')">
          ${widthPct > 5 ? `<span style="font-size:9px;font-weight:600;white-space:nowrap;overflow:hidden;">${shortName}</span>` : ''}
        </div>
      `;
    }).join('');

    // Status badge class
    const stsCls = getStatusClass(berth.status);

    return `
      <div class="timeline-row">
        <span class="timeline-label" style="cursor:pointer;" onclick="openBerthDetail('${berth.id}')" title="Click for ${berth.name} details">${berth.id}</span>
        <div class="timeline-track">${blocks}</div>
        <span class="badge ${stsCls}" style="font-size:10px;min-width:76px;text-align:center;flex-shrink:0;">${berth.status}</span>
      </div>
    `;
  }).join('');
}

/** Called when user clicks a timeline block */
function onTimelineBlockClick(berthId, vesselId) {
  const berth  = getBerthById(berthId);
  const vessel = getVesselById(vesselId);
  if (!berth || !vessel) return;

  showToast(
    `${vessel.name} at ${berth.name}`,
    `${vessel.cargo} · ${fmtNum(vessel.containers)} TEU · ETA ${formatTime(vessel.eta)} · Risk ${vessel.riskScore}/100 — ${getRiskClass(vessel.riskScore).toUpperCase()}`,
    vessel.riskScore >= 81 ? 'error' : vessel.riskScore >= 61 ? 'warning' : 'info',
    5000
  );
}

// ─── RENDER BERTH CARDS ───────────────────────────────────────────────────────
function renderBerthCards() {
  const grid       = document.getElementById('berthGrid');
  const countLabel = document.getElementById('berthCardCount');
  if (!grid) return;

  let berths = getBerths();
  if (berthStatusFilter) {
    berths = berths.filter(b => b.status === berthStatusFilter);
  }

  if (countLabel) {
    countLabel.textContent = berthStatusFilter
      ? `Showing ${berths.length} berths — ${berthStatusFilter}`
      : `All Berths (${berths.length})`;
  }

  if (!berths.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No berths match the current filter.</div>`;
    return;
  }

  grid.innerHTML = berths.map(berth => {
    const utilCls    = utilisationClass(berth.utilisation);
    const stsCls     = getStatusClass(berth.status);
    const currVessel = berth.currentVessel ? getVesselById(berth.currentVessel) : null;
    const nextVessel = berth.nextVessel    ? getVesselById(berth.nextVessel)    : null;

    const craneList = berth.cranes.map(cid => {
      const c = getCraneById(cid);
      const cls = c ? getStatusClass(c.status) : 'idle';
      return `<span class="badge ${cls}" style="font-size:10px;">${cid}${c && c.status === 'Maintenance' ? ' ⚠' : c && c.status === 'Overloaded' ? ' ⚡' : ''}</span>`;
    }).join(' ');

    // Card border class based on status
    const cardCls = berth.status === 'Congested' ? 'congested'
                  : berth.status === 'Available' ? 'available'
                  : '';

    return `
      <div class="berth-card ${cardCls}" onclick="openBerthDetail('${berth.id}')" title="Click for ${berth.name} details" role="button" tabindex="0">
        <div class="berth-header">
          <span class="berth-name">${berth.name}</span>
          ${buildBadge(berth.status)}
        </div>

        <div class="berth-meta">
          <div class="berth-meta-item">
            <div class="bm-label">Location</div>
            <div class="bm-val" style="font-family:var(--font-sans);font-size:11px;">${berth.location}</div>
          </div>
          <div class="berth-meta-item">
            <div class="bm-label">Capacity</div>
            <div class="bm-val">${fmtNum(berth.capacity)} TEU</div>
          </div>
          <div class="berth-meta-item">
            <div class="bm-label">Utilisation</div>
            <div class="bm-val" style="color:var(--status-${utilCls});">${berth.utilisation}%</div>
          </div>
        </div>

        <!-- Utilisation bar -->
        <div class="berth-util-bar" style="margin-bottom:12px;">
          <div class="berth-util-fill" style="width:${berth.utilisation}%;background:var(--status-${utilCls});height:6px;border-radius:3px;"></div>
        </div>

        <div class="metric-row">
          <span class="metric-key">Current Vessel</span>
          <span class="metric-val">${currVessel ? currVessel.name : '— Empty —'}</span>
        </div>
        <div class="metric-row">
          <span class="metric-key">Next Vessel</span>
          <span class="metric-val">${nextVessel ? nextVessel.name : '—'}</span>
        </div>
        <div class="metric-row">
          <span class="metric-key">Available At</span>
          <span class="metric-val">${formatTime(berth.availableAt)}</span>
        </div>
        <div class="metric-row" style="align-items:flex-start;">
          <span class="metric-key">Cranes</span>
          <span style="display:flex;gap:4px;flex-wrap:wrap;">${craneList}</span>
        </div>
        <div class="metric-row">
          <span class="metric-key">Depth / Length</span>
          <span class="metric-val">${berth.depth}m · ${berth.length}m</span>
        </div>
      </div>
    `;
  }).join('');
}

// ─── BERTH DETAIL MODAL ───────────────────────────────────────────────────────
function openBerthDetail(berthId) {
  const berth = getBerthById(berthId);
  if (!berth) return;

  const utilCls    = utilisationClass(berth.utilisation);
  const stsCls     = getStatusClass(berth.status);
  const currVessel = berth.currentVessel ? getVesselById(berth.currentVessel) : null;
  const nextVessel = berth.nextVessel    ? getVesselById(berth.nextVessel)    : null;

  // Build crane info rows
  const craneRows = berth.cranes.map(cid => {
    const c = getCraneById(cid);
    if (!c) return `<div class="metric-row"><span class="metric-key">${cid}</span><span class="metric-val">—</span></div>`;
    return `
      <div class="metric-row">
        <span class="metric-key">${c.id} — ${c.type}</span>
        <span class="metric-val" style="display:flex;align-items:center;gap:6px;">
          ${buildBadge(c.status)}
          <span style="font-size:11px;color:var(--text-muted);">${c.utilisation}%</span>
        </span>
      </div>
    `;
  }).join('');

  // Build schedule list
  const scheduleRows = berth.schedule.map((slot, i) => {
    const v       = getVesselById(slot.vessel);
    const vName   = v ? v.name : slot.vessel;
    const colours = ['rgba(31,111,235,0.6)', 'rgba(57,208,224,0.45)', 'rgba(63,185,80,0.35)'];
    const colour  = colours[Math.min(i, colours.length - 1)];
    const label   = i === 0 ? 'Current' : i === 1 ? 'Next' : 'Upcoming';

    return `
      <div class="schedule-item">
        <div class="sched-bar" style="background:${colour};min-height:40px;"></div>
        <div style="flex:1;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:2px;">${label}</div>
          <div class="sched-vessel">${vName}</div>
          <div class="sched-time">${formatDateTime(slot.start)} → ${formatDateTime(slot.end)}</div>
          ${v ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${v.cargo}${v.containers > 0 ? ' · ' + fmtNum(v.containers) + ' TEU' : ''}</div>` : ''}
        </div>
        ${v ? buildBadge(v.status) : ''}
      </div>
    `;
  }).join('');

  // AI note for congested berths
  let aiNote = '';
  if (berth.status === 'Congested') {
    aiNote = `
      <div class="ai-card" style="margin-top:16px;">
        <div class="ai-card-label">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg>
          AI Alert — Berth Congestion
        </div>
        <div class="ai-card-title">${berth.name} is at ${berth.utilisation}% utilisation — immediate action recommended</div>
        <div class="ai-card-body">
          This berth has no available capacity for new vessel arrivals. Vessels currently queued for this berth
          should be redirected to <strong>Berth 07</strong> (available, 20% utilised) to reduce waiting times.
          <br><br>
          Use the <strong>Optimise Berths</strong> button on this page for the full AI re-assignment plan.
          <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">Simulation estimate — not a validated prediction.</div>
        </div>
      </div>
    `;
  } else if (berth.status === 'Available') {
    aiNote = `
      <div style="padding:12px 14px;background:rgba(63,185,80,0.08);border:1px solid rgba(63,185,80,0.2);border-radius:8px;font-size:13px;color:var(--status-low);margin-top:16px;">
        ✓ This berth is available and ready to receive vessels. Crane ${berth.cranes[0] || 'assigned'} is in standby.
      </div>
    `;
  }

  document.getElementById('berthModalTitle').textContent = `${berth.name} — ${berth.location}`;

  document.getElementById('berthModalBody').innerHTML = `

    <!-- Info grid -->
    <div class="detail-grid" style="margin-bottom:16px;">
      <div class="detail-item">
        <div class="detail-label">Berth ID</div>
        <div class="detail-val font-mono">${berth.id}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Status</div>
        <div class="detail-val">${buildBadge(berth.status)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Terminal</div>
        <div class="detail-val">${berth.location}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Utilisation</div>
        <div class="detail-val font-mono" style="color:var(--status-${utilCls});">${berth.utilisation}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Capacity</div>
        <div class="detail-val font-mono">${fmtNum(berth.capacity)} TEU</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Available At</div>
        <div class="detail-val font-mono">${formatDateTime(berth.availableAt)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Quay Length</div>
        <div class="detail-val font-mono">${berth.length} m</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Draught Depth</div>
        <div class="detail-val font-mono">${berth.depth} m</div>
      </div>
    </div>

    <!-- Util bar -->
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:11px;color:var(--text-muted);">Utilisation</span>
        <span style="font-size:11px;font-weight:700;color:var(--status-${utilCls});">${berth.utilisation}%</span>
      </div>
      <div class="berth-util-bar" style="height:8px;">
        <div class="berth-util-fill" style="width:${berth.utilisation}%;background:var(--status-${utilCls});height:8px;border-radius:4px;transition:width 0.6s ease;"></div>
      </div>
    </div>

    <hr class="divider" />

    <!-- Cranes -->
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-muted);margin-bottom:10px;">Assigned Cranes</div>
    ${craneRows || '<div style="color:var(--text-muted);font-size:12px;">No cranes assigned.</div>'}

    <hr class="divider" />

    <!-- Schedule -->
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-muted);margin-bottom:10px;">Vessel Schedule</div>
    ${scheduleRows || '<div style="color:var(--text-muted);font-size:12px;">No scheduled vessels.</div>'}

    ${aiNote}

    <div style="display:flex;gap:8px;margin-top:20px;flex-wrap:wrap;">
      <a href="vessels.html" class="btn btn-primary btn-sm">View All Vessels</a>
      <a href="cranes.html"  class="btn btn-secondary btn-sm">Crane Operations</a>
      <button class="btn btn-ghost btn-sm" data-modal-close="berthModal">Close</button>
    </div>
  `;

  openModal('berthModal');
}

// ─── AI BERTH OPTIMISATION ────────────────────────────────────────────────────

/**
 * Full optimisation dataset.
 * Each entry has:
 *   vessel, id, currentBerth, currentWait, currentRisk,
 *   newBerth, newWait, newRisk, improvement,
 *   reason (WHY the change was made),
 *   impact (quantified expected benefit)
 */
const OPTIMISATION_DATA = [
  {
    id:          'V-104',
    vessel:      'MSC Adriana',
    currentBerth:'B-03 — Congested (100%)',
    currentWait: '6.0h',
    currentRisk: 'Critical (91)',
    newBerth:    'B-07 — Available (20%)',
    newWait:     '1.2h',
    newRisk:     'Medium (42)',
    improvement: '↓ 4.8h',
    reason:      'B-03 is at 100% capacity with Crane C-06 failed. B-07 is the only Available berth with sufficient depth (16m) and Crane C-13 on standby. V-104 carries time-sensitive refrigerated cargo — delay increases cold-chain risk.',
    impact:      'Wait reduction: 4.8h · Risk score: 91 → 42 · Cold-chain cargo secured'
  },
  {
    id:          'V-112',
    vessel:      'Zim Pacific',
    currentBerth:'B-01 — Occupied (94%)',
    currentWait: '5.8h',
    currentRisk: 'Critical (86)',
    newBerth:    'B-09 — Free slot from 23:30',
    newWait:     '2.0h',
    newRisk:     'High (67)',
    improvement: '↓ 3.8h',
    reason:      'B-01 schedule is fully committed through Day 2. V-112 has waited 5.8 hours. B-09 has a confirmed free slot from 23:30 with Crane C-15 returning online at 20:00 — a viable alternative.',
    impact:      'Wait reduction: 3.8h · Risk score: 86 → 67 · Berth conflict resolved'
  },
  {
    id:          'V-121',
    vessel:      'Borchard Clementine',
    currentBerth:'B-01 — Occupied (94%)',
    currentWait: '6.2h',
    currentRisk: 'Critical (88)',
    newBerth:    'B-10 — Free slot from 13:00',
    newWait:     '1.8h',
    newRisk:     'High (65)',
    improvement: '↓ 4.4h',
    reason:      'Both V-121 and V-112 are queuing for B-01, which cannot accommodate both in the current window. B-10 has an available slot from 13:00 with Cranes C-01 and C-03 available. V-121 is low-priority cargo — reassignment is appropriate.',
    impact:      'Wait reduction: 4.4h · Risk score: 88 → 65 · B-01 queue relieved'
  },
  {
    id:          'V-109',
    vessel:      'Yang Ming Spirit',
    currentBerth:'B-08 — Occupied',
    currentWait: '4.7h',
    currentRisk: 'Critical (83)',
    newBerth:    'Delay 4h — Low Priority',
    newWait:     '0.5h',
    newRisk:     'Medium (44)',
    improvement: '↓ 4.2h',
    reason:      'V-109 carries low-priority general cargo. Delaying by 4 hours frees B-08 for V-117 (perishables, high cargo urgency) and V-118, both of which carry time-sensitive freight. This is a priority-based trade-off.',
    impact:      'Wait reduction: 4.2h effective · Risk score: 83 → 44 · B-08 freed for priority vessels'
  },
  {
    id:          'V-106',
    vessel:      'OOCL Neptune',
    currentBerth:'B-05 — Congested (97%)',
    currentWait: '3.1h',
    currentRisk: 'High (74)',
    newBerth:    'B-05 + Crane C-03 added',
    newWait:     '1.8h',
    newRisk:     'Medium (52)',
    improvement: '↓ 1.3h',
    reason:      'B-05 cannot be vacated — V-106\'s 2,100 TEU load is mid-operation. However, C-03 (idle at 8%) can be cross-deployed to increase throughput. Adding a second crane to B-05 reduces estimated turnaround by 1.3 hours.',
    impact:      'Turnaround reduction: 1.3h · Risk score: 74 → 52 · Crane utilisation improved'
  }
];

function runBerthOptimisation() {
  const panel     = document.getElementById('optimisePanel');
  const innerEl   = document.getElementById('optimisePanelInner');
  const btn       = document.getElementById('optimiseBerthsBtn');
  if (!panel || !innerEl) return;

  // Show panel with loading state
  panel.classList.add('visible');
  innerEl.innerHTML = `
    <div style="text-align:center;padding:36px 0;">
      <div class="spinner" style="margin:0 auto 14px;"></div>
      <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">AI Analysing Berth Assignments…</div>
      <div style="font-size:12px;color:var(--text-secondary);">
        Evaluating vessel ETA windows, cargo priority, crane availability, and berth capacity constraints.
      </div>
    </div>
  `;

  // Disable button during analysis
  if (btn) { btn.disabled = true; btn.textContent = 'Analysing…'; }

  // Scroll panel into view
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  setTimeout(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg>
        Re-run Optimisation
      `;
    }
    optimiseHasRun = true;
    renderOptimisationResult();
    showToast(
      'AI Optimisation Complete',
      'Berth re-assignment plan generated. Average wait reduced by 3.7 hours across 5 critical vessels.',
      'success',
      5000
    );
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 1500);
}

function renderOptimisationResult() {
  const innerEl = document.getElementById('optimisePanelInner');
  if (!innerEl) return;

  // ── Header ──────────────────────────────────────────────────────────────────
  const headerHTML = `
    <div class="optimise-header">
      <div>
        <div class="ai-card-label" style="margin-bottom:8px;">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg>
          AI Berth Optimisation — Simulation Result
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--text-primary);">
          Berth Re-assignment Plan
        </div>
        <div class="optimise-meta">
          <div class="optimise-meta-item">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 4v4H6V5h3zm0 5v2H6v-2h3z"/></svg>
            <strong>Basis:</strong> Vessel ETA, cargo priority, berth capacity, crane availability
          </div>
          <div class="optimise-meta-item">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3l2 2"/></svg>
            <strong>Vessels analysed:</strong> 5 critical / high-risk
          </div>
          <div class="optimise-meta-item" style="color:var(--text-muted);">Simulation estimate · Requires operator approval</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('optimisePanel').classList.remove('visible')">✕ Close</button>
    </div>
  `;

  // ── Compare grid (current vs AI) ────────────────────────────────────────────
  const currentRows = OPTIMISATION_DATA.map(r => `
    <div class="vessel-compare-row">
      <div class="vcr-top">
        <span class="vcr-name">${r.id} ${r.vessel}</span>
        <span class="badge ${getRiskClass(parseInt(r.currentRisk))}" style="font-size:10px;">${r.currentRisk}</span>
      </div>
      <div class="vcr-berth">📍 ${r.currentBerth}</div>
      <div class="vcr-wait" style="color:var(--status-high);">⏱ ${r.currentWait} waiting</div>
    </div>
  `).join('');

  const optimisedRows = OPTIMISATION_DATA.map(r => `
    <div class="vessel-compare-row">
      <div class="vcr-top">
        <span class="vcr-name">${r.id} ${r.vessel}</span>
        <span style="font-size:11px;font-weight:700;color:var(--status-low);">${r.improvement}</span>
      </div>
      <div class="vcr-berth">✅ ${r.newBerth}</div>
      <div class="vcr-wait" style="color:var(--status-low);">⏱ ${r.newWait} → ${buildBadge(r.newRisk.includes('Critical') ? 'Critical' : r.newRisk.includes('High') ? 'Delayed' : 'On Time')}</div>
      <div class="vcr-reason">${r.reason}</div>
    </div>
  `).join('');

  const compareHTML = `
    <div class="compare-grid">
      <div class="compare-col">
        <div class="compare-col-header">
          <span class="compare-col-title">📋 Current Plan</span>
          <span class="compare-col-avg" style="color:var(--status-critical);">Avg wait: 5.2h</span>
        </div>
        ${currentRows}
      </div>
      <div class="compare-col optimised">
        <div class="compare-col-header">
          <span class="compare-col-title ai">🤖 AI Optimised Plan</span>
          <span class="compare-col-avg" style="color:var(--status-low);">Avg wait: 1.5h</span>
        </div>
        ${optimisedRows}
      </div>
    </div>
  `;

  // ── Impact banner ────────────────────────────────────────────────────────────
  const impactHTML = `
    <div class="impact-banner">
      <div class="impact-banner-row">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" style="color:var(--accent-cyan);flex-shrink:0;margin-top:2px;">
          <circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/>
        </svg>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;color:var(--accent-cyan);margin-bottom:4px;">AI Estimated Impact — Simulation Summary</div>
          <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">
            Re-assigning 5 critical vessels using available berth capacity and idle crane resources
            reduces the average waiting time by <strong style="color:var(--text-primary);">3.7 hours</strong>
            and brings 3 vessels from Critical to Medium/High risk status.
          </div>
          <div class="impact-stats">
            <div class="impact-stat">
              <div class="is-val">3.7h</div>
              <div class="is-label">Avg wait reduction</div>
            </div>
            <div class="impact-stat">
              <div class="is-val">5 → 2</div>
              <div class="is-label">Critical vessels</div>
            </div>
            <div class="impact-stat">
              <div class="is-val">5.2 → 1.5h</div>
              <div class="is-label">Avg wait time</div>
            </div>
            <div class="impact-stat">
              <div class="is-val">B-07</div>
              <div class="is-label">Key available berth</div>
            </div>
            <div class="impact-stat">
              <div class="is-val">C-03</div>
              <div class="is-label">Key idle crane</div>
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:12px;">
            ⚠ Simulation estimate based on demo data. All values are approximations.
            This plan requires port operator review and approval before implementation.
          </div>
        </div>
      </div>
    </div>
  `;

  // ── Action buttons ────────────────────────────────────────────────────────────
  const actionsHTML = `
    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
      <a href="vessels.html"  class="btn btn-primary btn-sm">View Vessel Risk Details</a>
      <a href="cranes.html"   class="btn btn-secondary btn-sm">Crane Assignments</a>
      <a href="copilot.html"  class="btn btn-ai btn-sm">Ask AI Copilot</a>
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('optimisePanel').classList.remove('visible')">Close Panel</button>
    </div>
  `;

  innerEl.innerHTML = headerHTML + compareHTML + impactHTML + actionsHTML;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBerthStats();
  renderTimeAxis();
  renderBerthTimeline();
  renderBerthCards();

  // Optimise Berths button
  const optimiseBtn = document.getElementById('optimiseBerthsBtn');
  if (optimiseBtn) {
    optimiseBtn.addEventListener('click', runBerthOptimisation);
  }

  // Status filter dropdown
  const filterSel = document.getElementById('berthStatusFilter');
  if (filterSel) {
    filterSel.addEventListener('change', () => {
      berthStatusFilter = filterSel.value;
      renderBerthCards();
    });
  }

  // Welcome toast on page load
  setTimeout(() => {
    const congested = getBerths().filter(b => b.status === 'Congested').length;
    if (congested > 0) {
      showToast(
        `${congested} berths are congested`,
        'B-03 (100%) and B-05 (97%) are at capacity. Click "Optimise Berths" for the AI re-assignment plan.',
        'warning',
        6000
      );
    }
  }, 700);
});
