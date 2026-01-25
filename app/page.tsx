"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import MoreMenu from "@/components/MoreMenu";

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
        fontFamily: '"Georgia", "Times New Roman", serif',
        color: "#111",
        backgroundColor: "#faf9f6",
        lineHeight: 1.6,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          backgroundImage: "url('/new.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "260px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          />
          <div>
            <div style={{ fontSize: "18px" }}>GARY THOMAS WHITEHEAD</div>
            <div style={{ fontSize: "14px" }}>
              Author • Songwriter • Painter
            </div>
          </div>
        </div>
      </header>

      {/* CUSTOM SONGS CTA */}
      <section
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #eee",
        }}
      >
        <h2 style={{ fontSize: 14, color: "#777" }}>
          CUSTOM SONGS & MUSIC VIDEOS
        </h2>

        <h3 style={{ fontSize: 32, marginTop: 6 }}>
          Personal songs & Photo Music Videos
        </h3>

        <p style={{ maxWidth: 900 }}>
          Order a personalized song for any occasion — birthdays, weddings,
          tributes, memorials — and add a Photo Music Video where your pictures
          play beautifully in sync with your song.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="/custom-songs"
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              fontWeight: 900,
              background: "#b57b17",
              color: "#fff",
              textDecoration: "none",
            }}
            onClick={() => track("CustomSongsHomeClick")}
          >
            View Custom Songs →
          </a>

          <MoreMenu />
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 30,
          textAlign: "center",
          padding: 16,
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #eee",
        }}
      >
        <div>© {new Date().getFullYear()} Gary Thomas Whitehead</div>
        <div style={{ fontSize: 12, color: "#777" }}>
          {visits === null
            ? "Counting visitors..."
            : `Total visits recorded: ${visits.toLocaleString()}`}
        </div>
      </footer>
    </main>
  );
}
