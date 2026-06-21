import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({ title, subtitle, onClose, children, wide = false }) {
  // Portal to <body> so the fixed-position backdrop is always relative to the viewport,
  // never trapped by an ancestor's containing block (e.g. the topbar's backdrop-filter).
  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? "wide" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}
