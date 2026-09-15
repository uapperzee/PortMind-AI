/**
 * PortMind AI — Yard Intelligence
 * yard.js
 */

function renderYardSummary() {
  const container = document.getElementById('yardSummary');
  if (!container) return;

  const yard   = getYard();
  const total  = yard.zones.reduce((s,z) => s + z.capacity, 0);
  const used   = yard.zones.reduce((s,z) => s + z.occupied, 0);
  const free   = total - used;
  const pct    = Math.round((used / total) * 100);
  const cls    = utilisationClass(pct);
  const critZones = yard.zones.filter(z => z.status === 'Critical').length;
  const highZones = yard.zones.filter(z => z.status === 'High').length;

  container.innerHTML = `
    <div class="kpi-card ${cls}">
      <div class="kpi-label">Overall Utilisation</div>
      <div class="kpi-value ${cls}">${pct}%</div>
      <div class="kpi-status ${cls}">${cls.toUpperCase()}</div>
      <div class="risk-bar" style="margin-top:8px;"><div class="risk-bar-fill ${cls}" style="width:${pct}%"></div></div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Total Capacity</div>
      <div class="kpi-value">${fmtNum(total)}</div>
      <div class="kpi-status low">TEU</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Occupied</div>
      <div class="kpi-value ${cls}">${fmtNum(used)}</div>
      <div class="kpi-status ${cls}">TEU IN USE</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Available Capacity</div>
      <div class="kpi-value low">${fmtNum(free)}</div>
      <div class="kpi-status low">TEU FREE</div>
    </div>
  `;
}

function renderZoneGrid() {
  const grid = document.getElementById('zoneGrid');
  if (!grid) return;

  const zones = getYard().zones;

  grid.innerHTML = zones.map(z => {
    const pct    = Math.round((z.occupied / z.capacity) * 100);
    const cls    = utilisationClass(pct);
    const isCrit = z.status === 'Critical';
    const isHigh = z.status === 'High';

    return `
      <div class="zone-card ${isCrit ? 'critical-zone' : isHigh ? 'high-zone' : ''}" onclick="showZoneDetail('${z.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--text-primary);">${z.name}</div>
            <div style="font-size:11px;color:var(--text-muted);">${z.terminal}</div>
          </div>
          ${buildBadge(z.status)}
        </div>
        <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:8px;">
          <div class="zone-pct" style="color:var(--status-${cls});">${pct}%</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">${fmtNum(z.occupied)} / ${fmtNum(z.capacity)} TEU</div>
        </div>
        <div class="progress-wrap"><div class="progress-bar ${cls}" style="width:${pct}%"></div></div>
        <div style="margin-top:10px;font-size:12px;color:var(--text-secondary);">
          <span class="tag">${z.type}</span>
        </div>
        ${isCrit ? `<div style="margin-top:8px;padding:8px;background:rgba(248,81,73,0.08);border-radius:6px;font-size:11px;color:var(--status-critical);">⚠ Critical — redistribution recommended immediately</div>` : ''}
        ${isHigh ? `<div style="margin-top:8px;padding:8px;background:rgba(210,153,34,0.08);border-radius:6px;font-size:11px;color:var(--status-high);">⚡ High utilisation — monitor closely</div>` : ''}
        <button class="btn btn-ghost btn-sm w-full" style="margin-top:10px;" onclick="event.stopPropagation();showZoneDetail('${z.id}')">View Zone Details</button>
      </div>
    `;
  }).join('');
}

