/* eslint-disable @next/next/no-img-element */
export default function Home() {
  return (
    <main>
      {/* ===== HERO / HEADER ===== */}
      <header className="hero">
        <div className="heroOverlay" />
        <div className="heroInner">
          <h1 className="siteTitle">GARY THOMAS WHITEHEAD</h1>
          <div className="headshotWrap">
            <img src="/Gary.png" alt="Gary Thomas Whitehead" className="headshot" />
          </div>
        </div>
      </header>

      {/* ===== AUTHOR BIO ===== */}
      <section className="section">
        <div className="sectionTag">Author Bio</div>
        <h2 className="h2">Gary Thomas Whitehead</h2>
        <p className="lede">
          Gary Thomas Whitehead is a multidisciplinary artist whose heart beats through music, painting, and words of
          faith. As a Christian songwriter and painter, Gary’s work carries a single theme—the beauty of divine
          connection. Whether through the strokes of a brush, the lyrics of a song, or the pages of a book, he strives
          to awaken hope and remind others that light always finds its way through.
        </p>
        <p className="lede">
          His newest work, <em>The Sent Son: A Biblical Perspective on Jesus as Mediator and Divine Sonship</em>,
          reflects years of reflection, prayer, and study. Gary writes in this genre because faith has shaped every part
          of his life—and he believes theology should feel alive, personal, and artful, not distant or academic.
        </p>
        <p className="lede">
          A fun fact? When he’s not painting or writing, Gary has often been found recording melodies in his home
          studio, surrounded by canvases still drying on the walls.
        </p>
      </section>

      {/* ===== BOOK ===== */}
      <section className="section">
        <div className="sectionTag">About the Book</div>
        <h2 className="h2">The Sent Son</h2>

        <div className="bookLayout">
          <figure className="bookCard">
            <img
              src="/Cover.png"
              alt="Book cover for The Sent Son"
              className="bookImage"
              loading="lazy"
            />
            <figcaption className="bookCaption">The Sent Son — Cover</figcaption>
          </figure>

          <div className="bookInfo">
            <ul className="bookBullets">
              <li><strong>Author:</strong> Gary Thomas Whitehead</li>
              <li><strong>Genre:</strong> Christian theology / spiritual reflection</li>
              <li>
                The book offers an in-depth scriptural study on Jesus’ role as both mediator and divine son, written in
                a devotional, reflective tone — consistent with his artistic and musical expression.
              </li>
            </ul>

            <div className="linkRow">
              <a
                className="btn"
                href="/Part%20of%20Chapter%201.pdf"
                target="_blank"
                rel="noopener"
                title="Open sample chapter PDF"
              >
                📖 Read Sample Chapter (PDF)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MUSIC ===== */}
      <section className="section">
        <div className="sectionTag">Listen</div>
        <h2 className="h2">Music</h2>
        <p className="lede">
          New singles, reflective instrumentals, and faith-forward lyrics. Find Gary’s music on your favorite platforms:
        </p>

        <div className="linkRow" style={{ flexWrap: "wrap", gap: 12 }}>
          <a
            className="btn youtube"
            href="https://www.youtube.com/channel/UC8sxDC0vLnUeR2VQmK3qyVg"
            target="_blank"
            rel="noopener"
            title="YouTube channel"
          >
            ▶️ YouTube
          </a>

          {/* If you want all artist IDs unified later, this can remain the primary profile for now */}
          <a
            className="btn spotify"
            href="https://open.spotify.com/artist/0Ffx93cnY4aH22LsxbNmPX"
            target="_blank"
            rel="noopener"
            title="Spotify profile"
          >
            🎵 Spotify
          </a>

          <a
            className="btn facebook"
            href="https://www.facebook.com/profile.php?id=61556807271098"
            target="_blank"
            rel="noopener"
            title="Facebook fan page"
          >
            👍 Facebook
          </a>

          <a className="btn" href="mailto:Gary's_new_music@yahoo.com" title="Contact Gary">
            ✉️ Contact
          </a>
        </div>
      </section>

      {/* ===== ART ===== */}
      <section className="section">
        <div className="sectionTag">Gallery & Shop</div>
        <h2 className="h2">Art</h2>
        <p className="lede">
          Original paintings and fine-art prints by Gary Whitehead. Browse a few favorites below.
        </p>

        <div className="gallery">
          {/* Up Through the Trees — FIXED PATH with version param to bust caches */}
          <figure className="artCard">
            <img
              src="/trees.png?v=1"
              alt="Up Through the Trees — branches against a sunrise sky"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "14px" }}
              loading="lazy"
            />
            <figcaption>Up Through the Trees</figcaption>
          </figure>

          {/* Flaming — abstract pour */}
          <figure className="artCard">
            <img
              src="/Flames.png"
              alt="Flaming — abstract pour on black"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "14px" }}
              loading="lazy"
            />
            <figcaption>Flaming</figcaption>
          </figure>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Gary Thomas Whitehead • All rights reserved.
      </footer>

      {/* ===== STYLES ===== */}
      <style jsx>{`
        :root {
          --ink: #222;
          --ink-soft: #333;
          --paper: #fffdf7;
          --card: #fffaf0;
          --accent: #6b4cff;
          --muted: #e9e2d9;
        }

        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body {
          color: var(--ink);
          background: var(--paper);
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          line-height: 1.55;
        }

        main { padding-bottom: 60px; }

        /* ===== Hero ===== */
        .hero {
          position: relative;
          min-height: 260px;
          background: center/cover no-repeat url("/20251105_073045.jpg");
          display: grid;
          place-items: center;
        }
        .heroOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.25));
        }
        .heroInner {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          gap: 16px;
          padding: 40px 16px;
          width: 100%;
          max-width: 1100px;
        }
        .siteTitle {
          margin: 0;
          color: #fff;
          letter-spacing: 0.15em;
          font-weight: 800;
          text-align: center;
          text-shadow: 0 2px 12px rgba(0,0,0,.45);
        }
        @media (min-width: 640px) {
          .siteTitle { font-size: 36px; }
        }
        @media (max-width: 639px) {
          .siteTitle { font-size: 22px; }
        }
        .headshotWrap {
          width: 92px; height: 92px;
          border-radius: 999px;
          border: 4px solid rgba(255,255,255,.95);
          box-shadow: 0 10px 30px rgba(0,0,0,.35);
          overflow: hidden;
        }
        .headshot {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ===== Sections ===== */
        .section {
          padding: 36px 16px 6px;
          margin: 24px auto 6px;
          max-width: 1100px;
          background: var(--card);
          border: 1px solid #f1eadf;
          border-radius: 18px;
          box-shadow: 0 10px 24px rgba(0,0,0,.05);
        }
        .sectionTag {
          display: inline-block;
          font-size: 12px;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #7e6d5a;
          background: #fff7ea;
          border: 1px solid #ecdcc6;
          padding: 6px 10px;
          border-radius: 999px;
          margin-bottom: 10px;
        }
        .h2 {
          margin: 8px 0 16px;
          font-size: clamp(22px, 2.8vw, 30px);
        }
        .lede {
          font-size: 17px;
          color: var(--ink-soft);
          margin: 10px 0 10px;
        }

        /* ===== Book layout ===== */
        .bookLayout {
          display: grid;
          gap: 24px;
        }
        @media (min-width: 920px) {
          .bookLayout {
            grid-template-columns: 320px 1fr;
            align-items: start;
          }
        }
        .bookCard {
          margin: 0;
          text-align: center;
        }
        .bookImage {
          width: 100%;
          max-width: 320px;
          height: auto;
          display: block;
          margin: 0 auto;
          border-radius: 14px;
          box-shadow: 0 18px 36px rgba(0,0,0,.18), 0 8px 18px rgba(0,0,0,.08);
          transition: transform .25s ease, box-shadow .25s ease;
          transform: perspective(900px) rotateX(0) rotateY(0);
        }
        .bookImage:hover {
          transform: perspective(900px) rotateX(4deg) rotateY(-6deg) translateY(-2px);
          box-shadow: 0 26px 44px rgba(0,0,0,.22), 0 14px 24px rgba(0,0,0,.12);
        }
        .bookCaption {
          margin-top: 10px;
          font-size: 14px;
          color: #705e4a;
        }
        .bookInfo { padding: 4px 2px; }
        .bookBullets {
          margin: 0 0 14px;
          padding-left: 18px;
        }
        .bookBullets li { margin: 6px 0; }

        /* ===== Buttons / Links ===== */
        .linkRow {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-block;
          background: #111;
          color: #fff;
          text-decoration: none;
          padding: 11px 16px;
          border-radius: 999px;
          font-weight: 700;
          border: 1px solid #111;
          transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn:active { transform: translateY(0); opacity: .9; }

        .btn.youtube { background: #ff0000; border-color: #ff0000; }
        .btn.spotify { background: #1db954; border-color: #1db954; color: #002a12; }
        .btn.facebook { background: #1877f2; border-color: #1877f2; }

        /* ===== Gallery ===== */
        .gallery {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          margin-top: 6px;
        }
        @media (min-width: 900px) {
          .gallery { grid-template-columns: 1fr 1fr; }
        }
        .artCard {
          margin: 0;
          background: #fffdf8;
          border: 1px solid #efe5d7;
          border-radius: 18px;
          padding: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,.06);
        }
        .artCard img {
          box-shadow: 0 8px 18px rgba(0,0,0,.08);
        }
        .artCard figcaption {
          margin-top: 10px;
          text-align: center;
          font-weight: 700;
          color: #533e2b;
        }

        /* ===== Footer ===== */
        .footer {
          max-width: 1100px;
          margin: 34px auto 0;
          padding: 22px 16px;
          color: #7a6a58;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </main>
  );
}
