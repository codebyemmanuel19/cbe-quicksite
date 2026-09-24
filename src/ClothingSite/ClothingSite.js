import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import ClothingFooter from "./ClothingFooter";
import "./ClothingSite.css";

// Fake store until the backend is connected.
// Swap the picsum links for real product photos to see the true look.
const store = {
  slug: "kemisboutique",
  name: "Kemi's Boutique",
  whatsapp: "2348012345678",
  phoneCode: "234",
  instagram: "kemisboutique",
  about: "Handmade Nigerian womenswear, designed in Lagos for everyday confidence.",
  email: "hello@kemisboutique.com",
  phone: "0801 234 5678",
  address: "Shop 12, Admiralty Mall, Lekki Phase 1, Lagos",
  facebook: "kemisboutique",
  tiktok: "kemisboutique",
  hero: {
    image: "https://picsum.photos/seed/cbe-hero/1200/1800",
    label: "New collection",
    headline: "The Weekend Edit",
  },
  categories: ["Dresses", "Tops", "Two-piece", "Bags"],
  settings: {
    payOnDelivery: true,
    deliveryFeeFirst: false,
    payBeforeDelivery: true,
    bank: { bankName: "GTBank", accountNumber: "0123456789", accountName: "Kemi's Boutique" },
    offersDelivery: true,
    areas: [
      { name: "Lekki", fee: 2500 },
      { name: "Ikeja", fee: 3000 },
      { name: "Yaba", fee: 2000 },
    ],
    offersPickup: true,
    pickupAddress: "Shop 12, Admiralty Mall, Lekki Phase 1",
  },
  products: [
    { id: 1, name: "Adire Wrap Dress", price: 24500, category: "Dresses", tag: "Most loved",
      sizes: ["S", "M", "L", "XL"], colors: ["Indigo", "Rust"],
      description: "Hand-dyed adire wrap dress with a tie waist and flutter sleeves. Lightweight cotton, made in Lagos.",
      photos: ["https://picsum.photos/seed/cbe-p1a/600/800", "https://picsum.photos/seed/cbe-p1b/600/800", "https://picsum.photos/seed/cbe-p1c/600/800"] },
    { id: 2, name: "Linen Two-Piece Set", price: 32000, category: "Two-piece", tag: "New",
      sizes: ["S", "M", "L", "XL"], colors: ["Sand", "Olive"],
      description: "Relaxed linen shirt and wide-leg trousers. Breathable, easy to style together or apart.",
      photos: ["https://picsum.photos/seed/cbe-p2a/600/800", "https://picsum.photos/seed/cbe-p2b/600/800"] },
    { id: 3, name: "Silk Cami Top", price: 12500, category: "Tops", tag: "",
      sizes: ["S", "M", "L"], colors: ["Black", "Champagne"],
      description: "Soft satin cami with adjustable straps. Wear it alone or under a blazer.",
      photos: ["https://picsum.photos/seed/cbe-p3a/600/800", "https://picsum.photos/seed/cbe-p3b/600/800", "https://picsum.photos/seed/cbe-p3c/600/800"] },
    { id: 4, name: "Puff Sleeve Mini Dress", price: 27000, category: "Dresses", tag: "Pre-order",
      sizes: ["S", "M", "L"], colors: ["White"],
      description: "Structured mini dress with statement puff sleeves. Ships in 7 to 10 days.",
      photos: ["https://picsum.photos/seed/cbe-p4a/600/800", "https://picsum.photos/seed/cbe-p4b/600/800"] },
    { id: 5, name: "Raffia Tote Bag", price: 15000, category: "Bags", tag: "",
      sizes: [], colors: ["Natural"], soldOut: true,
      description: "Hand-woven raffia tote with leather handles.",
      photos: ["https://picsum.photos/seed/cbe-p5a/600/800"] },
    { id: 6, name: "Ankara Midi Dress", price: 29500, category: "Dresses", tag: "New",
      sizes: ["S", "M", "L", "XL"], colors: [],
      description: "Bold ankara print midi with a fitted bodice and flared skirt.",
      photos: ["https://picsum.photos/seed/cbe-p6a/600/800", "https://picsum.photos/seed/cbe-p6b/600/800", "https://picsum.photos/seed/cbe-p6c/600/800"] },
  ],
};

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

