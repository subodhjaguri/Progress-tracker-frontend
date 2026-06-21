import React, { useState, useEffect } from "react";
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
import { fmtDate, initials } from "../../lib/format.js";

const today = () => new Date().toISOString().slice(0, 10);

export function DailyReport() {
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
        <ReportSheet report={report} date={date} />
      )}
    </>
  );
}

function ReportSheet({ report, date }) {
  const d = new Date(date);
  const opts = { timeZone: "UTC" };
  const att = report.attendance || {};
  const wos = report.workOrders || { list: [], byStatus: {}, total: 0 };
  const remarks = report.remarks || [];
  const materials = report.materialsIssued || [];
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
        <div>
          <HardHat />
          <span>
            <strong>{att.present || 0}</strong>Present today
          </span>
        </div>
        <div>
          <ClipboardCheck />
          <span>
            <strong>{wos.byStatus?.["In Progress"] || 0}</strong>Work orders active
          </span>
        </div>
        <div>
          <PackageCheck />
          <span>
            <strong>{materials.length}</strong>Material issues
          </span>
        </div>
        <div>
          <Camera />
          <span>
            <strong>{photos.count || 0}</strong>Photos uploaded
          </span>
        </div>
      </div>
      <div className="report-body">
        <div className="report-column">
          <h2>Work progress</h2>
          {wos.list.length ? (
            wos.list.map((o) => (
              <div className="report-order" key={o.id}>
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
            remarks.map((u) => (
              <article className="report-update" key={u.id}>
                <div className="avatar">{initials(u.author?.name || "")}</div>
                <div>
                  <strong>{u.note}</strong>
                  <span>
                    {u.author?.name || "—"} · {fmtDate(u.date)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="report-empty">No updates posted for this date.</p>
          )}
          <h2 className="report-subheading">Materials issued today</h2>
          {materials.length ? (
            materials.map((m) => (
              <div className="report-material" key={m.id}>
                <PackageCheck />
                <span>
                  <strong>
                    {m.quantity} {m.unit} {m.materialName}
                  </strong>
                  <small>Issued to {m.party || "—"}</small>
                </span>
              </div>
            ))
          ) : (
            <p className="report-empty">No materials issued on this date.</p>
          )}
        </div>
      </div>
    </section>
  );
}
