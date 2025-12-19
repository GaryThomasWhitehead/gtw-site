"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

export default function Home() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    async function incrementVisitorCounter() {
      try {
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
        fontFamily: '"Georgia","Times New Roman",serif',
        backgroundColor: "#faf9f6",
        color: "#111",
        lineHeight: 1.6,
      }}
    >
      {/* ================= HERO ================= */}
      <header
        style={{
          backgroundImage: "url('/new.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "260px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "72px auto",
            gap: 16,
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
            width={72}
            height={72}
            style={{
              borderRadius: "50%",
              border: "2px solid #fff",
              objectFit: "cover",
            }}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              GARY THOMAS WHITEHEAD
            </div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>
              Author • Songwriter • Painter
            </div>
          </div>
        </div>
      </header>

      {/* ================= BOOK ================= */}
      <section
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #eee",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 14, letterSpacing: ".08em", color: "#777" }}>
          BOOK
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 24,
          }}
        >
          <img
            src="/Cover.png"
            alt="The Sent Son book cover"
            style={{
              width: "100%",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,.1)",
            }}
          />

          <div>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>
              The Sent Son — A Biblical Perspective on Jesus as Mediator and Divine
              Sonship
            </h3>

            <p>
              A devotional and scriptural study written for personal reflection
              and group Bible study.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 16,
              }}
            >
              {/* SAMPLE PDF */}
              <a
                href="/Part%20of%20Chapter%201.pdf"
                target="_blank"
                rel="noopener"
                style={buttonStyle("#111")}
              >
                📖 Read Sample Chapter (PDF)
              </a>

              <a
                href="https://www.amazon.com/dp/B0G4NQ1SF3"
                target="_blank"
                rel="noopener"
                onClick={() => track("BookClick", { format: "Kindle" })}
                style={buttonStyle("#2563eb")}
              >
                Buy Kindle
              </a>

              <a
                href="https://www.amazon.com/dp/B0G4KJHKK6"
                target="_blank"
                rel="noopener"
                onClick={() => track("BookClick", { format: "Paperback" })}
                style={buttonStyle("#b45309")}
              >
                Buy Paperback
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MUSIC ================= */}
      <section
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #eee",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>🎵 Music</h2>

        <iframe
          width="100%"
          height="300"
          scrolling="no"
          frameBorder={0}
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-747949669"
        />

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <a
            href="https://soundcloud.com/user-747949669"
            target="_blank"
            style={buttonStyle("#ff5500")}
          >
            SoundCloud
          </a>
          <a
            href="https://www.youtube.com/channel/UC8sxDC0vLnUeR2VQmK3qyVg"
            target="_blank"
            style={buttonStyle("#ff0000")}
          >
            YouTube
          </a>
          <a
            href="https://open.spotify.com/artist/0Ffx93cnY4aH22LsxbNmPX"
            target="_blank"
            style={buttonStyle("#1db954")}
          >
            Spotify
          </a>
        </div>
      </section>

      {/* ================= ART ================= */}
      <section
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #eee",
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>🎨 Art</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <img src="/trees.png" style={artStyle} />
          <img src="/Flames.png" style={artStyle} />
        </div>

        <a
          href="https://www.etsy.com/shop/GaryCreatedArt"
          target="_blank"
          style={{ ...buttonStyle("#b57b17"), marginTop: 16 }}
        >
          Visit My Etsy Shop
        </a>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        style={{
          textAlign: "center",
          marginTop: 32,
          fontSize: 14,
          color: "#555",
        }}
      >
        © {new Date().getFullYear()} Gary Thomas Whitehead
        <div style={{ fontSize: 12 }}>
          {visits === null
            ? "Counting visits…"
            : `Total visits: ${visits.toLocaleString()}`}
        </div>
      </footer>
    </main>
  );
}

const buttonStyle = (bg: string) => ({
  background: bg,
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 10,
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block",
});

const artStyle = {
  width: "100%",
  borderRadius: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,.08)",
};
