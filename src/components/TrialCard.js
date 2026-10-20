import { Link } from "react-router-dom";

const TRIAL_DAYS = 30;

// Small card for the free trial: days left, a bar, one button
export default function TrialCard({ days }) {
  const left = Math.max(0, Number(days) || 0);
  const used = Math.min(100, Math.max(4, ((TRIAL_DAYS - left) / TRIAL_DAYS) * 100));
  const urgent = left <= 5;
  const color = urgent ? "#ea580c" : "#2563eb";

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
        border: `1px solid ${urgent ? "#fed7aa" : "#dbeafe"}`,
        borderRadius: 16,
      }}
    >
      <div style={{ flex: "1 1 180px", minWidth: 0 }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 9px",
            borderRadius: 999,
            background: urgent ? "#fff7ed" : "#eff6ff",
            color,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".04em",
          }}
        >
          FREE TRIAL
        </span>

        <div style={{ margin: "8px 0 10px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
          {left} {left === 1 ? "day" : "days"} left
        </div>

        <div style={{ height: 7, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
          <div style={{ width: `${used}%`, height: "100%", borderRadius: 999, background: color }} />
        </div>
      </div>

      <Link className="rd-btn" to="/dashboard/billing">
        Upgrade
      </Link>
    </section>
  );
}