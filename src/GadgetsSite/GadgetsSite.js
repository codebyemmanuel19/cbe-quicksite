import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import { useCart, itemDetails } from "../shop/useCart";
import PhotoCarousel from "../shop/PhotoCarousel";
import Checkout from "../shop/Checkout";
import Done from "../shop/Done";
import GadgetsFooter from "./GadgetsFooter";
import "./GadgetsSite.css";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

function startingPrice(product) {
  const options = product.variants || [];
  return options.length ? Math.min(...options.map((v) => v.price)) : product.price;
}

/* ---------- Pieces that belong to this look ---------- */

function ProductCard({ store, product, basePath }) {
  const hasOptions = (product.variants || []).length > 0;

  return (
    <Link to={`${basePath}/product/${product.id}`} className="gd-card">
      <PhotoCarousel photos={product.photos} alt={product.name} prefix="gd" />
      <div className="gd-card-info">
        {product.category && <p className="gd-cat-label">{product.category}</p>}
        <p className="gd-name">{product.name}</p>
        <p className="gd-price">
          {hasOptions && <span className="gd-from">From </span>}
          {formatPrice(startingPrice(product), store.symbol)}
        </p>
        {product.soldOut ? (
          <span className="gd-tag sold">Out of stock</span>
        ) : (
          product.tag && <span className="gd-tag">{product.tag}</span>
        )}
      </div>
    </Link>
  );
}

