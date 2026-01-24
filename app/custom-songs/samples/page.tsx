export default function SamplesPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 18px" }}>
      <h1 style={{ fontSize: 34, marginBottom: 10 }}>Sample Songs &amp; Videos</h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#333" }}>
        Add your sample songs and/or YouTube/SoundCloud embeds here.
      </p>

      <div style={{ marginTop: 24, padding: 18, border: "1px solid #e6e6e6", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Coming Soon</h2>
        <ul style={{ lineHeight: 1.9 }}>
          <li>Song sample #1</li>
          <li>Song sample #2</li>
          <li>Photo Music Video sample #1</li>
        </ul>
      </div>

      <div style={{ marginTop: 18 }}>
        <a href="/custom-songs" style={{ fontWeight: 800 }}>
          ← Back to Custom Songs
        </a>
      </div>
    </main>
  );
}
