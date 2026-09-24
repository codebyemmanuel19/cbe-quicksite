// Every call to the API goes through here, so the cookie is always sent
// and errors always come back the same way.
const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    credentials: "include", // sends the login cookie
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  let data = {};
  try {
    data = await res.json();
  } catch (err) {
    data = {};
  }

  if (!res.ok) {
    const error = new Error(data.error || "Something went wrong. Please try again.");
    error.status = res.status;
    error.locked = res.status === 402; // trial ended
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body || {}) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body || {}) }),
  del: (path) => request(path, { method: "DELETE" }),
};

// Sends a photo straight to Cloudinary, signed by our API
export async function uploadPhoto(file) {
  const sig = await api.get("/uploads/signature");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", sig.timestamp);
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  form.append("allowed_formats", sig.allowed_formats);
  form.append("transformation", sig.transformation);

  const res = await fetch(sig.uploadUrl, { method: "POST", body: form });
  const data = await res.json();

  if (!data.secure_url) throw new Error("Photo failed to upload. Try again.");
  return data.secure_url;
}