import React, { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Pencil, CircleAlert } from "lucide-react";
import { DocumentsPanel } from "../shared/DocumentsPanel.jsx";
import { LabourForm } from "./LabourForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLabourOne } from "../../api/labour.js";

export function LabourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { data: l, isLoading } = useLabourOne(id);
  const [edit, setEdit] = useState(false);

  if (role !== "CONTRACTOR") return <Navigate to="/" replace />;
  if (isLoading) {
    return (
      <div className="empty-inline">
        <strong>Loading…</strong>
      </div>
    );
  }
  if (!l) {
    return (
      <div className="empty-state">
        <CircleAlert size={30} />
        <h3>Labour not found</h3>
        <button className="primary-button" onClick={() => navigate("/labour")}>
          All labour
        </button>
      </div>
    );
  }

  return (
    <>
      <button className="back-button" onClick={() => navigate("/labour")}>
        <ArrowLeft size={17} />
        All labour
      </button>
      <div className="work-order-heading">
        <div>
          <span className="eyebrow">Labour · {l.skill}</span>
          <div>
            <h1>{l.name}</h1>
          </div>
          <p>{l.mobile || ""}</p>
        </div>
        <button className="primary-button" onClick={() => setEdit(true)}>
          <Pencil size={16} />
          Edit
        </button>
      </div>
      <div className="order-overview">
        <div>
          <span>Skill</span>
          <strong>{l.skill}</strong>
        </div>
        <div>
          <span>Mobile</span>
          <strong>{l.mobile || "—"}</strong>
        </div>
        <div>
          <span>Aadhaar</span>
          <strong>{l.aadhaarNumber || "—"}</strong>
        </div>
      </div>
      <DocumentsPanel parentType="Labour" parentId={l.id} />
      {edit && <LabourForm labour={l} onClose={() => setEdit(false)} />}
    </>
  );
}
