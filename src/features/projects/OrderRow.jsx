import React from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { StatusPill } from "../../components/index.js";

export function OrderRow({ order, onClick }) {
  return (
    <button className="order-row" onClick={onClick}>
      <div className={`priority-stripe ${order.priority.toLowerCase()}`} />
      <div className="order-name">
        <span>{order.code}</span>
        <strong>{order.title}</strong>
        <small>{order.contractor}</small>
      </div>
      <StatusPill value={order.status} />
      <div className="row-progress">
        <span>{order.progress}%</span>
        <div>
          <i style={{ width: `${order.progress}%` }} />
        </div>
      </div>
      <span className="due-date">
        <CalendarDays size={14} />
        {order.dueDate}
      </span>
      <ChevronDown size={17} />
    </button>
  );
}
