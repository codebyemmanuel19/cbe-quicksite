import { useState } from "react";
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

// Fake orders until the backend is connected
const startingOrders = [
  {
    id: 1024, customer: "Chioma Okeke", phone: "2348031234567", method: "pod", status: "new",
    delivery: { type: "delivery", area: "Lekki", address: "12 Admiralty Way, Lekki Phase 1", fee: 2500 },
    items: [{ name: "Vitamin C Serum", qty: 2, price: 8500 }],
    note: "Please call before you come", createdAt: "2026-09-21T10:15:00",
  },
  {
    id: 1023, customer: "Tunde Bakare", phone: "2348059876543", method: "transfer", status: "paid",
    delivery: { type: "delivery", area: "Ikeja", address: "4 Allen Avenue, Ikeja", fee: 3000 },
    items: [
      { name: "Ankara Midi Dress", qty: 1, price: 18500 },
      { name: "Leather Slides", qty: 1, price: 12000 },
    ],
    note: "", createdAt: "2026-09-20T16:40:00",
  },
  {
    id: 1022, customer: "Aisha Bello", phone: "2348091112233", method: "pod", status: "delivered",
    delivery: { type: "pickup" },
    items: [{ name: "Shea Body Butter", qty: 3, price: 4500 }],
    note: "", createdAt: "2026-09-19T12:05:00",
  },
];

function inTab(order, tab) {
  if (tab === "all") return true;
  if (tab === "progress") return ["confirmed", "out", "paid"].includes(order.status);
  return order.status === tab;
}

function orderTotals(order) {
  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const deliveryFee = order.delivery.type === "delivery" ? order.delivery.fee : 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-NG", {
    day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });
}

export default function Orders() {
  const [orders, setOrders] = useState(startingOrders);
  const [tab, setTab] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const shown = sorted.filter((o) => inTab(o, tab));
  const selected = orders.find((o) => o.id === selectedId);

  function setStatus(id, status) {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function cancelOrder(id) {
    if (window.confirm("Cancel this order?")) setStatus(id, "cancelled");
  }

  return (
    <div className="orders">
      <h1 className="orders-title">Orders</h1>
      <p className="orders-sub">Tap an order to see details and update it.</p>

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
            const { total } = orderTotals(o);
            const itemCount = o.items.reduce((sum, item) => sum + item.qty, 0);
            return (
              <button key={o.id} className="order-row" onClick={() => setSelectedId(o.id)}>
                <div className="order-main">
                  <p className="order-name">#{o.id} · {o.customer}</p>
                  <p className="order-meta">
                    {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
                    {o.method === "pod" ? "Pay on delivery" : "Paid by transfer"} · {formatDate(o.createdAt)}
                  </p>
                </div>
                <div className="order-side">
                  <p className="order-total">{formatPrice(total)}</p>
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
                <h2>Order #{selected.id}</h2>
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
                    `Hi ${selected.customer.split(" ")[0]}, this is about your order #${selected.id}.`
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

            <div className="sheet-block">
              <p className="block-label">Items</p>
              {selected.items.map((item) => (
                <div key={item.name} className="item-row">
                  <span>{item.name} × {item.qty}</span>
                  <span>{formatPrice(item.qty * item.price)}</span>
                </div>
              ))}
              {(() => {
                const { subtotal, deliveryFee, total } = orderTotals(selected);
                return (
                  <>
                    <div className="item-row muted"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="item-row muted"><span>Delivery</span><span>{formatPrice(deliveryFee)}</span></div>
                    <div className="item-row total"><span>Total</span><span>{formatPrice(total)}</span></div>
                  </>
                );
              })()}
            </div>

            <div className="sheet-block">
              <p className="block-label">Payment</p>
              <p className="block-value">
                {selected.method === "pod" ? "Pay on delivery" : "Pay before delivery (bank transfer)"}
              </p>
            </div>

            {selected.note && (
              <div className="sheet-block">
                <p className="block-label">Customer note</p>
                <p className="block-value">{selected.note}</p>
              </div>
            )}

            {/* Actions */}
            {NEXT_STEP[selected.method][selected.status] && (
              <button
                className="next-btn"
                onClick={() => setStatus(selected.id, NEXT_STEP[selected.method][selected.status][0])}
              >
                {NEXT_STEP[selected.method][selected.status][1]}
              </button>
            )}

            {!["delivered", "cancelled"].includes(selected.status) && (
              <button className="cancel-btn" onClick={() => cancelOrder(selected.id)}>
                Cancel order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}