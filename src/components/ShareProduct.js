import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { api } from "../api";
import "./ShareProduct.css";

// Two buttons for any item in a dashboard list: Share (WhatsApp) and Flyer (a picture to post).
// Usage: <ShareProduct name={p.name} price={p.price} photo={p.photos?.[0]} path={`/product/${p.id}`} tag={p.tag} stock={p.stock} />
// Optional: cta="BOOK A VIEWING" changes the words on the order button.
// `path` is the item's page on the public site. Leave it out to share the main website link.
// `tag` and `stock` are optional. They choose the badge the flyer starts with.

const THEMES = [
  { id: "blue", label: "Blue", bg: "#0f2a6b", accent: "#ffd166", text: "#ffffff" },
  { id: "black", label: "Black & gold", bg: "#111111", accent: "#e6b85c", text: "#ffffff" },
  { id: "green", label: "Green", bg: "#0b3d2e", accent: "#9be7b5", text: "#ffffff" },
  { id: "plum", label: "Plum", bg: "#4a1038", accent: "#ffb3d9", text: "#ffffff" },
  { id: "light", label: "Light", bg: "#ffffff", accent: "#1d4ed8", text: "#111827" },
];

// The small label on the photo. Words that create a reason to order now work best.
const BADGES = ["NEW IN", "HOT 🔥", "LIMITED STOCK", "SALE", "BEST SELLER", "PRE-ORDER"];
const TAG_BADGE = {
  New: "NEW IN",
  "Most loved": "BEST SELLER",
  "Pre-order": "PRE-ORDER",
  Limited: "LIMITED STOCK",
  Sale: "SALE",
};

// Reasons to order, shown with an icon on the flyer. Up to 3 are shown.
const REASONS = [
  { id: "original", icon: "shield", text: "100% Original" },
  { id: "delivery", icon: "truck", text: "Delivery available" },
  { id: "pod", icon: "naira", text: "Pay on delivery" },
  { id: "whatsapp", icon: "chat", text: "Easy WhatsApp order" },
  { id: "quality", icon: "star", text: "Top quality" },
];

function defaultBadge(tag, stock) {
  if (Number.isInteger(stock) && stock > 0 && stock <= 3) return `ONLY ${stock} LEFT`;
  return TAG_BADGE[tag] || "NEW IN";
}

