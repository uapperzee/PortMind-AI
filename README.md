# PortMind AI

> **Predict congestion. Optimise operations. Keep cargo moving.**

AI-powered port operations intelligence that helps terminal operators predict congestion,
optimise berth and crane allocation, monitor yard capacity, and respond to disruptions —
built for the **IBM Bob AI Innovation Hackathon 2026**.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | PortMind AI |
| **Track** | AI |
| **Problem Domain** | L1 — Container Congestion Predictor & Port Operations Optimiser |
| **Team Lead** | J. Mueller — j.mueller@portmind.ai |

---

## 🚨 Problem Statement

Large ports receive hundreds of vessels daily but operate with limited berths, cranes, yard
capacity, and labour. When arrivals exceed capacity, congestion cascades into vessel waiting,
yard overflow, crane under-utilisation, delivery delays, and supply-chain disruption. Port
operators currently rely on spreadsheets and fragmented systems — they lack a unified
AI-assisted decision-support platform that tells them **what is happening, why, what will
happen next, and what to do right now**.

---

## 💡 Solution

PortMind AI is an intelligent port operations control centre that ingests vessel, berth,
crane, and yard data to:

- **Predict** congestion risk with AI-assisted scoring (0–100) for every vessel
- **Optimise** berth and crane allocation with before/after comparison
- **Monitor** yard capacity by zone with redistribution recommendations
- **Simulate** disruption scenarios and generate prioritised AI response plans
- **Answer** plain-language operational queries via the PortMind Copilot

Every recommendation includes a **reason**, **expected impact**, and **confidence level**.
Nothing is presented as magic — the system is transparent by design.

---

## ⭐ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **AI Risk Scoring** | 0–100 risk score per vessel with factor-level explanations (berth shortage, crane unavailability, yard pressure, etc.) |
| 2 | **72-Hour Forecast** | Congestion forecast for 0–24h / 24–48h / 48–72h windows with narrative reasoning |
| 3 | **AI Crisis Mode** | Simulate any disruption (weather, strike, crane failure, flood) → before/after metrics + 5-step AI response plan |
| 4 | **Berth Optimisation** | Current plan vs AI-optimised plan with per-vessel wait time improvement |
| 5 | **PortMind Copilot** | Natural-language AI chat interface — ask about vessels, berths, cranes, yard, or request an operations briefing |

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **IBM Technologies** | IBM Bob (AI assistant used throughout development and architecture) |
| **Data** | JSON flat-file (demo); PostgreSQL-ready architecture |
| **Other** | REST API, CSS Custom Properties, LocalStorage |

> **No React, Angular, Vue, or build tools.** The entire frontend runs from a browser
> directly — open `index.html` and it works.

---

## 📁 Repository Structure

