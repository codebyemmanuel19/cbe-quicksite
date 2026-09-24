import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "./countries";
import "./Billing.css";

const MONTHLY_PRICE = 5000;

const STATUS_INFO = {
  trial_not_started: { label: "Free trial not started", tone: "blue" },
  trial: { label: "Free trial", tone: "blue" },
  active: { label: "Active", tone: "green" },
  locked: { label: "Editing locked", tone: "orange" },
  offline: { label: "Website offline", tone: "red" },
  suspended: { label: "Account on hold", tone: "red" },
};

function formatDay(date) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function Billing() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [billing, setBilling] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [planId, setPlanId] = useState("1m");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const reference = params.get("reference");

    async function load() {
      try {
        // Coming back from Paystack: confirm the payment before showing anything
        if (reference) {
          setVerifying(true);
          try {
            await api.post("/billing/verify", { reference });
            if (!cancelled) setMessage("Payment received. Your days have been added.");
          } catch (err) {
            if (!cancelled) setError(err.message);
          } finally {
            if (!cancelled) {
              setVerifying(false);
              setParams({}, { replace: true }); // clear ?reference from the address bar
            }
          }
        }

        const res = await api.get("/billing/status");
        if (cancelled) return;
        setBilling(res.billing);
        setPlans(res.plans);
        setHistory(res.history);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 400) return navigate("/setup");
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const plan = plans.find((p) => p.id === planId);
  const info = billing ? STATUS_INFO[billing.status] : null;

  function statusText() {
    const d = billing.daysLeft;
    const word = d === 1 ? "day" : "days";

    if (billing.status === "trial_not_started") {
      return "Your 7 free days start the day you add your first product.";
    }
    if (billing.status === "trial") {
      return `${d} ${word} left. Pay any time to keep editing after your trial.`;
    }
    if (billing.status === "active") return `Paid until ${formatDay(billing.paidUntil)}.`;
    if (billing.status === "locked") {
      return "Your website is live, but you can't make changes until you pay.";
    }
    if (billing.status === "offline") return "Your website is offline. Pay to bring it back instantly.";
    return "Please contact support.";
  }

  // The server creates the payment and tells us where to send them.
  // We never send an amount — only the plan id.
  async function handlePay() {
    setError("");
    setPaying(true);
    try {
      const res = await api.post("/billing/initialize", { plan: planId });
      window.location.href = res.authorizationUrl;
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.message);
      setPaying(false);
    }
  }

  if (loading || verifying) {
    return (
      <div className="billing">
        <p>{verifying ? "Confirming your payment..." : "Loading your plan..."}</p>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="billing">
        <p>{error || "Could not load your plan."}</p>
      </div>
    );
  }

  return (
    <div className="billing">
      <h1 className="billing-title">Plans & Billing</h1>

      {message && <p className="billing-hint">{message}</p>}

      <section className={`status-card tone-${info.tone}`}>
        <p className="status-label">{info.label}</p>
        <p className="status-text">{statusText()}</p>
      </section>

      <section className="billing-card">
        <h2>Choose your plan</h2>
        <div className="plans">
          {plans.map((p) => {
            const savings = MONTHLY_PRICE * p.months - p.amount;
            const perMonth = Math.round(p.amount / p.months);
            return (
              <button
                key={p.id}
                type="button"
                className={planId === p.id ? "plan selected" : "plan"}
                onClick={() => setPlanId(p.id)}
              >
                <span className="plan-name">{p.label}</span>
                <span className="plan-price">{formatPrice(p.amount)}</span>
                {p.months > 1 && (
                  <span className="plan-sub">about {formatPrice(perMonth)}/month</span>
                )}
                <span className="plan-note">
                  {savings > 0 ? `Save ${formatPrice(savings)}` : "Pay as you go"}
                </span>
              </button>
            );
          })}
        </div>

        {error && <p className="billing-hint">{error}</p>}

        <button
          className="pay-now"
          onClick={handlePay}
          disabled={paying || !plan || billing.status === "suspended"}
        >
          {paying ? "Opening Paystack..." : plan ? `Pay ${formatPrice(plan.amount)}` : "Pay"}
        </button>
        <p className="billing-hint">Secure payment by card, bank transfer or USSD through Paystack.</p>
      </section>

      <section className="billing-card">
        <h2>Payment history</h2>
        {history.length === 0 ? (
          <p className="billing-hint">No payments yet.</p>
        ) : (
          history.map((h) => (
            <div key={h.reference} className="history-row">
              <div>
                <p className="history-plan">
                  {h.months} {h.months === 1 ? "month" : "months"}
                  {h.status !== "success" ? ` · ${h.status}` : ""}
                </p>
                <p className="billing-hint">{formatDay(h.created_at)} · {h.reference}</p>
              </div>
              <span className="history-amount">{formatPrice(h.amount)}</span>
            </div>
          ))
        )}
      </section>

      <section className="billing-card">
        <h2>How it works</h2>
        <ul className="rules">
          <li>Your 7 free days start when you add your first product.</li>
          <li>After your trial, your website stays live but editing locks until you pay.</li>
          <li>If your website stays unpaid for 30 days, it goes offline until you pay.</li>
          <li>Paying early never loses you days. New time is added on top.</li>
        </ul>
      </section>
    </div>
  );
}