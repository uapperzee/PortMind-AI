/**
 * PortMind AI — Disruption Centre
 * disruptions.js
 */

let disStatusFilter   = 'All';
let disSeverityFilter = '';

// ─── RENDER STATS ─────────────────────────────────────────────────────────────
function renderDisruptionStats() {
  const el = document.getElementById('disruptionStats');
  if (!el) return;

  const all       = getDisruptions();
  const active    = all.filter(d => d.status === 'Active').length;
  const forecast  = all.filter(d => d.status === 'Forecast').length;
  const critical  = all.filter(d => d.severity === 'Critical').length;
  const high      = all.filter(d => d.severity === 'High').length;

  el.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Total</div><div class="kpi-value">${all.length}</div><div class="kpi-status medium">TRACKED</div></div>
    <div class="kpi-card critical"><div class="kpi-label">Active</div><div class="kpi-value critical">${active}</div><div class="kpi-status critical">ONGOING</div></div>
    <div class="kpi-card medium"><div class="kpi-label">Forecast</div><div class="kpi-value">${forecast}</div><div class="kpi-status medium">PREDICTED</div></div>
    <div class="kpi-card critical"><div class="kpi-label">Critical</div><div class="kpi-value critical">${critical}</div><div class="kpi-status critical">SEVERITY</div></div>
    <div class="kpi-card high"><div class="kpi-label">High</div><div class="kpi-value high">${high}</div><div class="kpi-status high">SEVERITY</div></div>
  `;
}

// ─── RENDER DISRUPTION LIST ───────────────────────────────────────────────────
function renderDisruptionList() {
  const container = document.getElementById('disruptionList');
  if (!container) return;

  let disruptions = getDisruptions();

  if (disStatusFilter !== 'All') {
    disruptions = disruptions.filter(d => d.status === disStatusFilter);
  }
  if (disSeverityFilter) {
    disruptions = disruptions.filter(d => d.severity === disSeverityFilter);
  }

  if (!disruptions.length) {
    container.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-muted);">No disruptions match the current filter.</div>`;
    return;
  }

  container.innerHTML = disruptions.map(d => {
    const sevCls    = getStatusClass(d.severity).toLowerCase();
    const statCls   = getStatusClass(d.status).toLowerCase();
    const berthList = d.affectedBerths.length > 0 ? d.affectedBerths.join(', ') : 'None';
    const vesselCnt = d.affectedVessels.length;

    return `
      <div class="dis-card">
        <div class="dis-card-header">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              ${buildBadge(d.severity)}
              ${buildBadge(d.status)}
              <span class="tag">${d.type}</span>
            </div>
            <div class="dis-card-title">${d.subtype} — ${d.location}</div>
            <div class="dis-card-sub">${d.id} · Started ${formatTime(d.startTime)} · Expected duration: ${d.expectedDuration}h</div>
          </div>
        </div>
        <div class="dis-meta">
          <div class="dis-meta-item"><strong>Affected Berths:</strong> ${berthList || 'None'}</div>
          <div class="dis-meta-item"><strong>Affected Vessels:</strong> ${vesselCnt > 0 ? vesselCnt + ' vessel' + (vesselCnt > 1 ? 's' : '') : 'None directly'}</div>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;">${d.description}</p>
        <div style="background:var(--bg-elevated);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--text-secondary);margin-bottom:12px;">
          <strong style="color:var(--text-primary);">Estimated Impact:</strong> ${d.estimatedImpact}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="showDisruptionImpact('${d.id}')">Calculate Impact</button>
          <a href="simulator.html" class="btn btn-ai btn-sm">Simulate Response →</a>
        </div>
        <!-- Impact Panel (hidden until Calculate Impact clicked) -->
        <div class="impact-panel" id="impact-${d.id}"></div>
      </div>
    `;
  }).join('');
}

