import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Plus, CircleAlert } from "lucide-react";
import { Section, StatusPill, UpdateItem } from "../../components/index.js";
import { PhotosPanel } from "../shared/PhotosPanel.jsx";
import { DocumentsPanel } from "../shared/DocumentsPanel.jsx";
import { CommentsPanel } from "../shared/CommentsPanel.jsx";
import { LabourTasksPanel } from "./LabourTasksPanel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useWorkOrder, useWorkOrderUpdates } from "../../api/workOrders.js";

const TABS = ["Updates", "Labour Tasks", "Photos", "Documents", "Comments"];

export function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setModal } = useData();
  const { role } = useAuth();
  const { data: order, isLoading } = useWorkOrder(id);
  const { data: updates = [] } = useWorkOrderUpdates(id);
  const [tab, setTab] = useState("Updates");

  if (isLoading) {
    return (
      <div className="empty-inline">
        <strong>Loading…</strong>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="empty-state">
        <CircleAlert size={30} />
        <h3>Work order not found</h3>
        <p>It may have been removed.</p>
        <button className="primary-button" onClick={() => navigate("/work-orders")}>
          All work orders
        </button>
      </div>
    );
  }

  return (
    <>
      <button className="back-button" onClick={() => navigate("/work-orders")}>
        <ArrowLeft size={17} />
        All work orders
      </button>
      <div className="work-order-heading">
        <div>
          <span className="eyebrow">
            {order.projectName} · {order.code}
          </span>
          <div>
            <h1>{order.title}</h1>
            <StatusPill value={order.status} />
          </div>
          <p>{order.description}</p>
        </div>
        <button className="primary-button" onClick={() => setModal({ type: "progress", order })}>
          <TrendingUp size={18} />
          Update progress
        </button>
      </div>
      <div className="order-overview">
        <div>
          <span>Contractor</span>
          <strong>{order.contractor}</strong>
          <small>Assigned owner</small>
        </div>
        <div>
          <span>Priority</span>
          <strong className={`priority-text ${order.priority.toLowerCase()}`}>
            {order.priority}
          </strong>
        </div>
        <div>
          <span>Due date</span>
          <strong>{order.dueDate}</strong>
        </div>
        <div className="progress-overview">
          <span>Progress</span>
          <strong>{order.progress}%</strong>
          <div>
            <i style={{ width: `${order.progress}%` }} />
          </div>
          <small>Updated {order.updated}</small>
        </div>
      </div>
      <div className="detail-tabs">
        {TABS.map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item}
            {item === "Updates" && updates.length > 0 && <i>{updates.length}</i>}
          </button>
        ))}
      </div>
      {tab === "Updates" && (
        <Section
          title="Progress updates"
          action={
            <button className="small-button" onClick={() => setModal({ type: "progress", order })}>
              <Plus size={15} />
              Post update
            </button>
          }
          className="wide-panel"
        >
          <div className="updates-list">
            {updates.map((update) => (
              <UpdateItem key={update.id} update={update} orderTitle={order.title} />
            ))}
            {updates.length === 0 && (
              <div className="empty-inline">
                <TrendingUp />
                <strong>No updates yet</strong>
                <p>Post the first update from the field.</p>
              </div>
            )}
          </div>
        </Section>
      )}
      {tab === "Labour Tasks" && (
        <LabourTasksPanel workOrderId={order.id} canManage={role === "CONTRACTOR"} />
      )}
      {tab === "Photos" && <PhotosPanel parentType="WorkOrder" parentId={order.id} />}
      {tab === "Documents" && <DocumentsPanel parentType="WorkOrder" parentId={order.id} />}
      {tab === "Comments" && <CommentsPanel parentType="WorkOrder" parentId={order.id} />}
    </>
  );
}
