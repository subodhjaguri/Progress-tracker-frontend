import React, { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Power, CircleAlert } from "lucide-react";
import { Modal } from "../../components/index.js";
import { DocumentsPanel } from "../shared/DocumentsPanel.jsx";
import { TempPasswordNotice } from "./TempPasswordNotice.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useContractor, useResetPassword, useSetUserStatus } from "../../api/users.js";
import { errMessage } from "../../lib/api.js";

export function ContractorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { announce } = useData();
  const { data: c, isLoading } = useContractor(id);
  const resetPw = useResetPassword();
  const setStatus = useSetUserStatus();
  const [resetResult, setResetResult] = useState(null);

  if (role === "CONTRACTOR") return <Navigate to="/" replace />;
  if (isLoading) {
    return (
      <div className="empty-inline">
        <strong>Loading…</strong>
      </div>
    );
  }
  if (!c) {
    return (
      <div className="empty-state">
        <CircleAlert size={30} />
        <h3>Contractor not found</h3>
        <button className="primary-button" onClick={() => navigate("/team")}>
          Back to team
        </button>
      </div>
    );
  }

  const handleReset = async () => {
    try {
      const r = await resetPw.mutateAsync(c.id);
      setResetResult({ mobile: c.mobile, password: r.temporaryPassword });
    } catch (err) {
      announce(errMessage(err, "Reset failed"));
    }
  };

  const handleToggle = async () => {
    const next = c.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await setStatus.mutateAsync({ id: c.id, status: next });
      announce(`Account ${next === "ACTIVE" ? "activated" : "deactivated"}`);
    } catch (err) {
      announce(errMessage(err, "Update failed"));
    }
  };

  return (
    <>
      <button className="back-button" onClick={() => navigate("/team")}>
        <ArrowLeft size={17} />
        All team
      </button>
      <div className="work-order-heading">
        <div>
          <span className="eyebrow">Contractor · {c.mobile}</span>
          <div>
            <h1>{c.name}</h1>
            <span className={`pill-status ${c.status === "ACTIVE" ? "on" : "off"}`}>
              {c.status === "ACTIVE" ? "Active" : "Inactive"}
            </span>
          </div>
          <p>{c.address || ""}</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={handleReset}>
            <KeyRound size={16} />
            Reset password
          </button>
          <button className="secondary-button" onClick={handleToggle}>
            <Power size={16} />
            {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
      <div className="order-overview">
        <div>
          <span>Mobile</span>
          <strong>{c.mobile}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{c.email || "—"}</strong>
        </div>
        <div>
          <span>Aadhaar</span>
          <strong>{c.aadhaarNumber || "—"}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{c.status === "ACTIVE" ? "Active" : "Inactive"}</strong>
        </div>
      </div>
      <DocumentsPanel parentType="Contractor" parentId={c.id} />
      {resetResult && (
        <Modal title="Password reset" subtitle={c.name} onClose={() => setResetResult(null)}>
          <div className="form-grid single">
            <TempPasswordNotice mobile={resetResult.mobile} password={resetResult.password} />
            <div className="form-actions">
              <button className="primary-button" type="button" onClick={() => setResetResult(null)}>
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
