import React from "react";
import { ArrowUpRight } from "lucide-react";

export function TextAction({ children, onClick }) {
  return (
    <button className="text-action" onClick={onClick}>
      {children} <ArrowUpRight size={15} />
    </button>
  );
}
