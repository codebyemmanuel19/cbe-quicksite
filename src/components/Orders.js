import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { formatPrice } from "./countries";
import "./Orders.css";

const STATUS_LABELS = {
  new: "New",
  confirmed: "Confirmed",
  out: "Out for delivery",
  paid: "Paid",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// What the main button does next, for each payment type: [next status, button text]
const NEXT_STEP = {
  pod: {
    new: ["confirmed", "Confirm order"],
    confirmed: ["out", "Mark out for delivery"],
    out: ["delivered", "Mark delivered & paid"],
  },
  transfer: {
    new: ["paid", "Mark as paid"],
    paid: ["delivered", "Mark as delivered"],
  },
};

const TABS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "progress", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function inTab(order, tab) {
  if (tab === "all") return true;
  if (tab === "progress") return ["confirmed", "out", "paid"].includes(order.status);
  return order.status === tab;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [working, setWorking] = useState(false);
  const [feeInput, setFeeInput] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/orders");
        if (cancelled) return;
        setOrders(res.orders);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        if (err.status === 400) return navigate("/setup");
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

  const shown = orders.filter((o) => inTab(o, tab));
  const selected = orders.find((o) => o.id === selectedId);

  function replaceOrder(order) {
    setOrders((current) => current.map((o) => (o.id === order.id ? order : o)));
  }

  async function setStatus(id, status) {
    setError("");
    setWorking(true);
    try {
      const res = await api.put(`/orders/${id}/status`, { status });
      replaceOrder(res.order);
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }

  function cancelOrder(id) {
    if (window.confirm("Cancel this order?")) setStatus(id, "cancelled");
  }

  // Only for orders where the customer's area wasn't on the delivery list
  async function saveFee(id) {
    const fee = Number(feeInput);
    if (feeInput === "" || !Number.isInteger(fee) || fee < 0) {
      return setError("Enter the agreed delivery fee.");
    }

    setError("");
    setWorking(true);
    try {
      const res = await api.put(`/orders/${id}/fee`, { fee });
      replaceOrder(res.order);
      setFeeInput("");
    } catch (err) {
      if (err.status === 401) return navigate("/login");
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <div className="orders">
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders">
      <h1 className="orders-title">Orders</h1>
      <p className="orders-sub">Tap an order to see details and update it.</p>

      {error && <p className="orders-sub">{error}</p>}

      <div className="order-tabs">
        {TABS.map((t) => {
          const count = orders.filter((o) => inTab(o, t.id)).length;
          return (
            <button
              key={t.id}
              className={tab === t.id ? "order-tab active" : "order-tab"}
              onClick={() => setTab(t.id)}
            >
              {t.label} <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>No orders yet. Share your website link to get your first one.</p>
        </div>
      ) : shown.length === 0 ? (
        <div className="orders-empty">
          <p>No orders here.</p>
        </div>
      ) : (
        <div className="order-list">
          {shown.map((o) => {
            const itemCount = o.items.reduce((sum, item) => sum + item.qty, 0);
            return (
              <button key={o.id} className="order-row" onClick={() => setSelectedId(o.id)}>
                <div className="order-main">
                  <p className="order-name">#{o.orderNumber} · {o.customer}</p>
                  <p className="order-meta">
                    {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                    {o.payment === "pod" ? "Pay on delivery" : "Paid by transfer"} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="order-side">
                  <p className="order-total">{formatPrice(o.total)}</p>
                  <span className={`status status-${o.status}`}>{STATUS_LABELS[o.status]}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Order detail sheet */}
      {selected && (
        <div className="sheet-bg" onClick={() => setSelectedId(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <div>
                <h2>Order #{selected.orderNumber}</h2>
                <p className="order-meta">{formatDate(selected.createdAt)}</p>
              </div>
              <button className="sheet-x" onClick={() => setSelectedId(null)}>✕</button>
            </div>

            <span className={`status status-${selected.status}`}>{STATUS_LABELS[selected.status]}</span>

            <div className="sheet-block">
              <p className="block-label">Customer</p>
              <p className="block-value">{selected.customer}</p>
              <p className="order-meta">+{selected.phone}</p>
              <div className="contact-btns">
                <a href={`tel:+${selected.phone}`} className="contact-btn">Call</a>
                <a
                  className="contact-btn wa"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://wa.me/${selected.phone}?text=${encodeURIComponent(
                    `Hi ${selected.customer.split(" ")[0]}, this is about your order #${selected.orderNumber}.`
                  )}`}
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="sheet-block">
              <p className="block-label">
                {selected.delivery.type === "delivery" ? "Delivery" : "Pickup"}
              </p>
              {selected.delivery.type === "delivery" ? (
                <>
                  <p className="block-value">{selected.delivery.area}</p>
                  <p className="order-meta">{selected.delivery.address}</p>
                </>
              ) : (
                <p className="block-value">Customer will pick up</p>
              )}
            </div>

            {/* Their area wasn't on the list, so you agree the fee and type it here */}
            {selected.delivery.type === "delivery" && selected.delivery.fee === null && (
              <div className="sheet-block">
                <p className="block-label">Delivery fee not set</p>
                <p className="order-meta">
                  This area isn't on your list. Agree a fee on WhatsApp, then type it here.
                </p>
                <div className="contact-btns">
                  <input
                    inputMode="numeric"
                    placeholder="Fee"
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value.replace(/\D/g, ""))}
                  />
                  <button
                    className="contact-btn"
                    disabled={working}
                    onClick={() => saveFee(selected.id)}
                  >
                    {working ? "Saving..." : "Save fee"}
                  </button>
                </div>
              </div>
            )}

            <div className="sheet-block">
              <p className="block-label">Items</p>
              {selected.items.map((item, i) => (
                <div key={i} className="item-row">
                  <span>
                    {item.name} × {item.qty}
                    {item.size ? ` · ${item.size}` : ""}
                    {item.color ? ` · ${item.color}` : ""}
                  </span>
                  <span>{formatPrice(item.qty * item.price)}</span>
                </div>
              ))}

              <div className="item-row muted">
                <span>Subtotal</span>
                <span>{formatPrice(selected.subtotal)}</span>
              </div>
              <div className="item-row muted">
                <span>Delivery</span>
                <span>
                  {selected.delivery.type === "pickup"
                    ? "Pickup"
                    : selected.delivery.fee === null
                    ? "Not set yet"
                    : formatPrice(selected.delivery.fee)}
                </span>
              </div>
              <div className="item-row total">
                <span>Total</span>
                <span>{formatPrice(selected.total)}</span>
              </div>
            </div>

            <div className="sheet-block">
              <p className="block-label">Payment</p>
              <p className="block-value">
                {selected.payment === "pod" ? "Pay on delivery" : "Pay before delivery (bank transfer)"}
              </p>
            </div>

            {selected.note && (
              <div className="sheet-block">
                <p className="block-label">Customer note</p>
                <p className="block-value">{selected.note}</p>
              </div>
            )}

            {error && <p className="orders-sub">{error}</p>}

            {/* Actions */}
            {NEXT_STEP[selected.payment][selected.status] && (
              <button
                className="next-btn"
                disabled={working}
                onClick={() => setStatus(selected.id, NEXT_STEP[selected.payment][selected.status][0])}
              >
                {working ? "Saving..." : NEXT_STEP[selected.payment][selected.status][1]}
              </button>
            )}

            {!["delivered", "cancelled"].includes(selected.status) && (
              <button className="cancel-btn" disabled={working} onClick={() => cancelOrder(selected.id)}>
                Cancel order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}