/**
 * PortMind AI — Dashboard Logic
 * dashboard.js
 */

// ─── STATIC LIVE-FEED DATA ────────────────────────────────────────────────────
const LIVE_FEED_EVENTS = [
  { time: '08:04', msg: '<strong>V-104 MSC Adriana</strong> assigned to anchorage — Berth 03 congested.' },
  { time: '07:58', msg: '<strong>Crane C-06</strong> hydraulic failure confirmed at Berth 03. Maintenance mobilised.' },
  { time: '07:52', msg: '<strong>AI Alert:</strong> Yard Zone B reached 91% utilisation. Redistribution recommended.' },
  { time: '07:45', msg: '<strong>V-121 Borchard Clementine</strong> waiting time now 6.2 hours. Risk elevated to Critical.' },
  { time: '07:38', msg: '<strong>V-112 Zim Pacific</strong> waiting time exceeded 5 hours. Risk score updated: 86.' },
  { time: '07:30', msg: '<strong>Disruption D-005</strong> — South Terminal stevedore work-to-rule confirmed.' },
  { time: '07:22', msg: '<strong>V-103 Evergreen Horizon</strong> commenced unloading at Berth 03.' },
  { time: '07:15', msg: '<strong>AI Recommendation:</strong> Reassign Crane C-03 to Berth 03. Estimated impact: −3.2h wait.' },
  { time: '07:08', msg: '<strong>V-101 MSC Aurora</strong> departed Berth 01. Berth now available.' },
  { time: '06:55', msg: '<strong>Weather Advisory:</strong> Force 6 winds forecast for outer harbour 14:00–20:00.' },
  { time: '06:42', msg: '<strong>V-109 Yang Ming Spirit</strong> waiting 4.7 hours. Risk score elevated: 83 (Critical).' },
  { time: '06:30', msg: '<strong>72h Forecast Updated:</strong> Congestion risk rising to Critical by Hour 48–72.' }
];

// ─── AI RECOMMENDATIONS ───────────────────────────────────────────────────────
const AI_RECOMMENDATIONS = [
  {
    num: '01',
    action: 'Reassign Crane C-03 to Berth 03',
    reason: 'C-06 has failed. C-03 is idle at 8% util. Estimated wait reduction: 3.2h for V-104.'
  },
  {
    num: '02',
    action: 'Move V-104 to Berth 07 (Available)',
    reason: 'B-03 is congested. B-07 is available with crane capacity. Estimated delay saved: 4.8h.'
  },
  {
    num: '03',
    action: 'Redistribute containers from Yard Zone B to Zone C',
    reason: 'Zone B is at 91%. Zone C is at 52%. Move recommended before overflow occurs.'
  },
  {
    num: '04',
    action: 'Delay V-109 (low priority) by 4 hours',
    reason: 'V-109 carries low-priority general cargo. Delay frees berth capacity for critical vessels.'
  }
];

// ─── PORT MAP CONFIGURATION ───────────────────────────────────────────────────
// Positions as percentages of the canvas size (left%, top% offset from sea area)
const BERTH_POSITIONS = [
  { id:'B-01', left:'4%'  },
  { id:'B-02', left:'13%' },
  { id:'B-03', left:'22%' },
  { id:'B-04', left:'31%' },
  { id:'B-05', left:'40%' },
  { id:'B-06', left:'49%' },
  { id:'B-07', left:'58%' },
  { id:'B-08', left:'67%' },
  { id:'B-09', left:'76%' },
  { id:'B-10', left:'85%' }
];

// Vessels shown in the sea area (approaching / at anchor)
const MAP_VESSELS = [
  { id:'V-104', left:'18%', top:'22%' },
  { id:'V-112', left:'28%', top:'16%' },
  { id:'V-106', left:'36%', top:'28%' },
  { id:'V-121', left:'10%', top:'30%' },
  { id:'V-109', left:'52%', top:'18%' },
  { id:'V-119', left:'62%', top:'26%' },
  { id:'V-108', left:'72%', top:'14%' },
  { id:'V-103', left:'44%', top:'10%' }
];

