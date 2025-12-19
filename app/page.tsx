"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

export default function Home() {
  const [visits, setVisits] = useState<number | null>(null);

  // Simple public visitor counter (total visits, not unique people)
  useEffect(() => {
    async function incrementVisitorCounter() {
      try {
        // namespace: garythomaswhitehead-com, key: home
        const res = await fetch(
          "https://api.countapi.xyz/hit/garythomaswhitehead-com/home"
        );
        const data = await res.json();
        if (typeof data.value === "number") {
          setVisits(data.value);
        }
      } catch (err) {
        console.error("Visitor counter error", err);
      }
    }

    incrementVisitorCounter();
  }, []);

  return (
    <main
      style={{
        maxWidth: "1360px",
        margin: "0 auto",
        padding: "24px 32px",
        fontFamily: '"Georgia", "Times New Roman", serif',
        color: "#111",
        backgroundColor: "#faf9f6",
        lineHeight: 1.6,
      }}
    >
      {/* ====== HEADER ====== */}
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
          marginBottom: 40,
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
          marginTop: 0,
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
          and painter, Gary&apos;s work carries a single theme—the beauty of
          divine connection. Whether through the strokes of a brush, the lyrics
          of a song, or the pages of a book, he strives to awaken hope and
          remind others that light always finds its way through.
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
          A fun fact? When he&apos;s not painting or writing, Gary is often in
          his home studio recording new melodies, with fresh canvases drying on
          the walls around him.
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
              background: "#fff",
              padding: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
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
              <li>Genre: Christian theology / spiritual reflection / Bible Study</li>
              <li>
                An in-depth scriptural study on Jesus&apos; role as both
                mediator and divine Son, written in a devotional, reflective
                tone—ideal for church Bible studies and small groups.
              </li>
            </ul>

            <p style={{ marginBottom: 16 }}>
              <strong>Recommendation:</strong> The{" "}
              <em>Kindle edition</em> is perfect for{" "}
              <strong>personal Bible study</strong>, while the{" "}
              <em>paperback</em> works beautifully for both{" "}
              <strong>personal and group study</strong> with its full layout
              and space for notes.
            </p>

            <div
              className="linkRow"
              style={{
                marginTop: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {/* Sample PDF (FIXED) */}
              <a
                className="btn"
                href="/Part%20of%20Chapter%201.pdf"
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
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
                }}
              >
                Read a Sample (PDF)
              </a>

              {/* Email Gary (BOOK section) */}
              <a
                className="btn"
                href="mailto:garys_new_music@yahoo.com"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  textDecoration: "none",
                  background: "#333",
                  color: "#fff",
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
                }}
              >
                Email Gary
              </a>

              {/* X / Twitter for the book */}
              <a
                className="btn"
                href="https://x.com/Bookthesentson"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  textDecoration: "none",
                  background: "#000",
                  color: "#fff",
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
                }}
              >
                Follow @Bookthesentson on X
              </a>

              {/* Kindle – recommended for personal study */}
              <a
                className="btn"
                href="https://www.amazon.com/dp/B0G4NQ1SF3"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  textDecoration: "none",
                  background: "#2563eb",
                  color: "#fff",
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
                }}
                onClick={() =>
                  track("BookClick", {
                    format: "Kindle",
                  })
                }
              >
                Buy on Kindle (personal study)
              </a>

              {/* Paperback – recommended for personal & group study */}
              <a
                className="btn"
                href="https://www.amazon.com/dp/B0G4KJHKK6"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  textDecoration: "none",
                  background: "#b45309",
                  color: "#fff",
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
                }}
                onClick={() =>
                  track("BookClick", {
                    format: "Paperback",
                  })
                }
              >
                Buy Paperback (personal & group study)
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
        <h2
          id="music"
          style={{
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
            borderBottom: "2px solid #b57b17",
            display: "inline-block",
            paddingBottom: 4,
          }}
        >
          🎵 LISTEN
        </h2>
        <h3 style={{ marginTop: 8, marginBottom: 8 }}>Music</h3>

        <div
          className="musicGrid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 24,
          }}
        >
          <div className="musicLeft">
            <p style={{ marginTop: 8, marginBottom: 14 }}>
              Experience Gary&apos;s original songs of inspiration and
              storytelling on your favorite streaming platforms.
            </p>

            <div className="embedWrap" style={{ marginBottom: 12 }}>
              <iframe
                title="Gary Whitehead — SoundCloud"
                width="100%"
                height="300"
                scrolling="no"
                frameBorder={0}
                allow="autoplay"
                src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-747949669&color=%230055ff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
              />
            </div>

            <div
              className="linkRow"
              style={{
                marginTop: 16,
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <a
                className="btn"
                href="https://soundcloud.com/user-747949669"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#ff5500",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                🎧 SoundCloud
              </a>

              <a
                className="btn"
                href="https://www.youtube.com/channel/UC8sxDC0vLnUeR2VQmK3qyVg"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#ff0000",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                ▶ YouTube
              </a>

              <a
                className="btn"
                href="https://open.spotify.com/artist/0Ffx93cnY4aH22LsxbNmPX"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1db954",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                🎵 Spotify (1)
              </a>
              <a
                className="btn"
                href="https://open.spotify.com/artist/2MhxbQJUh5pctqpUcpNg5o"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1db954",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                🎵 Spotify (2)
              </a>
              <a
                className="btn"
                href="https://open.spotify.com/artist/3sxMPsVrsSbsOEEmhdZosP"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1db954",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                🎵 Spotify (3)
              </a>
              <a
                className="btn"
                href="https://open.spotify.com/artist/6U1wxC6Wv6nUbBEGv3nhXN"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1db954",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                🎵 Spotify (4)
              </a>

              <a
                className="btn"
                href="https://www.facebook.com/people/Gary-Whiteheads-Latest-Song-Release/61556807271098/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#1877f2",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                👍 Facebook Page
              </a>

              {/* NOTE: Email is intentionally NOT here anymore since you wanted it moved to BOOK */}
            </div>
          </div>
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

        <div
          className="gallery"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {/* Up Through the Trees */}
          <figure
            className="artCard"
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #eee",
              background: "#fff",
              margin: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <img
              src="/trees.png?v=1"
              alt="Up Through the Trees — branches against a sunrise sky"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "10px",
              }}
              loading="lazy"
            />
            <figcaption
              style={{ textAlign: "center", marginTop: 10, fontWeight: 700 }}
            >
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
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <img
              src="/Flames.png"
              alt="Flaming — abstract pour on black"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "10px",
              }}
              loading="lazy"
            />
            <figcaption
              style={{ textAlign: "center", marginTop: 10, fontWeight: 700 }}
            >
              Flaming
            </figcaption>
          </figure>
        </div>

        {/* Etsy link row */}
        <div className="linkRow" style={{ marginTop: 16 }}>
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
              background: "#b57b17",
              color: "#fff",
              boxShadow:
                "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
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
        <div style={{ marginBottom: 6 }}>
          © {new Date().getFullYear()} Gary Thomas Whitehead
        </div>
        <div style={{ fontSize: 12, fontWeight: 400, color: "#666" }}>
          {visits === null
            ? "Counting visitors…"
            : `Total visits recorded: ${visits.toLocaleString()}`}
        </div>
      </footer>
    </main>
  );
}
