import React from "react";
import "./ContactCTA.css";

function ContactCTA() {
  return (
    <section id="contact" className="contact-cta">
      <h2>Ready to get your website?</h2>
      <p>
        Message us on WhatsApp now — tell us your business name and
        we'll get you set up fast.
      </p>
      <a
        href="https://wa.me/2349027090880"
        target="_blank"
        rel="noopener noreferrer"
        className="cta-button"
      >
        Message Us on WhatsApp
      </a>

      <div className="social-links">
        <a href="https://www.instagram.com/codebyemmanuel091" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://www.tiktok.com/@codebyemmal" target="_blank" rel="noopener noreferrer">TikTok</a>
        <a href="https://www.facebook.com/Codebyemmanuel" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://x.com/emmadkenny" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} CBE QuickSite. All rights reserved.</p>
      </footer>
    </section>
  );
}

export default ContactCTA;