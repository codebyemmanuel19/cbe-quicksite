// Shrinks a phone photo before it is uploaded, so it uploads in about a second.
// A 5MB photo becomes roughly 200-400KB and looks the same on a phone.
// PNG stays PNG, so cut-out product photos keep their see-through background.

const MAX_SIDE = 1600;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image."));
    };
    img.src = url;
  });
}

export async function prepareImage(file) {
  try {
    if (!file.type.startsWith("image/")) return file;
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

    const img = await loadImage(file);
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return file;

    const scale = Math.min(1, MAX_SIDE / Math.max(w, h));

    // Already small: leave it alone
    if (scale === 1 && file.size < 400 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const keepPng = file.type === "image/png";
    const type = keepPng ? "image/png" : "image/jpeg";
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.82));

    // If something went wrong, or it didn't get smaller, use the original
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.${keepPng ? "png" : "jpg"}`, { type });
  } catch (err) {
    return file;
  }
}