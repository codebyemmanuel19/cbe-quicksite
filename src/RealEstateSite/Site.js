import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import "./Site.css";

const TYPES = ["House", "Flat", "Land"];
const LISTINGS = ["All", "Sale", "Rent"];
const BEDS = [1, 2, 3, 4, 5];

// Nice round numbers for the "Up to" price filter
const PRICE_STEPS = [
  500000, 1000000, 2000000, 3000000, 5000000, 7500000, 10000000, 15000000, 20000000,
  30000000, 50000000, 75000000, 100000000, 150000000, 200000000, 300000000, 500000000,
  1000000000, 2000000000,
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

const SORTS = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

// Small line icons
const line = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ICONS = {
  home: (
    <svg {...line}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  ),
  chat: (
    <svg {...line}>
      <path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-5.6A8 8 0 1 1 21 12z" />
    </svg>
  ),
  tag: (
    <svg {...line}>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="8.5" r="1" />
    </svg>
  ),
  key: (
    <svg {...line}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9" />
      <path d="M16 7l3 3" />
    </svg>
  ),
  bed: (
    <svg {...line}>
      <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 15h18" />
      <path d="M7 9V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  bath: (
    <svg {...line}>
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z" />
      <path d="M6 12V6a2 2 0 0 1 3.5-1.3" />
      <path d="M7 19l-1 2M17 19l1 2" />
    </svg>
  ),
  size: (
    <svg {...line}>
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h5M9 4v5" />
    </svg>
  ),
  pin: (
    <svg {...line}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  share: (
    <svg {...line}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  ),
  close: (
    <svg {...line}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  left: (
    <svg {...line} strokeWidth="2.2">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  right: (
    <svg {...line} strokeWidth="2.2">
      <path d="M9 5l7 7-7 7" />
    </svg>
  ),
  camera: (
    <svg {...line}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  ),
  phone: (
    <svg {...line}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
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

// A bare number like "12" means nothing. Add the unit so it reads "12 sqm".
function sizeText(v) {
  const t = String(v || "").trim();
  return /^\d+(\.\d+)?$/.test(t) ? `${t} sqm` : t;
}

// Keeps ?slug=... attached while you test on localhost
function withQuery(path) {
  return path + (typeof window !== "undefined" ? window.location.search : "");
}

// Price steps that fit the agent's real prices, so every option is useful
function priceSteps(list) {
  const prices = list.map((p) => Number(p.price)).filter((n) => n > 0);
  if (prices.length < 2) return [];
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  const out = [];
  for (const s of PRICE_STEPS) {
    if (s > lo) out.push(s);
    if (s >= hi) break;
  }
  return out.length >= 2 ? out : [];
}

function isRent(p) {
  return String(p.listing).toLowerCase() === "rent";
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

// Grey placeholder while the listings load
function CardSkeleton() {
  return (
    <div className="re-card re-sk-card">
      <div className="re-sk re-sk-img" />
      <div className="re-body">
        <div className="re-sk re-sk-line w50" />
        <div className="re-sk re-sk-line w80" />
        <div className="re-sk re-sk-line w60" />
      </div>
    </div>
  );
}

// ---------- Home page pieces ----------

// One slim line of real numbers under the headline
function HeroLine({ properties }) {
  const open = properties.filter((p) => (p.status || "Available") === "Available");
  if (open.length === 0) return null;

  const sale = open.filter((p) => String(p.listing).toLowerCase() === "sale").length;
  const rent = open.filter(isRent).length;
  const bits = [
    `${open.length} ${open.length === 1 ? "property" : "properties"}`,
    sale > 0 ? `${sale} for sale` : "",
    rent > 0 ? `${rent} to rent` : "",
  ].filter(Boolean);

  return (
    <p className="re-hero-line">
      {bits.map((b, i) => (
        <span key={b}>{i > 0 && <i />}{b}</span>
      ))}
    </p>
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
function AboutUs({ name, logo, about }) {
  if (!about) return null;

  return (
    <section className="re-aboutus">
      <div className="re-wrap re-aboutus-in">
        <Reveal>
          <div className="re-about-head">
            <span className="re-av">{logo ? <img src={logo} alt="" /> : (name || "A")[0]}</span>
            <h2>About {name}</h2>
          </div>
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

// ---------- Photos ----------

// The photos inside a card. Swipe on a phone, arrows on a computer.
function CardPhotos({ photos, alt }) {
  const [active, setActive] = useState(0);
  const track = useRef(null);

  if (!photos.length) return <span className="re-noimg" />;

  function handleScroll(e) {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  }

  // The card is a link, so stop the arrow tap from opening the property
  function step(e, dir) {
    e.preventDefault();
    e.stopPropagation();
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  return (
    <>
      <div className="re-track" ref={track} onScroll={handleScroll}>
        {photos.map((src, i) => (
          <div className="re-slide" key={src + i}>
            <img src={src} alt={i === 0 ? alt : ""} loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button type="button" className="re-arrow prev" aria-label="Previous photo" onClick={(e) => step(e, -1)}>
            {ICONS.left}
          </button>
          <button type="button" className="re-arrow next" aria-label="Next photo" onClick={(e) => step(e, 1)}>
            {ICONS.right}
          </button>
          <span className="re-shots">
            <i>{ICONS.camera}</i>
            {active + 1}/{photos.length}
          </span>
        </>
      )}
    </>
  );
}

// Full screen viewer. Tap a photo on the property page to open it.
function Lightbox({ photos, start, onClose }) {
  const [i, setI] = useState(start);
  const [startX, setStartX] = useState(null);
  const total = photos.length;

  useEffect(() => {
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((n) => (n + 1) % total);
      if (e.key === "ArrowLeft") setI((n) => (n - 1 + total) % total);
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener("keydown", onKey);
    };
  }, [total, onClose]);

  function handleEnd(e) {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    setStartX(null);
    if (Math.abs(dx) > 40) setI((n) => (n + (dx < 0 ? 1 : total - 1)) % total);
  }

  return (
    <div
      className="re-lb"
      onTouchStart={(e) => setStartX(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <div className="re-lb-top">
        <span>{i + 1} / {total}</span>
        <button type="button" aria-label="Close" onClick={onClose}>{ICONS.close}</button>
      </div>

      <div className="re-lb-stage" onClick={onClose}>
        <img key={photos[i]} src={photos[i]} alt="" onClick={(e) => e.stopPropagation()} />
      </div>

      {total > 1 && (
        <>
          <button type="button" className="re-lb-nav prev" aria-label="Previous photo" onClick={() => setI((n) => (n - 1 + total) % total)}>
            {ICONS.left}
          </button>
          <button type="button" className="re-lb-nav next" aria-label="Next photo" onClick={() => setI((n) => (n + 1) % total)}>
            {ICONS.right}
          </button>
        </>
      )}
    </div>
  );
}

// The big photo on the property page. The frame follows the photo, so nothing is cut off.
function clamp(r, lo = 0.75, hi = 1.78) {
  return Math.min(hi, Math.max(lo, r));
}

function Gallery({ photos, back }) {
  const [active, setActive] = useState(0);
  const [ratios, setRatios] = useState({});
  const [startX, setStartX] = useState(null);
  const [open, setOpen] = useState(false);

  if (!photos.length) {
    return <div className="re-gal empty">{back}</div>;
  }

  const total = photos.length;
  const go = (n) => setActive((n + total) % total);
  const shape = clamp(ratios[active] || 4 / 3);

  function handleLoad(e) {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w && h) setRatios((r) => ({ ...r, [active]: w / h }));
  }

  function handleEnd(e) {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    setStartX(null);
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  }

  function nav(e, n) {
    e.stopPropagation();
    go(n);
  }

  return (
    <div className="re-gal">
      <div
        className="re-gal-stage"
        style={{ aspectRatio: String(shape) }}
        onTouchStart={(e) => setStartX(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onClick={() => setOpen(true)}
      >
        <img
          key={photos[active]}
          className="re-gal-img"
          src={photos[active]}
          alt=""
          onLoad={handleLoad}
        />

        {back}

        {total > 1 && (
          <>
            <button type="button" className="re-gal-nav prev" aria-label="Previous photo" onClick={(e) => nav(e, active - 1)}>
              {ICONS.left}
            </button>
            <button type="button" className="re-gal-nav next" aria-label="Next photo" onClick={(e) => nav(e, active + 1)}>
              {ICONS.right}
            </button>
          </>
        )}

        <span className="re-gal-count">
          <i>{ICONS.camera}</i>
          {active + 1} / {total}
        </span>
      </div>

      {total > 1 && (
        <div className="re-thumbs">
          {photos.map((src, i) => (
            <button
              type="button"
              key={src + i}
              className={i === active ? "on" : ""}
              aria-label={`Photo ${i + 1}`}
              onClick={() => setActive(i)}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {open && <Lightbox photos={photos} start={active} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ---------- List ----------

// One property in the list. Price first, then the facts, then two easy buttons.
function Card({ p, base, money, waLink, onInquire, onShare }) {
  const status = p.status || "Available";
  const photos = p.photos || [];
  const done = status !== "Available";

  return (
    <article className={`re-card ${done ? "done" : ""}`}>
      <Link className="re-card-top" to={withQuery(`${base}/property/${p.id}`)}>
        <div className="re-img">
          <CardPhotos photos={photos} alt={p.title} />
          {done ? (
            <span className="re-ribbon">{status}</span>
          ) : (
            p.listing && <span className="re-tag">For {String(p.listing).toLowerCase()}</span>
          )}
        </div>

        <div className="re-body">
          <p className="re-price">
            {money(p.price)}
            {isRent(p) && <small> / year</small>}
          </p>
          <h3>{p.title}</h3>
          <p className="re-loc">
            <i>{ICONS.pin}</i>
            <span>{p.location}</span>
          </p>

          {(p.bedrooms || p.bathrooms || p.size) && (
            <div className="re-meta">
              {p.bedrooms ? <span><i>{ICONS.bed}</i>{p.bedrooms} {p.bedrooms === 1 ? "bed" : "beds"}</span> : null}
              {p.bathrooms ? <span><i>{ICONS.bath}</i>{p.bathrooms} {p.bathrooms === 1 ? "bath" : "baths"}</span> : null}
              {p.size ? <span><i>{ICONS.size}</i>{sizeText(p.size)}</span> : null}
            </div>
          )}
        </div>
      </Link>

      <div className="re-acts">
        <button type="button" className="re-share" aria-label="Share this property" onClick={() => onShare(p)}>
          {ICONS.share}
        </button>
        {!done ? (
          <a
            className="re-wa"
            href={waLink(p)}
            target="_blank"
            rel="noreferrer"
            onClick={() => onInquire(p)}
          >
            <span className="re-ico">{ICONS.wa}</span>
            WhatsApp agent
          </a>
        ) : (
          <span className="re-wa off">No longer available</span>
        )}
      </div>
    </article>
  );
}

// The list page
function Listing({ properties, busy, base, money, waLink, onInquire, onShare }) {
  const [type, setType] = useState("All");
  const [listing, setListing] = useState("All");
  const [beds, setBeds] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");

  const search = q.trim().toLowerCase();

  // Price options come from what is really for sale or rent right now
  const inScope = properties.filter(
    (p) => listing === "All" || String(p.listing || "").toLowerCase() === listing.toLowerCase()
  );
  const steps = priceSteps(inScope);

  // Match on small letters, so "House" and "house" both work
  const filtered = properties.filter((p) => {
    const okType = type === "All" || String(p.type || "").toLowerCase() === type.toLowerCase();
    const okListing =
      listing === "All" || String(p.listing || "").toLowerCase() === listing.toLowerCase();
    const okBeds = !beds || Number(p.bedrooms || 0) >= beds;
    const okPrice = !maxPrice || Number(p.price) <= maxPrice;
    const text = `${p.title || ""} ${p.location || ""}`.toLowerCase();
    return okType && okListing && okBeds && okPrice && text.includes(search);
  });

  // "Newest" keeps the order the server sends
  const shown =
    sort === "low"
      ? [...filtered].sort((a, b) => Number(a.price) - Number(b.price))
      : sort === "high"
      ? [...filtered].sort((a, b) => Number(b.price) - Number(a.price))
      : filtered;

  const active = type !== "All" || listing !== "All" || beds > 0 || maxPrice > 0 || search !== "";

  function clearAll() {
    setType("All");
    setListing("All");
    setBeds(0);
    setMaxPrice(0);
    setQ("");
  }

  // Sale prices and rent prices are very different, so start the price filter again
  function pickListing(l) {
    setListing(l);
    setMaxPrice(0);
  }

  return (
    <>
      <section className="re-search">
        <div className="re-seg">
          {LISTINGS.map((l) => (
            <button key={l} className={listing === l ? "on" : ""} onClick={() => pickListing(l)}>
              {l === "All" ? "All" : "For " + l.toLowerCase()}
            </button>
          ))}
        </div>

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

        <div className="re-filters">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type">
            <option value="All">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select value={beds} onChange={(e) => setBeds(Number(e.target.value))} aria-label="Bedrooms">
            <option value={0}>Any bedrooms</option>
            {BEDS.map((n) => (
              <option key={n} value={n}>{n}+ bedrooms</option>
            ))}
          </select>

          {steps.length > 0 && (
            <select value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} aria-label="Highest price">
              <option value={0}>Any price</option>
              {steps.map((s) => (
                <option key={s} value={s}>Up to {money(s)}</option>
              ))}
            </select>
          )}
        </div>
      </section>

      <main className="re-main">
        <div className="re-head-row">
          <h2>Properties</h2>
          {!busy && properties.length > 0 && (
            <div className="re-tools">
              <span className="re-found">{shown.length} shown</span>
              {active && (
                <button type="button" className="re-clear" onClick={clearAll}>Clear</button>
              )}
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
          <div className="re-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : shown.length === 0 ? (
          <div className="re-empty">
            <p>
              {properties.length === 0
                ? "No properties are listed yet. Please check back soon."
                : "No property matches your search."}
            </p>
            {properties.length > 0 && (
              <button type="button" className="re-clear solid" onClick={clearAll}>Clear filters</button>
            )}
          </div>
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
                  onShare={onShare}
                />
              </Reveal>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// ---------- One property ----------

function Detail({ properties, busy, base, money, waLink, onInquire, onShare, agent }) {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (busy) {
    return (
      <main className="re-main">
        <div className="re-sk re-sk-img" />
        <div className="re-sk re-sk-line w50" />
        <div className="re-sk re-sk-line w80" />
      </main>
    );
  }

  const p = properties.find((x) => String(x.id) === String(id));

  if (!p) {
    return (
      <main className="re-main">
        <div className="re-empty">
          <p>That property is no longer listed.</p>
          <Link className="re-clear solid" to={withQuery(base || "/")}>See all properties</Link>
        </div>
      </main>
    );
  }

  const status = p.status || "Available";
  const photos = p.photos || [];
  const hasFacts = p.bedrooms || p.bathrooms || p.size;
  const done = status !== "Available";

  const back = (
    <Link
      className="re-gal-back"
      to={withQuery(base || "/")}
      aria-label="Back to all properties"
      onClick={(e) => e.stopPropagation()}
    >
      {ICONS.left}
    </Link>
  );

  return (
    <div className="re-page" key={id}>
      <Gallery photos={photos} back={back} />

      <main className="re-main re-detail">
        <div className="re-pills">
          {p.listing && <span className="re-pill dark">For {String(p.listing).toLowerCase()}</span>}
          {p.type && <span className="re-pill">{p.type}</span>}
          {done && <span className="re-pill red">{status}</span>}
        </div>

        <p className="re-price big">
          {money(p.price)}
          {isRent(p) && <small> / year</small>}
        </p>
        <h1>{p.title}</h1>
        <p className="re-loc">
          <i>{ICONS.pin}</i>
          <span>{p.location}</span>
        </p>

        {hasFacts && (
          <div className="re-facts">
            {p.bedrooms ? (
              <span><i>{ICONS.bed}</i><b>{p.bedrooms}</b> {p.bedrooms === 1 ? "bed" : "beds"}</span>
            ) : null}
            {p.bathrooms ? (
              <span><i>{ICONS.bath}</i><b>{p.bathrooms}</b> {p.bathrooms === 1 ? "bath" : "baths"}</span>
            ) : null}
            {p.size ? <span><i>{ICONS.size}</i><b>{sizeText(p.size)}</b></span> : null}
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

        <Reveal delay={80}>
          <section className="re-agent">
            <span className="re-av">{agent.logo ? <img src={agent.logo} alt="" /> : (agent.name || "A")[0]}</span>
            <div className="re-agent-txt">
              <small>Listed by</small>
              <b>{agent.name}</b>
              {agent.about && <p>{agent.about.length > 150 ? agent.about.slice(0, 150).trim() + "..." : agent.about}</p>}
              {agent.phone && (
                <a className="re-call" href={`tel:${agent.phone}`}>
                  <i>{ICONS.phone}</i>
                  Call {agent.phone}
                </a>
              )}
            </div>
          </section>
        </Reveal>
      </main>

      {/* Always within thumb reach while they scroll */}
      <div className="re-bar">
        <button type="button" className="re-share" aria-label="Share this property" onClick={() => onShare(p)}>
          {ICONS.share}
        </button>
        {!done ? (
          <a
            className="re-wa"
            href={waLink(p)}
            target="_blank"
            rel="noreferrer"
            onClick={() => onInquire(p)}
          >
            <span className="re-ico">{ICONS.wa}</span>
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
    return (
      <div className="re">
        <div className="re-head">
          <span className="re-sk re-sk-logo" />
          <span className="re-sk re-sk-btn" />
        </div>
        <div className="re-hero re-hero-sk" />
        <main className="re-main">
          <div className="re-grid">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </main>
      </div>
    );
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

  // The phone's own share sheet. If it is missing, share to WhatsApp.
  function onShare(p) {
    const url = `${window.location.origin}${basePath}/property/${p.id}${window.location.search}`;
    const text = `${p.title} - ${money(p.price)}${isRent(p) ? " / year" : ""}, ${p.location}`;

    if (navigator.share) {
      navigator.share({ title: p.title, text, url }).catch(() => {
        // They closed the share sheet. Nothing to do.
      });
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
  }

  const agent = {
    name: store.name,
    logo: store.logo,
    about: store.about,
    phone: store.phone,
  };

  const shared = { properties, busy, base: basePath, money, waLink, onInquire, onShare, agent };

  return (
    <div className="re">
      <header className="re-head">
        <Link className="re-logo" to={withQuery(basePath || "/")}>
          {store.logo ? <img src={store.logo} alt="" /> : <i>{(store.name || "R")[0]}</i>}
          <span>{store.name}</span>
        </Link>
        <a className="re-cta" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
          <span className="re-ico">{ICONS.wa}</span>
          WhatsApp
        </a>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Label, headline and one slim line of real numbers */}
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
                  {!busy && <HeroLine properties={properties} />}
                </div>
              </section>

              <Listing {...shared} />

              <Why name={store.name} />
              <AboutUs name={store.name} logo={store.logo} about={store.about} />
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