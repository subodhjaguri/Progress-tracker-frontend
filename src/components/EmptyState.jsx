import React from "react";
import { FileText } from "lucide-react";

export function EmptyState({ icon: Icon = FileText, title, text }) {
  return (
    <div className="empty-state">
      <Icon size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
