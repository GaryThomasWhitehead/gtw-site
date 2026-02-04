"use client";

import Link from "next/link";
import React, { type CSSProperties } from "react";
import MoreMenu from "@/components/MoreMenu";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  badge?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;

  // ✅ NEW (optional): lets a page override the hero background image
  heroImage?: string; // e.g. "/header.png"
};

export default function CustomSongsShell({
  title,
  subtitle,
  backHref = "/",
  badge,
  rightSlot,
  children,
  heroImage,
}: Props) {
  const pageBg = "url('/backgrounds/guitar-bokeh.jpg')"; // your existing page bg
  const heroBg = `url('${heroImage || "/backgrounds/guitar-bokeh.jpg"}')`; // ✅ override if provided

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
    backgroundImage: heroBg,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
    border: "1px solid rgba(0,0,0,0.10)",
  };

  const chromeBar: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 14,
  };

  const backBtn: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.82)",
    fontWeight: 900,
    textDecoration: "none",
    color: "#111",
  };

  const badgePill: CSSProperties = {
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: ".14em",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.70)",
  };

  const titleWrap: CSSProperties = {
    marginTop: 10,
    borderRadius: 18,
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(0,0,0,0.10)",
    padding: 18,
  };

  return (
    <main style={pageWrap}>
      <div style={hero}>
        <div style={chromeBar}>
          <Link href={backHref} style={backBtn}>
            ← Back to Custom Songs
          </Link>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {badge ? <div style={badgePill}>{badge}</div> : null}
            <MoreMenu />
            {rightSlot}
          </div>
        </div>

        <div style={titleWrap}>
          <h1 style={{ fontSize: 44, margin: "0 0 6px", lineHeight: 1.05 }}>
            {title}
          </h1>

          {subtitle ? (
            <p style={{ margin: 0, fontWeight: 800, color: "rgba(0,0,0,0.72)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>

        <div style={{ marginTop: 14 }}>{children}</div>
      </div>
    </main>
  );
}
