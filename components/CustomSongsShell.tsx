"use client";

import Link from "next/link";
import React from "react";
import MoreMenu from "@/components/MoreMenu";

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
    padding: 30,
    boxShadow: "0 16px 52px rgba(0,0,0,0.20)",
    fontFamily: '"Georgia","Times New Roman",serif',
    color: "#111",
    backdropFilter: "blur(3px)",
  };

  const topRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  };

  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.70)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: ".12em",
  };

  const backLink: React.CSSProperties = {
    fontWeight: 900,
    textDecoration: "none",
    color: "#111",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  };

  const h1: React.CSSProperties = {
    fontSize: 46,
    margin: "10px 0 6px",
    lineHeight: 1.08,
    fontWeight: 900,
    letterSpacing: "-0.02em",
  };

  const sub: React.CSSProperties = {
    marginTop: 0,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.65,
    color: "#222",
    maxWidth: 900,
    textShadow: "0 1px 0 rgba(255,255,255,0.4)",
  };

  const divider: React.CSSProperties = {
    height: 1,
    background: "rgba(0,0,0,0.10)",
    margin: "18px 0 22px",
  };

  return (
    <main style={bgStyle}>
      <section style={cardStyle}>
        <div style={topRow}>
          <Link href={backHref} style={backLink}>
            {backLabel}
          </Link>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={pill}>{badge}</div>

            {/* ✅ This is the dropdown */}
            <MoreMenu />

            {rightSlot}
          </div>
        </div>

        <h1 style={h1}>{title}</h1>
        {subtitle ? <p style={sub}>{subtitle}</p> : null}

        <div style={divider} />
        {children}
      </section>
    </main>
  );
}
