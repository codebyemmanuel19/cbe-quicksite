import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import DashboardSkeleton from "../../components/Skeleton";
import PlanCard from "../../components/PlanCard";
import ReadyChecklist from "../../components/ReadyChecklist";
import "../../RealEstateSite/dashboard/dashboard.css";

export default function RestaurantHome() {
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const mine = await api.get("/sites/me");
        const [m, i] = await Promise.all([api.get("/dishes"), api.get("/dishes/orders/all")]);
        if (cancelled) return;
        setSite(mine.site);
        setDishes(m.dishes);
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
  const shareLink = `https://wa.me/?text=${encodeURIComponent(`Order from us here: ${url}`)}`;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = inquiries.filter((i) => new Date(i.createdAt) >= monthStart).length;
  const newOnes = inquiries.filter((i) => i.status === "new").length;
  const out = dishes.filter((x) => x.status === "Sold out").length;

  const b = site.billing;
  let planText = `${b.daysLeft} ${b.daysLeft === 1 ? "day" : "days"} left on your plan`;
  let urgent = b.daysLeft <= 3;
  let planBtn = "Add more time";
  if (b.status === "trial") {
    planText = `Free trial: ${b.daysLeft} ${b.daysLeft === 1 ? "day" : "days"} left. Add as many dishes as you like. After that you keep 3 free, or choose a plan.`;
    urgent = b.daysLeft <= 5;
    planBtn = "Choose a plan";
  } else if (["free", "trial_not_started"].includes(b.status)) {
    planText = b.status === "free"
      ? "You are on the free plan: up to 3 dishes. Choose a plan to add more."
      : "Your free trial starts when you add your first dish.";
    urgent = false;
    planBtn = b.status === "free" ? "Choose a plan" : "Add dish";
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
        <b>{thisMonth === 0 ? "No orders yet" : `You got ${thisMonth} ${thisMonth === 1 ? "order" : "orders"}`}</b>
        <span>{thisMonth === 0 ? "Put your link on your WhatsApp status to get your first one." : "Customers sent their orders to your WhatsApp."}</span>
      </section>

      <section className="rd-kpis">
        <div className="rd-kpi"><b>{dishes.length}</b><span>Dishes</span></div>
        <div className="rd-kpi"><b>{newOnes}</b><span>New orders</span></div>
        <div className="rd-kpi"><b>{dishes.length - out}</b><span>On the menu</span></div>
        <div className="rd-kpi"><b>{out}</b><span>Sold out</span></div>
      </section>

      {["trial", "active"].includes(b.status) ? (
        <PlanCard status={b.status} days={b.daysLeft} />
      ) : planText && (
        <section className={urgent ? "rd-plan urgent" : "rd-plan"}>
          <p>{planText}</p>
          <Link className="rd-btn" to={b.status === "trial_not_started" ? "/dashboard/dishes/new" : "/dashboard/billing"}>{planBtn}</Link>
        </section>
      )}

      <ReadyChecklist
        slug={site.slug}
        shareLink={shareLink}
        items={[
          { label: "Add your WhatsApp number", done: !!site.business.whatsapp, to: "/dashboard/business" },
          { label: "Upload your logo", done: !!site.business.logo, to: "/dashboard/business" },
          { label: "Add your first dish", done: dishes.length > 0, to: "/dashboard/dishes/new" },
        ]}
      />
    </div>
  );
}