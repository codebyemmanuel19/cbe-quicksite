import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import { useCart, itemDetails } from "../shop/useCart";
import PhotoCarousel from "../shop/PhotoCarousel";
import Checkout from "../shop/Checkout";
import Done from "../shop/Done";
import Reveal from "../shop/Reveal";
import ClothingFooter from "./ClothingFooter";
import "./ClothingSite.css";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

// A product with lengths or bottle sizes shows its cheapest one until the customer picks
function startingPrice(product) {
  const options = product.variants || [];
  return options.length ? Math.min(...options.map((v) => v.price)) : product.price;
}

/* ---------- Pieces that belong to this look ---------- */

function ProductCard({ store, product, basePath }) {
  const hasOptions = (product.variants || []).length > 0;

  return (
    <Link to={`${basePath}/product/${product.id}`} className="cs-card">
      <PhotoCarousel photos={product.photos} alt={product.name} />
      <p className="cs-name">{product.name}</p>
      <p className="cs-price">
        {hasOptions ? "From " : ""}
        {formatPrice(startingPrice(product), store.symbol)}
      </p>
      {product.soldOut ? (
        <p className="cs-tag sold">Sold out</p>
      ) : (
        product.tag && <p className="cs-tag">{product.tag}</p>
      )}
    </Link>
  );
}

function BagDrawer({ store, open, onClose, cart, updateQty, subtotal, basePath }) {
  const navigate = useNavigate();

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
                    <p className="cs-price">{formatPrice(item.price, store.symbol)}</p>
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
                <strong>{formatPrice(subtotal, store.symbol)}</strong>
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

function HomePage({ store, basePath, category, setCategory }) {
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
  if (sort === "low") shown = [...shown].sort((a, b) => startingPrice(a) - startingPrice(b));
  if (sort === "high") shown = [...shown].sort((a, b) => startingPrice(b) - startingPrice(a));

  return (
    <>
      <section
        className="cs-hero"
        style={store.hero.image ? { backgroundImage: `url(${store.hero.image})` } : {}}
      >
        <div className="cs-hero-text">
          {store.hero.label && <p className="cs-hero-label">{store.hero.label}</p>}
          <h1 className="cs-hero-title">{store.hero.headline || store.name}</h1>
          <Link className="cs-hero-btn" to={`${basePath}/#shop`}>Shop now</Link>
        </div>
      </section>

      <section className="cs-shop" ref={shopRef}>
        {store.categories.length > 0 && (
          <Reveal>
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
          </Reveal>
        )}

        <Reveal delay={80}>
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
        </Reveal>

        {shown.length === 0 ? (
          <p className="cs-muted">No products yet. Check back soon.</p>
        ) : (
          <div className="cs-grid">
            {shown.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard store={store} product={p} basePath={basePath} />
              </Reveal>
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

  // Start fresh when moving to another product
  useEffect(() => {
    setSize("");
    setColor("");
    setVariant("");
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
  const options = product.variants || [];
  const chosenColor = color || (colors.length === 1 ? colors[0] : "");
  const chosen = options.find((v) => v.label === variant);
  // Before they pick, show the cheapest option
  const shownPrice = chosen ? chosen.price : startingPrice(product);

  const related = store.products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  function handleAdd() {
    if (options.length > 0 && !variant) return setError("Please choose an option.");
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
    <div className="cs-product">
      <PhotoCarousel key={product.id} photos={product.photos} alt={product.name} />

      <div className="cs-product-info">
        {product.tag && !product.soldOut && <p className="cs-tag">{product.tag}</p>}
        <h1 className="cs-product-name">{product.name}</h1>
        <p className="cs-product-price">
          {!chosen && options.length > 0 ? "From " : ""}
          {formatPrice(shownPrice, store.symbol)}
        </p>

        {options.length > 0 && (
          <div className="cs-options">
            <p className="cs-label">Choose{variant ? `: ${variant}` : ""}</p>
            <div className="cs-chips">
              {options.map((v) => (
                <button
                  key={v.label}
                  className={variant === v.label ? "cs-chip active" : "cs-chip"}
                  onClick={() => setVariant(v.label)}
                >
                  {v.label} · {formatPrice(v.price, store.symbol)}
                </button>
              ))}
            </div>
          </div>
        )}

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

        {!product.soldOut && (
          <a
            className="cs-btn outline"
            href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Order on WhatsApp
          </a>
        )}

        {product.description && (
          <div className="cs-desc">
            <p className="cs-label">Details</p>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="cs-related">
          <Reveal>
            <h2 className="cs-section-title">You may also like</h2>
          </Reveal>
          <div className="cs-grid">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard store={store} product={p} basePath={basePath} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- The whole site ---------- */

export default function ClothingSite({ basePath = "/preview/clothing", slug: slugProp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug, store, loading, notFound } = useShop(slugProp);
  const { cart, addToCart, updateQty, clearCart, cartCount, subtotal } = useCart(slug);

  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname.replace(/\/$/, "") === basePath;

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

  function goToShop(cat) {
    setCategory(cat);
    setMenuOpen(false);
    navigate(`${basePath}/#shop`);
  }

  if (loading) {
    return <div className="cs-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="cs-page">
        <h1 className="cs-page-title">Shop not found</h1>
        <p className="cs-muted">This website address doesn't belong to any shop.</p>
      </div>
    );
  }

  return (
    <div className="cs">
      <header className={!isHome || scrolled ? "cs-header solid" : "cs-header"}>
        <button className="cs-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="cs-burger"><span /><span /><span /></span>
        </button>

        <Link to={basePath || "/"} className="cs-logo">
          {store.logo ? <img src={store.logo} alt={store.name} /> : store.name}
        </Link>

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
        store={store}
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        cart={cart}
        updateQty={updateQty}
        subtotal={subtotal}
        basePath={basePath}
      />

      <main className={isHome ? "" : "cs-main"}>
        <div className="qs-page" key={location.pathname}>
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
                prefix="cs"
              />
            }
          />
          <Route path="done" element={<Done store={store} basePath={basePath} prefix="cs" />} />
        </Routes>
        </div>
      </main>

      <ClothingFooter store={store} />
    </div>
  );
}