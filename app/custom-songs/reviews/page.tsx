export default function ReviewsPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 18px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>Customer Reviews</h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#333" }}>
        Add your testimonials here (name, occasion, and what they loved).
      </p>

      <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
        <div style={{ padding: 18, border: "1px solid #e6e6e6", borderRadius: 12 }}>
          <div style={{ fontWeight: 900 }}>“Absolutely perfect.”</div>
          <div style={{ marginTop: 8, color: "#444", lineHeight: 1.7 }}>
            This is where a real review will go.
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>— Customer Name</div>
        </div>

        <div style={{ padding: 18, border: "1px solid #e6e6e6", borderRadius: 12 }}>
          <div style={{ fontWeight: 900 }}>“He captured our story.”</div>
          <div style={{ marginTop: 8, color: "#444", lineHeight: 1.7 }}>
            This is where a real review will go.
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "#666" }}>— Customer Name</div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <a href="/custom-songs" style={{ fontWeight: 800 }}>
          ← Back to Custom Songs
        </a>
      </div>
    </main>
  );
}
