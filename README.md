# Meeting Cost Timer

A fun, shareable live ticker that shows how much a meeting is costing in real time.

**Live app:** https://lance6x5.github.io/meeting-cost-timer/

## Features

- Enter the number of attendees and an average annual salary (USD, EUR, GBP, INR, CAD), or switch to
  **advanced mode** to add attendee groups by role (e.g. 3 engineers at 150k, 1 director at 220k).
- **Fully loaded multiplier** (default 1.3x) for benefits and overhead, and editable working hours per year (default 2,080).
- Start / Pause / Reset, plus **End & save** to record the meeting in history.
- Large animated counter driven by `requestAnimationFrame`. Elapsed time is computed from timestamps,
  so it stays accurate when the tab is backgrounded. A running timer also survives a page refresh.
- Color shifts from green to yellow to red as the cost approaches one hour's worth of meeting.
- Fun milestone messages ("That's a nice lunch for the team", "That's a new laptop", ...).
  Edit them in [`src/config/milestones.js`](src/config/milestones.js).
- **Presentation mode** goes fullscreen for screen sharing in Teams/Zoom.
- **Share links**: the setup is encoded in the URL query string, e.g.
  `?n=8&s=120000&c=USD&m=1.3&h=2080` or `?c=EUR&g=Engineer:3:150000,Director:1:220000`.
- **Copy summary**: "This 47-minute meeting with 8 people cost about $1,240."
- History of completed meetings (localStorage) with total cost to date.
- Export / Import JSON backup and "Reset all data" with confirmation.
- Installable PWA that works offline; light and dark mode; keyboard accessible.

## Local development

```bash
npm install
npm run dev      # start the dev server
npm test         # run unit tests (vitest, non-watch)
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

## Deploy (GitHub Pages)

1. Push this repo to GitHub on the `main` branch.
2. One-time setup: **Repo Settings → Pages → Source: "GitHub Actions"**.
3. Every push to `main` (or a manual run of the "Deploy to GitHub Pages" workflow) runs tests, builds,
   and deploys via `.github/workflows/deploy.yml`.

If you rename the repo, update `base` (and the manifest `start_url`/`scope`) in `vite.config.js`.

## Project structure

```
index.html               App markup
src/main.js              UI wiring (DOM, events, render loop)
src/cost.js              Pure cost / milestone / color math
src/format.js            Money, clock and summary formatting
src/url.js               Query-string encode/decode for share links
src/timer.js             Drift-free stopwatch
src/storage.js           localStorage wrappers, export/import
src/config/milestones.js Editable milestone list and approximate FX rates
src/style.css            Styles (CSS variables, light/dark)
public/                  SVG icons
```

## Notes

- All data stays in your browser. No backend, no tracking, no API keys.
- Milestone thresholds are defined in USD and scaled by approximate exchange rates. Recorded meeting
  costs are never converted; history totals are shown per currency.
