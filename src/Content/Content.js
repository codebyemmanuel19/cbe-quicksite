import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { ListSkeleton } from "../components/Skeleton";
import { kitFor } from "./contentKit";
import { SCRIPTS } from "./scripts";
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
const TABS = [
  { id: "today", label: "Today" },
  { id: "ideas", label: "Ideas" },
  { id: "captions", label: "Captions" },
];

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

// The Monday of this week, as text. Used to reset the ticks every week.
function weekKey() {
  const d = new Date();
  const back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Splits "Price: [₦price]" into text parts and [bracket] parts.
function splitParts(text) {
  const out = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    out.push({ f: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out;
}

function fieldLabel(name) {
  const clean = name.replace(/^₦/, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function readWeek(slug) {
  try {
    const raw = JSON.parse(localStorage.getItem(`cbe_ct_week_${slug}`) || "{}");
    return raw.week === weekKey() && Array.isArray(raw.done) ? raw.done : [];
  } catch (e) {
    return [];
  }
}

function FillSheet({ item, onClose }) {
  const parts = splitParts(item.text);
  const names = [];
  parts.forEach((p) => {
    if (p.f && !names.includes(p.f)) names.push(p.f);
  });
  const [values, setValues] = useState({});
  const [copied, setCopied] = useState(false);

  const final = parts.map((p) => (p.f ? values[p.f] || `[${p.f}]` : p.t)).join("");

  async function doCopy() {
    const ok = await copyText(final);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1800);
    return ok;
  }

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(final)}`, "_blank", "noopener");
  }

  async function tiktok() {
    await doCopy();
    window.open("https://www.tiktok.com/", "_blank", "noopener");
  }

  return createPortal(
    <div className="ct-dim" onClick={onClose}>
      <div className="ct-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ct-sheet-head">
          <h3>{item.title}</h3>
          <button type="button" className="ct-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        {names.length > 0 && (
          <div className="ct-fields">
            {names.map((n) => (
              <label key={n}>
                <span>{fieldLabel(n)}</span>
                <input
                  value={values[n] || ""}
                  placeholder={n}
                  onChange={(e) => setValues({ ...values, [n]: e.target.value })}
                />
              </label>
            ))}
          </div>
        )}

        <div className="ct-preview">
          {parts.map((p, i) =>
            p.f ? (
              <mark key={i} className={values[p.f] ? "ct-filled" : ""}>{values[p.f] || `[${p.f}]`}</mark>
            ) : (
              <span key={i}>{p.t}</span>
            )
          )}
        </div>

        <div className="ct-share">
          <button type="button" onClick={doCopy}>{copied ? "Copied ✓" : "Copy"}</button>
          <button type="button" className="ct-wa" onClick={whatsapp}>WhatsApp</button>
          <button type="button" onClick={tiktok}>Copy + TikTok</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Content() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("today");
  const [offset, setOffset] = useState(0);
  const [sheet, setSheet] = useState(null);
  const [done, setDone] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/sites/me")
      .then((res) => {
        if (cancelled) return;
        setType(res.site.businessType || "");
        setSlug(res.site.slug || "");
        setDone(readWeek(res.site.slug || ""));
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

  const ideas = SCRIPTS[type] || kit.ideas;
  const today = ideas[(dayOfYear() + offset) % ideas.length];

  // Turns an idea into the full text the vendor copies.
  const ideaText = (idea) => {
    if (!idea.scenes) return `${idea.hook}\n\n${idea.say}`;
    const scenes = idea.scenes
      .map(([time, show, say]) => `${time}\nShow: ${show}\nSay: "${say}"`)
      .join("\n\n");
    return `${idea.title} (${idea.length})\n\n${scenes}\n\nCaption:\n${fill(idea.caption)}\n\n${idea.tags}\n\nTip: ${idea.tip}`;
  };

  // Small line under an idea, like "35 sec · 4 scenes".
  const meta = (idea) => (idea.scenes ? `${idea.length} · ${idea.scenes.length} scenes` : "");

  function toggleDay(i) {
    const next = done.includes(i) ? done.filter((d) => d !== i) : [...done, i];
    setDone(next);
    try {
      localStorage.setItem(`cbe_ct_week_${slug}`, JSON.stringify({ week: weekKey(), done: next }));
    } catch (e) {
      // ignore: ticks just won't be remembered
    }
  }

  function openIdea(idea) {
    setSheet({ title: idea.title, text: ideaText(idea) });
  }

  return (
    <div className="rd ct">
      <h1>Content Ideas</h1>
      <p className="ct-sub">Ready-made posts for your {kit.label.toLowerCase()} business.</p>

      <div className="ct-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "on" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <>
          <section className="ct-today">
            <small>Post this today</small>
            <h2>{today.title}</h2>
            <p className="ct-hook">“{today.hook}”</p>
            {today.scenes ? <p className="ct-say">{meta(today)}. Full script, caption and hashtags included.</p> : <p className="ct-say">{today.say}</p>}
            <div className="ct-today-actions">
              <button type="button" className="main" onClick={() => openIdea(today)}>Use this</button>
              <button type="button" onClick={() => setOffset(offset + 1)}>Next idea ↻</button>
              {manage.flyer && <Link to={manage.to}>Make a flyer</Link>}
            </div>
          </section>

          <section className="ct-card">
            <h2>This week</h2>
            <p className="ct-prog">{done.length} of 6 posts done</p>
            {DAYS.map((d, i) => {
              const idea = ideas[i % ideas.length];
              const on = done.includes(i);
              return (
                <div key={d} className="ct-day">
                  <b>{d}</b>
                  <button type="button" className="ct-day-title" onClick={() => openIdea(idea)}>{idea.title}</button>
                  <button
                    type="button"
                    className={`ct-ck ${on ? "on" : ""}`}
                    onClick={() => toggleDay(i)}
                    aria-label={on ? `Untick ${d}` : `Tick ${d} as posted`}
                  >
                    {on ? "✓" : ""}
                  </button>
                </div>
              );
            })}
            <div className="ct-day">
              <b>Sun</b>
              <span className="ct-rest">Rest, or reply to your customers' messages</span>
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
        </>
      )}

      {tab === "ideas" && (
        <section className="ct-card">
          <p className="ct-help">Each idea is a full script: what to show, what to say, the caption and hashtags. Tap "Use this", fill in your details, and film.</p>
          {ideas.map((idea, i) => (
            <div key={idea.title} className="ct-idea">
              <div className="ct-idea-head">
                <b>{i + 1}. {idea.title}</b>
                <span className="ct-post">{idea.post}</span>
              </div>
              <p className="ct-hook">“{idea.hook}”</p>
              {idea.scenes && <p className="ct-meta">{meta(idea)}</p>}
              <button type="button" className="ct-copy" onClick={() => openIdea(idea)}>Use this</button>
            </div>
          ))}
        </section>
      )}

      {tab === "captions" && (
        <section className="ct-card">
          <p className="ct-help">Pick a caption. Your shop link is added for you.</p>
          {kit.captions.map((c) => (
            <div key={c.tag} className="ct-cap">
              <p className="ct-cap-text">{fill(c.text)}</p>
              <div className="ct-cap-row">
                <span className="ct-tag">{c.tag}</span>
                <button type="button" className="ct-copy" onClick={() => setSheet({ title: c.tag, text: fill(c.text) })}>
                  Use this
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {sheet && <FillSheet key={sheet.title + sheet.text} item={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}