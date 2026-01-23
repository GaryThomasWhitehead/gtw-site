"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

export default function GenrePage() {
  const [genre, setGenre] = useState("Country");
  const [voice, setVoice] = useState("No Preference");

  const genres = useMemo(
    () => ["Country", "Pop", "Worship", "Rock", "R&B", "Jazz", "Hip-Hop"],
    []
  );

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Choose the Musical Style</h1>

        <label style={styles.label}>Genre</label>
        <div style={styles.pillRow}>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              style={pillStyle(genre === g)}
            >
              {g}
            </button>
          ))}
        </div>

        <label style={styles.label}>Preferred Voice</label>
        <div style={styles.pillRow}>
          {["Male", "Female", "No Preference"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVoice(v)}
              style={pillStyle(voice === v)}
            >
              {v}
            </button>
          ))}
        </div>

        <div style={styles.navRow}>
          <Link href="/custom-songs/order" style={styles.btnSecondary}>
            ← Back
          </Link>
          <Link href="/custom-songs/photos" style={styles.btnPrimary}>
            Next →
          </Link>
        </div>

        <p style={styles.note}>
          <strong>Selected:</strong> {genre} • {voice}
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
  title: { fontSize: 34, marginBottom: 16, fontWeight: 900 },
  label: { fontWeight: 900, marginTop: 16, display: "block", fontSize: 16 },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 },
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
