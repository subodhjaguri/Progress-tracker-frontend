import React, { useState } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useCreateProject } from "../../api/projects.js";
import { useManagers } from "../../api/users.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../context/DataContext.jsx";
import { errMessage } from "../../lib/api.js";

export function ProjectForm({ onClose }) {
  const { role } = useAuth();
  const isSA = role === "SUPER_ADMIN";
  const managers = useManagers(isSA);
  const create = useCreateProject();
  const { announce } = useData();
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const get = (k) => form.get(k)?.trim() || undefined;
    const body = {
      name: form.get("name"),
      clientName: get("clientName"),
      clientMobile: get("clientMobile"),
      siteName: get("siteName"),
      siteLocation: get("siteLocation"),
      siteAddress: get("siteAddress"),
      description: get("description"),
      targetDate: get("targetDate"),
      status: form.get("status") || undefined,
    };
    if (isSA) body.manager = form.get("manager");
    try {
      await create.mutateAsync(body);
      announce("Project created successfully");
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not create project"));
    }
  };

  return (
    <Modal
      title="Create a new project"
      subtitle="Set up the site basics. You can add work orders next."
      onClose={onClose}
      wide
    >
      <form className="form-grid" onSubmit={submit}>
        <Field label="Project name">
          <input name="name" required placeholder="e.g. Lakeview Apartments" />
        </Field>
        {isSA && (
          <Field label="Manager">
            <select name="manager" required defaultValue="">
              <option value="" disabled>
                Select a manager
              </option>
              {(managers.data || []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Client name">
          <input name="clientName" placeholder="Client / owner name" />
        </Field>
        <Field label="Client mobile">
          <input name="clientMobile" inputMode="numeric" placeholder="10-digit mobile" />
        </Field>
        <Field label="Site name">
          <input name="siteName" placeholder="Site or campus name" />
        </Field>
        <Field label="Site location">
          <input name="siteLocation" placeholder="City, State" />
        </Field>
        <Field label="Site address" className="full">
          <input name="siteAddress" placeholder="Full address" />
        </Field>
        <Field label="Description" className="full">
          <textarea name="description" rows="2" placeholder="A short description of the project" />
        </Field>
        <Field label="Target completion">
          <input name="targetDate" type="date" />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue="Planning">
            <option>Planning</option>
            <option>In Progress</option>
            <option>Blocked</option>
            <option>Completed</option>
          </select>
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions onClose={onClose} label={create.isPending ? "Creating…" : "Create project"} />
      </form>
    </Modal>
  );
}
