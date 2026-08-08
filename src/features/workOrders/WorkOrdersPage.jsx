import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Plus, ChevronDown } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { Section, StatusPill, Field } from "../../components/index.js";
import { WORK_ORDER_FILTERS } from "../../lib/constants.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useWorkOrders } from "../../api/workOrders.js";
import { useProjects } from "../../api/projects.js";

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { setModal } = useData();
  const projects = useProjects();
  const [filter, setFilter] = useState("All");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryParams = {};
  if (filter !== "All") queryParams.status = filter;
  if (selectedProjectId) queryParams.project = selectedProjectId;
  if (dateFrom) queryParams.from = dateFrom;
  if (dateTo) queryParams.to = dateTo;

  const { data: orders = [], isLoading } = useWorkOrders(queryParams);

  // Contractors have no operational task access.
  if (role === "CONTRACTOR") return <Navigate to="/" replace />;

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedProjectId("");
  };

  const shown = orders;

  return (
    <>
      <PageHeading
        eyebrow="TASKS"
        title="Tasks that move the site forward"
        text="Assign responsibilities, track progress and resolve blockers."
        action={
          (role === "SUPER_ADMIN" || role === "MANAGER") && (
            <button className="primary-button" onClick={() => setModal({ type: "work-order" })}>
              <Plus size={18} />
              New task
            </button>
          )
        }
      />
      <div className="toolbar" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <div className="filter-tabs">
          {WORK_ORDER_FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="date-filter">
          <Field label="Project">
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="">All Projects</option>
              {(projects.data || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="From">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Field>
          {(dateFrom || dateTo || selectedProjectId) && (
            <button className="secondary-button small" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
      </div>
      <Section title={`${shown.length} tasks`} className="table-panel">
        <div className="orders-table-header">
          <span>Task</span>
          <span>Project</span>
          <span>Status</span>
          <span>Progress</span>
          <span>Due date</span>
          <span />
        </div>
        <div className="order-list">
          {isLoading && (
            <div className="empty-inline">
              <strong>Loading tasks…</strong>
            </div>
          )}
          {!isLoading && shown.length === 0 && (
            <div className="empty-inline">
              <strong>No tasks found</strong>
            </div>
          )}
          {shown.map((order) => (
            <button
              className="order-table-row"
              key={order.id}
              onClick={() => navigate(`/work-orders/${order.id}`)}
            >
              <div className="order-title-cell">
                <i className={`priority-dot ${order.priority.toLowerCase()}`} />
                <span>
                  <strong>{order.title}</strong>
                  <small>
                    {order.supervisor} · {order.priority}
                  </small>
                </span>
              </div>
              <span>{order.projectName || "—"}</span>
              <StatusPill value={order.status} />
              <div className="row-progress">
                <span>{order.progress}%</span>
                <div>
                  <i style={{ width: `${order.progress}%` }} />
                </div>
              </div>
              <span>{order.dueDate}</span>
              <ChevronDown size={17} />
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}
