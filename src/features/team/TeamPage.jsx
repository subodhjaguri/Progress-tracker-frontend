import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Plus, Phone, KeyRound } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { Modal } from "../../components/index.js";
import { CreateUserModal } from "./CreateUserModal.jsx";
import { TempPasswordNotice } from "./TempPasswordNotice.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import {
  useManagers,
  useContractors,
  useResetPassword,
  useSetUserStatus,
} from "../../api/users.js";
import { initials } from "../../lib/format.js";
import { errMessage } from "../../lib/api.js";

export function TeamPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { announce } = useData();
  const isSA = role === "SUPER_ADMIN";
  const tabs = isSA ? ["Managers", "Contractors"] : ["Contractors"];
  const [tab, setTab] = useState(tabs[0]);
  const [createMode, setCreateMode] = useState(null); // "manager" | "contractor"
  const [resetResult, setResetResult] = useState(null);

  // Don't fire team queries for contractors (they're redirected below anyway).
  const canManage = role !== "CONTRACTOR";
  const managers = useManagers(isSA);
  const contractors = useContractors(canManage);
  const resetPw = useResetPassword();
  const setStatus = useSetUserStatus();

  // Contractors have no team-management access.
  if (role === "CONTRACTOR") return <Navigate to="/" replace />;

  const handleReset = async (user) => {
    try {
      const res = await resetPw.mutateAsync(user.id);
      setResetResult({ name: user.name, mobile: user.mobile, password: res.temporaryPassword });
    } catch (err) {
      announce(errMessage(err, "Reset failed"));
    }
  };

  const handleToggle = async (user) => {
    const next = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await setStatus.mutateAsync({ id: user.id, status: next });
      announce(`Account ${next === "ACTIVE" ? "activated" : "deactivated"}`);
    } catch (err) {
      announce(errMessage(err, "Update failed"));
    }
  };

  const active = tab === "Managers" ? managers : contractors;
  const list = active.data ?? [];

  return (
    <>
      <PageHeading
        eyebrow="TEAM"
        title="People & access"
        text="Create and manage the managers and contractors who use the system."
        action={
          tab === "Managers" ? (
            <button className="primary-button" onClick={() => setCreateMode("manager")}>
              <Plus size={18} />
              Create manager
            </button>
          ) : (
            <button className="primary-button" onClick={() => setCreateMode("contractor")}>
              <Plus size={18} />
              Create contractor
            </button>
          )
        }
      />
      <div className="toolbar">
        <div className="filter-tabs">
          {tabs.map((t) => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
              {t}
              <span>{(t === "Managers" ? managers : contractors).data?.length ?? "·"}</span>
            </button>
          ))}
        </div>
      </div>
      <section className="panel">
        {active.isLoading && (
          <div className="empty-inline">
            <strong>Loading…</strong>
          </div>
        )}
        {!active.isLoading && list.length === 0 && (
          <div className="empty-inline">
            <strong>No {tab.toLowerCase()} yet</strong>
            <p>Create one to get started.</p>
          </div>
        )}
        <div className="team-list">
          {list.map((u) => (
            <div className="team-row" key={u.id}>
              <div className="person">
                <div className="avatar">{initials(u.name)}</div>
                <div>
                  {tab === "Contractors" ? (
                    <button className="link-name" onClick={() => navigate(`/contractors/${u.id}`)}>
                      {u.name}
                    </button>
                  ) : (
                    <strong>{u.name}</strong>
                  )}
                  <span className="team-meta">
                    <Phone size={12} />
                    {u.mobile}
                    {u.email ? ` · ${u.email}` : ""}
                    {u.aadhaarNumber ? ` · Aadhaar ${u.aadhaarNumber}` : ""}
                  </span>
                </div>
              </div>
              <span className={`pill-status ${u.status === "ACTIVE" ? "on" : "off"}`}>
                {u.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
              <div className="team-actions">
                <button className="secondary-button" onClick={() => handleReset(u)}>
                  <KeyRound size={15} />
                  Reset password
                </button>
                <button className="secondary-button" onClick={() => handleToggle(u)}>
                  {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {createMode && <CreateUserModal mode={createMode} onClose={() => setCreateMode(null)} />}
      {resetResult && (
        <Modal title="Password reset" subtitle={resetResult.name} onClose={() => setResetResult(null)}>
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
