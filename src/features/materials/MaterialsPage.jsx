import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus, PackageCheck, ArrowDownToLine, ArrowUpFromLine, Boxes, Pencil, Trash2 } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatCard, Section, StatusPill, Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useMaterials, useConfirmMaterial, useRequestMaterial, useProvideMaterial, useAcknowledgeMaterial, useUpdateManagerNote } from "../../api/materials.js";
import { useProjects } from "../../api/projects.js";
import { movementLabel } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

const FILTERS = [
  { label: "All", value: null },
  { label: "Requests", value: "Requested" },
  { label: "Delivery", value: "Received" },
  { label: "Used", value: "Used" },
];

const emptyRequestItem = () => ({
  key: Date.now() + Math.random(),
  materialName: "",
  quantity: "",
  unit: "",
  note: "",
});

export function MaterialsPage() {
  const { role } = useAuth();
  if (role === "ENGINEER") return <Navigate to="/projects" replace />;
  const { setModal, announce } = useData();
  const projects = useProjects();
  const canRecord = role !== "CONTRACTOR";
  const isSupervisor = role === "SUPERVISOR";
  const isManager = role === "MANAGER" || role === "SUPER_ADMIN";
  const canConfirm = role === "SUPERVISOR" || role === "SUPER_ADMIN";
  const [filter, setFilter] = useState(FILTERS[0]);
  const [issueFor, setIssueFor] = useState(null);
  const [editNoteFor, setEditNoteFor] = useState(null);
  const [requestModal, setRequestModal] = useState(false);
  const [requestProjectId, setRequestProjectId] = useState("");
  const [requestItems, setRequestItems] = useState([emptyRequestItem()]);
  const [requestError, setRequestError] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryParams = {};
  if (filter.value) queryParams.type = filter.value;
  if (selectedProjectId) queryParams.project = selectedProjectId;
  if (dateFrom) queryParams.from = dateFrom;
  if (dateTo) queryParams.to = dateTo;

  const { data: materials = [], isLoading } = useMaterials(queryParams);
  const confirm = useConfirmMaterial();
  const requestMat = useRequestMaterial();
  const provideMat = useProvideMaterial();
  const acknowledgeMat = useAcknowledgeMaterial();
  const updateManagerNote = useUpdateManagerNote();

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
      announce("Material delivery marked as completed");
    } catch (err) {
      announce(errMessage(err, "Could not complete delivery"));
    }
  };

  const addRequestLine = () => setRequestItems((prev) => [...prev, emptyRequestItem()]);
  const removeRequestLine = (index) => {
    if (requestItems.length <= 1) return;
    setRequestItems((prev) => prev.filter((_, i) => i !== index));
  };
  const updateRequestItem = (index, field, value) => {
    setRequestItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setRequestError("");
    if (!requestProjectId) return setRequestError("Select a project");

    const validatedItems = [];
    for (let i = 0; i < requestItems.length; i++) {
      const item = requestItems[i];
      const name = item.materialName.trim();
      const unit = item.unit.trim();
      const qty = Number(item.quantity);
      if (!name) return setRequestError(`Line ${i + 1}: Material name is required`);
      if (!unit) return setRequestError(`Line ${i + 1}: Unit is required`);
      if (!qty || qty <= 0) return setRequestError(`Line ${i + 1}: Enter a valid quantity`);
      validatedItems.push({
        materialName: name,
        quantity: qty,
        unit,
        note: item.note?.trim() || undefined,
      });
    }

    try {
      await requestMat.mutateAsync({
        project: requestProjectId,
        items: validatedItems,
      });
      announce(
        validatedItems.length === 1
          ? "Material request submitted"
          : `${validatedItems.length} material requests submitted`
      );
      setRequestModal(false);
      setRequestItems([emptyRequestItem()]);
      setRequestProjectId("");
    } catch (err) {
      setRequestError(errMessage(err, "Could not submit request"));
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

  const submitManagerNote = async (event) => {
    event.preventDefault();
    const note = new FormData(event.currentTarget).get("note")?.trim();
    try {
      await updateManagerNote.mutateAsync({ id: editNoteFor.id, note });
      announce("Manager action note saved");
      setEditNoteFor(null);
    } catch (err) {
      announce(errMessage(err, "Could not save manager note"));
    }
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setSelectedProjectId("");
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
          <Field label="Project">
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="">All Projects</option>
              {(projects.data || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
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
          {(dateFrom || dateTo || selectedProjectId) && (
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
                <span>
                  {m.type === "Requested"
                    ? (m.requestedBy ? `Requested by ${m.requestedBy}` : m.party || "—")
                    : (m.party || (m.requestedBy ? `Requested by ${m.requestedBy}` : "—"))}
                </span>
                {m.type === "Requested" && (
                  <div className="receipt-line">
                    {m.status === "Requested" && (
                      isManager ? (
                        <button className="mini-button" onClick={() => handleProvide(m)}>
                          Provide Material
                        </button>
                      ) : (
                        <small style={{ color: "#d97706", fontWeight: 500 }}>Awaiting Manager Provision</small>
                      )
                    )}
                    {m.status === "Provided" && (
                      (isSupervisor || role === "SUPER_ADMIN") ? (
                        <button className="mini-button" onClick={() => handleAcknowledge(m)}>
                          Delivery Completed
                        </button>
                      ) : (
                        <small style={{ color: "#2563eb", fontWeight: 500 }}>Provided (Awaiting Supervisor Confirmation)</small>
                      )
                    )}
                    {m.status === "Acknowledged" && (
                      <small style={{ color: "#16a34a", fontWeight: 500 }}>Delivery Completed</small>
                    )}
                  </div>
                )}
                {m.type === "Received" && (
                  <div className="receipt-line" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span className={`receipt-badge ${(m.receiptStatus || "Pending").toLowerCase()}`}>
                        {m.receiptStatus || "Pending"}
                      </span>
                      {m.receiptStatus === "Confirmed" && m.confirmedBy && (
                        <small>by {m.confirmedBy}</small>
                      )}
                      {m.receiptStatus === "Issue" && isManager && (
                        <button
                          className="icon-button"
                          style={{ padding: "2px 4px", fontSize: "0.75rem" }}
                          title="Add/edit manager action note"
                          onClick={() => setEditNoteFor(m)}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </div>
                    {m.receiptStatus === "Issue" && m.receiptNote && (
                      <small style={{ color: "#dc2626" }}>Issue: {m.receiptNote}</small>
                    )}
                    {m.receiptStatus === "Issue" && m.managerNote && (
                      <small style={{ color: "#2563eb", fontWeight: 500 }}>
                        Manager Action: {m.managerNote}
                      </small>
                    )}
                    {canConfirm && (!m.receiptStatus || m.receiptStatus === "Pending") && (
                      <span className="receipt-actions" style={{ marginTop: "4px" }}>
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
        <Modal
          title="Request Material"
          subtitle="Request one or multiple materials for your project site"
          onClose={() => {
            setRequestModal(false);
            setRequestError("");
          }}
          wide
        >
          <form className="form-grid" onSubmit={submitRequest}>
            <Field label="Project">
              <select
                value={requestProjectId}
                onChange={(e) => setRequestProjectId(e.target.value)}
                required
              >
                <option value="" disabled>Select project</option>
                {(projects.data || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>

            <div className="full bulk-items-section">
              <div className="bulk-items-heading">
                <strong>Requested Materials ({requestItems.length} {requestItems.length === 1 ? "item" : "items"})</strong>
                <button type="button" className="small-button" onClick={addRequestLine}>
                  <Plus size={15} />
                  Add line
                </button>
              </div>

              {requestItems.map((item, index) => (
                <div className="bulk-item-row" key={item.key}>
                  <span className="bulk-item-num">{index + 1}</span>

                  <Field label="Material name">
                    <input
                      value={item.materialName}
                      onChange={(e) => updateRequestItem(index, "materialName", e.target.value)}
                      required
                      placeholder="e.g. Bricks, Cement, Steel"
                    />
                  </Field>

                  <Field label="Qty">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      placeholder="100"
                      value={item.quantity}
                      onChange={(e) => updateRequestItem(index, "quantity", e.target.value)}
                    />
                  </Field>

                  <Field label="Unit">
                    <input
                      value={item.unit}
                      onChange={(e) => updateRequestItem(index, "unit", e.target.value)}
                      required
                      placeholder="bags / tons / pcs"
                    />
                  </Field>

                  <Field label="Note">
                    <input
                      value={item.note}
                      onChange={(e) => updateRequestItem(index, "note", e.target.value)}
                      placeholder="Urgency / site details"
                    />
                  </Field>

                  {requestItems.length > 1 && (
                    <button
                      type="button"
                      className="bulk-item-remove"
                      onClick={() => removeRequestLine(index)}
                      title="Remove line"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {requestError && <div className="login-error">{requestError}</div>}

            <FormActions
              onClose={() => {
                setRequestModal(false);
                setRequestError("");
              }}
              label={
                requestMat.isPending
                  ? "Submitting…"
                  : requestItems.length > 1
                  ? `Request ${requestItems.length} Materials`
                  : "Submit Request"
              }
            />
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

      {editNoteFor && (
        <Modal
          title="Manager Action / Resolution Note"
          subtitle={`${editNoteFor.materialName} · ${editNoteFor.projectName || ""}`}
          onClose={() => setEditNoteFor(null)}
        >
          <form className="form-grid single" onSubmit={submitManagerNote}>
            <Field label="Action Taken / Resolution Note">
              <textarea
                name="note"
                rows="3"
                defaultValue={editNoteFor.managerNote || ""}
                required
                placeholder="e.g. Approved replacement order of 5 bags / Contractor notified"
              />
            </Field>
            <FormActions
              onClose={() => setEditNoteFor(null)}
              label={updateManagerNote.isPending ? "Saving Note…" : "Save Action Note"}
            />
          </form>
        </Modal>
      )}
    </>
  );
}
