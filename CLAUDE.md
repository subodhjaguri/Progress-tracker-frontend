# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**Progress Tracker** — a mobile-first construction / field-work management app for owners,
managers, supervisors, engineers and contractors. This repo is the **React frontend**; it
talks to a real backend and there is no mock data.

- Backend repo: `../backend` (Node/Express/Mongoose). It is a **separate git repo** — commit
  each side independently.
- Product spec: [`../docs/PRD.md`](../docs/PRD.md) — the source of truth for behaviour and
  naming. Technical design: [`../docs/BACKEND_DESIGN.md`](../docs/BACKEND_DESIGN.md). Phase
  status: [`../docs/IMPLEMENTATION_PLAN.md`](../docs/IMPLEMENTATION_PLAN.md).

The backend uses a **hosted MongoDB (Atlas)**, so running it locally reads and writes the
**live production data**. Clean up anything you create while testing.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
npm run lint     # ESLint (flat config)
```

No test suite. Verify by running the app and clicking through, and run `npm run lint` and
`npm run build` before finishing. Lint currently has ~27 pre-existing errors — check you have
not *added* to the count rather than expecting zero.

## Architecture

- **Routing:** `react-router-dom` v7. Routes in `src/routes/AppRoutes.jsx`; `App.jsx` holds
  providers, the layout shell and the modal host.
- **Server state:** `@tanstack/react-query` v5 over `axios`. One hook module per resource in
  `src/api/` (`projects.js`, `payments.js`, …). `src/lib/api.js` has the axios client, the
  bearer-token interceptor, a 401 → logout event, and `unwrap()` for the `{ data }` envelope.
- **Local state:** `AuthContext` (user/role/login/logout) and `DataContext` (modal + toast
  only). No Redux/Zustand — don't add one.
- **Screens:** `src/features/<domain>/`. Shared primitives in `src/components/`; layout in
  `src/components/layout/`.
- **Styling:** one file, `src/styles/styles.css`, with CSS variables in `:root` and flat
  semantic class names. Mobile-first. Reuse existing classes and variables rather than adding
  inline styles or a CSS framework.
- **Icons:** `lucide-react`, imported by name.
- **Plain JavaScript + JSX. Do not add TypeScript.**

## Roles

Role codes come from the API and are **uppercase**: `SUPER_ADMIN`, `MANAGER`, `SUPERVISOR`,
`CONTRACTOR`, `ENGINEER`. `src/lib/format.js` maps them to display labels; `src/lib/constants.js`
gates the nav per role.

Who does what (see PRD §17 — this is not the same as older versions of the docs):

- **Supervisor** owns site execution: labour roster, attendance, **progress updates**,
  material requests/usage, Labour payment requests.
- **Manager** owns projects, Tasks, material deliveries and **settling payments**.
- **Contractor** is a billing/record reference on a Task — not the executor.
- **Engineer** is limited to Projects and Engineering.

> **UI role gating is not security.** Hiding a button is a courtesy; the API enforces the
> rule. When you gate a control, check the matching endpoint enforces it too — and if you add
> an endpoint that writes project-bound data, it must call `assertProjectScope` on the
> backend.

## Conventions

- **Controlled value sets** (keep these strings exact — `StatusPill` and CSS derive from them):
  - Project status: `Planning`, `In Progress`, `Blocked`, `Completed`
  - Work order status: `Not Started`, `In Progress`, `Blocked`, `Completed`
  - Priority: `Low`, `Medium`, `High`, `Critical`
  - Attendance: `Present`, `Absent`, `Half Day`
  - Skills: `Mason`, `Welder`, `Electrician`, `Painter`, `Carpenter`, `Helper`, `Plumber`
- **`StatusPill` / priority styling** is keyed off the value lowercased with spaces replaced
  (`status-in-progress`, `priority-stripe critical`). New status → add the CSS class.
- **Work Orders are called "Tasks" in the UI.** The code, routes (`/work-orders`) and API
  still say work order; only user-facing copy changed.
- **Forms** live in a `<Modal>` (portalled to `document.body`), read values via `FormData` on
  submit, and call a React Query mutation. Feedback is the `announce(...)` toast, never
  `alert()`.
- **Deep links:** Attendance, Materials, Tasks accept `?project=`, `?date=`/`?from=`/`?to=`;
  Project Detail accepts `?tab=`. Seed filter state from those params so links from the Daily
  Report land pre-filtered.
- **Rendering user HTML:** engineering notes are the only `dangerouslySetInnerHTML` in the
  app, and they must go through `sanitizeHtml()` from `src/lib/sanitize.js`.
- ESLint ignores unused vars starting with an uppercase letter or underscore.

## Known rough edges

- `MaterialsPage.jsx` and `DailyReport.jsx` call hooks after an early `return <Navigate/>` —
  a real `rules-of-hooks` violation. Don't add new hooks to those components; read the URL
  directly instead (see the comment in `MaterialsPage`), or fix it by splitting the guard into
  a wrapper component.
- Payment and engineering-note attachments are stored as **base64 data URLs** on the record,
  not through the Documents module. Works, but bloats payloads (the API allows 50 MB bodies).
- The bundle is a single ~480 KB chunk; no code splitting yet.
