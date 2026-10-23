import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { ListSkeleton } from "../components/Skeleton";
import { kitFor } from "./contentKit";
import "../RealEstateSite/dashboard/dashboard.css";
import "./Content.css";

// Where each business adds its items. Only some of them have the flyer maker.
const MANAGE = {
  realestate: { to: "/dashboard/properties", flyer: false },
  cars: { to: "/dashboard/cars", flyer: false },
  restaurant: { to: "/dashboard/menu", flyer: true },
  furniture: { to: "/dashboard/furniture", flyer: true },
};
const DEFAULT_MANAGE = { to: "/dashboard/products", flyer: true };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Copies text. Falls back to an old method on browsers that block the clipboard.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    try {
      const box = document.createElement("textarea");
      box.value = text;
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(box);
      return ok;
    } catch (e) {
      return false;
    }
  }
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

export default function Content() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/sites/me")
      .then((res) => {
        if (cancelled) return;
        setType(res.site.businessType || "");
        setSlug(res.site.slug || "");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 404) return navigate("/setup");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (loading) return <div className="rd"><ListSkeleton rows={4} /></div>;

  const kit = kitFor(type);
  const manage = MANAGE[type] || DEFAULT_MANAGE;
  const link = slug ? `https://${slug}.cbequicksite.com` : "[your shop link]";
  const fill = (text) => text.split("{link}").join(link);

  const today = kit.ideas[dayOfYear() % kit.ideas.length];

  async function copy(id, text) {
    const ok = await copyText(text);
    setCopied(ok ? id : "");
    if (ok) setTimeout(() => setCopied((c) => (c === id ? "" : c)), 1800);
  }

  const ideaText = (idea) => `${idea.hook}\n\n${idea.say}`;

  return (
    <div className="rd ct">
      <h1>Content Ideas</h1>
      <p className="ct-sub">
        Ready-made ideas for your {kit.label.toLowerCase()} business. Pick one, change the words in [brackets], and post.
      </p>

      <section className="ct-today">
        <small>Post this today</small>
        <h2>{today.title}</h2>
        <p className="ct-hook">“{today.hook}”</p>
        <p className="ct-say">{today.say}</p>
        <div className="ct-today-actions">
          <button type="button" onClick={() => copy("today", ideaText(today))}>
            {copied === "today" ? "Copied ✓" : "Copy this idea"}
          </button>
          {manage.flyer && <Link to={manage.to}>Make a flyer</Link>}
        </div>
      </section>

      <section className="ct-card">
        <h2>Ideas to talk about</h2>
        <p className="ct-help">Record any of these on your phone. 20 to 30 seconds is enough. Say the first line first, to make people stop scrolling.</p>
        {kit.ideas.map((idea, i) => (
          <div key={idea.title} className="ct-idea">
            <div className="ct-idea-head">
              <b>{i + 1}. {idea.title}</b>
              <span className="ct-post">{idea.post}</span>
            </div>
            <p className="ct-hook">“{idea.hook}”</p>
            <p className="ct-say">{idea.say}</p>
            <button type="button" className="ct-copy" onClick={() => copy(`i${i}`, ideaText(idea))}>
              {copied === `i${i}` ? "Copied ✓" : "Copy"}
            </button>
          </div>
        ))}
      </section>

      <section className="ct-card">
        <h2>Ready captions</h2>
        <p className="ct-help">Copy, change the words in [brackets], and post. Your shop link is added for you.</p>
        {kit.captions.map((c, i) => (
          <div key={c.tag} className="ct-cap">
            <p>{fill(c.text)}</p>
            <div className="ct-cap-row">
              <span className="ct-tag">{c.tag}</span>
              <button type="button" className="ct-copy" onClick={() => copy(`c${i}`, fill(c.text))}>
                {copied === `c${i}` ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="ct-card">
        <h2>This week's plan</h2>
        <p className="ct-help">One simple post a day keeps your business active and in people's minds.</p>
        {DAYS.map((d, i) => (
          <div key={d} className="ct-day">
            <b>{d}</b>
            <span>{kit.ideas[i % kit.ideas.length].title}</span>
          </div>
        ))}
        <div className="ct-day">
          <b>Sun</b>
          <span>Rest, or reply to your customers' messages</span>
        </div>
      </section>

      {kit.note && <p className="ct-note">{kit.note}</p>}

      <section className="ct-card">
        <h2>Tips that make a big difference</h2>
        <ul className="ct-tips">
          <li>Record in daylight, near a window.</li>
          <li>Keep each video under 30 seconds.</li>
          <li>Post at the same time every day.</li>
          <li>Always end with: "Order on the link in my bio."</li>
        </ul>
        <Link className="ct-ads" to="/dashboard/ads">Want more people to see your posts? Run ads</Link>
      </section>
    </div>
  );
}