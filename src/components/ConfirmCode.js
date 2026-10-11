import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { track } from "../pixel";
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

const codeBox = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 12px",
  fontSize: "30px",
  fontWeight: 700,
  letterSpacing: "10px",
  textAlign: "center",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  margin: "6px 0 14px",
  outline: "none",
};

const linkBtn = {
  background: "none",
  border: "none",
  padding: 0,
  font: "inherit",
  color: "#2d3f8f",
  cursor: "pointer",
  textDecoration: "underline",
};

export default function ConfirmCode() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [checking, setChecking] = useState(false);
  const [wait, setWait] = useState(60);
  const [ready, setReady] = useState(false);
  const started = useRef(false); // React runs effects twice in development

  // Who is this, and do they still need to confirm?
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const me = await api.get("/auth/me");

        if (me.user.emailVerified) {
          navigate(me.site ? "/dashboard" : "/setup", { replace: true });
          return;
        }

        setEmail(me.user.email);
        setReady(true);

        // Accounts made before codes existed have none yet. This only sends if there is no live code.
        await api.post("/auth/resend-verification", { onlyIfNone: true }).catch(() => {});
      } catch (err) {
        if (err.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setError(err.message);
          setReady(true);
        }
      }
    })();
  }, [navigate]);

  // Counts down until "Send again" works
  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function confirm(value) {
    setError("");
    setInfo("");
    setChecking(true);
    try {
      await api.post("/auth/verify-code", { code: value });

      // A real, confirmed person: this is the moment Facebook should count
      track("CompleteRegistration");

      const me = await api.get("/auth/me");
      navigate(me.site ? "/dashboard" : "/setup", { replace: true });
    } catch (err) {
      setError(err.message);
      setCode("");
      setChecking(false);
    }
  }

  function handleChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    if (value.length === 6) confirm(value); // sends by itself on the 6th digit
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (code.length === 6 && !checking) confirm(code);
  }

  async function resend() {
    setError("");
    setInfo("");
    try {
      await api.post("/auth/resend-verification");
      setInfo("A new code is on its way.");
      setCode("");
      setWait(60);
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    await api.post("/auth/logout").catch(() => {});
    navigate("/signup");
  }

  if (!ready) return null;

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <BrandHead />

        <h1>Confirm your email</h1>
        <p className="auth-sub">
          We sent a 6-digit code to <b>{email}</b>. Type it below.
        </p>

        <input
          style={codeBox}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="------"
          value={code}
          onChange={handleChange}
          disabled={checking}
          autoFocus
        />

        {error && <p className="auth-error">{error}</p>}
        {info && <p className="auth-sub">{info}</p>}

        <button type="submit" className="auth-btn" disabled={checking || code.length !== 6}>
          {checking ? "Checking..." : "Confirm"}
        </button>

        <p className="auth-switch">
          Did not get it? Check your spam folder.{" "}
          {wait > 0 ? (
            <span>Send again in {wait}s</span>
          ) : (
            <button type="button" style={linkBtn} onClick={resend}>
              Send again
            </button>
          )}
        </p>

        <p className="auth-switch">
          Wrong email?{" "}
          <button type="button" style={linkBtn} onClick={logout}>
            Start again
          </button>
        </p>
      </form>
    </div>
  );
}