const MAX_QTY = 20;

/* ---------- Helpers ---------- */

const cartKey = `cbe-cart-${store.slug}`;
const lastOrderKey = `cbe-last-order-${store.slug}`;

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    return [];
  }
}

// Accepts "0801 234 5678" or "+234 801..." and returns "2348012345678", or "" if invalid
function normalizePhone(input, code) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith(code) && digits.length > 10) digits = digits.slice(code.length);
  digits = digits.replace(/^0+/, "");
  return digits.length >= 7 && digits.length <= 12 ? code + digits : "";
}

function itemDetails(item) {
  return [item.size && `Size ${item.size}`, item.color].filter(Boolean).join(", ");
}

// The full order, typed out for WhatsApp
function buildOrderMessage(order) {
  const d = order.delivery;
  const lines = [
    `Hi ${store.name}, I just placed an order on your website.`,
    "",
    `Order #${order.id}`,
    ...order.items.map((i) => {
      const details = itemDetails(i);
      return `• ${i.name}${details ? ` (${details})` : ""} × ${i.qty} = ${formatPrice(i.price * i.qty)}`;
    }),
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Delivery fee: ${d.type === "pickup" ? "Free" : d.fee === null ? "To be confirmed" : formatPrice(d.fee)}`,
    `Total: ${formatPrice(order.total)}${d.type === "delivery" && d.fee === null ? " + delivery" : ""}`,
    "",
    `Name: ${order.customer.name}`,
    `Phone: +${order.customer.phone}`,
    `Address: ${d.type === "pickup" ? "Pickup" : `${d.area}, ${d.address}`}`,
    `Payment: ${order.payment === "before" ? "Bank transfer" : d.type === "pickup" ? "Pay at pickup" : "Pay on delivery"}`,
  ];
  if (order.note) lines.push(`Note: ${order.note}`);
  return lines.join("\n");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(box);
    return ok;
  }
}

/* ---------- Small pieces ---------- */

// Photos you can swipe left and right, with dots
function PhotoCarousel({ photos, alt }) {
  const [index, setIndex] = useState(0);

  function handleScroll(e) {
    const el = e.currentTarget;
    const current = Math.round(el.scrollLeft / el.clientWidth);
    if (current !== index) setIndex(current);
  }

  return (
    <div className="cs-photo">
      <div className="cs-track" onScroll={handleScroll}>
        {photos.map((src, i) => (
          <img key={i} src={src} alt={alt} loading="lazy" draggable={false} />
        ))}
      </div>
      {photos.length > 1 && (
        <div className="cs-dots">
          {photos.map((_, i) => (
            <span key={i} className={i === index ? "cs-dot on" : "cs-dot"} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, basePath }) {
  return (
    <Link to={`${basePath}/product/${product.id}`} className="cs-card">
      <PhotoCarousel photos={product.photos} alt={product.name} />
      <p className="cs-name">{product.name}</p>
      <p className="cs-price">{formatPrice(product.price)}</p>
      {product.soldOut ? (
        <p className="cs-tag sold">Sold out</p>
      ) : (
        product.tag && <p className="cs-tag">{product.tag}</p>
      )}
    </Link>
  );
}

function BagDrawer({ open, onClose, cart, updateQty, basePath }) {
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <>
      {open && <div className="cs-overlay" onClick={onClose} />}
      <aside className={open ? "cs-bag-drawer open" : "cs-bag-drawer"}>
        <div className="cs-bag-head">
          <h2>Your bag</h2>
          <button className="cs-close" onClick={onClose} aria-label="Close bag">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="cs-muted">Your bag is empty.</p>
        ) : (
          <>
            <div className="cs-bag-items">
              {cart.map((item) => (
                <div key={item.key} className="cs-bag-item">
                  <img src={item.photo} alt={item.name} />
                  <div className="cs-bag-info">
                    <p className="cs-name">{item.name}</p>
                    {itemDetails(item) && <p className="cs-muted">{itemDetails(item)}</p>}
                    <p className="cs-price">{formatPrice(item.price)}</p>
                    <div className="cs-qty">
                      <button onClick={() => updateQty(item.key, -1)} aria-label="Less">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)} aria-label="More">+</button>
                    </div>
                  </div>
                  <button className="cs-remove" onClick={() => updateQty(item.key, -item.qty)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cs-bag-foot">
              <div className="cs-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cs-muted">Delivery is added at checkout.</p>
              <button
                className="cs-btn"
                onClick={() => {
                  onClose();
                  navigate(`${basePath}/checkout`);
                }}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ---------- Pages ---------- */

function HomePage({ basePath, category, setCategory }) {
  const [sort, setSort] = useState("featured");
  const shopRef = useRef(null);
  const location = useLocation();

  // "Shop now" and the menu links land here with #shop
  useEffect(() => {
    if (location.hash === "#shop" && shopRef.current) {
      shopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.key, location.hash]);

  let shown = category === "All"
    ? store.products
    : store.products.filter((p) => p.category === category);
  if (sort === "low") shown = [...shown].sort((a, b) => a.price - b.price);
  if (sort === "high") shown = [...shown].sort((a, b) => b.price - a.price);

  return (
    <>
      <section className="cs-hero" style={{ backgroundImage: `url(${store.hero.image})` }}>
        <div className="cs-hero-text">
          <p className="cs-hero-label">{store.hero.label}</p>
          <h1 className="cs-hero-title">{store.hero.headline}</h1>
          <Link className="cs-hero-btn" to={`${basePath}/#shop`}>Shop now</Link>
        </div>
      </section>

      <section className="cs-shop" ref={shopRef}>
        <div className="cs-cats">
          {["All", ...store.categories].map((c) => (
            <button
              key={c}
              className={category === c ? "cs-cat active" : "cs-cat"}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="cs-bar">
          <span>Items: {shown.length}</span>
          <label className="cs-sort">
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="cs-grid">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} basePath={basePath} />
          ))}
        </div>
      </section>
    </>
  );
}

