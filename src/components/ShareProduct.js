import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { api } from "../api";
import "./ShareProduct.css";

// Two buttons for any item in a dashboard list: Share (WhatsApp) and Flyer (a picture to post).
// Usage: <ShareProduct name={p.name} price={p.price} photo={p.photos?.[0]} path={`/product/${p.id}`} />
// `path` is the item's page on the public site. Leave it out to share the main website link.

const THEMES = [
  { id: "blue", label: "Blue", bg: "#0f2a6b", accent: "#ffd166", text: "#ffffff" },
  { id: "black", label: "Black & gold", bg: "#111111", accent: "#e6b85c", text: "#ffffff" },
  { id: "green", label: "Green", bg: "#0b3d2e", accent: "#9be7b5", text: "#ffffff" },
  { id: "plum", label: "Plum", bg: "#4a1038", accent: "#ffb3d9", text: "#ffffff" },
  { id: "light", label: "Light", bg: "#ffffff", accent: "#1d4ed8", text: "#111827" },
];

let siteCache = null;
function loadSite() {
  if (!siteCache) {
    siteCache = api
      .get("/sites/me")
      .then((res) => ({ name: res.site.business.businessName, url: String(res.site.url || "").replace(/\/$/, "") }))
      .catch(() => {
        siteCache = null;
        return null;
      });
  }
  return siteCache;
}

function naira(n) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

function roundRect(c, x, y, w, h, r, fill) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

function wrap(c, text, maxWidth, maxLines) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (c.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    let last = lines[maxLines - 1];
    while (last.length > 1 && c.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
    lines[maxLines - 1] = last + "…";
  }
  return lines;
}

function draw(canvas, { img, name, priceText, shop, link, theme }) {
  const W = 1080;
  const H = 1350;
  const PH = 860; // photo height
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  const font = "-apple-system, Segoe UI, Roboto, Arial, sans-serif";

  c.fillStyle = theme.bg;
  c.fillRect(0, 0, W, H);

  if (img) {
    // Soft blurred copy of the photo fills the background, so any shape of photo looks finished
    const sw = 36;
    const sh = Math.round((sw * PH) / W);
    const small = document.createElement("canvas");
    small.width = sw;
    small.height = sh;
    const sc = small.getContext("2d");
    const cover = Math.max(sw / img.width, sh / img.height);
    sc.drawImage(img, (sw - img.width * cover) / 2, (sh - img.height * cover) / 2, img.width * cover, img.height * cover);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    c.drawImage(small, 0, 0, W, PH);
    c.fillStyle = "rgba(0,0,0,.18)";
    c.fillRect(0, 0, W, PH);

    // The whole photo, never cropped
    const boxX = 35;
    const boxY = 125;
    const boxW = W - 70;
    const boxH = PH - boxY - 35;
    const fit = Math.min(boxW / img.width, boxH / img.height);
    const w = img.width * fit;
    const h = img.height * fit;
    const x = boxX + (boxW - w) / 2;
    const y = boxY + (boxH - h) / 2;
    c.save();
    c.shadowColor = "rgba(0,0,0,.35)";
    c.shadowBlur = 40;
    c.shadowOffsetY = 12;
    roundRect(c, x, y, w, h, 26, "#ffffff");
    c.restore();
    c.save();
    c.beginPath();
    c.moveTo(x + 26, y);
    c.arcTo(x + w, y, x + w, y + h, 26);
    c.arcTo(x + w, y + h, x, y + h, 26);
    c.arcTo(x, y + h, x, y, 26);
    c.arcTo(x, y, x + w, y, 26);
    c.closePath();
    c.clip();
    c.drawImage(img, x, y, w, h);
    c.restore();
  } else {
    const g = c.createLinearGradient(0, 0, W, PH);
    g.addColorStop(0, theme.accent);
    g.addColorStop(1, theme.bg);
    c.fillStyle = g;
    c.fillRect(0, 0, W, PH);
    c.fillStyle = "rgba(255,255,255,.35)";
    c.font = `800 420px ${font}`;
    c.textAlign = "center";
    c.fillText(String(name || "?").trim().charAt(0).toUpperCase(), W / 2, PH / 2 + 150);
    c.textAlign = "left";
  }

  // Business name tag on the photo
  c.font = `700 34px ${font}`;
  const label = String(shop || "").slice(0, 28);
  const tw = c.measureText(label).width;
  roundRect(c, 40, 40, tw + 60, 70, 35, "rgba(0,0,0,.6)");
  c.fillStyle = "#ffffff";
  c.fillText(label, 70, 87);

  // Name and price
  c.fillStyle = theme.text;
  c.font = `700 64px ${font}`;
  const lines = wrap(c, name, W - 120, 2);
  lines.forEach((ln, i) => c.fillText(ln, 60, PH + 95 + i * 74));

  c.fillStyle = theme.accent;
  c.font = `800 96px ${font}`;
  c.fillText(priceText, 60, PH + 95 + lines.length * 74 + 80);

  // Order line
  roundRect(c, 60, H - 150, 260, 84, 42, theme.accent);
  c.fillStyle = theme.bg;
  c.font = `800 36px ${font}`;
  c.fillText("Order now", 100, H - 96);
  c.fillStyle = theme.text;
  c.font = `600 32px ${font}`;
  let shown = String(link || "").replace(/^https?:\/\//, "");
  while (shown.length > 3 && c.measureText(shown).width > W - 400) shown = shown.slice(0, -2);
  c.fillText(shown, 350, H - 98);
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function photoFile(src) {
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    return new File([blob], "product.jpg", { type: blob.type || "image/jpeg" });
  } catch {
    return null;
  }
}

async function shareOut({ text, file }) {
  try {
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text });
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  } catch (err) {
    // The person closed the share sheet. Nothing to do.
    if (err && err.name !== "AbortError") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }
}

