import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  Boxes,
  ChartNoAxesCombined,
  UsersRound,
  HardHat,
  Compass,
} from "lucide-react";

// `roles` (optional) restricts a nav item to those role codes; omitted = all roles.
export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  {
    to: "/work-orders",
    label: "Work Orders",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "MANAGER", "CONTRACTOR"],
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: Users,
    roles: ["SUPER_ADMIN", "MANAGER", "CONTRACTOR"],
  },
  { to: "/labour", label: "Labour", icon: HardHat, roles: ["CONTRACTOR"] },
  { to: "/materials", label: "Materials", icon: Boxes },
  { to: "/team", label: "Team", icon: UsersRound, roles: ["SUPER_ADMIN", "MANAGER"] },
  { to: "/reports", label: "Daily Report", icon: ChartNoAxesCombined },
  { to: "/guide", label: "How it works", icon: Compass, roles: ["SUPER_ADMIN", "MANAGER"] },
];

export const roles = {
  "Super Admin": { name: "Subodh Jaguri", initials: "SJ", caption: "Business owner" },
  Manager: { name: "Priya Sharma", initials: "PS", caption: "Project manager" },
  Contractor: { name: "Vikram Joshi", initials: "VJ", caption: "Apex Civil Works" },
};

// Controlled value sets (kept exactly — StatusPill + CSS derive from them).
export const PROJECT_FILTERS = ["All", "In Progress", "Blocked", "Completed"];
export const WORK_ORDER_FILTERS = ["All", "Not Started", "In Progress", "Blocked", "Completed"];
export const ATTENDANCE_STATUSES = ["Present", "Absent", "Half Day"];
export const SKILLS = [
  "Mason",
  "Welder",
  "Electrician",
  "Painter",
  "Carpenter",
  "Helper",
  "Plumber",
];
// Non-photo document categories (Site Photo is handled by the photo gallery).
export const DOC_CATEGORIES = ["Agreement", "Drawing", "Receipt", "Material Document", "Other"];