// ─── RENDER KPI STRIP ─────────────────────────────────────────────────────────
function renderKPIs() {
  const strip = document.getElementById('kpiStrip');
  if (!strip) return;

  const vessels         = getVessels();
  const inPort          = getVesselsInPort();
  const arrivals24h     = getArrivalsNext24h();
  const congestionRisk  = getPortCongestionRisk();
  const avgWait         = getAverageWaitingTime();
  const yardUtil        = getYardUtilisationPct();
  const craneUtil       = getOverallCraneUtilisation();

  const congClass  = getRiskClass(congestionRisk);
  const yardClass  = utilisationClass(yardUtil);
  const craneClass = utilisationClass(craneUtil);
  const waitVal    = parseFloat(avgWait);
  const waitClass  = waitVal > 4 ? 'critical' : waitVal > 2 ? 'high' : 'low';

  strip.innerHTML = `
    <div class="kpi-card low">
      <div class="kpi-label">Vessels in Port</div>
      <div class="kpi-value">${inPort}</div>
      <div class="kpi-status low">ACTIVE</div>
      <div class="kpi-trend"><span class="trend-up">↑</span> 3 more than yesterday</div>
    </div>
    <div class="kpi-card medium">
      <div class="kpi-label">Arrivals Next 24h</div>
      <div class="kpi-value">${arrivals24h}</div>
      <div class="kpi-status medium">HIGH VOLUME</div>
      <div class="kpi-trend"><span class="trend-flat">→</span> Expected window congestion</div>
    </div>
    <div class="kpi-card ${congClass}">
      <div class="kpi-label">Congestion Risk</div>
      <div class="kpi-value ${congClass}">${congestionRisk}%</div>
      <div class="kpi-status ${congClass}">${congClass.toUpperCase()} RISK</div>
      <div class="kpi-trend"><span class="trend-up">↑</span> 12% vs. yesterday</div>
    </div>
    <div class="kpi-card ${waitClass}">
      <div class="kpi-label">Avg Vessel Wait</div>
      <div class="kpi-value ${waitClass}">${avgWait}h</div>
      <div class="kpi-status ${waitClass}">${waitClass.toUpperCase()}</div>
      <div class="kpi-trend"><span class="trend-up">↑</span> +0.8h vs. yesterday</div>
    </div>
    <div class="kpi-card ${yardClass}">
      <div class="kpi-label">Yard Utilisation</div>
      <div class="kpi-value ${yardClass}">${yardUtil}%</div>
      <div class="kpi-status ${yardClass}">${yardClass.toUpperCase()}</div>
      <div class="kpi-trend"><span class="trend-up">↑</span> Zone B at 91% — Critical</div>
    </div>
    <div class="kpi-card ${craneClass}">
      <div class="kpi-label">Crane Utilisation</div>
      <div class="kpi-value ${craneClass}">${craneUtil}%</div>
      <div class="kpi-status ${craneClass}">${craneClass.toUpperCase()}</div>
      <div class="kpi-trend"><span class="trend-down">↓</span> C-04, C-15 offline</div>
    </div>
  `;
}

