import { useState } from "react";
import "./Support.css";

const WHATSAPP = "2349027090880";
const message = encodeURIComponent("Hi, I need help with my CBE QuickSite website");

const FAQS = [
  {
    q: "How do I add products?",
    a: "Open Products in the menu, tap \"+ Add product\", add your photos, name and price, then save. It shows on your website straight away.",
  },
  {
    q: "How do customers place orders?",
    a: "Customers add items to their cart on your website and check out. The order appears under Orders, and they can also send it straight to your WhatsApp.",
  },
  {
    q: "How do customers pay me?",
    a: "Your customers pay you directly. Set your bank account and delivery areas under Order Settings, and your account details show at checkout. The money goes straight to your bank, not to us.",
  },
  {
    q: "What happens after my free trial?",
    a: "Your website stays live, but you can't make changes until you pay. If it stays unpaid for 30 days, your website goes offline until you pay.",
  },
  {
    q: "How much does it cost?",
    a: "₦5,000 a month. Go to Plans & Billing and choose 1, 3, 6 or 12 months — the longer plans cost less per month. Pay by card or bank transfer, and editing unlocks immediately.",
  },
  {
    q: "Can I change my website address?",
    a: "Yes. Message support and we'll change it for you. Links you've already shared with the old address will stop working, so share the new one.",
  },
];

export default function Support() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="support">
      <h1 className="support-title">Support</h1>

      <section className="contact-card">
        <h2>Need help?</h2>
        <p className="support-sub">Chat with us on WhatsApp and we'll help you out.</p>
        <a
          className="support-btn"
          href={`https://wa.me/${WHATSAPP}?text=${message}`}
          target="_blank"
          rel="noreferrer"
        >
          Chat with support on WhatsApp
        </a>
      </section>

      <section className="faq">
        <h2>Common questions</h2>

        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.q} className={isOpen ? "faq-item open" : "faq-item"}>
              <button
                className="faq-q"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <span className="faq-icon">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <p className="faq-a">{item.a}</p>}
            </div>
          );
        })}
      </section>
    </div>
  );
}