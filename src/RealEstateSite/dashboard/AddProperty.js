import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { api, uploadPhoto } from "../../api";
import "./dashboard.css";

const MAX_PHOTOS = 8;

const empty = {
  title: "",
  type: "House",
  listing: "Sale",
  price: "",
  location: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
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

// Route: /dashboard/properties/new  and  /dashboard/properties/:id
export default function AddProperty() {
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
    api.get(`/properties/${id}`)
      .then((res) => {
        if (cancelled) return;
        const p = res.property;
        setForm({ ...empty, ...p, price: String(p.price), bedrooms: p.bedrooms ?? "", bathrooms: p.bathrooms ?? "", size: p.size || "", photos: p.photos || [] });
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, editing]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function handlePhotos(e) {
    const files = Array.from(e.target.files);
    e.target.value = "";
    const room = MAX_PHOTOS - form.photos.length;
    const good = files.filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024).slice(0, room);
    if (!good.length) return;
    setError("");
    setUploading(true);
    try {
      const links = [];
      for (const file of good) links.push(await uploadPhoto(file));
      setForm((f) => ({ ...f, photos: [...f.photos, ...links] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const title = form.title.trim();
    const price = Number(form.price);
    if (!title) return setError("Give the property a title.");
    if (!form.price || !Number.isInteger(price) || price <= 0) return setError("Enter the price in whole naira.");
    if (!form.location.trim()) return setError("Enter the location.");

    const payload = {
      ...form,
      title,
      price,
      location: form.location.trim(),
      bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms),
      bathrooms: form.bathrooms === "" ? null : Number(form.bathrooms),
    };

    setSaving(true);
    try {
      if (editing) await api.put(`/properties/${id}`, payload);
      else await api.post("/properties", payload);
      navigate("/dashboard/properties");
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.locked ? "Your trial has ended. Pay to keep editing your website." : err.message);
      setSaving(false);
    }
  }

  if (loading) return <div className="rd"><p>Loading...</p></div>;

  return (
    <form id="property-form" className="rd rd-form" onSubmit={handleSave}>
      <h1>{editing ? "Edit property" : "Add property"}</h1>

      <label>Photos ({form.photos.length}/{MAX_PHOTOS}){uploading ? " · uploading..." : ""}</label>
      <div className="rd-photos">
        {form.photos.map((src, i) => (
          <div key={src} className="rd-photo" style={{ backgroundImage: `url(${src})` }}>
            <button type="button" onClick={() => set("photos", form.photos.filter((_, n) => n !== i))}>×</button>
          </div>
        ))}
        {form.photos.length < MAX_PHOTOS && (
          <label className="rd-add">+<input type="file" accept="image/*" multiple hidden onChange={handlePhotos} /></label>
        )}
      </div>

      <label>Property title</label>
      <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={80} placeholder="3-bedroom flat" />

      <label>Type</label>
      <Options value={form.type} list={["House", "Flat", "Land"]} onPick={(v) => set("type", v)} />

      <label>For</label>
      <Options value={form.listing} list={["Sale", "Rent"]} onPick={(v) => set("listing", v)} />

      <label>{form.listing === "Rent" ? "Rent per year (₦)" : "Price (₦)"}</label>
      <input type="number" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="45000000" />

      <label>Location</label>
      <input value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={80} placeholder="Gwarinpa, Abuja" />

      {form.type !== "Land" && (
        <>
          <label>Bedrooms</label>
          <Options value={String(form.bedrooms)} list={["1", "2", "3", "4", "5"]} onPick={(v) => set("bedrooms", v)} />
          <label>Bathrooms</label>
          <Options value={String(form.bathrooms)} list={["1", "2", "3", "4", "5"]} onPick={(v) => set("bathrooms", v)} />
        </>
      )}

      <label>Size (optional)</label>
      <input value={form.size} onChange={(e) => set("size", e.target.value)} maxLength={30} placeholder="600 sqm" />

      <label>Status</label>
      <Options value={form.status} list={["Available", "Sold", "Rented"]} onPick={(v) => set("status", v)} />

      <label>Description</label>
      <textarea value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} placeholder="Anything buyers should know." />

      {createPortal(
        <div className="rd-savebar">
          {error && <p className="toast">{error}</p>}
          <button type="submit" form="property-form" disabled={saving || uploading}>
            {saving ? "Saving..." : "Save property"}
          </button>
        </div>,
        document.body
      )}
    </form>
  );
}