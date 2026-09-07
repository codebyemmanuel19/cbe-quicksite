import React from "react";
import "./Pricing.css";

function Pricing() {
  // Encoded URL string for smooth international WhatsApp onboarding
  const whatsappUrl = "https://wa.me/2349027090880";

  return (
    <section id="pricing" className="pricing">
      <div className="pricing-card">
        <p className="plan-name">CBE QuickSite</p>
        <p className="price">
          $27 <span>one-time setup</span>
        </p>
        <p className="billed-note">then just $5/month to stay live</p>
        <p className="plan-for">For small businesses that want a website fast</p>

        {/* Links straight to your 2 hired WhatsApp support reps */}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="cta-button">
          Get Your Website Now
        </a>

        <ul className="features-list">
          <li>✔ Your own website</li>
          <li>✔ Up to 25 Products/Services</li>
          <li>✔ Home, About, Contact pages</li>
          <li>✔ Dashboard access</li>
          <li>✔ Hosting included</li>
          <li>✔ Support via WhatsApp</li>
        </ul>
      </div>
    </section>
  );
}

export default Pricing;