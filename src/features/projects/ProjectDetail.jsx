import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ChartNoAxesCombined,
  Plus,
  HardHat,
  PackageCheck,
  CircleAlert,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";
import { Section, StatusPill, StatCard, Field } from "../../components/index.js";
import { OrderRow } from "./OrderRow.jsx";
import { PhotosPanel } from "../shared/PhotosPanel.jsx";
import { DocumentsPanel } from "../shared/DocumentsPanel.jsx";
import { CommentsPanel } from "../shared/CommentsPanel.jsx";
import { useProject, useUpdateProject } from "../../api/projects.js";
import { useSupervisors, useEngineers } from "../../api/users.js";
import { useAttendance } from "../../api/attendance.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";


const TABS = ["Overview", "Work Orders", "Attendance", "Updates", "Photos", "Documents", "Comments"];

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { announce } = useData();
  const { data: project, isLoading } = useProject(id);
  const [params] = useSearchParams();
  const initialTab = params.get("tab");
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : "Overview");

  const canAssign = role === "SUPER_ADMIN" || role === "MANAGER";
  const supervisors = useSupervisors(canAssign);
  const engineers = useEngineers(canAssign);
  const updateProject = useUpdateProject(id);

  const assignSupervisor = async (event) => {
    const value = event.target.value;
    try {
      await updateProject.mutateAsync({ supervisor: value || null });
      announce(value ? "Supervisor assigned" : "Supervisor removed");
    } catch (err) {
      announce(errMessage(err, "Could not update supervisor"));
    }
  };

  const assignEngineer = async (event) => {
    const value = event.target.value;
    try {
      await updateProject.mutateAsync({ engineers: value ? [value] : [] });
      announce(value ? "Engineer assigned" : "Engineer removed");
    } catch (err) {
      announce(errMessage(err, "Could not update engineer"));
    }
  };

  if (isLoading) {
    return (
      <div className="empty-inline">
        <strong>Loading…</strong>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="empty-state">
        <CircleAlert size={30} />
        <h3>Project not found</h3>
        <p>It may have been removed.</p>
        <button className="primary-button" onClick={() => navigate("/projects")}>
          All projects
        </button>
      </div>
    );
  }

  const orders = project.workOrders || [];
  const byStatus = project.summary?.byStatus || {};
  const openOrder = (order) => navigate(`/work-orders/${order.id}`);

  return (
    <>
      <button className="back-button" onClick={() => navigate("/projects")}>
        <ArrowLeft size={17} />
        All projects
      </button>
      <div className="project-hero">
        <img src={project.image} alt="" />
        <div className="project-hero-overlay" />
        <div className="project-hero-content">
          <span>{project.code}</span>
          <div>
            <h1>{project.name}</h1>
            <StatusPill value={project.status} />
          </div>
          <p>
            <MapPin size={16} />
            {project.site} · {project.location}
          </p>
        </div>
        <button className="light-button" onClick={() => navigate("/reports")}>
          <ChartNoAxesCombined size={18} />
          View daily report
        </button>
      </div>
      <div className="project-summary-grid">
        <div>
          <span>Overall progress</span>
          <strong>{project.progress}%</strong>
          <div className="summary-progress">
            <i style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        <div>
          <span>Target completion</span>
          <strong>{project.targetDate}</strong>
        </div>
        <div>
          <span>Project manager</span>
          <strong>{project.manager}</strong>
          <small>{project.workOrderCount} tasks</small>
        </div>
        <div>
          <span>Site supervisor</span>
          {canAssign ? (
            <select
              className="cell-select"
              value={project.supervisorId || ""}
              onChange={assignSupervisor}
              disabled={updateProject.isPending}
            >
              <option value="">— None —</option>
              {(supervisors.data || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <strong>{project.supervisor || "—"}</strong>
          )}
          <small>Material custodian</small>
        </div>
        <div>
          <span>Site engineer</span>
          {canAssign ? (
            <select
              className="cell-select"
              value={project.engineerIds?.[0] || ""}
              onChange={assignEngineer}
              disabled={updateProject.isPending}
            >
              <option value="">— None —</option>
              {(engineers.data || []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          ) : (
            <strong>{project.engineers?.join(", ") || "—"}</strong>
          )}
          <small>Technical vault lead</small>
        </div>
        <div>
          <span>Client</span>
          <strong>{project.clientName || "—"}</strong>
          <small>{project.clientMobile || ""}</small>
        </div>
      </div>
      <div className="detail-tabs">
        {["Overview", "Tasks", "Attendance", "Updates", "Photos", "Documents", "Comments"].map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item}
            {(item === "Tasks" || item === "Work Orders") && <i>{orders.length}</i>}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="detail-grid">
          <Section
            title="Tasks"
            action={
              canAssign && (
                <button className="small-button" onClick={() => navigate("/work-orders")}>
                  <Plus size={15} />
                  Add task
                </button>
              )
            }
          >
            <div className="order-list compact-list">
              {orders.length ? (
                orders.map((order) => (
                  <OrderRow key={order.id} order={order} onClick={() => openOrder(order)} />
                ))
              ) : (
                <div className="empty-inline">
                  <strong>No tasks yet</strong>
                </div>
              )}
            </div>
          </Section>
          <Section title="Site snapshot">
            <div className="snapshot-grid">
              <div>
                <HardHat />
                <strong>{project.workOrderCount}</strong>
                <span>Tasks</span>
              </div>
              <div>
                <TrendingUp />
                <strong>{byStatus["In Progress"] || 0}</strong>
                <span>In progress</span>
              </div>
              <div>
                <PackageCheck />
                <strong>{byStatus["Completed"] || 0}</strong>
                <span>Completed</span>
              </div>
              <div>
                <CircleAlert />
                <strong>{byStatus["Blocked"] || 0}</strong>
                <span>Blocked</span>
              </div>
            </div>
          </Section>
          <Section title="Latest updates" className="wide-panel">
            <div className="empty-inline">
              <TrendingUp />
              <strong>Updates live on each task</strong>
              <p>Open a task to post or view its progress updates.</p>
            </div>
          </Section>
        </div>
      )}
      {(tab === "Tasks" || tab === "Work Orders") && (
        <Section title={`${orders.length} tasks`}>
          <div className="order-list">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onClick={() => openOrder(order)} />
            ))}
          </div>
        </Section>
      )}
      {tab === "Attendance" && <ProjectAttendancePanel projectId={project.id} />}
      {tab === "Updates" && (
        <Section title="Progress timeline">
          <div className="empty-inline">
            <TrendingUp />
            <strong>Updates live on each task</strong>
            <p>Open a task to see its progress timeline.</p>
          </div>
        </Section>
      )}
      {tab === "Photos" && <PhotosPanel parentType="Project" parentId={project.id} />}
      {tab === "Documents" && <DocumentsPanel parentType="Project" parentId={project.id} />}
      {tab === "Comments" && <CommentsPanel parentType="Project" parentId={project.id} />}
    </>
  );
}

function ProjectAttendancePanel({ projectId }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const records = useAttendance({ project: projectId, date });

  const record = (records.data || [])[0] || null;
  const trades = record?.entries || [];
  const total = record?.total ?? 0;

  return (
    <>
      <div className="report-controls" style={{ marginBottom: "1rem" }}>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <div className="stats-grid attendance-stats" style={{ marginBottom: "1.5rem" }}>
        <StatCard label="On site" value={total} icon={HardHat} tone="green" />
        <StatCard label="Trades present" value={trades.length} icon={UserRoundCheck} tone="blue" />
      </div>
      <Section title="Daily site attendance" className="attendance-panel">
        {!record ? (
          <div className="empty-inline">
            <strong>No attendance recorded</strong>
            <p>Nothing was recorded for this project on this date.</p>
          </div>
        ) : (
          <ul className="headcount-list">
            {trades.map((entry) => (
              <li key={entry.trade}>
                <span>{entry.trade}</span>
                <strong>{entry.count}</strong>
              </li>
            ))}
            <li className="headcount-total">
              <span>Total on site</span>
              <strong>{total}</strong>
            </li>
          </ul>
        )}
      </Section>
    </>
  );
}
