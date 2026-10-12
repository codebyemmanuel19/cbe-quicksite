import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import "./Site.css";

const TYPES = ["All", "House", "Flat", "Land"];
const LISTINGS = ["All", "Sale", "Rent"];

// A vendor may save "@kemi", "kemi" or a full link. All three must work.
function socialUrl(site, value) {
  const v = String(value || "").trim();
  if (!v) return "";
  if (v.startsWith("http")) return v;

  const handle = v.replace(/^@/, "");
  if (site === "tiktok") return `https://www.tiktok.com/@${handle}`;
  if (site === "instagram") return `https://www.instagram.com/${handle}`;
  if (site === "facebook") return `https://www.facebook.com/${handle}`;
  return "";
}

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

// Small line icons for the new sections
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-5.6A8 8 0 1 1 21 12z" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="8.5" r="1" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9" />
      <path d="M16 7l3 3" />
    </svg>
  ),
  wa: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
      <path d="M16.5 14.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.2-.4.7-1.300.1-.1 0-.3 0-.4l-.7-1.600c-.2-.4-.3-.4-.5-.4h-.4a.8.8 0 0 0-.6.300 2.500 2.500 0 0 0-.8 1.900c0 1.100.8 2.200.9 2.300.1.200 1.600 2.500 3.900 3.500 1.400.6 2 .7 2.700.6.400-.1 1.400-.6 1.600-1.200.2-.5.2-1 .1-1.100l-.5-.2z" />
    </svg>
  ),
};

const WHY = [
  {
    icon: "home",
    title: "Real photos, real details",
    text: "Every property comes with its own photos, exact price and full location, so nothing is hidden.",
  },
  {
    icon: "tag",
    title: "Clear pricing",
    text: "The price is shown on every listing. Rent is quoted per year, so you know what to expect before you reach out.",
  },
  {
    icon: "chat",
    title: "Direct to the agent",
    text: "No middlemen. One tap opens WhatsApp and you are talking to the agent about that exact property.",
  },
  {
    icon: "key",
    title: "Easy inspections",
    text: "Found a place you like? Ask for an inspection and the agent will confirm a date and time with you.",
  },
];

