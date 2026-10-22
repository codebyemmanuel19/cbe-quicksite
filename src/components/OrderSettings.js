import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "./countries";
import { FormSkeleton } from "./Skeleton";
import "./OrderSettings.css";

const emptySettings = {
  payOnDelivery: true,
  deliveryFeeFirst: false,
  payBeforeDelivery: false,
  bankName: "",
  accountNumber: "",
  accountName: "",
  offersDelivery: true,
  areas: [],
  offersPickup: false,
  pickupAddress: "",
  alertEmail: "",
};

// Quick suggestions for Nigerian shops. Tapping one fills the boxes, the vendor can change the fee.
const SUGGESTED_AREAS = [
  { name: "Lagos", fee: 3000 },
  { name: "Rivers", fee: 3500 },
  { name: "FCT", fee: 3000 },
  { name: "Kano", fee: 4000 },
  { name: "Anywhere in Nigeria", fee: 5000 },
];

function fromServer(o) {
  return {
    payOnDelivery: o.payOnDelivery,
    deliveryFeeFirst: o.deliveryFeeFirst,
    payBeforeDelivery: o.payBeforeDelivery,
    bankName: o.bankName || "",
    accountNumber: o.accountNumber || "",
    accountName: o.accountName || "",
    offersDelivery: o.offersDelivery,
    areas: o.areas || [],
    offersPickup: o.offersPickup,
    pickupAddress: o.pickupAddress || "",
    alertEmail: o.alertEmail || "",
  };
}

const Icon = {
  pay: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20M6 15h4" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6h13v10H1zM14 10h4l3 3v3h-7" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-5h15L21 9M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M5 12v8h14v-8M10 20v-5h4v5" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M10.3 20a2 2 0 003.4 0" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5 9-10" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 01-12.4 7.5L3 20.5l1.6-5.3A8.5 8.5 0 1121 11.5z" />
      <path d="M9 9.500c0 3 2.5 5.5 5.5 5.5l1.2-1.300-2-1-.8.8c-.8-.4-1.500-1.100-1.900-1.900l.8-.8-1-2z" />
    </svg>
  ),
};

// A tick-box card. Tap it to turn the option on or off.
function ChoiceCard({ on, onClick, title, hint, badge }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} className={on ? "choice on" : "choice"} onClick={onClick}>
      <span className="choice-tick">{on && Icon.check}</span>
      <span className="choice-text">
        <span className="choice-title">
          {title}
          {badge && <span className="choice-badge">{badge}</span>}
        </span>
        <span className="choice-hint">{hint}</span>
      </span>
    </button>
  );
}

