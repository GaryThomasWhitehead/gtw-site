// app/page.tsx
export default function Home() {
  // --- Simple click tracking (works with Google Analytics if enabled in layout.tsx) ---
  const track = (eventName: string, params: Record<string, any> = {}) => {
    // Google Analytics gtag event (only runs if GA is installed and loaded)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, params);
    }
  };

  return (
    <main>
      {/* ====== HERO / HEADER ====== */}
      <header
        className="hero"
        style={{
          backgroundImage: "url('/new.jpg')",
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
            <div style={{ fontSize: "14px", opacity: 0.85 }}>
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
                marginBottom: 10,
                paddingLeft: 18,
              }}
            >
              <li>Author: Gary Thomas Whitehead</li>
              <li>
                Genre: Christian theology / spiritual reflection / Bible study
              </li>
              <li>
                <strong>Kindle</strong> is recommended for personal Bible study
                (text-focused; no note section).
              </li>
              <li>
                <strong>Paperback</strong> is recommended for personal and group
                Bible study (includes the note section).
              </li>
            </ul>

            {/* BOOK BUTTONS */}
            <div className="linkRow">
              <a
                className="btn btnPrimary"
                href="/Part of Chapter 1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("book_sample_pdf_click", {
                    section: "book",
                    label: "Read a Sample (PDF)",
                  })
                }
              >
                Read a Sample (PDF)
              </a>

              <a
                className="btn btnKindle"
                href="https://www.amazon.com/dp/B0G4NQ1SF3"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("book_purchase_click", {
                    format: "kindle",
                    destination: "amazon",
                    asin: "B0G4NQ1SF3",
                  })
                }
              >
                Buy Kindle (Personal Study)
              </a>

              <a
                className="btn btnPaperback"
                href="https://www.amazon.com/dp/B0G4KJHKK6"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("book_purchase_click", {
                    format: "paperback",
                    destination: "amazon",
                    asin: "B0G4KJHKK6",
                  })
                }
              >
                Buy Paperback (Group Study)
              </a>

              <a
                className="btn btnX"
                href="https://x.com/Bookthesentson"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("social_click", {
                    platform: "x",
                    handle: "@Bookthesentson",
                    section: "book",
                  })
                }
              >
                @Bookthesentson on X
              </a>

              <a
                className="btn btnEmail"
                href="mailto:garys_new_music@yahoo.com"
                onClick={() =>
                  track("email_click", {
                    section: "book",
                    address: "garys_new_music@yahoo.com",
                  })
                }
              >
                ✉ Email Gary
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MUSIC SECTION ===== */}
      <section
        aria-labelledby="music"
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
        <h3 style={{ marginTop: 8, marginBottom: 8 }}>Gary’s Original Music</h3>

        <div className="musicGrid">
          <div className="musicLeft">
            <p style={{ marginTop: 8, marginBottom: 14 }}>
              Experience Gary’s original songs of inspiration and storytelling
              on your favorite streaming platforms.
            </p>

            <div className="embedWrap" style={{ marginBottom: 12 }}>
              <iframe
                title="Gary Whitehead — SoundCloud"
                width="100%"
                height="300"
                scrolling="no"
                frameBorder="0"
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-747949669&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
              />
            </div>

            {/* Platform Buttons */}
            <div className="linkRow">
              <a
                className="btn btnSoundcloud"
                href="https://soundcloud.com/user-747949669"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("music_platform_click", {
                    platform: "soundcloud",
                    section: "music",
                  })
                }
              >
                🎧 SoundCloud
              </a>

              <a
                className="btn"
                href="https://www.youtube.com/channel/UC8sxDC0vLnUeR2VQmK3qyVg"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("music_platform_click", {
                    platform: "youtube",
                    section: "music",
                  })
                }
              >
                ▶ YouTube
              </a>

              <a
                className="btn"
                href="https://open.spotify.com/artist/0Ffx93cnY4aH22LsxbNmPX"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("music_platform_click", {
                    platform: "spotify",
                    section: "music",
                    artist: "0Ffx93cnY4aH22LsxbNmPX",
                  })
                }
              >
                🎵 Spotify (1)
              </a>

              <a
                className="btn"
                href="https://open.spotify.com/artist/2MhxbQJUh5pctqpUcpNg5o"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("music_platform_click", {
                    platform: "spotify",
                    section: "music",
                    artist: "2MhxbQJUh5pctqpUcpNg5o",
                  })
                }
              >
                🎵 Spotify (2)
              </a>

              <a
                className="btn"
                href="https://open.spotify.com/artist/3sxMPsVrsSbsOEEmhdZosP"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("music_platform_click", {
                    platform: "spotify",
                    section: "music",
                    artist: "3sxMPsVrsSbsOEEmhdZosP",
                  })
                }
              >
                🎵 Spotify (3)
              </a>

              <a
                className="btn"
                href="https://open.spotify.com/artist/6U1wxC6Wv6nUbBEGv3nhXN"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("music_platform_click", {
                    platform: "spotify",
                    section: "music",
                    artist: "6U1wxC6Wv6nUbBEGv3nhXN",
                  })
                }
              >
                🎵 Spotify (4)
              </a>

              <a
                className="btn"
                href="https://www.facebook.com/people/Gary-Whiteheads-Latest-Song-Release/61556807271098/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("music_platform_click", {
                    platform: "facebook",
                    section: "music",
                  })
                }
              >
                👍 Facebook Page
              </a>
            </div>
          </div>

          {/* RIGHT column intentionally empty now (image/link removed) */}
          <div />
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

        <div className="gallery">
          <figure className="artCard">
            <img
              src="/trees.png?v=1"
              alt="Up Through the Trees — branches against a sunrise sky"
              loading="lazy"
            />
            <figcaption>Up Through the Trees</figcaption>
          </figure>

          <figure className="artCard">
            <img
              src="/Flames.png"
              alt="Flaming — abstract pour on black"
              loading="lazy"
            />
            <figcaption>Flaming</figcaption>
          </figure>
        </div>

        <div className="linkRow" style={{ marginTop: 16 }}>
          <a
            className="btn btnEtsy"
            href="https://www.etsy.com/shop/GaryCreatedArt?ref=profile_header"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("shop_click", { platform: "etsy", section: "art" })
            }
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
