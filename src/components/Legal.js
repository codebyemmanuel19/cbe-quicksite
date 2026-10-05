import { Link } from "react-router-dom";
import "./Legal.css";

const SUPPORT = "https://wa.me/2349027090880?text=Hi%2C%20I%20have%20a%20question%20about%20CBE%20QuickSite";
const UPDATED = "5 October 2026";

const PRIVACY = [
  {
    title: "Who we are",
    text: ["CBE QuickSite (\"we\", \"us\") helps small businesses build a website with their products, where customers send orders to the business on WhatsApp. This policy explains what information we collect, why we collect it, and what we do with it."],
  },
  {
    title: "What we collect",
    list: [
      "Your account: your email address and your password.",
      "Your business: your business name, website address, business type, WhatsApp number, phone number, address, logo, photos and products.",
      "Orders from your customers: when someone orders from a website, the details they enter (such as their name, phone number, delivery details and the items) are saved so the business can see the order.",
      "Payments: plan payments are made through Paystack. We do not see or store your full card details. We only receive confirmation that a payment was made.",
      "Usage: basic information such as your device, browser and the pages you visit, so we can keep the service working and improve it.",
    ],
  },
  {
    title: "How we use it",
    list: [
      "To run your website and your dashboard.",
      "To send you emails about your account, such as confirming your email, resetting your password and plan reminders.",
      "To process your payments and keep your plan up to date.",
      "To give you support when you contact us.",
      "To improve CBE QuickSite and measure how well our ads work.",
    ],
  },
  {
    title: "Who we share it with",
    text: ["We do not sell your information. We share it only with:"],
    list: [
      "The business owner, who receives the orders customers place on their website.",
      "Companies that help us run the service, such as hosting, image storage, payment processing (Paystack) and email delivery. They only get what they need to do their job.",
      "Authorities, if the law requires us to.",
    ],
  },
  {
    title: "Orders and WhatsApp",
    text: ["When a customer sends an order, a WhatsApp chat with the business opens. After that, WhatsApp's own terms and privacy policy apply to the conversation."],
  },
  {
    title: "Cookies and ads",
    text: ["We use cookies and similar storage to keep you logged in and to remember a customer's cart. We may also use advertising tools from Meta (Facebook and Instagram) to measure how many people sign up after seeing our ads."],
  },
  {
    title: "Keeping your information safe",
    text: ["We take reasonable steps to protect your information. No system is perfectly secure, so please choose a strong password and do not share it."],
  },
  {
    title: "How long we keep it",
    text: ["We keep your information while your account is active. You can ask us to delete your account and information at any time."],
  },
  {
    title: "Your choices",
    text: ["You can ask to see, correct or delete the information we hold about you. Message us on WhatsApp and we will help."],
  },
  {
    title: "Children",
    text: ["CBE QuickSite is for people aged 18 and over. We do not knowingly collect information from children."],
  },
  {
    title: "Changes to this policy",
    text: ["We may update this policy from time to time. The date at the top shows when it was last changed."],
  },
];

const TERMS = [
  {
    title: "Using CBE QuickSite",
    text: ["You must be 18 or older to use CBE QuickSite. You agree to give correct information and to keep your password safe. You are responsible for everything that happens in your account."],
  },
  {
    title: "Your website and content",
    text: ["You own the products, photos and words you put on your website. You give us permission to show them on your website and in your dashboard. You must have the right to use every photo and description you upload."],
    list: [
      "Do not sell anything illegal, fake, stolen or harmful.",
      "Do not use your website to cheat or mislead customers.",
      "Do not upload content that is abusive, adult or hateful.",
    ],
  },
  {
    title: "Orders and sales",
    text: ["You sell directly to your customers. CBE QuickSite is not part of the sale between you and your customer. You are responsible for your prices, delivery, refunds and any problem with your customers."],
  },
  {
    title: "Free trial and plans",
    list: [
      "Your 7 free days start when you add your first product.",
      "After the trial, your website stays live, but you cannot edit it until you pay for a plan.",
      "When you pay, the time you paid for is added to your account. Paying early never loses you days.",
      "If your website stays unpaid for 30 days, it goes offline until you pay.",
      "Plan prices are shown in your dashboard. A price change only applies to future payments.",
    ],
  },
  {
    title: "Payments and refunds",
    text: ["Payments are made through Paystack and are also covered by Paystack's terms. If you paid by mistake or have a problem with a payment, message us on WhatsApp and we will look at your case."],
  },
  {
    title: "Availability",
    text: ["We work hard to keep CBE QuickSite running, but we cannot promise it will never be down. Sometimes we need to do maintenance or fix problems."],
  },
  {
    title: "Suspending or ending your account",
    text: ["We may suspend or remove a website that breaks these terms. You can stop using CBE QuickSite at any time and ask us to delete your account."],
  },
  {
    title: "Limits on our responsibility",
    text: ["CBE QuickSite is provided \"as is\". To the extent the law allows, we are not responsible for lost sales, lost profit or problems between you and your customers."],
  },
  {
    title: "Changes to these terms",
    text: ["We may update these terms from time to time. If you keep using CBE QuickSite after a change, you accept the new terms."],
  },
];

function Page({ title, sections }) {
  return (
    <div className="lg">
      <header className="lg-head">
        <Link to="/" className="lg-brand">
          <span className="lg-dark">CBE</span><span className="lg-blue">QuickSite</span>
        </Link>
        <Link to="/" className="lg-back">Back to home</Link>
      </header>

      <main className="lg-main">
        <h1>{title}</h1>
        <p className="lg-date">Last updated: {UPDATED}</p>

        {sections.map((s, i) => (
          <section key={s.title} className="lg-section">
            <h2>{i + 1}. {s.title}</h2>
            {s.text && s.text.map((t) => <p key={t}>{t}</p>)}
            {s.list && (
              <ul>
                {s.list.map((li) => <li key={li}>{li}</li>)}
              </ul>
            )}
          </section>
        ))}

        <section className="lg-section">
          <h2>{sections.length + 1}. Contact us</h2>
          <p>
            Questions about this page? Message us on{" "}
            <a href={SUPPORT} target="_blank" rel="noreferrer">WhatsApp</a>.
          </p>
        </section>
      </main>

      <footer className="lg-foot">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
      </footer>
    </div>
  );
}

export function Privacy() {
  return <Page title="Privacy Policy" sections={PRIVACY} />;
}

export function Terms() {
  return <Page title="Terms of Service" sections={TERMS} />;
}