import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import { useCart, itemDetails } from "../shop/useCart";
import PhotoCarousel from "../shop/PhotoCarousel";
import Checkout from "../shop/Checkout";
import Done from "../shop/Done";
import HairFooter from "./HairFooter";
import "./HairSite.css";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

// A wig with lengths shows its cheapest one until the customer picks
function startingPrice(product) {
  const options = product.variants || [];
  return options.length ? Math.min(...options.map((v) => v.price)) : product.price;
}

/* ---------- Pieces that belong to this look ---------- */

function ProductCard({ store, product, basePath }) {
  const hasOptions = (product.variants || []).length > 0;

  return (
    <Link to={`${basePath}/product/${product.id}`} className="hs-card">
      <PhotoCarousel photos={product.photos} alt={product.name} prefix="hs" />
      <div className="hs-card-info">
        <p className="hs-name">{product.name}</p>
        <p className="hs-price">
          {hasOptions ? "From " : ""}
          {formatPrice(startingPrice(product), store.symbol)}
        </p>
        {product.soldOut ? (
          <span className="hs-tag sold">Sold out</span>
        ) : (
          product.tag && <span className="hs-tag">{product.tag}</span>
        )}
      </div>
    </Link>
  );
}

function BagDrawer({ store, open, onClose, cart, updateQty, subtotal, basePath }) {
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="hs-overlay" onClick={onClose} />}
      <aside className={open ? "hs-bag-drawer open" : "hs-bag-drawer"}>
        <div className="hs-bag-head">
          <h2>Your bag</h2>
          <button className="hs-close" onClick={onClose} aria-label="Close bag">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="hs-muted">Your bag is empty.</p>
        ) : (
          <>
            <div className="hs-bag-items">
              {cart.map((item) => (
                <div key={item.key} className="hs-bag-item">
                  <img src={item.photo} alt={item.name} />
                  <div className="hs-bag-info">
                    <p className="hs-name">{item.name}</p>
                    {itemDetails(item) && <p className="hs-muted">{itemDetails(item)}</p>}
                    <p className="hs-price">{formatPrice(item.price, store.symbol)}</p>
                    <div className="hs-qty">
                      <button onClick={() => updateQty(item.key, -1)} aria-label="Less">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)} aria-label="More">+</button>
                    </div>
                  </div>
                  <button className="hs-remove" onClick={() => updateQty(item.key, -item.qty)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="hs-bag-foot">
              <div className="hs-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal, store.symbol)}</strong>
              </div>
              <p className="hs-muted">Delivery is added at checkout.</p>
              <button
                className="hs-btn"
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
        className="hs-hero"
        style={store.hero.image ? { backgroundImage: `url(${store.hero.image})` } : {}}
      >
        <div className="hs-hero-text">
          {store.hero.label && <p className="hs-hero-label">{store.hero.label}</p>}
          <h1 className="hs-hero-title">{store.hero.headline || store.name}</h1>
          <Link className="hs-hero-btn" to={`${basePath}/#shop`}>Shop the collection</Link>
        </div>
      </section>

      <section className="hs-shop" ref={shopRef}>
        {store.categories.length > 0 && (
          <div className="hs-cats">
            {["All", ...store.categories].map((c) => (
              <button
                key={c}
                className={category === c ? "hs-cat active" : "hs-cat"}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="hs-bar">
          <span>{shown.length} {shown.length === 1 ? "style" : "styles"}</span>
          <label className="hs-sort">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {shown.length === 0 ? (
          <p className="hs-muted">No styles yet. Check back soon.</p>
        ) : (
          <div className="hs-grid">
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
      <div className="hs-page">
        <p>Style not found.</p>
        <Link className="hs-link" to={`${basePath}/#shop`}>Back to shop</Link>
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
    if (options.length > 0 && !variant) return setError("Please choose a length.");
    if (sizes.length > 0 && !size) return setError("Please choose a size.");
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

  const details = [variant, size && `Size ${size}`, chosenColor].filter(Boolean).join(", ");
  const waText = `Hi ${store.name}, I'd like to order the ${product.name}${
    details ? ` (${details})` : ""
  } for ${formatPrice(shownPrice, store.symbol)}. Is it available?`;

  return (
    <div className="hs-product">
      <PhotoCarousel key={product.id} photos={product.photos} alt={product.name} prefix="hs" />

      <div className="hs-product-info">
        {product.tag && !product.soldOut && <span className="hs-tag">{product.tag}</span>}
        <h1 className="hs-product-name">{product.name}</h1>
        <p className="hs-product-price">
          {!chosen && options.length > 0 ? "From " : ""}
          {formatPrice(shownPrice, store.symbol)}
        </p>

        {options.length > 0 && (
          <div className="hs-options">
            <p className="hs-label">Length{variant ? `: ${variant}` : ""}</p>
            <div className="hs-lengths">
              {options.map((v) => (
                <button
                  key={v.label}
                  className={variant === v.label ? "hs-length active" : "hs-length"}
                  onClick={() => setVariant(v.label)}
                >
                  <span className="hs-length-label">{v.label}</span>
                  <span className="hs-length-price">{formatPrice(v.price, store.symbol)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 1 && (
          <div className="hs-options">
            <p className="hs-label">Colour{color ? `: ${color}` : ""}</p>
            <div className="hs-chips">
              {colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "hs-chip active" : "hs-chip"}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="hs-options">
            <p className="hs-label">Cap size{size ? `: ${size}` : ""}</p>
            <div className="hs-chips">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "hs-chip active" : "hs-chip"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="hs-error">{error}</p>}

        {product.soldOut ? (
          <button className="hs-btn" disabled>Sold out</button>
        ) : (
          <button className="hs-btn" onClick={handleAdd}>Add to bag</button>
        )}

        {!product.soldOut && (
          <a
            className="hs-btn outline"
            href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ask about this style
          </a>
        )}

        {product.description && (
          <div className="hs-desc">
            <p className="hs-label">Details</p>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="hs-related">
          <h2 className="hs-section-title">You may also like</h2>
          <div className="hs-grid">
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

export default function HairSite({ basePath = "/preview/hair", slug: slugProp }) {
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
      setScrolled(window.scrollY > window.innerHeight * 0.75);
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
    return <div className="hs-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="hs-page">
        <h1 className="hs-page-title">Shop not found</h1>
        <p className="hs-muted">This website address doesn't belong to any shop.</p>
      </div>
    );
  }

  return (
    <div className="hs">
      <header className={!isHome || scrolled ? "hs-header solid" : "hs-header"}>
        <button className="hs-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="hs-burger"><span /><span /><span /></span>
        </button>

        <Link to={basePath || "/"} className="hs-logo">
          {store.logo ? <img src={store.logo} alt={store.name} /> : store.name}
        </Link>

        <button className="hs-icon" onClick={() => setBagOpen(true)} aria-label="Shopping bag">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 8h14l-1 12H6L5 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {cartCount > 0 && <span className="hs-count">{cartCount}</span>}
        </button>
      </header>

      {menuOpen && <div className="hs-overlay" onClick={() => setMenuOpen(false)} />}
      <nav className={menuOpen ? "hs-drawer open" : "hs-drawer"}>
        <button className="hs-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <button className="hs-drawer-link" onClick={() => goToShop("All")}>All styles</button>
        {store.categories.map((c) => (
          <button key={c} className="hs-drawer-link" onClick={() => goToShop(c)}>{c}</button>
        ))}
        <a
          className="hs-drawer-wa"
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

      <main className={isHome ? "" : "hs-main"}>
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
                prefix="hs"
              />
            }
          />
          <Route path="done" element={<Done store={store} basePath={basePath} prefix="hs" />} />
        </Routes>
      </main>

      <HairFooter store={store} />
    </div>
  );
}