export default function ShareProduct({ name, price, photo, path = "", from = false }) {
  const [site, setSite] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState("blue");
  const [ready, setReady] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadSite().then((s) => {
      if (!cancelled) setSite(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const link = site ? `${site.url}${path}` : "";
  const priceText = (from ? "From " : "") + naira(price);
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  async function onShare() {
    if (!site) return;
    setBusy(true);
    const text = `🔥 ${name}\n${priceText}\nOrder here: ${link}`;
    const file = photo ? await photoFile(photo) : null;
    await shareOut({ text, file });
    setBusy(false);
  }

  // Redraw the flyer whenever it opens or the colour changes
  useEffect(() => {
    if (!open || !site) return;
    let cancelled = false;
    setReady(false);
    loadImage(photo).then((img) => {
      if (cancelled || !canvasRef.current) return;
      draw(canvasRef.current, { img, name, priceText, shop: site.name, link, theme });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, site, photo, name, priceText, link, theme]);

  function toBlob() {
    return new Promise((resolve) => canvasRef.current.toBlob(resolve, "image/png"));
  }

  async function download() {
    const blob = await toBlob();
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${String(name).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "flyer"}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  async function shareFlyer() {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], "flyer.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${name}\nOrder here: ${link}` });
      } catch {
        /* closed */
      }
    } else {
      download();
    }
  }

  return (
    <>
      <button type="button" onClick={onShare} disabled={busy || !site}>
        {busy ? "..." : "Share"}
      </button>
      <button type="button" onClick={() => setOpen(true)} disabled={!site}>
        Flyer
      </button>

      {open &&
        createPortal(
          <div className="sp-back" onClick={() => setOpen(false)}>
            <div className="sp-box" onClick={(e) => e.stopPropagation()}>
              <div className="sp-head">
                <b>Your flyer</b>
                <button type="button" className="sp-x" onClick={() => setOpen(false)}>×</button>
              </div>
              <canvas ref={canvasRef} className="sp-canvas" style={{ opacity: ready ? 1 : 0.4 }} />
              <div className="sp-themes">
                {THEMES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className={t.id === themeId ? "on" : ""}
                    style={{ background: t.bg, color: t.text, borderColor: t.accent }}
                    onClick={() => setThemeId(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="sp-acts">
                <button type="button" className="sp-ghost" onClick={download} disabled={!ready}>Download</button>
                <button type="button" className="sp-main" onClick={shareFlyer} disabled={!ready}>Share flyer</button>
              </div>
              <p className="sp-hint">Download it, then post it on your WhatsApp status, Instagram or Facebook.</p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}