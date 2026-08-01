import React, { useState } from "react";
import { Plus, PackageCheck, ArrowDownToLine, ArrowUpFromLine, Boxes } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatCard, Section, StatusPill, Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useMaterials, useConfirmMaterial } from "../../api/materials.js";
import { movementLabel } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

const FILTERS = [
  { label: "All", value: null },
  { label: "Delivery", value: "Received" },
  { label: "Used", value: "Used" },
];

export function MaterialsPage() {
  const { role } = useAuth();
  const { setModal, announce } = useData();
  const canRecord = role !== "CONTRACTOR";
  const isSupervisor = role === "SUPERVISOR";
  const canConfirm = role === "SUPERVISOR" || role === "SUPER_ADMIN";
  const [filter, setFilter] = useState(FILTERS[0]);
  const [issueFor, setIssueFor] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryParams = {};
  if (filter.value) queryParams.type = filter.value;
  if (dateFrom) queryParams.from = dateFrom;
  if (dateTo) queryParams.to = dateTo;

  const { data: materials = [], isLoading } = useMaterials(queryParams);
  const confirm = useConfirmMaterial();

  const received = materials.filter((m) => m.type === "Received").length;
  const used = materials.filter((m) => m.type === "Used").length;
  const distinct = new Set(materials.map((m) => m.materialName)).size;

  const handleConfirm = async (m) => {
    try {
      await confirm.mutateAsync({ id: m.id, status: "Confirmed" });
      announce("Delivery confirmed");
    } catch (err) {
      announce(errMessage(err, "Could not confirm delivery"));
    }
  };

  const submitIssue = async (event) => {
    event.preventDefault();
    const note = new FormData(event.currentTarget).get("note")?.trim();
    try {
      await confirm.mutateAsync({ id: issueFor.id, status: "Issue", note });
      announce("Issue flagged");
      setIssueFor(null);
    } catch (err) {
      announce(errMessage(err, "Could not flag issue"));
    }
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
  };

  return (
    <>
      <PageHeading
        eyebrow="MATERIALS"
        title="Know what came in and what got used"
        text="A chronological material ledger across every active site."
        action={
          canRecord ? (
            <button className="primary-button" onClick={() => setModal({ type: "material" })}>
              <Plus size={18} />
              {isSupervisor ? "Log usage" : "Record delivery"}
            </button>
          ) : undefined
        }
      />
      <div className="stats-grid material-stats">
        <StatCard label="Movements" value={materials.length} icon={Boxes} tone="green" />
        <StatCard label="Deliveries" value={received} icon={ArrowDownToLine} tone="blue" />
        <StatCard label="Used" value={used} icon={ArrowUpFromLine} tone="amber" />
        <StatCard label="Materials" value={distinct} icon={PackageCheck} tone="violet" />
      </div>
      <div className="toolbar">
        <div className="filter-tabs">
          {FILTERS.map((item) => (
            <button
              key={item.label}
              className={filter.label === item.label ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="date-filter">
          <Field label="From">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Field>
          {(dateFrom || dateTo) && (
            <button className="secondary-button small" onClick={clearDates}>
              Clear
            </button>
          )}
        </div>
      </div>
      <Section title="Material ledger" eyebrow="LATEST MOVEMENTS" className="ledger-panel">
        <div className="ledger-header">
          <span>Date</span>
          <span>Material</span>
          <span>Project</span>
          <span>Movement</span>
          <span>Party / Receipt</span>
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
              {canRecord && <p>Record a delivery or log usage to start the ledger.</p>}
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
                <StatusPill value={m.type} label={movementLabel(m.type)} />
                <strong>
                  {m.quantity} {m.unit}
                </strong>
              </div>
              <div className="ledger-receipt">
                <span>{m.party || "—"}</span>
                {m.type === "Received" && (
                  <div className="receipt-line">
                    <span className={`receipt-badge ${(m.receiptStatus || "Pending").toLowerCase()}`}>
                      {m.receiptStatus || "Pending"}
                    </span>
                    {m.receiptStatus === "Confirmed" && m.confirmedBy && (
                      <small>by {m.confirmedBy}</small>
                    )}
                    {m.receiptStatus === "Issue" && m.receiptNote && <small>{m.receiptNote}</small>}
                    {canConfirm && (!m.receiptStatus || m.receiptStatus === "Pending") && (
                      <span className="receipt-actions">
                        <button className="mini-button" onClick={() => handleConfirm(m)}>
                          Confirm
                        </button>
                        <button className="mini-button ghost" onClick={() => setIssueFor(m)}>
                          Flag issue
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {issueFor && (
        <Modal
          title="Flag a delivery issue"
          subtitle={`${issueFor.materialName} · ${issueFor.projectName || ""}`}
          onClose={() => setIssueFor(null)}
        >
          <form className="form-grid single" onSubmit={submitIssue}>
            <Field label="What's the problem?">
              <textarea name="note" rows="3" required placeholder="e.g. 5 bags short / cement damaged" />
            </Field>
            <FormActions
              onClose={() => setIssueFor(null)}
              label={confirm.isPending ? "Saving…" : "Flag issue"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}
