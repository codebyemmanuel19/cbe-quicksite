import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./dashboard.css";

// One line about the plan, whatever state the account is in
function planCard(billing) {
  const d = billing.daysLeft;
  const word = d === 1 ? "day" : "days";

  if (billing.status === "trial_not_started") {
    return {
      text: "Your 7 free days start when you add your first property",
      action: "Add property",
      to: "/dashboard/properties/new",
      urgent: false,
    };
  }
  if (billing.status === "trial") {
    return { text: `Free trial: ${d} ${word} left`, action: "Pay now", to: "/dashboard/billing", urgent: d <= 2 };
  }
  if (billing.status === "active") {
    return { text: `${d} ${word} left on your plan`, action: "Add more time", to: "/dashboard/billing", urgent: d <= 3 };
  }
  if (billing.status === "locked") {
    return { text: "Your trial has ended. Pay to keep editing your website.", action: "Pay now", to: "/dashboard/billing", urgent: true };
  }
  if (billing.status === "offline") {
    return { text: "Your website is offline. Pay now and it comes back.", action: "Pay now", to: "/dashboard/billing", urgent: true };
  }
  return { text: "Your account is on hold", action: "Support", to: "/dashboard/support", urgent: true };
}

export default function RealEstateHome() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // The shop first. Only this one being missing means they never finished setup.
      let mine;
      try {
        mine = await api.get("/sites/me");
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 404) return navigate("/setup");
        return setError(err.message);
      }
      if (cancelled) return;
      setSite(mine.site);

      // If these two fail the dashboard still opens, it just shows zeros
      try {
        const [p, i] = await Promise.all([
          api.get("/properties"),
          api.get("/properties/inquiries/all"),
        ]);
        if (cancelled) return;
        setProperties(Array.isArray(p?.properties) ? p.properties : []);
        setInquiries(Array.isArray(i?.inquiries) ? i.inquiries : []);
      } catch {
        // Nothing to say to the agent about this
      }
    }

    load();
    return () => { cancelled = true; };
  }, [navigate]);

  if (error) return <div className="rd"><p className="rd-err">{error}</p></div>;
  if (!site) return <div className="rd"><p>Loading your dashboard...</p></div>;

  const url = site.url;
  const shareLink = `https://wa.me/?text=${encodeURIComponent(`Check out my properties: ${url}`)}`;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = inquiries.filter((i) => new Date(i.createdAt) >= monthStart).length;

  const count = (s) => properties.filter((p) => p.status === s).length;
  const plan = planCard(site.billing);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Some phones block this, the link is still on screen
    }
  }

  return (
    <div className="rd">
      <h1>Hi, {site.business.businessName} 👋</h1>

      <section className="rd-live">
        <small>Your website is live</small>
        <p>{site.slug}.cbequicksite.com</p>
        <div>
          <button onClick={copy}>{copied ? "Copied!" : "Copy link"}</button>
          <a href={url} target="_blank" rel="noreferrer">Open</a>
          <a className="wa" href={shareLink} target="_blank" rel="noreferrer">Share on WhatsApp</a>
        </div>
      </section>

      <section className="rd-month">
        <small>This month</small>
        <b>{thisMonth === 0 ? "No inquiries yet" : `You got ${thisMonth} ${thisMonth === 1 ? "inquiry" : "inquiries"}`}</b>
        <span>{thisMonth === 0 ? "Share your link to get your first one." : "People asked about your properties."}</span>
      </section>

      <section className="rd-kpis">
        <div className="rd-kpi"><b>{properties.length}</b><span>Properties</span></div>
        <div className="rd-kpi"><b>{inquiries.length}</b><span>Inquiries</span></div>
        <div className="rd-kpi"><b>{count("Available")}</b><span>Available</span></div>
        <div className="rd-kpi"><b>{count("Sold") + count("Rented")}</b><span>Sold or rented</span></div>
      </section>

      <section className={plan.urgent ? "rd-plan urgent" : "rd-plan"}>
        <p>{plan.text}</p>
        <Link className="rd-btn" to={plan.to}>{plan.action}</Link>
      </section>
    </div>
  );
}