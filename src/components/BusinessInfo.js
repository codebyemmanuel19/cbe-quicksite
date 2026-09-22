import { useState } from "react";
import "./BusinessInfo.css";

// Fake starting data until the backend is connected
const initialInfo = {
  businessName: "Kemi's Boutique",
  heroLabel: "New collection",
  heroHeadline: "",
  whatsapp: "08012345678",
  phone: "",
  email: "",
  address: "",
  about: "",
  tiktok: "",
  facebook: "",
  instagram: "",
};

export default function BusinessInfo() {
  const [info, setInfo] = useState(initialInfo);
  const [logo, setLogo] = useState(null);
  const [cover, setCover] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setInfo({ ...info, [e.target.name]: e.target.value });
    setSaved(false);
  }

  // Shows a preview of the picked image (real upload comes with Cloudinary later)
  function handleImage(e, setImage) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please pick an image file.");
    if (file.size > 5 * 1024 * 1024) return setError("Image must be smaller than 5MB.");
    setError("");
    setImage(URL.createObjectURL(file));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!info.businessName.trim()) return setError("Business name can't be empty.");
    if (info.whatsapp.replace(/\D/g, "").length < 10) {
      return setError("Enter a valid WhatsApp number.");
    }

    // No backend yet: pretend it saved
    setSaved(true);
  }

  return (
    <form className="biz" onSubmit={handleSave}>
      <h1 className="biz-title">Business Info</h1>
      <p className="biz-sub">This is what customers see on your website.</p>

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
            {cover ? "Change photo" : "Add photo"}
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
            {logo ? "Change logo" : "Add logo"}
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
        <button type="submit" className="save-btn">Save changes</button>
      </div>
    </form>
  );
}