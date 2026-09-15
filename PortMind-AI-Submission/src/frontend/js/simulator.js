/**
 * PortMind AI — AI Simulator
 * simulator.js
 */

// ─── 72-HOUR FORECAST ─────────────────────────────────────────────────────────
const FORECAST_DATA = [
  {
    window:     '0 – 24h',
    congestion: 64,
    cls:        'high',
    label:      'High',
    vessels:    21,
    craneDemand:72,
    yardUtil:   78,
    narrative:  'Current cluster of arrivals creates elevated congestion. Crane C-04 and C-15 are offline. Berths 03 and 05 are at 100% and 97% respectively. Immediate action on V-104 and V-112 is required.'
  },
  {
    window:     '24 – 48h',
    congestion: 78,
    cls:        'high',
    label:      'High',
    vessels:    14,
    craneDemand:81,
    yardUtil:   82,
    narrative:  'Crane C-04 remains offline through this window (ETA 18:00 Day 2). Berth 05 conflict unresolved. Yard Zone B will reach critical if containers are not redistributed. Risk is trending upward.'
  },
  {
    window:     '48 – 72h',
    congestion: 87,
    cls:        'critical',
    label:      'Critical',
    vessels:    18,
    craneDemand:89,
    yardUtil:   89,
    narrative:  'Without intervention, congestion will reach Critical threshold. Yard Zone B and Zone D are both forecast to overflow. High vessel arrival cluster in this window. Operator action is strongly recommended now.'
  }
];

function renderForecast() {
  const container = document.getElementById('forecastWindows');
  if (!container) return;

  container.innerHTML = FORECAST_DATA.map(f => `
    <div class="fc-window" style="${f.cls === 'critical' ? 'border-color:rgba(248,81,73,0.4);background:rgba(248,81,73,0.03);' : ''}">
      <div class="fc-window-title">${f.window}</div>
      <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:10px;">
        <div class="fc-big" style="color:var(--status-${f.cls});">${f.congestion}%</div>
        <div>
          <span class="badge ${f.cls}" style="margin-bottom:4px;">${f.label}</span>
          <div style="font-size:11px;color:var(--text-muted);">Congestion Risk</div>
        </div>
      </div>
      <div class="metric-row"><span class="metric-key">Vessel Arrivals</span><span class="metric-val font-mono">${f.vessels}</span></div>
      <div class="metric-row"><span class="metric-key">Crane Demand</span><span class="metric-val font-mono" style="color:var(--status-${utilisationClass(f.craneDemand)});">${f.craneDemand}%</span></div>
      <div class="metric-row"><span class="metric-key">Yard Utilisation</span><span class="metric-val font-mono" style="color:var(--status-${utilisationClass(f.yardUtil)});">${f.yardUtil}%</span></div>
      <div style="margin-top:10px;padding:8px 10px;background:var(--bg-elevated);border-radius:6px;font-size:11px;color:var(--text-secondary);line-height:1.5;">${f.narrative}</div>
    </div>
  `).join('');
}

