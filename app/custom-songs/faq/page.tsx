export default function FAQPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
      <h1 style={{ margin: "0 0 10px" }}>FAQ</h1>

      <div style={{ lineHeight: 1.7, color: "#333" }}>
        <p><b>How long does it take?</b><br />Typical turnaround depends on complexity and current queue.</p>
        <p><b>What do you need from me?</b><br />A story, key details, names, and the feeling you want.</p>
        <p><b>Photo Music Video?</b><br />You provide photos; I edit them into a video with your song.</p>
      </div>

      <a href="/custom-songs" style={{ fontWeight: 900, textDecoration: "none" }}>
        ← Back to Custom Songs
      </a>
    </main>
  );
}
