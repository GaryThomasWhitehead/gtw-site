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

        <h1 style={styles.title}>Let’s start with the basics</h1>

        <div style={styles.notice}>
          <div style={styles.noticeTitle}>
            ⭐ You selected:{" "}
            {packageChoice === "song+video"
              ? "Song + Photo Music Video (your photos play with the music)"
              : "Song Only"}
          </div>
          <div style={styles.noticeText}>
            Many services do custom songs. The <strong>Photo Music Video</strong>{" "}
            is the unique add-on that makes your gift unforgettable.
          </div>
        </div>

        <label style={styles.label}>Choose your package *</label>
        <div style={styles.pillRow}>
          <button
            type="button"
            onClick={() => setPackageChoice("song+video")}
            style={pillStyle(packageChoice === "song+video")}
          >
            Song + Photo Music Video
          </button>
          <button
            type="button"
            onClick={() => setPackageChoice("song")}
            style={pillStyle(packageChoice === "song")}
          >
            Song Only
          </button>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoHeadline}>Custom Song</div>
            <p style={styles.infoText}>
              A personal song written from your story—perfect for birthdays,
              anniversaries, tributes, faith encouragement, or “just because.”
            </p>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoHeadline}>Photo Music Video (highlight)</div>
            <p style={styles.infoText}>
              Your photos play in a simple, beautiful video while the song plays.
              This is the part most competitors don’t offer—especially customized
              to match the lyrics and emotion.
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
            Need help?{" "}
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
  title: { fontSize: 36, margin: "10px 0 16px", fontWeight: 900 },
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
