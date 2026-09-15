/**
 * PortMind AI — Crane Operations
 * cranes.js
 */

let craneFilter = '';

const CRANE_AI_RECS = [
  { id:'rec-1', action:'Reassign Crane C-03 to Berth 03', reason:'C-03 is idle at only 8% utilisation. C-06 has failed at Berth 03. Reassigning C-03 will restore full crane capacity and reduce V-104 estimated wait by 3.2 hours.', impact:'Est. wait reduction: 3.2h for V-104', confidence:'Moderate', cta:'cranes.html' },
  { id:'rec-2', action:'Immediate inspection of Crane C-06', reason:'C-06 is operating at 102% of rated capacity — overloaded. Hydraulic failure risk is imminent. Operations at Berth 03 are at risk of a complete crane shutdown.', impact:'Prevents potential full shutdown at B-03', confidence:'High', cta:'disruptions.html' },
  { id:'rec-3', action:'Schedule Crane C-04 back online by EOD', reason:'C-04 maintenance is due today. Berth 02 is currently operating at 50% crane capacity. V-102 and V-113 are both affected by the single-crane constraint.', impact:'Restores B-02 to full capacity', confidence:'High', cta:'berths.html' }
];

function renderCraneAIRecs() {
  const container = document.getElementById('craneAiRecs');
  if (!container) return;
  container.innerHTML = CRANE_AI_RECS.map(r => `
    <div class="ai-card">
      <div class="ai-card-label">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg>
        AI Recommendation
      </div>
      <div class="ai-card-title">${r.action}</div>
      <div class="ai-card-body">
        <p style="margin-bottom:8px;">${r.reason}</p>
        <div class="metric-row"><span class="metric-key">Expected Impact</span><span class="metric-val" style="color:var(--status-low);font-size:12px;">${r.impact}</span></div>
        <div class="metric-row"><span class="metric-key">Confidence</span><span class="metric-val" style="font-size:12px;">${r.confidence}</span></div>
        <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">Simulation estimate — requires operator approval.</div>
      </div>
    </div>
  `).join('');
}

function renderCraneStatsStrip() {
  const el = document.getElementById('craneStatsStrip');
  if (!el) return;
  const all     = getCranes();
  const active  = all.filter(c => c.status === 'Active').length;
  const idle    = all.filter(c => c.status === 'Idle').length;
  const maint   = all.filter(c => c.status === 'Maintenance').length;
  const overloaded = all.filter(c => c.status === 'Overloaded').length;
  const avgUtil = Math.round(all.reduce((s, c) => s + Math.min(100, c.utilisation), 0) / all.length);
  const avgCls    = utilisationClass(avgUtil);

  el.innerHTML = `
    <div class="crane-stat-card">
      <div class="crane-stat-num">${all.length}</div>
      <div class="crane-stat-label">Total Cranes</div>
    </div>
    <div class="crane-stat-card">
      <div class="crane-stat-num" style="color:var(--status-low);">${active}</div>
      <div class="crane-stat-label">Active</div>
    </div>
    <div class="crane-stat-card">
      <div class="crane-stat-num" style="color:var(--status-idle);">${idle}</div>
      <div class="crane-stat-label">Idle</div>
    </div>
    <div class="crane-stat-card">
      <div class="crane-stat-num" style="color:var(--status-warning);">${maint}</div>
      <div class="crane-stat-label">Maintenance</div>
    </div>
    <div class="crane-stat-card">
      <div class="crane-stat-num" style="color:var(--status-critical);">${overloaded}</div>
      <div class="crane-stat-label">Overloaded</div>
    </div>
    <div class="crane-stat-card">
      <div class="crane-stat-num" style="color:var(--status-${avgCls});">${avgUtil}%</div>
      <div class="crane-stat-label">Avg Utilisation</div>
    </div>
  `;
}

