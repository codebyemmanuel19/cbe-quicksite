import { useEffect, useState } from "react";
import { api } from "../api";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import "./Site.css";

const TYPES = ["All", "House", "Flat", "Land"];
const LISTINGS = ["All", "Sale", "Rent"];

// The public website for a real estate agent. It loads its own data, like your other sites.
export default function RealEstateSite({ slug: slugProp }) {
  const { slug, store, loading, notFound } = useShop(slugProp);
  const [properties, setProperties] = useState([]);
  const [type, setType] = useState("All");
  const [listing, setListing] = useState("All");
  const [q, setQ] = useState("");

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
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  const search = q.trim().toLowerCase();

  // Match on small letters, so "House" and "house" both work
  const shown = properties.filter((p) => {
    const okType = type === "All" || String(p.type || "").toLowerCase() === type.toLowerCase();
    const okListing =
      listing === "All" || String(p.listing || "").toLowerCase() === listing.toLowerCase();
    const text = `${p.title || ""} ${p.location || ""}`.toLowerCase();
    return okType && okListing && text.includes(search);
  });

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

  return (
    <div className="re">
      <header className="re-head">
        <span className="re-logo">
          {store.logo ? <img src={store.logo} alt="" /> : <i>{(store.name || "R")[0]}</i>}
          {store.name}
        </span>
        <a className="re-cta" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
          Contact
        </a>
      </header>

      <section
        className="re-hero"
        style={
          hero.image
            ? { backgroundImage: `linear-gradient(rgba(8,30,38,.62),rgba(8,30,38,.8)),url(${hero.image})` }
            : {}
        }
      >
        {hero.label && <span className="re-badge">{hero.label}</span>}
        <h1>{hero.headline || "Find a home you will love"}</h1>
        <p>{store.about || "Verified houses, flats and land. Chat with an agent on WhatsApp."}</p>
      </section>

      <section className="re-search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by location or title"
        />
        <div className="re-chips">
          {LISTINGS.map((l) => (
            <button key={l} className={listing === l ? "on" : ""} onClick={() => setListing(l)}>
              {l === "All" ? "Buy or rent" : "For " + l.toLowerCase()}
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
        <h2>Properties</h2>
        {shown.length === 0 ? (
          <p className="re-empty">No properties to show yet. Check back soon.</p>
        ) : (
          <div className="re-grid">
            {shown.map((p) => {
              // An empty status in the database must not hide the WhatsApp button
              const status = p.status || "Available";

              return (
                <article key={p.id} className="re-card">
                  <div
                    className="re-img"
                    style={p.photos?.[0] ? { backgroundImage: `url(${p.photos[0]})` } : {}}
                  >
                    {p.listing && <span className="re-tag">For {String(p.listing).toLowerCase()}</span>}
                    {status !== "Available" && <span className="re-sold">{status}</span>}
                  </div>
                  <div className="re-body">
                    <h3>{p.title}</h3>
                    <p className="re-price">
                      {formatPrice(p.price, store.symbol)}
                      {String(p.listing).toLowerCase() === "rent" ? " / year" : ""}
                    </p>
                    <p className="re-loc">{p.location}</p>
                    <div className="re-meta">
                      {p.bedrooms ? <span>{p.bedrooms} bed</span> : null}
                      {p.bathrooms ? <span>{p.bathrooms} bath</span> : null}
                      {p.size ? <span>{p.size}</span> : null}
                    </div>
                    {status === "Available" ? (
                      <a
                        className="re-wa"
                        href={waLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => saveInquiry(p)}
                      >
                        Ask the agent on WhatsApp
                      </a>
                    ) : (
                      <span className="re-wa off">No longer available</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="re-foot">
        <b>{store.name}</b>
        {store.address && <span>{store.address}</span>}
        {store.phone && <span>{store.phone}</span>}
        <small>Powered by CBE QuickSite</small>
      </footer>
    </div>
  );
}