import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HardHat, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { errMessage } from "../../lib/api.js";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(mobile.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errMessage(err, "Invalid mobile or password"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <div className="brand-mark">
            <HardHat size={26} />
          </div>
          <div>
            <strong>Progress</strong>
            <span>TRACKER</span>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="login-sub">Use your mobile number and password.</p>

        <label className="field">
          <span>Mobile number</span>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            inputMode="numeric"
            autoComplete="username"
            placeholder="10-digit mobile"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Your password"
            required
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button className="primary-button login-submit" type="submit" disabled={busy}>
          <LogIn size={18} />
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
