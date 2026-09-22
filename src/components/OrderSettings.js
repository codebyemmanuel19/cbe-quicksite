import { useState } from "react";
import { formatPrice } from "./countries";
import "./OrderSettings.css";

// Fake starting data until the backend is connected
const initialSettings = {
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

function Switch({ checked, onChange, label, hint }) {
  return (
    <div className="switch-row">
      <div>
        <p className="switch-label">{label}</p>
        {hint && <p className="switch-hint">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={checked ? "switch on" : "switch"}
        onClick={() => onChange(!checked)}
      >
        <span className="knob" />
      </button>
    </div>
  );
}

export default function OrderSettings() {
  const [s, setS] = useState(initialSettings);
  const [newArea, setNewArea] = useState({ name: "", fee: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setS({ ...s, [field]: value });
    setSaved(false);
  }

  // Bank details are needed if customers ever transfer money before dispatch
  const needsBank = s.payBeforeDelivery || (s.payOnDelivery && s.deliveryFeeFirst);

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

  function handleSave(e) {
    e.preventDefault();
    setError("");

    if (!s.payOnDelivery && !s.payBeforeDelivery) {
      return setError("Turn on at least one payment option.");
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

    // No backend yet: pretend it saved
    setSaved(true);
  }

  return (
    <form className="os" onSubmit={handleSave}>
      <h1 className="os-title">Order Settings</h1>
      <p className="os-sub">Choose how customers pay and how they get their orders.</p>

      {/* Payment */}
      <section className="os-card">
        <h2>How customers pay</h2>

        <Switch
          label="Pay on delivery"
          hint="Customer pays when the order arrives."
          checked={s.payOnDelivery}
          onChange={(v) => update("payOnDelivery", v)}
        />

        {s.payOnDelivery && (
          <div className="nested">
            <Switch
              label="Collect delivery fee first"
              hint="Customer transfers only the delivery fee before you dispatch. Cuts down fake orders."
              checked={s.deliveryFeeFirst}
              onChange={(v) => update("deliveryFeeFirst", v)}
            />
          </div>
        )}

        <Switch
          label="Pay before delivery"
          hint="Customer transfers the full amount before you dispatch."
          checked={s.payBeforeDelivery}
          onChange={(v) => update("payBeforeDelivery", v)}
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
        <h2>Delivery</h2>

        <Switch
          label="I deliver orders"
          checked={s.offersDelivery}
          onChange={(v) => update("offersDelivery", v)}
        />

        {s.offersDelivery && (
          <>
            <p className="switch-hint">
              Add the areas you deliver to. One flat fee? Add a single area like "Anywhere in Lagos".
            </p>

            {s.areas.length > 0 && (
              <div className="areas">
                {s.areas.map((a) => (
                  <div key={a.name} className="area-row">
                    <span className="area-name">{a.name}</span>
                    <span className="area-fee">{formatPrice(a.fee)}</span>
                    <button type="button" className="area-remove" onClick={() => removeArea(a.name)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
              <button type="button" onClick={addArea}>Add</button>
            </div>

            <p className="switch-hint">
              Customers outside your list can pick "My area isn't listed", and you confirm the fee on WhatsApp.
            </p>
          </>
        )}
      </section>

      {/* Pickup */}
      <section className="os-card">
        <h2>Pickup</h2>

        <Switch
          label="Customers can pick up"
          hint="Free for the customer."
          checked={s.offersPickup}
          onChange={(v) => update("offersPickup", v)}
        />

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
        <h2>New order alerts</h2>

        <label>Email for order alerts (optional)</label>
        <input
          type="email"
          value={s.alertEmail}
          onChange={(e) => update("alertEmail", e.target.value)}
          placeholder="you@gmail.com"
        />
        <p className="switch-hint">Customers also send every order straight to your WhatsApp.</p>
      </section>

      {error && <p className="os-error">{error}</p>}

      <div className="save-bar">
        {saved && <span className="saved">Saved ✓</span>}
        <button type="submit" className="save-btn">Save changes</button>
      </div>
    </form>
  );
}