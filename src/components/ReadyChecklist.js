import { useState } from "react";
import { Link } from "react-router-dom";
import "./ReadyChecklist.css";

// The "Get your website ready" card, shared by every dashboard home.
//   items: [{ label, done, to }]   the steps that are different for each business type
//   slug: the shop's name, used to remember that the link was shared
//   shareLink: the WhatsApp share link
// The last step, "Share your website link", is added here.
export default function ReadyChecklist({ items = [], slug = "", shareLink = "" }) {
  const key = `cbe_shared_${slug}`;
  const [shared, setShared] = useState(() => {
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });

  function markShared() {
    setShared(true);
    try {
      localStorage.setItem(key, "1");
    } catch {
      // Private mode: it still shows as done until they leave the page
    }
  }

  const list = [...items, { label: "Share your website link", done: shared, share: true }];
  const doneCount = list.filter((item) => item.done).length;

  return (
    <section className="rc">
      <div className="rc-head">
        <h2>Get your website ready</h2>
        <span>
          {doneCount} of {list.length} done
        </span>
      </div>
      <div className="rc-bar">
        <div className="rc-fill" style={{ width: `${(doneCount / list.length) * 100}%` }} />
      </div>

      {list.map((item) => (
        <div key={item.label} className={item.done ? "rc-item done" : "rc-item"}>
          <span className="rc-box">{item.done ? "✓" : ""}</span>
          <span className="rc-label">{item.label}</span>
          {!item.done &&
            (item.share ? (
              <a href={shareLink} target="_blank" rel="noreferrer" className="rc-go" onClick={markShared}>
                Share
              </a>
            ) : (
              <Link to={item.to} className="rc-go">
                Go
              </Link>
            ))}
        </div>
      ))}
    </section>
  );
}