import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px"
      }}
    >
      <div className="card" style={{ textAlign: "center", maxWidth: 420 }}>
        <span className="eyebrow">404</span>
        <h2 style={{ margin: "16px 0 8px" }}>Page not found</h2>
        <p className="muted">The page you were looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/dashboard" style={{ display: "inline-block", marginTop: 20 }}>
          <button className="button button-primary">Go to dashboard</button>
        </Link>
      </div>
    </div>
  );
}
