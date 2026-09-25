import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import { useShop } from "../shop/useShop";
import { useCart, itemDetails } from "../shop/useCart";
import PhotoCarousel from "../shop/PhotoCarousel";
import Checkout from "../shop/Checkout";
import Done from "../shop/Done";
import JewelleryFooter from "./JewelleryFooter";
import "./JewellerySite.css";

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
    <Link to={`${basePath}/product/${product.id}`} className="jw-card">
      <PhotoCarousel photos={product.photos} alt={product.name} prefix="jw" />
      <div className="jw-card-info">
        <p className="jw-name">{product.name}</p>
        <p className="jw-price">
          {hasOptions ? "From " : ""}
          {formatPrice(startingPrice(product), store.symbol)}
        </p>
        {product.soldOut ? (
          <span className="jw-tag sold">Sold</span>
        ) : (
          product.tag && <span className="jw-tag">{product.tag}</span>
        )}
      </div>
    </Link>
  );
}

function BagDrawer({ store, open, onClose, cart, updateQty, subtotal, basePath }) {
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="jw-overlay" onClick={onClose} />}
      <aside className={open ? "jw-bag-drawer open" : "jw-bag-drawer"}>
        <div className="jw-bag-head">
          <h2>Your bag</h2>
          <button className="jw-close" onClick={onClose} aria-label="Close bag">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="jw-muted">Your bag is empty.</p>
        ) : (
          <>
            <div className="jw-bag-items">
              {cart.map((item) => (
                <div key={item.key} className="jw-bag-item">
                  <img src={item.photo} alt={item.name} />
                  <div className="jw-bag-info">
                    <p className="jw-name">{item.name}</p>
                    {itemDetails(item) && <p className="jw-muted">{itemDetails(item)}</p>}
                    <p className="jw-price">{formatPrice(item.price, store.symbol)}</p>
                    <div className="jw-qty">
                      <button onClick={() => updateQty(item.key, -1)} aria-label="Less">−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, 1)} aria-label="More">+</button>
                    </div>
                  </div>
                  <button className="jw-remove" onClick={() => updateQty(item.key, -item.qty)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="jw-bag-foot">
              <div className="jw-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal, store.symbol)}</strong>
              </div>
              <p className="jw-muted">Delivery is added at checkout.</p>
              <button
                className="jw-btn"
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
        className={store.hero.image ? "jw-hero has-photo" : "jw-hero"}
        style={store.hero.image ? { backgroundImage: `url(${store.hero.image})` } : {}}
      >
        <div className="jw-hero-text">
          {store.hero.label && <p className="jw-hero-label">{store.hero.label}</p>}
          <h1 className="jw-hero-title">{store.hero.headline || store.name}</h1>
          {store.about && !store.hero.image && <p className="jw-hero-about">{store.about}</p>}
          <Link className="jw-hero-btn" to={`${basePath}/#shop`}>View the collection</Link>
        </div>
      </section>

      <section className="jw-shop" ref={shopRef}>
        {store.categories.length > 0 && (
          <div className="jw-cats">
            {["All", ...store.categories].map((c) => (
              <button
                key={c}
                className={category === c ? "jw-cat active" : "jw-cat"}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="jw-bar">
          <span>{shown.length} {shown.length === 1 ? "piece" : "pieces"}</span>
          <label className="jw-sort">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>

        {shown.length === 0 ? (
          <p className="jw-muted jw-empty">No pieces yet. Check back soon.</p>
        ) : (
          <div className="jw-grid">
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
      <div className="jw-page">
        <p>Piece not found.</p>
        <Link className="jw-link" to={`${basePath}/#shop`}>Back to shop</Link>
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
    if (sizes.length > 0 && !size) return setError("Please choose a size.");
    if (colors.length > 1 && !color) return setError("Please choose a finish.");
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
    <div className="jw-product">
      <PhotoCarousel key={product.id} photos={product.photos} alt={product.name} prefix="jw" />

      <div className="jw-product-info">
        {product.category && <p className="jw-cat-label">{product.category}</p>}
        <h1 className="jw-product-name">{product.name}</h1>
        <p className="jw-product-price">
          {!chosen && options.length > 0 ? "From " : ""}
          {formatPrice(shownPrice, store.symbol)}
        </p>

        {options.length > 0 && (
          <div className="jw-options">
            <p className="jw-label">Choose{variant ? `: ${variant}` : ""}</p>
            <div className="jw-sizes">
              {options.map((v) => (
                <button
                  key={v.label}
                  className={variant === v.label ? "jw-size active" : "jw-size"}
                  onClick={() => setVariant(v.label)}
                >
                  <span className="jw-size-label">{v.label}</span>
                  <span className="jw-size-price">{formatPrice(v.price, store.symbol)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 1 && (
          <div className="jw-options">
            <p className="jw-label">Finish{color ? `: ${color}` : ""}</p>
            <div className="jw-chips">
              {colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "jw-chip active" : "jw-chip"}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="jw-options">
            <p className="jw-label">Size{size ? `: ${size}` : ""}</p>
            <div className="jw-chips">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={size === s ? "jw-chip active" : "jw-chip"}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="jw-error">{error}</p>}

        {product.soldOut ? (
          <button className="jw-btn" disabled>Sold</button>
        ) : (
          <button className="jw-btn" onClick={handleAdd}>Add to bag</button>
        )}

        {!product.soldOut && (
          <a
            className="jw-btn outline"
            href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
          >
            Enquire on WhatsApp
          </a>
        )}

        {product.description && (
          <div className="jw-desc">
            <p className="jw-label">Details</p>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="jw-related">
          <h2 className="jw-section-title">More from this collection</h2>
          <div className="jw-grid">
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

export default function JewellerySite({ basePath = "/preview/jewellery", slug: slugProp }) {
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
    return <div className="jw-loading">Loading...</div>;
  }

  if (notFound || !store) {
    return (
      <div className="jw">
        <div className="jw-page">
          <h1 className="jw-page-title">Shop not found</h1>
          <p className="jw-muted">This website address doesn't belong to any shop.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jw">
      {/* Always white, always quiet: the pieces do the talking */}
      <header className="jw-header">
        <button className="jw-icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <span className="jw-burger"><span /><span /></span>
        </button>

        <Link to={basePath || "/"} className="jw-logo">
          {store.logo ? <img src={store.logo} alt={store.name} /> : store.name}
        </Link>

        <button className="jw-icon" onClick={() => setBagOpen(true)} aria-label="Shopping bag">
          <span className="jw-bag-word">Bag</span>
          {cartCount > 0 && <span className="jw-count">({cartCount})</span>}
        </button>
      </header>

      {menuOpen && <div className="jw-overlay" onClick={() => setMenuOpen(false)} />}
      <nav className={menuOpen ? "jw-drawer open" : "jw-drawer"}>
        <button className="jw-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        <button className="jw-drawer-link" onClick={() => goToShop("All")}>All pieces</button>
        {store.categories.map((c) => (
          <button key={c} className="jw-drawer-link" onClick={() => goToShop(c)}>{c}</button>
        ))}
        <a
          className="jw-drawer-wa"
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

      <main className="jw-main">
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
                prefix="jw"
              />
            }
          />
          <Route path="done" element={<Done store={store} basePath={basePath} prefix="jw" />} />
        </Routes>
      </main>

      <JewelleryFooter store={store} />
    </div>
  );
}