# Progress Tracker — Frontend

A **construction & field-work management** platform that gives owners, managers, site supervisors, and engineers a single, clear view of project progress, labour attendance, material movement, engineering site descriptions, and payments.

It translates complex project management concepts into simple, field-friendly language (**Project → Task → Daily Progress Updates & Attendance**).

---

## Key Features

- **Tasks (Work Orders)**: Create, assign, track, and filter tasks date-wise and project-wise.
- **Material Management**: Multi-item bulk material requests for site supervisors, manager delivery logging, supervisor delivery completion confirmation (`"Delivery Completed"`), supervisor name population, and manager action note editing for flagged delivery issues.
- **Finance & Payouts**: Labour, contractor and miscellaneous payment logging. Supervisors raise Labour payment requests; the manager attaches the receipt screenshot when settling them, and payments they record themselves are saved as paid with proof on the form.
- **Engineering Module**: Rich Text Editor for site summaries and specs, CAD/document attachment upload & download vault, role-based read-only scoping for managers/supervisors, and navigation restrictions for engineers.
- **Project & Date Range Filters**: Filter by Project and Date Range (`From`/`To`) across Tasks, Materials, Payments, Engineering, Attendance, and Daily Reports.
- **Daily Site Report**: A navigable day view — attendance, tasks, updates, deliveries and photos all link through to their source screen, carrying the selected project and date.
- **Role-Based Access Control (RBAC)**: Custom UI & navigation views for `SUPER_ADMIN`, `MANAGER`, `SUPERVISOR`, `ENGINEER`, and `CONTRACTOR`. Progress updates are posted by the site supervisor only. Project scoping is enforced by the API, not just the UI.

---

## Tech Stack

| Area | Choice |
| :--- | :--- |
| Framework | React 19 |
| Build Tool | Vite 6 |
| Routing | React Router v7 |
| API Client | Axios + React Query (TanStack Query v5) |
| Icons | Lucide React |
| Styling | Custom CSS (`styles.css`, CSS variables, mobile-first) |

---

## Getting Started

```bash
npm install # Install dependencies
npm run dev # Start Vite dev server (http://localhost:5174)
npm run build # Production build into dist/
```

