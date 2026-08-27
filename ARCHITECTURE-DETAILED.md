# SIH 2026 - Smart Water Quality Monitoring System
## Detailed Architecture Explanation

---

## What Are We Building?

A **website** where people can:
1. **Report** water quality problems in their area
2. **See** a map of all water quality reports
3. **Check** if their water source is safe or unsafe
4. **Get alerts** when contamination is detected

Think of it like **Google Maps but for water quality**.

---

## How It Works (Simple Explanation)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PERSON OPENS WEBSITE                                        │
│        │                                                       │
│        ▼                                                       │
│   ┌─────────┐     "Show me all water       ┌─────────┐       │
│   │ BROWSER │ ──── reports near me"  ─────▶│ SERVER  │       │
│   │ (HTML)  │ ◀─── "Here are 15 reports" ◀─│(Node.js)│       │
│   └─────────┘                              └────┬────┘       │
│        │                                        │             │
│        │                                        ▼             │
│        │                                   ┌─────────┐       │
│        │                                   │DATABASE │       │
│        │                                   │(SQLite) │       │
│        │                                   │         │       │
│        │                                   │ data.db │       │
│        │                                   └─────────┘       │
│        │                                                       │
│        ▼                                                       │
│   USER SEES MAP WITH RED/GREEN DOTS                          │
│   (Red = Unsafe, Green = Safe)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## The 3 Parts Explained

