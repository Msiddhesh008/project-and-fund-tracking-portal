# Project & Fund Tracker

Local-only React + Vite app for FY project targets, donor details, and funding allocation. All data stays in your browser (IndexedDB via Dexie)—no server and no cloud database.

## Live

https://Msiddhesh008.github.io/project-and-fund-tracking-portal/

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

- Dashboard KPIs and region/quarter charts
- Entries table grouped by Quarter → Region
- Full Excel-aligned form (22 columns)
- Excel/CSV import & export
- JSON backup / restore
- Reports: donors, volunteers, funding allocation

## Stack

React, TypeScript, Vite, React Router, Dexie, SheetJS (`xlsx`), Recharts
