"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ReviewPage() {
  const [story, setStory] = useState("");
  const [occasion, setOccasion] = useState("Any Occasion");
  const [deadline, setDeadline] = useState("");

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.topRow}>
          <Link href="/custom-songs/photos" style={styles.backLink}>
            ← Back
          </Link>
          <Link href="/" style={styles.homeLink}>
            Home
          </Link>
        </div>

        <div style={styles.stepRow}>
          <div style={styles.stepPill}>Step 5 of 5</div>
          <div style={styles.progressText}>100% Complete</div>
        </div>

        <h1 style={styles.title}>Share your heart</h1>
        <p style={styles.subtitle}>
          What do you want your song (and optional Photo Music Video) to convey?
        </p>

        <label style={styles.label}>Occasion</label>
        <input
          style={styles.input}
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          placeholder="Birthday, anniversary, tribute, faith encouragement, etc."
        />

        <label style={styles.label}>Deadline (optional)</label>
        <input
          style={styles.input}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder="Example: Feb 14"
        />

        <label style={styles.label}>Your story / key details *</label>
        <textarea
          style={styles.textarea}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Names, relationships, special moments, faith, personality, inside jokes, what you want the song to say..."
        />

        <div style={styles.highlight}>
          <div style={styles.highlightTitle}>Your unique option</div>
          <div style={styles.highlightText}>
            If you choose the <strong>Photo Music Video</strong>, your pictures
            will play while the song plays—matched to the lyrics and emotional
            arc. This is the standout feature most custom-song services don’t
            provide.
          </div>
        </div>

        <div style={styles.navRow}>
          <Link href="/custom-songs/photos" style={styles.btnSecondary}>
            ← Back
          </Link>
          <Link href="/custom-songs/thank-you" style={styles.btnPrimary}>
            Submit Request →
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#faf9f6",
    padding: "30px",
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
  title: { fontSize: 34, marginBottom: 8, fontWeight: 900 },
  subtitle: { marginTop: 0, color: "#333", fontSize: 16, lineHeight: 1.6 },
  label: { fontWeight: 900, marginTop: 16, display: "block", fontSize: 16 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    marginTop: 8,
    fontSize: 16,
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: 180,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    marginTop: 8,
    fontSize: 16,
    outline: "none",
    resize: "vertical",
    lineHeight: 1.5,
  },
  highlight: {
    marginTop: 18,
    background: "#fff7ea",
    border: "1px solid #f2e2c8",
    borderRadius: 14,
    padding: "14px 14px",
  },
  highlightTitle: { fontWeight: 900, fontSize: 16, marginBottom: 6 },
  highlightText: { fontSize: 16, color: "#333", lineHeight: 1.6 },
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
  btnSecondary: {
    background: "#eee",
    color: "#111",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
