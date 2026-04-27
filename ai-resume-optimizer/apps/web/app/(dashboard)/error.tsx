"use client";

export default function DashboardError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "40px" }}>
      <span className="eyebrow">Something went wrong</span>
      <h3 style={{ marginTop: 16 }}>Unable to load this page</h3>
      <p className="muted">{error.message ?? "An unexpected error occurred."}</p>
      <button className="button button-primary" onClick={reset} style={{ marginTop: 20 }}>
        Try again
      </button>
    </div>
  );
}
