"use client";

import React from "react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>✅ Thank you!</h1>

        <div style={box}>
          <div style={boxTitle}>Your request is ready.</div>
          <div style={boxText}>
            I’ll follow up by email about next steps and any details.
            <br />
            If you selected the <b>Photo Music Video</b>, we’ll make sure your photos and story
            come together in a cinematic keepsake.
          </div>
        </div>

        <div style={actions}>
          <Link href="/" style={btnSecondary}>
            Back to Home
          </Link>
          <a href="mailto:gary@example.com" style={btnPrimary}>
            Email Gary
          </a>
        </div>

        <footer style={footer}>
          <div>© {new Date().getFullYear()} Gary Thomas Whitehead</div>
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
  maxWidth: 860,
  margin: "0 auto",
  background: "rgba(255,255,255,0.92)",
  borderRadius: 18,
  padding: 24,
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 14px 34px rgba(0,0,0,.10)",
  backdropFilter: "blur(2px)",
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontSize: 38,
  margin: "10px 0 12px",
};

const box: React.CSSProperties = {
  background: "#fff6ea",
  border: "1px solid #f1d7b0",
  borderRadius: 12,
  padding: 14,
  marginTop: 12,
};

const boxTitle: React.CSSProperties = { fontWeight: 900, marginBottom: 6 };
const boxText: React.CSSProperties = { fontSize: 16, lineHeight: 1.45 };

const actions: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  justifyContent: "center",
  gap: 12,
  flexWrap: "wrap",
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

const footer: React.CSSProperties = {
  marginTop: 22,
  borderTop: "1px solid rgba(0,0,0,0.08)",
  paddingTop: 14,
  fontWeight: 900,
  color: "#333",
};
