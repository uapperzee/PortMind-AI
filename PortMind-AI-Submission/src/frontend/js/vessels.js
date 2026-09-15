/**
 * PortMind AI — Vessel Operations
 * vessels.js
 *
 * Features:
 *  - Live search across ID, name, flag, berth, cargo, route
 *  - Status filter chips (All / Critical / Delayed / Waiting / Approaching / On Time)
 *  - Risk level dropdown (Critical / High / Medium / Low)
 *  - Vessel type dropdown (Container / Bulk / Ro-Ro / Reefer)
 *  - Column sort (click any sortable header, toggle asc/desc)
 *  - Clear All Filters button
 *  - Clickable stat cards to filter by status
 *  - Row click + "View AI Analysis" button → full detail modal
 *  - Modal: vessel info, ETA/ETD, cargo, route, AI risk score with factor pills, AI recommendation
 */

// ─── STATE ────────────────────────────────────────────────────────────────────
let sortCol      = 'riskScore';
let sortDir      = 'desc';
let activeStatus = 'All';
let searchQuery  = '';
let riskFilter   = '';
let cargoFilter  = '';

// ─── VESSEL-SPECIFIC AI RECOMMENDATIONS ──────────────────────────────────────
/**
 * Returns a tailored AI recommendation object { action, reason, impact, confidence }
 * for a given vessel. Falls back to score-band logic for vessels without specific entries.
 */
function getVesselRecommendation(vessel) {
  // Per-vessel overrides for the demo scenario
  const specific = {
    'V-104': {
      action:     'Reassign MSC Adriana to Berth 07 immediately and allocate Crane C-03.',
      reason:     'Berth 03 is congested at 100% utilisation and Crane C-06 has failed due to a hydraulic fault. ' +
                  'Berth 07 is currently Available (20%) and Crane C-03 is idle at 8% — the optimal slot. ' +
                  'V-104 carries time-sensitive refrigerated cargo that cannot tolerate further delay.',
      impact:     'Estimated waiting time reduction: 4.8 hours. Cold-chain cargo protected.',
      confidence: 'Moderate — simulation estimate'
    },
    'V-121': {
      action:     'Reassign Borchard Clementine to Berth 10 (free slot after 13:00).',
      reason:     'V-121 has been waiting 6.2 hours at B-01, which remains congested. ' +
                  'B-10 has a confirmed slot from 13:00 with crane support available.',
      impact:     'Estimated wait reduction: 4.4 hours.',
      confidence: 'Moderate — simulation estimate'
    },
    'V-112': {
      action:     'Redirect Zim Pacific to Berth 09 (free slot available).',
      reason:     'V-112 has waited 5.8 hours. B-01 schedule is full through the evening. ' +
                  'B-09 has a slot available and crane C-15 returns online tonight.',
      impact:     'Estimated wait reduction: 3.8 hours.',
      confidence: 'Moderate — simulation estimate'
    },
    'V-109': {
      action:     'Delay Yang Ming Spirit by 4 hours (low-priority general cargo).',
      reason:     'V-109 carries low-priority general cargo. Delaying departure frees berth ' +
                  'capacity at B-08 for higher-priority refrigerated and hazmat vessels.',
      impact:     'Estimated risk score reduction from 83 to ~44. Frees B-08 capacity.',
      confidence: 'High — simulation estimate'
    },
    'V-106': {
      action:     'Add Crane C-03 to Berth 05 to increase throughput for OOCL Neptune.',
      reason:     'B-05 is at 97% utilisation. Single crane is insufficient for V-106\'s ' +
                  '2,100 TEU load. C-03 is idle at 8% and can be redeployed within 30 minutes.',
      impact:     'Estimated turnaround time reduction: 1.3 hours.',
      confidence: 'Moderate — simulation estimate'
    }
  };

  if (specific[vessel.id]) return specific[vessel.id];

  // Score-band fallback
  if (vessel.riskScore >= 81) {
    return {
      action:     `Immediate action required — consider reassigning ${vessel.name} to an available berth.`,
      reason:     vessel.riskFactors.length > 0
                    ? `Primary risk driver: ${getRiskFactorLabel(vessel.riskFactors[0])}.`
                    : 'Multiple congestion factors are contributing to this critical score.',
      impact:     'Estimated wait reduction: 3–5 hours if acted within 1 hour.',
      confidence: 'Moderate — simulation estimate'
    };
  }
  if (vessel.riskScore >= 61) {
    return {
      action:     `Monitor closely. Pre-assign a crane at ${vessel.assignedBerth} and alert yard team.`,
      reason:     `Risk factors: ${vessel.riskFactors.map(f => getRiskFactorLabel(f)).join('; ') || 'elevated arrival pressure'}.`,
      impact:     'Estimated delay reduction: 1.5–2 hours if acted within the next 2 hours.',
      confidence: 'Low-to-moderate — simulation estimate'
    };
  }
  if (vessel.riskScore >= 31) {
    return {
      action:     'Routine operations. Confirm berth availability as ETA approaches.',
      reason:     'Minor risk factors present but no immediate intervention required.',
      impact:     'No significant impact expected under current conditions.',
      confidence: 'High — simulation estimate'
    };
  }
  return {
    action:     'No action required — vessel is on schedule.',
    reason:     'All operational parameters are within normal limits.',
    impact:     'Vessel is operating normally with no congestion risk.',
    confidence: 'High — simulation estimate'
  };
}

