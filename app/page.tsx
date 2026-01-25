"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import CustomSongsShell from "@/components/CustomSongsShell";

export default function CustomSongsHome() {
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 16,
  };

  const card: React.CSSProperties = {
    gridColumn: "span 12",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 36px rgba(0,0,0,0.14)",
    padding: 18,
  };

  const h: React.CSSProperties = {
    margin: "0 0 6px",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: "-0.01em",
  };

  const p: React.CSSProperties = {
    margin: "0 0 12px",
    lineHeight: 1.85,
    fontWeight: 800,
    color: "#1a1a1a",
    fontSize: 17,
    maxWidth: 980,
  };

  const btnRow: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "#b57b17",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
  };

  const btnDark: React.CSSProperties = { ...btnPrimary, background: "#111" };

  const btnGhost: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.90)",
    color: "#111",
    fontWeight: 900,
    textDecoration: "none",
  };

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS"
      title="Custom Songs & Photo Music Videos"
      subtitle="Choose an option, share a few details, and I’ll create something personal — written from your story, with pro-level polish and heart."
      backHref="/"
      backLabel="← Back to Home"
      rightSlot={
        <Link
          href="/custom-songs/samples"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "9px 12px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.14)",
            background: "rgba(255,255,255,0.90)",
            fontWeight: 900,
            textDecoration: "none",
            color: "#111",
          }}
          onClick={() => track("CustomSongsSamplesClick")}
        >
          View Samples →
        </Link>
      }
    >
      <div style={grid}>
        <div style={card}>
          <h2 style={h}>Option 1: Custom Song</h2>
          <p style={p}>
            A one-of-a-kind song written from your story — perfect for birthdays, anniversaries, weddings,
            memorials, graduations, and faith inspiration.
          </p>
          <div style={btnRow}>
            <Link href="/custom-songs/genre" style={btnPrimary} onClick={() => track("CustomSongsStartSongOnly")}>
              Start My Song →
            </Link>
            <Link href="/custom-songs/faq" style={btnGhost}>
              FAQs
            </Link>
          </div>
        </div>

        <div style={card}>
          <h2 style={h}>Option 2: Custom Song + Photo Music Video</h2>
          <p style={p}>
            Your custom song plus a cinematic Photo Music Video made from your pictures — a keepsake you can share forever.
          </p>
          <div style={btnRow}>
            <Link href="/custom-songs/genre" style={btnDark} onClick={() => track("CustomSongsStartSongVideo")}>
              Start My Photo Music Video →
            </Link>
            <Link href="/custom-songs/samples" style={btnGhost}>
              Watch Samples
            </Link>
          </div>
        </div>

        <div style={card}>
          <h2 style={h}>What you’ll get</h2>
          <p style={p}>
            A clear process, fast communication, and lyrics that feel real — not generic. If you’re unsure on details,
            leave it blank and we’ll confirm it together.
          </p>
          <div style={btnRow}>
            <Link href="/custom-songs/reviews" style={btnGhost}>
              Read Reviews
            </Link>
            <Link href="/custom-songs/order" style={btnGhost}>
              Skip to Order Form
            </Link>
          </div>
        </div>
      </div>
    </CustomSongsShell>
  );
}
