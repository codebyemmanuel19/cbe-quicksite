import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import "./Login.css";

const BrandHead = () => (
  <>
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
  </>
);

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [state, setState] = useState(token ? "checking" : "missing");
  const [error, setError] = useState("");
  const done = useRef(false); // React runs effects twice in development

  useEffect(() => {
    if (!token || done.current) return;
    done.current = true;

    let cancelled = false;

    (async () => {
      try {
        await api.post("/auth/verify-email", { token });
        if (cancelled) return;
        setState("done");
        // Give them a second to read it, then straight to work
        setTimeout(() => navigate("/dashboard"), 2000);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <BrandHead />

        {state === "checking" && (
          <>
            <h1>Confirming your email</h1>
            <p className="auth-sub">One moment...</p>
          </>
        )}

        {state === "done" && (
          <>
            <h1>Email confirmed</h1>
            <p className="auth-sub">
              Thank you. Taking you to your dashboard...
            </p>
            <Link className="auth-btn" to="/dashboard">Go to dashboard</Link>
          </>
        )}

        {state === "missing" && (
          <>
            <h1>Link not valid</h1>
            <p className="auth-sub">
              This page needs the link we emailed you. Log in and we'll send a new one.
            </p>
            <Link className="auth-btn" to="/login">Log in</Link>
          </>
        )}

        {state === "failed" && (
          <>
            <h1>Link no longer works</h1>
            <p className="auth-sub">{error}</p>
            <Link className="auth-btn" to="/dashboard">Go to dashboard</Link>
            <p className="auth-help">
              You can send a new link from your dashboard.
            </p>
          </>
        )}
      </div>
    </div>
  );
}