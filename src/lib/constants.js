import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  Boxes,
  IndianRupee,
  ChartNoAxesCombined,
  UsersRound,
  HardHat,
  Compass,
} from "lucide-react";

// `roles` (optional) restricts a nav item to those role codes; omitted = all roles.
export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, roles: ["SUPER_ADMIN", "MANAGER", "SUPERVISOR", "CONTRACTOR"] },
  { to: "/projects", label: "Projects", icon: FolderKanban, roles: ["SUPER_ADMIN", "MANAGER", "SUPERVISOR", "ENGINEER", "CONTRACTOR"] },
  {
    to: "/work-orders",
    label: "Tasks",
    icon: ClipboardList,
    roles: ["SUPER_ADMIN", "MANAGER", "SUPERVISOR"],
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: Users,
    roles: ["SUPER_ADMIN", "MANAGER", "SUPERVISOR"],
  },
  { to: "/labour", label: "Labour", icon: HardHat, roles: ["SUPERVISOR"] },
  { to: "/materials", label: "Materials", icon: Boxes, roles: ["SUPER_ADMIN", "MANAGER", "SUPERVISOR", "CONTRACTOR"] },
  {
    to: "/payments",
    label: "Payments",
    icon: IndianRupee,
    roles: ["SUPER_ADMIN", "MANAGER", "SUPERVISOR"],
  },
  {
    to: "/engineering",
    label: "Engineering",
    icon: Compass,
    roles: ["ENGINEER", "SUPER_ADMIN", "MANAGER", "SUPERVISOR"],
  },
  { to: "/team", label: "Team", icon: UsersRound, roles: ["SUPER_ADMIN", "MANAGER"] },
  { to: "/reports", label: "Daily Report", icon: ChartNoAxesCombined, roles: ["SUPER_ADMIN", "MANAGER", "SUPERVISOR", "CONTRACTOR"] },
];

export const roles = {
  "Super Admin": { name: "Subodh Jaguri", initials: "SJ", caption: "Business owner" },
  Manager: { name: "Priya Sharma", initials: "PS", caption: "Project manager" },
  Supervisor: { name: "Amit Kumar", initials: "AK", caption: "Site supervisor" },
  Engineer: { name: "Rajesh Verma", initials: "RV", caption: "Structural engineer" },
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
