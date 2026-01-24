"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

type PackageChoice = "song" | "song_video";

type OrderData = {
  packageChoice: PackageChoice;

  // contact
  name?: string;
  email?: string;
  phone?: string;

  // details (keep these loose so your other pages can store extra fields safely)
  occasion?: string;
  recipientName?: string;
  relationship?: string;
  style?: string;
  mood?: string;
  tempo?: string;
  references?: string;
  lyricsNotes?: string;
  notes?: string;

  // photo/video specifics
  photoCount?: number;
  photoNotes?: string;

  // misc
  [key: string]: unknown;
};

// IMPORTANT: this must match what your other custom-songs pages use.
// If you already have a STORAGE_KEY in photos/order pages, use the same exact string here.
const STORAGE_KEY = "gtw_custom_songs_order_v1";

const DEFAULT_ORDER: OrderData = {
  packageChoice: "song_video",
};

function safeParse(raw: string): Partial<OrderData> | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<OrderData>;
  } catch {
    return null;
  }
}

function loadOrder(): OrderData {
  if (typeof window === "undefined") return DEFAULT_ORDER;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ORDER;

  const parsed = safeParse(raw);
  if (!parsed) return DEFAULT_ORDER;

  // ✅ Key fix: spread FIRST, then set packageChoice once at the end
  const pc =
    parsed.packageChoice === "song" || parsed.packageChoice === "song_video"
      ? parsed.packageChoice
      : "song_video";

  return {
    ...DEFAULT_ORDER,
    ...parsed,
    packageChoice: pc,
  };
}

function saveOrder(next: OrderData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function ReviewPage() {
  const [order, setOrder] = useState<OrderData>(DEFAULT_ORDER);

  useEffect(() => {
    const loaded = loadOrder();
    setOrder(loaded);
  }, []);

  const packageLabel = useMemo(() => {
    return order.packageChoice === "song_video"
      ? "Photo Music Video"
      : "Custom Song";
  }, [order.packageChoice]);

  function onConfirm() {
    // make sure packageChoice is valid and saved cleanly
    const cleaned: OrderData = {
      ...order,
      packageChoice:
        order.packageChoice === "song" || order.packageChoice === "song_video"
          ? order.packageChoice
          : "song_video",
    };

    saveOrder(cleaned);
    track("CustomSongsReviewConfirm", { package: cleaned.packageChoice });

    // send them to thank-you (your flow already has this route)
    window.location.href = "/custom-songs/thank-you";
  }

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    textDecoration: "none",
    background: "#111",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
  };

  const btnSecondary: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    textDecoration: "none",
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    cursor: "pointer",
    boxShadow: "0 1px 0 rgba(0,0,0,.04), 0 8px 16px rgba(0,0,0,.04)",
  };

  const label: React.CSSProperties = {
    fontSize: 12,
    letterSpacing: ".08em",
    color: "#7a7a7a",
    margin: 0,
  };

  const h1: React.CSSProperties = {
    margin: "8px 0 14px",
    fontSize: 28,
    lineHeight: 1.15,
  };

  const row: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  };

  const item: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
    background: "#fafafa",
  };

  const k: React.CSSProperties = { fontSize: 12, color: "#666", margin: 0 };
  const v: React.CSSProperties = {
    margin: "4px 0 0",
    fontWeight: 800,
    color: "#111",
  };

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "24px 18px",
        fontFamily: '"Georgia", "Times New Roman", serif',
        color: "#111",
        background: "#faf9f6",
        lineHeight: 1.6,
      }}
    >
      <section style={card}>
        <p style={label}>CUSTOM SONGS</p>
        <h1 style={h1}>Review your request</h1>

        <div style={row}>
          <div style={item}>
            <p style={k}>Package</p>
            <p style={v}>{packageLabel}</p>
          </div>

          <div style={item}>
            <p style={k}>Name</p>
            <p style={v}>{order.name || "—"}</p>
          </div>

          <div style={item}>
            <p style={k}>Email</p>
            <p style={v}>{order.email || "—"}</p>
          </div>

          <div style={item}>
            <p style={k}>Phone</p>
            <p style={v}>{order.phone || "—"}</p>
          </div>
        </div>

        <div style={{ marginTop: 14, ...item }}>
          <p style={k}>Occasion</p>
          <p style={v}>{order.occasion || "—"}</p>
        </div>

        <div style={{ marginTop: 14, ...item }}>
          <p style={k}>Notes</p>
          <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>
            {(order.notes as string) || (order.lyricsNotes as string) || "—"}
          </p>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <button onClick={onConfirm} style={btnPrimary}>
            Confirm &amp; Continue →
          </button>

          <Link
            href="/custom-songs/photos"
            style={btnSecondary}
            onClick={() => track("CustomSongsReviewBackToPhotos")}
          >
            ← Back to Photos
          </Link>

          <Link
            href="/custom-songs/order"
            style={btnSecondary}
            onClick={() => track("CustomSongsReviewBackToOrder")}
          >
            Back to Order
          </Link>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
          Storage key: <code>{STORAGE_KEY}</code> • packageChoice:{" "}
          <code>{order.packageChoice}</code>
        </div>
      </section>
    </main>
  );
}
