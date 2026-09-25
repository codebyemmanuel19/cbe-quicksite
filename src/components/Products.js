import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, uploadPhoto } from "../api";
import "./Products.css";

const MAX_PHOTOS = 4;
const MAX_OPTIONS = 20;
const MAX_VARIANTS = 10;

const TAGS = ["New", "Most loved", "Pre-order", "Limited", "Sale"];

const SIZE_PRESETS = [
  { label: "S – XL", values: ["S", "M", "L", "XL"] },
  { label: "XS – XXL", values: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "UK 6 – 16", values: ["6", "8", "10", "12", "14", "16"] },
  { label: "Shoes 38 – 45", values: ["38", "39", "40", "41", "42", "43", "44", "45"] },
];

// Each business type calls its priced options something different
const VARIANT_WORDS = {
  hair: { title: "Lengths & prices", one: "length", placeholder: "14 inch" },
  perfume: { title: "Bottle sizes & prices", one: "size", placeholder: "50ml" },
  skincare: { title: "Sizes & prices", one: "size", placeholder: "100ml" },
  gadgets: { title: "Options & prices", one: "option", placeholder: "128GB" },
  jewellery: { title: "Options & prices", one: "option", placeholder: "18 inch chain" },
  clothing: { title: "Options & prices", one: "option", placeholder: "Small" },
};

const emptyForm = {
  name: "",
  price: "",
  categoryId: "",
  tag: "",
  description: "",
  photos: [],
  sizes: [],
  colors: [],
  variants: [],
  soldOut: false,
};

function formatNaira(amount) {
  return "₦" + Number(amount).toLocaleString("en-NG");
}

