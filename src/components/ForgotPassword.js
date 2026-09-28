import { useState } from "react";
import { Link } from "react-router-dom";
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
          <BrandHead />

          <h1>Check your email</h1>
          <p className="auth-sub">
            If {email.trim().toLowerCase()} has an account, we've sent a link to set a new password.
            It works once and expires in 1 hour.
          </p>

          <Link className="auth-btn" to="/login" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
            Back to log in
          </Link>

          <p className="auth-switch">
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
        <BrandHead />

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

        <p className="auth-switch">
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}