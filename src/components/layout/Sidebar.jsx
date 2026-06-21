import React from "react";
import { NavLink } from "react-router-dom";
import { HardHat, X } from "lucide-react";
import { navItems } from "../../lib/constants.js";
import { useAuth } from "../../context/AuthContext.jsx";

export function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const items = navItems.filter((item) => !item.roles || item.roles.includes(role));
  return (
    <>
      {open && <div className="nav-scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <HardHat size={25} />
          </div>
          <div>
            <strong>Progress</strong>
            <span>TRACKER</span>
          </div>
          <button className="nav-close" onClick={onClose}>
            <X size={21} />
          </button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {items.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={onClose}
            >
              <Icon size={20} />
              <span>{label}</span>
              {badge && <i>{badge}</i>}
            </NavLink>
          ))}
        </nav>
        <div className="site-card">
          <span>ACTIVE SITE</span>
          <strong>Riverside Hotel</strong>
          <small>64% overall progress</small>
          <div>
            <i style={{ width: "64%" }} />
          </div>
        </div>
      </aside>
    </>
  );
}
