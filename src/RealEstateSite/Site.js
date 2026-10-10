import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import "./Site.css";

const TYPES = ["All", "House", "Flat", "Land"];

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

// Small line icons for the "Why choose us" section
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
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  wa: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.200a8.200 8.200 0 0 1-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200z" />
      <path d="M16.500 14.300c-.2-.1-1.400-.7-1.600-.8-.2-.1-.4-.1-.5.100l-.7.900c-.1.100-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.1 0-.3 0-.4l-.7-1.600c-.2-.4-.3-.4-.5-.4h-.4a.8.8 0 0 0-.6.300 2.500 2.500 0 0 0-.8 1.900c0 1.100.8 2.200.9 2.300.1.200 1.600 2.500 3.900 3.500 1.400.6 2 .7 2.700.6.400-.1 1.400-.6 1.600-1.200.2-.5.2-1 .1-1.100l-.5-.2z" />
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

// Accepts "@name", "name" or a full link
function socialHref(kind, value) {
  if (!value) return "";
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "").replace(/^\/+/, "");
  if (kind === "instagram") return `https://instagram.com/${handle}`;
  if (kind === "facebook") return `https://facebook.com/${handle}`;
  if (kind === "tiktok") return `https://tiktok.com/@${handle}`;
  return "";
}

function Skeleton() {
  return (
    <div className="re">
      <div className="re-head">
        <span className="re-sk re-sk-logo" />
      </div>
      <div className="re-hero re-hero-sk" />
      <div className="re-wrap">
        <div className="re-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="re-card">
              <div className="re-sk re-sk-img" />
              <div className="re-body">
                <span className="re-sk re-sk-line" />
                <span className="re-sk re-sk-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// The public website for a real estate agent. It loads its own data, like your other sites.
export default function RealEstateSite({ slug: slugProp }) {
  const { slug, store, loading, notFound } = useShop(slugProp);
  const [properties, setProperties] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [type, setType] = useState("All");
  const [listing, setListing] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [open, setOpen] = useState(null); // the property whose sheet is open

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    api.get(`/public/shop/${slug}/properties`)
      .then((res) => {
        if (!cancelled) setProperties(res.properties || []);
      })
      .catch(() => {
        // The page still opens, it just shows no properties
      })
      .finally(() => {
        if (!cancelled) setFetched(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close the sheet with Escape, and stop the page behind it from scrolling
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = before;
    };
  }, [open]);

  // Real numbers from the agent's own listings. Nothing is made up.
  const stats = useMemo(() => {
    const available = properties.filter((p) => p.status === "Available");
    const places = new Set(
      available.map((p) => String(p.location || "").split(",")[0].trim().toLowerCase()).filter(Boolean)
    );
    return {
      available: available.length,
      sale: available.filter((p) => p.listing === "Sale").length,
      rent: available.filter((p) => p.listing === "Rent").length,
      places: places.size,
    };
  }, [properties]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = properties.filter(
      (p) =>
        (type === "All" || p.type === type) &&
        (listing === "All" || p.listing === listing) &&
        `${p.title} ${p.location}`.toLowerCase().includes(term)
    );
    if (sort === "low") return [...list].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "high") return [...list].sort((a, b) => Number(b.price) - Number(a.price));
    return list;
  }, [properties, type, listing, q, sort]);

  if (loading) return <Skeleton />;

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
  const socials = [
    ["Instagram", socialHref("instagram", store.instagram)],
    ["Facebook", socialHref("facebook", store.facebook)],
    ["TikTok", socialHref("tiktok", store.tiktok)],
  ].filter(([, href]) => href);

  const priceOf = (p) => formatPrice(p.price, store.symbol) + (p.listing === "Rent" ? " / year" : "");

  function waLink(p) {
    const text = `Hello ${store.name}, I am interested in "${p.title}" (${formatPrice(p.price, store.symbol)}) in ${p.location}. Is it still available?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // Save the inquiry so the agent sees it in the dashboard, then WhatsApp opens
  function saveInquiry(p) {
    api.post(`/public/shop/${slug}/inquiries`, {
      propertyId: p.id,
      propertyTitle: p.title,
    }).catch(() => {
      // Never stop the visitor from reaching WhatsApp
    });
  }

  const statCells = [
    { n: stats.available, label: "Available now" },
    { n: stats.sale, label: "For sale" },
    { n: stats.rent, label: "To rent" },
    { n: stats.places, label: stats.places === 1 ? "Area covered" : "Areas covered" },
  ].filter((s) => s.n > 0);

  return (
    <div className="re">
      {/* Header */}
      <header className="re-head">
        <a className="re-logo" href="#top">
          {store.logo ? <img src={store.logo} alt="" /> : <i>{(store.name || "R")[0]}</i>}
          <span>{store.name}</span>
        </a>
        <nav className="re-nav">
          <a href="#listings">Properties</a>
          <a href="#why">Why us</a>
          <a href="#contact">Contact</a>
        </nav>
        {phone && (
          <a className="re-cta" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        )}
      </header>

      {/* Hero */}
      <section
        id="top"
        className="re-hero"
        style={
          hero.image
            ? { backgroundImage: `linear-gradient(180deg,rgba(7,28,35,.55),rgba(7,28,35,.88)),url(${hero.image})` }
            : {}
        }
      >
        <div className="re-wrap">
          {hero.label && <span className="re-badge">{hero.label}</span>}
          <h1>{hero.headline || "Find a home you will love"}</h1>
          <p>{store.about || "Houses, flats and land. Chat with the agent on WhatsApp."}</p>
          <a className="re-hero-btn" href="#listings">View properties</a>
        </div>
      </section>

      {/* Search panel, sitting over the bottom of the hero */}
      <section className="re-search">
        <div className="re-search-box">
          <div className="re-seg" role="tablist" aria-label="Buy or rent">
            {[
              ["All", "All"],
              ["Sale", "Buy"],
              ["Rent", "Rent"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={listing === value ? "on" : ""}
                onClick={() => setListing(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="re-field">
            <span>Location or title</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. Lekki, 3 bedroom"
            />
          </label>

          <div className="re-chips">
            {TYPES.map((t) => (
              <button key={t} type="button" className={type === t ? "on" : ""} onClick={() => setType(t)}>
                {t === "All" ? "All types" : t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats: counted from the agent's real listings */}
      {statCells.length > 0 && (
        <section className="re-stats">
          <div className="re-wrap re-stats-row">
            {statCells.map((s) => (
              <div key={s.label} className="re-stat">
                <b>{s.n}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Listings */}
      <main id="listings" className="re-main re-wrap">
        <div className="re-main-head">
          <div>
            <h2>Properties</h2>
            <p className="re-count">
              {fetched ? `${shown.length} ${shown.length === 1 ? "property" : "properties"}` : "Loading..."}
            </p>
          </div>
          <label className="re-sort">
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {!fetched ? (
          <div className="re-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="re-card">
                <div className="re-sk re-sk-img" />
                <div className="re-body">
                  <span className="re-sk re-sk-line" />
                  <span className="re-sk re-sk-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="re-empty">
            <b>{properties.length === 0 ? "No properties yet" : "Nothing matches your search"}</b>
            <p>
              {properties.length === 0
                ? "New listings are added often. Check back soon."
                : "Try another location, or choose All types."}
            </p>
            {properties.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setType("All");
                  setListing("All");
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="re-grid">
            {shown.map((p) => (
              <article
                key={p.id}
                className={p.status === "Available" ? "re-card" : "re-card gone"}
              >
                <button type="button" className="re-img" onClick={() => setOpen(p)} aria-label={`View ${p.title}`}>
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt={p.title} loading="lazy" />
                  ) : (
                    <span className="re-noimg">{ICONS.home}</span>
                  )}
                  <span className="re-tag">For {String(p.listing).toLowerCase()}</span>
                  {p.status !== "Available" && <span className="re-sold">{p.status}</span>}
                  {p.photos?.length > 1 && <span className="re-count-badge">{p.photos.length} photos</span>}
                </button>

                <div className="re-body">
                  <p className="re-price">{priceOf(p)}</p>
                  <h3>{p.title}</h3>
                  <p className="re-loc">
                    <span className="re-ico">{ICONS.pin}</span>
                    {p.location}
                  </p>

                  <div className="re-meta">
                    <span>{p.type}</span>
                    {p.bedrooms ? <span>{p.bedrooms} bed</span> : null}
                    {p.bathrooms ? <span>{p.bathrooms} bath</span> : null}
                    {p.size ? <span>{p.size}</span> : null}
                  </div>

                  <div className="re-actions">
                    <button type="button" className="re-more" onClick={() => setOpen(p)}>
                      Details
                    </button>
                    {p.status === "Available" ? (
                      <a
                        className="re-wa"
                        href={waLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => saveInquiry(p)}
                      >
                        <span className="re-ico">{ICONS.wa}</span>
                        WhatsApp
                      </a>
                    ) : (
                      <span className="re-wa off">Not available</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Why choose us */}
      <section id="why" className="re-why">
        <div className="re-wrap">
          <h2>Why choose {store.name}</h2>
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

      {/* Contact band */}
      <section id="contact" className="re-contact">
        <div className="re-wrap re-contact-in">
          <div>
            <h2>Looking for something specific?</h2>
            <p>Tell the agent what you need and your budget. You will get a reply on WhatsApp.</p>
          </div>
          {phone && (
            <a
              className="re-contact-btn"
              href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hello ${store.name}, I am looking for a property.`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="re-ico">{ICONS.wa}</span>
              Chat on WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="re-foot">
        <div className="re-wrap re-foot-in">
          <div className="re-foot-brand">
            <b>{store.name}</b>
            {store.address && <span>{store.address}</span>}
            {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
            {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
          </div>

          {socials.length > 0 && (
            <div className="re-foot-links">
              {socials.map(([name, href]) => (
                <a key={name} href={href} target="_blank" rel="noreferrer">{name}</a>
              ))}
            </div>
          )}
        </div>
        <small>Powered by CBE QuickSite</small>
      </footer>

      {/* Floating WhatsApp */}
      {phone && !open && (
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

      {/* Property sheet */}
      {open && (
        <div className="re-sheet-bg" onClick={() => setOpen(null)}>
          <div className="re-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="re-x" onClick={() => setOpen(null)} aria-label="Close">
              ✕
            </button>

            <div className="re-sheet-scroll">
              {open.photos?.length > 0 ? (
                <div className="re-gal">
                  {open.photos.map((src, i) => (
                    <img key={src + i} src={src} alt={`${open.title} ${i + 1}`} loading="lazy" />
                  ))}
                </div>
              ) : (
                <div className="re-gal-empty">{ICONS.home}</div>
              )}
              {open.photos?.length > 1 && <p className="re-gal-hint">Swipe to see all {open.photos.length} photos</p>}

              <div className="re-sheet-body">
                <span className="re-tag inline">For {String(open.listing).toLowerCase()}</span>
                <p className="re-price big">{priceOf(open)}</p>
                <h2>{open.title}</h2>
                <p className="re-loc">
                  <span className="re-ico">{ICONS.pin}</span>
                  {open.location}
                </p>

                <div className="re-facts">
                  <div><b>{open.type}</b><span>Type</span></div>
                  {open.bedrooms ? <div><b>{open.bedrooms}</b><span>Bedrooms</span></div> : null}
                  {open.bathrooms ? <div><b>{open.bathrooms}</b><span>Bathrooms</span></div> : null}
                  {open.size ? <div><b>{open.size}</b><span>Size</span></div> : null}
                </div>

                {open.description && (
                  <>
                    <h3 className="re-sub">About this property</h3>
                    <p className="re-desc">{open.description}</p>
                  </>
                )}
              </div>
            </div>

            <div className="re-sheet-bar">
              {open.status === "Available" ? (
                <a
                  className="re-wa big"
                  href={waLink(open)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => saveInquiry(open)}
                >
                  <span className="re-ico">{ICONS.wa}</span>
                  Ask the agent on WhatsApp
                </a>
              ) : (
                <span className="re-wa big off">No longer available</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}