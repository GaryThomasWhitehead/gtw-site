// app/page.tsx
export default function Home() {
  return (
    <main>
      {/* ====== HEADER ====== */}
      <header
        className="hero"
        style={{
          backgroundImage: "url('/new.jpg')", // make sure /public/new.jpg exists
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
            <div style={{ fontSize: "18px", opacity: 0.9 }}>
              GARY THOMAS WHITEHEAD
            </div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>
              Author • Songwriter • Painter
            </div>
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
        <h2
          id="bio"
          style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: ".08em" }}
        >
          AUTHOR BIO
        </h2>

        <h3 style={{ margin: "8px 0 12px", fontSize: 22, fontWeight: 700 }}>
          Gary Thomas Whitehead
        </h3>

        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          Gary Thomas Whitehead is a multidisciplinary artist whose heart beats
          through music, painting, and words of faith. As a Christian songwriter
          and painter, Gary’s work carries a single theme—the beauty of divine
          connection. Whether through the strokes of a brush, the lyrics of a
          song, or the pages of a book, he strives to awaken hope and remind
          others that light always finds its way through.
        </p>

        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          His newest work,{" "}
          <em>
            The Sent Son: A Biblical Perspective on Jesus as Mediator and Divine
            Sonship
          </em>
          , reflects years of reflection, prayer, and study. Gary writes in this
          genre because faith has shaped every part of his life—and he believes
          theology should feel alive, personal, and artful, not distant or
          academic.
        </p>

        <p style={{ lineHeight: 1.7 }}>
          A fun fact? When he’s not painting or writing, Gary has often been
          found recording melodies in his home studio, surrounded by canvases
          still drying on the walls.
        </p>
      </section>

      {/* ====== BOOK SECTION ====== */}
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
        <h2
          id="book"
          style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: ".08em" }}
        >
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
            className="bookCard"
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
              The Sent Son — A Biblical Perspective on Jesus as Mediator and
              Divine Sonship
            </h3>

            <ul
              style={{
                lineHeight: 1.7,
                marginTop: 12,
                marginBottom: 16,
                paddingLeft: 18,
              }}
            >
              <li>Author: Gary Thomas Whitehead</li>
              <li>
                Genre: Christian theology / spiritual reflection / Bible Study
              </li>
              <li>
                The book offers an in-depth scriptural study on Jesus’ role as
                both mediator and divine son. It is written in a devotional,
                reflective tone suitable for both personal and group study
                environments.
              </li>
            </ul>

            {/* ==== RECOMMENDATIONS BOX ==== */}
            <div
              style={{
                background: "#f8f8f8",
                padding: "14px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #e5e5e5",
              }}
            >
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                📘 <strong>Recommendation:</strong>
                <br />
                • <strong>Kindle Edition</strong> — Best for{" "}
                <em>personal Bible study</em> (does not include the note
                section).
                <br />
                • <strong>Paperback Edition</strong> — Best for{" "}
                <em>personal AND group Bible study</em> (includes the full note
                section).
              </p>
            </div>

            <div
              className="linkRow"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {/* PDF SAMPLE */}
              <a
                className="btn"
                href="/Part of Chapter 1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "#111", color: "#fff" }}
              >
                Read a Sample (PDF)
              </a>

              {/* EMAIL */}
              <a
                className="btn"
                href="mailto:garys_new_music@yahoo.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "#333", color: "#fff" }}
              >
                ✉ Email Gary
              </a>

              {/* X / TWITTER */}
              <a
                className="btn"
                href="https://twitter.com/Bookthesentson"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "#000", color: "#fff" }}
              >
                🐦 Follow on X (@Bookthesentson)
              </a>

              {/* KINDLE BUTTON */}
              <a
                className="btn"
                href="https://www.amazon.com/dp/B0G4NQ1SF3"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "#ff9900", color: "#fff" }}
              >
                📱 Buy on Kindle
              </a>

              {/* PAPERBACK BUTTON */}
              <a
                className="btn"
                href="https://www.amazon.com/dp/B0G4KJHKK6"
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "#cc5500", color: "#fff" }}
              >
                📘 Buy Paperback
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MUSIC SECTION ===== */}
      <section
        aria-labelledby="music"
        className="block card"
        style={{
          marginTop: 24,
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #eee",
        }}
      >
        <h2 id="music" className="sectionTitle">
          🎵 LISTEN
        </h2>
        <h3>Music</h3>

        <p style={{ marginTop: 8, marginBottom: 14 }}>
          Experience Gary’s original songs of inspiration and storytelling on
          your favorite streaming platforms.
        </p>

        <div className="embedWrap" style={{ marginBottom: 12 }}>
          <iframe
            title="Gary Whitehead — SoundCloud"
            width="100%"
            height="300"
            scrolling="no"
            frameBorder="0"
            allow="autoplay"
            src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-747949669&color=%230055ff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
          />
        </div>

        <div className="linkRow">
          {/* SoundCloud */}
          <a
            className="btn"
            href="https://soundcloud.com/user-747949669"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#ff5500", color: "#fff" }}
          >
            🎧 SoundCloud
          </a>

          {/* YouTube */}
          <a
            className="btn"
            href="https://www.youtube.com/channel/UC8sxDC0vLnUeR2VQmK3qyVg"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#ff2d2d", color: "#fff" }}
          >
            ▶ YouTube
          </a>

          {/* Spotify 1 */}
          <a
            className="btn"
            href="https://open.spotify.com/artist/0Ffx93cnY4aH22LsxbNmPX"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#1db954", color: "#fff" }}
          >
            🎵 Spotify (1)
          </a>

          {/* Spotify 2 */}
          <a
            className="btn"
            href="https://open.spotify.com/artist/2MhxbQJUh5pctqpUcpNg5o"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#1db954", color: "#fff" }}
          >
            🎵 Spotify (2)
          </a>

          {/* Spotify 3 */}
          <a
            className="btn"
            href="https://open.spotify.com/artist/3sxMPsVrsSbsOEEmhdZosP"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#1db954", color: "#fff" }}
          >
            🎵 Spotify (3)
          </a>

          {/* Spotify 4 */}
          <a
            className="btn"
            href="https://open.spotify.com/artist/6U1wxC6Wv6nUbBEGv3nhXN"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#1db954", color: "#fff" }}
          >
            🎵 Spotify (4)
          </a>

          {/* Facebook */}
          <a
            className="btn"
            href="https://www.facebook.com/people/Gary-Whiteheads-Latest-Song-Release/61556807271098/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#1877f2", color: "#fff" }}
          >
            👍 Facebook Page
          </a>
        </div>
      </section>

      {/* ====== ART SECTION ====== */}
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
        <h2
          id="art"
          style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: ".08em" }}
        >
          GALLERY &amp; SHOP
        </h2>

        <h3 style={{ fontSize: 28, margin: "8px 0 16px" }}>Art</h3>

        <p style={{ marginTop: 0, marginBottom: 18 }}>
          Original paintings by Gary Whitehead. Browse a few favorites below.
        </p>

        <div
          className="gallery"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <figure className="artCard">
            <img
              src="/trees.png?v=1"
              alt="Up Through the Trees — branches against a sunrise sky"
              style={{ width: "100%", height: "auto", borderRadius: "10px" }}
              loading="lazy"
            />
            <figcaption>Up Through the Trees</figcaption>
          </figure>

          <figure className="artCard">
            <img
              src="/Flames.png"
              alt="Flaming — abstract pour on black"
              style={{ width: "100%", height: "auto", borderRadius: "10px" }}
              loading="lazy"
            />
            <figcaption>Flaming</figcaption>
          </figure>
        </div>

        <div className="linkRow" style={{ marginTop: 16 }}>
          <a
            className="btn"
            href="https://www.etsy.com/shop/GaryCreatedArt?ref=profile_header"
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: "#b57b17", color: "#fff" }}
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
