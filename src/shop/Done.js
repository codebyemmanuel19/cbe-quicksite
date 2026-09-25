import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatPrice } from "../components/countries";
import { itemDetails } from "./useCart";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(box);
    return ok;
  }
}

// The full order, typed out for WhatsApp. Uses the order the server saved.
export function buildOrderMessage(store, order) {
  const d = order.delivery;
  const money = (n) => formatPrice(n, store.symbol);
  const lines = [
    `Hi ${store.name}, I just placed an order on your website.`,
    "",
    `Order #${order.orderNumber}`,
    ...order.items.map((i) => {
      const details = itemDetails(i);
      return `• ${i.name}${details ? ` (${details})` : ""} × ${i.qty} = ${money(i.price * i.qty)}`;
    }),
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery fee: ${d.type === "pickup" ? "Free" : d.fee === null ? "To be confirmed" : money(d.fee)}`,
    `Total: ${money(order.total)}${d.type === "delivery" && d.fee === null ? " + delivery" : ""}`,
    "",
    `Name: ${order.customer}`,
    `Phone: +${order.phone}`,
    `Address: ${d.type === "pickup" ? "Pickup" : `${d.area}, ${d.address}`}`,
    `Payment: ${order.payment === "transfer" ? "Bank transfer" : d.type === "pickup" ? "Pay at pickup" : "Pay on delivery"}`,
  ];
  if (order.note) lines.push(`Note: ${order.note}`);
  return lines.join("\n");
}

export default function Done({ store, basePath, prefix = "cs" }) {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const c = (name) => `${prefix}-${name}`;

  let done = location.state;
  if (!done || !done.order) {
    try {
      done = JSON.parse(localStorage.getItem(`cbe-last-order-${store.slug}`));
    } catch {
      done = null;
    }
  }

  if (!done || !done.order) {
    return (
      <div className={c("page")}>
        <p>No recent order found.</p>
        <Link className={c("link")} to={`${basePath}/#shop`}>Back to shop</Link>
      </div>
    );
  }

  const { order, bank } = done;
  const money = (n) => formatPrice(n, store.symbol);
  const isDelivery = order.delivery.type === "delivery";
  const feeUnknown = isDelivery && order.delivery.fee === null;

  async function copyAccount() {
    if (await copyText(bank.accountNumber)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={`${c("page")} ${c("done")}`}>
      <p className={c("done-check")}>✓</p>
      <h1 className={c("page-title")}>Thank you, {order.customer.split(" ")[0]}!</h1>
      <p className={c("muted")}>Your order #{order.orderNumber} has been received.</p>

      {feeUnknown ? (
        <div className={c("box")}>
          <p>Don't pay yet. {store.name} will confirm your delivery fee on WhatsApp first.</p>
        </div>
      ) : bank ? (
        <div className={c("box")}>
          <p className={c("label")}>
            {bank.payingFor === "delivery" ? "Transfer the delivery fee" : "Transfer your total"}
          </p>
          <p className={c("amount")}>{money(bank.amount)}</p>
          <div className={c("bank")}>
            <p>{bank.bankName}</p>
            <p className={c("acct")}>
              {bank.accountNumber}
              <button onClick={copyAccount}>{copied ? "Copied" : "Copy"}</button>
            </p>
            <p>{bank.accountName}</p>
          </div>
          <p className={c("muted")}>After paying, send your receipt on WhatsApp.</p>
        </div>
      ) : (
        <div className={c("box")}>
          <p>{store.name} will call you shortly to confirm your order.</p>
        </div>
      )}

      <a
        className={`${c("btn")} wa`}
        href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(buildOrderMessage(store, order))}`}
        target="_blank"
        rel="noreferrer"
      >
        Send order on WhatsApp
      </a>
      <Link className={c("link")} to={`${basePath}/#shop`}>Continue shopping</Link>
    </div>
  );
}