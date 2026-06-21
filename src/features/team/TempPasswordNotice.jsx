import React from "react";
import { KeyRound } from "lucide-react";

// Shows login details (incl. the one-time temp password) after create / reset.
export function TempPasswordNotice({ mobile, password }) {
  return (
    <div className="temp-pass-notice">
      <KeyRound size={18} />
      <div>
        <strong>Share these login details</strong>
        <p>
          Mobile: <code>{mobile}</code>
        </p>
        {password ? (
          <p>
            Temporary password: <code>{password}</code>
          </p>
        ) : (
          <p>Password was set as provided.</p>
        )}
        <small>The temporary password is shown only once.</small>
      </div>
    </div>
  );
}
