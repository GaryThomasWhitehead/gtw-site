"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

type PackageChoice = "song_only" | "song_video";

type OrderData = {
  packageChoice?: PackageChoice;
  name?: string;
  email?: string;
  phone?: string;

  occasion?: string;
  vibe?: string;
  notes?: string;
};

const STORAGE_KEY = "customSongsOrder_v3";

function sanitize(data: OrderData): OrderData {
  const out: OrderData = { ...data };

  if (out.name?.trim().toLowerCase() === "gary") out.name = "";
  if (out.occasion?.trim().toLowerCase() === "birthday") out.occasion = "";
  if (out.vibe?.trim().toLowerCase() === "warm & hopeful") out.vibe = "";

  return out;
}

function loadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitize(JSON.parse(raw) as OrderData);
  } catch {
    return {};
  }
}

function saveOrder(next: OrderData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function GenrePage() {
  const [form, setForm] = useState<OrderData>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setForm(loadOrder());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveOrder(form);
  }, [form, mounted]);

  function update<K extends keyof OrderData>(key: K, value: OrderData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const bgStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundImage: "url('/backgrounds/custom-songs-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "40px 16px",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: 980,
    margin: "0 auto",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    fontFamily: '"Georgia","Times New Roman",serif',
    color: "#111",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 800,
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 160,
    resize: "vertical",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "#b57b17",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    cursor: "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#111",
    fontWeight: 900,
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <main style={bgStyle}>
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <Link href="/custom-songs" style={btnSecondary} onClick={() => track("CustomSongsBack", { step: 2 })}>
            ← Back to Options
          </Link>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 900 }}>Home</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>40% Complete</div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "inline-block", padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.12)", fontSize: 12, fontWeight: 900 }}>
          Step 2 of 5
        </div>

        <h1 style={{ fontSize: 44, margin: "14px 0 10px" }}>Let’s shape the song</h1>

        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Occasion *</label>
          <input
            style={inputStyle}
            value={form.occasion ?? ""}
            onChange={(e) => update("occasion", e.target.value)}
            placeholder="Birthday, anniversary, memorial, graduation…"
            autoComplete="off"
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Mood / vibe *</label>
          <input
            style={inputStyle}
            value={form.vibe ?? ""}
            onChange={(e) => update("vibe", e.target.value)}
            placeholder="Warm & hopeful, funny, tearjerker, worshipful…"
            autoComplete="off"
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={labelStyle}>Your story (the more detail, the better) *</label>
          <textarea
            style={textareaStyle}
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Names, relationship, key memories, phrases you want included, what you want them to feel when they hear it..."
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
          <Link href="/custom-songs" style={btnSecondary}>
            ← Back
          </Link>

          <Link
            href="/custom-songs/photos"
            style={btnPrimary}
            onClick={() => track("CustomSongsNext", { step: 2 })}
          >
            Next →
          </Link>
        </div>
      </section>
    </main>
  );
}