function renderCraneGrid() {
  const grid  = document.getElementById('craneGrid');
  const label = document.getElementById('craneCountLabel');
  if (!grid) return;

  let cranes = getCranes();
  if (craneFilter) cranes = cranes.filter(c => c.status === craneFilter);

  if (label) label.textContent = `${cranes.length} crane${cranes.length !== 1 ? 's' : ''} shown`;

  if (!cranes.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No cranes match the current filter.</div>`;
    return;
  }

  grid.innerHTML = cranes.map(c => {
    const stsCls  = getStatusClass(c.status).toLowerCase();
    const utilCls = utilisationClass(Math.min(100, c.utilisation));
    const vessel  = c.currentVessel ? getVesselById(c.currentVessel) : null;
    const canReassign = c.status === 'Idle' || c.status === 'Active';

    return `
      <div class="crane-card ${stsCls}" onclick="openCraneDetail('${c.id}')">
        <div class="crane-top">
          <div>
            <div class="crane-id">${c.id}</div>
            <div class="crane-type">${c.type}</div>
          </div>
          ${buildBadge(c.status)}
        </div>
        <div class="crane-util-row">
          <div class="crane-util-num" style="color:var(--status-${utilCls});">${c.utilisation}%</div>
          <div style="flex:1;">
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:3px;">Utilisation</div>
            <div class="risk-bar"><div class="risk-bar-fill ${utilCls}" style="width:${Math.min(100,c.utilisation)}%"></div></div>
          </div>
        </div>
        <div class="metric-row"><span class="metric-key">Location</span><span class="metric-val">${c.location}</span></div>
        <div class="metric-row"><span class="metric-key">Current Vessel</span><span class="metric-val">${vessel ? vessel.name : '—'}</span></div>
        <div class="metric-row"><span class="metric-key">Capacity</span><span class="metric-val">${c.capacity} moves/h</span></div>
        <div class="metric-row"><span class="metric-key">Lifts/Hour</span><span class="metric-val">${c.liftsPerHour > 0 ? c.liftsPerHour : 'Offline'}</span></div>
        <div style="margin-top:10px;font-size:11px;color:var(--text-muted);border-top:1px solid var(--border);padding-top:8px;">${c.notes}</div>
        ${canReassign ? `<button class="btn btn-secondary btn-sm w-full" style="margin-top:10px;" onclick="event.stopPropagation();reassignCrane('${c.id}')">Reassign Crane</button>` : `<button class="btn btn-ghost btn-sm w-full" style="margin-top:10px;opacity:0.5;" disabled>${c.status === 'Maintenance' ? 'In Maintenance' : 'Overloaded — See Reco'}</button>`}
      </div>
    `;
  }).join('');
}

function openCraneDetail(craneId) {
  const crane = getCraneById(craneId);
  if (!crane) return;

  document.getElementById('craneModalTitle').textContent = `${crane.name} — ${crane.id}`;

  const stsCls  = getStatusClass(crane.status);
  const utilCls = utilisationClass(Math.min(100, crane.utilisation));
  const vessel  = crane.currentVessel ? getVesselById(crane.currentVessel) : null;

  let aiRec = '';
  if (crane.id === 'C-03') {
    aiRec = `<div class="ai-card" style="margin-top:14px;"><div class="ai-card-label">AI Recommendation</div><div class="ai-card-title">Reassign C-03 to Berth 03</div><div class="ai-card-body">C-03 is idle at 8% utilisation while C-06 has failed at Berth 03. Reassignment will restore Berth 03 to full crane capacity and reduce V-104 waiting time by an estimated 3.2 hours.<br><small style="color:var(--text-muted);">Simulation estimate.</small></div></div>`;
  } else if (crane.id === 'C-06') {
    aiRec = `<div class="ai-card" style="margin-top:14px;"><div class="ai-card-label">AI Alert</div><div class="ai-card-title">C-06 is overloaded — immediate inspection required</div><div class="ai-card-body">Crane C-06 is at 102% of rated capacity. Hydraulic failure has occurred. Berth 03 is at 50% crane capacity. Maintenance team is on-site.<br><small style="color:var(--text-muted);">Simulation estimate.</small></div></div>`;
  } else if (crane.status === 'Idle') {
    aiRec = `<div class="ai-card" style="margin-top:14px;"><div class="ai-card-label">AI Note</div><div class="ai-card-title">${crane.id} is available for deployment</div><div class="ai-card-body">This crane is idle and available for reassignment. Consider deploying to a high-utilisation berth.<br><small style="color:var(--text-muted);">Simulation estimate.</small></div></div>`;
  }

  document.getElementById('craneModalBody').innerHTML = `
    <div class="detail-grid" style="margin-bottom:16px;">
      <div class="detail-item"><div class="detail-label">Crane ID</div><div class="detail-val font-mono">${crane.id}</div></div>
      <div class="detail-item"><div class="detail-label">Status</div><div class="detail-val">${buildBadge(crane.status)}</div></div>
      <div class="detail-item"><div class="detail-label">Type</div><div class="detail-val">${crane.type}</div></div>
      <div class="detail-item"><div class="detail-label">Location</div><div class="detail-val">${crane.location}</div></div>
      <div class="detail-item"><div class="detail-label">Utilisation</div><div class="detail-val font-mono" style="color:var(--status-${utilCls});">${crane.utilisation}%</div></div>
      <div class="detail-item"><div class="detail-label">Rated Capacity</div><div class="detail-val font-mono">${crane.capacity} moves/h</div></div>
      <div class="detail-item"><div class="detail-label">Current Lifts/h</div><div class="detail-val font-mono">${crane.liftsPerHour > 0 ? crane.liftsPerHour : 'Offline'}</div></div>
      <div class="detail-item"><div class="detail-label">Current Vessel</div><div class="detail-val">${vessel ? vessel.name : '—'}</div></div>
      <div class="detail-item"><div class="detail-label">Maintenance Due</div><div class="detail-val font-mono">${crane.maintenanceDue}</div></div>
    </div>
    <div style="padding:10px;background:var(--bg-elevated);border-radius:8px;font-size:12px;color:var(--text-secondary);margin-bottom:12px;">${crane.notes}</div>
    ${buildRiskBar(Math.min(100, crane.utilisation))}
    ${aiRec}
    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
      ${crane.status === 'Idle' || crane.status === 'Active' ? `<button class="btn btn-primary btn-sm" onclick="reassignCrane('${crane.id}');closeModal('craneModal')">Reassign Crane</button>` : ''}
      <button class="btn btn-ghost btn-sm" data-modal-close="craneModal">Close</button>
    </div>
  `;

  openModal('craneModal');
}

function reassignCrane(craneId) {
  const crane = getCraneById(craneId);
  if (!crane) return;
  showToast(
    `Crane ${craneId} reassignment requested`,
    `Reassignment of ${crane.name} has been submitted for operator approval. Estimated processing time: 15 minutes.`,
    'info',
    5000
  );
}

document.addEventListener('DOMContentLoaded', () => {
  renderCraneStatsStrip();
  renderCraneAIRecs();
  renderCraneGrid();
  showToast('Crane Operations', 'Monitoring 15 cranes · C-06 overloaded · C-03 idle and available for reassignment', 'warning', 5000);

  const sel = document.getElementById('craneStatusFilter');
  if (sel) sel.addEventListener('change', () => {
    craneFilter = sel.value;
    renderCraneGrid();
  });
});