// ─── AI RESPONSE PLANS BY TYPE ────────────────────────────────────────────────
const RESPONSE_PLANS = {
  Weather: [
    { action:'Reassign Vessel V-104 to Berth 07',           reason:'Berth 07 is sheltered and currently available. B-03 is compromised by weather and congestion.' },
    { action:'Prioritise refrigerated cargo unloading',      reason:'Cold-chain cargo on V-104 and V-117 must be moved before operations slow further. Temperature risk increases with delay.' },
    { action:'Reassign Crane C-03 to Berth 03',             reason:'C-03 is idle (8%). With C-06 failed, B-03 needs additional crane capacity to maintain throughput.' },
    { action:'Delay low-priority vessel V-109 by 4 hours',  reason:'V-109 carries low-priority general cargo. Delay frees berth and crane capacity for critical vessels.' },
    { action:'Use Berth 07 alternative slot for V-112',     reason:'V-112 has been waiting 5.8 hours. B-07 availability provides immediate relief. Estimated wait reduction: 4.8h.' }
  ],
  Strike: [
    { action:'Activate contingency staffing plan immediately', reason:'South Terminal at 30% staffing. Minimum required to maintain B-05 and B-06 operations is 60%.' },
    { action:'Delay non-critical arrivals at South Terminal', reason:'V-107, V-116 are Bulk/Ro-Ro with lower priority. Delay by 8h to align with available labour capacity.' },
    { action:'Prioritise high-value refrigerated vessels',    reason:'V-102 (Refrigerated) and V-117 (Perishables) must be processed regardless of labour action.' },
    { action:'Notify all shipping lines of expected delays',  reason:'Early notification reduces demurrage claims and allows onward logistics to be re-planned.' },
    { action:'Seek emergency labour arbitration',             reason:'Extended strike beyond 24h will cause major supply chain disruption. Escalation is recommended.' }
  ],
  Crane: [
    { action:'Reassign Crane C-03 to the affected berth',   reason:'C-03 is idle at 8%. Immediate redeployment will partially restore crane capacity within 30 minutes.' },
    { action:'Reschedule vessel queue to reduce berth pressure', reason:'Single-crane operations halve throughput. Adjusting arrival sequence prevents queue build-up.' },
    { action:'Expedite maintenance on the failed crane',    reason:'Every hour of crane downtime creates approximately 2.5 hours of vessel delay accumulation.' },
    { action:'Alert downstream logistics of expected delay', reason:'Container collection slots need to be rescheduled to align with reduced throughput capacity.' },
    { action:'Deploy Crane C-12 (RMG, currently idle)',     reason:'C-12 is at 5% utilisation and available. While an RMG, it can assist with yard-to-quay operations.' }
  ],
  BerthClosure: [
    { action:'Redirect affected vessels to available berths', reason:'Berth 07 is available and has crane support. Emergency re-assignment possible within 2 hours.' },
    { action:'Notify pilot station of re-routing plan',      reason:'Pilot scheduling must be updated immediately to support berth re-assignment operations.' },
    { action:'Re-calculate berth schedule for next 24h',    reason:'Closure creates a cascade of scheduling conflicts that must be resolved proactively.' },
    { action:'Inspect and certify berth before reopening',   reason:'Structural or operational issues must be fully cleared before resuming operations.' },
    { action:'Alert port authority and coast guard',         reason:'Formal notification is required for all unplanned berth closures per harbour regulations.' }
  ],
  Flood: [
    { action:'Suspend all at-risk yard zone operations',    reason:'Flood risk areas must be evacuated. Container and equipment safety takes priority.' },
    { action:'Redirect container traffic to elevated zones', reason:'Zone A (North Terminal) and Zone C (East Terminal) are at higher elevation and safer.' },
    { action:'Halt incoming vessels until conditions clear', reason:'Bringing vessels to berth during flooding creates unacceptable safety and logistics risk.' },
    { action:'Coordinate with emergency services',           reason:'Port flood response requires coordination with municipal emergency management.' },
    { action:'Assess structural damage before resumption',   reason:'Quay and infrastructure integrity must be confirmed before operations resume.' }
  ]
};

