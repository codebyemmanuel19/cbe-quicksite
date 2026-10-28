import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { api, uploadPhoto } from "../../api";
import { FormSkeleton } from "../../components/Skeleton";
import { prepareImage } from "../../components/prepareImage";
import "../../components/PhotoUpload.css";
import "../../RealEstateSite/dashboard/dashboard.css";

const MAX_PHOTOS = 10;

const CONDITIONS = ["Brand new", "Foreign used", "Nigerian used"];
const GEARS = ["Automatic", "Manual"];
const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"];
const STATUSES = ["Available", "Reserved", "Sold"];

const empty = {
  make: "",
  model: "",
  year: "",
  price: "",
  condition: "Foreign used",
  mileage: "",
  transmission: "Automatic",
  fuel: "Petrol",
  color: "",
  location: "",
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

// Route: /dashboard/cars/new  and  /dashboard/cars/:id
export default function AddCar() {
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
    api.get(`/cars/${id}`)
      .then((res) => {
        if (cancelled) return;
        const c = res.car;
        setForm({
          ...empty,
          ...c,
          year: c.year ?? "",
          price: String(c.price),
          mileage: c.mileage ?? "",
          color: c.color || "",
          photos: c.photos || [],
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
    const make = form.make.trim();
    const model = form.model.trim();
    const price = Number(form.price);
    const year = form.year === "" ? null : Number(form.year);
    const thisYear = new Date().getFullYear();

    if (!make) return setError("Enter the make, for example Toyota.");
    if (!model) return setError("Enter the model, for example Camry.");
    if (year !== null && (!Number.isInteger(year) || year < 1980 || year > thisYear + 1)) {
      return setError("Enter a real year, for example 2018.");
    }
    if (!form.price || !Number.isInteger(price) || price <= 0) return setError("Enter the price in whole naira.");
    if (!form.location.trim()) return setError("Enter where the car is.");

    // The title is built for them, so they never type it twice
    const title = [year, make, model].filter(Boolean).join(" ");

    const payload = {
      ...form,
      title,
      make,
      model,
      year,
      price,
      mileage: form.mileage === "" ? null : Number(form.mileage),
      color: form.color.trim(),
      location: form.location.trim(),
    };

    setSaving(true);
    try {
      if (editing) await api.put(`/cars/${id}`, payload);
      else await api.post("/cars", payload);
      navigate("/dashboard/cars");
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <div className="rd"><FormSkeleton fields={6} /></div>;

  return (
    <form id="car-form" className="rd rd-form" onSubmit={handleSave}>
      <h1>{editing ? "Edit car" : "Add car"}</h1>

      <label>Photos ({form.photos.length + pending.length}/{MAX_PHOTOS})</label>
      <div className="rd-photos">
        {form.photos.map((src, i) => (
          <div key={src} className="rd-photo" style={{ backgroundImage: `url(${src})` }}>
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

      <label>Make</label>
      <input value={form.make} onChange={(e) => set("make", e.target.value)} maxLength={30} placeholder="Toyota" />

      <label>Model</label>
      <input value={form.model} onChange={(e) => set("model", e.target.value)} maxLength={40} placeholder="Camry XLE" />

      <label>Year</label>
      <input type="number" inputMode="numeric" value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2018" />

      <label>Price (₦)</label>
      <input type="number" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="12500000" />

      <label>Condition</label>
      <Options value={form.condition} list={CONDITIONS} onPick={(v) => set("condition", v)} />

      <label>Mileage in km (optional)</label>
      <input type="number" inputMode="numeric" value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="65000" />

      <label>Gearbox</label>
      <Options value={form.transmission} list={GEARS} onPick={(v) => set("transmission", v)} />

      <label>Fuel</label>
      <Options value={form.fuel} list={FUELS} onPick={(v) => set("fuel", v)} />

      <label>Colour (optional)</label>
      <input value={form.color} onChange={(e) => set("color", e.target.value)} maxLength={20} placeholder="Black" />

      <label>Where is the car?</label>
      <input value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={80} placeholder="Wuse 2, Abuja" />

      <label>Status</label>
      <Options value={form.status} list={STATUSES} onPick={(v) => set("status", v)} />

      <label>Description</label>
      <textarea value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} placeholder="Accident free, first body, fresh inside." />

      {createPortal(
        <div className="rd-savebar">
          {error && <p className="toast">{error}</p>}
          <button type="submit" form="car-form" disabled={saving || uploading}>
            {saving ? "Saving..." : "Save car"}
          </button>
        </div>,
        document.body
      )}
    </form>
  );
}