import React from "react";
import {
  X,
  ChevronRight,
  ArrowUpRight,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

export function StatusPill({ value }) {
  const key = value?.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill status-${key}`}>{value}</span>;
}

export function ProgressBar({ value, compact = false }) {
  return (
    <div className={`progress-wrap ${compact ? "compact" : ""}`}>
      <div className="progress-meta">
        <span>{compact ? "Progress" : "Overall progress"}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "green", note }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </article>
  );
}

export function Section({ title, eyebrow, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-header">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function TextAction({ children, onClick }) {
  return (
    <button className="text-action" onClick={onClick}>
      {children} <ArrowUpRight size={15} />
    </button>
  );
}

export function EmptyState({ icon: Icon = FileText, title, text }) {
  return (
    <div className="empty-state">
      <Icon size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal ${wide ? "wide" : ""}`} onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, className = "" }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function UpdateItem({ update, orderTitle, onOpen }) {
  return (
    <article className="update-item" onClick={onOpen}>
      <div className="avatar">{update.initials}</div>
      <div className="update-body">
        <div className="update-topline">
          <strong>{update.author}</strong>
          <span>{update.time}</span>
        </div>
        <p className="update-context">{orderTitle}</p>
        <p>{update.text}</p>
        <div className="update-footer">
          <span className="mini-progress"><i style={{ width: `${update.progress}%` }} />{update.progress}%</span>
          <span><ImageIcon size={14} /> {update.photos} photos</span>
        </div>
      </div>
      <ChevronRight className="row-chevron" size={18} />
    </article>
  );
}
