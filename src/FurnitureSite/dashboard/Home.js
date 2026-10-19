import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import "../../RealEstateSite/dashboard/dashboard.css";

export default function FurnitureHome() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [items, setItems] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const mine = await api.get("/sites/me");
        const [f, i] = await Promise.all([api.get("/furniture"), api.get("/inquiries")]);
        if (cancelled) return;
        setSite(mine.site);
        setItems(f.items);
        setInquiries(i.inquiries);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 404) return navigate("/setup");
        setError(err.message);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [navigate]);

  if (error) return <div className="rd"><p className="rd-err">{error}</p></div>;
  if (!site) return <div className="rd"><p>Loading your dashboard...</p></div>;

  const url = site.url;
  const shareLink = `https://wa.me/?text=${encodeURIComponent(`See our furniture here: ${url}`)}`;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = inquiries.filter((i) => new Date(i.createdAt) >= monthStart).length;
  const newOnes = inquiries.filter((i) => i.status === "new").length;
  const count = (s) => items.filter((x) => x.status === s).length;
  const d = site.billing.daysLeft;

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
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
        <span>{thisMonth === 0 ? "Share your link on your WhatsApp status to get your first one." : "People asked about your furniture."}</span>
      </section>

      <section className="rd-kpis">
        <div className="rd-kpi"><b>{items.length}</b><span>Pieces</span></div>
        <div className="rd-kpi"><b>{newOnes}</b><span>New inquiries</span></div>
        <div className="rd-kpi"><b>{count("Available")}</b><span>Available</span></div>
        <div className="rd-kpi"><b>{count("Sold out")}</b><span>Sold out</span></div>
      </section>

      <section className={d <= 3 ? "rd-plan urgent" : "rd-plan"}>
        <p>{d} {d === 1 ? "day" : "days"} left on your plan</p>
        <Link className="rd-btn" to="/dashboard/billing">Add more time</Link>
      </section>
    </div>
  );
}