export default function OrderSettings() {
  const navigate = useNavigate();
  const [s, setS] = useState(emptySettings);
  const [country, setCountry] = useState("");
  const [newArea, setNewArea] = useState({ name: "", fee: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mine = await api.get("/sites/me");
        if (cancelled) return;
        setS(fromServer(mine.site.orderSettings));
        setCountry(mine.site.country || "");
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

  // Change one or more fields at once
  function patch(changes) {
    setS({ ...s, ...changes });
    setSaved(false);
  }

  function update(field, value) {
    patch({ [field]: value });
  }

  // "Collect delivery fee first" only makes sense together with pay on delivery
  function togglePayOnDelivery() {
    if (s.payOnDelivery) patch({ payOnDelivery: false, deliveryFeeFirst: false });
    else patch({ payOnDelivery: true });
  }

  function toggleFeeFirst() {
    if (s.deliveryFeeFirst) patch({ deliveryFeeFirst: false });
    else patch({ deliveryFeeFirst: true, payOnDelivery: true });
  }

  // Bank details are needed if customers ever transfer money before dispatch
  const needsBank = s.payBeforeDelivery || (s.payOnDelivery && s.deliveryFeeFirst);

  const showSuggestions = !country || country === "NG";
  const suggestions = SUGGESTED_AREAS.filter(
    (a) => !s.areas.some((x) => x.name.toLowerCase() === a.name.toLowerCase())
  );

  function addArea() {
    const name = newArea.name.trim();
    const fee = Number(newArea.fee);

    if (!name) return setError("Enter the area name.");
    if (newArea.fee === "" || Number.isNaN(fee)) return setError("Enter a valid delivery fee.");
    if (s.areas.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      return setError("That area is already on your list.");
    }

    setError("");
    update("areas", [...s.areas, { name, fee }]);
    setNewArea({ name: "", fee: "" });
  }

  function removeArea(name) {
    update("areas", s.areas.filter((a) => a.name !== name));
  }

  // Enter in the area boxes adds the area instead of submitting the whole form
  function handleAreaKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addArea();
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!s.payOnDelivery && !s.payBeforeDelivery) {
      return setError("Choose at least one way for customers to pay.");
    }
    if (!s.offersDelivery && !s.offersPickup) {
      return setError("Turn on delivery, pickup, or both.");
    }
    if (needsBank) {
      if (!s.bankName.trim() || !s.accountName.trim()) {
        return setError("Add your bank name and account name.");
      }
      if (!/^\d{10}$/.test(s.accountNumber)) {
        return setError("Account number must be 10 digits.");
      }
    }
    if (s.offersDelivery && s.areas.length === 0) {
      return setError("Add at least one delivery area, or turn delivery off.");
    }
    if (s.offersPickup && !s.pickupAddress.trim()) {
      return setError("Add your pickup address.");
    }

    setSaving(true);
    try {
      const res = await api.put("/sites/order-settings", s);
      // Show what the server actually stored
      setS(fromServer(res.site.orderSettings));
      setSaved(true);
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      if (err.locked) {
        setLocked(true);
        setError("Your plan has ended. Pay to keep editing your website.");
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="os">
        <FormSkeleton fields={5} />
      </div>
    );
  }

  return (
    <form className="os" onSubmit={handleSave}>
      <h1 className="os-title">Order Settings</h1>
      <p className="os-sub">Choose how customers pay and how they get their orders.</p>

      <div className="os-banner">
        <span className="os-banner-icon">{Icon.whatsapp}</span>
        <div>
          <p className="os-banner-title">Free to receive orders on WhatsApp</p>
          <p className="os-banner-text">No payment gateway needed. Customers pay you directly.</p>
        </div>
      </div>

      {locked && (
        <p className="os-error">
          Your plan has ended. <Link to="/dashboard/billing">Pay to keep editing</Link>.
        </p>
      )}

      {/* Payment */}
      <section className="os-card">
        <div className="os-head">
          <span className="os-icon">{Icon.pay}</span>
          <div>
            <h2>How customers pay</h2>
            <p className="os-hint">Pick one or more.</p>
          </div>
        </div>

        <ChoiceCard
          on={s.payOnDelivery}
          onClick={togglePayOnDelivery}
          title="Pay on delivery"
          hint="Customer pays when the order arrives."
          badge="Recommended"
        />
        <ChoiceCard
          on={s.deliveryFeeFirst}
          onClick={toggleFeeFirst}
          title="Collect delivery fee first"
          hint="Customer sends only the delivery fee before you dispatch. Cuts down fake orders."
        />
        <ChoiceCard
          on={s.payBeforeDelivery}
          onClick={() => update("payBeforeDelivery", !s.payBeforeDelivery)}
          title="Pay before delivery"
          hint="Customer transfers the full amount before you dispatch."
        />

        {needsBank && (
          <div className="bank">
            <p className="bank-title">Your bank details</p>
            <p className="switch-hint">Customers see these at checkout.</p>

            <label>Bank name</label>
            <input
              value={s.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              placeholder="e.g. GTBank"
            />

            <label>Account number</label>
            <input
              value={s.accountNumber}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => update("accountNumber", e.target.value.replace(/\D/g, ""))}
              placeholder="10 digits"
            />

            <label>Account name</label>
            <input
              value={s.accountName}
              onChange={(e) => update("accountName", e.target.value)}
              placeholder="Name on the account"
            />
          </div>
        )}
      </section>

      {/* Delivery */}
      <section className="os-card">
        <div className="os-head">
          <span className="os-icon">{Icon.truck}</span>
          <h2>Delivery</h2>
          <button
            type="button"
            role="switch"
            aria-checked={s.offersDelivery}
            aria-label="I deliver orders"
            className={s.offersDelivery ? "switch on" : "switch"}
            onClick={() => update("offersDelivery", !s.offersDelivery)}
          >
            <span className="knob" />
          </button>
        </div>

        {!s.offersDelivery && <p className="os-hint">Turn this on if you deliver orders to customers.</p>}

        {s.offersDelivery && (
          <>
            <p className="os-hint">
              Add the areas you deliver to. One flat fee? Add a single area like "Anywhere in Lagos".
            </p>

            {s.areas.length > 0 && (
              <div className="areas">
                {s.areas.map((a) => (
                  <div key={a.name} className="area-row">
                    <span className="area-name">{a.name}</span>
                    <span className="area-fee">{formatPrice(a.fee)}</span>
                    <button type="button" className="area-remove" onClick={() => removeArea(a.name)} aria-label={`Remove ${a.name}`}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <>
                <p className="os-mini">Tap to start with a suggestion, then change the fee if you want:</p>
                <div className="area-chips">
                  {suggestions.map((a) => (
                    <button
                      type="button"
                      key={a.name}
                      className="area-chip"
                      onClick={() => setNewArea({ name: a.name, fee: String(a.fee) })}
                    >
                      {a.name} · {formatPrice(a.fee)}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="area-add">
              <input
                placeholder="Area, e.g. Lekki"
                value={newArea.name}
                onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                onKeyDown={handleAreaKey}
              />
              <input
                placeholder="Fee"
                inputMode="numeric"
                value={newArea.fee}
                onChange={(e) => setNewArea({ ...newArea, fee: e.target.value.replace(/\D/g, "") })}
                onKeyDown={handleAreaKey}
              />
              <button type="button" onClick={addArea}>+ Add</button>
            </div>

            <p className="os-note">
              Customers outside your list can pick "My area isn't listed", and you confirm the fee on WhatsApp.
            </p>
          </>
        )}
      </section>

      {/* Pickup */}
      <section className="os-card">
        <div className="os-head">
          <span className="os-icon">{Icon.store}</span>
          <div>
            <h2>Pickup</h2>
            <p className="os-hint">Let customers collect from your location. Free for them.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={s.offersPickup}
            aria-label="Customers can pick up"
            className={s.offersPickup ? "switch on" : "switch"}
            onClick={() => update("offersPickup", !s.offersPickup)}
          >
            <span className="knob" />
          </button>
        </div>

        {s.offersPickup && (
          <>
            <label>Pickup address</label>
            <input
              value={s.pickupAddress}
              onChange={(e) => update("pickupAddress", e.target.value)}
              placeholder="Where customers collect their orders"
            />
          </>
        )}
      </section>

      {/* Alerts */}
      <section className="os-card">
        <div className="os-head">
          <span className="os-icon">{Icon.bell}</span>
          <h2>New order alerts</h2>
        </div>

        <div className="alert-row">
          <span className="alert-name">
            <span className="alert-wa">{Icon.whatsapp}</span> WhatsApp
          </span>
          <span className="alert-on">Always on</span>
        </div>

        <label>Email for order alerts (optional)</label>
        <input
          type="email"
          value={s.alertEmail}
          onChange={(e) => update("alertEmail", e.target.value)}
          placeholder="you@gmail.com"
        />
        <p className="os-note">We email you every new order. Customers also send each order to your WhatsApp.</p>
      </section>

      {error && <p className="os-error">{error}</p>}

      <div className="save-bar">
        {saved && <span className="saved">Saved ✓</span>}
        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}