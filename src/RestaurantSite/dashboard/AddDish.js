import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { api, uploadPhoto } from "../../api";
import { FormSkeleton } from "../../components/Skeleton";
import "../../RealEstateSite/dashboard/dashboard.css";

// Common sections. The owner can still type their own below.
const CATEGORIES = ["Rice", "Soups & Swallow", "Grills", "Snacks", "Drinks", "Desserts"];
const STATUSES = ["Available", "Sold out"];

const empty = {
  name: "",
  category: "Rice",
  price: "",
  description: "",
  status: "Available",
  photo: "",
};

// One-tap choices
function Options({ value, list, onPick }) {
  return (
    <div className="rd-opts">
      {list.map((o) => (
        <button type="button" key={o} className={value === o ? "on" : ""} onClick={() => onPick(o)}>{o}</button>
      ))}
    </div>
  );
}

// Route: /dashboard/menu/new  and  /dashboard/menu/:id
export default function AddDish() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = id && id !== "new";
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!!editing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    api.get(`/dishes/${id}`)
      .then((res) => {
        if (cancelled) return;
        const x = res.dish;
        setForm({ ...empty, ...x, price: String(x.price), photo: x.photo || "", description: x.description || "" });
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, editing]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function handlePhoto(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      return setError("Choose a photo smaller than 5MB.");
    }
    setError("");
    setUploading(true);
    try {
      set("photo", await uploadPhoto(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const name = form.name.trim();
    const category = form.category.trim();
    const price = Number(form.price);

    if (!name) return setError("Give the dish a name.");
    if (!category) return setError("Choose or type a section, for example Rice.");
    if (!form.price || !Number.isInteger(price) || price <= 0) return setError("Enter the price in whole naira.");

    const payload = { ...form, name, category, price, description: form.description.trim() };

    setSaving(true);
    try {
      if (editing) await api.put(`/dishes/${id}`, payload);
      else await api.post("/dishes", payload);
      navigate("/dashboard/menu");
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <div className="rd"><FormSkeleton fields={5} /></div>;

  return (
    <form id="dish-form" className="rd rd-form" onSubmit={handleSave}>
      <h1>{editing ? "Edit dish" : "Add dish"}</h1>

      <label>Photo{uploading ? " · uploading..." : ""}</label>
      <div className="rd-photos">
        {form.photo && (
          <div className="rd-photo" style={{ backgroundImage: `url(${form.photo})` }}>
            <button type="button" onClick={() => set("photo", "")}>×</button>
          </div>
        )}
        {!form.photo && (
          <label className="rd-add">+<input type="file" accept="image/*" hidden onChange={handlePhoto} /></label>
        )}
      </div>

      <label>Dish name</label>
      <input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={60} placeholder="Party jollof rice" />

      <label>Section</label>
      <Options value={form.category} list={CATEGORIES} onPick={(v) => set("category", v)} />
      <input value={form.category} onChange={(e) => set("category", e.target.value)} maxLength={30} placeholder="Or type your own section" />

      <label>Price (₦)</label>
      <input type="number" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="3500" />

      <label>Description (optional)</label>
      <textarea value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={200} placeholder="Smoky jollof with fried plantain and chicken." />

      <label>Status</label>
      <Options value={form.status} list={STATUSES} onPick={(v) => set("status", v)} />

      {createPortal(
        <div className="rd-savebar">
          {error && <p className="toast">{error}</p>}
          <button type="submit" form="dish-form" disabled={saving || uploading}>
            {saving ? "Saving..." : "Save dish"}
          </button>
        </div>,
        document.body
      )}
    </form>
  );
}