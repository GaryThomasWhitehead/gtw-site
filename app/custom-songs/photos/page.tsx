"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type OrderData = {
  packageChoice: "song_video" | "song_only";
  photoNames?: string[];
};

const STORAGE_KEY = "customSongOrder";

function readStore(): OrderData {
  if (typeof window === "undefined") return { packageChoice: "song_video" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { packageChoice: "song_video" };
    return { packageChoice: "song_video", ...(JSON.parse(raw) as OrderData) };
  } catch {
    return { packageChoice: "song_video" };
  }
}

function writeStore(patch: Partial<OrderData>) {
  const current = readStore();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
}

export default function PhotosPage() {
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [packageChoice, setPackageChoice] = useState<"song_video" | "song_only">("song_video");

  useEffect(() => {
    const data = readStore();
    setPackageChoice(data.packageChoice || "song_video");
    if (data.photoNames) setPhotoNames(data.photoNames);
  }, []);

  const isVideo = packageChoice === "song_video";

  const canNext = useMemo(() => {
    if (!isVideo) return true; // song-only doesn't require photos
    return photoNames.length >= 3; // recommend at least 3
  }, [isVideo, photoNames.length]);

  function onPickFiles(files: FileList | null) {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setPhotoNames(names);
    writeStore({ photoNames: names });
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={topRow}>
          <Link href="/custom-songs/genre" style={backLink}>
            ← Back
          </Link>
          <div style={topRight}>
            <div style={topRightTitle}>Home</div>
            <div style={progressText}>80% Complete</div>
          </div>
        </div>

        <div style={stepPill}>Step 4 of 5</div>

        <h1 style={titleStyle}>Add Photos (for the music video)</h1>

        {!isVideo ? (
          <div style={infoBox}>
            <div style={infoTitle}>🎧 Song Only selected</div>
            <div style={infoText}>
              You don’t need to add photos for the Song Only package. Click Next to review.
            </div>
          </div>
        ) : (
          <>
            <div style={infoBox}>
              <div style={infoTitle}>✨ Signature Feature</div>
              <div style={infoText}>
                Your photos will play in a cinematic <b>Photo Music Video</b> synced to the song.
                Pick a handful of photos — more is fine.
              </div>
            </div>

            <label style={labelStyle}>Select photos (JPG/PNG) *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
              style={fileStyle}
            />

            <div style={smallNote}>
              Tip: Choose photos that match the story (and add any pronunciation notes in your story).
            </div>

            {photoNames.length > 0 && (
              <div style={listBox}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  Selected ({photoNames.length})
                </div>
                <ul style={ul}>
                  {photoNames.slice(0, 12).map((n) => (
                    <li key={n} style={li}>
                      {n}
                    </li>
                  ))}
                  {photoNames.length > 12 && <li style={li}>…and more</li>}
                </ul>
              </div>
            )}
          </>
        )}

        <div style={navRow}>
          <Link href="/custom-songs/genre" style={btnSecondary}>
            ← Back
          </Link>
          <Link
            href={canNext ? "/custom-songs/review" : "#"}
            style={canNext ? btnPrimary : btnDisabled}
            onClick={(e) => {
              if (!canNext) e.preventDefault();
            }}
          >
            Next →
          </Link>
        </div>

        <footer style={footer}>
          <div>© {new Date().getFullYear()} Gary Thomas Whitehead</div>
          <div style={footerSmall}>
            Questions?{" "}
            <a href="mailto:gary@example.com" style={footerLink}>
              Email Gary
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "transparent",
  padding: "30px",
  fontFamily: "Georgia, serif",
};

const cardStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  background: "rgba(255,255,255,0.92)",
  borderRadius: 18,
  padding: 24,
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 14px 34px rgba(0,0,0,.10)",
  backdropFilter: "blur(2px)",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const backLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#111",
  fontWeight: 800,
};

const topRight: React.CSSProperties = { textAlign: "right" };
const topRightTitle: React.CSSProperties = { fontWeight: 900 };
const progressText: React.CSSProperties = { opacity: 0.75, fontWeight: 800 };

const stepPill: React.CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#fff3df",
  border: "1px solid #f0d7aa",
  fontWeight: 900,
  fontSize: 12,
};

const titleStyle: React.CSSProperties = { fontSize: 34, margin: "14px 0 12px" };

const infoBox: React.CSSProperties = {
  background: "#fff6ea",
  border: "1px solid #f1d7b0",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
};

const infoTitle: React.CSSProperties = { fontWeight: 900, marginBottom: 6 };
const infoText: React.CSSProperties = { fontSize: 16, lineHeight: 1.35 };

const labelStyle: React.CSSProperties = { fontWeight: 900, marginTop: 14, display: "block" };

const fileStyle: React.CSSProperties = {
  marginTop: 10,
  width: "100%",
};

const smallNote: React.CSSProperties = { marginTop: 8, opacity: 0.9, fontWeight: 700 };

const listBox: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.92)",
};

const ul: React.CSSProperties = { margin: 0, paddingLeft: 18 };
const li: React.CSSProperties = { marginBottom: 6 };

const navRow: React.CSSProperties = {
  marginTop: 18,
  display: "flex",
  justifyContent: "space-between",
};

const btnPrimary: React.CSSProperties = {
  background: "#b57b17",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  display: "inline-block",
  boxShadow: "0 8px 18px rgba(181,123,23,.25)",
};

const btnSecondary: React.CSSProperties = {
  background: "rgba(0,0,0,0.08)",
  color: "#111",
  padding: "12px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  display: "inline-block",
};

const btnDisabled: React.CSSProperties = {
  background: "rgba(0,0,0,0.15)",
  color: "rgba(255,255,255,0.9)",
  padding: "12px 18px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  display: "inline-block",
  cursor: "not-allowed",
};

const footer: React.CSSProperties = {
  marginTop: 22,
  borderTop: "1px solid rgba(0,0,0,0.08)",
  paddingTop: 14,
  textAlign: "center",
  fontWeight: 900,
  color: "#333",
};

const footerSmall: React.CSSProperties = { fontWeight: 600, marginTop: 4, opacity: 0.9 };
const footerLink: React.CSSProperties = { color: "#111", fontWeight: 900 };
