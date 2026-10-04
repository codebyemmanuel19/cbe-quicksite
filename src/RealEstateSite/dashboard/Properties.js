import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./dashboard.css";

const FILTERS = ["All", "Available", "Sold", "Rented"];

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

export default function Properties() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    api.get("/properties")
      .then((res) => {
        // Never let a bad answer turn this into undefined
        if (!cancelled) setItems(Array.isArray(res?.properties) ? res.properties : []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  async function remove(id) {
    if (!window.confirm("Delete this property?")) return;
    try {
      await api.del(`/properties/${id}`);
      setItems(items.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = items.filter(
    (p) =>
      (filter === "All" || p.status === filter) &&
      `${p.title} ${p.location}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  if (loading) return <div className="rd"><p>Loading properties...</p></div>;

  return (
    <div className="rd">
      <div className="rd-head">
        <h1>Properties</h1>
        <Link className="rd-btn" to="/dashboard/properties/new">+ Add property</Link>
      </div>
      {error && <p className="rd-err">{error}</p>}

      <input className="rd-search" placeholder="Search properties" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="rd-chips">
        {FILTERS.map((f) => (
          <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {shown.length === 0 && <p className="rd-muted">No properties yet.</p>}
      {shown.map((p) => (
        <div key={p.id} className="rd-row">
          <div className="rd-thumb" style={p.photos?.[0] ? { backgroundImage: `url(${p.photos[0]})` } : {}} />
          <div className="rd-info">
            <p className="rd-t1">{p.title}</p>
            <p className="rd-t3">{naira(p.price)}{p.listing === "Rent" ? " / year" : ""}</p>
            <span className={`rd-tag ${String(p.status).toLowerCase()}`}>{p.status}</span>
          </div>
          <div className="rd-acts">
            <Link to={`/dashboard/properties/${p.id}`}>Edit</Link>
            <button className="del" onClick={() => remove(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}