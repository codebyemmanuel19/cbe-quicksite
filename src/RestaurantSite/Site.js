import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import "./Site.css";

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

const isAvailable = (d) => (d.status || "Available") === "Available";

// Small line icons
const ICONS = {
  bag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
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
  { title: "Choose your meals", text: "Browse the menu and tap Add on everything you want." },
  { title: "Send it on WhatsApp", text: "Your whole order goes to the restaurant in one message." },
  { title: "Get your food", text: "They confirm the total and delivery fee, then you pay and eat." },
];

// The cart is remembered on this phone, so a refresh never loses the order
function useCart(slug) {
  const key = `qs-cart-${slug}`;
  const [cart, setCart] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setCart(JSON.parse(raw) || {});
    } catch {
      // Storage can be blocked. The cart still works until the page closes.
    }
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [key, cart]);

  const change = (id, by) =>
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] || 0) + by) };
      if (!next[id]) delete next[id];
      return next;
    });

  return { cart, change, clear: () => setCart({}) };
}

// Add button that turns into - 1 + once the dish is in the order
function Adder({ qty, onChange, name }) {
  if (!qty) {
    return (
      <button className="rs-add" onClick={() => onChange(1)} aria-label={`Add ${name}`}>
        Add
      </button>
    );
  }

  return (
    <div className="rs-step">
      <button onClick={() => onChange(-1)} aria-label={`Remove one ${name}`}>−</button>
      <b>{qty}</b>
      <button onClick={() => onChange(1)} aria-label={`Add one more ${name}`}>+</button>
    </div>
  );
}

// One dish on the menu
function Dish({ d, qty, money, onChange }) {
  const ok = isAvailable(d);

  return (
    <article className={ok ? "rs-dish" : "rs-dish off"}>
      <div className="rs-dish-text">
        <h3>{d.name}</h3>
        {d.description && <p>{d.description}</p>}
        <span className="rs-price">{money(d.price)}</span>
      </div>

      <div className="rs-dish-side">
        {d.photo && (
          <div className="rs-dish-img" style={{ backgroundImage: `url("${d.photo}")` }}>
            {!ok && <span className="rs-out">Sold out</span>}
          </div>
        )}

        {ok ? (
          <Adder qty={qty} onChange={(by) => onChange(d.id, by)} name={d.name} />
        ) : (
          !d.photo && <span className="rs-out plain">Sold out</span>
        )}
      </div>
    </article>
  );
}

