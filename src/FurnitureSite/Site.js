import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import "./Site.css";

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

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

const isAvailable = (x) => (x.status || "Available") === "Available";
const madeToOrder = (x) => String(x.availability || "").toLowerCase().includes("order");
const catOf = (x) => String(x.category || "").trim() || "Other";

// Small line icons
const ICONS = {
  wa: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.600 15L2 22l5.200-1.400A10 10 0 1 0 12 2zm0 18.200a8.200 8.200 0 0 1-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200z" />
      <path d="M16.500 14.300c-.2-.1-1.400-.7-1.600-.8-.2-.1-.4-.1-.5.1l-.7.900c-.1.100-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.1 0-.3 0-.4l-.7-1.600c-.2-.4-.3-.4-.5-.4h-.4a.8.8 0 0 0-.6.300 2.500 2.500 0 0 0-.8 1.900c0 1.100.8 2.200.9 2.300.1.200 1.600 2.500 3.900 3.500 1.400.6 2 .7 2.700.6.400-.1 1.400-.6 1.600-1.200.2-.5.2-1 .1-1.100l-.5-.2z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.500-3.500" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.500" />
    </svg>
  ),
};

// Shows the whole photo whatever its shape. A blurred copy fills the leftover space.
function Photo({ src, alt = "", eager = false }) {
  return (
    <>
      <img className="fs-img-bg" src={src} alt="" aria-hidden="true" loading="lazy" />
      <img className="fs-img-main" src={src} alt={alt} loading={eager ? "eager" : "lazy"} />
    </>
  );
}

