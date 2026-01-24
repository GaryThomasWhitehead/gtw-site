"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type OrderData = {
  packageChoice: "song_video" | "song_only";
  forWhom?: string;
  name?: string;
  email?: string;
  mood?: string;
  occasion?: string;
  story?: string;
  genre?: string;
  voice?: string;
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

export default function ReviewPage() {
  const [data, setData] = useState<OrderData>({ packageChoice: "song_video" });

  useEffect(() => {
    setData(readStore());
  }, []);

  const packageLabel =
    data.packageChoice === "song_video" ? "Song + Photo Music Video" : "Song Only";

  const mailBody = useMemo(() => {
    const lines = [
      `Custom Song Request`,
      ``,
      `Package: ${packageLabel}`,
      `For: ${data.forWhom || ""}`,
      `Name: ${data.name || ""}`,
      `Email: ${data.email || ""}`,
      `Mood: ${data.mood || ""}`,
      `Occasion: ${data.occasion || ""}`,
      `Genre: ${data.genre || ""}`,
      `Voice: ${data.voice || ""}`,
      ``,
      `Story:`,
      `${data.story || ""}`,
      ``,
      `Photos selected: ${(data.photoNames?.length || 0).toString()}`,
      ...(data.photoNames || []).slice(0, 20).map((n) => `- ${n}`),
      ...(data.photoNames && data.photoNames.length > 20 ? ["- ...and more"] : []),
    ];
    return encodeURIComponent(lines.join("\n"));
  }, [data, packageLabel]);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Custom Song Request");
    return `mailto:gary@example.com?subject=${subject}&body=${mailBody}`;
  }, [mailBody]);

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={topRow}>
          <Link href="/custom-songs/photos" style={backLink}>
            ← Back
          </Link>
          <div style={topRight}>
            <div style={topRightTitle}>Home</div>
            <div style={progressText}>100% Ready</div>
          </div>
        </div>

        <div style={stepPill}>Step 5 of 5</div>

        <h1 style={titleStyle}>Review your request</h1>

        <div style={infoBox}>
          <div style={infoTitle}>✨ Quick note</div>
          <div style={infoText}>
            After you submit, I’ll follow up by email about any details (and for Photo Music Videos,
            how to send the photos if needed). This is designed to be easy.
          </div>
        </div>

        <div style={summaryGrid}>
          <div style={summaryItem}>
            <div style={summaryLabel}>Package</div>
            <div style={summaryValue}>{packageLabel}</div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Mood / Occasion</div>
            <div style={summaryValue}>
              {(data.mood || "—") + " • " + (data.occasion || "—")}
            </div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Genre / Voice</div>
            <div style={summaryValue}>
              {(data.genre || "—") + " • " + (data.voice || "—")}
            </div>
          </div>
          <div style={summaryItem}>
            <div style={summaryLabel}>Photos</div>
            <div style={summaryValue}>
              {(data.photoNames?.length || 0).toString()} selected
            </div>
          </div>
        </div>

        <div style={block}>
          <div style={blockTitle}>Contact</div>
          <div style={blockText}>
            <b>{data.name || "—"}</b> • {data.email || "—"}
            <br />
            For: {data.forWhom || "—"}
          </div>
        </div>

        <div style={block}>
          <div style={blockTitle}>Story</div>
          <div style={storyBox}>{data.story || "—"}</div>
        </div>

        <div style={navRow}>
          <Link href="/custom-songs/photos" style={btnSecondary}>
            ← Back
          </Link>

          <Link href="/custom-songs/thank-you" style={btnPrimary}>
            Submit →
          </Link>
        </div>

        <div style={altRow}>
          <a href={mailtoHref} style={btnOutline}>
            Email this request to Gary
          </a>
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

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 10,
};

const summaryItem: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.95)",
  padding: 12,
};

const summaryLabel: React.CSSProperties = { fontWeight: 900, opacity: 0.8, marginBottom: 4 };
const summaryValue: React.CSSProperties = { fontWeight: 900, fontSize: 16 };

const block: React.CSSProperties = { marginTop: 14 };
const blockTitle: React.CSSProperties = { fontWeight: 900, marginBottom: 6 };
const blockText: React.CSSProperties = { fontSize: 16, lineHeight: 1.35 };

const storyBox: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.95)",
  padding: 12,
  whiteSpace: "pre-wrap",
  lineHeight: 1.4,
  fontSize: 16,
};

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

const altRow: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  justifyContent: "flex-end",
};

const btnOutline: React.CSSProperties = {
  border: "2px solid #b57b17",
  color: "#111",
  background: "rgba(255,255,255,0.85)",
  padding: "10px 14px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
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
