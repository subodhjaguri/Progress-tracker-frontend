import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HardHat, UserRoundCheck, X, Clock3, CircleCheckBig } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatCard, Section, Field } from "../../components/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useWorkOrders } from "../../api/workOrders.js";
import { useProjects } from "../../api/projects.js";
import { useLabour } from "../../api/labour.js";
import {
  useAttendance,
  useMarkAttendance,
  useAttendanceSummary,
} from "../../api/attendance.js";
import { ATTENDANCE_STATUSES } from "../../lib/constants.js";
import { initials } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

const today = () => new Date().toISOString().slice(0, 10);
const statusClass = (s) => s.toLowerCase().replace(" ", "-");

export function AttendancePage() {
  const { role } = useAuth();
  return role === "CONTRACTOR" ? <ContractorAttendance /> : <ManagerAttendance />;
}

// ---- Contractor: mark attendance for their labour on a work order ----
function ContractorAttendance() {
  const { announce } = useData();
  const navigate = useNavigate();
  const [date, setDate] = useState(today());
  const [workOrderId, setWorkOrderId] = useState("");
  const [marks, setMarks] = useState({});

  const workOrders = useWorkOrders();
  const labour = useLabour();
  const existing = useAttendance({ date });
  const mark = useMarkAttendance();

  useEffect(() => {
    if (!workOrderId && workOrders.data?.length) setWorkOrderId(workOrders.data[0].id);
  }, [workOrders.data, workOrderId]);

  useEffect(() => {
    const map = {};
    (existing.data || []).forEach((r) => {
      if (r.labour?.id) map[r.labour.id] = r.status;
    });
    setMarks(map);
  }, [existing.data]);

  const roster = labour.data || [];
  const selectedWO = (workOrders.data || []).find((w) => w.id === workOrderId);
  const counts = { Present: 0, Absent: 0, "Half Day": 0 };
  roster.forEach((l) => {
    if (marks[l.id]) counts[marks[l.id]] += 1;
  });

  const save = async () => {
    if (!selectedWO) return announce("Select a work order first");
    const entries = roster
      .filter((l) => marks[l.id])
      .map((l) => ({ labour: l.id, status: marks[l.id] }));
    if (!entries.length) return announce("Mark at least one labourer");
    try {
      await mark.mutateAsync({
        date,
        project: selectedWO.projectId,
        workOrder: selectedWO.id,
        entries,
      });
      announce("Attendance saved");
    } catch (err) {
      announce(errMessage(err, "Could not save attendance"));
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="ATTENDANCE"
        title="Mark today's attendance"
        text="Choose a work order and date, then mark your workforce."
        action={
          <button className="primary-button" onClick={save} disabled={mark.isPending}>
            <CircleCheckBig size={18} />
            {mark.isPending ? "Saving…" : "Save attendance"}
          </button>
        }
      />
      <div className="report-controls">
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Work order">
          <select value={workOrderId} onChange={(e) => setWorkOrderId(e.target.value)}>
            {(workOrders.data || []).length === 0 && <option value="">No work orders assigned</option>}
            {(workOrders.data || []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.title} · {w.projectName}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="stats-grid attendance-stats">
        <StatCard label="Total labour" value={roster.length} icon={HardHat} tone="green" />
        <StatCard label="Present" value={counts.Present} icon={UserRoundCheck} tone="blue" />
        <StatCard label="Absent" value={counts.Absent} icon={X} tone="red" />
        <StatCard label="Half day" value={counts["Half Day"]} icon={Clock3} tone="amber" />
      </div>
      <Section
        title="Your workforce"
        eyebrow="DAILY ATTENDANCE"
        action={
          <button className="small-button" onClick={() => navigate("/labour")}>
            Manage labour
          </button>
        }
        className="attendance-panel"
      >
        {roster.length === 0 ? (
          <div className="empty-inline">
            <strong>No labour yet</strong>
            <p>Add your workforce in the Labour area, then mark attendance here.</p>
            <button className="primary-button" onClick={() => navigate("/labour")}>
              Go to Labour
            </button>
          </div>
        ) : (
          <>
            <div className="attendance-table-header">
              <span>Labour</span>
              <span>Skill</span>
              <span>Mobile</span>
              <span>Attendance</span>
            </div>
            <div className="attendance-table">
              {roster.map((person) => (
                <div className="attendance-person" key={person.id}>
                  <div className="person-cell">
                    <div className="avatar">{initials(person.name)}</div>
                    <span>
                      <strong>{person.name}</strong>
                      <small>
                        {person.aadhaarNumber ? `Aadhaar ${person.aadhaarNumber}` : "—"}
                      </small>
                    </span>
                  </div>
                  <span>{person.skill}</span>
                  <span>{person.mobile || "—"}</span>
                  <div className="attendance-selector">
                    {ATTENDANCE_STATUSES.map((s) => (
                      <button
                        key={s}
                        className={marks[person.id] === s ? statusClass(s) : ""}
                        onClick={() => setMarks((m) => ({ ...m, [person.id]: s }))}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}

// ---- Manager / Super Admin: read-only attendance by project + date ----
function ManagerAttendance() {
  const [date, setDate] = useState(today());
  const [projectId, setProjectId] = useState("");
  const projects = useProjects();
  const records = useAttendance({ project: projectId, date });
  const summary = useAttendanceSummary({ scope: "project", id: projectId, date });

  useEffect(() => {
    if (!projectId && projects.data?.length) setProjectId(projects.data[0].id);
  }, [projects.data, projectId]);

  const s = summary.data || { present: 0, absent: 0, halfDay: 0, total: 0 };
  const list = records.data || [];

  return (
    <>
      <PageHeading
        eyebrow="ATTENDANCE"
        title="Site attendance"
        text="Review who was on site, by project and date."
      />
      <div className="report-controls">
        <Field label="Project">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {(projects.data || []).length === 0 && <option value="">No projects</option>}
            {(projects.data || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </div>
      <div className="stats-grid attendance-stats">
        <StatCard label="Total" value={s.total} icon={HardHat} tone="green" />
        <StatCard label="Present" value={s.present} icon={UserRoundCheck} tone="blue" />
        <StatCard label="Absent" value={s.absent} icon={X} tone="red" />
        <StatCard label="Half day" value={s.halfDay} icon={Clock3} tone="amber" />
      </div>
      <Section title="Daily attendance" eyebrow="ALL CONTRACTORS" className="attendance-panel">
        {list.length === 0 ? (
          <div className="empty-inline">
            <strong>No attendance recorded</strong>
            <p>Nothing was marked for this project on this date.</p>
          </div>
        ) : (
          <>
            <div className="attendance-table-header">
              <span>Labour</span>
              <span>Skill</span>
              <span>Work order</span>
              <span>Status</span>
            </div>
            <div className="attendance-table">
              {list.map((r) => (
                <div className="attendance-person" key={r.id}>
                  <div className="person-cell">
                    <div className="avatar">{initials(r.labour?.name || "")}</div>
                    <span>
                      <strong>{r.labour?.name || "—"}</strong>
                    </span>
                  </div>
                  <span>{r.labour?.skill || "—"}</span>
                  <span>{r.workOrder?.title || "—"}</span>
                  <span className={`att-status ${statusClass(r.status)}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