// ─── RENDER STATS STRIP ───────────────────────────────────────────────────────
function renderVesselStats() {
  const row = document.getElementById('vesselStatsRow');
  if (!row) return;

  const v        = getVessels();
  const total    = v.length;
  const critical = v.filter(x => x.status === 'Critical').length;
  const delayed  = v.filter(x => x.status === 'Delayed').length;
  const waitApp  = v.filter(x => x.status === 'Waiting' || x.status === 'Approaching').length;
  const onTime   = v.filter(x => x.status === 'On Time').length;

  // Build cards — each card filters when clicked
  const cards = [
    { val: total,    label: 'Total Vessels',        color: 'var(--text-primary)', status: 'All' },
    { val: critical, label: 'Critical',             color: 'var(--status-critical)', status: 'Critical' },
    { val: delayed,  label: 'Delayed',              color: 'var(--status-high)',     status: 'Delayed' },
    { val: waitApp,  label: 'Waiting / Approaching', color: 'var(--status-medium)',  status: 'Waiting' },
    { val: onTime,   label: 'On Time',              color: 'var(--status-low)',      status: 'On Time' }
  ];

  row.innerHTML = cards.map(c => `
    <div class="stat-mini" onclick="filterByStatus('${c.status}')" title="Click to filter by: ${c.label}">
      <div class="sm-val" style="color:${c.color};">${c.val}</div>
      <div class="sm-label">${c.label}</div>
    </div>
  `).join('');
}

/** Filter by status from a stat card click */
function filterByStatus(status) {
  activeStatus = status;
  // Sync chip state
  document.querySelectorAll('.filter-chip[data-status]').forEach(c => {
    c.classList.toggle('active', c.dataset.status === status);
  });
  renderVesselTable();
  showToast('Filter applied', `Showing vessels with status: ${status}`, 'info', 2500);
}

