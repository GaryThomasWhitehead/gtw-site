"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PackageType = "song+video" | "song";

const LS_KEY = "gtw_custom_song_order_v1";

export default function CustomSongsStartPage() {
  const router = useRouter();
  const [pkg, setPkg] = useState<PackageType>("song+video");
  const [forWho, setForWho] = useState("Myself / Someone I Love");
  const [name, setName] = useState("Gary");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved?.pkg) setPkg(saved.pkg);
      if (saved?.forWho) setForWho(saved.forWho);
      if (saved?.name) setName(saved.name);
      if (saved?.email) setEmail(saved.email);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        pkg,
        forWho,
        name,
        email,
      })
    );
  }, [pkg, forWho, name, email]);

  const selectionBanner = useMemo(() => {
    if (pkg === "song+video") {
      return {
        title: "You selected: Song + Photo Music Video",
        body:
          "Most services do custom songs. The Photo Music Video is the unique add-on that makes it unforgettable.",
      };
    }
    return {
      title: "You selected: Song Only",
      body:
        "A meaningful custom song, written from your story and delivered ready to share.",
    };
  }, [pkg]);

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={topRow}>
          <Link href="/" style={backLink}>
            ← Back to Home
          </Link>
          <div style={rightMiniNav}>
            <Link href="/" style={miniLink}>
              Home
            </Link>
          </div>
        </div>

        <div style={progressRow}>
          <div style={stepPill}>Step 1 of 5</div>
          <div style={progressMeta}>20% Complete</div>
        </div>

        <h1 style={titleStyle}>
          <span style={{ marginRight: 10 }}>🎵</span>
          Turn Your Story Into a Custom Song
        </h1>

        <div style={headlineBar}>
          <div style={headlineBarText}>
            Most custom song services stop at audio — I also create personalized{" "}
            <span style={{ color: ACCENT_SOFT }}>Photo Music Videos</span> where
            your pictures play beautifully while your song plays.
          </div>
        </div>

        <div style={selectionBox}>
          <div style={selectionTitle}>⭐ {selectionBanner.title}</div>
          <div style={selectionBody}>{selectionBanner.body}</div>
        </div>

        <label style={labelStyle}>Choose your package *</label>
        <div style={pillRow}>
          <button
            type="button"
            onClick={() => setPkg("song+video")}
            style={pillStyle(pkg === "song+video")}
          >
            🎬 Song + Photo Music Video
          </button>
          <button
            type="button"
            onClick={() => setPkg("song")}
            style={pillStyle(pkg === "song")}
          >
            🎧 Song Only
          </button>
        </div>

        <div style={twoCol}>
          <div style={featureCard}>
            <div style={featureTitle}>✍️ Custom Song</div>
            <div style={featureText}>
              A heartfelt song written from your story — perfect for love,
              birthdays, memorials, faith inspiration, or meaningful gifts.
            </div>
          </div>

          <div style={{ ...featureCard, border: `1px solid ${ACCENT}` }}>
            <div style={featureTitle}>✨ Photo Music Video (Signature Feature)</div>
            <div style={featureText}>
              Your photos appear in a cinematic music video synced to the lyrics
              and emotion. This is the standout feature most competitors{" "}
              <b>do not offer</b>.
            </div>
          </div>
        </div>

        <div style={formGrid}>
          <div>
            <label style={labelStyle}>Who’s this for? *</label>
            <input
              value={forWho}
              onChange={(e) => setForWho(e.target.value)}
              style={inputStyle}
              placeholder="Myself / Someone I Love"
            />
          </div>

          <div>
            <label style={labelStyle}>What’s your name? *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Your name"
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Your email address *</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="you@email.com"
              inputMode="email"
            />
            <div style={hintText}>
              Tip: add any pronunciation notes in the story section on the next
              step.
            </div>
          </div>
        </div>

        <div style={navRow}>
          <span />
          <button
            type="button"
            onClick={() => router.push("/custom-songs/order")}
            style={btnPrimary}
          >
            Next →
          </button>
        </div>

        <footer style={footer}>
          <div style={{ marginBottom: 6 }}>© {new Date().getFullYear()} Gary Thomas Whitehead</div>
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

const ACCENT = "#b57b17";
const ACCENT_SOFT = "#ffd18a";

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
  backdropFilter: "saturate(1.1)",
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

const rightMiniNav: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
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
  fontSize: 40,
  lineHeight: 1.1,
  margin: "6px 0 12px",
  letterSpacing: -0.3,
};

const headlineBar: React.CSSProperties = {
  background: "#111",
  color: "#fff",
  borderRadius: 12,
  padding: "14px 16px",
  marginBottom: 14,
};

const headlineBarText: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 800,
  lineHeight: 1.35,
};

const selectionBox: React.CSSProperties = {
  background: "rgba(255, 241, 220, 0.65)",
  border: "1px solid rgba(181,123,23,0.30)",
  borderRadius: 12,
  padding: "12px 14px",
  marginBottom: 12,
};

const selectionTitle: React.CSSProperties = { fontWeight: 900, marginBottom: 4 };
const selectionBody: React.CSSProperties = { fontSize: 16, lineHeight: 1.4 };

const labelStyle: React.CSSProperties = {
  fontWeight: 900,
  marginTop: 14,
  display: "block",
  fontSize: 16,
};

const pillRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 10,
  marginBottom: 12,
};

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 16px",
    borderRadius: 999,
    border: active ? `2px solid ${ACCENT}` : "1px solid rgba(0,0,0,0.25)",
    background: active ? "rgba(255, 247, 234, 0.95)" : "rgba(255,255,255,0.90)",
    fontWeight: 900,
    cursor: "pointer",
  };
}

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginTop: 8,
  marginBottom: 14,
};

const featureCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 14,
  padding: 14,
};

const featureTitle: React.CSSProperties = { fontWeight: 900, marginBottom: 6, fontSize: 16 };
const featureText: React.CSSProperties = { fontSize: 15, lineHeight: 1.45 };

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 10,
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

const hintText: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  color: "#333",
  fontWeight: 700,
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

const footer: React.CSSProperties = {
  marginTop: 20,
  borderTop: "1px solid rgba(0,0,0,0.08)",
  paddingTop: 12,
  textAlign: "center",
  fontWeight: 900,
  color: "#222",
};

const footerSmall: React.CSSProperties = {
  fontWeight: 700,
  marginTop: 2,
  color: "#333",
};

const footerLink: React.CSSProperties = {
  color: "#111",
  fontWeight: 900,
  textDecoration: "underline",
};
