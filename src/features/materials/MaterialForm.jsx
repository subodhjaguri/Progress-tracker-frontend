import React, { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useCreateBulkMaterial, useMaterials } from "../../api/materials.js";
import { useProjects } from "../../api/projects.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";

const today = () => new Date().toISOString().slice(0, 10);
const OTHER = "__other__";

const emptyItem = () => ({
  key: Date.now() + Math.random(),
  materialChoice: "",
  materialName: "",
  quantity: "",
  unit: "",
  note: "",
});

export function MaterialForm({ onClose }) {
  const { role } = useAuth();
  const isSupervisor = role === "SUPERVISOR";
  const projects = useProjects();
  const createBulk = useCreateBulkMaterial();
  const { announce } = useData();

  const [projectId, setProjectId] = useState("");
  const [party, setParty] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState([emptyItem()]);

  const selectedProject = (projects.data || []).find((p) => p.id === projectId);

  // A supervisor can only log usage of materials that were delivered to that site.
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

  const resetProject = (id) => {
    setProjectId(id);
    setItems([emptyItem()]);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const pickMaterial = (index, value) => {
    if (value === OTHER) {
      updateItem(index, "materialChoice", OTHER);
      updateItem(index, "materialName", "");
      updateItem(index, "unit", "");
      return;
    }
    const found = receivedMaterials.find((m) => m.name === value);
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, materialChoice: value, materialName: value, unit: found?.unit || "" }
          : item,
      ),
    );
  };

  const addLine = () => setItems((prev) => [...prev, emptyItem()]);
  const removeLine = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);

    if (!projectId) return setError("Select a project");

    // Validate each line item
    const validatedItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = item.materialName.trim();
      const unit = item.unit.trim();
      const qty = Number(item.quantity);
      if (!name) return setError(`Line ${i + 1}: Material name is required`);
      if (!unit) return setError(`Line ${i + 1}: Unit is required`);
      if (!qty || qty <= 0) return setError(`Line ${i + 1}: Enter a valid quantity`);
      validatedItems.push({
        materialName: name,
        quantity: qty,
        unit,
        note: item.note?.trim() || undefined,
      });
    }

    const body = {
      type: isSupervisor ? "Used" : "Received",
      project: projectId,
      date: form.get("date") || today(),
      party: party.trim() || undefined,
      items: validatedItems,
    };

    try {
      await createBulk.mutateAsync(body);
      announce(
        validatedItems.length === 1
          ? isSupervisor
            ? "Usage logged"
            : "Delivery recorded"
          : `${validatedItems.length} materials ${isSupervisor ? "logged" : "recorded"}`,
      );
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

        <Field label="Date">
          <input name="date" type="date" defaultValue={today()} />
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

        {!isSupervisor && (
          <Field label="Supplier / Party">
            <input
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="e.g. Ambuja Cement Ltd"
            />
          </Field>
        )}

        {/* Line items */}
        <div className="full bulk-items-section">
          <div className="bulk-items-heading">
            <strong>Materials ({items.length} {items.length === 1 ? "item" : "items"})</strong>
            <button type="button" className="small-button" onClick={addLine}>
              <Plus size={15} />
              Add line
            </button>
          </div>

          {items.map((item, index) => (
            <div className="bulk-item-row" key={item.key}>
              <span className="bulk-item-num">{index + 1}</span>

              {isSupervisor ? (
                <Field label="Material">
                  <select
                    value={item.materialChoice}
                    onChange={(e) => pickMaterial(index, e.target.value)}
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
              ) : null}

              {(!isSupervisor || item.materialChoice === OTHER) && (
                <Field label="Material name">
                  <input
                    value={item.materialName}
                    onChange={(e) => updateItem(index, "materialName", e.target.value)}
                    required
                    placeholder="e.g. Cement"
                  />
                </Field>
              )}

              <Field label="Qty">
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="50"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                />
              </Field>

              <Field label="Unit">
                {isSupervisor && item.materialChoice && item.materialChoice !== OTHER ? (
                  <input value={item.unit} readOnly className="readonly-input" />
                ) : (
                  <input
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    required
                    placeholder="bags"
                  />
                )}
              </Field>

              <Field label="Note">
                <input
                  value={item.note}
                  onChange={(e) => updateItem(index, "note", e.target.value)}
                  placeholder="Optional note"
                />
              </Field>

              {items.length > 1 && (
                <button
                  type="button"
                  className="bulk-item-remove"
                  onClick={() => removeLine(index)}
                  title="Remove this line"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {error && <div className="login-error">{error}</div>}
        <FormActions
          onClose={onClose}
          label={
            createBulk.isPending
              ? "Saving…"
              : items.length > 1
                ? `Record ${items.length} materials`
                : isSupervisor
                  ? "Log usage"
                  : "Record delivery"
          }
        />
      </form>
    </Modal>
  );
}
