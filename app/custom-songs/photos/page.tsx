"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PhotosPage() {
  const [photoCount, setPhotoCount] = useState(12);
  const [notes, setNotes] = useState("");

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.topRow}>
          <Link href="/custom-songs/genre" style={styles.backLink}>
            ← Back
          </Link>
          <Link href="/" style={styles.homeLink}>
            Home
          </Link>
        </div>

        <div style={styles.stepRow}>
          <div style={styles.stepPill}>Step 4 of 5</div>
          <div style={styles.progressText}>80% Complete</div>
        </div>

        <h1 style={styles.title}>Photos for the Music Video</h1>

        <div style={styles.notice}>
          <div style={styles.noticeTitle}>This is the “wow” difference.</div>
          <div style={styles.noticeText}>
            Most custom song services stop at the audio. Your package can include
            a <strong>Photo Music Video</strong>—your pictures play while the song
            plays, matched to the emotion and story.
          </div>
        </div>

        <label style={styles.label}>How many photos do you plan to send?</label>
        <input
          type="number"
          min={5}
          max={60}
          value={photoCount}
          onChange={(e) => setPhotoCount(Number(e.target.value))}
          style={styles.input}
        />
        <div style={styles.helper}>
          Recommendation: <strong>10–25 photos</strong> works great.
        </div>

        <label style={styles.label}>Photo notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Example: ‘Use wedding photos first, then family photos, end with the sunset picture.’"
          style={styles.textarea}
        />

        <div style={styles.tipBox}>
          <div style={styles.tipTitle}>How you’ll deliver photos</div>
          <ul style={styles.ul}>
            <li>After you submit, I’ll email you a simple upload option.</li>
            <li>
              You can also send a share link (Google Drive / Dropbox), or attach
              a smaller set by email.
            </li>
            <li>
              If you want specific captions or a certain order, tell me here.
            </li>
          </ul>
        </div>

        <div style={styles.navRow}>
          <Link href="/custom-songs/genre" style={styles.btnSecondary}>
            ← Back
          </Link>
          <Link href="/custom-songs/review" style={styles.btnPrimary}>
            Next →
          </Link>
        </div>

        <p style={styles.note}>
          <strong>Local notes:</strong> {photoCount} photos •{" "}
          {notes ? "notes added" : "no notes yet"}
        </p>
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
  title: { fontSize: 34, marginBottom: 12, fontWeight: 900 },
  notice: {
    background: "#fff7ea",
    border: "1px solid #f2e2c8",
    borderRadius: 14,
    padding: "14px 14px",
    marginBottom: 16,
  },
  noticeTitle: { fontWeight: 900, fontSize: 16, marginBottom: 6 },
  noticeText: { fontSize: 16, color: "#333", lineHeight: 1.6 },
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
    minHeight: 120,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    marginTop: 8,
    fontSize: 16,
    outline: "none",
    resize: "vertical",
    lineHeight: 1.5,
  },
  helper: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    lineHeight: 1.5,
  },
  tipBox: {
    marginTop: 18,
    borderRadius: 14,
    border: "1px solid #eee",
    background: "#fff",
    padding: 14,
  },
  tipTitle: { fontWeight: 900, marginBottom: 8, fontSize: 16 },
  ul: { margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 16 },
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
  note: {
    marginTop: 18,
    fontSize: 16,
    color: "#333",
    background: "#fff7ea",
    border: "1px solid #f2e2c8",
    padding: "12px 14px",
    borderRadius: 12,
  },
};
