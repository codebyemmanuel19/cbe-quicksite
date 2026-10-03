import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "./countries";
import "./Billing.css";

// The plan with this many months is pre-selected and marked Popular
const POPULAR_MONTHS = 3;

const STATUS_INFO = {
  trial_not_started: { label: "Free trial not started", tone: "blue" },
  trial: { label: "Free trial", tone: "blue" },
  active: { label: "Active", tone: "green" },
  locked: { label: "Editing locked", tone: "orange" },
  offline: { label: "Website offline", tone: "red" },
  suspended: { label: "Account on hold", tone: "red" },
};

// Change these words any time. They show under "Plan Benefits".
const BENEFITS = [
  {
    title: "Your own website",
    text: "Your business gets a real website address of its own that customers can open on any phone.",
  },
  {
    title: "Products",
    text: "Add your products with photos, sizes, colours and prices, and change them whenever you like.",
  },
  {
    title: "Orders on WhatsApp",
    text: "Customers order from your website and the order comes straight to your WhatsApp.",
  },
  {
    title: "Edit any time",
    text: "Update your prices, photos and business info yourself, with no need to call anyone.",
  },
  {
    title: "Support",
    text: "Get help when you are stuck. Tap Support in the menu.",
  },
];

const RULES = [
  "Your 7 free days start when you add your first product.",
  "After your trial, your website stays live but editing locks until you pay.",
  "If your website stays unpaid for 30 days, it goes offline until you pay.",
  "Paying early never loses you days. New time is added on top.",
];

// e.g. "Billed every 3 months"
function billedEvery(months) {
  if (months === 1) return "Billed every month";
  if (months === 12) return "Billed every year";
  return `Billed every ${months} months`;
}

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
  const [planId, setPlanId] = useState("");
  const [tab, setTab] = useState("benefits"); // "benefits" or "how"
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

        const shown = [...res.plans].sort((a, b) => a.months - b.months);
        setPlans(shown);

        // The popular plan is pre-selected
        const popular = shown.find((p) => p.months === POPULAR_MONTHS) || shown[shown.length - 1];
        if (popular) setPlanId(popular.id);
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
  const popularPlan = plans.find((p) => p.months === POPULAR_MONTHS);
  const popularId = popularPlan ? popularPlan.id : "";

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
  // We never send an amount, only the plan id.
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

      <h2 className="choose-title">Choose your plan</h2>

      <div className="plan-list">
        {plans.map((p) => {
          const selected = planId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={selected ? "plan-card selected" : "plan-card"}
              onClick={() => setPlanId(p.id)}
            >
              <span className="radio">{selected && <span className="radio-dot" />}</span>

              <span className="plan-body">
                <span className="plan-price">
                  {formatPrice(p.amount)}
                  <small> / {p.label.toLowerCase()}</small>
                </span>
                <span className="plan-desc">{billedEvery(p.months)}</span>
              </span>

              {p.id === popularId && <span className="popular">Popular</span>}
            </button>
          );
        })}
      </div>

      {error && <p className="billing-error">{error}</p>}

      <button
        className="continue-btn"
        onClick={handlePay}
        disabled={paying || !plan || billing.status === "suspended"}
      >
        {paying ? "Opening Paystack..." : "Continue"}
      </button>
      <p className="billing-hint center">
        Secure payment by card, bank transfer or USSD through Paystack.
      </p>

      <div className="tabs">
        <button
          type="button"
          className={tab === "benefits" ? "tab active" : "tab"}
          onClick={() => setTab("benefits")}
        >
          Plan Benefits
        </button>
        <button
          type="button"
          className={tab === "how" ? "tab active" : "tab"}
          onClick={() => setTab("how")}
        >
          How it works
        </button>
      </div>

      {tab === "benefits" ? (
        <div className="acc-list">
          {BENEFITS.map((b) => (
            <details key={b.title} className="acc">
              <summary>{b.title}</summary>
              <p>{b.text}</p>
            </details>
          ))}
        </div>
      ) : (
        <ul className="rules">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}