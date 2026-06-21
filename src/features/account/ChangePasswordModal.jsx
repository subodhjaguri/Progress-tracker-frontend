import React, { useState } from "react";
import { Modal, Field } from "../../components/index.js";
import { FormActions } from "../shared/FormActions.jsx";
import { useChangePassword } from "../../api/users.js";
import { errMessage } from "../../lib/api.js";

export function ChangePasswordModal({ onClose, onDone }) {
  const change = useChangePassword();
  const [error, setError] = useState("");

  // Validate in JS (not native) so problems always show a visible inline message
  // instead of the browser silently blocking the submit.
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const currentPassword = (form.get("current") || "").trim();
    const newPassword = form.get("next") || "";
    const confirm = form.get("confirm") || "";
    if (!currentPassword) {
      setError("Enter your current password");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    try {
      await change.mutateAsync({ currentPassword, newPassword });
      onDone?.();
      onClose();
    } catch (err) {
      setError(errMessage(err, "Could not change password"));
    }
  };

  return (
    <Modal title="Change password" subtitle="Update your account password." onClose={onClose}>
      <form className="form-grid single" onSubmit={submit} noValidate>
        <Field label="Current password">
          <input name="current" type="password" />
        </Field>
        <Field label="New password">
          <input name="next" type="password" placeholder="At least 6 characters" />
        </Field>
        <Field label="Confirm new password">
          <input name="confirm" type="password" />
        </Field>
        {error && <div className="login-error">{error}</div>}
        <FormActions onClose={onClose} label={change.isPending ? "Saving…" : "Update password"} />
      </form>
    </Modal>
  );
}
