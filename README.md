# Progress Tracker — Frontend

A **construction & field-work management** platform that gives owners, managers, site supervisors, and engineers a single, clear view of project progress, labour attendance, material movement, engineering site descriptions, and payments.

It translates complex project management concepts into simple, field-friendly language (**Project → Task → Daily Progress Updates & Attendance**).

---

## Key Features

- **Tasks (Work Orders)**: Create, assign, track, and filter tasks date-wise and project-wise.
- **Material Management**: Multi-item bulk material requests for site supervisors, manager delivery logging, supervisor delivery completion confirmation (`"Delivery Completed"`), supervisor name population, and manager action note editing for flagged delivery issues.
- **Finance & Payouts**: Labour, contractor, and miscellaneous payment logging with proof attachment image uploads and preview viewer.
- **Engineering Module**: Rich Text Editor for site summaries and specs, CAD/document attachment upload & download vault, role-based read-only scoping for managers/supervisors, and navigation restrictions for engineers.
- **Project & Date Range Filters**: Filter by Project and Date Range (`From`/`To`) across Tasks, Materials, Payments, Engineering, Attendance, and Daily Reports.
- **Role-Based Access Control (RBAC)**: Custom UI & navigation views for `SUPER_ADMIN`, `MANAGER`, `SUPERVISOR`, `ENGINEER`, and `CONTRACTOR`.

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

