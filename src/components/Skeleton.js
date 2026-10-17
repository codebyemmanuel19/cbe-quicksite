// Soft grey placeholder shapes shown while the dashboard loads.
// Looks faster than the words "Loading...".

const css = `
@keyframes qs-sk-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.qs-sk-wrap { max-width: 720px; margin: 0 auto; padding: 4px 0 24px; }
.qs-sk {
  border-radius: 14px;
  background: linear-gradient(90deg, #e8ecf5 25%, #f4f6fb 45%, #e8ecf5 65%);
  background-size: 200% 100%;
  animation: qs-sk-shine 1.4s ease-in-out infinite;
}
.qs-sk-row { display: flex; gap: 10px; margin-top: 14px; }
.qs-sk-row .qs-sk { flex: 1; height: 74px; }
@media (prefers-reduced-motion: reduce) { .qs-sk { animation: none; } }
`;

export default function DashboardSkeleton() {
  return (
    <div className="qs-sk-wrap" aria-busy="true" aria-label="Loading">
      <style>{css}</style>
      <div className="qs-sk" style={{ height: 30, width: "55%", borderRadius: 8 }} />
      <div className="qs-sk" style={{ height: 120, marginTop: 18 }} />
      <div className="qs-sk" style={{ height: 84, marginTop: 14 }} />
      <div className="qs-sk-row">
        <div className="qs-sk" />
        <div className="qs-sk" />
        <div className="qs-sk" />
      </div>
      <div className="qs-sk" style={{ height: 150, marginTop: 14 }} />
    </div>
  );
}