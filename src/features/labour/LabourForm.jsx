import React, { useState } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useCreateLabour, useUpdateLabour } from "../../api/labour.js";
import { useData } from "../../context/DataContext.jsx";
import { SKILLS } from "../../lib/constants.js";
import { errMessage } from "../../lib/api.js";

export function LabourForm({ onClose, labour }) {
  const editing = !!labour;
  const create = useCreateLabour();
  const update = useUpdateLabour();
  const { announce } = useData();
  const [error, setError] = useState("");
  const busy = create.isPending || update.isPending;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = { name: form.get("name"), skill: form.get("skill") };
    const mobile = form.get("mobile")?.trim();
    if (mobile) body.mobile = mobile;
    const aadhaar = form.get("aadhaarNumber")?.trim();
    if (aadhaar) body.aadhaarNumber = aadhaar;
    try {
      if (editing) await update.mutateAsync({ id: labour.id, body });
      else await create.mutateAsync(body);
      announce(editing ? "Labour updated" : "Labour added");
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not save labour"));
    }
  };

  return (
    <Modal title={editing ? "Edit labour" : "Add labour"} onClose={onClose}>
      <form className="form-grid" onSubmit={submit}>
        <Field label="Name">
          <input name="name" required defaultValue={labour?.name || ""} placeholder="e.g. Ramesh Kumar" />
        </Field>
        <Field label="Skill">
          <select name="skill" defaultValue={labour?.skill || "Helper"}>
            {SKILLS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Mobile (optional)">
          <input name="mobile" inputMode="numeric" defaultValue={labour?.mobile || ""} placeholder="10-digit mobile" />
        </Field>
        <Field label="Aadhaar (optional)">
          <input name="aadhaarNumber" inputMode="numeric" placeholder={editing ? "Enter to change" : "12 digits"} />
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions onClose={onClose} label={busy ? "Saving…" : editing ? "Save" : "Add labour"} />
      </form>
    </Modal>
  );
}