// ─── GET FILTERED + SORTED VESSEL LIST ───────────────────────────────────────
function getFilteredVessels() {
  let vessels = getVessels();

  // Status filter
  if (activeStatus !== 'All') {
    // "Waiting" stat card should show both Waiting AND Approaching
    if (activeStatus === 'Waiting') {
      vessels = vessels.filter(v => v.status === 'Waiting' || v.status === 'Approaching');
    } else {
      vessels = vessels.filter(v => v.status === activeStatus);
    }
  }

  // Search (ID, name, flag, cargo, berth, route)
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    vessels = vessels.filter(v =>
      v.id.toLowerCase().includes(q)           ||
      v.name.toLowerCase().includes(q)         ||
      v.flag.toLowerCase().includes(q)         ||
      v.cargo.toLowerCase().includes(q)        ||
      v.type.toLowerCase().includes(q)         ||
      v.assignedBerth.toLowerCase().includes(q)||
      (v.route && v.route.toLowerCase().includes(q))
    );
  }

  // Risk level filter
  if (riskFilter) {
    vessels = vessels.filter(v => getRiskClass(v.riskScore) === riskFilter);
  }

  // Vessel type filter
  if (cargoFilter) {
    vessels = vessels.filter(v => v.type === cargoFilter);
  }

  // Sort
  vessels = [...vessels].sort((a, b) => {
    let va = a[sortCol];
    let vb = b[sortCol];

    // Nulls to bottom
    if (va == null) return 1;
    if (vb == null) return -1;

    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();

    if (va < vb) return sortDir === 'asc' ? -1 :  1;
    if (va > vb) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  return vessels;
}

// ─── RENDER TABLE ─────────────────────────────────────────────────────────────
function renderVesselTable() {
  const tbody    = document.getElementById('vesselTableBody');
  const countEl  = document.getElementById('vesselCount');
  const emptyEl  = document.getElementById('emptyState');
  if (!tbody) return;

  const vessels = getFilteredVessels();
  const total   = getVessels().length;

  if (countEl) {
    countEl.textContent = vessels.length === total
      ? `Showing all ${total} vessels`
      : `Showing ${vessels.length} of ${total} vessels`;
  }

  // Empty state
  const hasResults = vessels.length > 0;
  tbody.style.display = hasResults ? '' : 'none';
  if (emptyEl) emptyEl.style.display = hasResults ? 'none' : 'block';

  if (!hasResults) return;

  tbody.innerHTML = vessels.map(v => {
    const rCls = getRiskClass(v.riskScore);

    // Wait time colouring
    let waitCls  = '';
    let waitText = v.waitingTime > 0 ? v.waitingTime + 'h' : '—';
    if (v.waitingTime >= 5)      waitCls = 'wait-critical';
    else if (v.waitingTime >= 3) waitCls = 'wait-elevated';

    // Highlight critical rows with a subtle left border via inline style
    const rowStyle = v.riskScore >= 81
      ? 'border-left:3px solid var(--status-critical);'
      : v.riskScore >= 61
        ? 'border-left:3px solid var(--status-high);'
        : '';

    return `
      <tr onclick="openVesselDetail('${v.id}')" style="cursor:pointer;${rowStyle}" title="Click to open ${v.name}">
        <td class="td-mono" style="font-size:12px;">${v.id}</td>
        <td>
          <div class="td-vessel-name">${v.name}</div>
          <div class="td-flag">${v.flag} · ${v.type}</div>
        </td>
        <td class="hide-mobile">
          <div class="td-mono" style="font-size:12px;">${formatTime(v.eta)}</div>
          <div class="td-etd">ETD ${formatTime(v.etd)}</div>
        </td>
        <td class="hide-mobile" style="font-size:12px;color:var(--text-secondary);">${v.cargo}</td>
        <td class="td-mono hide-mobile" style="font-size:12px;">${v.containers > 0 ? fmtNum(v.containers) : '—'}</td>
        <td class="hide-sm"><span class="tag">${v.assignedBerth}</span></td>
        <td class="hide-sm">
          <span class="td-mono ${waitCls}" style="font-size:12px;">${waitText}</span>
        </td>
        <td>
          <div class="risk-bar-wrap" style="min-width:90px;">
            <div class="risk-bar">
              <div class="risk-bar-fill ${rCls}" style="width:${v.riskScore}%"></div>
            </div>
            <span class="risk-score-num ${rCls}">${v.riskScore}</span>
          </div>
        </td>
        <td>${buildBadge(v.status)}</td>
        <td>
          <button
            class="btn btn-secondary btn-sm"
            onclick="event.stopPropagation(); openVesselDetail('${v.id}')"
            aria-label="View AI analysis for ${v.name}"
          >
            View AI Analysis
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Update sort indicator icons in header
  document.querySelectorAll('#vesselTable thead th[data-col]').forEach(th => {
    const icon = th.querySelector('.sort-icon');
    if (!icon) return;
    if (th.dataset.col === sortCol) {
      icon.textContent = sortDir === 'asc' ? ' ↑' : ' ↓';
      th.classList.add('sorted');
    } else {
      icon.textContent = '';
      th.classList.remove('sorted');
    }
  });
}

// ─── VESSEL DETAIL MODAL ──────────────────────────────────────────────────────
function openVesselDetail(vesselId) {
  const vessel = getVesselById(vesselId);
  if (!vessel) return;

  const riskCls = getRiskClass(vessel.riskScore);
  const rec     = getVesselRecommendation(vessel);

  // Build risk factor pills
  const factorPills = vessel.riskFactors.length > 0
    ? vessel.riskFactors.map(f => `
        <div class="risk-factor-pill">${getRiskFactorLabel(f)}</div>
      `).join('')
    : `<div style="padding:10px 12px;background:rgba(63,185,80,0.08);border:1px solid rgba(63,185,80,0.2);border-radius:7px;font-size:12px;color:var(--status-low);">
        ✓ No significant risk factors identified for this vessel.
       </div>`;

  // Berth context
  const berth    = getBerthById(vessel.assignedBerth);
  const berthCtx = berth
    ? `${vessel.assignedBerth} — ${berth.status} (${berth.utilisation}% utilised)`
    : vessel.assignedBerth;

  // Modal title
  document.getElementById('vesselModalTitle').textContent =
    `${vessel.name} · ${vessel.id}`;

  document.getElementById('vesselModalBody').innerHTML = `

    <!-- ── SECTION 1: Vessel Info ── -->
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-muted);margin-bottom:12px;">Vessel Information</div>

      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Vessel ID</div>
          <div class="detail-val font-mono">${vessel.id}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Current Status</div>
          <div class="detail-val">${buildBadge(vessel.status)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Vessel Name</div>
          <div class="detail-val" style="font-weight:600;">${vessel.name}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Type / Registry</div>
          <div class="detail-val">${vessel.type} · ${vessel.flag}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">ETA (Estimated Arrival)</div>
          <div class="detail-val font-mono">${formatDateTime(vessel.eta)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">ETD (Estimated Departure)</div>
          <div class="detail-val font-mono">${formatDateTime(vessel.etd)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Cargo Type</div>
          <div class="detail-val">${vessel.cargo}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Container Load</div>
          <div class="detail-val font-mono">
            ${vessel.containers > 0 ? fmtNum(vessel.containers) + ' TEU' : 'N/A — Bulk / Ro-Ro'}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Assigned Berth</div>
          <div class="detail-val">${berthCtx}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Current Waiting Time</div>
          <div class="detail-val font-mono" style="color:${vessel.waitingTime >= 5 ? 'var(--status-critical)' : vessel.waitingTime >= 3 ? 'var(--status-high)' : 'inherit'};">
            ${vessel.waitingTime > 0 ? vessel.waitingTime + ' hours' : 'None (not waiting)'}
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Cargo Priority</div>
          <div class="detail-val">${vessel.priority}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Gross Tonnage</div>
          <div class="detail-val font-mono">${fmtNum(vessel.grossTonnage)} GT · ${vessel.length}m</div>
        </div>
      </div>

      <div style="margin-top:12px;">
        <div class="detail-label" style="margin-bottom:4px;">Route</div>
        <div style="padding:9px 12px;background:var(--bg-elevated);border-radius:7px;font-size:12px;color:var(--text-secondary);border:1px solid var(--border);">
          ${vessel.route}
        </div>
      </div>
    </div>

    <hr class="divider" />

    <!-- ── SECTION 2: AI Risk Score ── -->
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-muted);margin-bottom:12px;">
        AI-Assisted Operational Risk Score
      </div>

      <!-- Score display -->
      <div style="display:flex;align-items:center;gap:16px;padding:16px 18px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;margin-bottom:14px;">
        <div style="text-align:center;min-width:64px;">
          <div style="font-size:44px;font-weight:800;font-family:var(--font-mono);color:var(--status-${riskCls});line-height:1;">${vessel.riskScore}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">out of 100</div>
        </div>
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="badge ${riskCls}" style="font-size:12px;padding:4px 10px;">${riskCls.toUpperCase()} RISK</span>
            <span style="font-size:11px;color:var(--text-muted);">AI-assisted operational estimate</span>
          </div>
          <div class="risk-bar" style="height:10px;">
            <div class="risk-bar-fill ${riskCls}" style="width:${vessel.riskScore}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px;">
            <span style="font-size:10px;color:var(--text-muted);">0 — No risk</span>
            <span style="font-size:10px;color:var(--text-muted);">100 — Maximum risk</span>
          </div>
        </div>
      </div>

      <!-- Risk factor breakdown -->
      <div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;">
        ${vessel.riskFactors.length > 0 ? 'Why this score? Contributing risk factors:' : 'Risk factor analysis:'}
      </div>
      ${factorPills}

      <div style="margin-top:8px;font-size:11px;color:var(--text-muted);font-style:italic;">
        Risk score is an AI-assisted simulation estimate based on: berth utilisation, crane availability,
        arrival volume, yard pressure, waiting time, and active disruptions.
        It is not a scientifically validated prediction model.
      </div>
    </div>

    <hr class="divider" />

    <!-- ── SECTION 3: AI Recommendation ── -->
    <div class="ai-card" style="margin-bottom:20px;">
      <div class="ai-card-label">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="8" r="2"/>
          <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/>
        </svg>
        AI Recommendation — ${vessel.name}
      </div>
      <div class="ai-card-title">${rec.action}</div>
      <div class="ai-card-body">
        <div style="margin-bottom:10px;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Reason</span>
          <div style="margin-top:4px;color:var(--text-secondary);font-size:13px;">${rec.reason}</div>
        </div>
        <div style="margin-bottom:10px;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Expected Impact</span>
          <div style="margin-top:4px;color:var(--status-low);font-size:13px;font-weight:600;">${rec.impact}</div>
        </div>
        <div class="metric-row">
          <span class="metric-key">Confidence</span>
          <span class="metric-val" style="font-size:12px;">${rec.confidence}</span>
        </div>
      </div>
    </div>

    <!-- ── Action buttons ── -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:4px;">
      <a href="berths.html"     class="btn btn-primary btn-sm">Open Berth Management</a>
      <a href="cranes.html"     class="btn btn-secondary btn-sm">Crane Operations</a>
      <a href="copilot.html?q=${encodeURIComponent('Why is ' + vessel.id + ' high risk?')}" class="btn btn-ai btn-sm">Ask AI Copilot</a>
      <button class="btn btn-ghost btn-sm" data-modal-close="vesselModal">Close</button>
    </div>
  `;

  openModal('vesselModal');
}

// ─── CLEAR ALL FILTERS ────────────────────────────────────────────────────────
function clearAllFilters() {
  activeStatus = 'All';
  searchQuery  = '';
  riskFilter   = '';
  cargoFilter  = '';
  sortCol      = 'riskScore';
  sortDir      = 'desc';

  // Reset UI controls
  const searchInput = document.getElementById('vesselSearch');
  const riskSel     = document.getElementById('riskFilter');
  const cargoSel    = document.getElementById('cargoFilter');

  if (searchInput) searchInput.value = '';
  if (riskSel)     riskSel.value     = '';
  if (cargoSel)    cargoSel.value    = '';

  // Reset status chips
  document.querySelectorAll('.filter-chip[data-status]').forEach(c => {
    c.classList.toggle('active', c.dataset.status === 'All');
  });

  renderVesselTable();
  showToast('Filters cleared', 'Showing all 30 vessels, sorted by risk score.', 'info', 2500);
}

// ─── EVENT WIRING ─────────────────────────────────────────────────────────────
function initVesselPage() {

  // ── Search ──────────────────────────────────────────────────────────────────
  const searchInput = document.getElementById('vesselSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      renderVesselTable();
    });
    // Clear on Escape
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchQuery = '';
        renderVesselTable();
      }
    });
  }

  // ── Status filter chips ──────────────────────────────────────────────────────
  document.querySelectorAll('.filter-chip[data-status]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip[data-status]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeStatus = chip.dataset.status;
      renderVesselTable();
    });
  });

  // ── Risk level filter ────────────────────────────────────────────────────────
  const riskSel = document.getElementById('riskFilter');
  if (riskSel) {
    riskSel.addEventListener('change', () => {
      riskFilter = riskSel.value;
      renderVesselTable();
    });
  }

  // ── Vessel type filter ───────────────────────────────────────────────────────
  const cargoSel = document.getElementById('cargoFilter');
  if (cargoSel) {
    cargoSel.addEventListener('change', () => {
      cargoFilter = cargoSel.value;
      renderVesselTable();
    });
  }

  // ── Clear filters button ─────────────────────────────────────────────────────
  const clearBtn = document.getElementById('clearFiltersBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllFilters);
  }

  // ── Column sort ──────────────────────────────────────────────────────────────
  document.querySelectorAll('#vesselTable thead th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortCol = col;
        // Default direction: numeric fields desc, string fields asc
        sortDir = (col === 'riskScore' || col === 'waitingTime' || col === 'containers') ? 'desc' : 'asc';
      }
      renderVesselTable();
    });
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderVesselStats();
  renderVesselTable();
  initVesselPage();

  // Welcome toast on first load
  setTimeout(() => {
    const critical = getVessels().filter(v => v.status === 'Critical').length;
    if (critical > 0) {
      showToast(
        `${critical} Critical vessels require attention`,
        'V-104 (91%), V-121 (88%), V-112 (86%), V-109 (83%). Click any row to view AI analysis.',
        'error',
        6000
      );
    }
  }, 600);
});
