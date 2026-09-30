import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Enter your email and password.");
    }

    setSaving(true);
    try {
      await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const me = await api.get("/auth/me");
      navigate(me.site ? "/dashboard" : "/setup");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-badge">
          <img src="/logo.png" alt="CBE QuickSite" width="56" height="56" />
        </div>

        <p className="brand-wordmark">
          <span className="brand-dark">CBE</span><span className="brand-blue">QuickSite</span>
        </p>

        <h1>Welcome back</h1>
        <p className="auth-sub">Log in to manage your website.</p>

        <label>Email</label>
        <div className="input-icon-row">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
          <input name="email" type="email" placeholder="you@gmail.com"
            value={form.email} onChange={handleChange} />
        </div>

        <label>Password</label>
        <div className="password-row">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input name="password" type={showPassword ? "text" : "password"}
            placeholder="Your password"
            value={form.password} onChange={handleChange} />
          <button type="button" className="show-btn"
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn" disabled={saving}>
          {saving ? "Logging in..." : "Log in"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create your website free</Link>
        </p>
      </form>
    </div>
  );
}