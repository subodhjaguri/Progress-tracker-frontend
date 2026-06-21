import React from "react";
import { ChevronRight, Image as ImageIcon } from "lucide-react";

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
          <span className="mini-progress">
            <i style={{ width: `${update.progress}%` }} />
            {update.progress}%
          </span>
          <span>
            <ImageIcon size={14} /> {update.photos} photos
          </span>
        </div>
      </div>
      <ChevronRight className="row-chevron" size={18} />
    </article>
  );
}
