"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CustomSongsShell from "@/components/CustomSongsShell";
import TrackedLink from "@/components/TrackedLink";

type PackageChoice =
  | "song_audio"
  | "song_audio_lyrics"
  | "video"
  | "video_lyrics"
  | "everything_bundle";

type OrderData = {
  packageChoice?: PackageChoice;

  name?: string;
  email?: string;
  phone?: string;

  occasion?: string;
  recipientName?: string;
  relationship?: string;
  mustInclude?: string;
  notes?: string;

  genre?: string;
  vibe?: string;
  tempo?: string;

  photoCount?: string;
  photoNotes?: string;
};

const STORAGE_KEY = "customSongsOrder_v4";

function loadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as OrderData;
  } catch {
    return {};
  }
}

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const PACKAGE_INFO: Record<PackageChoice, { title: string; price: number }> = {
  song_audio: { title: "Custom Song (Audio)", price: 249 },
  song_audio_lyrics: { title: "Custom Song + Printable Lyrics Sheet", price: 279 },
  video: { title: "Custom Song + Photo Music Video", price: 499 },
  video_lyrics: { title: "Photo Music Video + Printable Lyrics Sheet", price: 529 },
  everything_bundle: { title: "Everything Bundle", price: 599 },
};

function isVideoPackage(choice?: PackageChoice) {
  return choice === "video" || choice === "video_lyrics" || choice === "everything_bundle";
}

export default function ReviewPage() {
  const [data, setData] = useState<OrderData>({});

  useEffect(() => setData(loadOrder()), []);

  const pkgLine = useMemo(() => {
    const c = data.packageChoice;
    if (!c) return "Package: —";
    const info = PACKAGE_INFO[c];
    return info ? `Package: ${info.title} (${money(info.price)})` : `Package: ${c}`;
  }, [data.packageChoice]);

  const lines = useMemo(() => {
    const d = data;
    const parts: string[] = [];

    parts.push(pkgLine);
    parts.push(`Name: ${d.name ?? ""}`);
    parts.push(`Email: ${d.email ?? ""}`);
    parts.push(`Phone: ${d.phone ?? ""}`);
    parts.push(`Occasion: ${d.occasion ?? ""}`);
    parts.push(`Recipient: ${d.recipientName ?? ""}`);
    parts.push(`Relationship: ${d.relationship ?? ""}`);
    parts.push(`Genre: ${d.genre ?? ""}`);
    parts.push(`Vibe: ${d.vibe ?? ""}`);
    parts.push(`Tempo: ${d.tempo ?? ""}`);
    parts.push(`Must include: ${d.mustInclude ?? ""}`);
    parts.push(`Story/Notes: ${d.notes ?? ""}`);

    if (isVideoPackage(d.packageChoice)) {
      parts.push(`Photo count: ${d.photoCount ?? ""}`);
      parts.push(`Photo notes: ${d.photoNotes ?? ""}`);
    } else {
      parts.push(`Photo count:`);
      parts.push(`Photo notes:`);
    }

    return parts;
  }, [data, pkgLine]);

  const box: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.78)",
    padding: 18,
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
  };

  const row: React.CSSProperties = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 16,
  };

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
  };

  const btnAlt: React.CSSProperties = { ...btn, background: "#b57b17" };

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("Custom Song Request");
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:garys_new_music@yahoo.com?subject=${subject}&body=${body}`;
  }, [lines]);

  return (
    <CustomSongsShell
      title="Review Your Request"
      subtitle="Check everything looks right. Then send it to me — I’ll confirm details and next steps."
      backHref="/custom-songs/order"
      backLabel="← Back to Order"
      badge="REVIEW"
    >
      <div style={box}>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontSize: 14,
            lineHeight: 1.7,
            fontWeight: 700,
          }}
        >
          {lines.join("\n")}
        </pre>
      </div>

      <div style={row}>
        <TrackedLink href={mailto} style={btnAlt} eventName="CustomSongsSendEmail">
          Send Request by Email →
        </TrackedLink>

        <Link href="/custom-songs/order" style={btn}>
          Edit Order
        </Link>

        <Link href="/custom-songs/photos" style={btn}>
          Edit Photos
        </Link>

        <Link href="/custom-songs/thank-you" style={btn}>
          Continue →
        </Link>
      </div>
    </CustomSongsShell>
  );
}
