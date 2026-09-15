# Source Code — PortMind AI

All source code for the PortMind AI application is in this directory.

## Structure

```
src/
├── frontend/          HTML/CSS/JS web application (runs in any browser)
│   ├── *.html             10 application pages
│   ├── css/               3 CSS files (design system, dashboard, responsive)
│   ├── js/                12 JavaScript files (data, app shell, API client, page logic)
│   └── data/              5 JSON data files (vessels, berths, cranes, containers, disruptions)
│
└── backend/           Node.js + Express REST API
    ├── server.js          17 REST endpoints
    ├── package.json       npm dependencies (express, cors, nodemon)
    └── package-lock.json  locked dependency tree
```

## Running the Frontend (Instant — no install needed)

Open `src/frontend/index.html` in any browser.

## Running the Backend

```bash
cd src/backend
npm install
npm start
# → http://localhost:3001
```

See [`../docs/setup-guide.md`](../docs/setup-guide.md) for full instructions.
