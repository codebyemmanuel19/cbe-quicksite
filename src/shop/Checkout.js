import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "../components/countries";

// Accepts "0801 234 5678" or "+234 801..." and returns "2348012345678", or "" if invalid
function normalizePhone(input, code) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith(code) && digits.length > 10) digits = digits.slice(code.length);
  digits = digits.replace(/^0+/, "");
  return digits.length >= 7 && digits.length <= 12 ? code + digits : "";
}

// The same checkout for every template. Class names come from `prefix`,
// so each shop type styles it in its own CSS.
export default function Checkout({ store, basePath, cart, clearCart, prefix = "cs" }) {
  const navigate = useNavigate();
  const s = store.settings;
  const money = (n) => formatPrice(n, store.symbol);
  const c = (name) => `${prefix}-${name}`;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    method: s.offersDelivery ? "delivery" : "pickup",
    area: "",
    address: "",
    payment: s.payOnDelivery ? "pod" : "transfer",
    note: "",
  });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  if (cart.length === 0) {
    return (
      <div className={c("page")}>
        <h1 className={c("page-title")}>Checkout</h1>
        <p className={c("muted")}>Your bag is empty.</p>
        <Link className={c("btn")} to={`${basePath}/#shop`}>Continue shopping</Link>
      </div>
    );
  }

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const areaInfo = s.areas.find((a) => a.name === form.area);
  // null means the fee isn't known yet (no area picked, or "not listed")
  const fee = form.method === "pickup" ? 0 : areaInfo ? areaInfo.fee : null;
  const total = subtotal + (fee || 0);

  function feeText() {
    if (form.method === "pickup") return "Free";
    if (fee !== null) return money(fee);
    return form.area === "other" ? "To be confirmed" : "Choose area";
  }

  async function placeOrder() {
    if (placing) return;
    setError("");

    const name = form.name.trim().slice(0, 80);
    if (name.length < 2) return setError("Enter your name.");
    if (/https?:\/\/|www\./i.test(name)) return setError("Enter a valid name.");

    const phone = normalizePhone(form.phone, store.dialCode);
    if (!phone) return setError("Enter a valid phone number.");

    const address = form.address.trim().slice(0, 300);
    if (form.method === "delivery") {
      if (!form.area) return setError("Choose your delivery area.");
      if (address.length < 5) return setError("Enter your delivery address.");
    }

    setPlacing(true);
    try {
      // The server rebuilds every price from its own database. Nothing here is trusted.
      const res = await api.post(`/orders/${store.slug}`, {
        name,
        phone,
        payment: form.payment,
        deliveryType: form.method,
        area: form.area === "other" ? "" : form.area,
        address,
        note: form.note.trim().slice(0, 500),
        items: cart.map((i) => ({
          id: i.productId,
          qty: i.qty,
          size: i.size,
          color: i.color,
          variant: i.variant || "",
        })),
      });

      const done = { order: res.order, bank: res.bank, whatsapp: res.whatsapp };
      try {
        localStorage.setItem(`cbe-last-order-${store.slug}`, JSON.stringify(done));
      } catch {
        // storage blocked: the page still gets it through navigation state
      }

      clearCart();
      navigate(`${basePath}/done`, { state: done });
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  }

  return (
    <div className={c("page")}>
      <h1 className={c("page-title")}>Checkout</h1>

      <div className={c("box")}>
        <p className={c("label")}>Your order</p>
        {cart.map((i) => (
          <div key={i.key} className={c("summary-row")}>
            <span>
              {i.name}
              {i.variant ? ` · ${i.variant}` : ""}
              {i.size ? ` · ${i.size}` : ""} × {i.qty}
            </span>
            <span>{money(i.price * i.qty)}</span>
          </div>
        ))}
        <div className={c("summary-row")}><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className={c("summary-row")}><span>Delivery</span><span>{feeText()}</span></div>
        <div className={`${c("summary-row")} total`}><span>Total</span><span>{money(total)}</span></div>
      </div>

      <div className={c("box")}>
        <p className={c("label")}>Your details</p>
        <label className={c("field")}>
          <span>Full name</span>
          <input
            value={form.name}
            maxLength={80}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>
        <div className={c("field")}>
          <span>Phone number (WhatsApp)</span>
          <div className={c("phone")}>
            <b>+{store.dialCode}</b>
            <input
              type="tel"
              value={form.phone}
              maxLength={20}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="801 234 5678"
            />
          </div>
        </div>
      </div>

      <div className={c("box")}>
        <p className={c("label")}>How do you want it?</p>
        <div className={c("choices")}>
          {s.offersDelivery && (
            <button
              type="button"
              className={form.method === "delivery" ? `${c("choice")} active` : c("choice")}
              onClick={() => update("method", "delivery")}
            >
              Delivery <small>We bring it to you</small>
            </button>
          )}
          {s.offersPickup && (
            <button
              type="button"
              className={form.method === "pickup" ? `${c("choice")} active` : c("choice")}
              onClick={() => update("method", "pickup")}
            >
              Pickup <small>{s.pickupAddress}</small>
            </button>
          )}
        </div>

        {form.method === "delivery" && (
          <>
            <label className={c("field")}>
              <span>Delivery area</span>
              <select value={form.area} onChange={(e) => update("area", e.target.value)}>
                <option value="">Choose your area</option>
                {s.areas.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} ({money(a.fee)})
                  </option>
                ))}
                <option value="other">My area isn't listed</option>
              </select>
            </label>
            {form.area === "other" && (
              <p className={c("muted")}>{store.name} will confirm your delivery fee on WhatsApp.</p>
            )}
            <label className={c("field")}>
              <span>Delivery address</span>
              <textarea
                rows={2}
                maxLength={300}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="House number, street, landmark"
              />
            </label>
          </>
        )}
      </div>

      <div className={c("box")}>
        <p className={c("label")}>Payment</p>
        <div className={c("choices")}>
          {s.payOnDelivery && (
            <button
              type="button"
              className={form.payment === "pod" ? `${c("choice")} active` : c("choice")}
              onClick={() => update("payment", "pod")}
            >
              {form.method === "pickup" ? "Pay at pickup" : "Pay on delivery"}
              {s.deliveryFeeFirst && form.method === "delivery" && (
                <small>You'll transfer the delivery fee before dispatch</small>
              )}
            </button>
          )}
          {s.payBeforeDelivery && (
            <button
              type="button"
              className={form.payment === "transfer" ? `${c("choice")} active` : c("choice")}
              onClick={() => update("payment", "transfer")}
            >
              Pay now by bank transfer <small>Account details shown after you order</small>
            </button>
          )}
        </div>
      </div>

      <label className={c("field")}>
        <span>Note for the seller (optional)</span>
        <textarea
          rows={2}
          maxLength={500}
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
        />
      </label>

      {error && <p className={c("error")}>{error}</p>}

      <button className={c("btn")} onClick={placeOrder} disabled={placing}>
        {placing ? "Placing order..." : `Place order · ${money(total)}`}
      </button>
    </div>
  );
}