// The sheet that slides up with the order, ready to send
function OrderSheet({ lines, total, money, store, phone, onChange, onClose, onSent }) {
  const [mode, setMode] = useState("Delivery");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // The page behind should not scroll while the sheet is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function send() {
    if (!name.trim()) return setError("Please enter your name.");
    if (mode === "Delivery" && !address.trim()) return setError("Please enter your delivery address.");
    if (!phone) return setError("This restaurant has not added a WhatsApp number yet.");
    setError("");

    const rows = lines.map((l) => `${l.qty} x ${l.d.name} - ${money(l.d.price * l.qty)}`);
    const text = [
      `Hello ${store.name}, I would like to order:`,
      "",
      ...rows,
      "",
      `Total: ${money(total)}`,
      mode === "Delivery" ? `Delivery to: ${address.trim()}` : "I will pick it up",
      `Name: ${name.trim()}`,
      note.trim() ? `Note: ${note.trim()}` : null,
    ]
      .filter((x) => x !== null)
      .join("\n");

    onSent({
      name: name.trim(),
      summary: `Order: ${lines.map((l) => `${l.qty}x ${l.d.name}`).join(", ")} - ${money(total)}`,
      firstId: lines[0].d.id,
    });

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  return createPortal(
    <div className="rs rs-layer">
      <div className="rs-shade" onClick={onClose} />

      <div className="rs-sheet" role="dialog" aria-label="Your order">
        <div className="rs-sheet-head">
          <h2>Your order</h2>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="rs-sheet-body">
          <ul className="rs-lines">
            {lines.map((l) => (
              <li key={l.d.id}>
                <div>
                  <b>{l.d.name}</b>
                  <span>{money(l.d.price * l.qty)}</span>
                </div>
                <Adder qty={l.qty} onChange={(by) => onChange(l.d.id, by)} name={l.d.name} />
              </li>
            ))}
          </ul>

          <div className="rs-total">
            <span>Total</span>
            <b>{money(total)}</b>
          </div>
          <p className="rs-hint">Delivery fee, if any, is confirmed on WhatsApp.</p>

          <label>How do you want it?</label>
          <div className="rs-seg">
            {["Delivery", "Pickup"].map((m) => (
              <button key={m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>

          <label>Your name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ada" />

          {mode === "Delivery" && (
            <>
              <label>Delivery address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={140} placeholder="House number, street, area" />
            </>
          )}

          <label>Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Less pepper, extra plate, call when you arrive..." />
        </div>

        <div className="rs-sheet-bar">
          {error && <p className="rs-err">{error}</p>}
          <button className="rs-send" onClick={send}>
            <span className="rs-ico">{ICONS.wa}</span>
            Send order on WhatsApp · {money(total)}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Steps({ name }) {
  return (
    <section className="rs-steps">
      <div className="rs-wrap">
        <h2>How ordering from {name} works</h2>

        <ol className="rs-steps-list">
          {STEPS.map((st, n) => (
            <li key={st.title}>
              <span className="rs-step-n">{n + 1}</span>
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

// The restaurant's own About text, written in Business Info
function AboutUs({ name, about, address }) {
  if (!about && !address) return null;

  const map = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "";

  return (
    <section className="rs-about">
      <div className="rs-wrap rs-about-in">
        <div>
          <h2>About {name}</h2>
          {about && <p>{about}</p>}
        </div>

        {address && (
          <a className="rs-where" href={map} target="_blank" rel="noreferrer">
            <span className="rs-ico">{ICONS.pin}</span>
            <span>
              <small>Find us</small>
              {address}
            </span>
          </a>
        )}
      </div>
    </section>
  );
}

// The public website for a restaurant. It loads its own data, like your other sites.
export default function RestaurantSite({ basePath = "", slug: slugProp }) {
  const { slug, store, loading, notFound } = useShop(slugProp);
  const [dishes, setDishes] = useState([]);
  const [busy, setBusy] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("");
  const { cart, change, clear } = useCart(slug);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    api.get(`/public/shop/${slug}/dishes`)
      .then((res) => {
        // Never let a bad answer turn this into undefined
        if (!cancelled) setDishes(Array.isArray(res?.dishes) ? res.dishes : []);
      })
      .catch(() => {
        // The page still opens, it just shows an empty menu
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const search = q.trim().toLowerCase();

  // Groups keep the order the owner added them in
  const groups = useMemo(() => {
    const order = [];
    const map = {};
    dishes.forEach((d) => {
      if (search && !`${d.name} ${d.description || ""}`.toLowerCase().includes(search)) return;
      const cat = String(d.category || "").trim() || "Menu";
      if (!map[cat]) {
        map[cat] = [];
        order.push(cat);
      }
      map[cat].push(d);
    });
    return order.map((cat) => ({ cat, items: map[cat] }));
  }, [dishes, search]);

  // Highlights the category you are reading as you scroll
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-cat]");
    if (!nodes.length || typeof IntersectionObserver === "undefined") return undefined;

    const seen = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveCat(e.target.getAttribute("data-cat"));
        });
      },
      { rootMargin: "-120px 0px -65% 0px" }
    );

    nodes.forEach((n) => seen.observe(n));
    return () => seen.disconnect();
  }, [groups]);

  const lines = useMemo(
    () =>
      dishes
        .filter((d) => cart[d.id] > 0 && isAvailable(d))
        .map((d) => ({ d, qty: cart[d.id] })),
    [dishes, cart]
  );

  if (loading) {
    return <div className="rs-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="rs-loading">
        <h1>Website not found</h1>
        <p>This website address doesn't belong to any restaurant.</p>
      </div>
    );
  }

  const phone = (store.whatsapp || "").replace(/\D/g, "");
  const hero = store.hero || {};
  const money = (n) => formatPrice(n, store.symbol);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * Number(l.d.price), 0);

  // Only the ones the owner actually filled in
  const socials = [
    { name: "Instagram", url: socialUrl("instagram", store.instagram) },
    { name: "TikTok", url: socialUrl("tiktok", store.tiktok) },
    { name: "Facebook", url: socialUrl("facebook", store.facebook) },
  ].filter((s) => s.url);

  function jump(cat) {
    const el = document.getElementById(`cat-${cat.replace(/\W+/g, "-")}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Save the order so the owner sees it in the dashboard, then WhatsApp opens
  function onSent({ name, summary, firstId }) {
    api.post(`/public/shop/${slug}/inquiries`, {
      propertyId: firstId,
      propertyTitle: summary,
      name,
    }).catch(() => {
      // Never stop the customer from reaching WhatsApp
    });

    clear();
    setOpen(false);
  }

  return (
    <div className="rs">
      <header className="rs-head">
        <Link className="rs-logo" to={withQuery(basePath || "/")}>
          {store.logo ? <img src={store.logo} alt="" /> : <i>{(store.name || "R")[0]}</i>}
          <span>{store.name}</span>
        </Link>

        <button className="rs-cart" onClick={() => count > 0 && setOpen(true)} aria-label="Open your order">
          <span className="rs-ico">{ICONS.bag}</span>
          {count > 0 ? <b>{count}</b> : <span className="rs-cart-empty">Order</span>}
        </button>
      </header>

      <section
        className="rs-hero"
        style={
          hero.image
            ? { backgroundImage: `linear-gradient(rgba(20,32,26,.72),rgba(20,32,26,.9)),url(${hero.image})` }
            : {}
        }
      >
        <div className="rs-hero-in">
          {hero.label && <span className="rs-badge">{hero.label}</span>}
          <h1>{hero.headline || `Good food from ${store.name}`}</h1>

          <div className="rs-hero-acts">
            <button
              className="rs-hero-main"
              onClick={() => menuRef.current && menuRef.current.scrollIntoView({ behavior: "smooth" })}
            >
              See the menu
            </button>

            {phone && (
              <a className="rs-hero-alt" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <div ref={menuRef} className="rs-menu-top" />

      {!busy && dishes.length > 0 && (
        <nav className="rs-cats" aria-label="Menu sections">
          <div className="rs-cats-in">
            <label className="rs-find">
              <span className="rs-ico">{ICONS.search}</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the menu" />
            </label>

            <div className="rs-cat-list">
              {groups.map((g) => (
                <button key={g.cat} className={activeCat === g.cat ? "on" : ""} onClick={() => jump(g.cat)}>
                  {g.cat}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      <main className="rs-main">
        {busy ? (
          <p className="rs-empty">Loading the menu...</p>
        ) : dishes.length === 0 ? (
          <p className="rs-empty">The menu is not ready yet. Check back soon.</p>
        ) : groups.length === 0 ? (
          <p className="rs-empty">Nothing matches that. Try another word.</p>
        ) : (
          groups.map((g) => (
            <section
              key={g.cat}
              id={`cat-${g.cat.replace(/\W+/g, "-")}`}
              data-cat={g.cat}
              className="rs-group"
            >
              <h2>{g.cat}</h2>
              <div className="rs-dishes">
                {g.items.map((d) => (
                  <Dish key={d.id} d={d} qty={cart[d.id] || 0} money={money} onChange={change} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <Steps name={store.name} />
      <AboutUs name={store.name} about={store.about} address={store.address} />

      <footer className="rs-foot">
        <div className="rs-foot-in">
          <b className="rs-foot-name">{store.name}</b>

          <div className="rs-foot-contact">
            {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
            {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
            {phone && (
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="rs-foot-social">
              {socials.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noreferrer">{s.name}</a>
              ))}
            </div>
          )}
        </div>

        <div className="rs-foot-bottom">
          <small>© {new Date().getFullYear()} {store.name}</small>
          <small>Powered by CBE QuickSite</small>
        </div>
      </footer>

      {/* Always within thumb reach once something is in the order */}
      {count > 0 && !open && (
        <div className="rs-bar">
          <button onClick={() => setOpen(true)}>
            <span className="rs-bar-count">{count}</span>
            <span>View your order</span>
            <b>{money(total)}</b>
          </button>
        </div>
      )}

      {open && count > 0 && (
        <OrderSheet
          lines={lines}
          total={total}
          money={money}
          store={store}
          phone={phone}
          onChange={change}
          onClose={() => setOpen(false)}
          onSent={onSent}
        />
      )}
    </div>
  );
}