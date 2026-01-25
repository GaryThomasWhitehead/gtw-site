"use client";

import Link from "next/link";
import React from "react";

type Props = {
  badge?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

export default function CustomSongsShell({
  badge = "CUSTOM SONGS",
  title,
  subtitle,
  backHref = "/custom-songs",
  backLabel = "← Back to Custom Songs",
  rightSlot,
  children,
}: Props) {
  const bgStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundImage: "url('/backgrounds/custom-songs-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "44px 16px",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 18,
    padding: 28,
    boxShadow: "0 16px 52px rgba(0,0,0,0.20)",
    fontFamily: '"Georgia","Times New Roman",serif',
    color: "#111",
    backdropFilter: "blur(7px)",
  };

  const pillStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: ".10em",
    background: "rgba(255,255,255,0.80)",
    textTransform: "uppercase",
  };

  const backStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    color: "#111",
    fontWeight: 900,
    textDecoration: "none",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 50,
    lineHeight: 1.03,
    margin: "14px 0 10px",
    letterSpacing: "-0.02em",
    fontWeight: 950,
    textShadow: "0 1px 0 rgba(255,255,255,.75)",
  };

  const subtitleStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: 18,
    fontSize: 19,
    lineHeight: 1.8,
    fontWeight: 800,
    color: "#1a1a1a",
    maxWidth: 980,
  };

  return (
    <main style={bgStyle}>
      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link href={backHref} style={backStyle}>
            {backLabel}
          </Link>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={pillStyle}>{badge}</div>
            {rightSlot}
          </div>
        </div>

        <h1 style={titleStyle}>{title}</h1>
        {subtitle ? <p style={subtitleStyle}>{subtitle}</p> : null}

        {children}
      </section>
    </main>
  );
}