// ─── RUN SIMULATION ───────────────────────────────────────────────────────────
function runSimulation() {
  const btn       = document.getElementById('runSimBtn');
  const status    = document.getElementById('simStatus');
  const results   = document.getElementById('simResults');
  if (!results) return;

  const type      = document.getElementById('simType')?.value || 'Weather';
  const severity  = document.getElementById('simSeverity')?.value || 'High';
  const duration  = parseInt(document.getElementById('simDuration')?.value) || 12;
  const area      = document.getElementById('simArea')?.value || 'Berths 3-7';

  // Show loading
  if (btn) { btn.disabled = true; btn.textContent = 'RUNNING…'; }
  results.classList.remove('visible');
  if (status) status.style.display = 'block';

  setTimeout(() => {
    if (status) status.style.display = 'none';
    if (btn) { btn.disabled = false; btn.textContent = 'RUN SIMULATION'; }

    // ── Compute results ──────────────────────────────────────────────────────
    const sevMap     = { Critical:0.40, High:0.28, Medium:0.15, Low:0.07 };
    const mult       = sevMap[severity] || 0.15;
    const durFactor  = Math.min(1.0, duration / 12);

    // Special case: Heavy Rain High 12h = exactly the showcase numbers
    const isShowcase = (type === 'Weather' && severity === 'High' && duration >= 12);

    const afterVessels    = isShowcase ? 31 : Math.round(mult * 80 * durFactor + 4);
    const afterCongestion = isShowcase ? 87 : Math.min(99, Math.round(22 + mult * 220 * durFactor));
    const afterWait       = isShowcase ? '11.6' : (2.4 + mult * 50 * durFactor).toFixed(1);
    const afterYard       = isShowcase ? 82 : Math.min(99, Math.round(68 + mult * 80 * durFactor));

    const congClass = utilisationClass(afterCongestion);

    // Get response plan
    const planKey  = type.replace('Weather-Storm','Weather').replace('-','') || 'Weather';
    const planBase = RESPONSE_PLANS[planKey] || RESPONSE_PLANS['Crane'];

    // Render results
    const typeLabel = document.getElementById('simType')?.options[document.getElementById('simType')?.selectedIndex]?.text || type;

    results.innerHTML = `
      <!-- Header -->
      <div style="background:rgba(248,81,73,0.08);border:1px solid rgba(248,81,73,0.3);border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--status-critical);letter-spacing:1px;margin-bottom:4px;">Simulation Result</div>
        <div style="font-size:18px;font-weight:800;color:var(--text-primary);">${typeLabel}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">Severity: ${severity} · Duration: ${duration}h · Affected Area: ${area}</div>
      </div>

      <!-- Before / After -->
      <div class="before-after">
        <div class="ba-card before">
          <div class="ba-title before">BEFORE</div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Vessels Affected</span><span style="font-family:var(--font-mono);color:var(--status-low);">0</span></div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Congestion Risk</span><span style="font-family:var(--font-mono);">22%</span></div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Average Wait</span><span style="font-family:var(--font-mono);">2.4 hours</span></div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Yard Utilisation</span><span style="font-family:var(--font-mono);">68%</span></div>
        </div>
        <div class="ba-card after">
          <div class="ba-title after">AFTER (SIMULATED)</div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Vessels Affected</span><span style="font-family:var(--font-mono);font-size:18px;font-weight:800;color:var(--status-critical);">${afterVessels}</span></div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Congestion Risk</span><span style="font-family:var(--font-mono);color:var(--status-${congClass});font-weight:700;">${afterCongestion}%</span></div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Average Wait</span><span style="font-family:var(--font-mono);color:var(--status-high);font-weight:700;">${afterWait} hours</span></div>
          <div class="ba-metric"><span style="color:var(--text-secondary);">Yard Utilisation</span><span style="font-family:var(--font-mono);color:var(--status-${utilisationClass(afterYard)});font-weight:700;">${afterYard}%</span></div>
        </div>
      </div>

      <!-- AI Response Plan -->
      <div class="response-plan">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--accent-cyan);margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg>
          AI Response Plan
        </div>
        <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:14px;">Recommended Actions for ${typeLabel}</div>
        ${planBase.map((step, i) => `
          <div class="rp-step">
            <div class="rp-num">${i + 1}</div>
            <div>
              <div class="rp-action">${step.action}</div>
              <div class="rp-reason">${step.reason}</div>
            </div>
          </div>
        `).join('')}
        <div style="margin-top:12px;padding:10px 12px;background:var(--bg-elevated);border-radius:6px;font-size:11px;color:var(--text-muted);">
          Simulation estimate — based on simulated port data. Not a validated prediction. Requires operator review before implementation.
        </div>
      </div>
    `;

    results.classList.add('visible');
    results.scrollIntoView({ behavior:'smooth', block:'nearest' });
    showToast('Simulation Complete', `${typeLabel} scenario modelled. ${afterVessels} vessels affected (estimated).`, 'warning', 5000);
  }, 1500);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderForecast();

  const btn = document.getElementById('runSimBtn');
  if (btn) btn.addEventListener('click', runSimulation);

  showToast('AI Simulator', 'Run a crisis simulation: try Weather → Heavy Rain → High → 12h for the hackathon demo.', 'info', 5000);
});
