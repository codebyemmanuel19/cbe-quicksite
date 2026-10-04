import { Link } from "react-router-dom";
import "./Landing.css";

const SUPPORT = "https://wa.me/2349027090880?text=Hi%2C%20I%20have%20a%20question%20about%20CBE%20QuickSite";
const EXAMPLE = "https://kemisboutique.cbequicksite.com";

const STEPS = [
  { title: "Sign up and pick your business", text: "Choose your type, your business name and your website address. It takes about two minutes." },
  { title: "Add your products", text: "Upload photos, set prices, and add sizes and colours. Change them any time yourself." },
  { title: "Share your link", text: "Put it on your WhatsApp status and Instagram bio. Customers order and the order lands on your WhatsApp." },
];

const FEATURES = [
  { title: "A design made for your business", text: "Clothing, hair, skincare, perfume, jewellery, gadgets and real estate each get their own look. Not one template for everybody." },
  { title: "Your own website address", text: "Something like yourshop.cbequicksite.com that you can send to anyone." },
  { title: "Orders on WhatsApp", text: "Every order comes straight to your WhatsApp, with the product and the customer's details." },
  { title: "Edit it yourself", text: "Change prices, photos and business info from your phone. No need to call a developer." },
  { title: "Sizes, colours and options", text: "Sell shoes in different sizes, wigs in different lengths, or perfume in different bottle sizes." },
  { title: "A dashboard that shows results", text: "See how many orders your website brought you this month and how much they are worth." },
];

const FAQ = [
  { q: "How much does it cost?", a: "You try it free for 7 days first. After that you pick a plan, and you see the plans for your type of business inside your dashboard." },
  { q: "Do I need to know coding?", a: "No. You fill in simple forms, and your website is ready. If you get stuck, message us on WhatsApp." },
  { q: "How do my customers pay me?", a: "Your customers order and pay you directly. Set your bank account and delivery areas in your dashboard, and your details show at checkout. The money goes straight to your bank, not to us." },
  { q: "What happens after the 7 free days?", a: "Your website stays live. You pay to keep editing it. If it stays unpaid for 30 days, it goes offline until you pay." },
  { q: "Can I change my products later?", a: "Yes. You can add, edit or remove products, prices and photos as often as you like." },
];

export default function Landing() {
  return (
    <div className="lp">
      <header className="lp-head">
        <span className="lp-brand">
          <span className="lp-dark">CBE</span><span className="lp-blue">QuickSite</span>
        </span>
        <nav className="lp-nav">
          <Link to="/login" className="lp-login">Log in</Link>
          <Link to="/signup" className="lp-btn small">Start free</Link>
        </nav>
      </header>

      <section className="lp-hero">
        <span className="lp-pill">7 days free. No card needed.</span>
        <h1>Get a real website for your shop in minutes</h1>
        <p>
          Your own website address, your products, and every order straight to your WhatsApp.
          No coding and no developer.
        </p>
        <div className="lp-actions">
          <Link to="/signup" className="lp-btn">Start free</Link>
          <a href={EXAMPLE} target="_blank" rel="noreferrer" className="lp-btn ghost">See a live example</a>
        </div>
      </section>

      <section className="lp-section" id="how">
        <h2>How it works</h2>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="lp-step">
              <span className="lp-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section grey">
        <h2>Everything you need to sell online</h2>
        <div className="lp-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feature">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section">
        <h2>Questions</h2>
        <div className="lp-faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lp-final">
        <h2>Your shop can be online today</h2>
        <p>Sign up now and add your first product in a few minutes.</p>
        <Link to="/signup" className="lp-btn light">Start free</Link>
      </section>

      <footer className="lp-foot">
        <span className="lp-brand">
          <span className="lp-light">CBE</span><span className="lp-sky">QuickSite</span>
        </span>
        <a href={SUPPORT} target="_blank" rel="noreferrer">Chat with us on WhatsApp</a>
        <small>© {new Date().getFullYear()} CBE QuickSite</small>
      </footer>

      <a className="lp-float" href={SUPPORT} target="_blank" rel="noreferrer">Need help?</a>
    </div>
  );
}