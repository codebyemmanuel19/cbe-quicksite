import { useState } from "react";
import "./Products.css";

const MAX_PHOTOS = 4;
const MAX_OPTIONS = 20;

const TAGS = ["New", "Most loved", "Pre-order", "Limited", "Sale"];

const SIZE_PRESETS = [
  { label: "S – XL", values: ["S", "M", "L", "XL"] },
  { label: "XS – XXL", values: ["XS", "S", "M", "L", "XL", "XXL"] },
  { label: "UK 6 – 16", values: ["6", "8", "10", "12", "14", "16"] },
  { label: "Shoes 38 – 45", values: ["38", "39", "40", "41", "42", "43", "44", "45"] },
];

// Starts empty, like a brand-new vendor. Add products to test the list.
const startingCategories = [];
const startingProducts = [];

const emptyForm = {
  name: "",
  price: "",
  category: "",
  tag: "",
  description: "",
  photos: [],
  sizes: [],
  colors: [],
  soldOut: false,
};

function formatNaira(amount) {
  return "₦" + Number(amount).toLocaleString("en-NG");
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

export default function Products() {
  const [products, setProducts] = useState(startingProducts);
  const [categories, setCategories] = useState(startingCategories);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null); // null = closed, "new" = adding
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  // Category filter + search together
  const shown = products.filter((p) => {
    const inCategory = filter === "All" || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
    return inCategory && matchesSearch;
  });

  function openAdd() {
    setForm(emptyForm);
    setError("");
    setEditingId("new");
  }

  function openEdit(product) {
    setForm({ ...emptyForm, ...product, price: String(product.price) });
    setError("");
    setEditingId(product.id);
  }

  function closeForm() {
    setEditingId(null);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  // Previews only for now; real upload comes with Cloudinary later
  function handlePhotos(e) {
    const files = Array.from(e.target.files);
    const room = MAX_PHOTOS - form.photos.length;
    if (files.length > room) setError(`You can add up to ${MAX_PHOTOS} photos.`);

    const good = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, room);

    setForm({ ...form, photos: [...form.photos, ...good.map((f) => URL.createObjectURL(f))] });
    e.target.value = ""; // lets them pick the same file again
  }

  function removePhoto(index) {
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== index) });
  }

  function handleSave(e) {
    e.preventDefault();
    setError("");

    const name = form.name.trim().slice(0, 80);
    if (!name) return setError("Give the product a name.");

    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price <= 0) return setError("Enter a valid price.");
    if (price > 100000000) return setError("That price looks too high. Check it again.");

    const product = {
      ...form,
      name,
      price,
      description: form.description.trim().slice(0, 1000),
    };

    if (editingId === "new") {
      setProducts([{ ...product, id: Date.now() }, ...products]);
    } else {
      setProducts(products.map((p) => (p.id === editingId ? { ...product, id: editingId } : p)));
    }
    closeForm();
  }

  function handleDelete(id) {
    if (window.confirm("Delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  }

  function addCategory() {
    const name = newCategory.trim().slice(0, 30);
    if (!name || categories.includes(name)) return;
    setCategories([...categories, name]);
    setNewCategory("");
  }

  function removeCategory(name) {
    if (!window.confirm(`Delete "${name}"? Its products stay, just without a category.`)) return;
    setCategories(categories.filter((c) => c !== name));
    setProducts(products.map((p) => (p.category === name ? { ...p, category: "" } : p)));
    if (filter === name) setFilter("All");
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
          {["All", ...categories].map((c) => (
            <button key={c} className={filter === c ? "chip active" : "chip"} onClick={() => setFilter(c)}>
              {c}
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
                <p className="row-price">{formatNaira(p.price)}</p>
                <div className="row-tags">
                  {p.category && <span className="tag">{p.category}</span>}
                  {p.tag && <span className="tag">{p.tag}</span>}
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
            <span key={c} className="cat-pill">
              {c}
              <button onClick={() => removeCategory(c)} aria-label={`Delete ${c}`}>×</button>
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

            <label>Photos ({form.photos.length}/{MAX_PHOTOS})</label>
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

            <label>Price (₦)</label>
            <input name="price" type="number" inputMode="numeric" value={form.price}
              onChange={handleChange} placeholder="15000" />

            <label>Category (optional)</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

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

            <button type="submit" className="add-btn full">
              {editingId === "new" ? "Add product" : "Save changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}