# Enterprise Operations Command Center

A runnable React / TypeScript / Vite demo for Telecom, Banking, and Government operations in Turkey. Uses deterministic local fixtures, independent SVG geography, real Recharts charts, locally bundled fonts, and browser-local preferences. No accounts, keys, backend, or external runtime requests are required.

## Run

Use Node.js 22.12+ (verified with Node 24.19) and npm. From this folder:

```sh
npm ci
npm run dev -- --port 5173
```

Open http://127.0.0.1:5173. On Windows PowerShell where script execution is disabled, use `npm.cmd` instead of `npm`.

```sh
npm test
npm run build
npm run preview -- --port 4173
```

The production website is in `dist/`. Keep the `assets/`, `map/`, `licenses/`, and favicon files together with `index.html`. Serve through HTTP; opening an HTML file with `file://` does not support the local map fetches. Installation uses npm's registry; the installed/built application has no network dependency beyond its own local origin.

## Presenter controls

- Start in Telecom, or restore the last selected sector from this browser. Industry tabs support Left/Right, Home/End, and selected-state semantics.
- All three time-range selectors share a single 6-hour, 24-hour, or 7-day state. Chart tooltips show exact timestamps in Europe/Istanbul. The fixtures' shape is deterministic; timestamp anchors are captured once when a sector loads. The seven-day timeline contains the available recent demo events, rather than inventing historical incidents.
- Click a city marker or regional impact bar to filter the incident context and unique-person audience. Use the selected-region chip or footer Clear filters to reset. Markers support keyboard selection, tooltips, zoom/pan, and Reset map view. Drag the map after zooming in.
- Select a health row, a key service tile, or an impact bar to inspect its service context. Numbered catalog instances aggregate into their canonical service families in Impact Distribution.
- Click an incident row or timeline event to open details and highlight its region. View all incidents opens the complete filtered list. Escape closes dialogs; dialog focus stays inside and returns to its initiating control.
- In incident details, the **Demo-only workflow status** selector saves Investigating/Mitigating/Resolved locally. Resolving an incident excludes its impact records and open-incident count; catalog services recover when all their direct incidents resolve. Related-service impact is still attributed to the originating incident. No external system is updated.
- The footer's three-dot menu pauses/resumes map animation and **Reset demo defaults** restores Telecom, the 24-hour range, filters, and local workflow edits. The clock continues showing actual time in Europe/Istanbul. No simulated production feed is claimed.

Availability is a sector-wide demo baseline and stays constant under filters. Affected-user KPIs count unique people across the selected open incidents. Regional totals deduplicate within disjoint person regions and reconcile to that audience. Service audiences overlap, as explicitly disclosed in the distribution panel, so service percentages can exceed 100% in aggregate. Both chart series have legends; performance additionally uses a dashed error series and separate axes.

## Structure and fixtures

- `src/data.ts`: shared types, `DataProvider` interface, `DemoDataProvider`, sector configuration, service catalogs, complete incident records, timestamped events, deterministic metrics, and impact aggregation.
- `src/App.tsx`: reusable shell, industry selector, framed panels, KPIs, service overview, impact bars, incident table, timeline/service tiles, dialog focus handling, details, and browser-local demo controls.
- `src/Map.tsx`: real Mercator geography, province boundaries, accurate city coordinates, location overlays, connection arcs, zoom/pan, tooltips, and region selection.
- `src/Chart.tsx`: shared time controls and actual interactive charts with accessible textual summaries.
- `src/styles.css`: navy/cyan technical frames, condensed headings, desktop proportions, readable tablet/mobile layouts, reduced motion, and loading/empty/error treatments.
- `public/map/`: 81 provinces, surrounding countries, projected shaded relief, and exact source metadata.
- `scripts/browser-check.mjs`: automated Chrome verification and screenshots.

Edit the sector `configs` in `src/data.ts` to change catalogs, terminology, fixture counts, regional audiences, or map location types. Impact fixtures assign stable person IDs and reference real service/incident/region IDs. The provider abstraction can later be replaced with REST loading without changing the aggregation semantics. All fixture workflow state lives under `eocc-statuses`; the industry preference uses `eocc-industry`. The reset menu clears the dashboard's state without touching unrelated browser storage.

## Unique-person bug demonstration

The default implementation is correct. `countUniquePeople` in `src/data.ts` is the intentionally small, identifiable aggregation function:

```ts
return new Set(records.map(record => record.personId)).size;
```

`overlapFixture()` constructs service A's 120 people (`person-0` through `person-119`) and service B's 120 people (`person-60` through `person-179`). The 60 shared IDs produce **240 impact records, 180 unique people**, and disjoint regional totals of 90 + 90. The regression test verifies the total and each 120-person service audience. Production-sized demo sector fixtures also contain overlapping records.

For a later, separate intentional-bug demonstration, initialize source control if needed, commit the correct baseline, then create a branch such as `demo/duplicate-impact-count`. On that branch only, replace the aggregation body with `return records.length;`. The 180-person regression must fail with 240. This reproduces a real aggregation defect throughout affected-person views; there is no numeric display toggle. Do not merge that branch into the correct default implementation. This application has no Jira/GitHub integration, custom skills, or agent workflow UI.

## Validation and screenshots

```sh
npm test
npm run build
# Keep the development server running in another terminal:
npm run test:browser
```

The browser command uses installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Set `CHROME_PATH` for a different executable and `DASHBOARD_URL` to test another origin, including a production preview server. No Playwright browser download is needed when Chrome is installed.

The browser checks all three industries at **1920×1080, 1680×945, and 1366×768**, asserts expected unique-person KPIs and open-incident totals, checks document overflow, saves desktop screenshots, and exercises shared time ranges, region selection/reset, health and service filters, chart tooltips, incident dialogs and focus, workflow persistence/reset, zoom/pan, industry persistence/keyboard navigation, pause controls, mobile/tablet layout, failed assets, and browser console errors. Running the browser checks generates screenshots and machine-readable results in the ignored `screenshots/` folder; these outputs are excluded from the source repository. Unit tests cover overlap aggregation, empty/repeated records, regional reconciliation, catalog health totals, references, complete incident totals, deterministic metrics, and range endpoints.

The design closely follows the supplied Telecom panel composition with stable sector positions. It is an interactive implementation, not a background screenshot. Material differences: relief uses Natural Earth's real 50m cartographic terrain, which is smoother than the reference's stylized, exaggerated terrain; the real Mercator coastline/province shapes differ from the generated reference; metric timestamps and fixtures are coherent rather than copied verbatim; chart axes/labels and sector tables use compact responsive typography. Dense secondary metadata is smaller at 1366×768. Below 1100px, panels stack and the document scrolls. The whole map remains geographically accurate on mobile, with zoom available for city detail.

## Assets and reuse

See [ASSET-SOURCES.md](ASSET-SOURCES.md) and `public/licenses/`. The supplied design PNGs and generation prompt are local references, excluded from the source repository and never served as the interface. All runtime assets are local. The geographic transformations are reproducible with `scripts/fetch-assets.mjs`, `scripts/normalize-geography.mjs`, and `scripts/prepare-terrain.mjs`; regeneration requires network access and the downloaded terrain source, but normal use does not.
