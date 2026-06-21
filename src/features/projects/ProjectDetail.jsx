import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ChartNoAxesCombined,
  Plus,
  HardHat,
  PackageCheck,
  CircleAlert,
  TrendingUp,
} from "lucide-react";
import { Section, StatusPill } from "../../components/index.js";
import { OrderRow } from "./OrderRow.jsx";
import { PhotosPanel } from "../shared/PhotosPanel.jsx";
import { DocumentsPanel } from "../shared/DocumentsPanel.jsx";
import { CommentsPanel } from "../shared/CommentsPanel.jsx";
import { useProject } from "../../api/projects.js";

const TABS = ["Overview", "Work Orders", "Updates", "Photos", "Documents", "Comments"];

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id);
  const [tab, setTab] = useState("Overview");

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
          <small>{project.workOrderCount} work orders</small>
        </div>
        <div>
          <span>Client</span>
          <strong>{project.clientName || "—"}</strong>
          <small>{project.clientMobile || ""}</small>
        </div>
      </div>
      <div className="detail-tabs">
        {TABS.map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            {item}
            {item === "Work Orders" && <i>{orders.length}</i>}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="detail-grid">
          <Section
            title="Work orders"
            action={
              <button className="small-button" onClick={() => navigate("/work-orders")}>
                <Plus size={15} />
                Add work order
              </button>
            }
          >
            <div className="order-list compact-list">
              {orders.length ? (
                orders.map((order) => (
                  <OrderRow key={order.id} order={order} onClick={() => openOrder(order)} />
                ))
              ) : (
                <div className="empty-inline">
                  <strong>No work orders yet</strong>
                </div>
              )}
            </div>
          </Section>
          <Section title="Site snapshot">
            <div className="snapshot-grid">
              <div>
                <HardHat />
                <strong>{project.workOrderCount}</strong>
                <span>Work orders</span>
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
              <strong>Updates live on each work order</strong>
              <p>Open a work order to post or view its progress updates.</p>
            </div>
          </Section>
        </div>
      )}
      {tab === "Work Orders" && (
        <Section title={`${orders.length} work orders`}>
          <div className="order-list">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onClick={() => openOrder(order)} />
            ))}
          </div>
        </Section>
      )}
      {tab === "Updates" && (
        <Section title="Progress timeline">
          <div className="empty-inline">
            <TrendingUp />
            <strong>Updates live on each work order</strong>
            <p>Open a work order to see its progress timeline.</p>
          </div>
        </Section>
      )}
      {tab === "Photos" && <PhotosPanel parentType="Project" parentId={project.id} />}
      {tab === "Documents" && <DocumentsPanel parentType="Project" parentId={project.id} />}
      {tab === "Comments" && <CommentsPanel parentType="Project" parentId={project.id} />}
    </>
  );
}