function BagDrawer({ store, open, onClose, cart, updateQty, subtotal, basePath }) {
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="gd-overlay" onClick={onClose} />}
      <aside className={open ? "gd-bag-drawer open" : "gd-bag-drawer"}>
        <div className="gd-bag-head">
          <h2>Your bag</h2>
          <button className="gd-close" onClick={onClose} aria-label="Close bag">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="gd-muted">Your bag is empty.</p>
        ) : (
          <>
            <div className="gd-bag-items">
              {cart.map((item) => (
                <div key={item.key} className="gd-bag-item">
                  <div className="gd-bag-img">
                    <img src={item.photo} alt={item.name} />
                  </div>
                  <div className="gd-bag-info">
                    <p className="gd-name">{item.name}</p>
                    {itemDetails(item) && <p className="gd-muted">{itemDetails(item)}</p>}
                    <p className="gd-price">{formatPrice(item.price, store.symbol)}</p>
                    <div className="gd-qty">
                      <button onClick={() => updateQty(item.key, -1)} aria-label="Less">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)} aria-label="More">+</button>
                    </div>
                  </div>
                  <button className="gd-remove" onClick={() => updateQty(item.key, -item.qty)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="gd-bag-foot">
              <div className="gd-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal, store.symbol)}</strong>
              </div>
              <p className="gd-muted">Delivery is added at checkout.</p>
              <button
                className="gd-btn"
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

function HomePage({ store, basePath, category, setCategory }) {
  const [sort, setSort] = useState("featured");
  const shopRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#shop" && shopRef.current) {
      shopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.key, location.hash]);

  let shown = category === "All"
    ? store.products
    : store.products.filter((p) => p.category === category);
  if (sort === "low") shown = [...shown].sort((a, b) => startingPrice(a) - startingPrice(b));
  if (sort === "high") shown = [...shown].sort((a, b) => startingPrice(b) - startingPrice(a));

  return (
    <>
      <section
        className={store.hero.image ? "gd-hero has-photo" : "gd-hero"}
        style={store.hero.image ? { backgroundImage: `url(${store.hero.image})` } : {}}
      >
        <div className="gd-hero-text">
          {store.hero.label && <p className="gd-hero-label">{store.hero.label}</p>}
          <h1 className="gd-hero-title">{store.hero.headline || store.name}</h1>
          {store.about && <p className="gd-hero-about">{store.about}</p>}
          <Link className="gd-hero-btn" to={`${basePath}/#shop`}>Shop now</Link>
        </div>
      </section>

      {/* Quiet reassurance, the thing that sells a ₦450,000 phone */}
      <section className="gd-trust">
        <div className="gd-trust-item">
          <span className="gd-trust-icon">✓</span>
          <p>Genuine products</p>
        </div>
        <div className="gd-trust-item">
          <span className="gd-trust-icon">⚡</span>
          <p>Fast delivery</p>
        </div>
        <div className="gd-trust-item">
          <span className="gd-trust-icon">💬</span>
          <p>We answer on WhatsApp</p>
        </div>
      </section>

      <section className="gd-shop" ref={shopRef}>
        {store.categories.length > 0 && (
          <div className="gd-cats">
            {["All", ...store.categories].map((c) => (
              <button
                key={c}
                className={category === c ? "gd-cat active" : "gd-cat"}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="gd-bar">
          <span>{shown.length} {shown.length === 1 ? "item" : "items"}</span>
          <label className="gd-sort">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {shown.length === 0 ? (
          <p className="gd-muted gd-empty">No items yet. Check back soon.</p>
        ) : (
          <div className="gd-grid">
            {shown.map((p) => (
              <ProductCard key={p.id} store={store} product={p} basePath={basePath} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function ProductPage({ store, basePath, addToCart, openBag }) {
  const { id } = useParams();
  const product = store.products.find((p) => String(p.id) === id);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [variant, setVariant] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSize("");
    setColor("");
    setVariant("");
    setError("");
  }, [id]);

  if (!product) {
    return (
      <div className="gd-page">
        <p>Item not found.</p>
        <Link className="gd-link" to={`${basePath}/#shop`}>Back to shop</Link>
      </div>
    );
  }

  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const options = product.variants || [];
  const chosenColor = color || (colors.length === 1 ? colors[0] : "");
  const chosen = options.find((v) => v.label === variant);
  const shownPrice = chosen ? chosen.price : startingPrice(product);

  const related = store.products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  function handleAdd() {
    if (options.length > 0 && !variant) return setError("Please choose an option.");
    if (sizes.length > 0 && !size) return setError("Please choose an option.");
    if (colors.length > 1 && !color) return setError("Please choose a colour.");
    setError("");
    addToCart({
      productId: product.id,
      name: product.name,
      price: shownPrice,
      photo: product.photos[0] || "",
      size,
      color: chosenColor,
      variant,
    });
    openBag();
  }

  const details = [variant, size, chosenColor].filter(Boolean).join(", ");
  const waText = `Hi ${store.name}, I'd like to order the ${product.name}${
    details ? ` (${details})` : ""
  } for ${formatPrice(shownPrice, store.symbol)}. Is it available?`;

  return (
    <div className="gd-product">
      <PhotoCarousel key={product.id} photos={product.photos} alt={product.name} prefix="gd" />

      <div className="gd-product-info">
        {product.category && <p className="gd-cat-label">{product.category}</p>}
        <h1 className="gd-product-name">{product.name}</h1>

        <div className="gd-price-row">
          <p className="gd-product-price">
            {!chosen && options.length > 0 && <span className="gd-from">From </span>}
            {formatPrice(shownPrice, store.symbol)}
          </p>
          {!product.soldOut && <span className="gd-stock">In stock</span>}
        </div>

        {options.length > 0 && (
          <div className="gd-options">
            <p className="gd-label">Choose{variant ? `: ${variant}` : ""}</p>
            <div className="gd-specs">
              {options.map((v) => (
                <button
                  key={v.label}
                  className={variant === v.label ? "gd-spec active" : "gd-spec"}
                  onClick={() => setVariant(v.label)}
                >
                  <span className="gd-spec-label">{v.label}</span>
                  <span className="gd-spec-price">{formatPrice(v.price, store.symbol)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 1 && (
          <div className="gd-options">
            <p className="gd-label">Colour{color ? `: ${color}` : ""}</p>
            <div className="gd-chips">
              {colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "gd-chip active" : "gd-chip"}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="gd-options">
            <p className="gd-label">Option{size ? `: ${size}` : ""}</p>
            <div className="gd-chips">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "gd-chip active" : "gd-chip"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="gd-error">{error}</p>}

        {product.soldOut ? (
          <button className="gd-btn" disabled>Out of stock</button>
        ) : (
          <button className="gd-btn" onClick={handleAdd}>Add to bag</button>
        )}

        {!product.soldOut && (
          <a
            className="gd-btn outline"
            href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ask a question
          </a>
        )}

        {product.description && (
          <div className="gd-desc">
            <p className="gd-label">Description</p>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="gd-related">
          <h2 className="gd-section-title">Similar items</h2>
          <div className="gd-grid">
            {related.map((p) => (
              <ProductCard key={p.id} store={store} product={p} basePath={basePath} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- The whole site ---------- */

export default function GadgetsSite({ basePath = "/preview/gadgets", slug: slugProp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug, store, loading, notFound } = useShop(slugProp);
  const { cart, addToCart, updateQty, clearCart, cartCount, subtotal } = useCart(slug);

  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  function goToShop(cat) {
    setCategory(cat);
    setMenuOpen(false);
    navigate(`${basePath}/#shop`);
  }

  if (loading) {
    return <div className="gd-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="gd">
        <div className="gd-page">
          <h1 className="gd-page-title">Shop not found</h1>
          <p className="gd-muted">This website address doesn't belong to any shop.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gd">
      <header className="gd-header">
        <button className="gd-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="gd-burger"><span /><span /><span /></span>
        </button>

        <Link to={basePath || "/"} className="gd-logo">
          {store.logo ? <img src={store.logo} alt={store.name} /> : store.name}
        </Link>

        <button className="gd-icon" onClick={() => setBagOpen(true)} aria-label="Shopping bag">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 8h14l-1 12H6L5 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {cartCount > 0 && <span className="gd-count">{cartCount}</span>}
        </button>
      </header>

      {menuOpen && <div className="gd-overlay" onClick={() => setMenuOpen(false)} />}
      <nav className={menuOpen ? "gd-drawer open" : "gd-drawer"}>
        <button className="gd-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <button className="gd-drawer-link" onClick={() => goToShop("All")}>All items</button>
        {store.categories.map((c) => (
          <button key={c} className="gd-drawer-link" onClick={() => goToShop(c)}>{c}</button>
        ))}
        <a
          className="gd-drawer-wa"
          href={`https://wa.me/${store.whatsapp}`}
          target="_blank"
          rel="noreferrer"
        >
          Chat with us on WhatsApp
        </a>
      </nav>

      <BagDrawer
        store={store}
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        cart={cart}
        updateQty={updateQty}
        subtotal={subtotal}
        basePath={basePath}
      />

      <main className="gd-main">
        <Routes>
          <Route
            index
            element={<HomePage store={store} basePath={basePath} category={category} setCategory={setCategory} />}
          />
          <Route
            path="product/:id"
            element={
              <ProductPage
                store={store}
                basePath={basePath}
                addToCart={addToCart}
                openBag={() => setBagOpen(true)}
              />
            }
          />
          <Route
            path="checkout"
            element={
              <Checkout
                store={store}
                basePath={basePath}
                cart={cart}
                clearCart={clearCart}
                prefix="gd"
              />
            }
          />
          <Route path="done" element={<Done store={store} basePath={basePath} prefix="gd" />} />
        </Routes>
      </main>

      <GadgetsFooter store={store} />
    </div>
  );
}