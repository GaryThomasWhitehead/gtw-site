"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";

type PackageChoice = "song_only" | "song_video";

type OrderData = {
  packageChoice?: PackageChoice;

  name?: string;
  email?: string;
  phone?: string;

  occasion?: string;
  recipientName?: string;
  relationship?: string;
  vibe?: string;
  genre?: string;
  tempo?: string;
  mustInclude?: string;
  notes?: string;

  photoCount?: string;
  photoNotes?: string;
};

// ✅ bump key so old saved "Gary/Birthday" etc don't keep returning
const STORAGE_KEY = "customSongsOrder_v4";

// Older keys to optionally clean up
const OLD_KEYS = ["customSongsOrder_v3", "customSongsOrder_v2", "customSongsOrder_v1"];

function norm(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

// If the value is exactly one of these common "demo" defaults, clear it
function isDemoPrefill(value?: string) {
  const v = norm(value);
  return v === "gary" || v === "birthday" || v === "warm & hopeful" || v === "country";
}

function sanitize(data: OrderData): OrderData {
  const out: OrderData = { ...data };

  // clear demo-style values
  if (isDemoPrefill(out.name)) out.name = "";
  if (isDemoPrefill(out.occasion)) out.occasion = "";
  if (isDemoPrefill(out.vibe)) out.vibe = "";
  if (isDemoPrefill(out.genre)) out.genre = "";

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

export default function PhotosPage() {
  const [form, setForm] = useState<OrderData>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Optional cleanup: remove older stored versions so nothing odd restores
    try {
      OLD_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }

    const loaded = loadOrder();
    const cleaned = sanitize(loaded);

    // If sanitize changed anything, immediately persist the cleaned version
    try {
      if (JSON.stringify(loaded) !== JSON.stringify(cleaned)) {
        saveOrder(cleaned);
      }
    } catch {
      // ignore
    }

    setForm(cleaned);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveOrder(form);
  }, [form, mounted]);

  const packageChoice = useMemo<PackageChoice>(() => {
    // Don’t force a saved default; if none saved, treat as song_video for display.
    return form.packageChoice ?? "song_video";
  }, [form.packageChoice]);

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
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 120,
    resize: "vertical",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.1)",
    background: "#6b6b6b",
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

  const pillStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
    fontSize: 12,
    fontWeight: 900,
  };

  // ✅ Autofill killers:
  // - form autoComplete="off"
  // - hidden trap inputs (Chrome often fills these instead)
  // - set each input autoComplete="off" (or "new-password" for extra stubborn cases)
  const antiAutofillTrap = (
    <div style={{ position: "absolute", left: -9999, top: -9999, height: 0, width: 0, overflow: "hidden" }}>
      <input type="text" name="username" autoComplete="username" tabIndex={-1} />
      <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
    </div>
  );

  return (
    <main style={bgStyle}>
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <Link
            href="/custom-songs/genre"
            style={btnSecondary}
            onClick={() => track("CustomSongsBack", { step: 3 })}
          >
            ← Back to Options
          </Link>

          <div style={{ textAlign: "right" }}>
            <div style={{ ...pillStyle }}>CUSTOM SONGS • PHOTO MUSIC VIDEO</div>
          </div>
        </div>

        <h1 style={{ fontSize: 44, margin: "14px 0 8px" }}>Tell me about your Photo Music Video</h1>
        <p style={{ marginTop: 0, opacity: 0.9 }}>
          This option includes a custom song plus a video where your photos play beautifully as the music plays.
          Fill in what you can—if you’re not sure, just leave it blank and we’ll confirm details together.
        </p>

        {/* ✅ Wrap fields in a form with autofill off */}
        <form autoComplete="off">
          {antiAutofillTrap}

          <h3 style={{ marginTop: 18, marginBottom: 10 }}>Contact</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Your Name *</label>
              <input
                style={inputStyle}
                value={form.name ?? ""}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                name="cs_name"
                autoComplete="off"
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle}
                value={form.email ?? ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                name="cs_email"
                autoComplete="off"
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Phone (optional)</label>
            <input
              style={inputStyle}
              value={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(optional)"
              name="cs_phone"
              autoComplete="off"
            />
          </div>

          <h3 style={{ marginTop: 18, marginBottom: 10 }}>Song details</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Occasion</label>
              <input
                style={inputStyle}
                value={form.occasion ?? ""}
                onChange={(e) => update("occasion", e.target.value)}
                placeholder="Birthday, anniversary, memorial, graduation…"
                name="cs_occasion"
                autoComplete="off"
              />
            </div>

            <div>
              <label style={labelStyle}>Recipient Name</label>
              <input
                style={inputStyle}
                value={form.recipientName ?? ""}
                onChange={(e) => update("recipientName", e.target.value)}
                placeholder="Who is this for?"
                name="cs_recipient"
                autoComplete="off"
              />
            </div>

            <div>
              <label style={labelStyle}>Your Relationship to Recipient</label>
              <input
                style={inputStyle}
                value={form.relationship ?? ""}
                onChange={(e) => update("relationship", e.target.value)}
                placeholder="Father, mother, friend, spouse…"
                name="cs_relationship"
                autoComplete="off"
              />
            </div>

            <div>
              <label style={labelStyle}>Vibe / Mood</label>
              <input
                style={inputStyle}
                value={form.vibe ?? ""}
                onChange={(e) => update("vibe", e.target.value)}
                placeholder="Uplifting, heartfelt, fun, reflective…"
                name="cs_vibe"
                autoComplete="off"
              />
            </div>

            <div>
              <label style={labelStyle}>Genre</label>
              <input
                style={inputStyle}
                value={form.genre ?? ""}
                onChange={(e) => update("genre", e.target.value)}
                placeholder="Country, pop, acoustic, worship…"
                name="cs_genre"
                autoComplete="off"
              />
            </div>

            <div>
              <label style={labelStyle}>Tempo</label>
              <input
                style={inputStyle}
                value={form.tempo ?? ""}
                onChange={(e) => update("tempo", e.target.value)}
                placeholder="Slow, mid, upbeat…"
                name="cs_tempo"
                autoComplete="off"
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Must-include details or phrases</label>
            <input
              style={inputStyle}
              value={form.mustInclude ?? ""}
              onChange={(e) => update("mustInclude", e.target.value)}
              placeholder="Names, dates, places, lines, inside jokes…"
              name="cs_mustInclude"
              autoComplete="off"
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Story / notes (optional)</label>
            <textarea
              style={textareaStyle}
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Share the story, key moments, and what you want the listener to feel."
              name="cs_notes"
              autoComplete="off"
            />
          </div>

          <h3 style={{ marginTop: 18, marginBottom: 10 }}>Photos for the video</h3>

          <div style={{ marginTop: 10 }}>
            <label style={labelStyle}>Approx. number of photos</label>
            <input
              style={inputStyle}
              value={form.photoCount ?? ""}
              onChange={(e) => update("photoCount", e.target.value)}
              placeholder="Example: 25"
              inputMode="numeric"
              name="cs_photoCount"
              autoComplete="off"
            />
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
              You can change this later. I’ll guide you on the best photo count for pacing.
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Photo notes (optional)</label>
            <textarea
              style={textareaStyle}
              value={form.photoNotes ?? ""}
              onChange={(e) => update("photoNotes", e.target.value)}
              placeholder="Any photo order preferences, captions, or moments you want highlighted?"
              name="cs_photoNotes"
              autoComplete="off"
            />
          </div>
        </form>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <Link
            href="/custom-songs/review"
            style={btnPrimary}
            onClick={() => track("CustomSongsContinueToReview", { packageChoice })}
          >
            Continue to Review →
          </Link>

          <Link
            href="/custom-songs/order"
            style={btnSecondary}
            onClick={() => track("CustomSongsSkipToOrderClick", { from: "photos" })}
          >
            Skip (go to Order)
          </Link>

          <Link href="/custom-songs" style={btnSecondary}>
            Back to Options
          </Link>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Saved packageChoice: <code>{packageChoice}</code>
        </div>
      </section>
    </main>
  );
}
