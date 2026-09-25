import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import { useCart, itemDetails } from "../shop/useCart";
import PhotoCarousel from "../shop/PhotoCarousel";
import Checkout from "../shop/Checkout";
import Done from "../shop/Done";
import PerfumeFooter from "./PerfumeFooter";
import "./PerfumeSite.css";

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
    <Link to={`${basePath}/product/${product.id}`} className="pf-card">
      <PhotoCarousel photos={product.photos} alt={product.name} prefix="pf" />
      <div className="pf-card-info">
        <p className="pf-name">{product.name}</p>
        <p className="pf-price">
          {hasOptions ? "From " : ""}
          {formatPrice(startingPrice(product), store.symbol)}
        </p>
        {product.soldOut ? (
          <span className="pf-tag sold">Sold out</span>
        ) : (
          product.tag && <span className="pf-tag">{product.tag}</span>
        )}
      </div>
    </Link>
  );
}

function BagDrawer({ store, open, onClose, cart, updateQty, subtotal, basePath }) {
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="pf-overlay" onClick={onClose} />}
      <aside className={open ? "pf-bag-drawer open" : "pf-bag-drawer"}>
        <div className="pf-bag-head">
          <h2>Your bag</h2>
          <button className="pf-close" onClick={onClose} aria-label="Close bag">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="pf-muted">Your bag is empty.</p>
        ) : (
          <>
            <div className="pf-bag-items">
              {cart.map((item) => (
                <div key={item.key} className="pf-bag-item">
                  <img src={item.photo} alt={item.name} />
                  <div className="pf-bag-info">
                    <p className="pf-name">{item.name}</p>
                    {itemDetails(item) && <p className="pf-muted">{itemDetails(item)}</p>}
                    <p className="pf-price">{formatPrice(item.price, store.symbol)}</p>
                    <div className="pf-qty">
                      <button onClick={() => updateQty(item.key, -1)} aria-label="Less">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)} aria-label="More">+</button>
                    </div>
                  </div>
                  <button className="pf-remove" onClick={() => updateQty(item.key, -item.qty)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="pf-bag-foot">
              <div className="pf-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal, store.symbol)}</strong>
              </div>
              <p className="pf-muted">Delivery is added at checkout.</p>
              <button
                className="pf-btn"
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
        className={store.hero.image ? "pf-hero has-photo" : "pf-hero"}
        style={store.hero.image ? { backgroundImage: `url(${store.hero.image})` } : {}}
      >
        <div className="pf-hero-text">
          {store.hero.label && <p className="pf-hero-label">{store.hero.label}</p>}
          <h1 className="pf-hero-title">{store.hero.headline || store.name}</h1>
          <Link className="pf-hero-btn" to={`${basePath}/#shop`}>Discover the scents</Link>
        </div>
      </section>

      <section className="pf-shop" ref={shopRef}>
        {store.categories.length > 0 && (
          <div className="pf-cats">
            {["All", ...store.categories].map((c) => (
              <button
                key={c}
                className={category === c ? "pf-cat active" : "pf-cat"}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="pf-bar">
          <span>{shown.length} {shown.length === 1 ? "scent" : "scents"}</span>
          <label className="pf-sort">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {shown.length === 0 ? (
          <p className="pf-muted pf-empty">No scents yet. Check back soon.</p>
        ) : (
          <div className="pf-grid">
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
      <div className="pf-page">
        <p>Scent not found.</p>
        <Link className="pf-link" to={`${basePath}/#shop`}>Back to shop</Link>
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
    if (options.length > 0 && !variant) return setError("Please choose a bottle size.");
    if (sizes.length > 0 && !size) return setError("Please choose an option.");
    if (colors.length > 1 && !color) return setError("Please choose one.");
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
    <div className="pf-product">
      <PhotoCarousel key={product.id} photos={product.photos} alt={product.name} prefix="pf" />

      <div className="pf-product-info">
        {product.tag && !product.soldOut && <span className="pf-tag">{product.tag}</span>}
        <h1 className="pf-product-name">{product.name}</h1>
        <p className="pf-product-price">
          {!chosen && options.length > 0 ? "From " : ""}
          {formatPrice(shownPrice, store.symbol)}
        </p>

        {options.length > 0 && (
          <div className="pf-options">
            <p className="pf-label">Bottle size{variant ? `: ${variant}` : ""}</p>
            <div className="pf-sizes">
              {options.map((v) => (
                <button
                  key={v.label}
                  className={variant === v.label ? "pf-size active" : "pf-size"}
                  onClick={() => setVariant(v.label)}
                >
                  <span className="pf-size-label">{v.label}</span>
                  <span className="pf-size-price">{formatPrice(v.price, store.symbol)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 1 && (
          <div className="pf-options">
            <p className="pf-label">Choose{color ? `: ${color}` : ""}</p>
            <div className="pf-chips">
              {colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "pf-chip active" : "pf-chip"}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="pf-options">
            <p className="pf-label">Option{size ? `: ${size}` : ""}</p>
            <div className="pf-chips">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "pf-chip active" : "pf-chip"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="pf-error">{error}</p>}

        {product.soldOut ? (
          <button className="pf-btn" disabled>Sold out</button>
        ) : (
          <button className="pf-btn" onClick={handleAdd}>Add to bag</button>
        )}

        {!product.soldOut && (
          <a
            className="pf-btn outline"
            href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ask about this scent
          </a>
        )}

        {product.description && (
          <div className="pf-desc">
            <p className="pf-label">The scent</p>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="pf-related">
          <h2 className="pf-section-title">You may also like</h2>
          <div className="pf-grid">
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

export default function PerfumeSite({ basePath = "/preview/perfume", slug: slugProp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug, store, loading, notFound } = useShop(slugProp);
  const { cart, addToCart, updateQty, clearCart, cartCount, subtotal } = useCart(slug);

  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname.replace(/\/$/, "") === basePath;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  function goToShop(cat) {
    setCategory(cat);
    setMenuOpen(false);
    navigate(`${basePath}/#shop`);
  }

  if (loading) {
    return <div className="pf-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="pf">
        <div className="pf-page">
          <h1 className="pf-page-title">Shop not found</h1>
          <p className="pf-muted">This website address doesn't belong to any shop.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pf">
      <header className={scrolled ? "pf-header solid" : "pf-header"}>
        <button className="pf-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="pf-burger"><span /><span /><span /></span>
        </button>

        <Link to={basePath || "/"} className="pf-logo">
          {store.logo ? <img src={store.logo} alt={store.name} /> : store.name}
        </Link>

        <button className="pf-icon" onClick={() => setBagOpen(true)} aria-label="Shopping bag">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M5 8h14l-1 12H6L5 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {cartCount > 0 && <span className="pf-count">{cartCount}</span>}
        </button>
      </header>

      {menuOpen && <div className="pf-overlay" onClick={() => setMenuOpen(false)} />}
      <nav className={menuOpen ? "pf-drawer open" : "pf-drawer"}>
        <button className="pf-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <button className="pf-drawer-link" onClick={() => goToShop("All")}>All scents</button>
        {store.categories.map((c) => (
          <button key={c} className="pf-drawer-link" onClick={() => goToShop(c)}>{c}</button>
        ))}
        <a
          className="pf-drawer-wa"
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

      <main className={isHome ? "" : "pf-main"}>
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
                prefix="pf"
              />
            }
          />
          <Route path="done" element={<Done store={store} basePath={basePath} prefix="pf" />} />
        </Routes>
      </main>

      <PerfumeFooter store={store} />
    </div>
  );
}