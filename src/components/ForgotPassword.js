import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = email.trim().toLowerCase();
    if (!clean) return setError("Enter your email.");

    setSending(true);
    try {
      await api.post("/auth/forgot-password", { email: clean });
      // The server says the same thing whether or not the email exists,
      // so nobody can use this page to find out who has an account
      setSent(true);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="brand-badge">
            <svg viewBox="0 0 100 100" width="56" height="56">
              <rect width="100" height="100" rx="22" fill="#2d3f8f" />
              <text x="50" y="32" textAnchor="middle" fill="#9db3f5" fontSize="22" fontFamily="monospace" fontWeight="bold">&lt;</text>
              <text x="50" y="64" textAnchor="middle" fill="#ffffff" fontSize="34" fontFamily="Arial, sans-serif" fontWeight="800">CBE</text>
              <text x="50" y="90" textAnchor="middle" fill="#9db3f5" fontSize="22" fontFamily="monospace" fontWeight="bold">/&gt;</text>
            </svg>
          </div>

          <p className="brand-wordmark">
            <span className="brand-dark">CBE</span><span className="brand-blue">QuickSite</span>
          </p>

          <h1>Check your email</h1>
          <p className="auth-sub">
            If {email.trim().toLowerCase()} has an account, we've sent a link to set a new password.
            It works once and expires in 1 hour.
          </p>

          <Link className="auth-btn" to="/login">Back to log in</Link>

          <p className="auth-help">
            Nothing after a few minutes? Check your spam folder, or{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setSent(false);
                setSending(false);
              }}
            >
              try another email
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-badge">
          <svg viewBox="0 0 100 100" width="56" height="56">
            <rect width="100" height="100" rx="22" fill="#2d3f8f" />
            <text x="50" y="32" textAnchor="middle" fill="#9db3f5" fontSize="22" fontFamily="monospace" fontWeight="bold">&lt;</text>
            <text x="50" y="64" textAnchor="middle" fill="#ffffff" fontSize="34" fontFamily="Arial, sans-serif" fontWeight="800">CBE</text>
            <text x="50" y="90" textAnchor="middle" fill="#9db3f5" fontSize="22" fontFamily="monospace" fontWeight="bold">/&gt;</text>
          </svg>
        </div>

        <p className="brand-wordmark">
          <span className="brand-dark">CBE</span><span className="brand-blue">QuickSite</span>
        </p>

        <h1>Forgot your password?</h1>
        <p className="auth-sub">
          Type the email you signed up with and we'll send you a link to set a new one.
        </p>

        <label>Email</label>
        <div className="input-icon-row">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
          <input
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn" disabled={sending}>
          {sending ? "Sending..." : "Send reset link"}
        </button>

        <p className="auth-help">
          Don't understand something?{" "}
          <a href="https://wa.me/2349027090880" target="_blank" rel="noreferrer">
            Contact support
          </a>
        </p>

        <p className="auth-switch">
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}