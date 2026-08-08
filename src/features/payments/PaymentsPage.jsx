import React, { useState } from "react";
import { IndianRupee, Plus, Users, Briefcase, ReceiptText, CheckCircle2, XCircle, Paperclip, Image as ImageIcon } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { StatCard, Section, StatusPill, Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { usePayments, useCreatePayment, useUpdatePaymentStatus } from "../../api/payments.js";
import { useProjects } from "../../api/projects.js";
import { useContractors } from "../../api/users.js";
import { errMessage } from "../../lib/api.js";

const TYPES = ["All", "Labour", "Contractor", "Miscellaneous"];

export function PaymentsPage() {
  const { role } = useAuth();
  const { announce } = useData();
  const projects = useProjects();
  const contractors = useContractors();

  const isSupervisor = role === "SUPERVISOR";
  const isManager = role === "MANAGER" || role === "SUPER_ADMIN";

  const [activeType, setActiveType] = useState("All");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [createModalType, setCreateModalType] = useState(null); // "Labour" | "Contractor" | "Miscellaneous"
  const [proofAttachment, setProofAttachment] = useState("");
  const [previewProofUrl, setPreviewProofUrl] = useState(null);

  const queryParams = {};
  if (activeType !== "All") queryParams.type = activeType;
  if (selectedProjectId) queryParams.project = selectedProjectId;
  if (dateFrom) queryParams.from = dateFrom;
  if (dateTo) queryParams.to = dateTo;

  const { data: payments = [], isLoading } = usePayments(queryParams);
  const createPayment = useCreatePayment();
  const updateStatus = useUpdatePaymentStatus();

  const totalPaid = payments
    .filter((p) => p.status === "Paid" || p.status === "Approved")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingCount = payments.filter((p) => p.status === "Requested").length;
  const labourTotal = payments
    .filter((p) => p.type === "Labour")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const contractorTotal = payments
    .filter((p) => p.type === "Contractor")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const miscTotal = payments
    .filter((p) => p.type === "Miscellaneous")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleApprove = async (paymentId, status) => {
    try {
      await updateStatus.mutateAsync({ id: paymentId, status });
      announce(`Payment request marked as ${status}`);
    } catch (err) {
      announce(errMessage(err, "Could not update payment status"));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProofAttachment("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setProofAttachment(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      project: form.get("project"),
      type: createModalType,
      amount: Number(form.get("amount")),
      date: form.get("date") || undefined,
      contractor: form.get("contractor") || undefined,
      labourCount: form.get("labourCount") ? Number(form.get("labourCount")) : undefined,
      proofNotes: form.get("proofNotes") || undefined,
      attachment: proofAttachment || undefined,
    };
    try {
      await createPayment.mutateAsync(body);
      announce(`${createModalType} payment entry created`);
      setCreateModalType(null);
      setProofAttachment("");
    } catch (err) {
      announce(errMessage(err, "Could not create payment entry"));
    }
  };

  return (
    <>
      <PageHeading
        eyebrow="FINANCE & PAYMENTS"
        title="Site Payments & Labour Payouts"
        text="Manage daily labour payment requests, contractor milestone payouts, and site miscellaneous costs."
        action={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="primary-button" onClick={() => setCreateModalType("Labour")}>
              <Plus size={18} />
              Request Labour Payment
            </button>
            {isManager && (
              <>
                <button className="secondary-button" onClick={() => setCreateModalType("Contractor")}>
                  <Plus size={18} />
                  Contractor Payment
                </button>
                <button className="secondary-button" onClick={() => setCreateModalType("Miscellaneous")}>
                  <Plus size={18} />
                  Misc Payment
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="stats-grid material-stats">
        <StatCard label="Total Paid Out" value={`₹${totalPaid.toLocaleString()}`} icon={IndianRupee} tone="green" />
        <StatCard label="Pending Requests" value={pendingCount} icon={Users} tone="amber" />
        <StatCard label="Contractor Payouts" value={`₹${contractorTotal.toLocaleString()}`} icon={Briefcase} tone="blue" />
        <StatCard label="Misc Costs" value={`₹${miscTotal.toLocaleString()}`} icon={ReceiptText} tone="violet" />
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          {TYPES.map((t) => (
            <button
              key={t}
              className={activeType === t ? "active" : ""}
              onClick={() => setActiveType(t)}
            >
              {t}
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
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </Field>
          {(dateFrom || dateTo || selectedProjectId) && (
            <button
              className="secondary-button small"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setSelectedProjectId("");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <Section title="Payment Records" eyebrow="FINANCIAL TRANSACTIONS" className="ledger-panel">
        <div className="ledger-header" style={{ gridTemplateColumns: "1fr 1.2fr 1fr 1fr 1fr 1.4fr" }}>
          <span>Date</span>
          <span>Project & Type</span>
          <span>Amount</span>
          <span>Submitted By</span>
          <span>Status</span>
          <span>Actions / Proof</span>
        </div>
        <div className="ledger-list">
          {isLoading && (
            <div className="empty-inline">
              <strong>Loading payment records…</strong>
            </div>
          )}
          {!isLoading && payments.length === 0 && (
            <div className="empty-inline">
              <strong>No payment records found</strong>
              <p>Request or record a payment to get started.</p>
            </div>
          )}
          {payments.map((p) => (
            <article key={p._id || p.id} style={{ gridTemplateColumns: "1fr 1.2fr 1fr 1fr 1fr 1.4fr" }}>
              <span>{new Date(p.date).toLocaleDateString()}</span>
              <div>
                <strong>{p.project?.name || "—"}</strong>
                <small>{p.type} Payment {p.labourCount ? `(${p.labourCount} labours)` : ""}</small>
              </div>
              <strong style={{ color: "#0f766e" }}>₹{Number(p.amount || 0).toLocaleString()}</strong>
              <span>{p.requestedBy?.name || "—"}</span>
              <div>
                <StatusPill value={p.status} />
              </div>
              <div className="receipt-line" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                {p.proofNotes && <small title={p.proofNotes}>{p.proofNotes}</small>}
                {p.attachment && (
                  <button
                    className="mini-button ghost"
                    style={{ marginTop: "4px" }}
                    onClick={() => setPreviewProofUrl(p.attachment)}
                  >
                    <Paperclip size={13} /> View Proof Screenshot
                  </button>
                )}
                {p.status === "Requested" && isManager && (
                  <span className="receipt-actions" style={{ marginTop: "4px" }}>
                    <button className="mini-button" onClick={() => handleApprove(p._id || p.id, "Paid")}>
                      <CheckCircle2 size={13} /> Pay
                    </button>
                    <button className="mini-button ghost" onClick={() => handleApprove(p._id || p.id, "Rejected")}>
                      <XCircle size={13} /> Reject
                    </button>
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {createModalType && (
        <Modal
          title={`Create ${createModalType} Payment`}
          subtitle={
            createModalType === "Labour"
              ? "Request daily payment for site workforce with proof"
              : createModalType === "Contractor"
              ? "Record milestone or progress payout to contractor"
              : "Record transportation or site incidental expenses"
          }
          onClose={() => {
            setCreateModalType(null);
            setProofAttachment("");
          }}
        >
          <form className="form-grid" onSubmit={submitCreate}>
            <Field label="Project">
              <select name="project" required defaultValue="">
                <option value="" disabled>
                  Select project
                </option>
                {(projects.data || []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Amount (₹)">
              <input name="amount" type="number" min="1" required placeholder="e.g. 15000" />
            </Field>

            <Field label="Payment Date">
              <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>

            {createModalType === "Labour" && (
              <Field label="Labour Count (Worked Today)">
                <input name="labourCount" type="number" min="1" placeholder="e.g. 12" />
              </Field>
            )}

            {createModalType === "Contractor" && (
              <Field label="Contractor">
                <select name="contractor" required defaultValue="">
                  <option value="" disabled>
                    Select contractor
                  </option>
                  {(contractors.data || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Transaction Proof / Screenshot (Image)" className="full">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {proofAttachment && (
                <div style={{ marginTop: "6px", fontSize: "0.8rem", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                  <ImageIcon size={14} /> Screenshot attached
                </div>
              )}
            </Field>

            <Field label="Proof / Description / Notes" className="full">
              <textarea
                name="proofNotes"
                rows="2"
                placeholder={
                  createModalType === "Labour"
                    ? "Mention work done and labour breakdown proof"
                    : createModalType === "Contractor"
                    ? "Milestone / Invoice reference details"
                    : "Transportation or delivery cost details"
                }
              />
            </Field>

            <FormActions
              onClose={() => {
                setCreateModalType(null);
                setProofAttachment("");
              }}
              label={createPayment.isPending ? "Submitting…" : "Save Payment"}
            />
          </form>
        </Modal>
      )}

      {previewProofUrl && (
        <Modal title="Transaction Proof Screenshot" onClose={() => setPreviewProofUrl(null)}>
          <div style={{ textAlign: "center" }}>
            <img
              src={previewProofUrl}
              alt="Payment proof screenshot"
              style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
