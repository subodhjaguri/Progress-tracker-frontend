import React, { useState, useRef } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../api/search.js";

function Group({ title, items, render, onClick }) {
  if (!items?.length) return null;
  return (
    <div className="search-group">
      <span className="search-group-title">{title}</span>
      {items.map((it) => {
        const [main, sub] = render(it);
        return (
          <button
            key={it.id}
            className="search-result"
            onClick={onClick ? () => onClick(it) : undefined}
            disabled={!onClick}
          >
            <strong>{main}</strong>
            <small>{sub}</small>
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef();
  const { data } = useSearch(q);

  const go = (path) => {
    setOpen(false);
    setQ("");
    navigate(path);
  };

  const r = data || {};
  const total =
    (r.projects?.length || 0) +
    (r.workOrders?.length || 0) +
    (r.contractors?.length || 0) +
    (r.labour?.length || 0);
  const show = open && q.trim().length >= 2;

  return (
    <div className="global-search">
      <Search size={19} />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Search projects, work orders, people..."
      />
      {show && (
        <div className="search-results" onMouseDown={() => clearTimeout(blurTimer.current)}>
          {total === 0 ? (
            <div className="search-empty">No matches for “{q.trim()}”</div>
          ) : (
            <>
              <Group
                title="Projects"
                items={r.projects}
                render={(p) => [p.name, p.code]}
                onClick={(p) => go(`/projects/${p.id}`)}
              />
              <Group
                title="Work orders"
                items={r.workOrders}
                render={(w) => [w.title, w.code]}
                onClick={(w) => go(`/work-orders/${w.id}`)}
              />
              <Group
                title="Contractors"
                items={r.contractors}
                render={(c) => [c.name, c.mobile]}
              />
              <Group title="Labour" items={r.labour} render={(l) => [l.name, l.skill]} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
