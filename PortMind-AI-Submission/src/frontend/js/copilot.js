/**
 * PortMind AI — AI Copilot
 * copilot.js
 */

// ─── INTENT DETECTION ────────────────────────────────────────────────────────
function detectIntent(query) {
  const q = query.toLowerCase();
  if ((q.includes('most') && (q.includes('risk') || q.includes('danger'))) ||
      q.includes('highest risk') || q.includes('riskiest'))                       return 'VESSEL_RISK';
  if ((q.includes('why') || q.includes('reason') || q.includes('explain')) &&
      (q.includes('v-104') || q.includes('104') || q.includes('adriana')))        return 'VESSEL_EXPLAIN_104';
  if (q.match(/v-\d+/) && (q.includes('why') || q.includes('risk') || q.includes('score'))) return 'VESSEL_EXPLAIN_GENERIC';
  if ((q.includes('berth') || q.includes('assign') || q.includes('dock')) &&
      (q.includes('v-104') || q.includes('104')))                                 return 'BERTH_ASSIGN_104';
  if (q.includes('crane') && (q.includes('idle') || q.includes('underutil') ||
      q.includes('available') || q.includes('unused')))                           return 'CRANE_STATUS';
  if ((q.includes('congest') || q.includes('busy') || q.includes('traffic')) &&
      (q.includes('24') || q.includes('next') || q.includes('forecast') || q.includes('hour') || q.includes('caus') || q.includes('today') || q.includes('why'))) return 'CONGESTION_FORECAST';
  if (q.includes('berth 4') || q.includes('b-04') || q.includes('unavail') ||
      q.includes('closed') || q.includes('breaks'))                               return 'BERTH_CONTINGENCY';
  if (q.includes('prioritis') || q.includes('priority') || q.includes('first'))   return 'VESSEL_PRIORITY';
  if (q.includes('brief') || q.includes('report') || q.includes('summary') ||
      q.includes('what should') || q.includes('do now') || q.includes('manager')) return 'OPS_BRIEF';
  if (q.includes('yard') || q.includes('zone') || q.includes('capacity'))         return 'YARD_STATUS';
  if (q.includes('disruption') || q.includes('weather') || q.includes('crane fail')) return 'DISRUPTION_STATUS';
  return 'GENERAL_STATUS';
}