function showZoneDetail(zoneId) {
  const zone = getYard().zones.find(z => z.id === zoneId);
  if (!zone) return;
  const pct  = Math.round((zone.occupied / zone.capacity) * 100);
  const free = zone.capacity - zone.occupied;
  const cls  = utilisationClass(pct);
  const isCrit = pct >= 90;
  const isHigh = pct >= 75 && pct < 90;

  // Build AI note based on utilisation
  let aiNote = '';
  if (zone.id === 'YZ-B' || isCrit) {
    aiNote = `
      <div class="ai-card" style="margin-top:14px;">
        <div class="ai-card-label">AI Recommendation</div>
        <div class="ai-card-title">Redistribute containers from ${zone.name} to Zone C</div>
        <div class="ai-card-body">
          ${zone.name} is at ${pct}% — approaching critical overflow. Zone C is at 52% with
          approximately 1,200 TEU of available space. Moving 200 TEU of general cargo will reduce
          ${zone.name} utilisation to approximately 84%, preventing overflow during the next arrival cycle.
          <br><small style="color:var(--text-muted);">Simulation estimate — requires ground team approval.</small>
        </div>
      </div>`;
  } else if (isHigh) {
    aiNote = `
      <div class="ai-card" style="margin-top:14px;">
        <div class="ai-card-label">AI Note</div>
        <div class="ai-card-title">${zone.name} is approaching high utilisation</div>
        <div class="ai-card-body">
          Monitor closely — at current inflow rates, ${zone.name} may reach critical utilisation
          within 6–12 hours. Pre-alert ground team for possible redistribution.
          <br><small style="color:var(--text-muted);">Simulation estimate.</small>
        </div>
      </div>`;
  }

  document.getElementById('zoneModalTitle').textContent = `${zone.name} — ${zone.terminal}`;
  document.getElementById('zoneModalBody').innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:16px;">
      <div style="font-size:48px;font-weight:900;font-family:var(--font-mono);color:var(--status-${cls});line-height:1;">${pct}%</div>
      <div style="margin-bottom:8px;">${buildBadge(zone.status)}</div>
    </div>
    <div class="risk-bar" style="margin-bottom:16px;height:10px;border-radius:5px;">
      <div class="risk-bar-fill ${cls}" style="width:${pct}%;height:10px;border-radius:5px;"></div>
    </div>
    <div class="detail-grid" style="margin-bottom:14px;">
      <div class="detail-item"><div class="detail-label">Zone ID</div><div class="detail-val font-mono">${zone.id}</div></div>
      <div class="detail-item"><div class="detail-label">Terminal</div><div class="detail-val">${zone.terminal}</div></div>
      <div class="detail-item"><div class="detail-label">Type</div><div class="detail-val">${zone.type}</div></div>
      <div class="detail-item"><div class="detail-label">Total Capacity</div><div class="detail-val font-mono">${fmtNum(zone.capacity)} TEU</div></div>
      <div class="detail-item"><div class="detail-label">Occupied</div><div class="detail-val font-mono" style="color:var(--status-${cls});">${fmtNum(zone.occupied)} TEU</div></div>
      <div class="detail-item"><div class="detail-label">Available</div><div class="detail-val font-mono" style="color:var(--status-low);">${fmtNum(free)} TEU</div></div>
    </div>
    ${isCrit ? `<div style="padding:10px 12px;background:rgba(248,81,73,0.08);border:1px solid rgba(248,81,73,0.2);border-radius:8px;font-size:12px;color:var(--status-critical);margin-bottom:12px;">⚠ Critical threshold reached — immediate action required. Redistribution to lower-utilisation zones is recommended.</div>` : ''}
    ${aiNote}
    <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
      <button class="btn btn-primary btn-sm" onclick="executeYardAction('Redistribute: ${zone.name}');closeModal('zoneModal')">Execute Redistribution</button>
      <button class="btn btn-ghost btn-sm" data-modal-close="zoneModal">Close</button>
    </div>
  `;

  openModal('zoneModal');
}

function renderYardAIRecs() {
  const container = document.getElementById('yardAiRecs');
  if (!container) return;

  const recs = [
    {
      action: 'Redistribute containers from Zone B to Zone C',
      reason: 'Zone B is at 91% capacity — Critical. Zone C is at 52% with 1,200 TEU of available space. Moving 200 TEU of general cargo from Zone B to Zone C will prevent overflow and reduce congestion risk.',
      impact: 'Reduces Zone B to 84%, preventing critical overflow',
      confidence: 'High'
    },
    {
      action: 'Prioritise reefer unloading to Zone F',
      reason: 'Zone F (Refrigerated) is at 64% — has sufficient headroom. Refrigerated cargo on critical vessels V-104, V-110, and V-117 must be moved promptly. Zone F is the correct receiving zone.',
      impact: 'Reduces reefer cargo wait time and maintains cold-chain integrity',
      confidence: 'High'
    },
    {
      action: 'Pre-alert ground team for Zone D overflow risk',
      reason: 'Zone D is at 83% and receives hazmat/general cargo. Vessels V-111 and V-130 are both carrying hazmat. With current arrival rates, Zone D may reach 90%+ within 6 hours.',
      impact: 'Prevents Zone D from reaching critical threshold',
      confidence: 'Moderate'
    }
  ];

  container.innerHTML = recs.map(r => `
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
        <button class="btn btn-ai btn-sm" style="margin-top:8px;" onclick="executeYardAction('${r.action}')">Execute Recommendation</button>
      </div>
    </div>
  `).join('');
}

function executeYardAction(action) {
  showToast('Yard Action Submitted', `"${action}" has been submitted for ground team review. Operator approval required.`, 'success', 5000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderYardSummary();
  renderZoneGrid();
  renderYardAIRecs();
  showToast('Yard Intelligence', 'Zone B is at 91% — Critical. Redistribution to Zone C is recommended.', 'error', 5000);
});
