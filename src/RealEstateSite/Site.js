import { useEffect, useState } from "react";
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

// Keeps ?slug=... attached while you test on localhost
function withQuery(path) {
  return path + (typeof window !== "undefined" ? window.location.search : "");
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
          // The blurred copy behind means a tall photo and a wide photo
          // both show in full, with nothing cut off
          <div className="re-gal-slide" key={src + i} style={{ backgroundImage: `url(${src})` }}>
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
          {photos[0] ? <img src={photos[0]} alt="" loading="lazy" /> : <span className="re-noimg" />}
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

  const search = q.trim().toLowerCase();

  // Match on small letters, so "House" and "house" both work
  const shown = properties.filter((p) => {
    const okType = type === "All" || String(p.type || "").toLowerCase() === type.toLowerCase();
    const okListing =
      listing === "All" || String(p.listing || "").toLowerCase() === listing.toLowerCase();
    const text = `${p.title || ""} ${p.location || ""}`.toLowerCase();
    return okType && okListing && text.includes(search);
  });

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

      <main className="re-main">
        <div className="re-head-row">
          <h2>Properties</h2>
          {!busy && properties.length > 0 && (
            <span className="re-found">{shown.length} shown</span>
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

        <div className="re-facts">
          {p.bedrooms ? (
            <div><b>{p.bedrooms}</b><span>Bedrooms</span></div>
          ) : null}
          {p.bathrooms ? (
            <div><b>{p.bathrooms}</b><span>Bathrooms</span></div>
          ) : null}
          {p.size ? (
            <div><b>{p.size}</b><span>Size</span></div>
          ) : null}
        </div>

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
              {/* Label and headline only. The About text lives in the footer. */}
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
            </>
          }
        />
        <Route path="property/:id" element={<Detail {...shared} />} />
      </Routes>

      {/* About, contact and socials all in one block */}
      <footer className="re-foot">
        <div className="re-foot-in">
          <div className="re-foot-brand">
            <b>{store.name}</b>
            {store.about && <p>{store.about}</p>}
          </div>

          <div className="re-foot-col">
            <h3>Contact</h3>
            {store.address && <span>{store.address}</span>}
            {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
            {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
            {phone && (
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">WhatsApp</a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="re-foot-col">
              <h3>Follow</h3>
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