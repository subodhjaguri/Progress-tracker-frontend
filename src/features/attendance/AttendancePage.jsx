import React, { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
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
  if (role === "CONTRACTOR") return <Navigate to="/" replace />;
  return role === "SUPERVISOR" ? <SupervisorAttendance /> : <ManagerAttendance />;
}

// ---- Supervisor: mark attendance for their labour on a work order ----
function SupervisorAttendance() {
  const { announce } = useData();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [date, setDate] = useState(params.get("date") || today());
  const [projectId, setProjectId] = useState(params.get("project") || "");
  const [marks, setMarks] = useState({});
  const [savedLabourIds, setSavedLabourIds] = useState(new Set());

  const projects = useProjects();
  const labour = useLabour();
  const existing = useAttendance({ project: projectId, date });
  const mark = useMarkAttendance();

  useEffect(() => {
    if (!projectId && projects.data?.length) setProjectId(projects.data[0].id);
  }, [projects.data, projectId]);

  useEffect(() => {
    const map = {};
    const saved = new Set();
    (existing.data || []).forEach((r) => {
      const lId = r.labour?.id || r.labour?._id || r.labour;
      if (lId) {
        map[lId] = r.status;
        saved.add(String(lId));
      }
    });
    setMarks(map);
    setSavedLabourIds(saved);
  }, [existing.data]);

  const roster = labour.data || [];
  const selectedProj = (projects.data || []).find((p) => p.id === projectId);
  const counts = { Present: 0, Absent: 0, "Half Day": 0 };
  roster.forEach((l) => {
    if (marks[l.id]) counts[marks[l.id]] += 1;
  });

  const unsubmittedRoster = roster.filter((l) => !savedLabourIds.has(String(l.id)));
  const allAlreadyMarked = roster.length > 0 && unsubmittedRoster.length === 0;

  const save = async () => {
    if (!selectedProj) return announce("Select a project first");
    const entries = unsubmittedRoster
      .filter((l) => marks[l.id])
      .map((l) => ({ labour: l.id, status: marks[l.id] }));
    if (!entries.length) return announce("Mark at least one unsubmitted labourer");
    try {
      await mark.mutateAsync({
        date,
        project: selectedProj.id,
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
        text={
          allAlreadyMarked
            ? "Attendance for this date has already been marked and locked."
            : "Choose a project and date, then mark your workforce."
        }
        action={
          <button className="primary-button" onClick={save} disabled={mark.isPending || allAlreadyMarked}>
            <CircleCheckBig size={18} />
            {mark.isPending ? "Saving…" : allAlreadyMarked ? "Attendance marked" : "Save attendance"}
          </button>
        }
      />
      <div className="report-controls">
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Project">
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {(projects.data || []).length === 0 && <option value="">No projects assigned</option>}
            {(projects.data || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
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
        eyebrow={allAlreadyMarked ? "DAILY ATTENDANCE (LOCKED)" : "DAILY ATTENDANCE"}
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
              {roster.map((person) => {
                const isLocked = savedLabourIds.has(String(person.id));
                return (
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
                          disabled={isLocked}
                          className={marks[person.id] === s ? statusClass(s) : ""}
                          onClick={() => !isLocked && setMarks((m) => ({ ...m, [person.id]: s }))}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Section>
    </>
  );
}

// ---- Manager / Super Admin: read-only attendance by project + date ----
function ManagerAttendance() {
  const [params] = useSearchParams();
  const [date, setDate] = useState(params.get("date") || today());
  const [projectId, setProjectId] = useState(params.get("project") || "");
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
        eyebrow="ATTENDANCE (READ-ONLY)"
        title="Site attendance"
        text="Review who was on site, by project and date. Marking attendance is managed by the site supervisor."
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
                  <span>{r.workOrder?.title || "Direct Site"}</span>
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
