import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { ListSkeleton } from "../../components/Skeleton";
import "../../RealEstateSite/dashboard/dashboard.css";

const FILTERS = ["All", "Available", "Reserved", "Sold"];

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

export default function Cars() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    api.get("/cars")
      .then((res) => { if (!cancelled) setItems(Array.isArray(res?.cars) ? res.cars : []); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  async function remove(id) {
    if (!window.confirm("Delete this car?")) return;
    try {
      await api.del(`/cars/${id}`);
      setItems(items.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = items.filter(
    (c) =>
      (filter === "All" || c.status === filter) &&
      `${c.title} ${c.location}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  if (loading) return <div className="rd"><ListSkeleton rows={5} /></div>;

  return (
    <div className="rd">
      <div className="rd-head">
        <h1>Cars</h1>
        <Link className="rd-btn" to="/dashboard/cars/new">+ Add car</Link>
      </div>
      {error && <p className="rd-err">{error}</p>}

      <input className="rd-search" placeholder="Search cars" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="rd-chips">
        {FILTERS.map((f) => (
          <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {shown.length === 0 && <p className="rd-muted">No cars yet.</p>}
      {shown.map((c) => (
        <div key={c.id} className="rd-row">
          <div className="rd-thumb" style={c.photos?.[0] ? { backgroundImage: `url(${c.photos[0]})` } : {}} />
          <div className="rd-info">
            <p className="rd-t1">{c.title}</p>
            <p className="rd-t3">{naira(c.price)}</p>
            <span className={`rd-tag ${String(c.status).toLowerCase()}`}>{c.status}</span>
          </div>
          <div className="rd-acts">
            <Link to={`/dashboard/cars/${c.id}`}>Edit</Link>
            <button className="del" onClick={() => remove(c.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}