### PART 1: FRONTEND (What User Sees)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  This is everything the user sees and clicks on.               │
│  It runs in the browser (Chrome, Firefox, etc.)                │
│                                                                 │
│  FILES:                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  index.html          ← Main page (home)                │   │
│  │  login.html          ← Login page                      │   │
│  │  register.html       ← Register page                   │   │
│  │  dashboard.html      ← Charts and stats                │   │
│  │  map.html            ← Interactive map                 │   │
│  │  report.html         ← Submit water report form        │   │
│  │  my-reports.html     ← See your submitted reports      │   │
│  │                                                         │   │
│  │  css/style.css       ← How everything looks            │   │
│  │                                                         │   │
│  │  js/app.js           ← Main logic                      │   │
│  │  js/auth.js          ← Login/Register logic            │   │
│  │  js/api.js           ← Talks to backend                │   │
│  │  js/map.js           ← Map logic (Leaflet)             │   │
│  │  js/charts.js        ← Chart logic (Chart.js)          │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  WHAT EACH FILE DOES:                                          │
│                                                                 │
│  index.html:                                                   │
│  ┌─────────────────────────────────────┐                      │
│  │  ┌─────────────────────────────┐    │                      │
│  │  │     WATER QUALITY MAP       │    │  ← Title            │
│  │  └─────────────────────────────┘    │                      │
│  │                                     │                      │
│  │  [Login]  [Register]               │  ← Buttons           │
│  │                                     │                      │
│  │  ┌──────────┐  ┌──────────┐       │                      │
│  │  │ Safe: 45 │  │Unsafe:12 │       │  ← Stats boxes       │
│  │  └──────────┘  └──────────┘       │                      │
│  │                                     │                      │
│  │  ┌─────────────────────────────┐    │                      │
│  │  │                             │    │                      │
│  │  │     INTERACTIVE MAP         │    │  ← Leaflet map      │
│  │  │     (OpenStreetMap)         │    │                      │
│  │  │                             │    │                      │
│  │  └─────────────────────────────┘    │                      │
│  │                                     │                      │
│  └─────────────────────────────────────┘                      │
│                                                                 │
│  js/api.js (Talks to Backend):                                 │
│                                                                 │
│  // This file sends requests to our server                    │
│  // Example: Get all water reports                            │
│                                                                 │
│  async function getReports() {                                │
│    const response = await fetch('http://localhost:5000/api/reports');
│    const data = await response.json();                        │
│    return data;  // Returns list of reports                   │
│  }                                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### PART 2: BACKEND (Server Logic)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  This is the "brain" that processes requests.                  │
│  It runs on your laptop as a server.                           │
│                                                                 │
│  FILES:                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  server.js             ← Main server (starts here)     │   │
│  │  package.json          ← Lists all packages we use     │   │
│  │                                                         │   │
│  │  db/                                                   │   │
│  │    database.js         ← Connects to SQLite            │   │
│  │    init.js             ← Creates tables                │   │
│  │                                                         │   │
│  │  routes/                                              │   │
│  │    auth.js             ← /api/auth/login, register     │   │
│  │    reports.js          ← /api/reports (CRUD)           │   │
│  │    locations.js        ← /api/locations                │   │
│  │    analytics.js        ← /api/analytics (charts data)  │   │
│  │                                                         │   │
│  │  middleware/                                           │   │
│  │    auth.js             ← Checks if user is logged in   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  HOW server.js WORKS:                                          │
│                                                                 │
│  // Simple version of server.js                                │
│  const express = require('express');                           │
│  const app = express();                                        │
│                                                                 │
│  // Allow frontend to talk to backend                         │
│  app.use(cors());                                             │
│                                                                 │
│  // When someone visits /api/reports, send them reports       │
│  app.get('/api/reports', (req, res) => {                      │
│    // Get reports from database                               │
│    const reports = db.all('SELECT * FROM reports');           │
│    // Send back as JSON                                       │
│    res.json(reports);                                         │
│  });                                                          │
│                                                                 │
│  // When someone submits a report, save it                    │
│  app.post('/api/reports', (req, res) => {                     │
│    const { location, ph, status } = req.body;                 │
│    db.run('INSERT INTO reports...', [location, ph, status]);  │
│    res.json({ success: true });                               │
│  });                                                          │
│                                                                 │
│  // Start server on port 5000                                 │
│  app.listen(5000, () => console.log('Server running!'));      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### PART 3: DATABASE (Data Storage)

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  This is where ALL data is stored.                             │
│  SQLite = One file on your laptop (no server needed)           │
│                                                                 │
│  FILE: database.sqlite (auto-created)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  TABLE: users                                           │   │
│  │  ┌────┬──────┬─────────┬──────────┬─────────┐         │   │
│  │  │ id │ name │ email   │ password │ role    │         │   │
│  │  ├────┼──────┼─────────┼──────────┼─────────┤         │   │
│  │  │ 1  │ Aarav│ a@b.com │ ***      │ user    │         │   │
│  │  │ 2  │ Riya │ r@b.com │ ***      │ admin   │         │   │
│  │  └────┴──────┴─────────┴──────────┴─────────┘         │   │
│  │                                                         │   │
│  │  TABLE: reports                                         │   │
│  │  ┌────┬─────────┬──────────┬─────┬────────┬────────┐  │   │
│  │  │ id │ user_id │ location │ ph  │ status │ date   │  │   │
│  │  ├────┼─────────┼──────────┼─────┼────────┼────────┤  │   │
│  │  │ 1  │ 1       │ Delhi    │ 7.2 │ safe   │ Jan 1  │  │   │
│  │  │ 2  │ 2       │ Mumbai   │ 4.5 │ unsafe │ Jan 2  │  │   │
│  │  │ 3  │ 1       │ Chennai  │ 8.1 │ safe   │ Jan 3  │  │   │
│  │  └────┴─────────┴──────────┴─────┴────────┴────────┘  │   │
│  │                                                         │   │
│  │  TABLE: alerts                                          │   │
│  │  ┌────┬───────────┬────────┬────────────────────────┐ │   │
│  │  │ id │ report_id │ type   │ message                │ │   │
│  │  ├────┼───────────┼────────┼────────────────────────┤ │   │
│  │  │ 1  │ 2         │ ph_low │ "pH too low in Mumbai" │ │   │
│  │  └────┴───────────┴────────┴────────────────────────┘ │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  WHY SQLite?                                                   │
│  - No need to install MySQL/PostgreSQL                        │
│  - Just one file: database.sqlite                             │
│  - Works immediately, no setup                                │
│  - Free forever                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How All 3 Parts Connect

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPLETE DATA FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: User opens website                                    │
│  ┌──────────┐                                                  │
│  │  USER    │ ──── Opens browser ────▶ ┌──────────┐           │
│  │          │                          │ Frontend │           │
│  └──────────┘                          │ (HTML)   │           │
│                                        └────┬─────┘           │
│                                             │                  │
│  STEP 2: Frontend asks backend for data    │                  │
│                                             │                  │
│                                        ┌────▼─────┐           │
│                                        │ fetch()  │           │
│                                        │ calls    │           │
│                                        │ /api/    │           │
│                                        │ reports  │           │
│                                        └────┬─────┘           │
│                                             │                  │
│  STEP 3: Backend processes request         │                  │
│                                             │                  │
│                                        ┌────▼─────┐           │
│                                        │ Backend  │           │
│                                        │ (Node.js│           │
│                                        │ Express) │           │
│                                        └────┬─────┘           │
│                                             │                  │
│  STEP 4: Backend gets data from database   │                  │
│                                             │                  │
│                                        ┌────▼─────┐           │
│                                        │ Database │           │
│                                        │ (SQLite) │           │
│                                        │          │           │
│                                        │ SELECT * │           │
│                                        │ FROM     │           │
│                                        │ reports  │           │
│                                        └────┬─────┘           │
│                                             │                  │
│  STEP 5: Data flows back up                │                  │
│                                             │                  │
│   Database ──▶ Backend ──▶ Frontend ──▶ USER SEES MAP         │
│                                             │                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │  USER SEES:                                              │ │
│  │  ┌────────────────────────────────────────┐             │ │
│  │  │    🗺️ MAP WITH MARKERS                │             │ │
│  │  │                                        │             │ │
│  │  │    📍 Delhi (Safe - Green)            │             │ │
│  │  │    📍 Mumbai (Unsafe - Red)           │             │ │
│  │  │    📍 Chennai (Safe - Green)          │             │ │
│  │  │                                        │             │ │
│  │  └────────────────────────────────────────┘             │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Each API Route Does

