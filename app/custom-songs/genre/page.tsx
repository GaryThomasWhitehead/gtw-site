"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LS_KEY = "gtw_custom_song_order_v1";

export default function GenrePage() {
  const router = useRouter();
  const [genre, setGenre] = useState("Country");
  const [voice, setVoice] = useState("No Preference");

  const genres = ["Country", "Pop", "Worship", "Rock", "R&B", "Jazz", "Hip-Hop"];

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved?.genre) setGenre(saved.genre);
      if (saved?.voice) setVoice(saved.voice);
    } catch {}
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    const prev = raw ? safeParse(raw) : {};
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        ...prev,
        genre,
        voice,
      })
    );
  }, [genre, voice]);

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={topRow}>
          <Link href="/custom-songs/order" style={backLink}>
            ← Back
          </Link>
          <Link href="/" style={miniLink}>
            Home
          </Link>
        </div>

        <div style={progressRow}>
          <div style={stepPill}>Step 3 of 5</div>
          <div style={progressMeta}>60% Complete</div>
        </div>

        <h1 style={titleStyle}>Choose the Musical Style</h1>

        <label style={labelStyle}>Genre</label>
        <div style={pillRow}>
          {genres.map((g) => (
            <button key={g} onClick={() => setGenre(g)} style={pill(genre === g)}>
              {g}
            </button>
          ))}
        </div>

        <label style={labelStyle}>Preferred Voice</label>
        <div style={pillRow}>
          {["Male", "Female", "No Preference"].map((v) => (
            <button key={v} onClick={() => setVoice(v)} style={pill(voice === v)}>
              {v}
            </button>
          ))}
        </div>

        <div style={navRow}>
          <button
            type="button"
            onClick={() => router.push("/custom-songs/order")}
            style={btnSecondary}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => router.push("/custom-songs/photos")}
            style={btnPrimary}
          >
            Next →
          </button>
        </div>
      </section>
    </main>
  );
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

const ACCENT = "#b57b17";

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "transparent",
  padding: "34px 16px",
  fontFamily: "Georgia, serif",
};

const cardStyle: React.CSSProperties = {
  maxWidth: 940,
  margin: "0 auto",
  background: "rgba(255,255,255,0.92)",
  borderRadius: 18,
  padding: 26,
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 14px 35px rgba(0,0,0,.10)",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const backLink: React.CSSProperties = {
  color: "#111",
  textDecoration: "none",
  fontWeight: 800,
};

const miniLink: React.CSSProperties = {
  color: "#111",
  textDecoration: "none",
  fontWeight: 800,
};

const progressRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const stepPill: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(181,123,23,0.10)",
  border: "1px solid rgba(181,123,23,0.30)",
  fontWeight: 900,
  fontSize: 13,
};

const progressMeta: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 13,
  color: "#333",
};

const titleStyle: React.CSSProperties = { fontSize: 34, marginBottom: 16, fontWeight: 900 };

const labelStyle: React.CSSProperties = {
  fontWeight: 900,
  marginTop: 16,
  display: "block",
  fontSize: 16,
};

const pillRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 10,
};

const pill = (active: boolean): React.CSSProperties => ({
  padding: "10px 16px",
  borderRadius: 999,
  border: active ? `2px solid ${ACCENT}` : "1px solid rgba(0,0,0,0.25)",
  background: active ? "rgba(255, 247, 234, 0.95)" : "rgba(255,255,255,0.90)",
  fontWeight: 900,
  cursor: "pointer",
});

const navRow: React.CSSProperties = {
  marginTop: 22,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const btnPrimary: React.CSSProperties = {
  background: ACCENT,
  color: "#fff",
  padding: "12px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(181,123,23,0.25)",
};

const btnSecondary: React.CSSProperties = {
  background: "rgba(255,255,255,0.90)",
  color: "#111",
  padding: "12px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  border: "1px solid rgba(0,0,0,0.15)",
  cursor: "pointer",
};
