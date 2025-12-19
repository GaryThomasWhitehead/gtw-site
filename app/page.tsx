import TrackedLink from "../components/TrackedLink";

export default function Home() {
  // LINKS
  const KINDLE = "https://www.amazon.com/dp/B0G4NQ1SF3";
  const PAPERBACK = "https://www.amazon.com/dp/B0G4KJHKK6";
  const SOUNDCLOUD_PROFILE = "https://soundcloud.com/user-747949669";
  const ETSY = "https://www.etsy.com/shop/GaryCreatedArt";

  // STYLES
  const page = { maxWidth: 1100, margin: "0 auto", padding: "48px 20px" };
  const section = { marginTop: 48 };
  const h1 = { fontSize: 56, marginBottom: 12 };
  const h2 = { fontSize: 36, marginBottom: 18 };
  const card = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
  };
  const grid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 };
  const btn = {
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 700,
    display: "inline-block",
    textDecoration: "none",
  };
  const dark = { ...btn, background: "#111", color: "#fff" };
  const blue = { ...btn, background: "#3b5bff", color: "#fff" };

  return (
    <main style={page}>
      {/* HEADER */}
      <h1 style={h1}>The Sent Son</h1>
      <p>
        A scripture-centered journey through the life, purpose, and message of Jesus Christ.
      </p>

      {/* BOOK */}
      <section style={section}>
        <h2 style={h2}>📖 Get the Book</h2>

        <div style={grid}>
          <div style={card}>
            <h3>Kindle Edition</h3>
            <p>Recommended for <b>personal Bible study</b>.</p>

            <TrackedLink href={KINDLE} eventName="buy_kindle" style={dark}>
              Buy Kindle Edition
            </TrackedLink>
          </div>

          <div style={card}>
            <h3>Paperback Edition</h3>
            <p>Recommended for <b>personal and group Bible study</b>.</p>

            <TrackedLink href={PAPERBACK} eventName="buy_paperback" style={blue}>
              Buy Paperback Edition
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={section}>
        <h2 style={h2}>About the Author</h2>

        <div style={card}>
          <p>
            Gary Thomas Whitehead is an author, songwriter, and visual artist whose work centers on
            faith, reflection, and spiritual clarity.
          </p>

          <p style={{ fontStyle: "italic", marginTop: 14 }}>
            A fun fact? When he’s not painting or writing, he’s often composing music inspired by
            scripture and personal prayer.
          </p>
        </div>
      </section>

      {/* MUSIC — RESTORED SOUNDCLOUD PLAYER */}
      <section style={section}>
        <h2 style={h2}>🎵 Gary’s Original Music</h2>

        <div style={grid}>
          <div style={card}>
            <p>Listen directly on SoundCloud:</p>

            <TrackedLink href={SOUNDCLOUD_PROFILE} eventName="soundcloud_profile" style={dark}>
              Visit My SoundCloud
            </TrackedLink>
          </div>

          <div style={card}>
            <iframe
              width="100%"
              height="300"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-747949669&auto_play=false&visual=true"
            />
          </div>
        </div>
      </section>

      {/* ART */}
      <section style={section}>
        <h2 style={h2}>🎨 Original Art</h2>

        <div style={card}>
          <TrackedLink href={ETSY} eventName="etsy_click" style={dark}>
            Visit My Etsy Shop
          </TrackedLink>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", marginTop: 48, fontWeight: 700 }}>
        © {new Date().getFullYear()} Gary Thomas Whitehead
      </footer>
    </main>
  );
}