// Swipe through every photo, with a counter and dots
function Gallery({ photos }) {
  const [active, setActive] = useState(0);

  if (!photos.length) {
    return <div className="fs-gal empty" />;
  }

  function handleScroll(e) {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  }

  return (
    <div className="fs-gal">
      <div className="fs-gal-track" onScroll={handleScroll}>
        {photos.map((src, i) => (
          <div className="fs-gal-slide" key={src + i}>
            <Photo src={src} eager={i === 0} />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <span className="fs-gal-count">{active + 1} / {photos.length}</span>
          <div className="fs-gal-dots">
            {photos.map((src, i) => (
              <i key={src + i} className={i === active ? "on" : ""} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// One piece of furniture in the list
function Card({ x, base, money }) {
  const status = x.status || "Available";
  const photos = x.photos || [];

  return (
    <Link className="fs-card" to={withQuery(`${base}/item/${x.id}`)}>
      <div className="fs-img">
        {photos[0] ? <Photo src={photos[0]} alt={x.name} /> : <span className="fs-noimg" />}
        {status !== "Available" && <span className="fs-sold">{status}</span>}
        {status === "Available" && madeToOrder(x) && <span className="fs-tag">Made to order</span>}
      </div>

      <div className="fs-body">
        <h3>{x.name}</h3>
        <p className="fs-sub">{[x.material, x.color].filter(Boolean).join(" · ")}</p>
        <b className="fs-price">{money(x.price)}</b>
      </div>
    </Link>
  );
}

// Real numbers counted from the shop's own items. Nothing is made up.
function Stats({ items }) {
  const cells = useMemo(() => {
    const open = items.filter(isAvailable);
    // Counted over everything, so it matches the category buttons
    const cats = new Set(items.map(catOf));
    return [
      { n: open.length, label: open.length === 1 ? "Piece" : "Pieces" },
      { n: cats.size, label: cats.size === 1 ? "Category" : "Categories" },
      { n: open.filter((x) => !madeToOrder(x)).length, label: "Ready now" },
      { n: open.filter(madeToOrder).length, label: "Made to order" },
    ].filter((s) => s.n > 0);
  }, [items]);

  if (cells.length === 0) return null;

  return (
    <section className="fs-stats">
      <div className="fs-wrap fs-stats-row">
        {cells.map((s) => (
          <div key={s.label} className="fs-stat">
            <b>{s.n}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// The shop's own About text, written in Business Info
function AboutUs({ name, about, address }) {
  if (!about && !address) return null;

  const map = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "";

  return (
    <section className="fs-aboutus">
      <div className="fs-wrap fs-aboutus-in">
        <div>
          <h2>About {name}</h2>
          {about && <p>{about}</p>}
        </div>

        {address && (
          <a className="fs-where" href={map} target="_blank" rel="noreferrer">
            <span className="fs-ico">{ICONS.pin}</span>
            <span>
              <small>Visit the showroom</small>
              {address}
            </span>
          </a>
        )}
      </div>
    </section>
  );
}

function ContactBand({ name, phone }) {
  if (!phone) return null;
  const text = `Hello ${name}, I need a piece of furniture in a different size or colour. Can you make it?`;

  return (
    <section className="fs-contact">
      <div className="fs-wrap fs-contact-in">
        <div>
          <h2>Need a different size or colour?</h2>
          <p>Send the measurements or a photo of what you have in mind. You will get a reply on WhatsApp.</p>
        </div>
        <a
          className="fs-contact-btn"
          href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="fs-ico">{ICONS.wa}</span>
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}

// The list page
function Listing({ items, busy, base, money, hero }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");

  const search = q.trim().toLowerCase();

  // The categories this shop actually has, with how many pieces each
  const cats = useMemo(() => {
    const counts = {};
    items.forEach((x) => {
      const c = catOf(x);
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.keys(counts).map((c) => ({ name: c, n: counts[c] }));
  }, [items]);

  const filtered = items.filter((x) => {
    const okCat = cat === "All" || catOf(x) === cat;
    const text = `${x.name || ""} ${x.material || ""} ${x.color || ""} ${catOf(x)}`.toLowerCase();
    return okCat && text.includes(search);
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
      <section
        className="fs-hero"
        style={
          hero.image
            ? { backgroundImage: `linear-gradient(rgba(20,24,32,.55),rgba(20,24,32,.8)),url(${hero.image})` }
            : {}
        }
      >
        <div className="fs-hero-in">
          {hero.label && <span className="fs-badge">{hero.label}</span>}
          <h1>{hero.headline || "Furniture for the home you are building"}</h1>

          <div className="fs-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.500-3.500" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sofa, bed, dining table..."
              aria-label="Search the furniture"
            />
          </div>
        </div>
      </section>

      {cats.length > 1 && (
        <nav className="fs-cats" aria-label="Categories">
          <div className="fs-cats-in">
            {[{ name: "All", n: items.length }, ...cats].map((c) => (
              <button key={c.name} className={cat === c.name ? "on" : ""} onClick={() => setCat(c.name)}>
                {c.name}
                <small>{c.n}</small>
              </button>
            ))}
          </div>
        </nav>
      )}

      {!busy && <Stats items={items} />}

      <main id="items" className="fs-main">
        <div className="fs-head-row">
          <h2>{cat === "All" ? "All furniture" : cat}</h2>
          {!busy && items.length > 0 && (
            <div className="fs-tools">
              <span className="fs-found">{shown.length} shown</span>
              <label className="fs-sort">
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
          <p className="fs-empty">Loading furniture...</p>
        ) : shown.length === 0 ? (
          <p className="fs-empty">
            {items.length === 0
              ? "No furniture to show yet. Check back soon."
              : "Nothing matches that. Try another search."}
          </p>
        ) : (
          <div className="fs-grid">
            {shown.map((x) => (
              <Card key={x.id} x={x} base={base} money={money} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// One piece, with every photo and its size
function Detail({ items, busy, base, money, waLink, onInquire }) {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (busy) {
    return <main className="fs-main"><p className="fs-empty">Loading...</p></main>;
  }

  const x = items.find((i) => String(i.id) === String(id));

  if (!x) {
    return (
      <main className="fs-main">
        <p className="fs-empty">That piece is no longer listed.</p>
        <Link className="fs-back" to={withQuery(base || "/")}>Back to all furniture</Link>
      </main>
    );
  }

  const status = x.status || "Available";
  const photos = x.photos || [];

  // Size, material and colour are what a buyer checks first
  const specs = [
    x.category ? ["Category", x.category] : null,
    x.dimensions ? ["Size", x.dimensions] : null,
    x.material ? ["Material", x.material] : null,
    x.color ? ["Colour", x.color] : null,
    x.availability ? ["Availability", x.availability] : null,
  ].filter(Boolean);

  return (
    <>
      <Gallery photos={photos} />

      <main className="fs-main fs-detail">
        <Link className="fs-back" to={withQuery(base || "/")}>← All furniture</Link>

        <div className="fs-pills">
          {status === "Available" && madeToOrder(x) && <span className="fs-pill wood">Made to order</span>}
          {status !== "Available" && <span className="fs-pill dark">{status}</span>}
        </div>

        <h1>{x.name}</h1>
        <p className="fs-price big">{money(x.price)}</p>

        {specs.length > 0 && (
          <dl className="fs-sheet">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {x.description && (
          <section className="fs-about">
            <h2>About this piece</h2>
            <p>{x.description}</p>
          </section>
        )}

        <p className="fs-note">Delivery and the final price for your area are confirmed with the seller on WhatsApp.</p>
      </main>

      {/* Always within thumb reach while they scroll */}
      <div className="fs-bar">
        {status === "Available" ? (
          <a className="fs-wa" href={waLink(x)} target="_blank" rel="noreferrer" onClick={() => onInquire(x)}>
            <span className="fs-ico">{ICONS.wa}</span>
            Ask about this piece
          </a>
        ) : (
          <span className="fs-wa off">No longer available</span>
        )}
      </div>
    </>
  );
}

// The public website for a furniture shop. It loads its own data, like your other sites.
export default function FurnitureSite({ basePath = "", slug: slugProp }) {
  const { slug, store, loading, notFound } = useShop(slugProp);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    api.get(`/public/shop/${slug}/furniture`)
      .then((res) => {
        // Never let a bad answer turn this into undefined
        if (!cancelled) setItems(Array.isArray(res?.items) ? res.items : []);
      })
      .catch(() => {
        // The page still opens, it just shows no furniture
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div className="fs-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="fs-loading">
        <h1>Website not found</h1>
        <p>This website address doesn't belong to any shop.</p>
      </div>
    );
  }

  const phone = (store.whatsapp || "").replace(/\D/g, "");
  const hero = store.hero || {};
  const money = (n) => formatPrice(n, store.symbol);

  // Only the ones the owner actually filled in
  const socials = [
    { name: "Instagram", url: socialUrl("instagram", store.instagram) },
    { name: "TikTok", url: socialUrl("tiktok", store.tiktok) },
    { name: "Facebook", url: socialUrl("facebook", store.facebook) },
  ].filter((s) => s.url);

  function waLink(x) {
    const text = `Hello ${store.name}, I am interested in the ${x.name} (${money(x.price)}). Is it still available?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // Save the inquiry so the owner sees it in the dashboard, then WhatsApp opens
  function onInquire(x) {
    api.post(`/public/shop/${slug}/inquiries`, {
      propertyId: x.id,
      propertyTitle: x.name,
    }).catch(() => {
      // Never stop the visitor from reaching WhatsApp
    });
  }

  const shared = { items, busy, base: basePath, money, waLink, onInquire };

  return (
    <div className="fs">
      <header className="fs-header">
        <Link className="fs-logo" to={withQuery(basePath || "/")}>
          {store.logo ? <img src={store.logo} alt="" /> : <i>{(store.name || "F")[0]}</i>}
          <span>{store.name}</span>
        </Link>
        {phone && (
          <a className="fs-cta" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
            Contact
          </a>
        )}
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Listing {...shared} hero={hero} />

              <AboutUs name={store.name} about={store.about} address={store.address} />
              <ContactBand name={store.name} phone={phone} />

              {phone && (
                <a
                  className="fs-float"
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
        <Route path="item/:id" element={<Detail {...shared} />} />
      </Routes>

      <footer className="fs-foot">
        <div className="fs-foot-in">
          <b className="fs-foot-name">{store.name}</b>

          <div className="fs-foot-contact">
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
            <div className="fs-foot-social">
              {socials.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
              ))}
            </div>
          )}
        </div>

        <div className="fs-foot-bottom">
          <small>© {new Date().getFullYear()} {store.name}</small>
          <small>Powered by CBE QuickSite</small>
        </div>
      </footer>
    </div>
  );
}