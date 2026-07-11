import React, { useState, useMemo } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useCreateMaterial, useMaterials } from "../../api/materials.js";
import { useProjects } from "../../api/projects.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";

const today = () => new Date().toISOString().slice(0, 10);
const OTHER = "__other__";

export function MaterialForm({ onClose }) {
  const { role } = useAuth();
  // Supervisors log consumption (Used); managers record deliveries (Received/Issued).
  const isSupervisor = role === "SUPERVISOR";
  const projects = useProjects();
  const create = useCreateMaterial();
  const { announce } = useData();

  const [projectId, setProjectId] = useState("");
  const [materialChoice, setMaterialChoice] = useState(""); // supervisor dropdown value
  const [materialName, setMaterialName] = useState(""); // the value actually submitted
  const [unit, setUnit] = useState("");
  const [type, setType] = useState("Received"); // manager only
  const [error, setError] = useState("");

  // A supervisor can only log usage of materials that were RECEIVED on that site,
  // so the material dropdown is seeded from those (Issued-to-contractor stock won't show).
  const received = useMaterials(
    { project: projectId, type: "Received" },
    isSupervisor && !!projectId,
  );
  const receivedMaterials = useMemo(() => {
    const map = new Map();
    for (const m of received.data || []) {
      if (!map.has(m.materialName)) map.set(m.materialName, m.unit);
    }
    return [...map.entries()].map(([name, u]) => ({ name, unit: u }));
  }, [received.data]);

  // A known material fixes the unit; "Other…" (or the manager form) opens the unit picker.
  const unitLocked = isSupervisor && materialChoice && materialChoice !== OTHER;

  const resetProject = (id) => {
    setProjectId(id);
    setMaterialChoice("");
    setMaterialName("");
    setUnit("");
  };

  const pickMaterial = (value) => {
    setMaterialChoice(value);
    if (value === OTHER) {
      setMaterialName("");
      setUnit("");
      return;
    }
    setMaterialName(value);
    const found = receivedMaterials.find((m) => m.name === value);
    setUnit(found?.unit || "");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (!projectId) return setError("Select a project");
    if (!materialName.trim()) return setError("Material is required");
    if (!unit.trim()) return setError("Unit is required");
    const quantity = Number(form.get("quantity"));
    if (!quantity || quantity <= 0) return setError("Enter a valid quantity");

    const body = {
      type: isSupervisor ? "Used" : type,
      project: projectId,
      materialName: materialName.trim(),
      quantity,
      unit: unit.trim(),
      note: form.get("note")?.trim() || undefined,
      date: form.get("date") || undefined,
    };
    if (!isSupervisor) body.party = form.get("party")?.trim() || undefined;
    try {
      await create.mutateAsync(body);
      announce(isSupervisor ? "Usage logged" : "Material movement recorded");
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not save"));
    }
  };

  return (
    <Modal
      title={isSupervisor ? "Log material usage" : "Record material movement"}
      subtitle={
        isSupervisor
          ? "Record how much material was used on site today."
          : "Add a receipt or issue to the project ledger."
      }
      onClose={onClose}
      wide
    >
      <form className="form-grid" onSubmit={submit}>
        {!isSupervisor && (
          <Field label="Movement">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Received</option>
              <option>Issued</option>
            </select>
          </Field>
        )}
        <Field label="Project">
          <select value={projectId} onChange={(e) => resetProject(e.target.value)} required>
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

        {isSupervisor && (
          <Field label="Material">
            <select
              value={materialChoice}
              onChange={(e) => pickMaterial(e.target.value)}
              disabled={!projectId}
              required
            >
              <option value="" disabled>
                {projectId ? "Select material" : "Pick a project first"}
              </option>
              {receivedMaterials.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.unit})
                </option>
              ))}
              <option value={OTHER}>Other…</option>
            </select>
          </Field>
        )}
        {(!isSupervisor || materialChoice === OTHER) && (
          <Field label="Material name">
            <input
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              required
              placeholder="e.g. Cement"
            />
          </Field>
        )}

        <Field label="Quantity">
          <input name="quantity" type="number" min="0" step="any" required placeholder="e.g. 50" />
        </Field>

        <Field label="Unit">
          {unitLocked ? (
            <input value={unit} readOnly className="readonly-input" title="Set from the delivery" />
          ) : (
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              placeholder="bags / MT / litres / local unit"
            />
          )}
        </Field>

        {!isSupervisor && (
          <Field label="Issued to / Supplier">
            <input name="party" placeholder="Contractor or supplier" />
          </Field>
        )}
        <Field label="Date">
          <input name="date" type="date" defaultValue={today()} />
        </Field>
        <Field label="Notes" className="full">
          <textarea
            name="note"
            rows="2"
            placeholder={isSupervisor ? "What it was used for" : "Purpose or work order"}
          />
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions
          onClose={onClose}
          label={create.isPending ? "Saving…" : isSupervisor ? "Log usage" : "Record movement"}
        />
      </form>
    </Modal>
  );
}
