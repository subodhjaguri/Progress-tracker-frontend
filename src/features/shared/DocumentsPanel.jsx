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
} from "../../api/documents.js";
import { DOC_CATEGORIES } from "../../lib/constants.js";
import { fmtDate, fmtSize } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

const isSpreadsheet = (mime = "") => /sheet|excel|csv/.test(mime);

export function DocumentsPanel({ parentType, parentId }) {
  const { user, role } = useAuth();
  const { announce } = useData();
  const { data: docs = [] } = useDocuments(parentType, parentId);
  const upload = useUploadDocument();
  const del = useDeleteDocument(parentType, parentId);
  const fileRef = useRef();
  const [category, setCategory] = useState("Other");

  const items = docs.filter((d) => d.category !== "Site Photo");
  const canDelete = (d) => role !== "CONTRACTOR" || d.uploadedBy?.id === user?.id;

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

  return (
    <Section
      title="Documents"
      action={
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
      }
    >
      {items.length === 0 ? (
        <div className="empty-inline">
          <strong>No documents yet</strong>
          <p>Upload agreements, drawings, receipts and more.</p>
        </div>
      ) : (
        <div className="documents-list">
          {items.map((d) => (
            <article key={d.id}>
              <div className={`document-icon ${isSpreadsheet(d.mimeType) ? "excel" : ""}`}>
                <FileText />
              </div>
              <div>
                <strong>{d.originalName}</strong>
                <span>
                  {d.category} · {fmtSize(d.size)} · {fmtDate(d.createdAt)}
                </span>
              </div>
              <button className="icon-button" onClick={() => downloadDocument(d)} aria-label="Download">
                <Download size={18} />
              </button>
              {canDelete(d) && (
                <button className="icon-button" onClick={() => remove(d.id)} aria-label="Delete">
                  <Trash2 size={17} />
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
