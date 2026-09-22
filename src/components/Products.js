import { useState } from "react";
import "./Products.css";

const MAX_PHOTOS = 4;

// Starts empty, like a brand-new vendor. Add products to test the list.
const startingCategories = [];
const startingProducts = [];

const emptyForm = { name: "", price: "", category: "", description: "", photos: [], soldOut: false };

function formatNaira(amount) {
  return "₦" + Number(amount).toLocaleString("en-NG");
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
    setForm({ ...product, price: String(product.price) });
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

    if (!form.name.trim()) return setError("Give the product a name.");
    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price <= 0) return setError("Enter a valid price.");

    const product = { ...form, name: form.name.trim(), price };

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
    const name = newCategory.trim();
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
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="New category, e.g. Face care"
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
            <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" />

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

            <label>Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange}
              placeholder="Sizes, colours, ingredients, anything customers should know." />

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