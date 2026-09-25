import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import { useCart, itemDetails } from "../shop/useCart";
import PhotoCarousel from "../shop/PhotoCarousel";
import Checkout from "../shop/Checkout";
import Done from "../shop/Done";
import SkincareFooter from "./SkincareFooter";
import "./SkincareSite.css";

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
    <Link to={`${basePath}/product/${product.id}`} className="sk-card">
      <PhotoCarousel photos={product.photos} alt={product.name} prefix="sk" />
      <div className="sk-card-info">
        {product.category && <p className="sk-cat-label">{product.category}</p>}
        <p className="sk-name">{product.name}</p>
        <p className="sk-price">
          {hasOptions ? "From " : ""}
          {formatPrice(startingPrice(product), store.symbol)}
        </p>
        {product.soldOut ? (
          <span className="sk-tag sold">Out of stock</span>
        ) : (
          product.tag && <span className="sk-tag">{product.tag}</span>
        )}
      </div>
    </Link>
  );
}

function BagDrawer({ store, open, onClose, cart, updateQty, subtotal, basePath }) {
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="sk-overlay" onClick={onClose} />}
      <aside className={open ? "sk-bag-drawer open" : "sk-bag-drawer"}>
        <div className="sk-bag-head">
          <h2>Your bag</h2>
          <button className="sk-close" onClick={onClose} aria-label="Close bag">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="sk-muted">Your bag is empty.</p>
        ) : (
          <>
            <div className="sk-bag-items">
              {cart.map((item) => (
                <div key={item.key} className="sk-bag-item">
                  <div className="sk-bag-img">
                    <img src={item.photo} alt={item.name} />
                  </div>
                  <div className="sk-bag-info">
                    <p className="sk-name">{item.name}</p>
                    {itemDetails(item) && <p className="sk-muted">{itemDetails(item)}</p>}
                    <p className="sk-price">{formatPrice(item.price, store.symbol)}</p>
                    <div className="sk-qty">
                      <button onClick={() => updateQty(item.key, -1)} aria-label="Less">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)} aria-label="More">+</button>
                    </div>
                  </div>
                  <button className="sk-remove" onClick={() => updateQty(item.key, -item.qty)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="sk-bag-foot">
              <div className="sk-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal, store.symbol)}</strong>
              </div>
              <p className="sk-muted">Delivery is added at checkout.</p>
              <button
                className="sk-btn"
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
        className={store.hero.image ? "sk-hero has-photo" : "sk-hero"}
        style={store.hero.image ? { backgroundImage: `url(${store.hero.image})` } : {}}
      >
        <div className="sk-hero-text">
          {store.hero.label && <p className="sk-hero-label">{store.hero.label}</p>}
          <h1 className="sk-hero-title">{store.hero.headline || store.name}</h1>
          {store.about && <p className="sk-hero-about">{store.about}</p>}
          <Link className="sk-hero-btn" to={`${basePath}/#shop`}>Shop all products</Link>
        </div>
      </section>

      <section className="sk-shop" ref={shopRef}>
        {store.categories.length > 0 && (
          <div className="sk-cats">
            {["All", ...store.categories].map((c) => (
              <button
                key={c}
                className={category === c ? "sk-cat active" : "sk-cat"}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="sk-bar">
          <span>{shown.length} {shown.length === 1 ? "product" : "products"}</span>
          <label className="sk-sort">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {shown.length === 0 ? (
          <p className="sk-muted sk-empty">No products yet. Check back soon.</p>
        ) : (
          <div className="sk-grid">
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
      <div className="sk-page">
        <p>Product not found.</p>
        <Link className="sk-link" to={`${basePath}/#shop`}>Back to shop</Link>
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
    if (options.length > 0 && !variant) return setError("Please choose a size.");
    if (sizes.length > 0 && !size) return setError("Please choose an option.");
    if (colors.length > 1 && !color) return setError("Please choose a shade.");
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
    <div className="sk-product">
      <PhotoCarousel key={product.id} photos={product.photos} alt={product.name} prefix="sk" />

      <div className="sk-product-info">
        {product.category && <p className="sk-cat-label">{product.category}</p>}
        <h1 className="sk-product-name">{product.name}</h1>
        <p className="sk-product-price">
          {!chosen && options.length > 0 ? "From " : ""}
          {formatPrice(shownPrice, store.symbol)}
        </p>

        {options.length > 0 && (
          <div className="sk-options">
            <p className="sk-label">Size{variant ? `: ${variant}` : ""}</p>
            <div className="sk-sizes">
              {options.map((v) => (
                <button
                  key={v.label}
                  className={variant === v.label ? "sk-size active" : "sk-size"}
                  onClick={() => setVariant(v.label)}
                >
                  <span className="sk-size-label">{v.label}</span>
                  <span className="sk-size-price">{formatPrice(v.price, store.symbol)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 1 && (
          <div className="sk-options">
            <p className="sk-label">Shade{color ? `: ${color}` : ""}</p>
            <div className="sk-chips">
              {colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "sk-chip active" : "sk-chip"}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="sk-options">
            <p className="sk-label">Option{size ? `: ${size}` : ""}</p>
            <div className="sk-chips">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "sk-chip active" : "sk-chip"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="sk-error">{error}</p>}

        {product.soldOut ? (
          <button className="sk-btn" disabled>Out of stock</button>
        ) : (
          <button className="sk-btn" onClick={handleAdd}>Add to bag</button>
        )}

        {!product.soldOut && (
          <a
            className="sk-btn outline"
            href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Ask a question
          </a>
        )}

        {product.description && (
          <div className="sk-desc">
            <p className="sk-label">About this product</p>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="sk-related">
          <h2 className="sk-section-title">Goes well with</h2>
          <div className="sk-grid">
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

export default function SkincareSite({ basePath = "/preview/skincare", slug: slugProp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug, store, loading, notFound } = useShop(slugProp);
  const { cart, addToCart, updateQty, clearCart, cartCount, subtotal } = useCart(slug);

  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);

  const isHome = location.pathname.replace(/\/$/, "") === basePath;

  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  function goToShop(cat) {
    setCategory(cat);
    setMenuOpen(false);
    navigate(`${basePath}/#shop`);
  }

  if (loading) {
    return <div className="sk-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="sk-page">
        <h1 className="sk-page-title">Shop not found</h1>
        <p className="sk-muted">This website address doesn't belong to any shop.</p>
      </div>
    );
  }

  return (
    <div className="sk">
      {/* This header stays white all the way down, so it never fights the photos */}
      <header className="sk-header">
        <button className="sk-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="sk-burger"><span /><span /><span /></span>
        </button>

        <Link to={basePath || "/"} className="sk-logo">
          {store.logo ? <img src={store.logo} alt={store.name} /> : store.name}
        </Link>

        <button className="sk-icon" onClick={() => setBagOpen(true)} aria-label="Shopping bag">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 8h14l-1 12H6L5 8z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {cartCount > 0 && <span className="sk-count">{cartCount}</span>}
        </button>
      </header>

      {menuOpen && <div className="sk-overlay" onClick={() => setMenuOpen(false)} />}
      <nav className={menuOpen ? "sk-drawer open" : "sk-drawer"}>
        <button className="sk-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <button className="sk-drawer-link" onClick={() => goToShop("All")}>All products</button>
        {store.categories.map((c) => (
          <button key={c} className="sk-drawer-link" onClick={() => goToShop(c)}>{c}</button>
        ))}
        <a
          className="sk-drawer-wa"
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

      <main className="sk-main">
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
                prefix="sk"
              />
            }
          />
          <Route path="done" element={<Done store={store} basePath={basePath} prefix="sk" />} />
        </Routes>
      </main>

      <SkincareFooter store={store} />
    </div>
  );
}