// Real numbers counted from the agent's own listings. Nothing is made up.
function Stats({ properties }) {
  const cells = useMemo(() => {
    const open = properties.filter((p) => (p.status || "Available") === "Available");
    const places = new Set(
      open.map((p) => String(p.location || "").split(",")[0].trim().toLowerCase()).filter(Boolean)
    );
    const count = (kind) => open.filter((p) => String(p.listing).toLowerCase() === kind).length;
    const out = [
      { n: open.length, label: "Available now" },
      { n: count("sale"), label: "For sale" },
      { n: count("rent"), label: "To rent" },
      { n: places.size, label: places.size === 1 ? "Area covered" : "Areas covered" },
    ];
    return out.filter((c) => c.n > 0);
  }, [properties]);

  // "1 area covered" looks weak. Show the strip once there is enough to count.
  const openCount = properties.filter((p) => (p.status || "Available") === "Available").length;
  if (openCount < 3 || cells.length === 0) return null;

  return (
    <section className="re-stats">
      <div className="re-wrap re-stats-row">
        {cells.map((c, i) => (
          <Reveal key={c.label} delay={i * 90} className="re-stat">
            <b>{c.n}</b>
            <span>{c.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Why({ name }) {
  return (
    <section className="re-why">
      <div className="re-wrap">
        <Reveal>
          <h2>Why choose {name}</h2>
          <p className="re-why-sub">Buying or renting a home is a big step. Here is what you can expect when you deal with us.</p>
        </Reveal>

        <div className="re-why-grid">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 100} className="re-why-item">
              <span className="re-why-ico">{ICONS[w.icon]}</span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// The agent's own About text, written in Business Info
function AboutUs({ name, about }) {
  if (!about) return null;

  return (
    <section className="re-aboutus">
      <div className="re-wrap re-aboutus-in">
        <Reveal>
          <h2>About {name}</h2>
          <p>{about}</p>
        </Reveal>
      </div>
    </section>
  );
}

function ContactBand({ name, phone }) {
  if (!phone) return null;
  const text = `Hello ${name}, I visited your website and I am looking for a property. Can you help me?`;

  return (
    <section className="re-contact">
      <div className="re-wrap re-contact-in">
        <Reveal>
          <h2>Can't find what you need?</h2>
          <p>Tell the agent the area, type of property and budget you have in mind. You will get a reply on WhatsApp.</p>
        </Reveal>
        <a
          className="re-contact-btn"
          href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="re-ico">{ICONS.wa}</span>
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}

// A bare number like "12" means nothing. Add the unit so it reads "12 sqm".
function sizeText(v) {
  const t = String(v || "").trim();
  return /^\d+(\.\d+)?$/.test(t) ? `${t} sqm` : t;
}

// Keeps ?slug=... attached while you test on localhost
function withQuery(path) {
  return path + (typeof window !== "undefined" ? window.location.search : "");
}

// Fades and slides an element up the first time it scrolls into view
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rv ${shown ? "in" : ""} ${className}`}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// Swipe through every photo, with a counter and dots
function Gallery({ photos }) {
  const [active, setActive] = useState(0);

  if (!photos.length) {
    return <div className="re-gal empty" />;
  }

  function handleScroll(e) {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  }

  return (
    <div className="re-gal">
      <div className="re-gal-track" onScroll={handleScroll}>
        {photos.map((src, i) => (
          <div className="re-gal-slide" key={src + i}>
            <img src={src} alt="" loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <span className="re-gal-count">{active + 1} / {photos.length}</span>
          <div className="re-gal-dots">
            {photos.map((src, i) => (
              <i key={src + i} className={i === active ? "on" : ""} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// One property in the list
function Card({ p, base, money, waLink, onInquire }) {
  const status = p.status || "Available";
  const photos = p.photos || [];

  return (
    <article className="re-card">
      <Link className="re-card-top" to={withQuery(`${base}/property/${p.id}`)}>
        <div className="re-img">
          {photos[0] ? <img src={photos[0]} alt={p.title} loading="lazy" /> : <span className="re-noimg" />}
          {p.listing && <span className="re-tag">For {String(p.listing).toLowerCase()}</span>}
          {status !== "Available" && <span className="re-sold">{status}</span>}
          {photos.length > 1 && <span className="re-shots">{photos.length} photos</span>}
        </div>

        <div className="re-body">
          <h3>{p.title}</h3>
          <p className="re-price">
            {money(p.price)}
            {String(p.listing).toLowerCase() === "rent" ? " / year" : ""}
          </p>
          <p className="re-loc">{p.location}</p>
          <div className="re-meta">
            {p.bedrooms ? <span>{p.bedrooms} bed</span> : null}
            {p.bathrooms ? <span>{p.bathrooms} bath</span> : null}
            {p.size ? <span>{sizeText(p.size)}</span> : null}
          </div>
        </div>
      </Link>

      <div className="re-acts">
        <Link className="re-view" to={withQuery(`${base}/property/${p.id}`)}>View details</Link>
        {status === "Available" ? (
          <a
            className="re-wa"
            href={waLink(p)}
            target="_blank"
            rel="noreferrer"
            onClick={() => onInquire(p)}
          >
            WhatsApp
          </a>
        ) : (
          <span className="re-wa off">Not available</span>
        )}
      </div>
    </article>
  );
}

// The list page
function Listing({ properties, busy, base, money, waLink, onInquire }) {
  const [type, setType] = useState("All");
  const [listing, setListing] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");

  const search = q.trim().toLowerCase();

  // Match on small letters, so "House" and "house" both work
  const filtered = properties.filter((p) => {
    const okType = type === "All" || String(p.type || "").toLowerCase() === type.toLowerCase();
    const okListing =
      listing === "All" || String(p.listing || "").toLowerCase() === listing.toLowerCase();
    const text = `${p.title || ""} ${p.location || ""}`.toLowerCase();
    return okType && okListing && text.includes(search);
  });

  // "Newest" keeps the order the server sends
  const shown =
    sort === "low"
      ? [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
      : sort === "high"
      ? [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
      : filtered;

  return (
    <>
      <section className="re-search">
        <div className="re-field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by area or property name"
          />
        </div>

        {/* Buy or rent sits on its own, because it is the first thing people decide */}
        <div className="re-seg">
          {LISTINGS.map((l) => (
            <button key={l} className={listing === l ? "on" : ""} onClick={() => setListing(l)}>
              {l === "All" ? "All" : "For " + l.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="re-chips">
          {TYPES.map((t) => (
            <button key={t} className={type === t ? "on" : ""} onClick={() => setType(t)}>
              {t}
            </button>
          ))}
        </div>
      </section>

      {!busy && <Stats properties={properties} />}

      <main className="re-main">
        <div className="re-head-row">
          <h2>Properties</h2>
          {!busy && properties.length > 0 && (
            <div className="re-tools">
              <span className="re-found">{shown.length} shown</span>
              <label className="re-sort">
                <span>Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        {busy ? (
          <p className="re-empty">Loading properties...</p>
        ) : shown.length === 0 ? (
          <p className="re-empty">
            {properties.length === 0
              ? "No properties are listed yet. Please check back soon."
              : "No property matches your search. Try a different area or clear the filters."}
          </p>
        ) : (
          <div className="re-grid">
            {shown.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 90}>
                <Card
                  p={p}
                  base={base}
                  money={money}
                  waLink={waLink}
                  onInquire={onInquire}
                />
              </Reveal>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// One property, with every photo
function Detail({ properties, busy, base, money, waLink, onInquire }) {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (busy) {
    return <main className="re-main"><p className="re-empty">Loading...</p></main>;
  }

  const p = properties.find((x) => String(x.id) === String(id));

  if (!p) {
    return (
      <main className="re-main">
        <p className="re-empty">That property is no longer listed.</p>
        <Link className="re-back" to={withQuery(base || "/")}>Back to all properties</Link>
      </main>
    );
  }

  const status = p.status || "Available";
  const photos = p.photos || [];
  const hasFacts = p.bedrooms || p.bathrooms || p.size;

  return (
    <div className="re-page" key={id}>
      <Gallery photos={photos} />

      <main className="re-main re-detail">
        <Link className="re-back" to={withQuery(base || "/")}>← All properties</Link>

        <div className="re-pills">
          {p.listing && <span className="re-pill dark">For {String(p.listing).toLowerCase()}</span>}
          {p.type && <span className="re-pill">{p.type}</span>}
          {status !== "Available" && <span className="re-pill red">{status}</span>}
        </div>

        <h1>{p.title}</h1>
        <p className="re-price big">
          {money(p.price)}
          {String(p.listing).toLowerCase() === "rent" ? " / year" : ""}
        </p>
        <p className="re-loc">{p.location}</p>

        {/* One tight line, so two facts never leave half the screen empty */}
        {hasFacts && (
          <div className="re-facts">
            {p.bedrooms ? (
              <span><b>{p.bedrooms}</b> {p.bedrooms === 1 ? "bed" : "beds"}</span>
            ) : null}
            {p.bathrooms ? (
              <span><b>{p.bathrooms}</b> {p.bathrooms === 1 ? "bath" : "baths"}</span>
            ) : null}
            {p.size ? <span><b>{sizeText(p.size)}</b></span> : null}
          </div>
        )}

        {p.description && (
          <Reveal>
            <section className="re-about">
              <h2>About this property</h2>
              <p>{p.description}</p>
            </section>
          </Reveal>
        )}

        {p.features?.length > 0 && (
          <Reveal delay={80}>
            <section className="re-about">
              <h2>Features</h2>
              <div className="re-feats">
                {p.features.map((f) => <span key={f}>{f}</span>)}
              </div>
            </section>
          </Reveal>
        )}
      </main>

      {/* Always within thumb reach while they scroll */}
      <div className="re-bar">
        {status === "Available" ? (
          <a
            className="re-wa"
            href={waLink(p)}
            target="_blank"
            rel="noreferrer"
            onClick={() => onInquire(p)}
          >
            Enquire on WhatsApp
          </a>
        ) : (
          <span className="re-wa off">No longer available</span>
        )}
      </div>
    </div>
  );
}

// The public website for a real estate agent. It loads its own data, like your other sites.
export default function RealEstateSite({ basePath = "", slug: slugProp }) {
  const { slug, store, loading, notFound } = useShop(slugProp);
  const [properties, setProperties] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    api.get(`/public/shop/${slug}/properties`)
      .then((res) => {
        // Never let a bad answer turn this into undefined
        if (!cancelled) setProperties(Array.isArray(res?.properties) ? res.properties : []);
      })
      .catch(() => {
        // The page still opens, it just shows no properties
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div className="re-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="re-loading">
        <h1>Website not found</h1>
        <p>This website address doesn't belong to any agent.</p>
      </div>
    );
  }

  const phone = (store.whatsapp || "").replace(/\D/g, "");
  const hero = store.hero || {};
  const money = (n) => formatPrice(n, store.symbol);

  // Only the ones the agent actually filled in
  const socials = [
    { name: "Instagram", url: socialUrl("instagram", store.instagram) },
    { name: "TikTok", url: socialUrl("tiktok", store.tiktok) },
    { name: "Facebook", url: socialUrl("facebook", store.facebook) },
  ].filter((s) => s.url);

  function waLink(p) {
    const text = `Hello ${store.name}, I saw "${p.title}" (${money(p.price)}) in ${p.location} on your website. Is it still available, and can I arrange an inspection?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // Save the inquiry so the agent sees it in the dashboard, then WhatsApp opens
  function onInquire(p) {
    api.post(`/public/shop/${slug}/inquiries`, {
      propertyId: p.id,
      propertyTitle: p.title,
    }).catch(() => {
      // Never stop the visitor from reaching WhatsApp
    });
  }

  const shared = { properties, busy, base: basePath, money, waLink, onInquire };

  return (
    <div className="re">
      <header className="re-head">
        <Link className="re-logo" to={withQuery(basePath || "/")}>
          {store.logo ? <img src={store.logo} alt="" /> : <i>{(store.name || "R")[0]}</i>}
          <span>{store.name}</span>
        </Link>
        <a className="re-cta" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
          Contact
        </a>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Label and headline only. The About text has its own section below. */}
              <section
                className="re-hero"
                style={
                  hero.image
                    ? { backgroundImage: `linear-gradient(rgba(8,30,38,.55),rgba(8,30,38,.85)),url(${hero.image})` }
                    : {}
                }
              >
                <div className="re-hero-in">
                  {hero.label && <span className="re-badge">{hero.label}</span>}
                  <h1>{hero.headline || "Find your next home"}</h1>
                </div>
              </section>

              <Listing {...shared} />

              <Why name={store.name} />
              <AboutUs name={store.name} about={store.about} />
              <ContactBand name={store.name} phone={phone} />

              {phone && (
                <a
                  className="re-float"
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat on WhatsApp"
                >
                  {ICONS.wa}
                </a>
              )}
            </>
          }
        />
        <Route path="property/:id" element={<Detail {...shared} />} />
      </Routes>

      {/* Contact and socials, stacked down the left */}
      <footer className="re-foot">
        <div className="re-foot-in">
          <b className="re-foot-name">{store.name}</b>

          <div className="re-foot-contact">
            {store.address && <span>{store.address}</span>}
            {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
            {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
            {phone && (
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="re-foot-social">
              {socials.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
              ))}
            </div>
          )}
        </div>

        <div className="re-foot-bottom">
          <small>© {new Date().getFullYear()} {store.name}</small>
          <small>Powered by CBE QuickSite</small>
        </div>
      </footer>
    </div>
  );
}