import "./Support.css";

const WHATSAPP = "2349027090880";
const message = encodeURIComponent("Hi, I need help with my CBE QuickSite website");

export default function Support() {
  return (
    <div className="support">
      <h1>Support</h1>
      <p className="support-sub">
        Stuck on something? Chat with us on WhatsApp and we'll help you out.
      </p>

      <a
        className="support-btn"
        href={`https://wa.me/${WHATSAPP}?text=${message}`}
        target="_blank"
        rel="noreferrer"
      >
        Chat with support on WhatsApp
      </a>
    </div>
  );
}