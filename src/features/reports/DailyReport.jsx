import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Download,
  MapPin,
  CloudSun,
  HardHat,
  ClipboardCheck,
  PackageCheck,
  Camera,
} from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { Field, StatusPill, ProgressBar } from "../../components/index.js";
import { useProjects } from "../../api/projects.js";
import { useDailyReport } from "../../api/reports.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { fmtDate, initials } from "../../lib/format.js";

const today = () => new Date().toISOString().slice(0, 10);

const RECEIPT_LABEL = { Confirmed: "Confirmed", Issue: "Issue flagged" };

export function DailyReport() {
  const { role } = useAuth();
  if (role === "ENGINEER") return <Navigate to="/projects" replace />;
  const { data: projects = [] } = useProjects();
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState(today());

  useEffect(() => {
    if (!projectId && projects.length) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const { data: report, isLoading } = useDailyReport(projectId, date);

  return (
    <>
      <PageHeading
        eyebrow="DAILY SITE REPORT"
        title="The full site story, at a glance"
        text="A concise view of workforce, progress, materials and important events."
        action={
          <button className="primary-button" onClick={() => window.print()}>
            <Download size={18} />
            Download report
          </button>
        }
      />
      <div className="report-controls">
        <Field label="Project">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.length === 0 && <option value="">No projects</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Report date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      {isLoading || !report ? (
        <div className="empty-inline">
          <strong>Loading report…</strong>
        </div>
      ) : (
        <ReportSheet report={report} date={date} projectId={projectId} role={role} />
      )}
    </>
  );
}

function ReportSheet({ report, date, projectId, role }) {
  const navigate = useNavigate();
  // Every jump carries the project and date being viewed, so the destination
  // opens on the same slice of data rather than its own defaults.
  const q = `project=${projectId}&date=${date}`;
  const canSeeAttendance = role !== "CONTRACTOR"; // no Attendance nav for contractors
  const openMaterials = () =>
    navigate(`/materials?project=${projectId}&from=${date}&to=${date}`);
  const d = new Date(date);
  const opts = { timeZone: "UTC" };
  const att = report.attendance || {};
  const wos = report.workOrders || { list: [], byStatus: {}, total: 0 };
  const remarks = report.remarks || [];
  const received = report.materialsReceived || [];
  const usedMat = report.materialsUsed || [];
  const photos = report.photos || { count: 0 };

  return (
    <section className="report-sheet">
      <header className="report-cover">
        <div>
          <span>DAILY SITE REPORT</span>
          <h1>{report.project?.name}</h1>
          <p>
            <MapPin size={15} />
            {report.project?.siteName || ""}
            {report.project?.siteLocation ? `, ${report.project.siteLocation}` : ""}
          </p>
        </div>
        <div className="weather">
          <CloudSun size={32} />
          <strong>31°C</strong>
          <span>Partly cloudy</span>
        </div>
        <div className="report-date">
          <span>{d.toLocaleDateString("en-US", { weekday: "long", ...opts })}</span>
          <strong>{d.getUTCDate()}</strong>
          <small>{d.toLocaleDateString("en-US", { month: "long", year: "numeric", ...opts })}</small>
        </div>
      </header>
      <div className="report-metrics">
        <MetricTile
          icon={HardHat}
          value={att.total || 0}
          label="On site today"
          onClick={canSeeAttendance ? () => navigate(`/attendance?${q}`) : null}
        />
        <MetricTile
          icon={ClipboardCheck}
          value={wos.byStatus?.["In Progress"] || 0}
          label="Work orders active"
          onClick={() => navigate(`/work-orders?project=${projectId}`)}
        />
        <MetricTile
          icon={PackageCheck}
          value={usedMat.length}
          label="Materials used"
          onClick={() => navigate(`/materials?project=${projectId}&from=${date}&to=${date}`)}
        />
        <MetricTile
          icon={Camera}
          value={photos.count || 0}
          label="Photos uploaded"
          onClick={() => navigate(`/projects/${projectId}?tab=Photos`)}
        />
      </div>
      <div className="report-body">
        <div className="report-column">
          <h2>Work progress</h2>
          {wos.list.length ? (
            wos.list.map((o) => (
              <div
                className="report-order linkable"
                key={o.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/work-orders/${o.id}`)}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/work-orders/${o.id}`)}
              >
                <div>
                  <strong>{o.title}</strong>
                  <StatusPill value={o.status} />
                </div>
                <ProgressBar value={o.progress ?? 0} compact />
                <small>{o.contractor?.name || "—"}</small>
              </div>
            ))
          ) : (
            <p className="report-empty">No work orders on this site.</p>
          )}
        </div>
        <div className="report-column">
          <h2>Major updates &amp; remarks</h2>
          {remarks.length ? (
            remarks.map((u) => {
              // workOrderId is populated by the daily-report endpoint so an update
              // can jump straight to the task it was posted against.
              const woId = u.workOrderId?.id || u.workOrderId?._id || u.workOrderId;
              const open = woId ? () => navigate(`/work-orders/${woId}`) : null;
              return (
                <article
                  className={`report-update${open ? " linkable" : ""}`}
                  key={u.id}
                  role={open ? "link" : undefined}
                  tabIndex={open ? 0 : undefined}
                  onClick={open || undefined}
                  onKeyDown={open ? (e) => e.key === "Enter" && open() : undefined}
                >
                  <div className="avatar">{initials(u.author?.name || "")}</div>
                  <div>
                    <strong>{u.note}</strong>
                    <span>
                      {u.author?.name || "—"} · {fmtDate(u.date)}
                      {u.workOrderId?.title ? ` · ${u.workOrderId.title}` : ""}
                    </span>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="report-empty">No updates posted for this date.</p>
          )}
          <h2 className="report-subheading">Deliveries today</h2>
          {received.length ? (
            received.map((m) => (
              <MaterialRow
                key={m.id}
                material={m}
                caption={`${RECEIPT_LABEL[m.receiptStatus] || "Pending confirmation"}${
                  m.party ? ` · from ${m.party}` : ""
                }`}
                onClick={openMaterials}
              />
            ))
          ) : (
            <p className="report-empty">No deliveries received on this date.</p>
          )}
          <h2 className="report-subheading">Materials used today</h2>
          {usedMat.length ? (
            usedMat.map((m) => (
              <MaterialRow
                key={m.id}
                material={m}
                caption="Used on site"
                onClick={openMaterials}
              />
            ))
          ) : (
            <p className="report-empty">No materials used on this date.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/** A metric tile; becomes a link when an onClick is supplied. */
function MetricTile({ icon: Icon, value, label, onClick }) {
  return (
    <div
      className={onClick ? "linkable" : undefined}
      role={onClick ? "link" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick || undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <Icon />
      <span>
        <strong>{value}</strong>
        {label}
      </span>
    </div>
  );
}

function MaterialRow({ material, caption, onClick }) {
  return (
    <div
      className="report-material linkable"
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <PackageCheck />
      <span>
        <strong>
          {material.quantity} {material.unit} {material.materialName}
        </strong>
        <small>{caption}</small>
      </span>
    </div>
  );
}
