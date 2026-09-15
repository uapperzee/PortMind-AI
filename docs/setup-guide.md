# Setup Guide

> **This file is read by the automated evaluation pipeline. Follow these steps exactly.**

## Prerequisites

- [ ] A modern web browser (Chrome 90+, Edge 90+, Firefox 90+, or Safari 15+)
- [ ] **For live backend mode only:** Node.js 16+ ([download from nodejs.org](https://nodejs.org))

No other software, accounts, or API keys are required for the demo.

---

## Option A — Instant (No server, no installation)

The entire application runs directly from the file system. No Node.js required.

```bash
# 1. Clone the repository
git clone https://github.com/[your-username]/portmind-ai.git
cd portmind-ai

# 2. Open the landing page in your browser
# Windows:
start src/frontend/index.html

# macOS:
open src/frontend/index.html

# Linux:
xdg-open src/frontend/index.html
```

The application loads with embedded demo data. All 10 pages are fully functional.

---

## Option B — With Live Backend API

When the Express server is running, the frontend automatically switches from embedded demo
data to live API data. A toast notification confirms the mode.

```bash
# 1. Clone the repository
git clone https://github.com/[your-username]/portmind-ai.git
cd portmind-ai

# 2. Install backend dependencies
cd src/backend
npm install

# 3. (Optional) Configure environment
cp .env.example .env
# The .env file is only needed if you add a real database or external API.
# The demo works without any .env configuration.

# 4. Start the server
npm start
```

The server will print:
```
  🚢  API running at  http://localhost:3001/api
  🌐  Frontend at     http://localhost:3001
  🏥  Health check    http://localhost:3001/api/health
```

```bash
# 5. Open the application
# Navigate to: http://localhost:3001
```

---

## Environment Variables (Optional)

The demo works without any environment variables. The `.env.example` file documents
variables you would need for a production deployment:

| Variable | Description | Required for demo |
|---|---|---|
| `PORT` | Server port (default: 3001) | No |
| `DATABASE_URL` | PostgreSQL URL (for production) | No |
| `NODE_ENV` | `development` or `production` | No |

---

## Hackathon Demo Flow (Recommended walkthrough)

Open the app and follow these steps to see all major features:

```
1. index.html         → Landing page — click "Explore Dashboard"
2. dashboard.html     → Note: Congestion 73% HIGH, V-104 in top risk strip
3. disruptions.html   → Click "Calculate Impact" on D-002 (Crane Failure, Critical)
4. simulator.html     → Select: Weather / High / 12h → click "RUN SIMULATION"
                        Result: 31 vessels affected, 87% congestion, 11.6h avg wait
5. vessels.html       → Find V-104 (Risk 91, Critical) → click "View AI Analysis"
6. berths.html        → Click "Optimise Berths" → review Current Plan vs AI Plan
7. cranes.html        → Note C-03 (Idle, 8%) and C-06 (Overloaded) → click "Reassign Crane"
8. yard.html          → Click Zone B (91%, Critical) → zone detail modal
9. copilot.html       → Type: "What should the port manager do now?"
10. reports.html      → Click "Generate AI Operations Brief" → then "Print / Export PDF"
```

---

## Running Without Internet

All fonts and assets are loaded from CDN (Google Fonts — `Inter` and `JetBrains Mono`).
If offline, the app falls back to `system-ui` / `Courier New`. All functionality works
without internet — only typography may differ slightly.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `npm: command not found` | Install Node.js from [nodejs.org](https://nodejs.org) |
| Port 3001 already in use | Run `PORT=3002 npm start` and open `http://localhost:3002` |
| Browser shows CORS error | Use Option B (server) instead of opening `file://` with `fetch()` calls |
| Page loads but looks unstyled | Ensure you opened `src/frontend/index.html`, not a subdirectory file |
| API returns 404 | Confirm the server is running with `curl http://localhost:3001/api/health` |
| Fonts not loading | App works without Google Fonts — system fonts are used as fallback |
