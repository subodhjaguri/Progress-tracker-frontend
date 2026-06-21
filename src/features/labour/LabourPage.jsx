import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Plus, ChevronRight, HardHat } from "lucide-react";
import { PageHeading } from "../../components/layout/PageHeading.jsx";
import { LabourForm } from "./LabourForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLabour } from "../../api/labour.js";
import { initials } from "../../lib/format.js";

export function LabourPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { data: labour = [], isLoading } = useLabour();
  const [showAdd, setShowAdd] = useState(false);

  if (role !== "CONTRACTOR") return <Navigate to="/" replace />;

  return (
    <>
      <PageHeading
        eyebrow="LABOUR"
        title="Your workforce"
        text="Onboard and manage your labourers and their documents."
        action={
          <button className="primary-button" onClick={() => setShowAdd(true)}>
            <Plus size={18} />
            Add labour
          </button>
        }
      />
      <section className="panel">
        {isLoading && (
          <div className="empty-inline">
            <strong>Loading…</strong>
          </div>
        )}
        {!isLoading && labour.length === 0 && (
          <div className="empty-inline">
            <HardHat />
            <strong>No labour yet</strong>
            <p>Add your first labourer to get started.</p>
          </div>
        )}
        <div className="team-list">
          {labour.map((l) => (
            <button
              className="team-row clickable"
              key={l.id}
              onClick={() => navigate(`/labour/${l.id}`)}
            >
              <div className="person">
                <div className="avatar">{initials(l.name)}</div>
                <div>
                  <strong>{l.name}</strong>
                  <span className="team-meta">
                    {l.skill}
                    {l.mobile ? ` · ${l.mobile}` : ""}
                  </span>
                </div>
              </div>
              <span className="pill-status on">{l.skill}</span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>
      </section>
      {showAdd && <LabourForm onClose={() => setShowAdd(false)} />}
    </>
  );
}
