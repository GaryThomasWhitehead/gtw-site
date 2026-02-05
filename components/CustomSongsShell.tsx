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
  heroImage?: string;     // optional background for content area
  bannerImage?: string;   // full-width banner at the very top
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
  bannerImage,
}: Props) {
  const heroBg = heroImage ? `url('${heroImage}')` : undefined;

  const pageWrap: CSSProperties = {
    maxWidth: "1360px",
    margin: "0 auto",
    padding: "0 32px 32px 32px",  // no top padding – banner takes that space
    fontFamily: '"Georgia", "Times New Roman", serif',
    color: "#111",
    backgroundColor: "#faf9f6",
    lineHeight: 1.6,
  };

  const hero: CSSProperties = {
    backgroundImage: heroBg ? `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.25)), ${heroBg}` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: 18,
    padding: "32px 28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    border: "1px solid rgba(0,0,0,0.10)",
  };

  const chromeBar: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 20,
  };

  const backBtn: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(255,255,255,0.90)",
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
    background: "rgba(255,255,255,0.85)",
  };

  const titleWrap: CSSProperties = {
    marginTop: 8,
    borderRadius: 16,
    background: heroBg ? "rgba(255,255,255, 0.70)" : "rgba(255,255,255, 0.92)",
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "24px 32px",
    backdropFilter: heroBg ? "blur(6px)" : undefined,
  };

  return (
    <main style={pageWrap}>
      {bannerImage && (
        <div
          style={{
            width: "100vw",
            height: "320px",                        // change this number to make banner taller/shorter
            marginLeft: "calc(-50vw + 50%)",        // centers full-width banner
            marginRight: "calc(-50vw + 50%)",
            backgroundImage: `url('${bannerImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        />
      )}

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
              textShadow: heroBg ? "0 2px 10px rgba(0,0,0,0.5)" : undefined,
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
                color: heroBg ? "rgba(0,0,0,0.95)" : "#222",
                textShadow: heroBg ? "0 1px 6px rgba(0,0,0,0.4)" : undefined,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ marginTop: 28 }}>{children}</div>
      </div>
    </main>
  );
}