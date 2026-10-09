import { Link } from "react-router-dom";
import "./Landing.css";

const SUPPORT = "https://wa.me/2349027090880?text=Hi%2C%20I%20have%20a%20question%20about%20CBE%20QuickSite";

// Add a phone screenshot of each shop to your public/examples folder,
// then set img to "/examples/kemi.png" and so on. Without img, a plain tile shows.
const EXAMPLES = [
  { type: "Clothing & fashion", name: "Kemi's Boutique", url: "https://kemisboutique.cbequicksite.com", img: "" },
  { type: "Hair & wigs", name: "Luxe Hair", url: "https://hai1.cbequicksite.com", img: "" },
  { type: "Real estate", name: "Port Harcourt Homes", url: "https://realestate.cbequicksite.com", img: "" },
];

const TRUST = [
  "Orders go to your WhatsApp",
  "Customers pay your bank directly",
  "Edit everything from your phone",
];

const MOCK_ITEMS = [
  { name: "Ankara gown", price: "₦19,000", color: "#fdba74" },
  { name: "Lace set", price: "₦24,500", color: "#a5b4fc" },
  { name: "Senator wear", price: "₦32,000", color: "#86efac" },
  { name: "Ankara skirt", price: "₦12,000", color: "#f9a8d4" },
];

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

const PLANS = [
  {
    name: "Shops",
    price: "₦5,000",
    per: "a month",
    who: "Clothing, hair & wigs, skincare, perfume, jewellery and gadgets",
    points: [
      "Your own website address",
      "Products with photos, sizes and colours",
      "A price for every option you sell",
      "Orders straight to your WhatsApp",
    ],
  },
  {
    name: "Real estate",
    price: "₦10,000",
    per: "a month",
    who: "Estate agents and property companies",
    points: [
      "Your own website address",
      "Up to 8 photos on every property",
      "Buyers filter by sale, rent, house, flat or land",
      "Every enquiry lands in your dashboard",
    ],
  },
];

const FAQ = [
  { q: "How much does it cost?", a: "Seven days free first, and no card needed. After that, shops are ₦5,000 a month and real estate is ₦10,000 a month. Pay for 3, 6 or 12 months and it costs less." },
  { q: "Do I need to know coding?", a: "No. You fill in simple forms, and your website is ready. If you get stuck, message us on WhatsApp." },
  { q: "How do my customers pay me?", a: "Your customers order and pay you directly. Set your bank account and delivery areas in your dashboard, and your details show at checkout. The money goes straight to your bank, not to us." },
  { q: "What happens after the 7 free days?", a: "Your website stays live. You pay to keep editing it. If it stays unpaid for 30 days, it goes offline until you pay." },
  { q: "Can I change my products later?", a: "Yes. You can add, edit or remove products, prices and photos as often as you like." },
];

// A small drawing of a finished shop, with the WhatsApp order arriving
function PhoneMock() {
  return (
    <div className="lp-phone" aria-hidden="true">
      <div className="lp-screen">
        <div className="lp-shophead">Kemi's Boutique</div>
        <div className="lp-mockgrid">
          {MOCK_ITEMS.map((i) => (
            <div key={i.name} className="lp-mockitem">
              <span className="lp-mockimg" style={{ background: i.color }} />
              <span className="lp-mockname">{i.name}</span>
              <span className="lp-mockprice">{i.price}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-toast">
        <b>New order on WhatsApp</b>
        <span>2 × Ankara gown, ₦38,000</span>
      </div>
    </div>
  );
}

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

      <section className="lp-top">
        <div className="lp-top-text">
          <h1>Your shop online in 5 minutes. Orders go straight to your WhatsApp.</h1>
          <p>
            Make a website for your clothes, hair, perfume or property business.
            No coding, no developer.
          </p>
          <div className="lp-actions">
            <Link to="/signup" className="lp-btn">Start free</Link>
            <a href="#examples" className="lp-btn ghost">See real websites</a>
          </div>
          <p className="lp-free">7 days free. No card needed.</p>
        </div>
        <PhoneMock />
      </section>

      <div className="lp-strip">
        {TRUST.map((t) => <span key={t}>{t}</span>)}
      </div>

      <section className="lp-section" id="examples">
        <h2>See real websites</h2>
        <p className="lp-sub">Open them on your phone. Every business type looks different.</p>

        <div className="lp-examples">
          {EXAMPLES.map((e) => (
            <a key={e.url} className="lp-example" href={e.url} target="_blank" rel="noreferrer">
              <span className="lp-shot">
                {e.img ? <img src={e.img} alt={`${e.name} website`} loading="lazy" /> : e.name.charAt(0)}
              </span>
              <span className="lp-ex-type">{e.type}</span>
              <span className="lp-ex-name">{e.name}</span>
              <span className="lp-ex-go">Open website</span>
            </a>
          ))}
        </div>
      </section>

      <section className="lp-section grey" id="how">
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

      <section className="lp-section">
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

      <section className="lp-section grey" id="pricing">
        <h2>Simple pricing</h2>
        <p className="lp-sub">Seven days free first. No card needed.</p>

        <div className="lp-plans">
          {PLANS.map((p) => (
            <div key={p.name} className="lp-plan">
              <h3>{p.name}</h3>
              <p className="lp-amount">
                {p.price}<small> {p.per}</small>
              </p>
              <p className="lp-who">{p.who}</p>
              <ul>
                {p.points.map((t) => <li key={t}>{t}</li>)}
              </ul>
              <Link to="/signup" className="lp-btn ghost full">Start free</Link>
            </div>
          ))}
        </div>

        <p className="lp-note">Pay for 3, 6 or 12 months and it costs less.</p>
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
        <h2>Ready to put your business online?</h2>
        <p>Seven days free. No card needed.</p>
        <Link to="/signup" className="lp-btn light">Start free</Link>
      </section>

      <footer className="lp-foot">
        <span className="lp-brand">
          <span className="lp-light">CBE</span><span className="lp-sky">QuickSite</span>
        </span>
        <a href={SUPPORT} target="_blank" rel="noreferrer">Chat with us on WhatsApp</a>
        <div className="lp-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
        <small>© {new Date().getFullYear()} CBE QuickSite</small>
      </footer>

      <a className="lp-float" href={SUPPORT} target="_blank" rel="noreferrer">Need help?</a>
    </div>
  );
}