"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CustomSongsLanding() {
  const [packageChoice, setPackageChoice] = useState<"song+video" | "song">(
    "song+video"
  );

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.topRow}>
          <Link href="/" style={styles.backLink}>
            ← Back to Home
          </Link>
          <Link href="/" style={styles.homeLink}>
            Home
          </Link>
        </div>

        <div style={styles.stepRow}>
          <div style={styles.stepPill}>Step 1 of 5</div>
          <div style={styles.progressText}>20% Complete</div>
        </div>

        <h1 style={styles.title}>Order a Custom Song</h1>

        {/* 🔥 NEW PREMIUM DIFFERENTIATOR */}
        <div style={styles.heroHighlight}>
          <strong>
            Most custom song services stop at audio — I also create personalized{" "}
            <span style={styles.gold}>Photo Music Videos</span> where your pictures
            play beautifully while your song plays.
          </strong>
        </div>

        <div style={styles.notice}>
          <div style={styles.noticeTitle}>
            ⭐ You selected:{" "}
            {packageChoice === "song+video"
              ? "Song + Photo Music Video (photos play with the music)"
              : "Song Only"}
          </div>
          <div style={styles.noticeText}>
            A custom song is meaningful. A <strong>Photo Music Video</strong>{" "}
            turns it into a keepsake your loved one can watch, replay, and cherish
            forever.
          </div>
        </div>

        <label style={styles.label}>Choose your package *</label>
        <div style={styles.pillRow}>
          <button
            type="button"
            onClick={() => setPackageChoice("song+video")}
            style={pillStyle(packageChoice === "song+video")}
          >
            🎵 Song + Photo Music Video
          </button>
          <button
            type="button"
            onClick={() => setPackageChoice("song")}
            style={pillStyle(packageChoice === "song")}
          >
            🎶 Song Only
          </button>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoHeadline}>Custom Song</div>
            <p style={styles.infoText}>
              A personal song written from your story — perfect for birthdays,
              anniversaries, tributes, love stories, faith encouragement, or
              heartfelt gifts.
            </p>
          </div>

          <div style={styles.infoCardHighlight}>
            <div style={styles.infoHeadline}>🌟 Photo Music Video (Rare Offering)</div>
            <p style={styles.infoText}>
              Your photos appear in a simple cinematic video timed to the music.
              This is the feature most competitors <strong>do not offer</strong>{" "}
              — and it transforms your song into an unforgettable visual memory.
            </p>
          </div>
        </div>

        <div style={styles.navRow}>
          <span />
          <Link
            href="/custom-songs/order"
            style={styles.btnPrimary}
            aria-label="Start Step 2"
          >
            Next →
          </Link>
        </div>

        <footer style={styles.footer}>
          <div>© {new Date().getFullYear()} Gary Thomas Whitehead</div>
          <div style={styles.footerSmall}>
            Questions?{" "}
            <a href="mailto:garys_new_music@yahoo.com" style={styles.footerLink}>
              Email Gary
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#faf9f6",
    padding: 30,
    fontFamily: "Georgia, serif",
  },
  card: {
    maxWidth: 900,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #eee",
    boxShadow: "0 10px 25px rgba(0,0,0,.06)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  backLink: { textDecoration: "none", color: "#111", fontWeight: 800 },
  homeLink: { textDecoration: "none", color: "#111", fontWeight: 800 },
  stepRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  stepPill: {
    background: "#fff7ea",
    border: "1px solid #f2e2c8",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 14,
  },
  progressText: { fontWeight: 800, color: "#444" },
  title: { fontSize: 38, margin: "10px 0 12px", fontWeight: 900 },

  heroHighlight: {
    background: "#111",
    color: "#fff",
    borderRadius: 14,
    padding: "14px 16px",
    fontSize: 17,
    lineHeight: 1.6,
    marginBottom: 16,
  },

  gold: { color: "#f5c36a", fontWeight: 900 },

  notice: {
    background: "#fff7ea",
    border: "1px solid #f2e2c8",
    borderRadius: 14,
    padding: "14px 14px",
    marginBottom: 16,
  },
  noticeTitle: { fontWeight: 900, fontSize: 16, marginBottom: 6 },
  noticeText: { fontSize: 16, color: "#333", lineHeight: 1.6 },

  label: { fontWeight: 900, marginTop: 10, display: "block", fontSize: 16 },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginTop: 18,
  },

  infoCard: {
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 14,
    background: "#fff",
  },

  infoCardHighlight: {
    border: "2px solid #b57b17",
    borderRadius: 14,
    padding: 14,
    background: "#fffaf1",
  },

  infoHeadline: { fontWeight: 900, fontSize: 16, marginBottom: 6 },

  infoText: { margin: 0, fontSize: 16, lineHeight: 1.6, color: "#333" },

  navRow: {
    marginTop: 22,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },

  btnPrimary: {
    background: "#b57b17",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    marginTop: 22,
    borderTop: "1px solid #eee",
    paddingTop: 14,
    textAlign: "center",
    fontWeight: 900,
    color: "#333",
  },

  footerSmall: { fontWeight: 500, marginTop: 6, color: "#666" },

  footerLink: { color: "#111", fontWeight: 800, textDecoration: "none" },
};

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 16px",
    borderRadius: 999,
    border: active ? "2px solid #b57b17" : "1px solid #ccc",
    background: active ? "#fff7ea" : "#fff",
    fontWeight: 900,
    cursor: "pointer",
  };
}
