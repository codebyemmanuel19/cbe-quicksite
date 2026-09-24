import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./Auth.css";

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

      // Someone who never finished Setup has no shop yet
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
        <h1>Welcome back</h1>
        <p className="auth-sub">Log in to manage your website.</p>

        <label>Email</label>
        <input name="email" type="email" placeholder="you@gmail.com"
          value={form.email} onChange={handleChange} />

        <label>Password</label>
        <div className="password-row">
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

        <p className="auth-help">
          Don't understand something?{" "}
          <a
            href="https://wa.me/2349027090880"
            target="_blank"
            rel="noreferrer"
          >
            Contact support
          </a>
        </p>

        <p className="auth-switch">
          New here? <Link to="/signup">Create your website free</Link>
        </p>
      </form>
    </div>
  );
}