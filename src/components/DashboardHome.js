import { useState } from "react";
import { Link } from "react-router-dom";
import "./DashboardHome.css";

// Fake data until the backend is connected
const site = {
  businessName: "Kemi's Boutique",
  slug: "kemisboutique",
  trialDaysLeft: 5,
  products: 0,
  newOrders: 0,
  ordersThisWeek: 0,
  hasLogo: false,
  hasWhatsapp: true,
};

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

export default function DashboardHome() {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const url = `https://${site.slug}.cbequicksite.com`;
  const shareLink = `https://wa.me/?text=${encodeURIComponent(
    `Check out my new website: ${url}`
  )}`;

  async function handleCopy() {
    const ok = await copyText(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const checklist = [
    { label: "Add your WhatsApp number", done: site.hasWhatsapp, to: "/dashboard/business" },
    { label: "Upload your logo", done: site.hasLogo, to: "/dashboard/business" },
    { label: "Add your first product", done: site.products > 0, to: "/dashboard/products" },
    { label: "Share your website link", done: shared, share: true },
  ];
  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <div className="home">
      <h1 className="home-title">Hi, {site.businessName} 👋</h1>

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

      <section className={site.trialDaysLeft <= 2 ? "trial-card urgent" : "trial-card"}>
        <div>
          <p className="trial-title">
            Free trial: {site.trialDaysLeft} {site.trialDaysLeft === 1 ? "day" : "days"} left
          </p>
          <p className="trial-sub">After your trial, pay to keep editing your website.</p>
        </div>
        <Link to="/dashboard/billing" className="pay-btn">Pay now</Link>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-num">{site.products}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat">
          <span className="stat-num">{site.newOrders}</span>
          <span className="stat-label">New orders</span>
        </div>
        <div className="stat">
          <span className="stat-num">{site.ordersThisWeek}</span>
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