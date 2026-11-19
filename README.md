# Find a Park

A static, resident-facing web app for the Granicus Lighthouse take-home assessment. Residents browse parks from an accessible list, view details (including incomplete data), and optionally use an OpenStreetMap map. There is **no backend**, **no authentication**, and **no geolocation**.

This is an assessment **prototype**, not a production municipal product.

## Features implemented

- Interactive map with markers for parks that have valid coordinates (React Leaflet + OSM tiles).
- Alphabetical, keyboard-focusable park list with a single shared selection state.
- Park detail panel: description, location, hours, size, rating (when present), amenities, and images when URLs exist.
- Defensive loading of [`assets/parks.sample.json`](assets/parks.sample.json): normalize at import; explicit fallbacks for missing fields; no invented content.
- Responsive layout: list → details → map on narrow screens; list + details beside map on wide screens.
- Skip links, focus-visible styles, and `aria-current` for the selected list item.
- Root error boundary with a simple recovery message.
- Regression tests for sample edge cases and normalize integrity (`npm run test:regression`).

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm**

## Setup and run

```bash
npm install
```

### Development server (default port **5180**)

```bash
npm run dev
```

Open [http://localhost:5180](http://localhost:5180).

### Production build and preview

```bash
npm run build
npm run preview
```

`preview` defaults to Vite’s preview port (often 4173 unless you pass `--port`).

### Automated regression tests

```bash
npm run test:regression
```

Runs Node’s built-in test runner via `tsx` against [`src/regression/park-edge-cases.test.ts`](src/regression/park-edge-cases.test.ts). These tests cover **data normalization and display helpers**, not React DOM or the map runtime.

### Typecheck

There is no separate `typecheck` script. TypeScript is checked as part of:

```bash
npm run build
```

(`tsc -b` then `vite build`.)

### Lint

`npm run lint` is defined but **will fail** until an `eslint.config.js` is added. Linting has not been part of verified CI for this submission.

## Architecture

```
assets/parks.sample.json
        ↓ normalizeParkList (src/lib/normalizePark.ts)
src/data/parks.ts  →  frozen, sorted readonly Park[]
        ↓
App (selectedParkId) ──┬── ParkList (onSelectPark)
                       ├── ParkDetails (selectedPark)
                       └── ParkMap (onSelectPark)
```

| Area | Role |
|------|------|
| [`src/App.tsx`](src/App.tsx) | Sole owner of `selectedParkId`; derives `selectedPark` via `findParkById`. |
| [`src/data/parks.ts`](src/data/parks.ts) | Loads JSON once; does not mutate source file. |
| [`src/lib/normalizePark.ts`](src/lib/normalizePark.ts) | Runtime coercion; drops unlistable records; dedupes by `id`. |
| [`src/lib/parkDisplay.ts`](src/lib/parkDisplay.ts) | Resident-facing fallback **copy** and formatting only. |
| [`src/lib/parkGeo.ts`](src/lib/parkGeo.ts) | Valid coordinates vs map; not geocoding or sanity checks beyond WGS-84 range. |
| [`src/components/ParkMap.tsx`](src/components/ParkMap.tsx) | Presentation + Leaflet; selection flows through props only (no second app state). |

**Stack:** React 19, TypeScript, Vite 7, React Leaflet 5, Leaflet 1.9, plain CSS.

**Deliberate omissions:** router, global store, API layer, search/filter, geolocation, clustering, E2E browser test suite.

## Data assumptions and missing fields

- **Source of truth:** [`assets/parks.sample.json`](assets/parks.sample.json). The app does not edit this file at runtime.
- **At load:** Records without non-empty `id` and `name` are dropped silently. Duplicate `id`s keep the first occurrence.
- **Types vs runtime:** After normalize, `description` and `rating` may be `null`; `acreage` may be `null` if non-numeric; `address` is optional; `amenities` / `images` are always arrays (possibly empty).

| Condition | Resident-visible behavior |
|-----------|---------------------------|
| Missing / null description | “Description not available.” |
| Missing address | “Address not listed” |
| Null or invalid rating | Rating row omitted |
| Invalid / null acreage | “Size not listed” (details); acreage hidden in list meta |
| Empty amenities | “No amenities listed” |
| Empty `images` | “No photos available” |
| Broken image URL | `onError` → no broken `<img>`; primary slot shows “Photo unavailable” |
| Missing / non-string hours | “Hours not listed” |
| Invalid lat/lng | Park remains in **list**; excluded from **map**; list may show “Not shown on map” |

Invalid coordinates are range-checked only (not plausibility or address reconciliation).

## Accessibility

- **Primary path:** `<nav aria-label="Parks">` with `<button>` list items; map treated as optional (`keyboard={false}` on map and markers to avoid tab traps).
- Skip links: park list and park details (`src/components/SkipLink.tsx`).
- Details updates: `aria-live="polite"` with `aria-atomic="false"` on `#park-details-region` ([`src/App.tsx`](src/App.tsx)).
- Selected list item: `aria-current="page"`.
- Focus: `:focus-visible` on interactive elements; extra rules for list buttons and Leaflet controls in [`src/index.css`](src/index.css).

**Gaps:** Map marker selection is pointer-first. Full keyboard-only and screen reader workflows were **not** fully verified in automation. Public-sector a11y sign-off (e.g. WCAG audit, VPAT) was not performed.

## Verification performed

### Automated (executed during development / final pass)

| Check | Command | Observed result |
|-------|---------|-----------------|
| Regression tests | `npm run test:regression` | **8 tests passed** (sample edge parks, P0 acreage, invalid coords fixture) |
| Typecheck + production build | `npm run build` | **Passed** |
| Preview HTTP | `npm run preview` + HTTP GET | **200** on `/` |
| No geolocation APIs | Source search in `src/` | **No matches** |

Regression tests do **not** prove React rendering, list/map selection sync in the browser, keyboard UX, or image load behavior.

### Manual / partial (not a complete pass by automation)

- Browser automation on dev and production preview: 12 parks listed; list selection updates details; map marker selection synced in a prior session; OSM attribution present; list usable when tile requests were blocked in one session.
- Keyboard-only end-to-end: **inconclusive** in automation; **requires human** verification.
- Mobile 375px layout: **not** systematically verified in automation.
- Screen reader: **not** tested by the author of this README.
- Error boundary UI: **not** triggered in tests; verify manually if needed.

## Known issues and limitations

- **Prototype only** — see [Production readiness](#production-readiness-not-production-ready) below.
- **Silent data loss** when normalize rejects or dedupes records (no UI notice).
- **Placeholder images** in sample JSON fail to load; “Photo unavailable” is expected.
- **Map popup / same-id reselection:** closing a popup and re-clicking the same list item may not reopen the popup.
- **`npm run lint`** broken (no ESLint flat config).
- **`dist/`** may exist locally after build; use `.gitignore` (included) before publishing the repo — do not commit `node_modules` or `dist` unless your submission instructions require artifacts.
- **ESLint-related devDependencies** installed but unused without config (dead weight in `package.json`).

## Time spent

**[Author: insert actual total time here — not recorded in the repository.]**

The assessment asked for an approximate duration; that figure must come from you, not from this README.

## Production readiness (not production-ready)

Brief consideration for a real municipal deployment:

| Concern | Prototype state |
|---------|-----------------|
| **Data freshness** | Static JSON bundled at build time; no CMS, cache headers, or invalidation. |
| **Accessibility** | Best-effort implementation; no formal WCAG test, VPAT, or disabled-resident UAT. |
| **Map tiles** | Public OSM endpoints; subject to [tile usage policy](https://operations.osmfoundation.org/policies/tiles/); no SLA, offline handling, or self-hosted tiles. |
| **Hosting** | Static files only; any CDN/static host works; no environment-specific config documented. |
| **Observability** | `console.error` in error boundary only; no metrics, logging pipeline, or RUM. |
| **Failure recovery** | App-level error boundary; no partial retry for data or tiles; normalize drops bad rows without surfacing counts. |

## Submission checklist

- [ ] **Source:** `src/`, `assets/parks.sample.json`, config files (`package.json`, `tsconfig.*`, `vite.config.ts`, `index.html`), `.gitignore`
- [ ] **Exclude from archive (unless required):** `node_modules/`, local `dist/`
- [ ] **README.md** (this file) with **time spent** filled in
- [ ] **Automated checks:** `npm run test:regression && npm run build` pass on a clean `npm install`
- [ ] **Manual smoke tests** (desktop + mobile) — see final verification notes in project history or repeat the checklist your team used
- [ ] **AI conversation logs:** Export **complete, unredacted** Cursor chat transcript(s) for this project. Do **not** submit an AI-written summary as a substitute for the original export. (In Cursor: export or save the full chat transcript per assessment instructions.)
- [ ] **Secrets:** Confirm no `.env`, API keys, or credentials in the tree (none are required for this app)

## Repository hygiene (review at handoff)

| Item | Finding |
|------|---------|
| Secrets | None in `src/` or `assets/` |
| Temporary files | Local `dist/` build output; ignored via `.gitignore` |
| Unused deps | ESLint stack in `devDependencies` without config; `npm run lint` non-functional |
| Complexity | `normalizePark` + `parkDisplay` overlap at boundaries; acceptable for defensive demo, could be simplified post-assessment |

## License / attribution

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (via Leaflet). Park content is from the supplied sample JSON only.