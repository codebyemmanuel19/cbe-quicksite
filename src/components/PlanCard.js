import { Link } from "react-router-dom";

// Small plan card: tag, days left, a bar, one button.
// "trial" = free trial. "active" = a paid plan.
export default function PlanCard({ status, days }) {
  const trial = status === "trial";
  const left = Math.max(0, Number(days) || 0);
  const total = Math.max(30, left);
  const filled = Math.min(100, Math.max(4, (left / total) * 100));
  const urgent = left <= (trial ? 5 : 3);
  const color = urgent ? "#ea580c" : trial ? "#2563eb" : "#16a34a";
  const soft = urgent ? "#fff7ed" : trial ? "#eff6ff" : "#f0fdf4";
  const edge = urgent ? "#fed7aa" : trial ? "#dbeafe" : "#bbf7d0";

  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        padding: "16px 18px",
        margin: "0 0 16px",
        background: "#fff",
        border: `1px solid ${edge}`,
        borderRadius: 16,
      }}
    >
      <div style={{ flex: "1 1 180px", minWidth: 0 }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 9px",
            borderRadius: 999,
            background: soft,
            color,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".04em",
          }}
        >
          {trial ? "FREE TRIAL" : "PAID PLAN"}
        </span>

        <div style={{ margin: "8px 0 10px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
          {left} {left === 1 ? "day" : "days"} left
        </div>

        <div style={{ height: 7, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
          <div style={{ width: `${filled}%`, height: "100%", borderRadius: 999, background: color }} />
        </div>
      </div>

      <Link className="rd-btn pay-btn" to="/dashboard/billing">
        {trial ? "Upgrade" : "Add more time"}
      </Link>
    </section>
  );
}