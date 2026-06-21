# Progress Tracker

A **construction & field-work management** platform that gives owners, managers, and
contractors a single, clear view of project progress, labour attendance, material
movement, and daily work updates.

It borrows Jira's workflow concepts (Epic → Story → Sub-task) but hides all of that
terminology behind plain, field-friendly language (Project → Work Order → Labour Task)
so non-technical site teams can use it.

> **Status:** Phase 1 — a clickable frontend prototype using mock data and local state.
> There is **no backend, real authentication, database, or file storage** yet.
> See [`docs/PRD.md`](docs/PRD.md) for the full product spec.

---

## Tech stack

| Area        | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | React 19                                           |
| Build tool  | Vite 6                                             |
| Icons       | lucide-react                                       |
| Styling     | Plain CSS (single `styles.css`, CSS variables)     |
| Language    | JavaScript (JSX) — no TypeScript                   |
| State       | React `useState` only — no router, no state library |
| Linting     | ESLint 9 (flat config) + react-hooks + react-refresh |

---

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

> Photos load from Unsplash URLs, so the prototype needs an internet connection to
> render images.

---

## How to use the prototype

- **Switch roles** from the top-right "Viewing as" menu. The dashboard, visible
  projects, and visible work orders change per role:
  - **Super Admin** (Subodh Jaguri) — sees everything.
  - **Manager** (Priya Sharma) — sees only her projects.
  - **Contractor** (Vikram Joshi / Apex Civil Works) — sees only Apex's work orders.
- **Navigate** via the left sidebar: Dashboard, Projects, Work Orders, Attendance,
  Materials, Daily Report.
- **Drill in**: click a project → its detail tabs; click a work order → its detail tabs.
- **Create / update** via the primary buttons (New project, New work order, Update
  progress, Record movement) — changes update in-memory state and show a toast.

All edits are **in-memory only** — refreshing the page resets to the seed data in
`src/data.js`.

---

## Project structure

```
.
├── index.html             # Vite entry, mounts #root
├── package.json
├── eslint.config.js
└── src/
    ├── main.jsx           # React root render
    ├── App.jsx            # App shell + all pages, detail screens, and forms
    ├── components.jsx     # Reusable UI primitives
    ├── data.js            # All mock/seed data
    └── styles.css         # All styling (CSS variables, mobile-first)
```

### Where things live

- **`App.jsx`** holds the single source of truth for app state (current page, current
  role, projects, work orders, attendance, updates, comments, selected items, active
  modal, toast) and contains every page-level component:
  `Sidebar`, `Topbar`, `Dashboard`, `ProjectsPage`, `ProjectDetail`, `WorkOrdersPage`,
  `WorkOrderDetail`, `AttendancePage`, `MaterialsPage`, `DailyReport`, plus the form
  modals (`ProjectForm`, `WorkOrderForm`, `ProgressForm`, `MaterialForm`).
- **`components.jsx`** holds shared primitives: `StatusPill`, `ProgressBar`,
  `StatCard`, `Section`, `TextAction`, `EmptyState`, `Modal`, `Field`, `UpdateItem`.
- **`data.js`** exports `projects`, `initialWorkOrders`, `labour`, `materials`,
  `updates`, `comments`, and `photos`.

---

## Domain model

| Concept        | Maps to (Jira) | Notes                                                      |
| -------------- | -------------- | ---------------------------------------------------------- |
| **Project**    | Epic           | Top-level site. Has work orders, materials, updates, etc.  |
| **Work Order** | Story          | Unit of execution. Belongs to one project, one contractor. |
| **Labour Task**| Sub-task       | Optional child of a work order, managed by the contractor. |
| **Labour**     | —              | Belongs to a contractor; no system access of their own.    |

### Controlled values

- **Project status:** Planning · In Progress · Blocked · Completed
- **Work order status:** Not Started · In Progress · Blocked · Completed
- **Priority:** Low · Medium · High · Critical
- **Attendance:** Present · Absent · Half Day
- **Skill types:** Mason · Welder · Electrician · Painter · Carpenter · Helper · Plumber

### ID conventions

- Projects: `p1`, `p2`, … displayed as `PRJ-001`
- Work orders: `wo1`, `wo2`, … displayed as `WO-001`
- New records created in forms use timestamp-based ids (e.g. `p${Date.now()}`).

---

## Implemented vs. stubbed

**Implemented (clickable):** role switching, three role dashboards, projects list +
detail, work orders list + detail, daily progress updates, attendance with live
counts, material ledger, daily site report, create/update modals, work-order comments,
photo/document gallery UI, toasts, mobile-responsive navigation.

**Stubbed / UI-only (intentional for Phase 1):**

- Global search input (not wired to filtering)
- "More filters" / date-range filters
- "Add labour" and labour edit/history
- Project-level comments (empty state only)
- Material form (shows a toast but does not append to the ledger)
- File uploads (no storage — labelled "Prototype only")
- Persistence (state resets on refresh)

These are the natural starting points for Phase 2.

---

## License

Private / internal prototype.
