import React, { useState } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useCreateMaterial } from "../../api/materials.js";
import { useProjects } from "../../api/projects.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";

const today = () => new Date().toISOString().slice(0, 10);

export function MaterialForm({ onClose }) {
  const { role } = useAuth();
  // Supervisors log consumption (Used); managers record deliveries (Received/Issued).
  const isSupervisor = role === "SUPERVISOR";
  const projects = useProjects();
  const create = useCreateMaterial();
  const { announce } = useData();
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      type: isSupervisor ? "Used" : form.get("type"),
      project: form.get("project"),
      materialName: form.get("materialName"),
      quantity: Number(form.get("quantity")),
      unit: form.get("unit"),
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
            <select name="type" defaultValue="Received">
              <option>Received</option>
              <option>Issued</option>
            </select>
          </Field>
        )}
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