// ─── RENDER PORT MAP ──────────────────────────────────────────────────────────
function renderPortMap() {
  const canvas = document.getElementById('portMapCanvas');
  if (!canvas) return;

  const berths  = getBerths();
  const tooltip = document.getElementById('mapTooltip');

  // Base map layers
  canvas.innerHTML = `
    <div class="map-sea">
      <div class="map-sea-label">Outer Harbour / Sea</div>
    </div>
    <div class="map-quay"></div>
    <div class="map-yard">
      <div class="map-yard-label">Container Yard</div>
    </div>
    <div class="map-congestion-zone" style="left:18%;top:5%;width:15%;height:48%;"></div>
  `;

  // Berths
  BERTH_POSITIONS.forEach(pos => {
    const berth = berths.find(b => b.id === pos.id);
    if (!berth) return;

    const cls = getStatusClass(berth.status);
    const vesselName = berth.currentVessel
      ? (getVesselById(berth.currentVessel)?.name || berth.currentVessel).substring(0, 9)
      : 'Empty';

    const el = document.createElement('div');
    el.className = `map-berth ${cls.toLowerCase()}`;
    el.style.left = pos.left;
    el.innerHTML = `
      <div class="berth-inner">
        <span class="berth-id">${berth.id}</span>
        <span class="berth-vessel-tag">${vesselName}</span>
      </div>
    `;

    // Berth click: show tooltip / open modal
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      showBerthTooltip(berth, e.clientX, e.clientY);
    });

    canvas.appendChild(el);
  });

  // Crane icons on quay
  BERTH_POSITIONS.forEach((pos, i) => {
    const crane = document.createElement('div');
    crane.className = 'map-crane';
    crane.style.left = `calc(${pos.left} + 28px)`;
    crane.innerHTML = `
      <svg class="crane-icon-svg" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="0" x2="6" y2="16" stroke="var(--text-muted)" stroke-width="1.5"/>
        <line x1="0" y1="6" x2="12" y2="6" stroke="var(--text-muted)" stroke-width="1.5"/>
        <line x1="6" y1="6" x2="10" y2="10" stroke="var(--text-muted)" stroke-width="1"/>
        <circle cx="6" cy="16" r="2" fill="var(--text-muted)"/>
      </svg>
    `;
    canvas.appendChild(crane);
  });

  // Vessel icons in sea
  MAP_VESSELS.forEach(pos => {
    const vessel = getVesselById(pos.id);
    if (!vessel) return;

    const cls = getRiskClass(vessel.riskScore);
    const el  = document.createElement('div');
    el.className = 'map-vessel';
    el.style.left = pos.left;
    el.style.top  = pos.top;
    el.innerHTML  = `
      <div class="vessel-label">${vessel.id}</div>
      <div class="vessel-icon ${cls}">
        <div class="vessel-dot"></div>
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      showVesselTooltip(vessel, e.clientX, e.clientY);
    });

    canvas.appendChild(el);
  });

  // Close tooltip on canvas click
  canvas.addEventListener('click', () => {
    if (tooltip) tooltip.classList.remove('visible');
  });
}

function showVesselTooltip(vessel, cx, cy) {
  const tooltip = document.getElementById('mapTooltip');
  const canvas  = document.getElementById('portMapCanvas');
  if (!tooltip || !canvas) return;

  const rect    = canvas.getBoundingClientRect();
  const riskCls = getRiskClass(vessel.riskScore);

  tooltip.innerHTML = `
    <div class="tooltip-title">${vessel.name} <span class="badge ${riskCls}" style="font-size:10px;">${vessel.status}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">ID</span><span class="tooltip-val">${vessel.id}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">ETA</span><span class="tooltip-val">${formatTime(vessel.eta)}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Berth</span><span class="tooltip-val">${vessel.assignedBerth}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Containers</span><span class="tooltip-val">${fmtNum(vessel.containers)} TEU</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Wait</span><span class="tooltip-val">${vessel.waitingTime}h</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Risk Score</span><span class="tooltip-val" style="color:var(--status-${riskCls});">${vessel.riskScore}/100</span></div>
    <div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--border);">
      <button class="btn btn-secondary btn-sm" onclick="openVesselModal('${vessel.id}')" style="width:100%;">View Full Analysis</button>
    </div>
  `;

  // Position tooltip
  let left = cx - rect.left + 10;
  let top  = cy - rect.top  + 10;
  if (left + 200 > canvas.offsetWidth) left = cx - rect.left - 210;
  if (top  + 220 > canvas.offsetHeight) top  = cy - rect.top - 230;

  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
  tooltip.classList.add('visible');
}

function showBerthTooltip(berth, cx, cy) {
  const tooltip = document.getElementById('mapTooltip');
  const canvas  = document.getElementById('portMapCanvas');
  if (!tooltip || !canvas) return;

  const rect     = canvas.getBoundingClientRect();
  const stsCls   = getStatusClass(berth.status);
  const craneNames = berth.cranes.map(cid => {
    const c = getCraneById(cid);
    return c ? `${cid} (${c.status})` : cid;
  }).join(', ');

  tooltip.innerHTML = `
    <div class="tooltip-title">${berth.name} <span class="badge ${stsCls}" style="font-size:10px;">${berth.status}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Location</span><span class="tooltip-val">${berth.location}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Utilisation</span><span class="tooltip-val">${berth.utilisation}%</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Current Vessel</span><span class="tooltip-val">${berth.currentVessel || '—'}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Next Vessel</span><span class="tooltip-val">${berth.nextVessel || '—'}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Cranes</span><span class="tooltip-val" style="font-size:11px;">${craneNames}</span></div>
    <div class="tooltip-row"><span class="tooltip-key">Available</span><span class="tooltip-val">${formatTime(berth.availableAt)}</span></div>
    <div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--border);">
      <a href="berths.html" class="btn btn-secondary btn-sm" style="width:100%;text-align:center;">Berth Management →</a>
    </div>
  `;

  let left = cx - rect.left + 10;
  let top  = cy - rect.top  + 10;
  if (left + 200 > canvas.offsetWidth) left = cx - rect.left - 210;
  if (top  + 240 > canvas.offsetHeight) top  = cy - rect.top - 250;

  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
  tooltip.classList.add('visible');
}

// ─── RENDER AI RECOMMENDATIONS ────────────────────────────────────────────────
function renderAIRecommendations() {
  const list = document.getElementById('aiRecList');
  if (!list) return;
  list.innerHTML = AI_RECOMMENDATIONS.map(r => `
    <div class="ai-rec-item">
      <div class="ai-rec-num">ACTION ${r.num}</div>
      <div class="ai-rec-action">${r.action}</div>
      <div class="ai-rec-reason">${r.reason}</div>
    </div>
  `).join('');
}

// ─── RENDER LIVE FEED ─────────────────────────────────────────────────────────
function renderLiveFeed() {
  const list = document.getElementById('liveFeedList');
  if (!list) return;
  list.innerHTML = LIVE_FEED_EVENTS.map(e => `
    <div class="feed-item">
      <span class="feed-time">${e.time}</span>
      <span class="feed-msg">${e.msg}</span>
    </div>
  `).join('');
}

// ─── RENDER TOP RISK VESSELS ──────────────────────────────────────────────────
function renderTopRiskVessels() {
  const container = document.getElementById('riskVesselList');
  if (!container) return;

  const topRisk = getHighRiskVessels().slice(0, 5);
  container.innerHTML = topRisk.map(v => {
    const cls = getRiskClass(v.riskScore);
    return `
      <div class="risk-vessel-row" onclick="openVesselModal('${v.id}')">
        <span class="risk-vessel-id">${v.id}</span>
        <span class="risk-vessel-name">${v.name}</span>
        <div style="min-width:100px;">
          ${buildRiskBar(v.riskScore)}
        </div>
        ${buildBadge(v.status)}
      </div>
    `;
  }).join('');
}

// ─── RENDER 72H FORECAST MINI ─────────────────────────────────────────────────
function renderForecastMini() {
  const container = document.getElementById('forecastMini');
  if (!container) return;

  // Simulated forecast values (seeded to match the story)
  const windows = [
    { label:'0–24h',  pct:64, label2:'High',     cls:'high',     vessels:21, note:'Current congestion elevated due to cluster arrivals.' },
    { label:'24–48h', pct:78, label2:'High',      cls:'high',     vessels:14, note:'Crane C-04 remains offline. Berth demand increases.' },
    { label:'48–72h', pct:87, label2:'Critical',  cls:'critical', vessels:18, note:'Yard Zone B forecast to reach capacity. Crisis risk.' }
  ];

  container.innerHTML = windows.map(w => `
    <div style="margin-bottom:10px;">
      <div class="forecast-bar-row">
        <span class="fc-label">${w.label}</span>
        <div class="fc-bar-wrap">
          <div class="fc-bar-fill ${w.cls}" style="width:${w.pct}%;">${w.label2}</div>
        </div>
        <span class="fc-pct ${w.cls}">${w.pct}%</span>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-left:64px;margin-top:2px;">${w.note}</div>
    </div>
  `).join('');

  // Spacer + legend
  container.innerHTML += `
    <div style="display:flex;gap:12px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
      <span style="font-size:11px;color:var(--text-muted);">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--status-high);margin-right:4px;"></span>High
      </span>
      <span style="font-size:11px;color:var(--text-muted);">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--status-critical);margin-right:4px;"></span>Critical
      </span>
      <span style="font-size:11px;color:var(--text-muted);margin-left:auto;">Est. — simulation data</span>
    </div>
  `;
}

// ─── RENDER ACTIVE DISRUPTIONS SUMMARY ───────────────────────────────────────
function renderDisruptionSummary() {
  const container = document.getElementById('disruptionSummaryList');
  if (!container) return;

  const active = getActiveDisruptions().slice(0, 5);
  container.innerHTML = active.map(d => {
    const cls = getStatusClass(d.severity);
    return `
      <div class="dis-row" onclick="window.location.href='disruptions.html'">
        <span class="badge ${cls}" style="font-size:10px;">${d.severity}</span>
        <span class="dis-type">${d.subtype}</span>
        <span class="dis-location">${d.location.split('/')[0].trim()}</span>
      </div>
    `;
  }).join('');
}

// ─── VESSEL MODAL ─────────────────────────────────────────────────────────────
function openVesselModal(vesselId) {
  const vessel = getVesselById(vesselId);
  if (!vessel) return;

  document.getElementById('vesselModalTitle').textContent = `${vessel.name} — ${vessel.id}`;

  const riskCls    = getRiskClass(vessel.riskScore);
  const statusCls  = getStatusClass(vessel.status);
  const factors    = vessel.riskFactors.map(f => `<li>${getRiskFactorLabel(f)}</li>`).join('');

  document.getElementById('vesselModalBody').innerHTML = `
    <div class="detail-grid" style="margin-bottom:16px;">
      <div class="detail-item"><div class="detail-label">Vessel ID</div><div class="detail-val font-mono">${vessel.id}</div></div>
      <div class="detail-item"><div class="detail-label">Status</div><div class="detail-val">${buildBadge(vessel.status)}</div></div>
      <div class="detail-item"><div class="detail-label">Flag</div><div class="detail-val">${vessel.flag}</div></div>
      <div class="detail-item"><div class="detail-label">Type</div><div class="detail-val">${vessel.type}</div></div>
      <div class="detail-item"><div class="detail-label">ETA</div><div class="detail-val font-mono">${formatDateTime(vessel.eta)}</div></div>
      <div class="detail-item"><div class="detail-label">ETD</div><div class="detail-val font-mono">${formatDateTime(vessel.etd)}</div></div>
      <div class="detail-item"><div class="detail-label">Cargo</div><div class="detail-val">${vessel.cargo}</div></div>
      <div class="detail-item"><div class="detail-label">Containers</div><div class="detail-val font-mono">${fmtNum(vessel.containers)} TEU</div></div>
      <div class="detail-item"><div class="detail-label">Assigned Berth</div><div class="detail-val">${vessel.assignedBerth}</div></div>
      <div class="detail-item"><div class="detail-label">Waiting Time</div><div class="detail-val font-mono">${vessel.waitingTime}h</div></div>
      <div class="detail-item"><div class="detail-label">Priority</div><div class="detail-val">${vessel.priority}</div></div>
      <div class="detail-item"><div class="detail-label">Route</div><div class="detail-val text-sm">${vessel.route}</div></div>
    </div>

    <hr class="divider" />

    <div style="margin-bottom:16px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">AI-Assisted Risk Score</div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <div style="font-size:36px;font-weight:800;font-family:var(--font-mono);color:var(--status-${riskCls});">${vessel.riskScore}</div>
        <div>
          <div class="badge ${riskCls}" style="margin-bottom:4px;">${riskCls.toUpperCase()} RISK</div>
          <div style="font-size:11px;color:var(--text-muted);">AI-assisted operational estimate</div>
        </div>
        <div style="flex:1;">${buildRiskBar(vessel.riskScore)}</div>
      </div>
      ${factors ? `
        <div style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:6px;">Risk Factors:</div>
        <ul class="ai-reason-list">${factors}</ul>
      ` : '<div style="font-size:12px;color:var(--status-low);">No significant risk factors identified.</div>'}
    </div>

    <hr class="divider" />

    <div class="ai-card">
      <div class="ai-card-label">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="2"/><path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" opacity=".6"/></svg>
        AI Recommendation
      </div>
      <div class="ai-card-title">${vessel.riskScore >= 81
        ? `Immediate action required for ${vessel.name}`
        : vessel.riskScore >= 61
          ? `Monitor and prepare contingency for ${vessel.name}`
          : `${vessel.name} is operating within acceptable parameters`
      }</div>
      <div class="ai-card-body">
        ${vessel.riskScore >= 81
          ? `Consider reassigning to Berth 07 (currently available). Estimated wait time reduction: 4.8 hours. Prioritise refrigerated cargo unloading. Allocate Crane C-03 from Berth 02.`
          : vessel.riskScore >= 61
            ? `Monitor berth availability closely. Pre-position cranes. Alert yard team to prepare receiving area.`
            : `No immediate action required. Continue standard operations.`
        }
        <div style="margin-top:8px;font-size:11px;color:var(--text-muted);">Status: Simulation estimate — not a validated prediction.</div>
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-top:16px;">
      <a href="vessels.html" class="btn btn-primary btn-sm">View in Vessel Operations</a>
      <a href="berths.html" class="btn btn-secondary btn-sm">Berth Planning</a>
      <button class="modal-close btn btn-ghost btn-sm" data-modal-close="vesselModal">Close</button>
    </div>
  `;

  openModal('vesselModal');
}

// ─── UPDATE SIDEBAR BADGE COUNTS ─────────────────────────────────────────────
function updateSidebarCounts() {
  const activeDisruptions = getActiveDisruptions().length;
  const disEl = document.getElementById('disruptionCount');
  if (disEl) disEl.textContent = activeDisruptions;

  const unreadNotifs = getNotifications().filter(n => !n.read).length;
  const navCountEl   = document.getElementById('notifNavCount');
  if (navCountEl) navCountEl.textContent = unreadNotifs;
}

// ─── SIMULATE LIVE UPDATES (optional subtle animation) ────────────────────────
let feedUpdateInterval = null;

function startLiveFeedAnimation() {
  let idx = 0;
  feedUpdateInterval = setInterval(() => {
    const list = document.getElementById('liveFeedList');
    if (!list) return;
    // Cycle through feed entries to simulate "live" activity
    const now  = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
    const msgs = [
      `<strong>AI Engine</strong> — risk scores updated for 30 vessels.`,
      `<strong>Yard Zone B</strong> utilisation re-calculated: 91%.`,
      `<strong>V-104</strong> position updated — awaiting berth assignment.`
    ];
    const newItem = document.createElement('div');
    newItem.className = 'feed-item';
    newItem.innerHTML = `<span class="feed-time">${time}</span><span class="feed-msg">${msgs[idx % msgs.length]}</span>`;
    list.insertBefore(newItem, list.firstChild);
    if (list.children.length > 14) list.removeChild(list.lastChild);
    idx++;
  }, 30000); // Add a new entry every 30s to simulate activity
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderKPIs();
  renderPortMap();
  renderAIRecommendations();
  renderLiveFeed();
  renderTopRiskVessels();
  renderForecastMini();
  renderDisruptionSummary();
  updateSidebarCounts();
  startLiveFeedAnimation();

  // Show welcome toast on first load
  setTimeout(() => {
    const congestion = getPortCongestionRisk();
    showToast(
      `Port congestion: ${congestion}% — ${congestion >= 80 ? 'CRITICAL' : 'HIGH'} risk`,
      `${getCriticalVessels().length} critical vessels require attention. AI has generated ${AI_RECOMMENDATIONS.length} recommendations.`,
      congestion >= 80 ? 'error' : 'warning',
      6000
    );
  }, 800);
});
