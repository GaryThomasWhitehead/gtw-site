"use client";

import Link from "next/link";
import React, { type CSSProperties } from "react";
import MoreMenu from "@/components/MoreMenu";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  badge?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  heroImage?: string; // e.g. "/header.png"
};

export default function CustomSongsShell({
  title,
  subtitle,
  backHref = "/",
  backLabel = "← Back to Custom Songs",
  badge,
  rightSlot,
  children,
  heroImage,
}: Props) {
  const heroBg = `url('${heroImage || "/backgrounds/guitar-bokeh.jpg"}')`;

  const pageWrap: CSSProperties = {
    maxWidth: "1360px",
    margin: "0 auto",
    padding: "24px 32px",
    fontFamily: '"Georgia", "Times New Roman", serif',
    color: "#111",
    backgroundColor: "#faf9f6",
    lineHeight: 1.6,
  };

  const hero: CSSProperties = {
    backgroundImage: `linear-gradient(rgba(0,0,0,0.20), rgba(0,0,0,0.40)), ${heroBg}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "420px",                     // taller banner area
    borderRadius: 18,
    padding: "40px 28px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
    border: "1px solid rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  };

  const chromeBar: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 24,
  };

  const backBtn: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(255,255,255,0.88)",
    fontWeight: 900,
    textDecoration: "none",
    color: "#111",
  };

  const badgePill: CSSProperties = {
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: ".14em",
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.16)",
    background: "rgba(255,255,255,0.80)",
  };

  const titleWrap: CSSProperties = {
    marginTop: 8,
    borderRadius: 16,
    background: "rgba(255,255,255, 0.50)",   // transparent enough to see banner
    border: "1px solid rgba(0,0,0,0.15)",
    padding: "28px 36px",
    backdropFilter: "blur(12px)",            // glass effect – banner shines through
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  };

  return (
    <main style={pageWrap}>
      <div style={hero}>
        <div style={chromeBar}>
          {backHref && (
            <Link href={backHref} style={backBtn}>
              {backLabel}
            </Link>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {badge ? <div style={badgePill}>{badge}</div> : null}
            <MoreMenu />
            {rightSlot}
          </div>
        </div>

        <div style={titleWrap}>
          <h1
            style={{
              fontSize: 48,
              margin: "0 0 10px",
              lineHeight: 1.05,
              color: "#111",
              textShadow: "0 2px 12px rgba(0,0,0,0.55)",
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 18,
                color: "rgba(0,0,0,0.95)",
                textShadow: "0 1px 6px rgba(0,0,0,0.45)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ marginTop: 32 }}>{children}</div>
      </div>
    </main>
  );
}