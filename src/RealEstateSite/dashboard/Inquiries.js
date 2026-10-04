import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./dashboard.css";

const STATUSES = [
  ["new", "New"],
  ["contacted", "Contacted"],
  ["closed", "Closed"],
];

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

function when(value) {
  return new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export default function Inquiries() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/properties/inquiries/all")
      .then((res) => {
        if (!cancelled) setItems(Array.isArray(res?.inquiries) ? res.inquiries : []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  async function setStatus(id, status) {
    setError("");
    // Change it on screen first, put it back if the server says no
    const before = items;
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await api.put(`/properties/inquiries/${id}`, { status });
    } catch (err) {
      setItems(before);
      setError(err.message);
    }
  }

  if (loading) return <div className="rd"><p>Loading inquiries...</p></div>;

  return (
    <div className="rd">
      <h1>Inquiries</h1>
      <p className="rd-muted">
        Every time someone taps WhatsApp on one of your properties, it shows here.
        Their name and number come through WhatsApp itself.
      </p>
      {error && <p className="rd-err">{error}</p>}

      {items.length === 0 && (
        <p className="rd-muted">No inquiries yet. Share your website link to get your first one.</p>
      )}

      {items.map((i) => (
        <div key={i.id} className="rd-row">
          <div className="rd-av">{(i.propertyTitle || "?").slice(0, 2).toUpperCase()}</div>
          <div className="rd-info">
            <p className="rd-t1">{i.propertyTitle || "A property"}</p>
            <p className="rd-t2">
              {i.location}
              {i.price ? ` · ${naira(i.price)}` : ""}
            </p>
            <p className="rd-t3">{when(i.createdAt)}</p>
          </div>
          <select
            className="rd-select"
            value={i.status || "new"}
            onChange={(e) => setStatus(i.id, e.target.value)}
          >
            {STATUSES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}