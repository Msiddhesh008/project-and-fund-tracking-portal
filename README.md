# Project & Fund Tracker

Local-only React + Vite app for FY project targets, donor details, and funding allocation. All data stays in your browser (IndexedDB via Dexie)—no server and no cloud database.

## Live (PWA)

https://Msiddhesh008.github.io/project-and-fund-tracking-portal/

Installable as a Progressive Web App (Add to Home Screen / Install app). Offline-capable via service worker; data stays in IndexedDB on the device.

## Run

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

```bash
npm run deploy
```

## Features

- Installable PWA (standalone display, offline shell)
- Dashboard KPIs and region/quarter charts
- Entries table grouped by Quarter → Region
- Full Excel-aligned form (22 columns)
- Excel/CSV import & export
- JSON backup / restore
- Reports: donors, volunteers, funding allocation
- Mobile app shell (bottom nav + FAB)

## Stack

React, TypeScript, Vite, Vite PWA, React Router, Dexie, SheetJS (`xlsx`), Recharts