```
┌─────────────────────────────────────────────────────────────────┐
│                     API ROUTES EXPLAINED                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AUTH ROUTES (Login/Register):                                 │
│                                                                 │
│  POST /api/auth/register                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  User sends: { name, email, password }                  │   │
│  │  Server does: Hash password, save to users table        │   │
│  │  Server returns: { success: true, token: "abc123" }     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  POST /api/auth/login                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  User sends: { email, password }                        │   │
│  │  Server does: Check if user exists, compare password    │   │
│  │  Server returns: { token: "xyz789" }                    │   │
│  │  (Token = proof you are logged in)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  REPORT ROUTES (Water Quality Reports):                       │
│                                                                 │
│  GET /api/reports                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  User sends: Nothing (just asks for data)               │   │
│  │  Server does: SELECT * FROM reports                     │   │
│  │  Server returns: [                                      │   │
│  │    { id:1, location:"Delhi", ph:7.2, status:"safe" },  │   │
│  │    { id:2, location:"Mumbai", ph:4.5, status:"unsafe" } │   │
│  │  ]                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  POST /api/reports                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  User sends: { location, ph, turbidity, smell, notes }  │   │
│  │  Server does: INSERT INTO reports...                    │   │
│  │  Server returns: { success: true, id: 3 }              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ANALYTICS ROUTES (Charts/Stats):                              │
│                                                                 │
│  GET /api/analytics/overview                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Returns: {                                             │   │
│  │    totalReports: 157,                                   │   │
│  │    safeReports: 120,                                    │   │
│  │    unsafeReports: 37,                                   │   │
│  │    totalUsers: 42                                       │   │
│  │  }                                                      │   │
│  │  (Used for dashboard stat boxes)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  GET /api/analytics/trends                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Returns: [                                             │   │
│  │    { month: "Jan", safe: 10, unsafe: 3 },              │   │
│  │    { month: "Feb", safe: 15, unsafe: 5 },              │   │
│  │    ...                                                  │   │
│  │  ]                                                      │   │
│  │  (Used for line chart)                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Page Examples

```
┌─────────────────────────────────────────────────────────────────┐
│                     MAP PAGE (map.html)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Water Quality Map                          [Login] [☆] │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │                                                   │ │   │
│  │  │                  LEAFLET MAP                      │ │   │
│  │  │                                                   │ │   │
│  │  │      📍 (Green = Safe pH 6.5-8.5)               │ │   │
│  │  │              ╲                                    │ │   │
│  │  │               📍 (Red = Unsafe)                  │ │   │
│  │  │              ╱                                    │ │   │
│  │  │      📍 (Yellow = Warning)                       │ │   │
│  │  │                                                   │ │   │
│  │  │  [Zoom In] [Zoom Out] [My Location]             │ │   │
│  │  │                                                   │ │   │
│  │  └───────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │  Click any marker to see:                              │   │
│  │  ┌─────────────────────────────┐                      │   │
│  │  │ 📍 Delhi - Chandni Chowk   │                      │   │
│  │  │ pH: 7.2 (Safe)            │                      │   │
│  │  │ Reports: 12               │                      │   │
│  │  │ Last checked: 2 hours ago │                      │   │
│  │  └─────────────────────────────┘                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  SUBMIT REPORT PAGE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Submit Water Quality Report                            │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Location: [________________________]                  │   │
│  │                                                         │   │
│  │  Water Source:  ( ) River  ( ) Well  ( ) Tap  ( ) Lake │   │
│  │                                                         │   │
│  │  pH Value:     [____] (0-14)                           │   │
│  │                                                         │   │
│  │  Turbidity:    ( ) Clear  ( ) Slightly Murky           │   │
│  │                ( ) Murky  ( ) Very Murky               │   │
│  │                                                         │   │
│  │  Smell:        ( ) None  ( ) Chemical  ( ) Sewage      │   │
│  │                                                         │   │
│  │  Notes:        [________________________]              │   │
│  │                [________________________]              │   │
│  │                                                         │   │
│  │  📍 Use My Current Location                            │   │
│  │                                                         │   │
│  │  [ Submit Report ]                                      │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHAT WE ARE BUILDING                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (Browser):                                          │
│  ├── index.html      → Home page with map                     │
│  ├── login.html      → User login                             │
│  ├── register.html   → New user signup                        │
│  ├── map.html        → Interactive water quality map          │
│  ├── report.html     → Submit new report form                 │
│  ├── dashboard.html  → Charts and statistics                  │
│  ├── css/style.css   → All styling                            │
│  └── js/*.js         → All JavaScript logic                   │
│                                                                 │
│  BACKEND (Node.js Server):                                    │
│  ├── server.js       → Main entry point                      │
│  ├── routes/auth.js  → Login/Register API                     │
│  ├── routes/reports.js → Water reports API                   │
│  ├── routes/analytics.js → Charts data API                  │
│  └── middleware/auth.js → JWT verification                   │
│                                                                 │
│  DATABASE (SQLite File):                                      │
│  └── database.sqlite → Stores users, reports, alerts         │
│                                                                 │
│  TOOLS:                                                        │
│  ├── Leaflet.js     → Free map (OpenStreetMap)               │
│  ├── Chart.js       → Free charts                            │
│  └── Express.js     → Free server framework                  │
│                                                                 │
│  COST: ₹0                                                      │
│  HOSTING: Your laptop                                          │
│  TIME: 10 days                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Detailed Architecture - SIH 2026*
