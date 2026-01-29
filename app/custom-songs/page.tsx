"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import CustomSongsMenu from "@/components/CustomSongsMenu";

export default function CustomSongsPage() {
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
      {/* ====== HEADER (match home look) ====== */}
      <header
        style={{
          backgroundImage: "url('/new.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: 28,
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
            <div style={{ fontSize: 18, opacity: 0.9 }}>
              GARY THOMAS WHITEHEAD
            </div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              Author • Songwriter • Painter
            </div>
          </div>
        </div>
      </header>

      {/* ====== CUSTOM SONGS LANDING ====== */}
      <section
        aria-labelledby="custom-songs"
        style={{
          marginTop: 0,
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #eee",
        }}
      >
        <h2
          id="custom-songs"
          style={{ fontSize: 14, color: "#7a7a7a", letterSpacing: ".08em" }}
        >
          CUSTOM SONGS &amp; MUSIC VIDEOS
        </h2>

        <h1 style={{ fontSize: 36, margin: "8px 0 12px", lineHeight: 1.15 }}>
          Personal songs for any occasion — and a{" "}
          <span style={{ color: "#b57b17" }}>Photo Music Video</span> most
          services don’t offer
        </h1>

        <p style={{ marginTop: 0, marginBottom: 14, maxWidth: 980 }}>
          Many custom song services deliver audio only. I can also create a{" "}
          <strong>personalized Photo Music Video</strong> where your pictures
          play beautifully as the song plays — turning your story into a
          keepsake you can share forever.
        </p>

        <ul
          style={{
            marginTop: 0,
            marginBottom: 16,
            paddingLeft: 18,
            lineHeight: 1.7,
          }}
        >
          <li>
            <strong>Custom Song:</strong> birthdays, anniversaries, weddings,
            memorials, graduations, faith inspiration, and more
          </li>
          <li>
            <strong>Photo Music Video:</strong> your photos + your song, edited
            into a heartfelt video presentation
          </li>
          <li>
            <strong>Fast communication:</strong> I’ll confirm details so the
            lyrics fit your story
          </li>
        </ul>

        {/* BRAND POSITIONING */}
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(245,242,236,0.75)",
            padding: "14px 14px",
            marginBottom: 14,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: ".08em",
              color: "rgba(0,0,0,0.65)",
            }}
          >
            🎼 BRAND POSITIONING
          </div>

          <div style={{ marginTop: 8, fontWeight: 700, lineHeight: 1.7 }}>
            Every song begins with lyrics personally written by{" "}
            <strong>Gary Thomas Whitehead</strong> — a published songwriter and
            storyteller. Music and vocals are then{" "}
            <strong>artist-directed</strong> using advanced AI production tools
            to deliver polished, emotionally powerful recordings.
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              fontWeight: 700,
              opacity: 0.85,
            }}
          >
            Lyrics are personally written by a seasoned, published songwriter.
            Music and vocals are produced using advanced AI tools — artist-directed,
            edited, and quality-controlled to achieve radio-ready results.
          </div>
        </div>

        {/* CTA ROW */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link
            href="/custom-songs/order"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 800,
              textDecoration: "none",
              background: "#b57b17",
              color: "#fff",
              boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
            }}
            onClick={() => track("CustomSongsOrderClick")}
          >
            Start My Song Request
          </Link>

          <CustomSongsMenu label="Menu" />
        </div>

        {/* Optional quick links */}
        <div style={{ marginTop: 16, fontWeight: 700, opacity: 0.8 }}>
          Or jump to:{" "}
          <Link href="/custom-songs/samples" style={{ color: "#b57b17" }}>
            Samples
          </Link>
          {" • "}
          <Link href="/custom-songs/faq" style={{ color: "#b57b17" }}>
            FAQ
          </Link>
          {" • "}
          <Link href="/custom-songs/reviews" style={{ color: "#b57b17" }}>
            Reviews
          </Link>
        </div>
      </section>
    </main>
  );
}
