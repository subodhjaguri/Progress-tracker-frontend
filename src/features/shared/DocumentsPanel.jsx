import React, { useRef, useState } from "react";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { Section } from "../../components/index.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  downloadDocument,
  useApproveSuperAdminDocument,
  useApproveManagerDocument,
} from "../../api/documents.js";
import { DOC_CATEGORIES } from "../../lib/constants.js";
import { fmtDate, fmtSize } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

const isSpreadsheet = (mime = "") => /sheet|excel|csv/.test(mime);

export function DocumentsPanel({ parentType, parentId, categoryFilter }) {
  const { user, role } = useAuth();
  const { announce } = useData();
  const { data: docs = [] } = useDocuments(parentType, parentId);
  const upload = useUploadDocument();
  const del = useDeleteDocument(parentType, parentId);
  const approveSuperAdmin = useApproveSuperAdminDocument(parentType, parentId);
  const approveManager = useApproveManagerDocument(parentType, parentId);
  const fileRef = useRef();
  const [category, setCategory] = useState(categoryFilter || "Other");

  const items = docs.filter(
    (d) =>
      d.category !== "Site Photo" &&
      (!categoryFilter || d.category === categoryFilter),
  );
  const isSupervisor = role === "SUPERVISOR";
  const canUpload = !isSupervisor;
  const canDelete = (d) => !isSupervisor && (role !== "CONTRACTOR" || d.uploadedBy?.id === user?.id);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload.mutateAsync({ file, parentType, parentId, category });
      announce("Document uploaded");
    } catch (err) {
      announce(errMessage(err, "Upload failed"));
    }
    e.target.value = "";
  };

  const remove = async (id) => {
    try {
      await del.mutateAsync(id);
      announce("Document removed");
    } catch (err) {
      announce(errMessage(err, "Could not delete"));
    }
  };

  const handleSuperAdminApprove = async (docId) => {
    try {
      await approveSuperAdmin.mutateAsync({ id: docId, status: "Approved" });
      announce("Approved by Super Admin");
    } catch (err) {
      announce(errMessage(err, "Could not approve"));
    }
  };

  const handleManagerApprove = async (docId) => {
    try {
      await approveManager.mutateAsync({ id: docId, status: "Approved" });
      announce("Approved by Manager");
    } catch (err) {
      announce(errMessage(err, "Could not approve"));
    }
  };

  return (
    <Section
      title="Documents"
      action={
        canUpload && (
          <div className="inline-actions">
            <select className="doc-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {DOC_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input type="file" ref={fileRef} hidden onChange={onPick} />
            <button
              className="small-button"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
            >
              <Upload size={15} />
              {upload.isPending ? "Uploading…" : "Upload"}
            </button>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="empty-inline">
          <strong>No documents yet</strong>
          <p>Upload agreements, drawings, receipts and more.</p>
        </div>
      ) : (
        <div className="documents-list">
          {items.map((d) => {
            const isTechnical = d.category === "Drawing" || d.category === "Engineering Document";
            const saStatus = d.superAdminApproval?.status || "Pending";
            const mgrStatus = d.managerApproval?.status || "Pending";

            return (
              <article key={d.id}>
                <div className={`document-icon ${isSpreadsheet(d.mimeType) ? "excel" : ""}`}>
                  <FileText />
                </div>
                <div>
                  <strong>{d.originalName}</strong>
                  <span>
                    {d.category} · {fmtSize(d.size)} · {fmtDate(d.createdAt)}
                  </span>
                  {isTechnical && (
                    <div style={{ display: "flex", gap: "0.4rem", marginTop: "4px", fontSize: "0.75rem" }}>
                      <span className={`receipt-badge ${saStatus.toLowerCase()}`}>
                        Super Admin: {saStatus}
                      </span>
                      <span className={`receipt-badge ${mgrStatus.toLowerCase()}`}>
                        Manager: {mgrStatus}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  {isTechnical && saStatus === "Pending" && role === "SUPER_ADMIN" && (
                    <button className="mini-button" onClick={() => handleSuperAdminApprove(d.id)}>
                      Super Admin Approve
                    </button>
                  )}
                  {isTechnical && saStatus === "Approved" && mgrStatus === "Pending" && (role === "MANAGER" || role === "SUPER_ADMIN") && (
                    <button className="mini-button" onClick={() => handleManagerApprove(d.id)}>
                      Manager Approve
                    </button>
                  )}
                  <button className="icon-button" onClick={() => downloadDocument(d)} aria-label="Download">
                    <Download size={18} />
                  </button>
                  {canDelete(d) && (
                    <button className="icon-button" onClick={() => remove(d.id)} aria-label="Delete">
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}
