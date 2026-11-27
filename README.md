<p align="center"><img src="public/logo.svg" alt="Burnrate" width="420" /></p>

# Burnrate

![Visits](https://abacus.jasoncameron.dev/get/lance6x5.github.io/meeting-cost-timer/shield)

**Every minute has a price tag.** A fun, shareable live ticker that shows how much a meeting is costing in real time.

A **Silverlight DevTech** project · © 2026 Silverlight DevTech. Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE.md).

More apps: https://lance6x5.github.io/

_Repository: `meeting-cost-timer`_

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
src/feedback.js          Builds pre-filled GitHub issue URLs
src/visits.js            Anonymous visit counter (Abacus)
public/                  Logo, favicon and PWA icons
```

## Feedback & issues

Found a bug or have an idea? Use the **Feedback** menu in the app header, or go to the
[Issues page](https://github.com/lance6x5/meeting-cost-timer/issues) and pick a
[bug report](https://github.com/lance6x5/meeting-cost-timer/issues/new?template=bug_report.yml) or
[feature request](https://github.com/lance6x5/meeting-cost-timer/issues/new?template=feature_request.yml).
The in-app links only pre-fill the app version and your browser; a free GitHub account is required.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the triage flow.

## Versioning

Burnrate follows [Semantic Versioning](https://semver.org/): **MAJOR** for breaking data/schema changes
(e.g. stored history or export format), **MINOR** for new features, **PATCH** for fixes.
The current version is shown in the app footer. See [CHANGELOG.md](CHANGELOG.md) for release notes.

## Privacy & analytics

Burnrate counts one anonymous page load per browser session using the open-source
[Abacus](https://github.com/JasonLovesDoggo/abacus) counter, shown as "N visits" in the footer.
No cookies are used and no personal or meeting data is sent or stored; only a bare request to the counter
is made. Do Not Track and Global Privacy Control are respected (the count is then only read, never
incremented), and nothing is counted on `localhost`. Like any web request, it reveals your IP address to
the counter service. The count is approximate (it includes bots and is not unique visitors) and public.

## Notes

- All meeting data stays in your browser. No backend, no API keys; the only outside request is the
  anonymous visit counter described above.
- Milestone thresholds are defined in USD and scaled by approximate exchange rates. Recorded meeting
  costs are never converted; history totals are shown per currency.

## License

Burnrate is **source-available**, not open source in the OSI sense. It is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE.md) (SPDX: `PolyForm-Noncommercial-1.0.0`).

- **Free for noncommercial use:** personal, educational, research, nonprofit and other noncommercial use is allowed under the license terms.
- **Commercial use needs a separate license:** this includes selling it, hosting it as a paid service, or using it inside a business product. Commercial licenses are available from Silverlight DevTech; to ask, open a [GitHub issue on this repo](https://github.com/lance6x5/meeting-cost-timer/issues).
- **Redistribution:** anyone who shares a copy must keep [LICENSE.md](LICENSE.md) and its `Required Notice:` line.

Third-party dependencies keep their own licenses.

## Trademarks

Burnrate and its logo are trademarks of Silverlight DevTech. The license covers the code only, not the names or logos, so forks must use a different name and logo.
