import React, { useState } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useCreateWorkOrder } from "../../api/workOrders.js";
import { useProjects } from "../../api/projects.js";
import { useContractors } from "../../api/users.js";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";

export function WorkOrderForm({ onClose }) {
  const projects = useProjects();
  const contractors = useContractors(true);
  const create = useCreateWorkOrder();
  const { announce } = useData();
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = {
      projectId: form.get("project"),
      title: form.get("title"),
      description: form.get("description")?.trim() || undefined,
      contractor: form.get("contractor"),
      priority: form.get("priority"),
      dueDate: form.get("due")?.trim() || undefined,
    };
    try {
      await create.mutateAsync(body);
      announce("Work order created and assigned");
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not create work order"));
    }
  };

  return (
    <Modal
      title="Create work order"
      subtitle="Define the work and assign the execution owner."
      onClose={onClose}
      wide
    >
      <form className="form-grid" onSubmit={submit}>
        <Field label="Work order title" className="full">
          <input name="title" required placeholder="e.g. First floor brickwork" />
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
        <Field label="Contractor">
          <select name="contractor" required defaultValue="">
            <option value="" disabled>
              Select contractor
            </option>
            {(contractors.data || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" className="full">
          <textarea name="description" rows="2" placeholder="Describe the expected work and outcome" />
        </Field>
        <Field label="Priority">
          <select name="priority" defaultValue="Medium">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </Field>
        <Field label="Due date">
          <input name="due" type="date" />
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions onClose={onClose} label={create.isPending ? "Creating…" : "Create & assign"} />
      </form>
    </Modal>
  );
}
