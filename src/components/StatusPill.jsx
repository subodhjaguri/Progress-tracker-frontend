import React from "react";

export function StatusPill({ value, label }) {
  const key = value?.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill status-${key}`}>{label ?? value}</span>;
}
