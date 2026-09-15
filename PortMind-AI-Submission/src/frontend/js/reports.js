/**
 * PortMind AI — Reports
 * reports.js
 */

let currentReportType = 'operations-brief';

// ─── REPORT TYPE SELECTION ────────────────────────────────────────────────────
function selectReport(card, type) {
  document.querySelectorAll('.report-type-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  currentReportType = type;

  // Update generate button label
  const btn = document.getElementById('generateReportBtn');
  if (btn) {
    const labels = {
      'operations-brief':    'Generate AI Operations Brief',
      'vessel-risk':         'Generate Vessel Risk Report',
      'disruption-summary':  'Generate Disruption Summary'
    };
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg>
      ${labels[type] || 'Generate Report'}
    `;
  }

  // Hide existing output when switching type
  const output = document.getElementById('reportOutput');
  if (output) output.classList.remove('visible');
  const printBtn = document.getElementById('printBtn');
  if (printBtn) printBtn.style.display = 'none';
}

// ─── GENERATE REPORT ──────────────────────────────────────────────────────────
function generateReport() {
  const output = document.getElementById('reportOutput');
  const btn    = document.getElementById('generateReportBtn');
  if (!output) return;

  // Loading state
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="display:inline-block;"></div> Generating…'; }
  output.classList.add('visible');
  output.innerHTML = `<div style="padding:40px;text-align:center;"><div class="spinner" style="margin:0 auto 12px;"></div><div style="font-size:13px;color:var(--text-secondary);">AI generating report…</div></div>`;

  setTimeout(() => {
    if (btn) { btn.disabled = false; btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg> Regenerate`; }

    let html = '';
    if (currentReportType === 'operations-brief')   html = buildOperationsBrief();
    if (currentReportType === 'vessel-risk')         html = buildVesselRiskReport();
    if (currentReportType === 'disruption-summary')  html = buildDisruptionSummary();

    output.innerHTML = `<div class="report-doc">${html}</div>`;
    output.classList.add('visible');

    // Show print button
    const printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.style.display = 'inline-flex';

    showToast('Report Generated', 'Use the Print / Export PDF button to save or share.', 'success', 4000);
    output.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 1400);
}

