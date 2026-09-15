# Solution Overview

## What We Built

PortMind AI is a browser-based AI decision-support platform for port terminal operations.
It provides a unified operations control centre where port managers can see every vessel,
berth, crane, and yard zone in one place — with AI-assisted risk scoring, congestion
forecasting, disruption simulation, and natural-language query capabilities.

The product is designed around one core principle: **every AI output must explain itself.**
No recommendation is presented without a reason, an expected impact, and a confidence
level. The system is transparent by design.

## How It Works

1. **Data Ingestion** — Vessel schedules (ETA/ETD), berth assignments, crane status,
   yard zone utilisation, and active disruptions are loaded from structured data sources
   (embedded JSON for the demo; a live REST API when the backend is running).

2. **AI Risk Scoring** — Each vessel receives a 0–100 operational risk score computed
   from: berth availability, crane status, arrival volume, yard pressure, waiting time,
   disruption proximity, and cargo priority. The score is accompanied by a list of
   contributing factors with human-readable explanations.

3. **Congestion Forecasting** — A 72-hour forecast produces congestion risk percentages
   for 0–24h, 24–48h, and 48–72h windows, each with a narrative explanation of the
   primary drivers.

4. **Berth & Crane Optimisation** — The optimisation engine compares the current berth
   assignment plan against an AI-recommended plan, showing per-vessel waiting time
   improvement and the reasoning behind each reassignment.

5. **Crisis Simulation** — The AI Crisis Mode accepts a disruption scenario (type,
   severity, duration, affected area) and computes before/after metrics plus a
   5-step prioritised response plan, with reasons for every step.

6. **AI Copilot** — A natural-language chat interface detects operational intent from
   plain-language queries and responds with structured briefings drawn from live port
   data. 12 intent categories are supported, from vessel risk analysis to full
   operations briefings.

7. **Report Generation** — Three report types (Operations Brief, Vessel Risk Report,
   Disruption Summary) can be generated and printed/exported as PDF.

## Architecture Diagram

See [`architecture.md`](architecture.md) for the full diagram.

```
Browser (HTML/CSS/JS)
      │
      ├── js/api.js ──► http://localhost:3001/api/*  (live mode)
      │                        │
      │                  Express Server
      │                  server.js
      │                        │
      │                  /data/*.json ──► vessels, berths, cranes,
      │                                  disruptions, containers
      │
      └── js/data.js (offline fallback — embedded constants)
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Vanilla JS, no framework | Runs directly from `file://` — zero setup, zero build tools. Judges open one HTML file. |
| Embedded data fallback | App works perfectly without a backend — critical for hackathon demo reliability. |
| CSS Custom Properties for theming | Entire visual identity can switch from dark to light with one class toggle. |
| Every AI output has a reason | Builds trust, meets the hackathon's AI transparency requirement, realistic for enterprise buyers. |
| Modular JS (one file per page) | Clean separation of concerns — each page's logic is isolated and independently testable. |
| REST API mirrors frontend data shape | Frontend can switch from local constants to API calls by changing one data source — no restructuring needed. |

## IBM Technologies Used

- **IBM Bob:** Used as the primary AI development assistant throughout the entire
  project — architecture planning, code generation, debugging, validation, and documentation.
  Bob was used to generate all 29 source files (10 HTML, 3 CSS, 11 JS, 5 JSON) and
  the complete backend API, iterating on each component through structured prompts and
  validation rounds.

## Pages & Features

| Page | Key Features |
|---|---|
| `index.html` | B2B SaaS landing page — hero, problem/solution, features, how it works, CTA |
| `dashboard.html` | KPI strip, CSS/SVG port map with clickable vessels/berths, AI recommendations, live feed, 72h forecast |
| `vessels.html` | 30-vessel table with search, 6 filter types, column sort, AI risk modal per vessel |
| `berths.html` | Stats strip, 24h visual timeline, berth cards, **Optimise Berths** AI comparison panel |
| `cranes.html` | 6-stat strip, AI recommendation cards, 15 crane cards, reassign modal |
| `yard.html` | 4 KPI cards, AI rec cards, 6 zone cards with zone detail modal |
| `disruptions.html` | Stats, filter chips, **Calculate Impact** toggle with before/after metrics |
| `simulator.html` | 72h forecast windows, crisis form, **RUN SIMULATION** → before/after + AI response plan |
| `copilot.html` | Chat UI, typing indicator, 8 quick-question suggestions, 12 intent types |
| `reports.html` | 3 report types, **Generate** button, spinner, full printable report, **Print/Export PDF** |
