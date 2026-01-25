"use client";

import Link from "next/link";
import CustomSongsShell from "@/components/CustomSongsShell";

export default function CustomSongsHome() {
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  };

  const card: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.75)",
    padding: 18,
    boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
  };

  const h: React.CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
  };

  const p: React.CSSProperties = {
    margin: "8px 0 14px",
    lineHeight: 1.7,
    fontSize: 16,
    fontWeight: 700,
    color: "#222",
  };

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    boxShadow: "0 10px 22px rgba(0,0,0,0.14)",
  };

  const btnAlt: React.CSSProperties = {
    ...btn,
    background: "#b57b17",
  };

  return (
    <CustomSongsShell
      title="Custom Songs & Photo Music Videos"
      subtitle="Order a personalized song for any occasion — and add a Photo Music Video where your pictures play beautifully as the music plays."
      backHref="/"
      backLabel="← Back to Home"
      badge="CUSTOM SONGS"
    >
      <div style={grid}>
        <div style={card}>
          <h3 style={h}>Start a Custom Song</h3>
          <p style={p}>Tell me the occasion and the story. We’ll shape the lyrics and vibe together.</p>
          <Link href="/custom-songs/order" style={btnAlt}>
            Start My Song Request →
          </Link>
        </div>

        <div style={card}>
          <h3 style={h}>Start a Photo Music Video</h3>
          <p style={p}>Includes a custom song + a polished video with your photos timed to the music.</p>
          <Link href="/custom-songs/photos" style={btn}>
            Start My Photo Music Video →
          </Link>
        </div>

        <div style={card}>
          <h3 style={h}>Samples</h3>
          <p style={p}>Watch video samples and hear YouTube song demos.</p>
          <Link href="/custom-songs/samples" style={btn}>
            View Samples →
          </Link>
        </div>

        <div style={card}>
          <h3 style={h}>Reviews</h3>
          <p style={p}>See what listeners say about the songs and video keepsakes.</p>
          <Link href="/custom-songs/reviews" style={btn}>
            Read Reviews →
          </Link>
        </div>

        <div style={card}>
          <h3 style={h}>FAQ</h3>
          <p style={p}>Quick answers on turnaround time, revisions, and what you’ll receive.</p>
          <Link href="/custom-songs/faq" style={btn}>
            Read FAQ →
          </Link>
        </div>

        <div style={card}>
          <h3 style={h}>Pick Genre / Vibe</h3>
          <p style={p}>Optional: choose a style direction before you order.</p>
          <Link href="/custom-songs/genre" style={btn}>
            Choose Options →
          </Link>
        </div>
      </div>
    </CustomSongsShell>
  );
}
