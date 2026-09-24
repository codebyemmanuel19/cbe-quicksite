import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, uploadPhoto } from "../api";
import "./BusinessInfo.css";

const emptyInfo = {
  businessName: "",
  heroLabel: "",
  heroHeadline: "",
  whatsapp: "",
  phone: "",
  email: "",
  address: "",
  about: "",
  tiktok: "",
  facebook: "",
  instagram: "",
};

export default function BusinessInfo() {
  const navigate = useNavigate();
  const [info, setInfo] = useState(emptyInfo);
  const [logo, setLogo] = useState("");
  const [cover, setCover] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mine = await api.get("/sites/me");
        if (cancelled) return;
        const b = mine.site.business;
        setInfo({
          businessName: b.businessName || "",
          heroLabel: b.heroLabel || "",
          heroHeadline: b.heroHeadline || "",
          whatsapp: b.whatsapp || "",
          phone: b.phone || "",
          email: b.email || "",
          address: b.address || "",
          about: b.about || "",
          tiktok: b.tiktok || "",
          facebook: b.facebook || "",
          instagram: b.instagram || "",
        });
        setLogo(b.logo || "");
        setCover(b.cover || "");
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 404) return navigate("/setup");
        setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleChange(e) {
    setInfo({ ...info, [e.target.name]: e.target.value });
    setSaved(false);
  }

  // Goes straight to Cloudinary. The server refuses any link that didn't come from there.
  async function handleImage(e, setImage) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please pick an image file.");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be smaller than 5MB.");

    setError("");
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      setImage(url);
      setSaved(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!info.businessName.trim()) return setError("Business name can't be empty.");
    if (info.whatsapp.replace(/\D/g, "").length < 10) {
      return setError("Enter a valid WhatsApp number.");
    }

    setSaving(true);
    try {
      const res = await api.put("/sites/business", { ...info, logo, cover });
      // Show exactly what the server stored, not what we typed
      const b = res.site.business;
      setInfo({
        businessName: b.businessName || "",
        heroLabel: b.heroLabel || "",
        heroHeadline: b.heroHeadline || "",
        whatsapp: b.whatsapp || "",
        phone: b.phone || "",
        email: b.email || "",
        address: b.address || "",
        about: b.about || "",
        tiktok: b.tiktok || "",
        facebook: b.facebook || "",
        instagram: b.instagram || "",
      });
      setLogo(b.logo || "");
      setCover(b.cover || "");
      setSaved(true);
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      if (err.locked) {
        setLocked(true);
        setError("Your trial has ended. Pay to keep editing your website.");
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="biz">
        <p>Loading your business info...</p>
      </div>
    );
  }

  return (
    <form className="biz" onSubmit={handleSave}>
      <h1 className="biz-title">Business Info</h1>
      <p className="biz-sub">This is what customers see on your website.</p>

      {locked && (
        <p className="biz-error">
          Your trial has ended. <Link to="/dashboard/billing">Pay to keep editing</Link>.
        </p>
      )}

      <section className="biz-card">
        <h2>Homepage</h2>
        <p className="hint">The first thing customers see. A tall photo works best.</p>

        {/* Live preview of the top of their website */}
        <div
          className="hero-preview"
          style={cover ? { backgroundImage: `url(${cover})` } : {}}
        >
          {!cover && <span className="hero-empty">Add your big photo</span>}
          <div className="hero-preview-text">
            {info.heroLabel && <p className="hp-label">{info.heroLabel}</p>}
            <p className="hp-title">{info.heroHeadline || info.businessName}</p>
            <p className="hp-btn">Shop now</p>
          </div>
          <label className="img-btn hero-btn-change">
            {uploading ? "Uploading..." : cover ? "Change photo" : "Add photo"}
            <input type="file" accept="image/*" hidden onChange={(e) => handleImage(e, setCover)} />
          </label>
        </div>

        <label>Small label (optional)</label>
        <input
          name="heroLabel"
          value={info.heroLabel}
          onChange={handleChange}
          maxLength={30}
          placeholder="e.g. New collection"
        />

        <label>Headline (optional)</label>
        <input
          name="heroHeadline"
          value={info.heroHeadline}
          onChange={handleChange}
          maxLength={40}
          placeholder="e.g. The Weekend Edit"
        />
        <p className="hint">Leave it empty and your business name shows instead.</p>

        <div className="logo-row">
          <div className="logo-box">
            {logo ? <img src={logo} alt="Logo" /> : <span>Logo</span>}
          </div>
          <label className="img-btn">
            {uploading ? "Uploading..." : logo ? "Change logo" : "Add logo"}
            <input type="file" accept="image/*" hidden onChange={(e) => handleImage(e, setLogo)} />
          </label>
        </div>
      </section>

      <section className="biz-card">
        <h2>Basic details</h2>

        <label>Business name</label>
        <input name="businessName" value={info.businessName} onChange={handleChange} maxLength={50} />

        <label>About your business</label>
        <textarea
          name="about"
          rows={4}
          maxLength={500}
          value={info.about}
          onChange={handleChange}
          placeholder="Tell customers what you sell and why they should buy from you."
        />
        <p className="counter">{info.about.length}/500</p>
      </section>

      <section className="biz-card">
        <h2>Contact</h2>

        <label>WhatsApp number</label>
        <input name="whatsapp" type="tel" value={info.whatsapp} onChange={handleChange} maxLength={20} />
        <p className="hint">Orders from your website go here.</p>

        <label>Phone number (optional)</label>
        <input name="phone" type="tel" value={info.phone} onChange={handleChange}
          maxLength={20} placeholder="If different from WhatsApp" />

        <label>Email (optional)</label>
        <input name="email" type="email" value={info.email} onChange={handleChange}
          maxLength={100} placeholder="you@gmail.com" />

        <label>Address (optional)</label>
        <input name="address" value={info.address} onChange={handleChange}
          maxLength={150} placeholder="Shop address or area" />
      </section>

      <section className="biz-card">
        <h2>Social media</h2>

        <label>TikTok</label>
        <input name="tiktok" value={info.tiktok} onChange={handleChange}
          maxLength={100} placeholder="@yourshop" />

        <label>Facebook</label>
        <input name="facebook" value={info.facebook} onChange={handleChange}
          maxLength={100} placeholder="facebook.com/yourshop" />

        <label>Instagram</label>
        <input name="instagram" value={info.instagram} onChange={handleChange}
          maxLength={100} placeholder="@yourshop" />
      </section>

      {error && <p className="biz-error">{error}</p>}

      <div className="save-bar">
        {saved && <span className="saved">Saved ✓</span>}
        <button type="submit" className="save-btn" disabled={saving || uploading}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}