// ─── CALCULATE IMPACT ────────────────────────────────────────────────────────
function showDisruptionImpact(disruptionId) {
  const disruption = getDisruptions().find(d => d.id === disruptionId);
  if (!disruption) return;

  const panel = document.getElementById(`impact-${disruptionId}`);
  if (!panel) return;

  // Toggle: if already showing and has content, collapse it
  if (panel.classList.contains('visible') && panel.innerHTML.includes('Before Disruption')) {
    panel.classList.remove('visible');
    return;
  }

  // Show loading
  panel.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;"><div class="spinner"></div><span style="font-size:13px;color:var(--text-secondary);">AI calculating impact…</span></div>`;
  panel.classList.add('visible');

  setTimeout(() => {
    const sev = disruption.severity;
    const dur = disruption.expectedDuration;
    const berthCount = disruption.affectedBerths.length || 1;

    // Severity multipliers
    const sevMap = { Critical: 0.35, High: 0.22, Medium: 0.12, Low: 0.06 };
    const mult = sevMap[sev] || 0.1;
    const durFactor = Math.min(1.0, dur / 12);

    const baseCongestion = 22;
    const baseWait       = 2.4;
    const baseYard       = 68;
    const baseVessels    = 0;

    const afterCongestion = Math.min(99, Math.round(baseCongestion + mult * 220 * durFactor));
    const afterWait       = (baseWait + mult * 45 * durFactor).toFixed(1);
    const afterYard       = Math.min(99, Math.round(baseYard + mult * 80 * durFactor));
    const afterVessels    = Math.round(berthCount * mult * 80 * durFactor + disruption.affectedVessels.length);

    // Clamp sev-specific expected
    const affectedVesselIds = disruption.affectedVessels.slice(0, 4);
    const affectedNames     = affectedVesselIds.map(id => {
      const v = getVesselById(id);
      return v ? `${v.id} ${v.name}` : id;
    });

    const congClass = utilisationClass(afterCongestion);

    panel.innerHTML = `
      <hr class="divider" style="margin-bottom:14px;" />
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--accent-cyan);margin-bottom:10px;">AI Impact Analysis — ${disruption.subtype} (${sev} Severity · ${dur}h)</div>
      <div class="impact-before-after">
        <div class="impact-col">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Before Disruption</div>
          <div class="metric-row"><span class="metric-key">Vessels Affected</span><span class="metric-val">0</span></div>
          <div class="metric-row"><span class="metric-key">Congestion Risk</span><span class="metric-val">22%</span></div>
          <div class="metric-row"><span class="metric-key">Average Wait</span><span class="metric-val">2.4h</span></div>
          <div class="metric-row"><span class="metric-key">Yard Utilisation</span><span class="metric-val">68%</span></div>
        </div>
        <div class="impact-col" style="border-color:rgba(248,81,73,0.3);">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--status-critical);margin-bottom:10px;">After Disruption (Estimated)</div>
          <div class="metric-row"><span class="metric-key">Vessels Affected</span><span class="metric-val" style="color:var(--status-critical);">${afterVessels}</span></div>
          <div class="metric-row"><span class="metric-key">Congestion Risk</span><span class="metric-val" style="color:var(--status-${congClass});">${afterCongestion}%</span></div>
          <div class="metric-row"><span class="metric-key">Average Wait</span><span class="metric-val" style="color:var(--status-high);">${afterWait}h</span></div>
          <div class="metric-row"><span class="metric-key">Yard Utilisation</span><span class="metric-val" style="color:var(--status-high);">${afterYard}%</span></div>
        </div>
      </div>
      ${affectedNames.length > 0 ? `
        <div style="margin-top:12px;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Directly Affected Vessels:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${affectedNames.map(n => `<span class="tag">${n}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      <div style="margin-top:12px;padding:10px 12px;background:rgba(57,208,224,0.06);border:1px solid rgba(57,208,224,0.2);border-radius:8px;">
        <div style="font-size:11px;font-weight:700;color:var(--accent-cyan);margin-bottom:6px;">AI Recommended Actions:</div>
        <ul class="ai-reason-list">
          <li>Activate contingency berths for affected vessels</li>
          <li>Notify vessel masters of estimated delay impact</li>
          <li>Prioritise perishable and hazmat cargo movements</li>
          <li>Reassign available cranes to compensate for reduced capacity</li>
          <li>Alert logistics partners of expected delivery delays</li>
        </ul>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">Simulation estimate — not a validated prediction.</div>
      </div>
    `;
  }, 1200);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderDisruptionStats();
  renderDisruptionList();
  showToast('Disruption Centre', '5 active disruptions · D-002 (Crane Failure, Critical) and D-005 (Strike, Critical) require immediate attention', 'error', 5000);

  // Status filter chips
  document.querySelectorAll('.filter-chip[data-dstatus]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip[data-dstatus]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      disStatusFilter = chip.dataset.dstatus;
      renderDisruptionList();
    });
  });

  // Severity filter
  const sel = document.getElementById('severityFilter');
  if (sel) sel.addEventListener('change', () => {
    disSeverityFilter = sel.value;
    renderDisruptionList();
  });
});