let siteCache = null;
function loadSite() {
  if (!siteCache) {
    siteCache = api
      .get("/sites/me")
      .then((res) => ({
        name: res.site.business.businessName,
        url: String(res.site.url || "").replace(/\/$/, ""),
        whatsapp: String((res.site.business && res.site.business.whatsapp) || "").trim(),
        delivery: !!(res.site.orderSettings && res.site.orderSettings.offersDelivery),
        payOnDelivery: !!(res.site.orderSettings && res.site.orderSettings.payOnDelivery),
      }))
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
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
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

// Mixes a #rrggbb colour towards another colour. t = 0 keeps it, t = 1 gives the other.
function mix(hex, to, t) {
  const n = parseInt(hex.replace("#", ""), 16);
  const m = (a, b) => Math.round(a + (b - a) * t);
  return `rgb(${m((n >> 16) & 255, to[0])},${m((n >> 8) & 255, to[1])},${m(n & 255, to[2])})`;
}

// True when the photo has a see-through background (a cut-out PNG)
function hasCutout(img) {
  try {
    const s = 40;
    const k = document.createElement("canvas");
    k.width = s;
    k.height = s;
    const g = k.getContext("2d");
    g.drawImage(img, 0, 0, s, s);
    const corners = [[0, 0], [s - 1, 0], [0, s - 1], [s - 1, s - 1]];
    return corners.every(([x, y]) => g.getImageData(x, y, 1, 1).data[3] < 20);
  } catch (err) {
    return false;
  }
}

// Small line icons for the "why order" column
function icon(c, kind, cx, cy, r, color) {
  const s = r * 0.52;
  c.save();
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 4;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.stroke();
  c.lineWidth = 3.5;
  c.beginPath();
  if (kind === "shield") {
    c.moveTo(cx, cy - s);
    c.lineTo(cx + s * 0.9, cy - s * 0.55);
    c.lineTo(cx + s * 0.9, cy + s * 0.1);
    c.quadraticCurveTo(cx + s * 0.9, cy + s * 0.8, cx, cy + s * 1.05);
    c.quadraticCurveTo(cx - s * 0.9, cy + s * 0.8, cx - s * 0.9, cy + s * 0.1);
    c.lineTo(cx - s * 0.9, cy - s * 0.55);
    c.closePath();
    c.stroke();
    c.beginPath();
    c.moveTo(cx - s * 0.38, cy + s * 0.05);
    c.lineTo(cx - s * 0.05, cy + s * 0.38);
    c.lineTo(cx + s * 0.45, cy - s * 0.28);
    c.stroke();
  } else if (kind === "truck") {
    c.rect(cx - s * 1.05, cy - s * 0.6, s * 1.35, s * 0.95);
    c.moveTo(cx + s * 0.3, cy - s * 0.25);
    c.lineTo(cx + s * 0.8, cy - s * 0.25);
    c.lineTo(cx + s * 1.05, cy + s * 0.08);
    c.lineTo(cx + s * 1.05, cy + s * 0.35);
    c.lineTo(cx + s * 0.3, cy + s * 0.35);
    c.stroke();
    c.beginPath();
    c.arc(cx - s * 0.5, cy + s * 0.55, s * 0.22, 0, Math.PI * 2);
    c.moveTo(cx + s * 0.82, cy + s * 0.55);
    c.arc(cx + s * 0.6, cy + s * 0.55, s * 0.22, 0, Math.PI * 2);
    c.stroke();
  } else if (kind === "naira") {
    c.font = `800 ${Math.round(r * 1.05)}px -apple-system, Segoe UI, Roboto, Arial, sans-serif`;
    c.textAlign = "center";
    c.fillText("₦", cx, cy + r * 0.36);
    c.textAlign = "left";
  } else if (kind === "chat") {
    c.arc(cx, cy - s * 0.1, s * 0.9, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(cx - s * 0.55, cy + s * 0.65);
    c.lineTo(cx - s * 0.95, cy + s * 1.05);
    c.lineTo(cx - s * 0.1, cy + s * 0.8);
    c.stroke();
    [-0.4, 0, 0.4].forEach((d) => {
      c.beginPath();
      c.arc(cx + s * d, cy - s * 0.1, s * 0.1, 0, Math.PI * 2);
      c.fill();
    });
  } else {
    // star
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 === 0 ? s * 1.05 : s * 0.45;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr + s * 0.05;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.stroke();
  }
  c.restore();
}

function cart(c, x, y, color) {
  c.save();
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 6;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(x - 24, y - 24);
  c.lineTo(x - 12, y - 24);
  c.lineTo(x - 2, y + 8);
  c.lineTo(x + 30, y + 8);
  c.lineTo(x + 38, y - 14);
  c.lineTo(x - 9, y - 14);
  c.stroke();
  c.beginPath();
  c.arc(x + 2, y + 24, 5, 0, Math.PI * 2);
  c.arc(x + 26, y + 24, 5, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function draw(canvas, { img, name, subtitle, priceText, oldPriceText, discount, badge, shop, whatsapp, link, trust, cta, theme, layout = "big" }) {
  const W = 1080;
  const big = layout !== "details"; // story size (1080 x 1920), or the original post size (1080 x 1350)
  const H = big ? 1920 : 1350;
  const SCENE = big ? 1400 : 800; // the picture area, the wave covers its bottom edge
  const DY = big ? 600 : 0; // how far the wave moves down
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d");
  const font = "-apple-system, Segoe UI, Roboto, Arial, sans-serif";
  const light = theme.text !== "#ffffff";
  const cut = img ? hasCutout(img) : false;
  c.textBaseline = "alphabetic";

  // Page colour
  c.fillStyle = theme.bg;
  c.fillRect(0, 0, W, H);

  // ---- Scene ----
  if (img && !cut) {
    // Soft blurred copy of the photo fills the background, so any shape of photo looks finished
    const sw = 36;
    const sh = Math.round((sw * SCENE) / W);
    const small = document.createElement("canvas");
    small.width = sw;
    small.height = sh;
    const sc = small.getContext("2d");
    const cover = Math.max(sw / img.width, sh / img.height);
    sc.drawImage(img, (sw - img.width * cover) / 2, (sh - img.height * cover) / 2, img.width * cover, img.height * cover);
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    c.drawImage(small, 0, 0, W, SCENE);
    c.fillStyle = "rgba(0,0,0,.22)";
    c.fillRect(0, 0, W, SCENE);
  } else {
    // A glowing studio backdrop for cut-outs and for items with no photo
    const g = c.createRadialGradient(W / 2, big ? 720 : 380, 40, W / 2, big ? 720 : 380, big ? 900 : 640);
    g.addColorStop(0, light ? "#ffffff" : mix(theme.bg, [255, 255, 255], 0.38));
    g.addColorStop(1, light ? "#e8eefc" : theme.bg);
    c.fillStyle = g;
    c.fillRect(0, 0, W, SCENE);
    c.strokeStyle = theme.accent;
    c.globalAlpha = 0.35;
    c.lineWidth = 5;
    c.beginPath();
    c.arc(W / 2, big ? 760 : 400, big ? 400 : 300, 0, Math.PI * 2);
    c.stroke();
    c.globalAlpha = 1;
  }

  if (img && cut) {
    // The product floats, with a soft shadow under it
    const boxW = big ? 980 : 860;
    const boxH = big ? 1120 : 600;
    const fit = Math.min(boxW / img.width, boxH / img.height);
    const w = img.width * fit;
    const h = img.height * fit;
    const x = (W - w) / 2;
    const y = (big ? 140 : 120) + (boxH - h) / 2 + 20;
    c.save();
    c.fillStyle = "rgba(0,0,0,.35)";
    c.filter = "blur(18px)";
    c.beginPath();
    c.ellipse(W / 2, y + h - 4, w * 0.42, 24, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    c.save();
    c.shadowColor = "rgba(0,0,0,.35)";
    c.shadowBlur = 36;
    c.shadowOffsetY = 14;
    c.drawImage(img, x, y, w, h);
    c.restore();
  } else if (img) {
    // The whole photo, never cropped, in a clean frame
    const boxX = big ? 60 : 70;
    const boxY = big ? 150 : 130;
    const boxW = W - boxX * 2;
    const boxH = big ? 1190 : 570;
    const fit = Math.min(boxW / img.width, boxH / img.height);
    const w = img.width * fit;
    const h = img.height * fit;
    const x = boxX + (boxW - w) / 2;
    const y = boxY + (boxH - h) / 2;
    c.save();
    c.shadowColor = "rgba(0,0,0,.4)";
    c.shadowBlur = 40;
    c.shadowOffsetY = 14;
    roundRect(c, x - 10, y - 10, w + 20, h + 20, 34, "#ffffff");
    c.restore();
    c.save();
    roundRect(c, x, y, w, h, 26);
    c.clip();
    c.drawImage(img, x, y, w, h);
    c.restore();
  } else {
    c.fillStyle = theme.accent;
    c.globalAlpha = 0.5;
    c.font = `800 380px ${font}`;
    c.textAlign = "center";
    c.fillText(String(name || "?").trim().charAt(0).toUpperCase(), W / 2, big ? 860 : 470);
    c.textAlign = "left";
    c.globalAlpha = 1;
  }

  // ---- Wave and panel ----
  const wave = () => {
    c.beginPath();
    c.moveTo(0, 810 + DY);
    c.bezierCurveTo(260, 870 + DY, 540, 850 + DY, 720, 790 + DY);
    c.bezierCurveTo(870, 742 + DY, 970, 735 + DY, W, 758 + DY);
  };
  wave();
  c.lineTo(W, H);
  c.lineTo(0, H);
  c.closePath();
  c.fillStyle = theme.bg;
  c.fill();
  wave();
  c.strokeStyle = theme.accent;
  c.lineWidth = 7;
  c.stroke();

  // ---- Top: shop name and badge ----
  c.font = `800 32px ${font}`;
  const label = String(shop || "").slice(0, 24);
  const tw = c.measureText(label).width;
  roundRect(c, 40, 40, tw + 56, 68, 34, "rgba(0,0,0,.6)");
  c.fillStyle = "#ffffff";
  c.fillText(label, 68, 85);

  if (badge) {
    c.font = `800 36px ${font}`;
    const bw = c.measureText(badge).width + 56;
    const urgent = /LEFT|LIMITED|SALE/.test(badge);
    roundRect(c, W - 40 - bw, 40, bw, 68, 34, urgent ? "#ef4444" : theme.accent);
    c.fillStyle = urgent ? "#ffffff" : theme.bg;
    c.fillText(badge, W - 40 - bw + 28, 86);
  }

  if (discount > 0) {
    const cx = W - 130;
    const cy = big ? 1215 : 640;
    c.save();
    c.shadowColor = "rgba(0,0,0,.35)";
    c.shadowBlur = 20;
    c.beginPath();
    c.arc(cx, cy, 84, 0, Math.PI * 2);
    c.fillStyle = "#ef4444";
    c.fill();
    c.restore();
    c.fillStyle = "#ffffff";
    c.textAlign = "center";
    c.font = `800 50px ${font}`;
    c.fillText(`-${discount}%`, cx, cy + 10);
    c.font = `700 24px ${font}`;
    c.fillText("OFF", cx, cy + 42);
    c.textAlign = "left";
  }

  if (!big) {
  // ---- Panel: name, line, price, button ----
  c.fillStyle = theme.text;
  let nameSize = 66;
  c.font = `800 ${nameSize}px ${font}`;
  let lines = wrap(c, name, W - 120, 2);
  if (lines.length > 1) {
    nameSize = 54;
    c.font = `800 ${nameSize}px ${font}`;
    lines = wrap(c, name, W - 120, 2);
  }
  const step = nameSize + 6;
  let y = 905;
  lines.forEach((ln, i) => c.fillText(ln, 60, y + i * step));
  y += (lines.length - 1) * step;

  if (subtitle) {
    y += 22;
    c.font = `800 27px ${font}`;
    const text = subtitle.toUpperCase().slice(0, 40);
    const w = Math.min(c.measureText(text).width + 56, 600);
    roundRect(c, 60, y, w, 54, 27, theme.accent);
    c.fillStyle = theme.bg;
    c.fillText(text, 88, y + 37);
    y += 54;
  }

  // Price. The old price goes beside it when it fits, otherwise on its own line above it.
  c.fillStyle = theme.accent;
  let priceSize = 100;
  c.font = `800 ${priceSize}px ${font}`;
  while (priceSize > 56 && c.measureText(priceText).width > 560) {
    priceSize -= 4;
    c.font = `800 ${priceSize}px ${font}`;
  }

  let oldSize = 40;
  let ow = 0;
  let beside = false;
  if (oldPriceText) {
    // Shrink the price (down to 76) and the old price (down to 32) until both sit on one line
    for (;;) {
      c.font = `800 ${priceSize}px ${font}`;
      const pw = c.measureText(priceText).width;
      c.font = `600 ${oldSize}px ${font}`;
      ow = c.measureText(oldPriceText).width;
      if (60 + pw + 22 + ow <= 585) {
        beside = true;
        break;
      }
      if (priceSize > 76) priceSize -= 4;
      else if (oldSize > 32) oldSize -= 2;
      else break;
    }
  }
  const stacked = Boolean(oldPriceText) && !beside;

  y += lines.length > 1 ? 100 : 114;
  if (stacked) y += 52;

  c.font = `800 ${priceSize}px ${font}`;
  c.fillStyle = theme.accent;
  const priceW = c.measureText(priceText).width;
  c.fillText(priceText, 60, y);

  if (oldPriceText) {
    c.font = `600 ${oldSize}px ${font}`;
    c.fillStyle = light ? "rgba(17,24,39,.5)" : "rgba(255,255,255,.55)";
    const ox = beside ? 60 + priceW + 22 : 60;
    const oy = beside ? y - 6 : y - 88;
    c.fillText(oldPriceText, ox, oy);
    c.fillRect(ox, oy - Math.round(oldSize * 0.36), ow, 4);
  }

  // Order button
  y += lines.length > 1 ? (stacked ? 16 : 24) : 36;
  roundRect(c, 60, y, 470, 92, 46, theme.accent);
  cart(c, 118, y + 44, theme.bg);
  c.fillStyle = theme.bg;
  let ctaSize = 40;
  c.font = `800 ${ctaSize}px ${font}`;
  while (ctaSize > 26 && c.measureText(cta || "ORDER NOW").width > 270) {
    ctaSize -= 2;
    c.font = `800 ${ctaSize}px ${font}`;
  }
  c.fillText(cta || "ORDER NOW", 178, y + 58);
  c.font = `800 44px ${font}`;
  c.fillText("›", 478, y + 58);

  // ---- Why order (right column) ----
  // A long name takes two lines, so the column starts lower and shows two reasons
  const reasons = trust.slice(0, lines.length > 1 ? 2 : 3);
  const colX = 640;
  const rowStart = lines.length > 1 ? 1125 : 960;
  c.fillStyle = light ? "rgba(17,24,39,.15)" : "rgba(255,255,255,.2)";
  if (reasons.length) c.fillRect(colX - 22, rowStart - 50, 2, reasons.length * 96 - 20);
  reasons.forEach((r, i) => {
    const cy = rowStart + i * 96;
    icon(c, r.icon, colX + 38, cy, 38, theme.accent);
    c.fillStyle = theme.text;
    c.font = `700 28px ${font}`;
    const words = wrap(c, r.text, 280, 2);
    words.forEach((ln, k) => c.fillText(ln, colX + 96, cy + (words.length === 1 ? 10 : -4 + k * 34)));
  });
  } else {
    // ---- Story layout: big photo on top, then name, price, button and the reasons ----
    c.fillStyle = theme.text;
    const nameSize = 56;
    c.font = `800 ${nameSize}px ${font}`;
    const lines = wrap(c, name, 520, 2);
    const nameStep = nameSize + 8;
    lines.forEach((ln, i) => c.fillText(ln, 60, 1536 + i * nameStep));

    // Price (with the old price beside it), shrunk until both fit the left side
    let priceSize = 92;
    let oldSize = 32;
    let ow = 0;
    for (;;) {
      c.font = `800 ${priceSize}px ${font}`;
      const pw = c.measureText(priceText).width;
      if (oldPriceText) {
        c.font = `600 ${oldSize}px ${font}`;
        ow = c.measureText(oldPriceText).width;
      }
      const need = pw + (oldPriceText ? 16 + ow : 0);
      if (need <= 520 || (priceSize <= 56 && oldSize <= 24)) break;
      if (priceSize > 56) priceSize -= 4;
      else oldSize -= 2;
    }
    const priceY = 1690;
    c.font = `800 ${priceSize}px ${font}`;
    c.fillStyle = theme.accent;
    const priceW = c.measureText(priceText).width;
    c.fillText(priceText, 60, priceY);
    if (oldPriceText) {
      c.font = `600 ${oldSize}px ${font}`;
      c.fillStyle = light ? "rgba(17,24,39,.55)" : "rgba(255,255,255,.6)";
      const ox = 60 + priceW + 16;
      c.fillText(oldPriceText, ox, priceY - 4);
      c.fillRect(ox, priceY - 4 - Math.round(oldSize * 0.36), ow, 3);
    }

    // Order button
    const by = 1722;
    roundRect(c, 60, by, 520, 92, 46, theme.accent);
    cart(c, 122, by + 44, theme.bg);
    c.fillStyle = theme.bg;
    let ctaSize = 40;
    c.font = `800 ${ctaSize}px ${font}`;
    while (ctaSize > 26 && c.measureText(cta || "ORDER NOW").width > 270) {
      ctaSize -= 2;
      c.font = `800 ${ctaSize}px ${font}`;
    }
    c.fillText(cta || "ORDER NOW", 184, by + 59);
    c.font = `800 46px ${font}`;
    c.fillText("›", 520, by + 60);

    // Reasons to order: pills down the right side
    const reasons = trust.slice(0, 3);
    reasons.forEach((r, i) => {
      const py = 1500 + i * 106;
      roundRect(c, 620, py, 400, 86, 43, light ? "rgba(17,24,39,.08)" : "rgba(255,255,255,.14)");
      c.fillStyle = theme.accent;
      c.beginPath();
      c.arc(620 + 43, py + 43, 38, 0, Math.PI * 2);
      c.fill();
      icon(c, r.icon, 620 + 43, py + 43, 38, theme.bg);
      c.fillStyle = theme.text;
      c.font = `700 28px ${font}`;
      const words = wrap(c, r.text, 270, 2);
      words.forEach((ln, k) => c.fillText(ln, 620 + 98, py + (words.length === 1 ? 53 : 37 + k * 32)));
    });
  }

  // Short line as a tag on the bottom of the photo (story layout)
  if (big && subtitle) {
    c.font = `800 28px ${font}`;
    const text = subtitle.toUpperCase().slice(0, 40);
    const w = Math.min(c.measureText(text).width + 56, 700);
    roundRect(c, 90, 150 + 1190 - 86, w, 58, 29, theme.accent);
    c.fillStyle = theme.bg;
    c.fillText(text, 118, 150 + 1190 - 86 + 40);
  }

  // ---- Footer ----
  c.fillStyle = light ? "#eef2ff" : "#f6efe0";
  c.fillRect(0, H - 80, W, 80);
  c.fillStyle = "#14213d";
  c.font = `800 30px ${font}`;
  c.fillText(whatsapp ? `WhatsApp: ${whatsapp}`.slice(0, 34) : "Order on WhatsApp", 50, H - 43);
  c.globalAlpha = 0.65;
  c.font = `600 19px ${font}`;
  c.fillText("Made with CBE QuickSite", 50, H - 16);
  c.globalAlpha = 1;
  // The link people tap or type to order
  // Use the full link if it fits, otherwise just the shop address
  const fullLink = String(link || "").replace(/^https?:\/\//, "");
  let shown = fullLink;
  c.font = `800 25px ${font}`;
  if (c.measureText(shown).width > 480) {
    c.font = `800 21px ${font}`;
    if (c.measureText(shown).width > 480) {
      shown = fullLink.split("/")[0];
      c.font = `800 25px ${font}`;
    }
  }
  c.textAlign = "right";
  c.fillText(shown, W - 40, H - 30);
  c.textAlign = "left";
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

export default function ShareProduct({ name, price, photo, photos = [], path = "", from = false, tag = "", stock = null, cta = "ORDER NOW" }) {
  const list = photos && photos.length ? photos : photo ? [photo] : [];
  const [pickedPhoto, setPickedPhoto] = useState(0);
  const picture = list[pickedPhoto] || list[0] || "";
  const [site, setSite] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [themeId, setThemeId] = useState("blue");
  const [layout, setLayout] = useState("big");
  const [ready, setReady] = useState(false);
  const [badge, setBadge] = useState("NEW IN");
  const [line, setLine] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [picked, setPicked] = useState({ original: false, delivery: false, pod: false, whatsapp: true, quality: false });
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

  const oldAmount = Number(oldPrice);
  const hasOld = oldPrice !== "" && Number.isFinite(oldAmount) && oldAmount > Number(price);
  const oldPriceText = hasOld ? naira(oldAmount) : "";
  const discount = hasOld ? Math.round(((oldAmount - Number(price)) / oldAmount) * 100) : 0;

  const startBadge = defaultBadge(tag, stock);
  const badgeOptions = BADGES.includes(startBadge) ? BADGES : [startBadge, ...BADGES];

  const trust = REASONS.filter((r) => picked[r.id]);
  const trustKey = trust.map((r) => r.id).join(",");

  function openFlyer() {
    // Start with what the shop settings say. The vendor can change every one of these.
    setBadge(startBadge);
    setLine("");
    setOldPrice("");
    setPicked({
      original: false,
      delivery: !!(site && site.delivery),
      pod: !!(site && site.payOnDelivery),
      whatsapp: true,
      quality: false,
    });
    setOpen(true);
  }

  async function onShare() {
    if (!site) return;
    setBusy(true);
    const text = `🔥 ${name}\n${priceText}\nOrder here: ${link}`;
    const file = picture ? await photoFile(picture) : null;
    await shareOut({ text, file });
    setBusy(false);
  }

  // Redraw the flyer whenever it opens or anything on it changes
  useEffect(() => {
    if (!open || !site) return;
    let cancelled = false;
    setReady(false);
    loadImage(picture).then((img) => {
      if (cancelled || !canvasRef.current) return;
      draw(canvasRef.current, {
        img,
        name,
        subtitle: line.trim(),
        priceText,
        oldPriceText,
        discount,
        badge,
        shop: site.name,
        whatsapp: site.whatsapp,
        link,
        trust,
        cta,
        theme,
        layout,
      });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // `trust` is rebuilt from `picked`, so `trustKey` is what we watch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, site, picture, name, line, priceText, oldPriceText, discount, badge, link, cta, theme, layout, trustKey]);

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
      <button type="button" onClick={openFlyer} disabled={!site}>
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
              <div className="sp-stage">
                <canvas ref={canvasRef} className="sp-canvas" style={{ opacity: ready ? 1 : 0.4 }} />
                {list.length > 1 && (
                  <div className="sp-dots" aria-label="Choose flyer photo">
                    {list.map((src, i) => (
                      <button
                        type="button"
                        key={src + i}
                        className={i === pickedPhoto ? "on" : ""}
                        onClick={() => setPickedPhoto(i)}
                        aria-label={`Use photo ${i + 1}`}
                      >
                        <span />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {list.length > 1 && <p className="sp-tip">Tap a dot to change the photo on your flyer.</p>}

              <p className="sp-label">Flyer style</p>
              <div className="sp-chips">
                <button type="button" className={layout === "big" ? "on" : ""} onClick={() => setLayout("big")}>
                  Story
                </button>
                <button type="button" className={layout === "details" ? "on" : ""} onClick={() => setLayout("details")}>
                  Post
                </button>
              </div>

              <p className="sp-label">Badge on the photo</p>
              <div className="sp-chips">
                {badgeOptions.map((b) => (
                  <button type="button" key={b} className={b === badge ? "on" : ""} onClick={() => setBadge(b)}>
                    {b}
                  </button>
                ))}
                <button type="button" className={badge === "" ? "on" : ""} onClick={() => setBadge("")}>
                  None
                </button>
              </div>

              <p className="sp-label">Short line under the name (optional)</p>
              <input
                className="sp-input"
                maxLength={40}
                placeholder="e.g. Unisex • Long lasting"
                value={line}
                onChange={(e) => setLine(e.target.value)}
              />

              <p className="sp-label">Old price (optional)</p>
              <input
                className="sp-input"
                inputMode="numeric"
                placeholder="Type the old price to show a discount"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value.replace(/\D/g, ""))}
              />
              {oldPrice !== "" && !hasOld && <p className="sp-warn">The old price must be higher than the price.</p>}

              <p className="sp-label">Reasons to order (the flyer shows up to 3)</p>
              <div className="sp-chips">
                {REASONS.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    className={picked[r.id] ? "on" : ""}
                    onClick={() => setPicked({ ...picked, [r.id]: !picked[r.id] })}
                  >
                    {r.text}
                  </button>
                ))}
              </div>
              <p className="sp-tip">Only tick what is true for your business.</p>

              <p className="sp-label">Colour</p>
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
              <p className="sp-hint">Tip: a photo with no background (PNG) makes your product stand out. Download it, then post it on your WhatsApp status, Instagram or Facebook.</p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}