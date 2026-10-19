import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

import { COUNTRIES } from "./countries";
import "./Setup.css";

// Every template that is built can be picked here.
// Adding a new business type later = add one more block to this list.
// Add  soon: true  to show it as "Coming soon" (it can't be picked yet).
// Add  keywords: "word word"  so the search box can find it by other words.
const TYPES = [
  {
    id: "clothing",
    icon: "👗",
    name: "Clothing & Fashion",
    desc: "Clothing, shoes, native wear & accessories",
    keywords: "fashion boutique shoes bags tailor native wear ankara",
  },
  {
    id: "hair",
    icon: "💇",
    name: "Hair & Wigs",
    desc: "Wigs, bundles, frontals & extensions",
    keywords: "hair wig bundle frontal braids salon",
  },
  {
    id: "realestate",
    icon: "🏠",
    name: "Real Estate",
    desc: "Houses, flats & land for sale or rent",
    keywords: "property house flat land agent rent sale apartment",
  },
  {
    id: "cars",
    icon: "🚗",
    name: "Car Dealer",
    desc: "New & used cars for sale",
    keywords: "car auto motors dealer vehicle toyota used foreign showroom",
  },
  {
    id: "restaurant",
    icon: "🍲",
    name: "Restaurant & Food",
    desc: "Meals, snacks & drinks people can order",
    keywords: "food restaurant kitchen chop buka catering cook rice soup grill bakery",
  },
  {
    id: "skincare",
    icon: "🧴",
    name: "Skincare & Body Care",
    desc: "Creams, serums, soaps & oils",
    keywords: "beauty cream serum soap oil cosmetics body",
  },
  {
    id: "perfume",
    icon: "🌸",
    name: "Perfume & Fragrance",
    desc: "Perfumes, oils & body mists",
    keywords: "fragrance scent oil spray",
  },
  {
    id: "jewellery",
    icon: "💍",
    name: "Jewellery & Accessories",
    desc: "Watches, bracelets, glasses & more",
    keywords: "jewelry watch ring necklace bracelet glasses",
  },
  {
    id: "gadgets",
    icon: "🎧",
    name: "Gadgets & Accessories",
    desc: "Phones, earbuds, chargers & accessories",
    keywords: "phone earbuds charger electronics laptop tech",
  },
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
  const [saving, setSaving] = useState(false);

  // The business type list that slides up from the bottom
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const listRef = useRef(null);

  // Search is only worth showing once the list gets longer
  const showSearch = TYPES.length > 6;

  const shownTypes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TYPES;
    return TYPES.filter((t) =>
      `${t.name} ${t.desc} ${t.keywords || ""}`.toLowerCase().includes(q)
    );
  }, [query]);

  // What the server says about this link: null while we haven't asked
  const [slugCheck, setSlugCheck] = useState(null);
  const [checking, setChecking] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === country);
  const selectedType = TYPES.find((t) => t.id === type);
  const slugError = slug ? checkSlug(slug) : "";

  // Ask the server if the link is free, but only after they stop typing
  useEffect(() => {
    setSlugCheck(null);
    if (!slug || checkSlug(slug)) return;

    let cancelled = false;
    setChecking(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/sites/check-slug?slug=${encodeURIComponent(slug)}`);
        if (!cancelled) setSlugCheck(res);
      } catch (err) {
        if (!cancelled) setSlugCheck(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug]);

  // Stop the page behind from scrolling while the list is open
  useEffect(() => {
    if (!sheetOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e) {
      if (e.key === "Escape") setSheetOpen(false);
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [sheetOpen]);

  // Every time the list opens: clear the search and show the picked one
  useEffect(() => {
    if (!sheetOpen) return;
    setQuery("");
    setScrolled(false);

    const timer = setTimeout(() => {
      const picked = listRef.current && listRef.current.querySelector(".type-row.selected");
      if (picked) picked.scrollIntoView({ block: "center" });
    }, 280);

    return () => clearTimeout(timer);
  }, [sheetOpen]);

  function pickType(id) {
    setType(id);
    setSheetOpen(false);
  }

  function handleName(e) {
    setName(e.target.value);
    // The address follows the name until the user edits it themselves
    if (!slugEdited) setSlug(makeSlug(e.target.value));
  }

  function handleSlug(e) {
    setSlugEdited(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!type) return setError("Choose your business type.");
    if (!name.trim()) return setError("Enter your business name.");
    if (!slug || slugError) return setError(slugError || "Choose your website address.");
    if (slugCheck && slugCheck.available === false) {
      return setError(slugCheck.reason || "That website address is taken.");
    }

    // Accepts "0801 234 5678" or "+234 801 234 5678", keeps only the local part
    let digits = whatsapp.replace(/\D/g, "");
    if (digits.startsWith(selectedCountry.phoneCode) && digits.length > 10) {
      digits = digits.slice(selectedCountry.phoneCode.length);
    }
    digits = digits.replace(/^0+/, "");

    if (digits.length < 7 || digits.length > 12) {
      return setError("Enter a valid WhatsApp number.");
    }

    setSaving(true);
    try {
      await api.post("/sites", {
        country,
        businessType: type,
        businessName: name.trim(),
        slug,
        whatsapp: selectedCountry.phoneCode + digits,
      });
      navigate("/welcome");
    } catch (err) {
      // They already made a shop on another tab or an earlier visit
      if (err.message === "You already have a site") return navigate("/dashboard");
      setError(err.message);
      setSaving(false);
    }
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
        <button
          type="button"
          className={selectedType ? "type-trigger picked" : "type-trigger"}
          onClick={() => setSheetOpen(true)}
        >
          {selectedType ? (
            <>
              <span className="type-icon">{selectedType.icon}</span>
              <span className="type-text">
                <span className="type-name">{selectedType.name}</span>
                <span className="type-desc">{selectedType.desc}</span>
              </span>
            </>
          ) : (
            <span className="type-placeholder">Choose your business type</span>
          )}
          <span className="type-caret" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
        <p className="hint">Each one gets a different design, made for that kind of business.</p>

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
        ) : checking ? (
          <p className="hint">Checking if it's free...</p>
        ) : slugCheck && slugCheck.available === false ? (
          <p className="slug-error">{slugCheck.reason}</p>
        ) : slug ? (
          <p className="slug-preview">
            {slugCheck && slugCheck.available ? "Available. " : ""}
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

        <button type="submit" className="setup-btn" disabled={saving}>
          {saving ? "Creating your website..." : "Create my website"}
        </button>

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

      {/* The list that slides up when they tap the button above */}
      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grip" aria-hidden="true" />

            <div className={scrolled ? "sheet-head shadow" : "sheet-head"}>
              <h3>Which one describes your business?</h3>
              <button
                type="button"
                className="sheet-close"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {showSearch && (
              <div className="sheet-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your business type"
                  aria-label="Search business types"
                />
              </div>
            )}

            <div className="sheet-body">
              <div
                className="sheet-list"
                ref={listRef}
                onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
              >
                {shownTypes.length > 0 ? (
                  <>
                    <p className="sheet-count">
                      {shownTypes.length} business {shownTypes.length === 1 ? "type" : "types"}
                    </p>
                    {shownTypes.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        disabled={t.soon}
                        className={type === t.id ? "type-row selected" : "type-row"}
                        onClick={() => pickType(t.id)}
                      >
                        <span className="type-icon">{t.icon}</span>
                        <span className="type-text">
                          <span className="type-name">{t.name}</span>
                          <span className="type-desc">{t.desc}</span>
                        </span>
                        {t.soon ? (
                          <span className="type-soon">Coming soon</span>
                        ) : (
                          <span className="type-mark" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  <p className="sheet-empty">
                    We don't have "{query.trim()}" yet.
                    <br />
                    <a
                      href="https://wa.me/2349027090880?text=Hi%2C%20I%20want%20a%20website%20for%20a%20business%20type%20you%20don%27t%20have%20yet"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Tell us what you need
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}