function ProductPage({ basePath, addToCart }) {
  const { id } = useParams();
  const product = store.products.find((p) => String(p.id) === id);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");

  // Start fresh when moving to another product
  useEffect(() => {
    setSize("");
    setColor("");
    setError("");
  }, [id]);

  if (!product) {
    return (
      <div className="cs-page">
        <p>Product not found.</p>
        <Link className="cs-link" to={`${basePath}/#shop`}>Back to shop</Link>
      </div>
    );
  }

  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const chosenColor = color || (colors.length === 1 ? colors[0] : "");
  const related = store.products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  function handleAdd() {
    if (sizes.length > 0 && !size) return setError("Please choose a size.");
    if (colors.length > 1 && !color) return setError("Please choose a colour.");
    setError("");
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      photo: product.photos[0],
      size,
      color: chosenColor,
    });
  }

  const details = [size && `Size ${size}`, chosenColor].filter(Boolean).join(", ");
  const waText = `Hi ${store.name}, I'd like to order the ${product.name}${
    details ? ` (${details})` : ""
  } for ${formatPrice(product.price)}. Is it available?`;

  return (
    <div className="cs-product">
      <PhotoCarousel key={product.id} photos={product.photos} alt={product.name} />

      <div className="cs-product-info">
        {product.tag && !product.soldOut && <p className="cs-tag">{product.tag}</p>}
        <h1 className="cs-product-name">{product.name}</h1>
        <p className="cs-product-price">{formatPrice(product.price)}</p>

        {colors.length > 1 && (
          <div className="cs-options">
            <p className="cs-label">Colour{color ? `: ${color}` : ""}</p>
            <div className="cs-chips">
              {colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "cs-chip active" : "cs-chip"}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="cs-options">
            <p className="cs-label">Size{size ? `: ${size}` : ""}</p>
            <div className="cs-chips">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "cs-chip active" : "cs-chip"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="cs-error">{error}</p>}

        {product.soldOut ? (
          <button className="cs-btn" disabled>Sold out</button>
        ) : (
          <button className="cs-btn" onClick={handleAdd}>Add to bag</button>
        )}

        <a
          className="cs-btn outline"
          href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noreferrer"
        >
          Order on WhatsApp
        </a>

        {product.description && (
          <div className="cs-desc">
            <p className="cs-label">Details</p>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="cs-related">
          <h2 className="cs-section-title">You may also like</h2>
          <div className="cs-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} basePath={basePath} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CheckoutPage({ basePath, cart, clearCart }) {
  const navigate = useNavigate();
  const s = store.settings;
  const [form, setForm] = useState({
    name: "",
    phone: "",
    method: s.offersDelivery ? "delivery" : "pickup",
    area: "",
    address: "",
    payment: s.payOnDelivery ? "pod" : "before",
    note: "",
  });
  const [error, setError] = useState("");
  const [trap, setTrap] = useState(""); // hidden field that only bots fill in
  const [openedAt] = useState(() => Date.now());
  const [placing, setPlacing] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="cs-page">
        <h1 className="cs-page-title">Checkout</h1>
        <p className="cs-muted">Your bag is empty.</p>
        <Link className="cs-btn" to={`${basePath}/#shop`}>Continue shopping</Link>
      </div>
    );
  }

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const areaInfo = s.areas.find((a) => a.name === form.area);
  // null means the fee isn't known yet (no area picked, or "not listed")
  const fee = form.method === "pickup" ? 0 : areaInfo ? areaInfo.fee : null;
  const total = subtotal + (fee || 0);

  function feeText() {
    if (form.method === "pickup") return "Free";
    if (fee !== null) return formatPrice(fee);
    return form.area === "other" ? "To be confirmed" : "Choose area";
  }

  function placeOrder() {
    if (placing) return;
    setError("");

    // Bot checks: people never fill the hidden field, and take longer than 3 seconds
    if (trap || Date.now() - openedAt < 3000) {
      return setError("Something went wrong. Please try again.");
    }

    const name = form.name.trim().slice(0, 80);
    if (name.length < 2) return setError("Enter your name.");
    if (/https?:\/\/|www\./i.test(name)) return setError("Enter a valid name.");

    const phone = normalizePhone(form.phone, store.phoneCode);
    if (!phone) return setError("Enter a valid phone number.");

    const address = form.address.trim().slice(0, 300);
    if (form.method === "delivery") {
      if (!form.area) return setError("Choose your delivery area.");
      if (address.length < 5) return setError("Enter your delivery address.");
    }

    setPlacing(true);

    // Later the backend saves this, checks it again and works out the real totals itself
    const order = {
      id: Math.floor(1000 + Math.random() * 9000),
      items: cart,
      customer: { name, phone },
      delivery:
        form.method === "delivery"
          ? {
              type: "delivery",
              area: form.area === "other" ? "Area not listed" : form.area,
              address,
              fee,
            }
          : { type: "pickup" },
      payment: form.payment,
      subtotal,
      total,
      note: form.note.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(lastOrderKey, JSON.stringify(order));
    } catch {
      // storage full or blocked: the order still shows via navigation state
    }
    clearCart();
    navigate(`${basePath}/done`, { state: { order } });
  }

  return (
    <div className="cs-page">
      <h1 className="cs-page-title">Checkout</h1>

      <div className="cs-box">
        <p className="cs-label">Your order</p>
        {cart.map((i) => (
          <div key={i.key} className="cs-summary-row">
            <span>{i.name}{i.size ? ` · ${i.size}` : ""} × {i.qty}</span>
            <span>{formatPrice(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="cs-summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        <div className="cs-summary-row"><span>Delivery</span><span>{feeText()}</span></div>
        <div className="cs-summary-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
      </div>

      <div className="cs-box">
        <p className="cs-label">Your details</p>
        <label className="cs-field">
          <span>Full name</span>
          <input
            value={form.name}
            maxLength={80}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>
        <div className="cs-field">
          <span>Phone number (WhatsApp)</span>
          <div className="cs-phone">
            <b>+{store.phoneCode}</b>
            <input
              type="tel"
              value={form.phone}
              maxLength={20}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="801 234 5678"
            />
          </div>
        </div>

        {/* Hidden bot trap: customers never see this field, spam bots fill it */}
        <input
          className="cs-trap"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <div className="cs-box">
        <p className="cs-label">How do you want it?</p>
        <div className="cs-choices">
          {s.offersDelivery && (
            <button
              type="button"
              className={form.method === "delivery" ? "cs-choice active" : "cs-choice"}
              onClick={() => update("method", "delivery")}
            >
              Delivery <small>We bring it to you</small>
            </button>
          )}
          {s.offersPickup && (
            <button
              type="button"
              className={form.method === "pickup" ? "cs-choice active" : "cs-choice"}
              onClick={() => update("method", "pickup")}
            >
              Pickup <small>{s.pickupAddress}</small>
            </button>
          )}
        </div>

        {form.method === "delivery" && (
          <>
            <label className="cs-field">
              <span>Delivery area</span>
              <select value={form.area} onChange={(e) => update("area", e.target.value)}>
                <option value="">Choose your area</option>
                {s.areas.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({formatPrice(a.fee)})
                  </option>
                ))}
                <option value="other">My area isn't listed</option>
              </select>
            </label>
            {form.area === "other" && (
              <p className="cs-muted">{store.name} will confirm your delivery fee on WhatsApp.</p>
            )}
            <label className="cs-field">
              <span>Delivery address</span>
              <textarea
                rows={2}
                maxLength={300}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="House number, street, landmark"
              />
            </label>
          </>
        )}
      </div>

      <div className="cs-box">
        <p className="cs-label">Payment</p>
        <div className="cs-choices">
          {s.payOnDelivery && (
            <button
              type="button"
              className={form.payment === "pod" ? "cs-choice active" : "cs-choice"}
              onClick={() => update("payment", "pod")}
            >
              {form.method === "pickup" ? "Pay at pickup" : "Pay on delivery"}
              {s.deliveryFeeFirst && form.method === "delivery" && (
                <small>You'll transfer the delivery fee before dispatch</small>
              )}
            </button>
          )}
          {s.payBeforeDelivery && (
            <button
              type="button"
              className={form.payment === "before" ? "cs-choice active" : "cs-choice"}
              onClick={() => update("payment", "before")}
            >
              Pay now by bank transfer <small>Account details shown after you order</small>
            </button>
          )}
        </div>
      </div>

      <label className="cs-field">
        <span>Note for the seller (optional)</span>
        <textarea
          rows={2}
          maxLength={500}
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
        />
      </label>

      {error && <p className="cs-error">{error}</p>}

      <button className="cs-btn" onClick={placeOrder} disabled={placing}>
        {placing ? "Placing order..." : `Place order · ${formatPrice(total)}`}
      </button>
    </div>
  );
}

function DonePage({ basePath }) {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  let order = location.state?.order;
  if (!order) {
    try {
      order = JSON.parse(localStorage.getItem(lastOrderKey));
    } catch {
      order = null;
    }
  }

  if (!order) {
    return (
      <div className="cs-page">
        <p>No recent order found.</p>
        <Link className="cs-link" to={`${basePath}/#shop`}>Back to shop</Link>
      </div>
    );
  }

  const s = store.settings;
  const isDelivery = order.delivery.type === "delivery";
  const fee = isDelivery ? order.delivery.fee : 0;
  const feeUnknown = isDelivery && fee === null;
  const needsTransfer =
    order.payment === "before" || (order.payment === "pod" && s.deliveryFeeFirst && isDelivery);
  const amountNow = order.payment === "before" ? order.total : fee;

  async function copyAccount() {
    if (await copyText(s.bank.accountNumber)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="cs-page cs-done">
      <p className="cs-done-check">✓</p>
      <h1 className="cs-page-title">Thank you, {order.customer.name.split(" ")[0]}!</h1>
      <p className="cs-muted">Your order #{order.id} has been received.</p>

      {needsTransfer ? (
        <div className="cs-box">
          {feeUnknown ? (
            <p>Don't pay yet. {store.name} will confirm your delivery fee on WhatsApp first.</p>
          ) : (
            <>
              <p className="cs-label">
                {order.payment === "before" ? "Transfer your total" : "Transfer the delivery fee"}
              </p>
              <p className="cs-amount">{formatPrice(amountNow)}</p>
              <div className="cs-bank">
                <p>{s.bank.bankName}</p>
                <p className="cs-acct">
                  {s.bank.accountNumber}
                  <button onClick={copyAccount}>{copied ? "Copied" : "Copy"}</button>
                </p>
                <p>{s.bank.accountName}</p>
              </div>
              <p className="cs-muted">After paying, send your receipt on WhatsApp.</p>
            </>
          )}
        </div>
      ) : (
        <div className="cs-box">
          <p>{store.name} will call you shortly to confirm your order.</p>
        </div>
      )}

      <a
        className="cs-btn wa"
        href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(buildOrderMessage(order))}`}
        target="_blank"
        rel="noreferrer"
      >
        Send order on WhatsApp
      </a>
      <Link className="cs-link" to={`${basePath}/#shop`}>Continue shopping</Link>
    </div>
  );
}

/* ---------- The whole site ---------- */

export default function ClothingSite({ basePath = "/preview/clothing" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cart, setCart] = useState(loadCart);

  const isHome = location.pathname.replace(/\/$/, "") === basePath;
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  // Keep the bag even if the customer refreshes
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch {
      // ignore: the bag just won't survive a refresh
    }
  }, [cart]);

  // The header turns solid white once you scroll past the big photo
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Every new page starts at the top, except jumps to #shop
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  function addToCart(item) {
    const key = `${item.productId}-${item.size}-${item.color}`;
    setCart((current) => {
      const existing = current.find((c) => c.key === key);
      if (existing) {
        return current.map((c) =>
          c.key === key ? { ...c, qty: Math.min(c.qty + 1, MAX_QTY) } : c
        );
      }
      return [...current, { ...item, key, qty: 1 }];
    });
    setBagOpen(true);
  }

  function updateQty(key, change) {
    setCart((current) =>
      current
        .map((c) => (c.key === key ? { ...c, qty: Math.min(c.qty + change, MAX_QTY) } : c))
        .filter((c) => c.qty > 0)
    );
  }

  function goToShop(cat) {
    setCategory(cat);
    setMenuOpen(false);
    navigate(`${basePath}/#shop`);
  }

  return (
    <div className="cs">
      <header className={!isHome || scrolled ? "cs-header solid" : "cs-header"}>
        <button className="cs-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="cs-burger"><span /><span /><span /></span>
        </button>

        <Link to={basePath || "/"} className="cs-logo">{store.name}</Link>

        <button className="cs-icon" onClick={() => setBagOpen(true)} aria-label="Shopping bag">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 8h14l-1 12H6L5 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span>({cartCount})</span>
        </button>
      </header>

      {/* Menu drawer */}
      {menuOpen && <div className="cs-overlay" onClick={() => setMenuOpen(false)} />}
      <nav className={menuOpen ? "cs-drawer open" : "cs-drawer"}>
        <button className="cs-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <button className="cs-drawer-link" onClick={() => goToShop("All")}>Shop all</button>
        {store.categories.map((c) => (
          <button key={c} className="cs-drawer-link" onClick={() => goToShop(c)}>{c}</button>
        ))}
        <a
          className="cs-drawer-wa"
          href={`https://wa.me/${store.whatsapp}`}
          target="_blank"
          rel="noreferrer"
        >
          Chat with us on WhatsApp
        </a>
      </nav>

      <BagDrawer
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        cart={cart}
        updateQty={updateQty}
        basePath={basePath}
      />

      <main className={isHome ? "" : "cs-main"}>
        <Routes>
          <Route
            index
            element={<HomePage basePath={basePath} category={category} setCategory={setCategory} />}
          />
          <Route
            path="product/:id"
            element={<ProductPage basePath={basePath} addToCart={addToCart} />}
          />
          <Route
            path="checkout"
            element={<CheckoutPage basePath={basePath} cart={cart} clearCart={() => setCart([])} />}
          />
          <Route path="done" element={<DonePage basePath={basePath} />} />
        </Routes>
      </main>

      <ClothingFooter store={store} />
    </div>
  );
}