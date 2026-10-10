import { useEffect, useMemo, useState } from "react";
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
    title: "Real listings",
    text: "Every property is posted with its own photos, price and location, so you know what you are looking at.",
  },
  {
    icon: "tag",
    title: "Clear prices",
    text: "The price is on every listing. No guessing, no surprises when you reach out.",
  },
  {
    icon: "chat",
    title: "Talk to the agent",
    text: "Tap one button and you are chatting with the agent on WhatsApp, with the property already named.",
  },
  {
    icon: "key",
    title: "Easy viewing",
    text: "Found one you like? Ask for a viewing and the agent will arrange a time with you.",
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

  if (cells.length === 0) return null;

  return (
    <section className="re-stats">
      <div className="re-wrap re-stats-row">
        {cells.map((c) => (
          <div key={c.label} className="re-stat">
            <b>{c.n}</b>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Why({ name }) {
  return (
    <section className="re-why">
      <div className="re-wrap">
        <h2>Why choose {name}</h2>
        <p className="re-why-sub">Finding a property should feel simple and safe. Here is how we make it that way.</p>

        <div className="re-why-grid">
          {WHY.map((w) => (
            <div key={w.title} className="re-why-item">
              <span className="re-why-ico">{ICONS[w.icon]}</span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
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
        <h2>About {name}</h2>
        <p>{about}</p>
      </div>
    </section>
  );
}

function ContactBand({ name, phone }) {
  if (!phone) return null;
  const text = `Hello ${name}, I am looking for a property.`;

  return (
    <section className="re-contact">
      <div className="re-wrap re-contact-in">
        <div>
          <h2>Looking for something specific?</h2>
          <p>Tell the agent what you need and your budget. You will get a reply on WhatsApp.</p>
        </div>
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

// Keeps ?slug=... attached while you test on localhost
function withQuery(path) {
  return path + (typeof window !== "undefined" ? window.location.search : "");
}

// Shows the whole photo whatever its shape. A blurred copy fills the leftover space.
function Photo({ src, alt = "", eager = false }) {
  return (
    <>
      <img className="re-img-bg" src={src} alt="" aria-hidden="true" loading="lazy" />
      <img
        className="re-img-main"
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
      />
    </>
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
            <Photo src={src} eager={i === 0} />
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
          {photos[0] ? <Photo src={photos[0]} alt={p.title} /> : <span className="re-noimg" />}
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
            {p.size ? <span>{p.size}</span> : null}
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
            placeholder="Search by location or title"
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
              ? "No properties to show yet. Check back soon."
              : "Nothing matches that. Try another search."}
          </p>
        ) : (
          <div className="re-grid">
            {shown.map((p) => (
              <Card
                key={p.id}
                p={p}
                base={base}
                money={money}
                waLink={waLink}
                onInquire={onInquire}
              />
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
    <>
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
            {p.size ? <span><b>{p.size}</b></span> : null}
          </div>
        )}

        {p.description && (
          <section className="re-about">
            <h2>About this property</h2>
            <p>{p.description}</p>
          </section>
        )}

        {p.features?.length > 0 && (
          <section className="re-about">
            <h2>What it has</h2>
            <div className="re-feats">
              {p.features.map((f) => <span key={f}>{f}</span>)}
            </div>
          </section>
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
            Ask the agent on WhatsApp
          </a>
        ) : (
          <span className="re-wa off">No longer available</span>
        )}
      </div>
    </>
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
    const text = `Hello ${store.name}, I am interested in "${p.title}" (${money(p.price)}) in ${p.location}. Is it still available?`;
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
                  <h1>{hero.headline || "Find a home you will love"}</h1>
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
          <small>©️ {new Date().getFullYear()} {store.name}</small>
          <small>Powered by CBE QuickSite</small>
        </div>
      </footer>
    </div>
  );
}