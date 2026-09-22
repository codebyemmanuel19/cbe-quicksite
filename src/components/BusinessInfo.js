import { useState } from "react";
import "./BusinessInfo.css";

// Fake starting data until the backend is connected
const initialInfo = {
  businessName: "Kemi's Boutique",
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
        <h2>Logo and cover</h2>

        <div className="cover-box" style={cover ? { backgroundImage: `url(${cover})` } : {}}>
          {!cover && <span>No cover image yet</span>}
          <label className="img-btn cover-btn">
            {cover ? "Change cover" : "Add cover"}
            <input type="file" accept="image/*" hidden onChange={(e) => handleImage(e, setCover)} />
          </label>
        </div>

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
        <input name="businessName" value={info.businessName} onChange={handleChange} />

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
        <input name="whatsapp" type="tel" value={info.whatsapp} onChange={handleChange} />
        <p className="hint">Orders from your website go here.</p>

        <label>Phone number (optional)</label>
        <input name="phone" type="tel" value={info.phone} onChange={handleChange}
          placeholder="If different from WhatsApp" />

        <label>Email (optional)</label>
        <input name="email" type="email" value={info.email} onChange={handleChange}
          placeholder="you@gmail.com" />

        <label>Address (optional)</label>
        <input name="address" value={info.address} onChange={handleChange}
          placeholder="Shop address or area" />
      </section>

      <section className="biz-card">
        <h2>Social media</h2>

        <label>TikTok</label>
        <input name="tiktok" value={info.tiktok} onChange={handleChange} placeholder="@yourshop" />

        <label>Facebook</label>
        <input name="facebook" value={info.facebook} onChange={handleChange}
          placeholder="facebook.com/yourshop" />

        <label>Instagram</label>
        <input name="instagram" value={info.instagram} onChange={handleChange} placeholder="@yourshop" />
      </section>

      {error && <p className="biz-error">{error}</p>}

      <div className="save-bar">
        {saved && <span className="saved">Saved ✓</span>}
        <button type="submit" className="save-btn">Save changes</button>
      </div>
    </form>
  );
}