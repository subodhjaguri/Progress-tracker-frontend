import React from "react";

export function FormActions({ onClose, label }) {
  return (
    <div className="form-actions">
      <button type="button" className="secondary-button" onClick={onClose}>
        Cancel
      </button>
      <button className="primary-button" type="submit">
        {label}
      </button>
    </div>
  );
}
