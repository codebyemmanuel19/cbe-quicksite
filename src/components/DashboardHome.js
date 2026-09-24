import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import "./DashboardHome.css";

// Copy that also works when testing on your phone over WiFi
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(box);
    return ok;
  }
}

function formatDay(value) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// One card, six possible states. The server decides which one.
function statusCard(billing) {
  const d = billing.daysLeft;
  const word = d === 1 ? "day" : "days";

  if (billing.status === "trial_not_started") {
    return {
      title: "Your 7 free days haven't started",
      sub: "They start the day you add your first product.",
      urgent: false,
      to: "/dashboard/products",
      action: "Add product",
    };
  }
  if (billing.status === "trial") {
    return {
      title: `Free trial: ${d} ${word} left`,
      sub: "After your trial, pay to keep editing your website.",
      urgent: d <= 2,
      to: "/dashboard/billing",
      action: "Pay now",
    };
  }
  if (billing.status === "active") {
    return {
      title: `${d} ${word} left on your plan`,
      sub: `Paid until ${formatDay(billing.paidUntil)}. Paying early never loses you days.`,
      urgent: d <= 3,
      to: "/dashboard/billing",
      action: "Add more time",
    };
  }
  if (billing.status === "locked") {
    return {
      title: "Your trial has ended",
      sub: "Your website is still live, but you can't edit it until you pay.",
      urgent: true,
      to: "/dashboard/billing",
      action: "Pay now",
    };
  }
  if (billing.status === "offline") {
    return {
      title: "Your website is offline",
      sub: "Pay now and it comes back immediately.",
      urgent: true,
      to: "/dashboard/billing",
      action: "Pay now",
    };
  }
  return {
    title: "Your account is on hold",
    sub: "Please contact support.",
    urgent: true,
    to: "/dashboard/support",
    action: "Support",
  };
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // The shop first: products and orders need it to exist
        const mine = await api.get("/sites/me");
        const [p, o] = await Promise.all([api.get("/products"), api.get("/orders")]);
        if (cancelled) return;
        setSite(mine.site);
        setProducts(p.products);
        setOrders(o.orders);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 404) return navigate("/setup"); // signed in, no shop yet
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="home">
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }

  if (!site) return null;

  const url = site.url;
  const shareLink = `https://wa.me/?text=${encodeURIComponent(`Check out my new website: ${url}`)}`;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newOrders = orders.filter((o) => o.status === "new").length;
  const ordersThisWeek = orders.filter((o) => new Date(o.createdAt).getTime() > weekAgo).length;

  const card = statusCard(site.billing);

  async function handleCopy() {
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const checklist = [
    { label: "Add your WhatsApp number", done: !!site.business.whatsapp, to: "/dashboard/business" },
    { label: "Upload your logo", done: !!site.business.logo, to: "/dashboard/business" },
    { label: "Add your first product", done: products.length > 0, to: "/dashboard/products" },
    { label: "Share your website link", done: shared, share: true },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <div className="home">
      <h1 className="home-title">Hi, {site.business.businessName} 👋</h1>

      <section className="live-card">
        <p className="live-label">Your website is live</p>
        <p className="live-url">{site.slug}.cbequicksite.com</p>
        <div className="live-actions">
          <button onClick={handleCopy}>{copied ? "Copied!" : "Copy link"}</button>
          <a href={url} target="_blank" rel="noreferrer">Open</a>
          <a
            href={shareLink}
            target="_blank"
            rel="noreferrer"
            className="wa-btn"
            onClick={() => setShared(true)}
          >
            Share on WhatsApp
          </a>
        </div>
      </section>

      <section className={card.urgent ? "trial-card urgent" : "trial-card"}>
        <div>
          <p className="trial-title">{card.title}</p>
          <p className="trial-sub">{card.sub}</p>
        </div>
        <Link to={card.to} className="pay-btn">{card.action}</Link>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">{products.length}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat">
          <span className="stat-num">{newOrders}</span>
          <span className="stat-label">New orders</span>
        </div>
        <div className="stat">
          <span className="stat-num">{ordersThisWeek}</span>
          <span className="stat-label">This week</span>
        </div>
      </section>

      <section className="checklist">
        <div className="checklist-head">
          <h2>Get your website ready</h2>
          <span>{doneCount} of {checklist.length} done</span>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${(doneCount / checklist.length) * 100}%` }}
          />
        </div>

        {checklist.map((item) => (
          <div key={item.label} className={item.done ? "check-item done" : "check-item"}>
            <span className="check-box">{item.done ? "✓" : ""}</span>
            <span className="check-label">{item.label}</span>
            {!item.done &&
              (item.share ? (
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noreferrer"
                  className="check-go"
                  onClick={() => setShared(true)}
                >
                  Share
                </a>
              ) : (
                <Link to={item.to} className="check-go">Go</Link>
              ))}
          </div>
        ))}
      </section>
    </div>
  );
}