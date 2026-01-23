"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

export default function OrderBasicsPage() {
  const whoOptions = useMemo(
    () => [
      "Myself / Someone I Love",
      "Husband",
      "Wife",
      "Boyfriend",
      "Girlfriend",
      "Children",
      "Father",
      "Mother",
      "Sibling",
      "Friend",
      "Other",
    ],
    []
  );

  const [whoFor, setWhoFor] = useState("Myself / Someone I Love");
  const [name, setName] = useState("Gary");
  const [email, setEmail] = useState("");

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.topRow}>
          <Link href="/custom-songs" style={styles.backLink}>
            ← Back to Options
          </Link>
          <Link href="/" style={styles.homeLink}>
            Home
          </Link>
        </div>

        <div style={styles.stepRow}>
          <div style={styles.stepPill}>Step 2 of 5</div>
          <div style={styles.progressText}>40% Complete</div>
        </div>

        <h1 style={styles.title}>Tell me about the song</h1>

        <label style={styles.label}>Who’s this for? *</label>
        <div style={styles.pillRow}>
          {whoOptions.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWhoFor(w)}
              style={pillStyle(whoFor === w)}
            >
              {w}
            </button>
          ))}
        </div>

        <label style={styles.label}>What’s your name? *</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />

        <div style={styles.helper}>
          Tip: add pronunciation notes later in the story section (example:
          “Alicia = ah-lee-sha”).
        </div>

        <label style={styles.label}>Your email address *</label>
        <input
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />

        <div style={styles.navRow}>
          <Link href="/custom-songs" style={styles.btnSecondary}>
            ← Back
          </Link>
          <Link href="/custom-songs/genre" style={styles.btnPrimary}>
            Next →
          </Link>
        </div>

        <p style={styles.note}>
          <strong>Saved (local only for now):</strong> {whoFor} • {name} •{" "}
          {email || "no email yet"}
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
  title: { fontSize: 34, marginBottom: 10, fontWeight: 900 },
  label: { fontWeight: 900, marginTop: 16, display: "block", fontSize: 16 },
  pillRow: { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    marginTop: 8,
    fontSize: 16,
    outline: "none",
  },
  helper: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    lineHeight: 1.5,
  },
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
