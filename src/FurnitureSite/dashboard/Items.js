import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { ListSkeleton } from "../../components/Skeleton";
import ShareProduct from "../../components/ShareProduct";
import "../../RealEstateSite/dashboard/dashboard.css";

const FILTERS = ["All", "Available", "Sold out"];

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

export default function Items() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    api.get("/furniture")
      .then((res) => { if (!cancelled) setItems(res.items); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  async function remove(id) {
    if (!window.confirm("Delete this piece?")) return;
    try {
      await api.del(`/furniture/${id}`);
      setItems(items.filter((x) => x.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  // Quick toggle: sold out, or available again
  async function toggle(piece) {
    setError("");
    const status = piece.status === "Sold out" ? "Available" : "Sold out";
    try {
      await api.put(`/furniture/${piece.id}`, { ...piece, status });
      setItems(items.map((x) => (x.id === piece.id ? { ...x, status } : x)));
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = items.filter(
    (x) =>
      (filter === "All" || (x.status || "Available") === filter) &&
      `${x.name} ${x.category}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  if (loading) return <div className="rd"><ListSkeleton rows={5} /></div>;

  return (
    <div className="rd">
      <div className="rd-head">
        <h1>Furniture</h1>
        <Link className="rd-btn" to="/dashboard/furniture/new">+ Add piece</Link>
      </div>
      {error && <p className="rd-err">{error}</p>}

      <input className="rd-search" placeholder="Search piecees" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="rd-chips">
        {FILTERS.map((f) => (
          <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {shown.length === 0 && <p className="rd-muted">No piecees yet.</p>}
      {shown.map((x) => (
        <div key={x.id} className="rd-row">
          <div className="rd-thumb" style={x.photos && x.photos[0] ? { backgroundImage: `url("${x.photos[0]}")` } : {}} />
          <div className="rd-info">
            <p className="rd-t1">{x.name}</p>
            <p className="rd-t3">{naira(x.price)}{x.category ? ` · ${x.category}` : ""}{x.availability === "Made to order" ? " · Made to order" : ""}</p>
            <span className={`rd-tag ${x.status === "Sold out" ? "sold" : ""}`}>{x.status || "Available"}</span>
          </div>
          <div className="rd-acts">
            <ShareProduct name={x.name} price={x.price} photo={x.photos && x.photos[0]} />
            <button onClick={() => toggle(x)}>{x.status === "Sold out" ? "Mark available" : "Sold out"}</button>
            <Link to={`/dashboard/furniture/${x.id}`}>Edit</Link>
            <button className="del" onClick={() => remove(x.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}