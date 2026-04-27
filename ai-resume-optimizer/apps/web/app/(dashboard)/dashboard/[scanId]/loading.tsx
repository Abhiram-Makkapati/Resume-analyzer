export default function ScanResultLoading() {
  return (
    <div
      style={{
        display: "grid",
        gap: "20px"
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="card"
          style={{
            height: i === 1 ? 160 : 220,
            background:
              "linear-gradient(90deg, rgba(240,242,248,0.9) 25%, rgba(248,249,252,0.9) 50%, rgba(240,242,248,0.9) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s ease-in-out infinite"
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
