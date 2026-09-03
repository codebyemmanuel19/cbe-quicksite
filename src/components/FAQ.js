import React, { useState } from "react";
import "./FAQ.css";

const faqs = [
  {
    question: "How fast can I get my website?",
    answer: "Once you message us and send your business details, your site is usually ready within minutes to a few hours.",
  },
  {
    question: "Do I need to know how to code?",
    answer: "No. We set everything up for you. You can also make simple edits yourself through your dashboard if you want to.",
  },
  {
    question: "What happens if I don't pay the monthly fee?",
    answer: "Your site pauses until you renew. Once you pay and get your renewal code, your site comes back online immediately.",
  },
  {
    question: "Can I use my own domain name?",
    answer: "Right now every site comes with a free subdomain (yourbusiness.cbequicksite.com). Custom domains may be available later as an upgrade.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((item, index) => (
          <div className="faq-item" key={index}>
            <button className="faq-question" onClick={() => toggleFAQ(index)}>
              {item.question}
              <span>{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <p className="faq-answer">{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;