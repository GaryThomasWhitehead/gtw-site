// app/page.tsx
export default function Home() {
  return (
    <main>

      {/* ====== HEADER ====== */}
      <header
        className="hero"
        style={{
          backgroundImage: "url('/20251105_073045.jpg')", // header bg you added
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "260px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "72px auto",
            gap: "16px",
            alignItems: "center",
            background: "rgba(0,0,0,.55)",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "9999px",
          }}
        >
          <img
            src="/Gary.png"
            alt="Gary Thomas Whitehead"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #fff",
            }}
            loading="lazy"
          />
          <div>
            <div style={{ fontSize: "18px", opacity: 0.9 }}>GARY THOMAS WHITEHEAD</div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>Author • Songwriter • Painter</div>
          </div>
        </div>
      </header>

      {/* ====== AUTHOR BIO ====== */}
      <section
        aria-labelledby="bio"
        style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #eee",
        }}
      >
        <h2 id="bio" style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: ".08em" }}>
          AUTHOR BIO
        </h2>
        <h3 style={{ margin: "8px 0 12px", fontSize: 22, fontWeight: 700 }}>
          Gary Thomas Whitehead
        </h3>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          Gary Thomas Whitehead is a multidisciplinary artist whose heart beats through music,
          painting, and words of faith. As a Christian songwriter and painter, Gary’s work carries
          a single theme—the beauty of divine connection. Whether through the strokes of a brush,
          the lyrics of a song, or the pages of a book, he strives to awaken hope and remind others
          that light always finds its way through.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          His newest work, <em>The Sent Son: A Biblical Perspective on Jesus as Mediator and Divine
          Sonship</em>, reflects years of reflection, prayer, and study. Gary writes in this genre
          because faith has shaped every part of his life—and he believes theology should feel alive,
          personal, and artful, not distant or academic.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          A fun fact? When he’s not painting or writing, Gary has often been found recording melodies
          in his home studio, surrounded by canvases still drying on the walls.
        </p>
      </section>

      {/* ====== BOOK (FIRST) ====== */}
      <section
        aria-labelledby="book"
        style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #eee",
        }}
      >
        <h2 id="book" style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: ".08em" }}>
          BOOK
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "20px",
          }}
        >
          <figure
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #eee",
              margin: 0,
            }}
          >
            <img
              src="/Cover.png"
              alt="The Sent Son book cover"
              style={{ width: "100%", height: "auto", display: "block" }}
              loading="lazy"
            />
          </figure>

          <div>
            <h3 style={{ fontSize: 22, marginTop: 0, marginBottom: 8 }}>
              The Sent Son — A Biblical Perspective on Jesus as Mediator and Divine Sonship
            </h3>
            <ul style={{ lineHeight: 1.7, marginTop: 12, marginBottom: 16, paddingLeft: 18 }}>
              <li>Author: Gary Thomas Whitehead</li>
              <li>Genre: Christian theology / spiritual reflection</li>
              <li>
                The book offers an in-depth scriptural study on Jesus’ role as both mediator and
                divine son, written in a devotional, reflective tone and well-suited for chruch Bible studies
                and group studies providing a framework where discussion and reflection can build
                stronger communities of faith.
              </li>
            </ul>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                className="btn"
                href="/Part of Chapter 1.pdf"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  textDecoration: "none",
                  background: "#111",
                  color: "#fff",
                }}
              >
                Read a Sample (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

  {/* ===== MUSIC (SECOND) ===== */}
<section
  aria-labelledby="music"
  style={{
    marginTop: 24,
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #eee',
  }}
>
  {/* Use the title class, no inline styles */}
  <h2 className="sectionTitle">Gary’s Original Music</h2>

  <p style={{ marginTop: 8, marginBottom: 14 }}>
    Listen to Gary’s music and follow along:
  </p>

  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
    {/* YouTube */}
    <a
      className="btn"
      href="https://www.youtube.com/channel/UC8sxDC0cVnLnuER2VQmK3qvVg"
      target="_blank"
      rel="noopener"
    >
      YouTube
    </a>

    {/* Spotify links */}
    <a className="btn btn-green" href="https://open.spotify.com/..." target="_blank" rel="noopener">
      Spotify (1)
    </a>
    <a className="btn btn-green" href="https://open.spotify.com/..." target="_blank" rel="noopener">
      Spotify (2)
    </a>
    <a className="btn btn-green" href="https://open.spotify.com/..." target="_blank" rel="noopener">
      Spotify (3)
    </a>
    <a className="btn btn-green" href="https://open.spotify.com/..." target="_blank" rel="noopener">
      Spotify (4)
    </a>

    {/* Facebook */}
    <a className="btn btn-blue" href="https://www.facebook.com/..." target="_blank" rel="noopener">
      Facebook Page
    </a>

    {/* Email */}
    <a className="btn btn-dark" href="mailto:youremail@domain.com">
      Email Gary
    </a>
  </div>
</section>


      {/* ====== ART (THIRD) ====== */}
      <section
        aria-labelledby="art"
        style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #eee",
        }}
      >
        <h2 id="art" style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: ".08em" }}>
          GALLERY &amp; SHOP
        </h2>

        <h3 style={{ fontSize: 28, margin: "8px 0 16px" }}>Art</h3>
        <p style={{ marginTop: 0, marginBottom: 18 }}>
          Original paintings and fine-art prints by Gary Whitehead. Browse a few favorites below.
        </p>

        <div
          className="gallery"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {/* Up Through the Trees — fixed to /trees.png?v=1 */}
          <figure
            className="artCard"
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #eee",
              background: "#fff",
              margin: 0,
            }}
          >
            <img
              src="/trees.png?v=1"
              alt="Up Through the Trees — branches against a sunrise sky"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "10px" }}
              loading="lazy"
            />
            <figcaption style={{ textAlign: "center", marginTop: 10, fontWeight: 700 }}>
              Up Through the Trees
            </figcaption>
          </figure>

          {/* Flaming */}
          <figure
            className="artCard"
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #eee",
              background: "#fff",
              margin: 0,
            }}
          >
            <img
              src="/Flames.png"
              alt="Flaming — abstract pour on black"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "10px" }}
              loading="lazy"
            />
            <figcaption style={{ textAlign: "center", marginTop: 10, fontWeight: 700 }}>
              Flaming
            </figcaption>
          </figure>
        </div>

        {/* Etsy link row */}
        <div style={{ display: "flex", marginTop: 16 }}>
          <a
            className="btn"
            href="https://www.etsy.com/shop/GaryCreatedArt?ref=profile_header"
            target="_blank"
            rel="noopener"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 700,
              textDecoration: "none",
              background: "#111",
              color: "#fff",
            }}
          >
            Visit My Etsy Shop
          </a>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer
        style={{
          textAlign: "center",
          padding: "18px",
          background: "rgba(255,255,255,.7)",
          border: "1px solid #eee",
          borderRadius: "12px",
          marginTop: 24,
          fontWeight: 700,
          color: "#333",
        }}
      >
        © {new Date().getFullYear()} Gary Thomas Whitehead
      </footer>
    </main>
  );
}
