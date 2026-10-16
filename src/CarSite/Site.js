import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import Reveal from "../shop/Reveal";
import "./Site.css";

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
  { id: "year", label: "Year: newest first" },
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

const km = (n) => Number(n).toLocaleString("en-NG") + " km";
const isUsed = (c) => String(c.condition || "").toLowerCase().includes("used");
const isAvailable = (c) => (c.status || "Available") === "Available";

// Small line icons
const ICONS = {
  car: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 16l1.5-5.2A2 2 0 0 1 8.400 9.400h7.200a2 2 0 0 1 1.900 1.400L19 16" />
      <path d="M3 16h18v3H3z" />
      <circle cx="7.500" cy="19" r="1.500" />
      <circle cx="16.500" cy="19" r="1.500" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.500" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.500" cy="8.500" r="1" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-11.800 7L3 21l2-5.600A8 8 0 1 1 21 12z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z" />
      <path d="M8.500 12l2.500 2.500L15.500 10" />
    </svg>
  ),
  year: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.500" y="5" width="17" height="15" rx="2" />
      <path d="M3.500 10h17M8 3v4M16 3v4" />
    </svg>
  ),
  road: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="M12 18l4-6" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M6 8v3h12V8M12 11v5" />
    </svg>
  ),
  fuel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M3 21h14M15 9h2a2 2 0 0 1 2 2v5a1.500 1.500 0 0 0 3 0V9l-3-3" />
      <path d="M8 8h4" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.500A2.500 2.500 0 1 1 12 6.500a2.500 2.500 0 0 1 0 5z" />
    </svg>
  ),
  wa: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.600 15L2 22l5.200-1.400A10 10 0 1 0 12 2zm0 18.200a8.200 8.200 0 0 1-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200z" />
      <path d="M16.500 14.300c-.2-.1-1.400-.7-1.600-.8-.2-.1-.4-.1-.5.1l-.7.900c-.1.100-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.1 0-.3 0-.4l-.7-1.600c-.2-.4-.3-.4-.5-.4h-.4a.8.8 0 0 0-.6.300 2.500 2.500 0 0 0-.8 1.900c0 1.100.8 2.200.9 2.300.1.200 1.600 2.500 3.900 3.500 1.400.6 2 .7 2.700.6.400-.1 1.400-.6 1.600-1.200.2-.5.2-1 .1-1.100l-.5-.2z" />
    </svg>
  ),
};

// A real order of events, so the numbers mean something
const STEPS = [
  { title: "Pick a car", text: "Browse the photos and prices. Tap a car to see every detail." },
  { title: "Chat on WhatsApp", text: "One tap opens WhatsApp with the car already named in your message." },
  { title: "Inspect it", text: "See the car in person. Bring your own mechanic if you like." },
  { title: "Pay and drive", text: "Agree the price, pay, collect your documents and the keys." },
];

