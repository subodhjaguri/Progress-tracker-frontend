import React, { useState } from "react";
import { Plus, PackageCheck, ArrowDownToLine, ArrowUpFromLine, Boxes } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatCard, Section, StatusPill, Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useMaterials, useConfirmMaterial, useRequestMaterial, useProvideMaterial, useAcknowledgeMaterial } from "../../api/materials.js";
import { useProjects } from "../../api/projects.js";
import { movementLabel } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

const FILTERS = [
  { label: "All", value: null },
  { label: "Requests", value: "Requested" },
  { label: "Delivery", value: "Received" },
  { label: "Used", value: "Used" },
];

export function MaterialsPage() {
  const { role } = useAuth();
  const { setModal, announce } = useData();
  const projects = useProjects();
  const canRecord = role !== "CONTRACTOR";
  const isSupervisor = role === "SUPERVISOR";
  const isManager = role === "MANAGER" || role === "SUPER_ADMIN";
  const canConfirm = role === "SUPERVISOR" || role === "SUPER_ADMIN";
  const [filter, setFilter] = useState(FILTERS[0]);
  const [issueFor, setIssueFor] = useState(null);
  const [requestModal, setRequestModal] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryParams = {};
  if (filter.value) queryParams.type = filter.value;
  if (dateFrom) queryParams.from = dateFrom;
  if (dateTo) queryParams.to = dateTo;

  const { data: materials = [], isLoading } = useMaterials(queryParams);
  const confirm = useConfirmMaterial();
  const requestMat = useRequestMaterial();
  const provideMat = useProvideMaterial();
  const acknowledgeMat = useAcknowledgeMaterial();

  const received = materials.filter((m) => m.type === "Received").length;
  const used = materials.filter((m) => m.type === "Used").length;
  const distinct = new Set(materials.map((m) => m.materialName)).size;

  const handleProvide = async (m) => {
    try {
      await provideMat.mutateAsync(m.id);
      announce("Material marked as provided");
    } catch (err) {
      announce(errMessage(err, "Could not provide material"));
    }
  };

  const handleAcknowledge = async (m) => {
    try {
      await acknowledgeMat.mutateAsync(m.id);
      announce("Material delivery acknowledged");
    } catch (err) {
      announce(errMessage(err, "Could not acknowledge delivery"));
    }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await requestMat.mutateAsync({
        project: form.get("project"),
        materialName: form.get("materialName"),
        quantity: Number(form.get("quantity")),
        unit: form.get("unit"),
        note: form.get("note"),
      });
      announce("Material request submitted");
      setRequestModal(false);
    } catch (err) {
      announce(errMessage(err, "Could not submit request"));
    }
  };

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
        text="Request materials, provide requirements, and track site consumption."
        action={
          canRecord ? (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {isSupervisor && (
                <button className="secondary-button" onClick={() => setRequestModal(true)}>
                  <Plus size={18} />
                  Request Material
                </button>
              )}
              <button className="primary-button" onClick={() => setModal({ type: "material" })}>
                <Plus size={18} />
                {isSupervisor ? "Log usage" : "Record delivery"}
              </button>
            </div>
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
          <span>Movement / Status</span>
          <span>Action / Receipt</span>
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
                <StatusPill value={m.status || m.type} label={movementLabel(m.type)} />
                <strong>
                  {m.quantity} {m.unit}
                </strong>
              </div>
              <div className="ledger-receipt">
                <span>{m.party || m.requestedBy ? `Requested by ${m.requestedBy}` : "—"}</span>
                {m.type === "Requested" && (
                  <div className="receipt-line">
                    {m.status === "Requested" && isManager && (
                      <button className="mini-button" onClick={() => handleProvide(m)}>
                        Provide Material
                      </button>
                    )}
                    {m.status === "Provided" && (isSupervisor || isManager) && (
                      <button className="mini-button" onClick={() => handleAcknowledge(m)}>
                        Acknowledge Delivery
                      </button>
                    )}
                    {m.status === "Acknowledged" && (
                      <small style={{ color: "#16a34a" }}>Delivered & Acknowledged</small>
                    )}
                  </div>
                )}
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

      {requestModal && (
        <Modal title="Request Material" subtitle="Request materials for your project site" onClose={() => setRequestModal(false)}>
          <form className="form-grid" onSubmit={submitRequest}>
            <Field label="Project">
              <select name="project" required defaultValue="">
                <option value="" disabled>Select project</option>
                {(projects.data || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Material Name">
              <input name="materialName" required placeholder="e.g. Bricks, Cement, Steel" />
            </Field>
            <Field label="Quantity">
              <input name="quantity" type="number" min="1" required placeholder="100" />
            </Field>
            <Field label="Unit">
              <input name="unit" required placeholder="bags / tons / pcs" />
            </Field>
            <Field label="Note" className="full">
              <textarea name="note" rows="2" placeholder="Urgency or site delivery details" />
            </Field>
            <FormActions onClose={() => setRequestModal(false)} label={requestMat.isPending ? "Submitting…" : "Submit Request"} />
          </form>
        </Modal>
      )}

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
