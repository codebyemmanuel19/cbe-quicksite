import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import "./Login.css";

const BrandHead = () => (
  <>
    <div className="brand-badge">
      <svg viewBox="0 0 100 100" width="56" height="56">
        <rect width="100" height="100" rx="22" fill="#2d3f8f" />
        <path d="M20 47 L80 47 L74 88 L26 88 Z" fill="#ffffff" />
        <path d="M38 47 Q38 28 50 28 Q62 28 62 47" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <circle cx="41" cy="63" r="4" fill="#2d3f8f" />
        <circle cx="59" cy="63" r="4" fill="#2d3f8f" />
        <path d="M39 73 Q50 81 61 73" fill="none" stroke="#2d3f8f" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
    <p className="brand-wordmark">
      <span className="brand-dark">CBE</span><span className="brand-blue">QuickSite</span>
    </p>
  </>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Someone opened /reset-password without the link from their email
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <BrandHead />
          <h1>Link not valid</h1>
          <p className="auth-sub">
            This page needs the link we emailed you. Ask for a new one.
          </p>
          <Link className="auth-btn" to="/forgot-password" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
            Send a new link
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) return setError("Password must be 8 characters or more.");
    if (password !== confirm) return setError("The two passwords don't match.");

    setSaving(true);
    try {
      // The server checks the link, saves the new password and signs them in
      const res = await api.post("/auth/reset-password", { token, password });
      navigate(res.user ? "/dashboard" : "/login");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <BrandHead />

        <h1>Set a new password</h1>
        <p className="auth-sub">Choose something you'll remember. At least 8 characters.</p>

        <label>New password</label>
        <div className="password-row">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <button type="button" className="show-btn" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <label>Type it again</label>
        <div className="input-icon-row">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Same password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn" disabled={saving}>
          {saving ? "Saving..." : "Save and log in"}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to log in</Link>
        </p>
      </form>
    </div>
  );
}