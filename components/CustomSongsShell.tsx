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
  heroImage?: string;
  bannerImage?: string;
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
    padding: "0 32px 32px 32px",
    fontFamily: '"Georgia", "Times New Roman", serif',
    color: "#111",
    backgroundColor: "#faf9f6",
    lineHeight: 1.6,
  };

  const bannerStyle: CSSProperties = {
    width: "100vw",
    height: "280px",                        // reduced banner height
    marginLeft: "calc(-50vw + 50%)",
    marginRight: "calc(-50vw + 50%)",
    backgroundImage: bannerImage ? `url('${bannerImage}')` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    marginBottom: 24,
  };

  const hero: CSSProperties = {
    backgroundImage: heroBg ? `url('${heroBg}')` : undefined,  // completely clear - no gradient/tint
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "380px",
    borderRadius: 18,
    padding: "40px 28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    border: "1px solid rgba(0,0,0,0.08)",
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
    marginTop: 12,
    borderRadius: 16,
    background: "rgba(255,255,255, 0.18)",   // very low opacity - guitar clearly visible
    border: "1px solid rgba(255,255,255,0.25)",
    padding: "20px 32px",
    backdropFilter: "blur(18px)",            // strong glass effect
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
  };

  return (
    <main style={pageWrap}>
      {bannerImage && <div style={bannerStyle} />}

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
              fontSize: 36,                    // reduced title size
              margin: "0 0 8px",
              lineHeight: 1.1,
              color: "#111",
              textShadow: "0 2px 10px rgba(0,0,0,0.45)",
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 16,                  // reduced subtitle size
                color: "rgba(0,0,0,0.95)",
                textShadow: "0 1px 6px rgba(0,0,0,0.35)",
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