import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Auth.css";

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
      // Creates the account and sets the login cookie
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
        <h1>Create your account</h1>
        <p className="auth-sub">Get your business website live in minutes.</p>

        <label>Email</label>
        <input name="email" type="email" placeholder="you@gmail.com"
          value={form.email} onChange={handleChange} />

        <label>Password</label>
        <div className="password-row">
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