import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "../../RealEstateSite/dashboard/dashboard.css";

const STATUSES = ["new", "contacted", "closed"];
const LABEL = { new: "New", contacted: "Contacted", closed: "Closed" };

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}

function when(d) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

// Route: /dashboard/car-inquiries
export default function CarInquiries() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/cars/inquiries/all")
      .then((res) => { if (!cancelled) setItems(res.inquiries); })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate("/login");
        setError(err.message);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [navigate]);

  async function setStatus(id, status) {
    try {
      await api.put(`/cars/inquiries/${id}`, { status });
      setItems((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="rd"><p>Loading inquiries...</p></div>;

  return (
    <div className="rd">
      <h1>Inquiries</h1>
      <p className="rd-muted">Each one is a person who tapped WhatsApp on a car.</p>
      {error && <p className="rd-err">{error}</p>}
      {items.length === 0 && <p className="rd-muted">No inquiries yet.</p>}
      {items.map((i) => (
        <div key={i.id} className="rd-row">
          <div className="rd-info">
            <p className="rd-t1">{i.carTitle}</p>
            <p className="rd-t3">{i.price !== null ? naira(i.price) : ""} · {when(i.createdAt)}</p>
            <div className="rd-chips">
              {STATUSES.map((s) => (
                <button key={s} className={i.status === s ? "on" : ""} onClick={() => setStatus(i.id, s)}>{LABEL[s]}</button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}