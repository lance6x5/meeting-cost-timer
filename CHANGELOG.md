# Changelog

All notable changes to Burnrate (repo: `meeting-cost-timer`) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-11-27

### Added
- "Install app" button in the header. It appears only when the browser can install the app and it isn't installed yet (Chrome, Edge, Android), shows "Share > Add to Home Screen" steps on iPhone/iPad, and disappears once installed.

## [1.3.1] - 2026-11-27

### Changed
- Footer studio credit now uses the Silverlight DevTech company mark (the "47 Ag" periodic-table tile), replacing the interim crescent mark.

## [1.3.0] - 2026-11-27

### Added
- `LICENSE.md`: the PolyForm Noncommercial License 1.0.0, with the `Required Notice: Copyright 2026 Silverlight DevTech` line. Earlier versions had no license file (all rights reserved).
- Studio credit in the app footer: Silverlight DevTech mark (`public/silverlight-mark.svg`), "© 2026 Silverlight DevTech", a "Noncommercial license" link to `LICENSE.md`, and a "More apps" link to the apps homepage (https://lance6x5.github.io/).
- `author` and `copyright` meta tags in `index.html`.
- README: studio credit line, "License" and "Trademarks" sections; CONTRIBUTING: "Licensing of contributions".

### Changed
- Licensed under the PolyForm Noncommercial License 1.0.0 (source-available; commercial use requires a separate license from Silverlight DevTech). `package.json` now sets `"license": "PolyForm-Noncommercial-1.0.0"` and `"author": "Silverlight DevTech"`.

## [1.2.0] - 2026-11-27

### Added
- Anonymous visit counter in the footer ("12,345 visits") via the open-source Abacus counter. One count per
  browser session; Do Not Track / Global Privacy Control respected; not counted on localhost; no cookies and
  no app or user data sent. Fails silently and is never cached by the service worker.
- Visits badge and a "Privacy & analytics" section in the README.

## [1.1.0] - 2026-11-27

### Added
- Branding: the app is now **Burnrate** - "Every minute has a price tag." New title, meta description,
  header, PWA manifest name and README.
- Original logo (flame with a clock face) in `public/logo.svg` / `public/logo-mark.svg`, with a new
  ember-orange palette for light and dark mode.
- New favicon and PWA icons (192px, 512px, maskable 512px, Apple touch icon) derived from the logo mark.
- App version shown in the footer (injected at build time from `package.json`).
- In-app feedback menu: "Report a bug" and "Request a feature" open pre-filled GitHub issue forms
  (only the app version and browser user agent are included).
- GitHub issue templates (bug report, feature request) with `triage` labelling, and `CONTRIBUTING.md`.
- This changelog and a Versioning section in the README.

### Changed
- JSON export file is now named `burnrate-YYYY-MM-DD.json`. Existing exports remain importable.

## [1.0.0] - 2026-11-27

### Added
- Live meeting cost ticker with Start / Pause / Reset and End & save, driven by `requestAnimationFrame`
  and drift-free timestamps (survives backgrounded tabs and page refresh).
- Simple mode (attendees x average salary) and advanced mode (attendee groups by role); USD, EUR, GBP,
  INR and CAD; fully loaded multiplier and working hours per year.
- Green-to-red color shift and fun cost milestone messages.
- Presentation (fullscreen) mode, share links encoding the setup in the URL, and copy summary.
- Meeting history in localStorage with totals per currency; JSON export / import and reset all data.
- Installable offline PWA, light and dark mode, keyboard accessible; deployed to GitHub Pages.

[Unreleased]: https://github.com/lance6x5/meeting-cost-timer/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/lance6x5/meeting-cost-timer/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/lance6x5/meeting-cost-timer/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/lance6x5/meeting-cost-timer/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/lance6x5/meeting-cost-timer/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/lance6x5/meeting-cost-timer/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/lance6x5/meeting-cost-timer/releases/tag/v1.0.0
