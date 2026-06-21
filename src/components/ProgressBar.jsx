import React from "react";

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
