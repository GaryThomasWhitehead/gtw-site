export default function FAQPage() {
  const qa = [
    {
      q: "How do I place an order?",
      a: "Click “Start My Song Request” and complete the steps. I’ll confirm details so the lyrics fit your story.",
    },
    {
      q: "Can I request a Photo Music Video?",
      a: "Yes — click “Start My Photo Music Video”. You’ll provide photos and I’ll edit them into a heartfelt video presentation using your custom song.",
    },
    {
      q: "How long does it take?",
      a: "Timing depends on the request and revisions. I’ll communicate clearly and keep you updated.",
    },
  ];

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 18px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>FAQ</h1>
      <div style={{ marginTop: 24, display: "grid", gap: 14 }}>
        {qa.map((x) => (
          <div key={x.q} style={{ padding: 18, border: "1px solid #e6e6e6", borderRadius: 12 }}>
            <div style={{ fontWeight: 900 }}>{x.q}</div>
            <div style={{ marginTop: 8, color: "#444", lineHeight: 1.7 }}>{x.a}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <a href="/custom-songs" style={{ fontWeight: 800 }}>
          ← Back to Custom Songs
        </a>
      </div>
    </main>
  );
}
