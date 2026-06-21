# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**Progress Tracker** — a mobile-first construction / field-work management app for
owners, managers, and contractors. It is currently a **Phase 1 frontend prototype**:
mock data, local React state, no backend, no real auth, no persistence.

The full product spec lives in [`docs/PRD.md`](docs/PRD.md) — treat it as the source of
truth for intended behavior, naming, and scope. The README has the user-facing overview.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build -> dist/
npm run preview  # preview production build
npm run lint     # ESLint (flat config)
```

There is no test setup. Verify changes by running `npm run dev` and clicking through,
and by running `npm run lint` before finishing.

## Architecture (read before editing)

- **No router.** The current screen is a `page` string in `App.jsx` (`dashboard`,
  `projects`, `work-orders`, `attendance`, `materials`, `reports`). `renderPage()`
  switches on `page` plus `selectedProject` / `selectedOrder` to show detail screens.
- **All state is top-level `useState` in `App.jsx`** — projects, work orders,
  attendance, updates, comments, the selected project/order, the active `modal` string,
  and the `toast`. There is no Redux/Context/Zustand. Pass state and setters down as
  props; do not introduce a state library without being asked.
- **Mock data is in `src/data.js`.** Seed arrays are copied into state on mount, so
  edits are in-memory and reset on refresh. Add new seed data here.
- **Component split:**
  - `src/components.jsx` = small reusable primitives (`StatusPill`, `ProgressBar`,
    `StatCard`, `Section`, `TextAction`, `EmptyState`, `Modal`, `Field`, `UpdateItem`).
  - `src/App.jsx` = the app shell, every page, every detail screen, and the form modals.
- **Styling:** one file, `src/styles.css`. Uses CSS variables defined in `:root`
  (`--green`, `--ink`, `--amber`, etc.) and flat, semantic class names. Mobile-first —
  the sidebar collapses behind a hamburger on small screens. Reuse existing classes and
  variables rather than adding inline styles or a CSS framework.
- **Icons:** `lucide-react`, imported by name.

## Conventions to follow

- **Roles** are defined in the `roles` object in `App.jsx` (`Super Admin`, `Manager`,
  `Contractor`). Role-based visibility: Manager sees only `manager === "Priya Sharma"`
  projects; Contractor sees only `contractor === "Apex Civil Works"` orders. Keep
  role-gating logic consistent with this pattern.
- **Controlled value sets** (keep these exact strings — `StatusPill` and CSS classes
  derive from them):
  - Project status: `Planning`, `In Progress`, `Blocked`, `Completed`
  - Work order status: `Not Started`, `In Progress`, `Blocked`, `Completed`
  - Priority: `Low`, `Medium`, `High`, `Critical`
  - Attendance: `Present`, `Absent`, `Half Day`
  - Skills: `Mason`, `Welder`, `Electrician`, `Painter`, `Carpenter`, `Helper`, `Plumber`
- **`StatusPill` / priority styling** is keyed off the value, lowercased with spaces
  replaced (e.g. `status-in-progress`, `priority-stripe critical`). If you add a new
  status or priority, add the matching CSS class.
- **IDs:** projects `p<n>` (shown as `PRJ-00n`), work orders `wo<n>` (shown as
  `WO-00n`). New records from forms use `Date.now()`-based ids.
- **Forms** follow one pattern: a `<Modal>` containing a `<form>` that reads values via
  `FormData` on submit and calls an `onSave` callback which prepends the new record to
  the relevant state array and fires a toast via `announce(...)`. Match this pattern for
  new forms.
- **Feedback** to the user is the `announce(message)` toast helper, not `alert()`.
- Plain JavaScript + JSX. **Do not add TypeScript.** ESLint ignores unused vars that
  start with an uppercase letter or underscore.

## Phase 1 boundaries (do not cross unless asked)

Per the PRD, the prototype intentionally excludes: real authentication, backend APIs, a
database, notifications, and file storage. Photo/document uploads are visual only
("Prototype only · files are not stored"). If a task implies real persistence or a
backend, confirm scope before building it.

## Known stubs (good Phase 2 candidates)

Global search (input not wired to filtering), "More filters" / date-range filters,
"Add labour" + labour edit/history, project-level comments, the material form (toasts
but doesn't append to the ledger), and persistence across refresh.
