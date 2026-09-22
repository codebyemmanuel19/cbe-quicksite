import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { COUNTRIES } from "./countries";
import "./Setup.css";

const TYPES = [
  { id: "clothing", icon: "👗", name: "Clothing & Fashion", desc: "Dresses, thrift, bags, shoes", ready: true },
  { id: "hair", icon: "💇", name: "Hair & Wigs", desc: "Wigs, bundles, frontals", ready: false },
  { id: "skincare", icon: "🧴", name: "Skincare & Body Care", desc: "Creams, serums, soaps, oils", ready: false },
  { id: "perfume", icon: "🌸", name: "Perfume & Fragrance", desc: "Perfumes, oils, body mists", ready: false },
  { id: "jewellery", icon: "💍", name: "Jewellery & Accessories", desc: "Watches, bracelets, glasses", ready: false },
  { id: "gadgets", icon: "🎧", name: "Gadgets & Accessories", desc: "Earbuds, chargers, phone cases", ready: false },
];

// Addresses no customer can take, because you need them
const RESERVED = ["www", "app", "api", "admin", "dashboard", "mail", "support", "login", "signup"];

// "Kemi's Boutique" -> "kemisboutique"
function makeSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 30);
}

function checkSlug(slug) {
  if (slug.length < 3) return "Must be at least 3 characters.";
  if (!/^[a-z0-9-]+$/.test(slug)) return "Only small letters, numbers and dashes.";
  if (slug.startsWith("-") || slug.endsWith("-")) return "Can't start or end with a dash.";
  if (RESERVED.includes(slug)) return "That name is reserved. Try another.";
  return "";
}

export default function Setup() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("NG");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");

  const selectedCountry = COUNTRIES.find((c) => c.code === country);

  function handleName(e) {
    setName(e.target.value);
    // The address follows the name until the user edits it themselves
    if (!slugEdited) setSlug(makeSlug(e.target.value));
  }

  function handleSlug(e) {
    setSlugEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30));
  }

  const slugError = slug ? checkSlug(slug) : "";

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!type) return setError("Choose your business type.");
    if (!name.trim()) return setError("Enter your business name.");
    if (!slug || slugError) return setError(slugError || "Choose your website address.");

    // Accepts "0801 234 5678" or "+234 801 234 5678", keeps only the local part
    let digits = whatsapp.replace(/\D/g, "");
    if (digits.startsWith(selectedCountry.phoneCode) && digits.length > 10) {
      digits = digits.slice(selectedCountry.phoneCode.length);
    }
    digits = digits.replace(/^0+/, "");

    if (digits.length < 7 || digits.length > 12) {
      return setError("Enter a valid WhatsApp number.");
    }

    // No backend yet: this is exactly what we'll send to the server later
    const site = {
      country,
      currency: selectedCountry.currency,
      type,
      name: name.trim(),
      slug,
      whatsapp: selectedCountry.phoneCode + digits, // e.g. 2348012345678
    };
    console.log("New site:", site);

    navigate("/dashboard");
  }

  return (
    <div className="setup-page">
      <form className="setup-card" onSubmit={handleSubmit}>
        <h1>Set up your website</h1>
        <p className="setup-sub">Four quick steps and your site goes live.</p>

        <h2 className="setup-step">1. Where is your business?</h2>
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code} disabled={!c.live}>
              {c.flag} {c.name}{c.live ? "" : " (coming soon)"}
            </option>
          ))}
        </select>

        <h2 className="setup-step">2. What kind of business?</h2>
        <div className="type-grid">
          {TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={!t.ready}
              className={type === t.id ? "type-card selected" : "type-card"}
              onClick={() => setType(t.id)}
            >
              <span className="type-icon">{t.icon}</span>
              <span className="type-name">{t.name}</span>
              <span className="type-desc">{t.desc}</span>
              {!t.ready && <span className="soon">Coming soon</span>}
            </button>
          ))}
        </div>

        <h2 className="setup-step">3. Your business</h2>
        <label>Business name</label>
        <input value={name} onChange={handleName} placeholder="Kemi's Boutique" />

        <label>Website address</label>
        <div className="slug-row">
          <input value={slug} onChange={handleSlug} placeholder="kemisboutique" />
          <span className="slug-domain">.cbequicksite.com</span>
        </div>
        {slugError ? (
          <p className="slug-error">{slugError}</p>
        ) : slug ? (
          <p className="slug-preview">
            Your website: <strong>{slug}.cbequicksite.com</strong>
          </p>
        ) : null}

        <h2 className="setup-step">4. Where customers reach you</h2>
        <label>WhatsApp number</label>
        <div className="phone-row">
          <span className="phone-code">+{selectedCountry.phoneCode}</span>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="801 234 5678"
          />
        </div>
        <p className="hint">Orders from your website go to this number.</p>

        {error && <p className="setup-error">{error}</p>}

        <button type="submit" className="setup-btn">Create my website</button>

        <p className="setup-help">
          Don't understand something?{" "}
          <a
            href="https://wa.me/2349027090880?text=Hi%2C%20I%20need%20help%20setting%20up%20my%20CBE%20QuickSite"
            target="_blank"
            rel="noreferrer"
          >
            Contact support
          </a>
        </p>
      </form>
    </div>
  );
}