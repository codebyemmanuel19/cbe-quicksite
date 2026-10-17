// Soft grey placeholder shapes shown while a dashboard page loads.
// Three looks: the home page (default), a list page, and a form page.

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
.qs-sk-item { display: flex; gap: 12px; align-items: center; margin-top: 12px; }
.qs-sk-item .qs-sk:first-child { width: 64px; height: 64px; flex: none; }
.qs-sk-lines { flex: 1; }
@media (prefers-reduced-motion: reduce) { .qs-sk { animation: none; } }
`;

function Wrap({ children }) {
  return (
    <div className="qs-sk-wrap" aria-busy="true" aria-label="Loading">
      <style>{css}</style>
      {children}
    </div>
  );
}

// The home page of a dashboard
export default function DashboardSkeleton() {
  return (
    <Wrap>
      <div className="qs-sk" style={{ height: 30, width: "55%", borderRadius: 8 }} />
      <div className="qs-sk" style={{ height: 120, marginTop: 18 }} />
      <div className="qs-sk" style={{ height: 84, marginTop: 14 }} />
      <div className="qs-sk-row">
        <div className="qs-sk" />
        <div className="qs-sk" />
        <div className="qs-sk" />
      </div>
      <div className="qs-sk" style={{ height: 150, marginTop: 14 }} />
    </Wrap>
  );
}

// Products, orders, cars, properties, inquiries
export function ListSkeleton({ rows = 5 }) {
  return (
    <Wrap>
      <div className="qs-sk" style={{ height: 28, width: "40%", borderRadius: 8 }} />
      <div className="qs-sk" style={{ height: 44, marginTop: 16 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div className="qs-sk-item" key={i}>
          <div className="qs-sk" />
          <div className="qs-sk-lines">
            <div className="qs-sk" style={{ height: 16, width: "70%", borderRadius: 6 }} />
            <div className="qs-sk" style={{ height: 14, width: "40%", borderRadius: 6, marginTop: 10 }} />
          </div>
        </div>
      ))}
    </Wrap>
  );
}

// Business info, order settings, add or edit pages
export function FormSkeleton({ fields = 5 }) {
  return (
    <Wrap>
      <div className="qs-sk" style={{ height: 28, width: "45%", borderRadius: 8 }} />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginTop: 18 }}>
          <div className="qs-sk" style={{ height: 12, width: "30%", borderRadius: 6 }} />
          <div className="qs-sk" style={{ height: 46, marginTop: 8 }} />
        </div>
      ))}
    </Wrap>
  );
}