// ─── OPERATIONS BRIEF ────────────────────────────────────────────────────────
function buildOperationsBrief() {
  const now        = new Date();
  const dateStr    = now.toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  const timeStr    = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const congestion = getPortCongestionRisk();
  const congClass  = getRiskClass(congestion);
  const avgWait    = getAverageWaitingTime();
  const yardUtil   = getYardUtilisationPct();
  const craneUtil  = getOverallCraneUtilisation();
  const inPort     = getVesselsInPort();
  const arrivals   = getArrivalsNext24h();
  const critVessels = getCriticalVessels();
  const activeDisruptions = getActiveDisruptions();
  const topRisk    = getHighRiskVessels().slice(0, 5);
  const zones      = getYard().zones;
  const idleCranes = getIdleCranes();

  return `
    <!-- Header -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
      <div>
        <h1>PORT OPERATIONS INTELLIGENCE BRIEF</h1>
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-top:2px;">Hamburg Container Terminal</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;color:var(--text-muted);">${dateStr}</div>
        <div style="font-size:12px;color:var(--text-muted);">${timeStr} local time</div>
        <div style="margin-top:6px;"><span class="badge idle" style="font-size:10px;">SIMULATION DATA</span></div>
      </div>
    </div>
    <div class="report-meta">Prepared by: PortMind AI System · Simulated demo data · Not for use in real operations</div>

    <!-- Status Banner -->
    <div class="report-status-bar">
      PORT STATUS: ${congClass.toUpperCase()} CONGESTION — ${congestion}% Risk Score
    </div>

    <!-- Executive Summary -->
    <h2>Executive Summary</h2>
    <p>
      Hamburg Container Terminal is currently operating under <strong>${congClass} congestion conditions</strong>
      with a port-wide risk score of <strong>${congestion}%</strong>.
      There are <strong>${critVessels.length} vessels in Critical status</strong> requiring immediate operational attention,
      and <strong>${activeDisruptions.length} active disruptions</strong> affecting terminal capacity.
      Without intervention, congestion is forecast to reach <strong>87% (Critical)</strong> within the 48–72 hour window.
    </p>
    <p>
      The primary drivers of current congestion are: Berths 03 and 05 at full capacity, Crane C-06 failure at Berth 03,
      Crane C-04 offline for maintenance, Yard Zone B at 91%, and an active stevedore labour action at the South Terminal.
    </p>

    <!-- Key Performance Indicators -->
    <h2>Key Performance Indicators</h2>
    <table class="kpi-table">
      <thead><tr><th>Metric</th><th>Current Value</th><th>Status</th><th>Trend</th></tr></thead>
      <tbody>
        <tr><td>Vessels in Port</td><td><strong>${inPort}</strong></td><td><span class="badge medium">Active</span></td><td>↑ +3 vs yesterday</td></tr>
        <tr><td>Arrivals (Next 24h)</td><td><strong>${arrivals}</strong></td><td><span class="badge medium">High Volume</span></td><td>Expected cluster</td></tr>
        <tr><td>Congestion Risk</td><td><strong>${congestion}%</strong></td><td><span class="badge ${congClass}">${congClass.toUpperCase()}</span></td><td>↑ +12% vs yesterday</td></tr>
        <tr><td>Average Vessel Wait</td><td><strong>${avgWait} hours</strong></td><td><span class="badge ${avgWait > 3 ? 'high' : 'medium'}">Elevated</span></td><td>↑ +0.8h vs yesterday</td></tr>
        <tr><td>Yard Utilisation</td><td><strong>${yardUtil}%</strong></td><td><span class="badge ${utilisationClass(yardUtil)}">${utilisationClass(yardUtil).toUpperCase()}</span></td><td>Zone B Critical (91%)</td></tr>
        <tr><td>Crane Utilisation</td><td><strong>${craneUtil}%</strong></td><td><span class="badge ${utilisationClass(craneUtil)}">${utilisationClass(craneUtil).toUpperCase()}</span></td><td>C-04, C-15 offline</td></tr>
      </tbody>
    </table>

    <!-- Key Risks -->
    <h2>Key Risks</h2>
    <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
      <li style="padding:10px 12px;background:rgba(248,81,73,0.08);border:1px solid rgba(248,81,73,0.2);border-radius:7px;font-size:13px;">
        <span class="badge critical" style="margin-right:8px;">Critical</span>
        <strong>${critVessels.length} vessels at Critical risk level</strong> — MSC Adriana (V-104, 91%), Borchard Clementine (V-121, 88%), Zim Pacific (V-112, 86%), Yang Ming Spirit (V-109, 83%)
      </li>
      <li style="padding:10px 12px;background:rgba(210,153,34,0.08);border:1px solid rgba(210,153,34,0.2);border-radius:7px;font-size:13px;">
        <span class="badge high" style="margin-right:8px;">High</span>
        <strong>Berths 03 and 05 at 100% and 97% utilisation</strong> — no capacity for new arrivals without intervention
      </li>
      <li style="padding:10px 12px;background:rgba(210,153,34,0.08);border:1px solid rgba(210,153,34,0.2);border-radius:7px;font-size:13px;">
        <span class="badge high" style="margin-right:8px;">High</span>
        <strong>Yard Zone B at 91% (Critical threshold)</strong> — redistribution to Zone C recommended before overflow
      </li>
      <li style="padding:10px 12px;background:rgba(248,81,73,0.08);border:1px solid rgba(248,81,73,0.2);border-radius:7px;font-size:13px;">
        <span class="badge critical" style="margin-right:8px;">Critical</span>
        <strong>Crane C-06 failure at Berth 03</strong> — B-03 at 50% crane capacity; affects V-103 and V-104
      </li>
      <li style="padding:10px 12px;background:rgba(210,153,34,0.08);border:1px solid rgba(210,153,34,0.2);border-radius:7px;font-size:13px;">
        <span class="badge high" style="margin-right:8px;">High</span>
        <strong>South Terminal labour action</strong> — B-05 and B-06 at 30% staffing; turnaround time doubled
      </li>
    </ul>

    <!-- Recommended Actions -->
    <h2>Recommended Actions</h2>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">AI-assisted recommendations — all require operator approval before implementation. These are simulation estimates.</p>
    <ul class="action-list">
      <li><div class="action-num">1</div><div><strong>Reassign V-104 (MSC Adriana) to Berth 07</strong><br><span style="font-size:12px;color:var(--text-secondary);">Berth 07 is currently available (20% utilisation) with Crane C-13 ready. Estimated wait reduction: 4.8 hours. Reason: B-03 is congested at 100% and Crane C-06 has failed.</span></div></li>
      <li><div class="action-num">2</div><div><strong>Redeploy Crane C-03 from Berth 02 to Berth 03</strong><br><span style="font-size:12px;color:var(--text-secondary);">C-03 is idle at 8% utilisation. Redeployment restores B-03 to full crane capacity. Estimated impact: −3.2 hours for V-103 and future vessels at B-03.</span></div></li>
      <li><div class="action-num">3</div><div><strong>Move 200 TEU from Yard Zone B to Zone C</strong><br><span style="font-size:12px;color:var(--text-secondary);">Zone B is at 91% (Critical). Zone C has 1,200 TEU free. Movement reduces Zone B to ~84%, preventing overflow in the next arrival cycle.</span></div></li>
      <li><div class="action-num">4</div><div><strong>Delay Vessel V-109 (Yang Ming Spirit) by 4 hours</strong><br><span style="font-size:12px;color:var(--text-secondary);">V-109 carries low-priority general cargo. Delay frees berth and crane capacity at B-08 for higher-priority refrigerated vessels. Risk score will reduce from 83 to an estimated 52.</span></div></li>
      <li><div class="action-num">5</div><div><strong>Prioritise refrigerated cargo vessels at Zone F</strong><br><span style="font-size:12px;color:var(--text-secondary);">V-117 (perishables), V-128 (fruit), and V-102 (seafood) carry time-critical temperature-sensitive cargo. Zone F has adequate capacity at 64% utilisation.</span></div></li>
    </ul>

    <!-- Vessel Risk Summary -->
    <h2>Top 5 Vessels by Risk Score</h2>
    <table class="kpi-table">
      <thead><tr><th>ID</th><th>Vessel Name</th><th>Risk Score</th><th>Status</th><th>Wait</th><th>Berth</th></tr></thead>
      <tbody>
        ${topRisk.map(v => `
          <tr>
            <td style="font-family:var(--font-mono);">${v.id}</td>
            <td><strong>${v.name}</strong></td>
            <td><span class="badge ${getRiskClass(v.riskScore)}">${v.riskScore}</span></td>
            <td>${buildBadge(v.status)}</td>
            <td style="font-family:var(--font-mono);">${v.waitingTime}h</td>
            <td style="font-family:var(--font-mono);">${v.assignedBerth}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Active Disruptions -->
    <h2>Active Disruptions (${activeDisruptions.length})</h2>
    <table class="kpi-table">
      <thead><tr><th>ID</th><th>Type</th><th>Severity</th><th>Location</th><th>Duration</th><th>Impact</th></tr></thead>
      <tbody>
        ${activeDisruptions.map(d => `
          <tr>
            <td style="font-family:var(--font-mono);">${d.id}</td>
            <td>${d.subtype}</td>
            <td><span class="badge ${getStatusClass(d.severity)}">${d.severity}</span></td>
            <td>${d.location.split('/')[0].trim()}</td>
            <td style="font-family:var(--font-mono);">${d.expectedDuration}h</td>
            <td style="font-size:12px;max-width:200px;">${d.estimatedImpact.substring(0, 80)}…</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- 72h Forecast -->
    <h2>72-Hour Congestion Forecast</h2>
    <table class="kpi-table">
      <thead><tr><th>Time Window</th><th>Congestion</th><th>Risk Level</th><th>Vessel Arrivals</th><th>Key Concern</th></tr></thead>
      <tbody>
        <tr><td>0 – 24 hours</td><td style="font-family:var(--font-mono);">64%</td><td><span class="badge high">High</span></td><td>21</td><td>Current cluster, C-04 offline</td></tr>
        <tr><td>24 – 48 hours</td><td style="font-family:var(--font-mono);">78%</td><td><span class="badge high">High</span></td><td>14</td><td>Berth 05 unresolved, yard pressure</td></tr>
        <tr><td>48 – 72 hours</td><td style="font-family:var(--font-mono);">87%</td><td><span class="badge critical">Critical</span></td><td>18</td><td>Zone B overflow, arrival cluster</td></tr>
      </tbody>
    </table>

    <!-- Disclaimer -->
    <div class="report-disclaimer">
      This report was generated by PortMind AI on ${dateStr} at ${timeStr}.<br>
      All data is simulated and fictional. Risk scores are AI-assisted estimates, not validated predictions.<br>
      PortMind AI is a prototype built for the IBM Bob AI Innovation Hackathon 2026.<br>
      No real ports, vessels, or organisations are represented.
    </div>
  `;
}

// ─── VESSEL RISK REPORT ───────────────────────────────────────────────────────
function buildVesselRiskReport() {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  const timeStr  = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const vessels  = getVessels().sort((a,b) => b.riskScore - a.riskScore);

  return `
    <h1>VESSEL RISK REPORT</h1>
    <div class="report-meta">Hamburg Container Terminal · ${dateStr} ${timeStr} · ${vessels.length} vessels · Simulated demo data</div>
    <p>All 30 vessels ranked by AI-assisted operational risk score. Scores are estimates based on berth availability, crane status, arrival volume, yard pressure, and waiting time.</p>

    <h2>All Vessels — Risk Ranking</h2>
    <table class="kpi-table">
      <thead><tr><th>#</th><th>ID</th><th>Name</th><th>Type</th><th>Risk Score</th><th>Status</th><th>Wait</th><th>Berth</th><th>Primary Risk Factor</th></tr></thead>
      <tbody>
        ${vessels.map((v, i) => `
          <tr>
            <td style="color:var(--text-muted);">${i + 1}</td>
            <td style="font-family:var(--font-mono);">${v.id}</td>
            <td><strong>${v.name}</strong><div style="font-size:11px;color:var(--text-muted);">${v.flag}</div></td>
            <td>${v.type}</td>
            <td><span class="badge ${getRiskClass(v.riskScore)}">${v.riskScore}</span></td>
            <td>${buildBadge(v.status)}</td>
            <td style="font-family:var(--font-mono);">${v.waitingTime > 0 ? v.waitingTime + 'h' : '—'}</td>
            <td style="font-family:var(--font-mono);">${v.assignedBerth}</td>
            <td style="font-size:11px;color:var(--text-secondary);">${v.riskFactors.length > 0 ? getRiskFactorLabel(v.riskFactors[0]) : 'None'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="report-disclaimer">
      Risk scores are AI-assisted operational estimates. Prototype — IBM Bob AI Innovation Hackathon 2026. All data is simulated.
    </div>
  `;
}

// ─── DISRUPTION SUMMARY ───────────────────────────────────────────────────────
function buildDisruptionSummary() {
  const now          = new Date();
  const dateStr      = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  const timeStr      = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  const disruptions  = getDisruptions();
  const active       = disruptions.filter(d => d.status === 'Active');
  const forecast     = disruptions.filter(d => d.status === 'Forecast');

  return `
    <h1>DISRUPTION SUMMARY REPORT</h1>
    <div class="report-meta">Hamburg Container Terminal · ${dateStr} ${timeStr} · ${disruptions.length} disruptions tracked · Simulated demo data</div>

    <div class="report-status-bar">
      ${active.length} ACTIVE DISRUPTIONS · ${forecast.length} FORECAST · ${disruptions.filter(d => d.severity === 'Critical').length} CRITICAL
    </div>

    <h2>Active Disruptions (${active.length})</h2>
    ${active.map(d => `
      <div style="border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span class="badge ${getStatusClass(d.severity)}">${d.severity}</span>
          <strong>${d.id} — ${d.subtype}</strong>
          <span class="tag">${d.type}</span>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px;">
          <strong>Location:</strong> ${d.location} &nbsp;·&nbsp;
          <strong>Duration:</strong> ${d.expectedDuration}h &nbsp;·&nbsp;
          <strong>Started:</strong> ${formatTime(d.startTime)}
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px;">${d.description}</div>
        <div style="font-size:12px;padding:8px;background:var(--bg-elevated);border-radius:5px;">
          <strong>Estimated Impact:</strong> ${d.estimatedImpact}
        </div>
        ${d.affectedBerths.length > 0 ? `<div style="margin-top:6px;font-size:12px;"><strong>Affected Berths:</strong> ${d.affectedBerths.join(', ')}</div>` : ''}
        ${d.affectedVessels.length > 0 ? `<div style="font-size:12px;"><strong>Affected Vessels:</strong> ${d.affectedVessels.join(', ')}</div>` : ''}
      </div>
    `).join('')}

    <h2>Forecast Disruptions (${forecast.length})</h2>
    ${forecast.map(d => `
      <div style="border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:12px;opacity:0.85;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span class="badge ${getStatusClass(d.severity)}">${d.severity}</span>
          <strong>${d.id} — ${d.subtype}</strong>
          <span class="badge medium">Forecast</span>
        </div>
        <div style="font-size:12px;color:var(--text-secondary);">${d.description}</div>
        <div style="font-size:12px;margin-top:4px;"><strong>Expected:</strong> ${formatTime(d.startTime)} · ${d.expectedDuration}h duration</div>
      </div>
    `).join('')}

    <div class="report-disclaimer">
      Disruption data is simulated. Prototype — IBM Bob AI Innovation Hackathon 2026.
    </div>
  `;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generateReportBtn');
  if (btn) btn.addEventListener('click', generateReport);

  showToast('Reports', 'Select a report type and click Generate to produce an AI Operations Brief.', 'info', 4000);
});
