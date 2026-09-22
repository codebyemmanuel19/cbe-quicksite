import { useState } from "react";
import { formatPrice } from "./countries";
import "./Billing.css";

const MONTHLY_PRICE = 10000;

const PLANS = [
  { id: "1m", name: "1 month", months: 1, price: 10000, days: 30 },
  { id: "3m", name: "3 months", months: 3, price: 27000, days: 90 },
  { id: "6m", name: "6 months", months: 6, price: 50000, days: 180 },
  { id: "12m", name: "1 year", months: 12, price: 100000, days: 365 },
];

// Fake account until the backend and Paystack are connected.
// Change status to "locked" or "offline" to see those screens.
const startingAccount = {
  status: "trial", // trial | active | locked | offline
  trialDaysLeft: 5,
  paidUntil: null,
  history: [],
};

const STATUS_INFO = {
  trial: { label: "Free trial", tone: "blue" },
  active: { label: "Active", tone: "green" },
  locked: { label: "Editing locked", tone: "orange" },
  offline: { label: "Website offline", tone: "red" },
};

function formatDay(date) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function Billing() {
  const [account, setAccount] = useState(startingAccount);
  const [planId, setPlanId] = useState("1m");
  const [paying, setPaying] = useState(false);

  const plan = PLANS.find((p) => p.id === planId);
  const info = STATUS_INFO[account.status];

  function statusText() {
    if (account.status === "trial") {
      const d = account.trialDaysLeft;
      return `${d} ${d === 1 ? "day" : "days"} left. Pay any time to keep editing after your trial.`;
    }
    if (account.status === "active") return `Paid until ${formatDay(account.paidUntil)}.`;
    if (account.status === "locked") return "Your website is live, but you can't make changes until you pay.";
    return "Your website is offline. Pay to bring it back instantly.";
  }

  // Simulated payment. Later this opens Paystack, and the backend confirms it.
  function handlePay() {
    setPaying(true);

    setTimeout(() => {
      // Paying early never loses days: new time goes on top of what's left
      let start = new Date();
      if (account.paidUntil && new Date(account.paidUntil) > start) {
        start = new Date(account.paidUntil);
      } else if (account.status === "trial") {
        start.setDate(start.getDate() + account.trialDaysLeft);
      }
      start.setDate(start.getDate() + plan.days);

      setAccount({
        ...account,
        status: "active",
        paidUntil: start.toISOString(),
        history: [
          {
            ref: "CBE-" + Date.now().toString().slice(-6),
            date: new Date().toISOString(),
            plan: plan.name,
            amount: plan.price,
          },
          ...account.history,
        ],
      });
      setPaying(false);
    }, 1200);
  }

  return (
    <div className="billing">
      <h1 className="billing-title">Plans & Billing</h1>

      <section className={`status-card tone-${info.tone}`}>
        <p className="status-label">{info.label}</p>
        <p className="status-text">{statusText()}</p>
      </section>

      <section className="billing-card">
        <h2>Choose your plan</h2>
        <div className="plans">
          {PLANS.map((p) => {
            const savings = MONTHLY_PRICE * p.months - p.price;
            const perMonth = Math.round(p.price / p.months);
            return (
              <button
                key={p.id}
                type="button"
                className={planId === p.id ? "plan selected" : "plan"}
                onClick={() => setPlanId(p.id)}
              >
                <span className="plan-name">{p.name}</span>
                <span className="plan-price">{formatPrice(p.price)}</span>
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

        <button className="pay-now" onClick={handlePay} disabled={paying}>
          {paying ? "Processing..." : `Pay ${formatPrice(plan.price)}`}
        </button>
        <p className="billing-hint">Secure payment by card or bank transfer through Paystack.</p>
      </section>

      <section className="billing-card">
        <h2>Payment history</h2>
        {account.history.length === 0 ? (
          <p className="billing-hint">No payments yet.</p>
        ) : (
          account.history.map((h) => (
            <div key={h.ref} className="history-row">
              <div>
                <p className="history-plan">{h.plan}</p>
                <p className="billing-hint">{formatDay(h.date)} · {h.ref}</p>
              </div>
              <span className="history-amount">{formatPrice(h.amount)}</span>
            </div>
          ))
        )}
      </section>

      <section className="billing-card">
        <h2>How it works</h2>
        <ul className="rules">
          <li>Your first 5 days are free.</li>
          <li>After your trial, your website stays live but editing locks until you pay.</li>
          <li>If your website stays unpaid for 30 days, it goes offline until you pay.</li>
          <li>Paying early never loses you days. New time is added on top.</li>
        </ul>
      </section>
    </div>
  );
}