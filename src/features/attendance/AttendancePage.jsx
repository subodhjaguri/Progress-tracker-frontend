import React, { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { HardHat, UserRoundCheck, CircleCheckBig, Plus, X } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatCard, Section, Field, Modal } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useProjects } from "../../api/projects.js";
import { useAttendance, useMarkAttendance } from "../../api/attendance.js";
import { SKILLS } from "../../lib/constants.js";
import { errMessage } from "../../lib/api.js";

const today = () => new Date().toISOString().slice(0, 10);

export function AttendancePage() {
  const { role } = useAuth();
  if (role === "CONTRACTOR") return <Navigate to="/" replace />;
  // Guard sits here, above every hook, so the view below can use them freely.
  return <AttendanceView canRecord={role === "SUPERVISOR"} />;
}

/** The standard trades, plus any one-off trade the site adds on the day. */
const blankRows = () => SKILLS.map((trade) => ({ key: trade, trade, count: "" }));
const customRow = () => ({ key: `x${Math.random().toString(36).slice(2)}`, trade: "", count: "", custom: true });

function AttendanceView({ canRecord }) {
  const navigate = useNavigate();
  const { announce } = useData();
  const [params] = useSearchParams();
  const [date, setDate] = useState(params.get("date") || today());
  const [projectId, setProjectId] = useState(params.get("project") || "");
  const [showForm, setShowForm] = useState(false);
  const [rows, setRows] = useState(blankRows);
  const [error, setError] = useState("");

  const projects = useProjects();
  const { data: records = [], isLoading } = useAttendance({ project: projectId, date });
  const mark = useMarkAttendance();

  useEffect(() => {
    if (!projectId && projects.data?.length) setProjectId(projects.data[0].id);
  }, [projects.data, projectId]);

  const record = records[0] || null;
  const selectedProject = (projects.data || []).find((p) => p.id === projectId);

  const openForm = () => {
    setRows(blankRows());
    setError("");
    setShowForm(true);
  };

  const setRow = (index, patch) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const addCustom = () => setRows((prev) => [...prev, customRow()]);
  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const formTotal = rows.reduce((sum, r) => sum + (Number(r.count) || 0), 0);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    if (!projectId) return setError("Select a project first");
    const entries = rows
      .filter((r) => r.trade.trim() && Number(r.count) > 0)
      .map((r) => ({ trade: r.trade.trim(), count: Number(r.count) }));
    if (!entries.length) return setError("Enter a headcount for at least one trade");

    try {
      await mark.mutateAsync({ date, project: projectId, entries });
      announce(`Attendance recorded — ${formTotal} on site`);
      setShowForm(false);
    } catch (err) {
      setError(errMessage(err, "Could not record attendance"));
    }
  };

  const total = record?.total ?? 0;
  const trades = record?.entries || [];

  return (
    <>
      <PageHeading
        eyebrow="ATTENDANCE"
        title="Who is on site today"
        text={
          canRecord
            ? "Record the headcount by trade. Pick the date and site, then enter how many of each trade turned up."
            : "The daily headcount by trade, as recorded by the site supervisor."
        }
        action={
          canRecord ? (
            <button className="primary-button" onClick={openForm} disabled={!!record}>
              <CircleCheckBig size={18} />
              {record ? "Already recorded" : "Record attendance"}
            </button>
          ) : undefined
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
        <StatCard label="On site" value={total} icon={HardHat} tone="green" />
        <StatCard label="Trades present" value={trades.length} icon={UserRoundCheck} tone="blue" />
      </div>

      <Section
        title={`${selectedProject?.name || "Project"} — headcount`}
        eyebrow="DAILY ATTENDANCE"
        className="attendance-panel"
        action={
          canRecord ? (
            <button className="small-button" onClick={() => navigate("/labour")}>
              Manage labour
            </button>
          ) : undefined
        }
      >
        {isLoading ? (
          <div className="empty-inline">
            <strong>Loading…</strong>
          </div>
        ) : !record ? (
          <div className="empty-inline">
            <HardHat />
            <strong>Nothing recorded for this date</strong>
            <p>
              {canRecord
                ? "Use “Record attendance” to enter today’s headcount by trade."
                : "The supervisor has not recorded the headcount for this date yet."}
            </p>
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

      {showForm && (
        <Modal
          title="Record attendance"
          subtitle={`${selectedProject?.name || ""} · ${date}`}
          onClose={() => setShowForm(false)}
        >
          <form className="form-grid single" onSubmit={save}>
            <Field label="How many of each trade turned up? Leave blank for trades not on site.">
              <div className="headcount-editor">
                {rows.map((row, index) => (
                  <div className="headcount-row" key={row.key}>
                    {row.custom ? (
                      <input
                        value={row.trade}
                        onChange={(e) => setRow(index, { trade: e.target.value })}
                        placeholder="Trade name"
                      />
                    ) : (
                      <span>{row.trade}</span>
                    )}
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={row.count}
                      onChange={(e) => setRow(index, { count: e.target.value })}
                      placeholder="0"
                    />
                    {row.custom ? (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => removeRow(index)}
                        aria-label="Remove trade"
                      >
                        <X size={15} />
                      </button>
                    ) : (
                      <span className="headcount-spacer" />
                    )}
                  </div>
                ))}
                <button type="button" className="small-button" onClick={addCustom}>
                  <Plus size={14} /> Add another trade
                </button>
              </div>
            </Field>

            <p className="headcount-sum">
              Total on site today: <strong>{formTotal}</strong>
            </p>

            {error && <p className="field-note warn">{error}</p>}

            <FormActions
              onClose={() => setShowForm(false)}
              label={mark.isPending ? "Saving…" : "Save attendance"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}