function formatDay(value) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Type a value and press Enter or Add. Tap × to remove. Presets add a whole set at once.
function ChipInput({ label, values, onChange, placeholder, presets = [] }) {
  const [text, setText] = useState("");

  function add(value) {
    const clean = value.trim().slice(0, 20);
    if (!clean || values.includes(clean) || values.length >= MAX_OPTIONS) return;
    onChange([...values, clean]);
  }

  function addMany(list) {
    const merged = [...values];
    list.forEach((v) => {
      if (!merged.includes(v) && merged.length < MAX_OPTIONS) merged.push(v);
    });
    onChange(merged);
  }

  function handleKey(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // stops Enter from saving the whole product
      add(text);
      setText("");
    }
  }

  return (
    <div className="chip-field">
      <span className="chip-label">{label}</span>

      {values.length > 0 && (
        <div className="chip-list">
          {values.map((v) => (
            <span key={v} className="chip-item">
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="chip-add">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          maxLength={20}
        />
        <button
          type="button"
          onClick={() => {
            add(text);
            setText("");
          }}
        >
          Add
        </button>
      </div>

      {presets.length > 0 && (
        <div className="chip-presets">
          {presets.map((p) => (
            <button type="button" key={p.label} onClick={() => addMany(p.values)}>
              + {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Lengths, bottle sizes, storage: each one carries its own price
function VariantInput({ words, values, onChange }) {
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  function add() {
    const clean = label.trim().slice(0, 30);
    if (!clean) return setError(`Type the ${words.one}.`);
    if (values.some((v) => v.label.toLowerCase() === clean.toLowerCase())) {
      return setError("That one is already on the list.");
    }
    const amount = Number(price);
    if (price === "" || !Number.isInteger(amount) || amount <= 0) {
      return setError("Enter a valid price.");
    }
    if (values.length >= MAX_VARIANTS) {
      return setError(`You can add up to ${MAX_VARIANTS}.`);
    }

    setError("");
    onChange([...values, { label: clean, price: amount }]);
    setLabel("");
    setPrice("");
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // stops Enter from saving the whole product
      add();
    }
  }

  return (
    <div className="chip-field">
      <span className="chip-label">{words.title} (optional)</span>

      {values.length > 0 && (
        <div className="cat-list">
          {values.map((v) => (
            <span key={v.label} className="cat-pill">
              {v.label} · {formatNaira(v.price)}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x.label !== v.label))}
                aria-label={`Remove ${v.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="chip-add">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKey}
          placeholder={words.placeholder}
          maxLength={30}
        />
        <input
          value={price}
          inputMode="numeric"
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
          onKeyDown={handleKey}
          placeholder="Price"
        />
        <button type="button" onClick={add}>Add</button>
      </div>

      {error && <p className="prod-error">{error}</p>}
      <p className="prod-sub">
        Add one for each {words.one} you sell. Customers pick one, and pay that price.
      </p>
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businessType, setBusinessType] = useState("clothing");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [locked, setLocked] = useState(false);
  const [notice, setNotice] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null); // null = closed, "new" = adding
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const words = VARIANT_WORDS[businessType] || VARIANT_WORDS.clothing;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [p, c, mine] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
          api.get("/sites/me"),
        ]);
        if (cancelled) return;
        setProducts(p.products);
        setCategories(c.categories);
        setBusinessType(mine.site.businessType || "clothing");
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 400 || err.status === 404) return navigate("/setup"); // no shop yet
        setPageError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // The server returns a saved product without its category name, so we fill it in
  function withCategoryName(product) {
    const cat = categories.find((c) => c.id === product.categoryId);
    return { ...product, category: cat ? cat.name : "" };
  }

  // Every write goes through the same check, so a locked account always says the same thing
  function handleWriteError(err, setMessage) {
    if (err.status === 401) return navigate("/login");
    if (err.locked) {
      setLocked(true);
      setMessage("Your trial has ended. Pay to keep editing your website.");
      return;
    }
    setMessage(err.message);
  }

  const shown = products.filter((p) => {
    const inCategory = filter === "All" || p.categoryId === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
    return inCategory && matchesSearch;
  });

  function openAdd() {
    setForm(emptyForm);
    setError("");
    setEditingId("new");
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      price: String(product.price),
      categoryId: product.categoryId || "",
      tag: product.tag || "",
      description: product.description || "",
      photos: product.photos || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      variants: product.variants || [],
      soldOut: product.soldOut,
    });
    setError("");
    setEditingId(product.id);
  }

  function closeForm() {
    if (saving || uploading) return;
    setEditingId(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  // Photos go straight to Cloudinary. We only ever save the link they come back with.
  async function handlePhotos(e) {
    const files = Array.from(e.target.files);
    e.target.value = ""; // lets them pick the same file again
    setError("");

    const room = MAX_PHOTOS - form.photos.length;
    if (files.length > room) setError(`You can add up to ${MAX_PHOTOS} photos.`);

    const good = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, room);
    if (!good.length) return;

    setUploading(true);
    try {
      const links = [];
      for (const file of good) {
        links.push(await uploadPhoto(file));
      }
      setForm((current) => ({ ...current, photos: [...current.photos, ...links] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index) {
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== index) });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim().slice(0, 80);
    if (!name) return setError("Give the product a name.");

    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price <= 0) return setError("Enter a valid price.");
    if (!Number.isInteger(price)) return setError("Enter the price in whole naira, no kobo.");
    if (price > 100000000) return setError("That price looks too high. Check it again.");

    const payload = {
      name,
      price,
      categoryId: form.categoryId || null,
      tag: form.tag,
      description: form.description.trim().slice(0, 1000),
      photos: form.photos,
      sizes: form.sizes,
      colors: form.colors,
      variants: form.variants,
      soldOut: form.soldOut,
    };

    setSaving(true);
    try {
      if (editingId === "new") {
        const res = await api.post("/products", payload);
        setProducts([withCategoryName(res.product), ...products]);
        // The 7 free days begin on the very first product
        if (res.trialStartedAt) {
          setNotice(`Your 7 free days have started. They end on ${formatDay(res.trialStartedAt)}.`);
        }
      } else {
        const res = await api.put(`/products/${editingId}`, payload);
        setProducts(products.map((p) => (p.id === editingId ? withCategoryName(res.product) : p)));
      }
      setEditingId(null);
    } catch (err) {
      handleWriteError(err, setError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.del(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      handleWriteError(err, setPageError);
    }
  }

  async function addCategory() {
    const name = newCategory.trim().slice(0, 30);
    if (!name) return;
    setPageError("");
    try {
      const res = await api.post("/categories", { name });
      setCategories([...categories, res.category]);
      setNewCategory("");
    } catch (err) {
      handleWriteError(err, setPageError);
    }
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete "${category.name}"? Its products stay, just without a category.`)) return;
    setPageError("");
    try {
      await api.del(`/categories/${category.id}`);
      setCategories(categories.filter((c) => c.id !== category.id));
      setProducts(
        products.map((p) => (p.categoryId === category.id ? { ...p, categoryId: null, category: "" } : p))
      );
      if (filter === category.id) setFilter("All");
    } catch (err) {
      handleWriteError(err, setPageError);
    }
  }

  if (loading) {
    return (
      <div className="prod">
        <p>Loading your products...</p>
      </div>
    );
  }

  return (
    <div className="prod">
      <div className="prod-head">
        <div>
          <h1>Products</h1>
          <p className="prod-sub">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
        <button className="add-btn" onClick={openAdd}>+ Add product</button>
      </div>

      {notice && <p className="prod-sub">{notice}</p>}

      {locked && (
        <p className="prod-error">
          Your trial has ended. <Link to="/dashboard/billing">Pay to keep editing</Link>.
        </p>
      )}

      {pageError && !locked && <p className="prod-error">{pageError}</p>}

      {/* Search */}
      {products.length > 0 && (
        <input
          className="search"
          type="search"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="chips">
          <button className={filter === "All" ? "chip active" : "chip"} onClick={() => setFilter("All")}>
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={filter === c.id ? "chip active" : "chip"}
              onClick={() => setFilter(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Product list */}
      {products.length === 0 ? (
        <div className="empty">
          <p>You haven't added any products yet.</p>
          <button className="add-btn" onClick={openAdd}>Add your first product</button>
        </div>
      ) : shown.length === 0 ? (
        <div className="empty">
          <p>No products match.</p>
        </div>
      ) : (
        <div className="prod-list">
          {shown.map((p) => (
            <div key={p.id} className="prod-row">
              <div className="row-img">
                {p.photos[0] ? <img src={p.photos[0]} alt={p.name} /> : <span>No photo</span>}
              </div>

              <div className="row-info">
                <p className="row-name">{p.name}</p>
                <p className="row-price">
                  {p.variants?.length > 0 ? "From " : ""}
                  {formatNaira(
                    p.variants?.length > 0
                      ? Math.min(...p.variants.map((v) => v.price))
                      : p.price
                  )}
                </p>
                <div className="row-tags">
                  {p.category && <span className="tag">{p.category}</span>}
                  {p.tag && <span className="tag">{p.tag}</span>}
                  {p.variants?.length > 0 && (
                    <span className="tag">{p.variants.length} {words.one}s</span>
                  )}
                  {p.sizes?.length > 0 && <span className="tag">{p.sizes.length} sizes</span>}
                  {p.soldOut && <span className="tag sold">Sold out</span>}
                </div>
              </div>

              <div className="row-actions">
                <button onClick={() => openEdit(p)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage categories */}
      <section className="cat-box">
        <h2>Categories</h2>
        <p className="prod-sub">Group your products so customers find things faster. Optional.</p>
        <div className="cat-list">
          {categories.map((c) => (
            <span key={c.id} className="cat-pill">
              {c.name}
              <button onClick={() => removeCategory(c)} aria-label={`Delete ${c.name}`}>×</button>
            </span>
          ))}
        </div>
        <div className="cat-add">
          <input
            value={newCategory}
            maxLength={30}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="New category, e.g. Dresses"
          />
          <button onClick={addCategory}>Add</button>
        </div>
      </section>

      {/* Add / Edit form */}
      {editingId !== null && (
        <div className="modal-bg" onClick={closeForm}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <div className="modal-head">
              <h2>{editingId === "new" ? "Add product" : "Edit product"}</h2>
              <button type="button" className="x-btn" onClick={closeForm}>✕</button>
            </div>

            <label>
              Photos ({form.photos.length}/{MAX_PHOTOS}){uploading ? " · uploading..." : ""}
            </label>
            <div className="photo-row">
              {form.photos.map((src, i) => (
                <div key={src} className="photo-thumb">
                  <img src={src} alt="" />
                  <button type="button" onClick={() => removePhoto(i)}>×</button>
                </div>
              ))}
              {form.photos.length < MAX_PHOTOS && (
                <label className="photo-add">
                  +
                  <input type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
                </label>
              )}
            </div>

            <label>Product name</label>
            <input name="name" value={form.name} onChange={handleChange}
              maxLength={80} placeholder="Product name" />

            <label>{form.variants.length > 0 ? "Starting price (₦)" : "Price (₦)"}</label>
            <input name="price" type="number" inputMode="numeric" value={form.price}
              onChange={handleChange} placeholder="15000" />
            {form.variants.length > 0 && (
              <p className="prod-sub">
                Customers pay the {words.one} price they pick. This one is only shown before they choose.
              </p>
            )}

            <label>Category (optional)</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <VariantInput
              words={words}
              values={form.variants}
              onChange={(variants) => setForm({ ...form, variants })}
            />

            <ChipInput
              label="Sizes (optional)"
              values={form.sizes}
              onChange={(sizes) => setForm({ ...form, sizes })}
              placeholder="Type a size, e.g. M or 42"
              presets={SIZE_PRESETS}
            />

            <ChipInput
              label="Colours (optional)"
              values={form.colors}
              onChange={(colors) => setForm({ ...form, colors })}
              placeholder="Type a colour, e.g. Black"
            />

            <label>Tag (optional)</label>
            <select name="tag" value={form.tag} onChange={handleChange}>
              <option value="">No tag</option>
              {TAGS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <label>Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange}
              maxLength={1000} placeholder="Material, fit, care, anything customers should know." />

            <label className="check-row">
              <input type="checkbox" name="soldOut" checked={form.soldOut} onChange={handleChange} />
              Mark as sold out
            </label>

            {error && <p className="prod-error">{error}</p>}

            <button type="submit" className="add-btn full" disabled={saving || uploading}>
              {saving ? "Saving..." : editingId === "new" ? "Add product" : "Save changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}