import React from "react";

export function PageHeading({ eyebrow, title, text, action, secondary }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      <div className="heading-actions">
        {secondary}
        {action}
      </div>
    </div>
  );
}
