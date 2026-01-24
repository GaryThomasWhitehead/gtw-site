"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LS_KEY = "gtw_custom_song_order_v1";

export default function OrderPage() {
  const router = useRouter();
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [story, setStory] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved?.occasion) setOccasion(saved.occasion);
      if (saved?.mood) setMood(saved.mood);
      if (saved?.story) setStory(saved.story);
    } catch {}
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    const prev = raw ? safeParse(raw) : {};
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        ...prev,
        occasion,
        mood,
        story,
      })
    );
  }, [occasion, mood, story]);

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={topRow}>
          <Link href="/custom-songs" style={backLink}>
            ← Back to Options
          </Link>
          <Link href="/" style={miniLink}>
            Home
          </Link>
        </div>

        <div style={progressRow}>
          <div style={stepPill}>Step 2 of 5</div>
          <div style={progressMeta}>40% Complete</div>
        </div>

        <h1 style={titleStyle}>Let’s shape the song</h1>

        <label style={labelStyle}>Occasion *</label>
        <input
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          style={inputStyle}
          placeholder="Birthday, Anniversary, Memorial, Wedding, Faith, etc."
        />

        <label style={labelStyle}>Mood / vibe *</label>
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          style={inputStyle}
          placeholder="Warm & Hopeful, Funny, Heartbreak, Worship, etc."
        />

        <label style={labelStyle}>Your story (the more detail, the better) *</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          style={textareaStyle}
          placeholder="Names, relationship, key memories, phrases you want included, what you want them to feel when they hear it..."
        />

        <div style={navRow}>
          <button
            type="button"
            onClick={() => router.push("/custom-songs")}
            style={btnSecondary}
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={() => router.push("/custom-songs/genre")}
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

const titleStyle: React.CSSProperties = {
  fontSize: 34,
  margin: "6px 0 12px",
  letterSpacing: -0.2,
  fontWeight: 900,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 900,
  marginTop: 14,
  display: "block",
  fontSize: 16,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.18)",
  outline: "none",
  fontSize: 16,
  background: "rgba(255,255,255,0.92)",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.18)",
  outline: "none",
  fontSize: 16,
  minHeight: 160,
  background: "rgba(255,255,255,0.92)",
  marginTop: 8,
};

const navRow: React.CSSProperties = {
  marginTop: 18,
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