```
├── src/
│   ├── frontend/          # All HTML, CSS, JS — the complete web application
│   │   ├── index.html          Landing page
│   │   ├── dashboard.html      Main operations control centre
│   │   ├── vessels.html        Vessel operations + AI risk table
│   │   ├── berths.html         Berth management + timeline + optimisation
│   │   ├── cranes.html         Crane operations + AI recommendations
│   │   ├── yard.html           Yard intelligence + zone capacity
│   │   ├── disruptions.html    Disruption centre + impact analysis
│   │   ├── simulator.html      AI simulator + 72h forecast + crisis mode
│   │   ├── copilot.html        PortMind Copilot (AI chat interface)
│   │   ├── reports.html        AI operations report generator
│   │   ├── css/
│   │   │   ├── style.css           Global design system (dark enterprise theme)
│   │   │   ├── dashboard.css       Dashboard-specific styles + port map
│   │   │   └── responsive.css      Mobile/tablet breakpoints
│   │   ├── js/
│   │   │   ├── data.js             Embedded demo data (offline fallback)
│   │   │   ├── app.js              App shell (sidebar, nav, toasts, modals)
│   │   │   ├── api.js              Frontend API client (live/offline auto-switch)
│   │   │   ├── dashboard.js        Dashboard rendering + port map
│   │   │   ├── vessels.js          Vessel table, filters, AI modal
│   │   │   ├── berths.js           Berth timeline + optimisation engine
│   │   │   ├── cranes.js           Crane grid + reassignment
│   │   │   ├── yard.js             Zone cards + redistribution
│   │   │   ├── disruptions.js      Disruption list + impact calculator
│   │   │   ├── simulator.js        72h forecast + crisis simulation
│   │   │   ├── copilot.js          AI Copilot intent detection + responses
│   │   │   └── reports.js          Report generators + print/export
│   │   └── data/               JSON data contracts (backend-ready)
│   │       ├── vessels.json        30 vessels
│   │       ├── berths.json         10 berths
│   │       ├── cranes.json         15 cranes
│   │       ├── containers.json     50 containers
│   │       └── disruptions.json    10 disruptions
│   └── backend/               Node.js + Express REST API
│       ├── server.js               17 REST endpoints
│       ├── package.json
│       └── README.md
├── docs/
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/
│   ├── screenshots/           App screenshots
│   ├── demo-video-link.txt
│   └── live-demo-url.txt
├── presentation/              Slide deck
└── submission.yaml            Structured submission metadata
```

---

## 🚀 How to Run

### Option A — No server needed (instant)
```bash
# Just open the file in a browser
open src/frontend/index.html
# or double-click index.html in Explorer
```

### Option B — With live backend API
```bash
# Install Node.js 16+ from https://nodejs.org first

# 1. Install dependencies
cd src/backend
npm install

# 2. Start the server
npm start

# 3. Open the app
# http://localhost:3001
```

The frontend **automatically detects** whether the backend is running and switches between
live API data and embedded demo data — no configuration needed.

---

## 🎯 Demo

| Artifact | Link |
|---|---|
| 🎬 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 📸 Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

### Hackathon Demo Flow (2-minute walkthrough)
1. `index.html` → Landing page → **Explore Dashboard**
2. Dashboard → Congestion = **HIGH 73%** · V-104 in top risk strip
3. Disruptions → D-002 Crane Failure Critical → **Calculate Impact**
4. Simulator → Weather / Heavy Rain / High / 12h → **RUN SIMULATION** → **31 vessels, 87%, 11.6h wait**
5. Vessels → V-104 **Risk 91 Critical** → View AI Analysis → factor breakdown
6. Berths → **Optimise Berths** → Current plan vs AI plan with 3.7h average improvement
7. Cranes → C-03 Idle · C-06 Overloaded → **Reassign Crane**
8. Yard → Zone B **91% Critical** → Click zone → redistribution modal
9. Copilot → *"What should the port manager do now?"* → structured AI briefing
10. Reports → **Generate AI Operations Brief** → print-ready report

---

## ⚠️ Known Limitations

- All data is **simulated demo data** — no real port systems are connected
- AI risk scores are **rule-based simulations**, not trained ML models
- **No authentication** implemented (prototype only)
- Tested on Chrome and Edge; minor differences may exist on Safari mobile
- Backend REST API requires Node.js; the app works fully without it (offline mode)

---

## 🏆 What We're Most Proud Of

The **AI Crisis Mode simulator** and **PortMind Copilot** demonstrate end-to-end AI
decision support. The simulator produces structured before/after impact analysis and a
prioritised 5-step response plan for any disruption type. The Copilot answers 12
categories of operational queries with structured, transparent responses that always
include a recommendation, reason, expected impact, and simulation disclaimer.

The entire 29-file application was built using only HTML, CSS, and Vanilla JavaScript
with IBM Bob as the AI development assistant — no build tools, no frameworks — yet achieves
commercial-grade visual quality and full interactivity suitable for a real SaaS product.

---

*PortMind AI — IBM Bob AI Innovation Hackathon 2026*
*"An AI decision-support platform for modern port operations."*