// ─── RESPONSE BUILDERS ────────────────────────────────────────────────────────
function buildResponse(intent, query) {
  const vessels     = getVessels();
  const berths      = getBerths();
  const cranes      = getCranes();
  const yard        = getYard();
  const disruptions = getDisruptions();

  switch (intent) {

    case 'VESSEL_RISK': {
      const top5 = getHighRiskVessels().slice(0, 5);
      return `
        <div class="bottom-line">The highest-risk vessel is <strong>MSC Adriana (V-104)</strong> with a risk score of <strong>91/100 — Critical</strong>.</div>
        <div class="section">
          <div class="section-title">Top 5 At-Risk Vessels</div>
          <div class="section-body">
            ${top5.map(v => `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span class="badge ${getRiskClass(v.riskScore)}">${v.riskScore}</span>
                <strong>${v.id}</strong> ${v.name}
                <span style="color:var(--text-muted);font-size:12px;">· ${v.status} · Wait: ${v.waitingTime}h</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="section">
          <div class="section-title">Recommended Action</div>
          <div class="section-body">Immediate attention on <strong>V-104, V-121, V-112</strong>. All three are Critical. Reassign V-104 to Berth 07 to reduce congestion at Berth 03.</div>
        </div>
        <div class="ai-disclaimer">Based on simulated port data · Risk scores are AI-assisted estimates</div>
      `;
    }

    case 'VESSEL_EXPLAIN_104': {
      const v = getVesselById('V-104');
      const factors = v.riskFactors.map(f => `<li>${getRiskFactorLabel(f)}</li>`).join('');
      return `
        <div class="bottom-line"><strong>V-104 MSC Adriana</strong> has a risk score of <strong>91/100 — Critical</strong>. This is the highest-risk vessel in the current window.</div>
        <div class="section">
          <div class="section-title">Contributing Risk Factors</div>
          <div class="section-body"><ul class="ai-reason-list">${factors}</ul></div>
        </div>
        <div class="section">
          <div class="section-title">Key Facts</div>
          <div class="section-body">
            Assigned Berth: <strong>B-03 (Congested, 100%)</strong><br>
            Waiting Time: <strong>2.4 hours</strong><br>
            Cargo: <strong>General / Refrigerated — time-sensitive</strong><br>
            Crane C-06 at B-03: <strong>Failed (hydraulic fault)</strong>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Recommended Action</div>
          <div class="section-body">Reassign V-104 to <strong>Berth 07</strong> (currently available). Allocate <strong>Crane C-03</strong> (idle, 8%). Estimated wait reduction: <strong>4.8 hours</strong>.</div>
        </div>
        <div class="ai-disclaimer">Based on simulated port data · Simulation estimate only</div>
      `;
    }

    case 'VESSEL_EXPLAIN_GENERIC': {
      const match = query.match(/v-(\d+)/i);
      const vid   = match ? `V-${match[1]}` : null;
      const v     = vid ? getVesselById(vid.toUpperCase()) : null;
      if (!v) return `<div class="bottom-line">I could not find a vessel matching that ID. Try asking about V-104, V-112, or V-121.</div>`;
      const cls = getRiskClass(v.riskScore);
      const factors = v.riskFactors.length > 0
        ? `<ul class="ai-reason-list">${v.riskFactors.map(f => `<li>${getRiskFactorLabel(f)}</li>`).join('')}</ul>`
        : '<span style="color:var(--status-low);">No significant risk factors identified.</span>';
      return `
        <div class="bottom-line"><strong>${v.name} (${v.id})</strong> has a risk score of <strong>${v.riskScore}/100 — ${cls.toUpperCase()}</strong>.</div>
        <div class="section"><div class="section-title">Risk Factors</div><div class="section-body">${factors}</div></div>
        <div class="section"><div class="section-title">Status</div><div class="section-body">Current status: <strong>${v.status}</strong> · Waiting: <strong>${v.waitingTime}h</strong> · Berth: <strong>${v.assignedBerth}</strong></div></div>
        <div class="ai-disclaimer">Based on simulated port data · AI-assisted estimate</div>
      `;
    }

    case 'BERTH_ASSIGN_104': {
      return `
        <div class="bottom-line">I recommend assigning <strong>V-104 MSC Adriana</strong> to <strong>Berth 07 (B-07)</strong>, which is currently available.</div>
        <div class="section">
          <div class="section-title">Why Berth 07?</div>
          <div class="section-body">
            • B-07 is the only berth with <strong>Available</strong> status and sufficient capacity (2,500 TEU)<br>
            • B-03 (current assignment) is at <strong>100% utilisation</strong> with Crane C-06 failed<br>
            • B-07 has Crane C-13 ready at 22% utilisation<br>
            • Reassignment estimated to reduce V-104 waiting time by <strong>4.8 hours</strong>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Additional Action</div>
          <div class="section-body">Also reassign <strong>Crane C-03</strong> (idle, 8%) to B-03 to support V-103 currently in berth.</div>
        </div>
        <div class="ai-disclaimer">Simulation estimate · Requires operator confirmation</div>
      `;
    }

    case 'CRANE_STATUS': {
      const idle   = getIdleCranes();
      const maint  = cranes.filter(c => c.status === 'Maintenance');
      return `
        <div class="bottom-line">There are <strong>${idle.length} idle cranes</strong> and <strong>${maint.length} cranes in maintenance</strong> right now.</div>
        <div class="section">
          <div class="section-title">Idle / Underutilised Cranes</div>
          <div class="section-body">
            ${idle.map(c => `
              <div style="margin-bottom:5px;">
                <strong>${c.id}</strong> (${c.type}) — ${c.utilisation}% util at ${c.location}
                <span class="badge idle" style="font-size:10px;margin-left:4px;">Idle</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="section">
          <div class="section-title">AI Recommendation</div>
          <div class="section-body"><strong>C-03</strong> should be reassigned to Berth 03 immediately to compensate for C-06 failure. <strong>C-12</strong> and <strong>C-02</strong> are also available for deployment.</div>
        </div>
        <div class="ai-disclaimer">Based on simulated port data</div>
      `;
    }

    case 'CONGESTION_FORECAST': {
      return `
        <div class="bottom-line">Yes — port congestion is forecast to <strong>increase significantly</strong> over the next 24–72 hours.</div>
        <div class="section">
          <div class="section-title">72-Hour Forecast</div>
          <div class="section-body">
            <div style="margin-bottom:5px;"><strong>0–24h:</strong> <span style="color:var(--status-high);">64% — High</span> · 21 vessels arriving, Crane C-04 offline</div>
            <div style="margin-bottom:5px;"><strong>24–48h:</strong> <span style="color:var(--status-high);">78% — High</span> · Berth 05 conflict unresolved, yard pressure rising</div>
            <div style="margin-bottom:5px;"><strong>48–72h:</strong> <span style="color:var(--status-critical);">87% — Critical</span> · Yard Zone B forecast overflow, high arrival cluster</div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Why?</div>
          <div class="section-body">Primary drivers: <strong>Crane C-04 offline</strong>, <strong>Berths 03 and 05 congested</strong>, <strong>Yard Zone B at 91%</strong>, and a cluster of 18 arrivals in the 48–72h window.</div>
        </div>
        <div class="ai-disclaimer">Simulation estimate · View AI Simulator for full forecast</div>
      `;
    }

    case 'BERTH_CONTINGENCY': {
      return `
        <div class="bottom-line">If Berth 04 (B-04) becomes unavailable, <strong>Berth 07 (B-07)</strong> is the best immediate alternative.</div>
        <div class="section">
          <div class="section-title">Contingency Plan</div>
          <div class="section-body">
            1. Redirect <strong>V-114 Arkas Antalya</strong> (next vessel for B-04) to <strong>B-07</strong> — available now<br>
            2. Alert pilot station of berth re-assignment<br>
            3. Notify crane team to prepare <strong>C-13</strong> at B-07<br>
            4. Re-schedule V-124 (next after V-114) to B-04 when it reopens
          </div>
        </div>
        <div class="section">
          <div class="section-title">Expected Impact</div>
          <div class="section-body">Minimal delay if acted within 2 hours. V-114 estimated wait increase: <strong>0.8 hours</strong>.</div>
        </div>
        <div class="ai-disclaimer">Simulation estimate · Requires operator confirmation</div>
      `;
    }

    case 'VESSEL_PRIORITY': {
      const priority = [
        { id:'V-117', name:'X-Press Tropics',    reason:'Perishables / Cut Flowers — time-critical cold chain', priority:'1st' },
        { id:'V-128', name:'Seatrade Orange',     reason:'Perishables / Fruit — time-critical cold chain', priority:'2nd' },
        { id:'V-110', name:'Wan Hai Falcon',      reason:'Refrigerated seafood — temperature-sensitive', priority:'3rd' },
        { id:'V-104', name:'MSC Adriana',         reason:'Critical risk (91), refrigerated cargo, long wait', priority:'4th' },
        { id:'V-111', name:'PIL Resilience',      reason:'Hazmat cargo requires priority handling protocols', priority:'5th' }
      ];
      return `
        <div class="bottom-line">Vessels carrying <strong>perishables</strong> and <strong>hazmat cargo</strong> should be prioritised, followed by high-risk vessels.</div>
        <div class="section">
          <div class="section-title">Recommended Priority Order</div>
          <div class="section-body">
            ${priority.map(p => `
              <div style="margin-bottom:6px;display:flex;align-items:flex-start;gap:8px;">
                <span style="font-size:11px;font-weight:700;color:var(--accent-cyan);min-width:24px;">${p.priority}</span>
                <div><strong>${p.id} ${p.name}</strong><br><span style="font-size:12px;color:var(--text-secondary);">${p.reason}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="ai-disclaimer">Based on cargo type priority rules and simulated risk scores</div>
      `;
    }

    case 'OPS_BRIEF': {
      const congestion = getPortCongestionRisk();
      const critVessels = getCriticalVessels();
      const activeDisruptions = getActiveDisruptions();
      const yardUtil = getYardUtilisationPct();
      return `
        <div class="bottom-line">Current port status is <strong>HIGH CONGESTION (${congestion}%)</strong> with ${critVessels.length} critical vessels requiring immediate attention.</div>
        <div class="section">
          <div class="section-title">Key Risks Right Now</div>
          <div class="section-body">
            • <strong>${critVessels.length} critical vessels</strong>: V-104 (91), V-121 (88), V-112 (86), V-109 (83)<br>
            • <strong>Berths 03 and 05</strong> at 100% and 97% — congested<br>
            • <strong>Yard Zone B at 91%</strong> — redistribution urgent<br>
            • <strong>Crane C-04 and C-15</strong> offline<br>
            • <strong>${activeDisruptions.length} active disruptions</strong> including crane failure and labour action
          </div>
        </div>
        <div class="section">
          <div class="section-title">Top 3 Immediate Actions</div>
          <div class="section-body">
            1. <strong>Reassign V-104 to Berth 07</strong> — frees B-03, reduces critical risk<br>
            2. <strong>Redeploy Crane C-03 to B-03</strong> — restores crane capacity<br>
            3. <strong>Move containers from Zone B to Zone C</strong> — prevents yard overflow
          </div>
        </div>
        <div class="section">
          <div class="section-title">72-Hour Outlook</div>
          <div class="section-body">Congestion forecast: <span style="color:var(--status-high);">64%</span> → <span style="color:var(--status-high);">78%</span> → <span style="color:var(--status-critical);">87%</span>. Escalation is likely without action.</div>
        </div>
        <div style="margin-top:10px;"><a href="reports.html" class="btn btn-secondary btn-sm">Generate Full Report →</a></div>
        <div class="ai-disclaimer">Based on simulated port data · See Reports page for printable brief</div>
      `;
    }

    case 'YARD_STATUS': {
      const zones = yard.zones;
      const critZone = zones.find(z => z.status === 'Critical');
      const total = zones.reduce((s,z) => s + z.capacity, 0);
      const used  = zones.reduce((s,z) => s + z.occupied, 0);
      const pct   = Math.round((used/total)*100);
      return `
        <div class="bottom-line">Overall yard utilisation is <strong>${pct}%</strong>. <strong>Zone B is at 91% — Critical</strong> and requires immediate redistribution.</div>
        <div class="section">
          <div class="section-title">Zone Breakdown</div>
          <div class="section-body">
            ${zones.map(z => {
              const p = Math.round((z.occupied/z.capacity)*100);
              const c = utilisationClass(p);
              return `<div style="margin-bottom:4px;"><strong>${z.name}:</strong> <span style="color:var(--status-${c});">${p}%</span> — ${z.status}</div>`;
            }).join('')}
          </div>
        </div>
        <div class="section">
          <div class="section-title">Recommended Action</div>
          <div class="section-body">Move <strong>200 TEU</strong> from Zone B (91%) to Zone C (52%). Prioritise reefer cargo to Zone F.</div>
        </div>
        <div class="ai-disclaimer">Based on simulated yard data</div>
      `;
    }

    case 'DISRUPTION_STATUS': {
      const active = getActiveDisruptions();
      return `
        <div class="bottom-line">There are currently <strong>${active.length} active disruptions</strong> affecting port operations.</div>
        <div class="section">
          <div class="section-title">Active Disruptions</div>
          <div class="section-body">
            ${active.slice(0,4).map(d => `
              <div style="margin-bottom:6px;">
                <span class="badge ${getStatusClass(d.severity)}" style="font-size:10px;">${d.severity}</span>
                <strong style="margin-left:6px;">${d.subtype}</strong> — ${d.location}<br>
                <span style="font-size:12px;color:var(--text-secondary);">${d.estimatedImpact}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="ai-disclaimer">Based on simulated disruption data</div>
      `;
    }

    default: { // GENERAL_STATUS
      const congestion = getPortCongestionRisk();
      const inPort     = getVesselsInPort();
      const waiting    = getAverageWaitingTime();
      const cls        = getRiskClass(congestion);
      return `
        <div class="bottom-line">Port is currently operating under <strong>${cls.toUpperCase()} CONGESTION (${congestion}%)</strong> with ${inPort} vessels active.</div>
        <div class="section">
          <div class="section-title">Port Summary</div>
          <div class="section-body">
            <strong>Vessels in port:</strong> ${inPort}<br>
            <strong>Congestion risk:</strong> <span style="color:var(--status-${cls});">${congestion}% — ${cls.toUpperCase()}</span><br>
            <strong>Average wait:</strong> ${waiting} hours<br>
            <strong>Yard utilisation:</strong> ${getYardUtilisationPct()}%<br>
            <strong>Active disruptions:</strong> ${getActiveDisruptions().length}
          </div>
        </div>
        <div class="section">
          <div class="section-title">What I Can Help With</div>
          <div class="section-body">
            Try asking: "Which vessel is most at risk?", "Why is V-104 high risk?", "Which cranes are idle?", or "Generate an operations briefing."
          </div>
        </div>
        <div class="ai-disclaimer">Based on simulated port data</div>
      `;
    }
  }
}

// ─── CHAT UI ──────────────────────────────────────────────────────────────────
function addBubble(html, role) {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  if (role === 'ai') {
    bubble.innerHTML = `<div class="ai-label">PortMind AI Copilot</div>${html}`;
  } else {
    bubble.textContent = html;
  }
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  if (!messages) return null;
  const el = document.createElement('div');
  el.className = 'typing-indicator';
  el.id = 'typingIndicator';
  el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
  return el;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function sendMessage(text) {
  if (!text.trim()) return;

  // Clear input
  const input = document.getElementById('chatInput');
  if (input) input.value = '';

  // Hide suggestions after first message
  const sugg = document.getElementById('suggestions');
  if (sugg) sugg.style.display = 'none';

  // Add user bubble
  addBubble(text, 'user');

  // Show typing indicator
  const typing = showTyping();

  // Detect intent and build response
  const intent   = detectIntent(text);
  const response = buildResponse(intent, text);

  // Simulate AI "thinking" delay
  setTimeout(() => {
    removeTyping();
    addBubble(response, 'ai');
  }, 1100 + Math.random() * 400);
}

// ─── STATUS SIDEBAR ───────────────────────────────────────────────────────────
function renderStatusSidebar() {
  const el = document.getElementById('statusSidebar');
  if (!el) return;

  const congestion = getPortCongestionRisk();
  const cls        = getRiskClass(congestion);
  const yardUtil   = getYardUtilisationPct();
  const critVessels = getCriticalVessels().length;

  el.innerHTML = `
    <div class="metric-row"><span class="metric-key">Congestion</span><span class="metric-val" style="color:var(--status-${cls});">${congestion}%</span></div>
    <div class="metric-row"><span class="metric-key">Critical Vessels</span><span class="metric-val" style="color:var(--status-critical);">${critVessels}</span></div>
    <div class="metric-row"><span class="metric-key">Yard Utilisation</span><span class="metric-val" style="color:var(--status-${utilisationClass(yardUtil)});">${yardUtil}%</span></div>
    <div class="metric-row"><span class="metric-key">Active Disruptions</span><span class="metric-val">${getActiveDisruptions().length}</span></div>
  `;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Welcome message
  addBubble(`
    <div class="bottom-line">Hello, J. Mueller. I'm your PortMind AI Copilot.</div>
    <div class="section">
      <div class="section-title">Current Situation</div>
      <div class="section-body">
        Port congestion is at <strong style="color:var(--status-high);">${getPortCongestionRisk()}%</strong> — HIGH risk.
        There are <strong style="color:var(--status-critical);">${getCriticalVessels().length} critical vessels</strong>
        and <strong>${getActiveDisruptions().length} active disruptions</strong>.
      </div>
    </div>
    <div class="section-body" style="font-size:12px;color:var(--text-secondary);">Ask me anything about vessel risk, berths, cranes, yard capacity, or request an operations briefing. Use the quick questions on the right to get started.</div>
    <div class="ai-disclaimer">Responses based on simulated port data · All outputs are estimates</div>
  `, 'ai');

  renderStatusSidebar();

  // Send button
  const sendBtn = document.getElementById('sendBtn');
  const input   = document.getElementById('chatInput');

  if (sendBtn) sendBtn.addEventListener('click', () => sendMessage(input?.value || ''));

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
      }
    });
  }

  // Suggestion buttons
  document.querySelectorAll('.suggestion-btn[data-q]').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
});
