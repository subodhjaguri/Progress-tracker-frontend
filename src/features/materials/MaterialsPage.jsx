import React, { useState } from "react";
import { Plus, PackageCheck, ArrowDownToLine, ArrowUpFromLine, Boxes } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatCard, Section, StatusPill } from "../../components/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useMaterials } from "../../api/materials.js";

const FILTERS = ["All", "Issued", "Received"];

export function MaterialsPage() {
  const { role } = useAuth();
  const { setModal } = useData();
  const canRecord = role !== "CONTRACTOR";
  const [filter, setFilter] = useState("All");
  const { data: materials = [], isLoading } = useMaterials(
    filter === "All" ? {} : { type: filter },
  );

  const issued = materials.filter((m) => m.type === "Issued").length;
  const received = materials.filter((m) => m.type === "Received").length;
  const distinct = new Set(materials.map((m) => m.materialName)).size;

  return (
    <>
      <PageHeading
        eyebrow="MATERIALS"
        title="Know what came in and went out"
        text="A chronological material ledger across every active site."
        action={
          canRecord ? (
            <button className="primary-button" onClick={() => setModal({ type: "material" })}>
              <Plus size={18} />
              Record movement
            </button>
          ) : undefined
        }
      />
      <div className="stats-grid material-stats">
        <StatCard label="Movements" value={materials.length} icon={Boxes} tone="green" />
        <StatCard label="Issued" value={issued} icon={ArrowUpFromLine} tone="amber" />
        <StatCard label="Received" value={received} icon={ArrowDownToLine} tone="blue" />
        <StatCard label="Materials" value={distinct} icon={PackageCheck} tone="violet" />
      </div>
      <div className="toolbar">
        <div className="filter-tabs">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <Section title="Material ledger" eyebrow="LATEST MOVEMENTS" className="ledger-panel">
        <div className="ledger-header">
          <span>Date</span>
          <span>Material</span>
          <span>Project</span>
          <span>Movement</span>
          <span>Issued to / Supplier</span>
        </div>
        <div className="ledger-list">
          {isLoading && (
            <div className="empty-inline">
              <strong>Loading…</strong>
            </div>
          )}
          {!isLoading && materials.length === 0 && (
            <div className="empty-inline">
              <strong>No material movements yet</strong>
              {canRecord && <p>Record a receipt or issue to start the ledger.</p>}
            </div>
          )}
          {materials.map((m) => (
            <article key={m.id}>
              <span>{m.date}</span>
              <div>
                <strong>{m.materialName}</strong>
                <small>{m.note}</small>
              </div>
              <span>{m.projectName || "—"}</span>
              <div>
                <StatusPill value={m.type} />
                <strong>
                  {m.quantity} {m.unit}
                </strong>
              </div>
              <span>{m.party || "—"}</span>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