// Shows the whole photo whatever its shape. A blurred copy fills the leftover space.
function Photo({ src, alt = "", eager = false }) {
  return (
    <>
      <img className="cr-img-bg" src={src} alt="" aria-hidden="true" loading="lazy" />
      <img
        className="cr-img-main"
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
    return <div className="cr-gal empty" />;
  }

  function handleScroll(e) {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  }

  return (
    <div className="cr-gal">
      <div className="cr-gal-track" onScroll={handleScroll}>
        {photos.map((src, i) => (
          <div className="cr-gal-slide" key={src + i}>
            <Photo src={src} eager={i === 0} />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <span className="cr-gal-count">{active + 1} / {photos.length}</span>
          <div className="cr-gal-dots">
            {photos.map((src, i) => (
              <i key={src + i} className={i === active ? "on" : ""} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// One car in the list. Price first, then name, place and condition.
function Card({ c, base, money, waLink, onInquire }) {
  const status = c.status || "Available";
  const photos = c.photos || [];
  const line = [c.year, c.mileage ? km(c.mileage) : "", c.transmission].filter(Boolean).join(" · ");

  return (
    <article className="cr-card">
      <Link className="cr-card-top" to={withQuery(`${base}/car/${c.id}`)}>
        <div className="cr-img">
          {photos[0] ? <Photo src={photos[0]} alt={c.title} /> : <span className="cr-noimg" />}
          {status !== "Available" && <span className="cr-sold">{status}</span>}
          {photos.length > 1 && <span className="cr-shots">{photos.length} photos</span>}
        </div>

        <div className="cr-body">
          <p className="cr-price">{money(c.price)}</p>
          <h3>{c.title}</h3>
          {c.location && (
            <p className="cr-loc">
              <i>{ICONS.pin}</i>
              <span>{c.location}</span>
            </p>
          )}
          {line && <p className="cr-line">{line}</p>}
          {c.condition && <span className="cr-tag">{c.condition}</span>}
        </div>
      </Link>

      <div className="cr-acts">
        {status === "Available" ? (
          <a
            className="cr-wa"
            href={waLink(c)}
            target="_blank"
            rel="noreferrer"
            onClick={() => onInquire(c)}
          >
            <span className="cr-ico">{ICONS.wa}</span>
            WhatsApp
          </a>
        ) : (
          <span className="cr-wa off">Not available</span>
        )}
      </div>
    </article>
  );
}

function Steps({ name }) {
  return (
    <section className="cr-steps">
      <div className="cr-wrap">
        <h2>How buying from {name} works</h2>

        <ol className="cr-steps-list">
          {STEPS.map((st, n) => (
            <li key={st.title}>
              <span className="cr-step-n">{n + 1}</span>
              <div>
                <h3>{st.title}</h3>
                <p>{st.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// The dealer's own About text, written in Business Info
function AboutUs({ name, about }) {
  if (!about) return null;

  return (
    <section className="cr-aboutus">
      <div className="cr-wrap cr-aboutus-in">
        <h2>About {name}</h2>
        <p>{about}</p>
      </div>
    </section>
  );
}

function ContactBand({ name, phone }) {
  if (!phone) return null;
  const text = `Hello ${name}, I am looking for a car.`;

  return (
    <section className="cr-contact">
      <div className="cr-wrap cr-contact-in">
        <div>
          <h2>Can't find the car you want?</h2>
          <p>Tell the dealer the make, year and your budget. You will get a reply on WhatsApp.</p>
        </div>
        <a
          className="cr-contact-btn"
          href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="cr-ico">{ICONS.wa}</span>
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}

// The list page
function Listing({ cars, busy, base, money, waLink, onInquire, hero }) {
  const [cond, setCond] = useState("All");
  const [make, setMake] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");

  const search = q.trim().toLowerCase();

  // The brands this dealer actually has, most common first
  const makes = useMemo(() => {
    const counts = {};
    cars.forEach((c) => {
      const m = String(c.make || "").trim();
      if (m) counts[m] = (counts[m] || 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
  }, [cars]);

  const filtered = cars.filter((c) => {
    const okCond =
      cond === "All" || (cond === "Used" ? isUsed(c) : !isUsed(c));
    const okMake = make === "All" || String(c.make || "").toLowerCase() === make.toLowerCase();
    const text = `${c.title || ""} ${c.location || ""}`.toLowerCase();
    return okCond && okMake && text.includes(search);
  });

  // "Newest" keeps the order the server sends
  const shown =
    sort === "low"
      ? [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
      : sort === "high"
      ? [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
      : sort === "year"
      ? [...filtered].sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      : filtered;

  return (
    <>
      <section
        className="cr-hero"
        style={
          hero.image
            ? { backgroundImage: `linear-gradient(90deg,rgba(8,9,12,.82),rgba(8,9,12,.35)),linear-gradient(0deg,rgba(8,9,12,.65),rgba(8,9,12,0) 45%),url(${hero.image})` }
            : {}
        }
      >
        <div className="cr-hero-in">
          {hero.label && <span className="cr-badge">{hero.label}</span>}
          <h1>{hero.headline || "Find the car you have been looking for"}</h1>
          <a className="cr-hero-btn" href="#cars">Browse cars</a>
        </div>
      </section>

      <main id="cars" className="cr-main">
        <div className="cr-find">
          <div className="cr-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search make, model or location"
            />
          </div>

          <div className="cr-seg">
            {["All", "New", "Used"].map((l) => {
              const value = l === "New" ? "Brand new" : l;
              return (
                <button key={l} className={cond === value ? "on" : ""} onClick={() => setCond(value)}>
                  {l === "New" ? "Brand new" : l}
                </button>
              );
            })}
          </div>
        </div>

        {makes.length > 1 && (
          <div className="cr-makes">
            {["All", ...makes].map((m) => (
              <button key={m} className={make === m ? "on" : ""} onClick={() => setMake(m)}>
                {m}
              </button>
            ))}
          </div>
        )}

        <div className="cr-head-row">
          <h2>Cars</h2>
          {!busy && cars.length > 0 && (
            <div className="cr-tools">
              <span className="cr-found">{shown.length} shown</span>
              <label className="cr-sort">
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
          <p className="cr-empty">Loading cars...</p>
        ) : shown.length === 0 ? (
          <p className="cr-empty">
            {cars.length === 0
              ? "No cars to show yet. Check back soon."
              : "Nothing matches that. Try another search."}
          </p>
        ) : (
          <div className="cr-grid">
            {shown.map((c, i) => (
              <Reveal key={c.id} delay={(i % 4) * 70}>
                <Card
                  c={c}
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

// One car, with every photo
function Detail({ cars, busy, base, money, waLink, onInquire }) {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (busy) {
    return <main className="cr-main"><p className="cr-empty">Loading...</p></main>;
  }

  const c = cars.find((x) => String(x.id) === String(id));

  if (!c) {
    return (
      <main className="cr-main">
        <p className="cr-empty">That car is no longer listed.</p>
        <Link className="cr-back" to={withQuery(base || "/")}>Back to all cars</Link>
      </main>
    );
  }

  const status = c.status || "Available";
  const photos = c.photos || [];
  const specs = [
    c.make ? ["Make", c.make] : null,
    c.model ? ["Model", c.model] : null,
    c.year ? ["Year", c.year] : null,
    c.condition ? ["Condition", c.condition] : null,
    c.mileage ? ["Mileage", km(c.mileage)] : null,
    c.transmission ? ["Gearbox", c.transmission] : null,
    c.fuel ? ["Fuel", c.fuel] : null,
    c.color ? ["Colour", c.color] : null,
  ].filter(Boolean);

  return (
    <>
      <Gallery photos={photos} />

      <main className="cr-main cr-detail">
        <Link className="cr-back" to={withQuery(base || "/")}>← All cars</Link>

        <div className="cr-pills">
          {c.condition && <span className="cr-pill dark">{c.condition}</span>}
          {status !== "Available" && <span className="cr-pill red">{status}</span>}
        </div>

        <h1>{c.title}</h1>
        <p className="cr-price big">{money(c.price)}</p>
        <p className="cr-loc">{c.location}</p>

        {/* A proper spec sheet: car buyers compare these first */}
        <dl className="cr-sheet">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {c.description && (
          <section className="cr-about">
            <h2>About this car</h2>
            <p>{c.description}</p>
          </section>
        )}
      </main>

      {/* Always within thumb reach while they scroll */}
      <div className="cr-bar">
        {status === "Available" ? (
          <a
            className="cr-wa"
            href={waLink(c)}
            target="_blank"
            rel="noreferrer"
            onClick={() => onInquire(c)}
          >
            Ask about this car on WhatsApp
          </a>
        ) : (
          <span className="cr-wa off">No longer available</span>
        )}
      </div>
    </>
  );
}

// The public website for a car dealer. It loads its own data, like your other sites.
export default function CarSite({ basePath = "", slug: slugProp }) {
  const { slug, store, loading, notFound } = useShop(slugProp);
  const location = useLocation();
  const [cars, setCars] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    api.get(`/public/shop/${slug}/cars`)
      .then((res) => {
        // Never let a bad answer turn this into undefined
        if (!cancelled) setCars(Array.isArray(res?.cars) ? res.cars : []);
      })
      .catch(() => {
        // The page still opens, it just shows no cars
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div className="cr-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="cr-loading">
        <h1>Website not found</h1>
        <p>This website address doesn't belong to any dealer.</p>
      </div>
    );
  }

  const phone = (store.whatsapp || "").replace(/\D/g, "");
  const hero = store.hero || {};
  const money = (n) => formatPrice(n, store.symbol);

  // Only the ones the dealer actually filled in
  const socials = [
    { name: "Instagram", url: socialUrl("instagram", store.instagram) },
    { name: "TikTok", url: socialUrl("tiktok", store.tiktok) },
    { name: "Facebook", url: socialUrl("facebook", store.facebook) },
  ].filter((s) => s.url);

  function waLink(c) {
    const text = `Hello ${store.name}, I am interested in the ${c.title} (${money(c.price)}) in ${c.location}. Is it still available?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // Save the inquiry so the dealer sees it in the dashboard, then WhatsApp opens
  function onInquire(c) {
    api.post(`/public/shop/${slug}/inquiries`, {
      propertyId: c.id,
      propertyTitle: c.title,
    }).catch(() => {
      // Never stop the visitor from reaching WhatsApp
    });
  }

  const shared = { cars, busy, base: basePath, money, waLink, onInquire };

  return (
    <div className="cr">
      <header className="cr-head">
        <Link className="cr-logo" to={withQuery(basePath || "/")}>
          {store.logo ? <img src={store.logo} alt="" /> : <i>{(store.name || "C")[0]}</i>}
          <span>{store.name}</span>
        </Link>
        <a className="cr-cta" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
          Contact
        </a>
      </header>

      <div className="qs-page" key={location.pathname}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Listing {...shared} hero={hero} />

              <Steps name={store.name} />
              <AboutUs name={store.name} about={store.about} />
              <ContactBand name={store.name} phone={phone} />

              {phone && (
                <a
                  className="cr-float"
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
        <Route path="car/:id" element={<Detail {...shared} />} />
      </Routes>
      </div>

      <footer className="cr-foot">
        <div className="cr-foot-in">
          <b className="cr-foot-name">{store.name}</b>

          <div className="cr-foot-contact">
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
            <div className="cr-foot-social">
              {socials.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
              ))}
            </div>
          )}
        </div>

        <div className="cr-foot-bottom">
          <small>©️ {new Date().getFullYear()} {store.name}</small>
          <small>Powered by CBE QuickSite</small>
        </div>
      </footer>
    </div>
  );
}