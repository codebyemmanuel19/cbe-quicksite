import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Signup.css";

export default function Signup() {
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
      return setError("Please fill in every field.");
    }
    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    setSaving(true);
    try {
      await api.post("/auth/signup", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate("/setup");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
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

        <h1>Create your account</h1>
        <p className="auth-sub">Get your business website live in minutes.</p>

        {/* The three things a vendor worries about, answered before they ask */}
        <ul className="auth-points">
          <li>7 days free. No card needed.</li>
          <li>Your own website address.</li>
          <li>Orders come straight to your WhatsApp.</li>
        </ul>

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
            placeholder="At least 8 characters"
            value={form.password} onChange={handleChange} />
          <button type="button" className="show-btn"
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn" disabled={saving}>
          {saving ? "Creating your account..." : "Create account"}
        </button>

        {/* Quietly says a real business is behind this */}
        <p className="auth-legal">
          By creating an account you agree to our{" "}
          <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>

        <p className="auth-help">
          Don't understand something?{" "}
          <a
            href="https://wa.me/2349027090880?text=Hi%2C%20I%20need%20help%20with%20CBE%20QuickSite"
            target="_blank"
            rel="noreferrer"
          >
            Contact support
          </a>
        </p>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}