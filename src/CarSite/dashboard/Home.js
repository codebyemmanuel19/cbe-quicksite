import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import DashboardSkeleton from "../../components/Skeleton";
import TrialCard from "../../components/TrialCard";
import "../../RealEstateSite/dashboard/dashboard.css";

export default function CarHome() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [cars, setCars] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const mine = await api.get("/sites/me");
        const [c, i] = await Promise.all([api.get("/cars"), api.get("/cars/inquiries/all")]);
        if (cancelled) return;
        setSite(mine.site);
        setCars(c.cars);
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
  if (!site) return <div className="rd"><DashboardSkeleton /></div>;

  const url = site.url;
  const shareLink = `https://wa.me/?text=${encodeURIComponent(`Check out the cars I have for sale: ${url}`)}`;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = inquiries.filter((i) => new Date(i.createdAt) >= monthStart).length;
  const newOnes = inquiries.filter((i) => i.status === "new").length;
  const count = (s) => cars.filter((c) => c.status === s).length;
  const b = site.billing;
  let planText = `${b.daysLeft} ${b.daysLeft === 1 ? "day" : "days"} left on your plan`;
  let urgent = b.daysLeft <= 3;
  let planBtn = "Add more time";
  if (b.status === "trial") {
    planText = `Free trial: ${b.daysLeft} ${b.daysLeft === 1 ? "day" : "days"} left. Add as many cars as you like. After that you keep 3 free, or choose a plan.`;
    urgent = b.daysLeft <= 5;
    planBtn = "Choose a plan";
  } else if (["free", "trial_not_started"].includes(b.status)) {
    // Never paid: no card. The message only appears when they try to go past 3.
    planText = "";
  } else if (b.status === "locked" || b.status === "offline") {
    planText = "Subscription finished. Upgrade your website so you can make changes.";
    urgent = true;
    planBtn = "Upgrade";
  }

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
        <span>{thisMonth === 0 ? "Share your link on your WhatsApp status to get your first one." : "People asked about your cars."}</span>
      </section>

      <section className="rd-kpis">
        <div className="rd-kpi"><b>{cars.length}</b><span>Cars</span></div>
        <div className="rd-kpi"><b>{newOnes}</b><span>New inquiries</span></div>
        <div className="rd-kpi"><b>{count("Available")}</b><span>Available</span></div>
        <div className="rd-kpi"><b>{count("Sold")}</b><span>Sold</span></div>
      </section>

      {b.status === "trial" ? (
        <TrialCard days={b.daysLeft} />
      ) : planText && (
        <section className={urgent ? "rd-plan urgent" : "rd-plan"}>
          <p>{planText}</p>
          <Link className="rd-btn" to="/dashboard/billing">{planBtn}</Link>
        </section>
      )}
    </div>
  );

}