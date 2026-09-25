import { useState } from "react";

// Photos you can swipe left and right, with dots.
// Styling comes from each template's own CSS, using the class names passed in.
export default function PhotoCarousel({ photos, alt, prefix = "cs" }) {
  const [index, setIndex] = useState(0);
  const list = photos && photos.length ? photos : [];

  function handleScroll(e) {
    const el = e.currentTarget;
    const current = Math.round(el.scrollLeft / el.clientWidth);
    if (current !== index) setIndex(current);
  }

  if (!list.length) {
    return (
      <div className={`${prefix}-photo`}>
        <div className={`${prefix}-track`} />
      </div>
    );
  }

  return (
    <div className={`${prefix}-photo`}>
      <div className={`${prefix}-track`} onScroll={handleScroll}>
        {list.map((src, i) => (
          <img key={i} src={src} alt={alt} loading="lazy" draggable={false} />
        ))}
      </div>
      {list.length > 1 && (
        <div className={`${prefix}-dots`}>
          {list.map((_, i) => (
            <span key={i} className={i === index ? `${prefix}-dot on` : `${prefix}-dot`} />
          ))}
        </div>
      )}
    </div>
  );
}