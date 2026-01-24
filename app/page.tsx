"use client";

import React, { useEffect, useState } from "react";
import MoreMenu from "@/components/MoreMenu";

export default function Home() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    // Safe counter: never breaks the page if CountAPI is down/CORS/etc.
    async function incrementVisitorCounter() {
      try {
        const res = await fetch("https://api.countapi.xyz/hit/garythomaswhitehead-com/home", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();
        if (typeof data?.value === "number") setVisits(data.value);
      } catch {
        setVisits(null);
      }
    }
    incrementVisitorCounter();
  }, []);

  // ===== Styles (simple inline so you don't have to hunt files) =====
  const page: React.CSSProperties = {
    minHeight: "100vh",
    background: "#faf9f6",
    padding: "34px 14px 70px",
  };

  const container: React.CSSProperties = {
    maxWidth: 1080,
    margin: "0 auto",
  };

  const hero: React.CSSProperties = {
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 14px 30px rgba(0,0,0,.10)",
    marginBottom: 26,
    background: "#000",
  };

  const heroImg: React.CSSProperties = {
    width: "100%",
    height: 220,
    objectFit: "cover",
    display: "block",
  };

  const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    padding: 26,
    boxShadow: "0 10px 26px rgba(0,0,0,.08)",
    border: "1px solid rgba(0,0,0,0.06)",
    marginBottom: 18,
  };

  const kicker: React.CSSProperties = {
    fontSize: 12,
    letterSpacing: 1.2,
    color: "#777",
    fontWeight: 900,
    textTransform: "uppercase",
    marginBottom: 10,
  };

  const h1: React.CSSProperties = {
    fontSize: 38,
    lineHeight: 1.12,
    margin: "0 0 12px",
    fontWeight: 900,
  };

  const p: React.CSSProperties = {
    fontSize: 16,
    lineHeight: 1.7,
    margin: "10px 0",
    color: "#222",
  };

  const li: React.CSSProperties = { margin: "10px 0", lineHeight: 1.7 };

  const btnRow: React.CSSProperties = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 16,
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: 900,
    textDecoration: "none",
    background: "#b57b17",
    color: "#fff",
    boxShadow: "0 10px 18px rgba(181,123,23,.25)",
    border: "1px solid rgba(0,0,0,0.08)",
  };

  const btnSecondary: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: 10,
    fontWeight: 900,
    textDecoration: "none",
    background: "#111",
    color: "#fff",
    boxShadow: "0 10px 18px rgba(0,0,0,.14)",
    border: "1px solid rgba(0,0,0,0.08)",
  };

  const smallNote: React.CSSProperties = { marginTop: 8, fontSize: 12, color: "#666" };

  // ===== Page =====
  return (
    <div style={page}>
      <div style={container}>
        {/* HERO */}
        <div style={hero}>
          <img src="/new.jpg" alt="Gary Thomas Whitehead" style={heroImg} />
        </div>

        {/* CUSTOM SONGS TOP CARD */}
        <section style={card}>
          <div style={kicker}>CUSTOM SONGS &amp; MUSIC VIDEOS</div>

          <h1 style={h1}>
            Personal songs for any occasion — and a{" "}
            <span style={{ color: "#b57b17" }}>Photo Music Video</span> most services don&apos;t offer
          </h1>

          <p style={p}>
            Many custom song services deliver audio only. I can also create a{" "}
            <b>personalized Photo Music Video</b> where your pictures play beautifully as the song plays —
            turning your story into a keepsake you can share forever.
          </p>

          <ul style={{ margin: "14px 0 0", paddingLeft: 18 }}>
            <li style={li}>
              <b>Custom Song:</b> birthdays, anniversaries, weddings, memorials, graduations, faith inspiration, and more
            </li>
            <li style={li}>
              <b>Photo Music Video:</b> your photos + your song, edited into a heartfelt video presentation
            </li>
            <li style={li}>
              <b>Fast communication:</b> I’ll confirm details so the lyrics fit your story
            </li>
          </ul>

          {/* IMPORTANT: More button is separate, NOT inside Start button */}
          <div style={btnRow}>
            <a href="/custom-songs/order" style={btnPrimary}>
              Start My Song Request
            </a>

            <MoreMenu />

            <a href="/custom-songs/order?package=song_video" style={btnSecondary}>
              Start My Photo Music Video
            </a>
          </div>

          <div style={smallNote}>
            {visits === null ? "Visitor counter unavailable" : `Visitor count: ${visits.toLocaleString()}`}
          </div>
        </section>

        {/* AUTHOR BIO */}
        <section style={card}>
          <div style={kicker}>AUTHOR BIO</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Gary Thomas Whitehead</div>
          <p style={p}>
            Gary Thomas Whitehead is a multidisciplinary artist whose heart beats through music, painting, and words of faith.
            As a Christian songwriter and painter, Gary&apos;s work carries a single theme—the beauty of divine connection.
          </p>
          <p style={p}>
            His newest work, <i>The Sent Son: A Biblical Perspective on Jesus as Mediator and Divine Sonship</i>, reflects years
            of reflection, prayer, and study.
          </p>
        </section>

        {/* (Keep your other sections below as you already had them.
            If you want me to merge this into your exact previous 800+ line version,
            paste your current app/page.tsx here and I’ll return the FULL merged file.) */}

        <div style={{ textAlign: "center", marginTop: 22, color: "#666", fontSize: 13 }}>
          © {new Date().getFullYear()} Gary Thomas Whitehead
        </div>
      </div>
    </div>
  );
}
