import React from "react";
import { Link } from "react-router-dom";
import "./ReviewsPage.css";

// ---- Add each new review here. Nothing else to change. ----
// image: put the screenshot in public/reviews/ and use "/reviews/filename.jpg"
// quote: optional, for typed reviews with no screenshot
const REVIEWS = [
  {
    id: 1,
    name: "Kemi's Boutique",
    business: "Bags and accessories, Lagos",
    image: "/reviews/kemisboutique.jpg",
    quote: "",
  },
  // {
  //   id: 2,
  //   name: "Business name",
  //   business: "What they sell, city",
  //   image: "/reviews/filename.jpg",
  //   quote: "Or type the review here instead of a screenshot.",
  // },
];

const WHATSAPP_LINK = "https://wa.me/2349027090880";

function ReviewsPage() {
  return (
    <main className="reviews">
      <header className="reviews-header">
        <Link className="reviews-back" to="/">← Back to site</Link>
        <h1>Client Reviews</h1>
        <p>Real business owners, in their own words.</p>
      </header>

      {REVIEWS.length === 0 ? (
        <p className="reviews-empty">Reviews coming soon.</p>
      ) : (
        <div className="reviews-grid">
          {REVIEWS.map((review) => (
            <article className="review-card" key={review.id}>
              {review.image && (
                <div className="review-shot">
                  <img
                    src={review.image}
                    alt={`Review from ${review.name}`}
                    loading="lazy"
                  />
                </div>
              )}

              {review.quote && <p className="review-quote">{review.quote}</p>}

              <div className="review-who">
                <strong>{review.name}</strong>
                {review.business && <span>{review.business}</span>}
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="reviews-cta">
        <h2>Want one for your business?</h2>
        <p>₦30,000, ready the same day.</p>
        <a className="reviews-btn" href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
          Message me on WhatsApp
        </a>
      </section>
    </main>
  );
}

export default ReviewsPage;