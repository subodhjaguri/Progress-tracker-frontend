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
  // Managers record a delivery (Received) handed to the site supervisor; the supervisor
  // logs consumption (Used). There is no "Issued" — handing material onward is usage.
  const isSupervisor = role === "SUPERVISOR";
  const projects = useProjects();
  const create = useCreateMaterial();
  const { announce } = useData();

  const [projectId, setProjectId] = useState("");
  const [materialChoice, setMaterialChoice] = useState(""); // supervisor dropdown value
  const [materialName, setMaterialName] = useState(""); // the value actually submitted
  const [unit, setUnit] = useState("");
  const [error, setError] = useState("");

  const selectedProject = (projects.data || []).find((p) => p.id === projectId);

  // A supervisor can only log usage of materials that were delivered to that site,
  // so the material dropdown is seeded from those deliveries.
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
      type: isSupervisor ? "Used" : "Received",
      project: projectId,
      materialName: materialName.trim(),
      quantity,
      unit: unit.trim(),
      note: form.get("note")?.trim() || undefined,
      date: form.get("date") || undefined,
    };
    try {
      await create.mutateAsync(body);
      announce(isSupervisor ? "Usage logged" : "Delivery recorded");
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not save"));
    }
  };

  return (
    <Modal
      title={isSupervisor ? "Log material usage" : "Record a delivery"}
      subtitle={
        isSupervisor
          ? "Record how much material was used on site today."
          : "Log a delivery and hand it to the site supervisor to confirm."
      }
      onClose={onClose}
      wide
    >
      <form className="form-grid" onSubmit={submit}>
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

        {/* Managers hand a delivery to the site's supervisor (derived from the project). */}
        {!isSupervisor && projectId && (
          <Field label="Handing over to">
            {selectedProject?.supervisor ? (
              <input
                value={selectedProject.supervisor}
                readOnly
                className="readonly-input"
                title="This site's supervisor"
              />
            ) : (
              <div className="field-note warn">
                No supervisor on this site yet — assign one on the project page so they can
                confirm this delivery.
              </div>
            )}
          </Field>
        )}

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

        <Field label="Date">
          <input name="date" type="date" defaultValue={today()} />
        </Field>
        <Field label="Notes" className="full">
          <textarea
            name="note"
            rows="2"
            placeholder={isSupervisor ? "What it was used for (e.g. given to Contractor A)" : "Purpose or reference"}
          />
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions
          onClose={onClose}
          label={create.isPending ? "Saving…" : isSupervisor ? "Log usage" : "Record delivery"}
        />
      </form>
    </Modal>
  );
}
