import React, { useState } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { TempPasswordNotice } from "./TempPasswordNotice.jsx";
import { useCreateManager, useCreateContractor } from "../../api/users.js";
import { errMessage } from "../../lib/api.js";

export function CreateUserModal({ mode, onClose }) {
  const isContractor = mode === "contractor";
  const createManager = useCreateManager();
  const createContractor = useCreateContractor();
  const create = isContractor ? createContractor : createManager;
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null); // { user, temporaryPassword }

  const noun = isContractor ? "Contractor" : "Manager";

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = { name: form.get("name"), mobile: form.get("mobile") };
    const email = form.get("email")?.trim();
    if (email) body.email = email;
    const password = form.get("password")?.trim();
    if (password) body.password = password;
    if (isContractor) {
      const aadhaar = form.get("aadhaarNumber")?.trim();
      const address = form.get("address")?.trim();
      if (aadhaar) body.aadhaarNumber = aadhaar;
      if (address) body.address = address;
    }
    try {
      setCreated(await create.mutateAsync(body));
    } catch (err) {
      setError(errMessage(err, `Could not create the ${noun.toLowerCase()}`));
    }
  };

  if (created) {
    return (
      <Modal title={`${noun} created`} subtitle={created.user?.name} onClose={onClose}>
        <div className="form-grid single">
          <TempPasswordNotice
            mobile={created.user?.mobile}
            password={created.temporaryPassword}
          />
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`Create ${noun.toLowerCase()}`}
      subtitle={
        isContractor
          ? "Add a contractor and share their login."
          : "Add a project manager and share their login."
      }
      onClose={onClose}
      wide={isContractor}
    >
      <form className="form-grid" onSubmit={submit}>
        <Field label="Full name">
          <input name="name" required placeholder="e.g. Vikram Joshi" />
        </Field>
        <Field label="Mobile number">
          <input name="mobile" required inputMode="numeric" placeholder="10-digit mobile" />
        </Field>
        <Field label="Email (optional)" className={isContractor ? "" : "full"}>
          <input name="email" type="email" placeholder="name@example.com" />
        </Field>
        {isContractor && (
          <>
            <Field label="Aadhaar number (optional)">
              <input name="aadhaarNumber" inputMode="numeric" placeholder="12 digits" />
            </Field>
            <Field label="Address (optional)" className="full">
              <textarea name="address" rows="2" placeholder="Address" />
            </Field>
          </>
        )}
        <Field label="Temporary password (optional)" className="full">
          <input name="password" placeholder="Leave blank to auto-generate" />
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions
          onClose={onClose}
          label={create.isPending ? "Creating…" : `Create ${noun.toLowerCase()}`}
        />
      </form>
    </Modal>
  );
}
