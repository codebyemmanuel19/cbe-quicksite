import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { api, uploadPhoto } from "../../api";
import { FormSkeleton } from "../../components/Skeleton";
import { prepareImage } from "../../components/prepareImage";
import "../../components/PhotoUpload.css";
import "../../RealEstateSite/dashboard/dashboard.css";

const MAX_PHOTOS = 6;

// Common categories. The owner can still type their own below.
const CATEGORIES = ["Sofas", "Beds", "Dining", "Tables", "Chairs", "Wardrobes", "Office"];
const AVAILABILITY = ["In stock", "Made to order"];
const STATUSES = ["Available", "Sold out"];

const empty = {
  name: "",
  category: "Sofas",
  price: "",
  dimensions: "",
  material: "",
  color: "",
  availability: "In stock",
  status: "Available",
  description: "",
  photos: [],
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

// Route: /dashboard/furniture/new  and  /dashboard/furniture/:id
export default function AddItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = id && id !== "new";
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!!editing);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState([]); // photos still uploading
  const uploading = pending.length > 0;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    api.get(`/furniture/${id}`)
      .then((res) => {
        if (cancelled) return;
        const x = res.item;
        setForm({
          ...empty,
          ...x,
          price: String(x.price),
          dimensions: x.dimensions || "",
          material: x.material || "",
          color: x.color || "",
          description: x.description || "",
          photos: x.photos || [],
        });
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, editing]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Photos show at once, then shrink and upload in the background.
  async function handlePhotos(e) {
    const files = Array.from(e.target.files);
    e.target.value = "";
    setError("");

    const room = MAX_PHOTOS - form.photos.length - pending.length;
    const good = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 25 * 1024 * 1024)
      .slice(0, Math.max(room, 0));
    if (!good.length) return;

    const items = good.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setPending((cur) => [...cur, ...items]);

    const results = await Promise.allSettled(
      items.map(async (item) => {
        return uploadPhoto(await prepareImage(item.file));
      })
    );

    const links = [];
    let failed = 0;
    let lastMessage = "";
    results.forEach((r) => {
      if (r.status === "fulfilled") links.push(r.value);
      else {
        failed++;
        lastMessage = (r.reason && r.reason.message) || "";
      }
    });

    if (links.length) {
      setForm((f) => ({ ...f, photos: [...f.photos, ...links].slice(0, MAX_PHOTOS) }));
    }
    if (failed) setError(lastMessage || `${failed} photo(s) could not be added. Try a different photo.`);

    items.forEach((it) => URL.revokeObjectURL(it.preview));
    const done = items.map((it) => it.id);
    setPending((cur) => cur.filter((p) => !done.includes(p.id)));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const name = form.name.trim();
    const category = form.category.trim();
    const price = Number(form.price);

    if (!name) return setError("Give the piece a name, for example 3-seater leather sofa.");
    if (!category) return setError("Choose or type a category, for example Sofas.");
    if (!form.price || !Number.isInteger(price) || price <= 0) return setError("Enter the price in whole naira.");

    const payload = {
      ...form,
      name,
      category,
      price,
      dimensions: form.dimensions.trim(),
      material: form.material.trim(),
      color: form.color.trim(),
      description: form.description.trim(),
    };

    setSaving(true);
    try {
      if (editing) await api.put(`/furniture/${id}`, payload);
      else await api.post("/furniture", payload);
      navigate("/dashboard/furniture");
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <div className="rd"><FormSkeleton fields={7} /></div>;

  return (
    <form id="furniture-form" className="rd rd-form" onSubmit={handleSave}>
      <h1>{editing ? "Edit piece" : "Add piece"}</h1>

      <label>Photos ({form.photos.length + pending.length}/{MAX_PHOTOS})</label>
      <div className="rd-photos">
        {form.photos.map((src, i) => (
          <div key={src} className="rd-photo" style={{ backgroundImage: `url("${src}")` }}>
            <button type="button" onClick={() => set("photos", form.photos.filter((_, n) => n !== i))}>×</button>
          </div>
        ))}
        {pending.map((p) => (
          <div key={p.id} className="rd-photo pending" style={{ backgroundImage: `url(${p.preview})` }}>
            <span className="photo-spin" />
          </div>
        ))}
        {form.photos.length + pending.length < MAX_PHOTOS && (
          <label className="rd-add">+<input type="file" accept="image/*" multiple hidden onChange={handlePhotos} /></label>
        )}
      </div>

      <label>Name</label>
      <input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={80} placeholder="3-seater leather sofa" />

      <label>Category</label>
      <Options value={form.category} list={CATEGORIES} onPick={(v) => set("category", v)} />
      <input value={form.category} onChange={(e) => set("category", e.target.value)} maxLength={30} placeholder="Or type your own category" />

      <label>Price (₦)</label>
      <input type="number" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="450000" />

      <label>Size (optional)</label>
      <input value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} maxLength={60} placeholder="220 x 90 x 85 cm" />

      <label>Material (optional)</label>
      <input value={form.material} onChange={(e) => set("material", e.target.value)} maxLength={40} placeholder="Leather, mahogany, fabric" />

      <label>Colour (optional)</label>
      <input value={form.color} onChange={(e) => set("color", e.target.value)} maxLength={30} placeholder="Brown" />

      <label>Availability</label>
      <Options value={form.availability} list={AVAILABILITY} onPick={(v) => set("availability", v)} />

      <label>Status</label>
      <Options value={form.status} list={STATUSES} onPick={(v) => set("status", v)} />

      <label>Description (optional)</label>
      <textarea value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} placeholder="Solid wood frame, high density foam, 1 year repair warranty." />

      {createPortal(
        <div className="rd-savebar">
          {error && <p className="toast">{error}</p>}
          <button type="submit" form="furniture-form" disabled={saving || uploading}>
            {saving ? "Saving..." : "Save piece"}
          </button>
        </div>,
        document.body
      )}
    </form>
  );
}