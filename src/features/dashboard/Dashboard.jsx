import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  SunMedium,
  CircleAlert,
  ChevronDown,
  ClipboardList,
  CircleCheckBig,
  Clock3,
  HardHat,
  Building2,
  TrendingUp,
  BriefcaseBusiness,
  UsersRound,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  PackageCheck,
} from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { Section, StatCard, ProgressBar, StatusPill, TextAction, UpdateItem } from "../../components/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useDashboard } from "../../api/dashboard.js";
import { useProjects } from "../../api/projects.js";
import { initials, fmtDate } from "../../lib/format.js";

const CARD_META = {
  totalProjects: { label: "Total Projects", icon: Building2, tone: "green" },
  activeProjects: { label: "Active Projects", icon: TrendingUp, tone: "blue" },
  completedProjects: { label: "Completed", icon: CircleCheckBig, tone: "violet" },
  totalManagers: { label: "Managers", icon: BriefcaseBusiness, tone: "amber" },
  totalContractors: { label: "Contractors", icon: UsersRound, tone: "blue" },
  totalLabourers: { label: "Labourers", icon: HardHat, tone: "green" },
  myProjects: { label: "My Projects", icon: Building2, tone: "green" },
  activeWorkOrders: { label: "Active Work Orders", icon: ClipboardList, tone: "blue" },
  completedWorkOrders: { label: "Completed", icon: CircleCheckBig, tone: "violet" },
  blockedWorkOrders: { label: "Blocked", icon: CircleAlert, tone: "red" },
  assignedWorkOrders: { label: "Assigned Work Orders", icon: ClipboardList, tone: "green" },
  pendingWorkOrders: { label: "Pending", icon: Clock3, tone: "amber" },
  labourCount: { label: "Labour Count", icon: HardHat, tone: "violet" },
  mySites: { label: "My Sites", icon: Building2, tone: "green" },
  pendingConfirmations: { label: "Pending Confirmations", icon: CircleAlert, tone: "amber" },
  deliveriesThisMonth: { label: "Deliveries this month", icon: ArrowDownToLine, tone: "blue" },
  usageLoggedToday: { label: "Usage logged today", icon: Boxes, tone: "violet" },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { role, profile } = useAuth();
  const { setModal } = useData();
  const { data: dash, isLoading } = useDashboard();
  const { data: projects = [] } = useProjects();
  const isContractor = role === "CONTRACTOR";

  if (isLoading || !dash) {
    return (
      <div className="empty-inline">
        <strong>Loading dashboard…</strong>
      </div>
    );
  }

  if (role === "SUPERVISOR") {
    return <SupervisorDashboard dash={dash} profile={profile} navigate={navigate} />;
  }

  const cards = dash.cards || {};
  const sections = dash.sections || {};
  const att = sections.attendanceToday ||
    sections.todaysAttendance || { present: 0, absent: 0, halfDay: 0, total: 0, percentage: 0 };
  const recentUpdates = sections.recentUpdates || sections.todaysUpdates || [];
  const attention = (sections.blockedWorkOrders || sections.upcomingDueDates || []).slice(0, 3);
  const topProjects = projects.slice(0, 3);

  return (
    <>
      <PageHeading
        eyebrow="DASHBOARD"
        title={`Good afternoon, ${profile.name.split(" ")[0]}`}
        text="Here is what's happening across your sites today."
        action={
          <button
            className="primary-button"
            onClick={() => (isContractor ? navigate("/work-orders") : setModal({ type: "project" }))}
          >
            <Plus size={18} />
            {isContractor ? "View assigned work" : "New project"}
          </button>
        }
      />
      <div className="stats-grid">
        {Object.entries(cards).map(([key, value]) => {
          const m = CARD_META[key] || { label: key, icon: Building2, tone: "green" };
          return <StatCard key={key} label={m.label} value={value} icon={m.icon} tone={m.tone} />;
        })}
      </div>
      <div className="dashboard-grid">
        <Section
          title="Project progress"
          eyebrow="PORTFOLIO"
          action={<TextAction onClick={() => navigate("/projects")}>View all</TextAction>}
          className="project-progress-panel"
        >
          <div className="dashboard-projects">
            {topProjects.length ? (
              topProjects.map((project) => (
                <button
                  key={project.id}
                  className="dashboard-project-row"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <img src={project.image} alt="" />
                  <div className="dashboard-project-main">
                    <strong>{project.name}</strong>
                    <span>
                      <MapPin size={13} />
                      {project.location}
                    </span>
                    <ProgressBar value={project.progress} compact />
                  </div>
                  <StatusPill value={project.status} />
                </button>
              ))
            ) : (
              <div className="empty-inline">
                <strong>No projects yet</strong>
              </div>
            )}
          </div>
        </Section>
        <Section
          title="Today's attendance"
          eyebrow="WORKFORCE"
          action={<TextAction onClick={() => navigate("/attendance")}>Manage</TextAction>}
        >
          <div className="attendance-ring-wrap">
            <div className="attendance-ring" style={{ "--attendance": `${att.percentage * 3.6}deg` }}>
              <div>
                <strong>{att.percentage}%</strong>
                <span>Present</span>
              </div>
            </div>
            <div className="attendance-legend">
              <div>
                <i className="present" />
                <span>Present</span>
                <strong>{att.present}</strong>
              </div>
              <div>
                <i className="absent" />
                <span>Absent</span>
                <strong>{att.absent}</strong>
              </div>
              <div>
                <i className="half" />
                <span>Half day</span>
                <strong>{att.halfDay}</strong>
              </div>
            </div>
          </div>
          <div className="attendance-callout">
            <SunMedium size={19} />
            <span>
              <strong>{att.total ? `${att.total} marked today` : "No attendance marked yet"}</strong>
              {att.total ? "Across your sites" : "Mark attendance from the Attendance page"}
            </span>
          </div>
        </Section>
        <Section
          title="Recent site updates"
          eyebrow="LIVE FROM THE FIELD"
          action={<TextAction onClick={() => navigate("/reports")}>Daily report</TextAction>}
          className="updates-panel"
        >
          <div className="updates-list">
            {recentUpdates.length ? (
              recentUpdates.slice(0, 3).map((u) => (
                <UpdateItem
                  key={u.id}
                  update={{
                    initials: initials(u.author?.name || ""),
                    author: u.author?.name || "—",
                    time: fmtDate(u.date),
                    text: u.note,
                    progress: u.progress ?? 0,
                    photos: u.attachments?.length ?? 0,
                  }}
                  orderTitle={u.workOrderId?.title || "Work order"}
                  onOpen={() => u.workOrderId?.id && navigate(`/work-orders/${u.workOrderId.id}`)}
                />
              ))
            ) : (
              <div className="empty-inline">
                <strong>No updates yet</strong>
                <p>Updates from the field will appear here.</p>
              </div>
            )}
          </div>
        </Section>
        <Section title="Needs attention" eyebrow="BLOCKERS & DUE DATES">
          <div className="attention-list">
            {attention.length ? (
              attention.map((o) => (
                <button key={o.id} onClick={() => navigate(`/work-orders/${o.id}`)}>
                  <span className={o.status === "Blocked" ? "danger-dot" : "warning-dot"}>
                    <CircleAlert size={18} />
                  </span>
                  <div>
                    <strong>{o.title}</strong>
                    <span>
                      {o.status === "Blocked" ? "Blocked" : `Due ${fmtDate(o.dueDate)}`} ·{" "}
                      {o.projectId?.name || o.contractor?.name || ""}
                    </span>
                  </div>
                  <ChevronDown size={17} />
                </button>
              ))
            ) : (
              <div className="empty-inline">
                <strong>Nothing flagged</strong>
                <p>No blockers or imminent due dates.</p>
              </div>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}

// Material-custodian view: pending deliveries to confirm, today's usage, recent activity.
function SupervisorDashboard({ dash, profile, navigate }) {
  const cards = dash.cards || {};
  const sections = dash.sections || {};
  const pending = sections.pendingConfirmations || [];
  const usage = sections.todaysUsage || [];
  const recent = sections.recentActivity || [];

  const line = (m) => `${m.quantity} ${m.unit} ${m.materialName}`;

  return (
    <>
      <PageHeading
        eyebrow="DASHBOARD"
        title={`Good afternoon, ${profile.name.split(" ")[0]}`}
        text="Confirm deliveries and log what you use on site today."
        action={
          <button className="primary-button" onClick={() => navigate("/materials")}>
            <Plus size={18} />
            Log usage
          </button>
        }
      />
      <div className="stats-grid">
        {Object.entries(cards).map(([key, value]) => {
          const m = CARD_META[key] || { label: key, icon: Building2, tone: "green" };
          return <StatCard key={key} label={m.label} value={value} icon={m.icon} tone={m.tone} />;
        })}
      </div>
      <div className="dashboard-grid">
        <Section
          title="Pending confirmations"
          eyebrow="AWAITING YOU"
          action={<TextAction onClick={() => navigate("/materials")}>Open materials</TextAction>}
        >
          <div className="material-feed">
            {pending.length ? (
              pending.map((m) => (
                <button
                  key={m.id}
                  className="material-feed-row"
                  onClick={() => navigate("/materials")}
                >
                  <ArrowDownToLine size={18} />
                  <div>
                    <strong>{line(m)}</strong>
                    <span>
                      {m.project?.name || ""} · {fmtDate(m.date)}
                    </span>
                  </div>
                  <span className="receipt-badge pending">Pending</span>
                </button>
              ))
            ) : (
              <div className="empty-inline">
                <strong>Nothing to confirm</strong>
                <p>Confirmed deliveries won't show here.</p>
              </div>
            )}
          </div>
        </Section>
        <Section
          title="Today's usage"
          eyebrow="CONSUMPTION"
          action={<TextAction onClick={() => navigate("/materials")}>Log usage</TextAction>}
        >
          <div className="material-feed">
            {usage.length ? (
              usage.map((m) => (
                <div key={m.id} className="material-feed-row static">
                  <ArrowUpFromLine size={18} />
                  <div>
                    <strong>{line(m)}</strong>
                    <span>{m.project?.name || ""}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-inline">
                <strong>No usage logged today</strong>
                <p>Log what was used on site.</p>
              </div>
            )}
          </div>
        </Section>
        <Section title="Recent material activity" eyebrow="LATEST" className="wide-panel">
          <div className="material-feed">
            {recent.length ? (
              recent.map((m) => (
                <div key={m.id} className="material-feed-row static">
                  <PackageCheck size={18} />
                  <div>
                    <strong>{line(m)}</strong>
                    <span>
                      {m.type} · {m.project?.name || ""} · {fmtDate(m.date)}
                    </span>
                  </div>
                  <StatusPill value={m.type} />
                </div>
              ))
            ) : (
              <div className="empty-inline">
                <strong>No activity yet</strong>
              </div>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
