import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, SlidersHorizontal, ChevronDown } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { Section, StatusPill } from "../../components/index.js";
import { WORK_ORDER_FILTERS } from "../../lib/constants.js";
import { useData } from "../../context/DataContext.jsx";
import { useWorkOrders } from "../../api/workOrders.js";

export function WorkOrdersPage() {
  const navigate = useNavigate();
  const { setModal } = useData();
  const { data: orders = [], isLoading } = useWorkOrders();
  const [filter, setFilter] = useState("All");

  const shown = filter === "All" ? orders : orders.filter((order) => order.status === filter);

  return (
    <>
      <PageHeading
        eyebrow="WORK ORDERS"
        title="Work that moves the site forward"
        text="Assign responsibilities, track progress and resolve blockers."
        action={
          <button className="primary-button" onClick={() => setModal({ type: "work-order" })}>
            <Plus size={18} />
            New work order
          </button>
        }
      />
      <div className="toolbar">
        <div className="filter-tabs">
          {WORK_ORDER_FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
              <span>
                {item === "All"
                  ? orders.length
                  : orders.filter((order) => order.status === item).length}
              </span>
            </button>
          ))}
        </div>
        <button className="secondary-button">
          <SlidersHorizontal size={17} />
          Filters
        </button>
      </div>
      <Section title={`${shown.length} work orders`} className="table-panel">
        <div className="orders-table-header">
          <span>Work order</span>
          <span>Project</span>
          <span>Status</span>
          <span>Progress</span>
          <span>Due date</span>
          <span />
        </div>
        <div className="order-list">
          {isLoading && (
            <div className="empty-inline">
              <strong>Loading…</strong>
            </div>
          )}
          {!isLoading && shown.length === 0 && (
            <div className="empty-inline">
              <strong>No work orders</strong>
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
                    {order.contractor} · {order.priority}
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
