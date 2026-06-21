import React, { useState } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useCreateMaterial } from "../../api/materials.js";
import { useProjects } from "../../api/projects.js";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";

const today = () => new Date().toISOString().slice(0, 10);

export function MaterialForm({ onClose }) {
  const projects = useProjects();
  const create = useCreateMaterial();
  const { announce } = useData();
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      type: form.get("type"),
      project: form.get("project"),
      materialName: form.get("materialName"),
      quantity: Number(form.get("quantity")),
      unit: form.get("unit"),
      party: form.get("party")?.trim() || undefined,
      note: form.get("note")?.trim() || undefined,
      date: form.get("date") || undefined,
    };
    try {
      await create.mutateAsync(body);
      announce("Material movement recorded");
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not record movement"));
    }
  };

  return (
    <Modal
      title="Record material movement"
      subtitle="Add a receipt or issue to the project ledger."
      onClose={onClose}
      wide
    >
      <form className="form-grid" onSubmit={submit}>
        <Field label="Movement">
          <select name="type" defaultValue="Issued">
            <option>Issued</option>
            <option>Received</option>
          </select>
        </Field>
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
        <Field label="Material name">
          <input name="materialName" required placeholder="e.g. Cement" />
        </Field>
        <Field label="Quantity">
          <input name="quantity" type="number" min="0" step="any" required placeholder="e.g. 50" />
        </Field>
        <Field label="Unit">
          <input name="unit" required placeholder="bags / MT / litres" />
        </Field>
        <Field label="Issued to / Supplier">
          <input name="party" placeholder="Contractor or supplier" />
        </Field>
        <Field label="Date">
          <input name="date" type="date" defaultValue={today()} />
        </Field>
        <Field label="Notes" className="full">
          <textarea name="note" rows="2" placeholder="Purpose or work order" />
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions onClose={onClose} label={create.isPending ? "Saving…" : "Record movement"} />
      </form>
    </Modal>
  );
}
