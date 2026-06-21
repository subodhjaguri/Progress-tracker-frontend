import React from "react";

export function StatusPill({ value }) {
  const key = value?.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill status-${key}`}>{value}</span>;
}
