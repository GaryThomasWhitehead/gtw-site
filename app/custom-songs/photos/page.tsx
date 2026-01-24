"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";

type PackageChoice = "song" | "song_video";

type OrderData = {
  packageChoice: PackageChoice;

  // contact
  name?: string;
  email?: string;
  phone?: string;

  // song details
  occasion?: string;
  recipientName?: string;
  relationship?: string;
  vibe?: string;
  genre?: string;
  tempo?: string;
  mustInclude?: string;
  notes?: string;

  // photo video details
  photoCount?: number;
  photoNotes?: string;

  // misc
  createdAt?: string;
};

const STORAGE_KEY = "gtw_custom_song_order_v1";
const PACKAGE: PackageChoice = "song_video";

function readOrder(): OrderData {
  if (typeof window === "undefined") return { packageChoice: PACKAGE };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { packageChoice: PACKAGE };

    const parsed = JSON.parse(raw) as Partial<OrderData>;

    // IMPORTANT: spread first, then force packageChoice (prevents duplicate key build error)
    return { ...(parsed as OrderData), packageChoice: PACKAGE };
  } catch {
    return { packageChoice: PACKAGE };
  }
}

function saveOrder(next: OrderData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function PhotosPage() {
  const [form, setForm] = useState<OrderData>({ packageChoice: PACKAGE });

  useEffect(() => {
    const existing = readOrder();
    // ensure the package is locked to song_video for this flow
    setForm({ ...existing, packageChoice: PACKAGE });
  }, []);

  const canContinue = useMemo(() => {
    // minimal requirements (adjust if you want stricter)
    const emailOk = (form.email || "").trim().length > 3;
    const nameOk = (form.name || "").trim().length > 1;
    return emailOk && nameOk;
  }, [form.email, form.name]);

  function update<K extends keyof OrderData>(key: K, value: OrderData[K]) {
    setForm((prev) => {
      const next: OrderData = { ...prev, [key]: value, packageChoice: PACKAGE };
      saveOrder(next); // autosave on every change
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: OrderData = {
      ...form,
      packageChoice: PACKAGE,
      createdAt: new Date().toISOString(),
    };

    saveOrder(payload);
    track("CustomSongsPhotosSubmit", { package: PACKAGE });

    // go to review page
    window.location.href = "/custom-songs/review";
  }

  const page: React.CSSProperties = {
    background: "#faf9f6",
    minHeight: "100vh",
    padding: "26px 18px",
    fontFamily: '"Georgia","Times New Roman",serif',
    color: "#111",
  };

  const card: React.CSSProperties = {
    maxWidth: 980,
    margin: "0 auto",
    padding: "22px 22px",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 14,
    boxShadow: "0 8px 22px rgba(0,0,0,0.06)",
  };

  const eyebrow: React.CSSProperties = {
    fontSize: 13,
    letterSpacing: ".08em",
    color: "#7a7a7a",
    fontWeight: 800,
    marginBottom: 6,
  };

  const h1: React.CSSProperties = {
    fontSize: 28,
    margin: "0 0 8px",
  };

  const sub: React.CSSProperties = {
    margin: "0 0 16px",
    color: "#555",
    lineHeight: 1.6,
  };

  const sectionTitle: React.CSSProperties = {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 900,
    color: "#111",
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 800,
    color: "#333",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 15,
    background: "#fff",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 110,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 15,
    background: "#fff",
    resize: "vertical",
  };

  const btnRow: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
    alignItems: "center",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 900,
    textDecoration: "none",
    background: "#111",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 10px 18px rgba(0,0,0,.08)",
  };

  const btnPrimaryDisabled: React.CSSProperties = {
    ...btnPrimary,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const btnSecondary: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 900,
    textDecoration: "none",
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    boxShadow: "0 1px 0 rgba(0,0,0,.04)",
  };

  const helper: React.CSSProperties = {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    lineHeight: 1.5,
  };

  return (
    <main style={page}>
      <section style={card}>
        <div style={eyebrow}>CUSTOM SONGS • PHOTO MUSIC VIDEO</div>
        <h1 style={h1}>Tell me about your Photo Music Video</h1>
        <p style={sub}>
          This option includes a custom song plus a video where your photos play
          beautifully as the music plays. Fill in what you can—if you’re not
          sure, just leave it blank and we’ll confirm details together.
        </p>

        <form onSubmit={onSubmit}>
          <div style={sectionTitle}>Contact</div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Your Name *</label>
              <input
                style={inputStyle}
                value={form.name || ""}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle}
                value={form.email || ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                type="email"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Phone (optional)</label>
              <input
                style={inputStyle}
                value={form.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(optional)"
              />
            </div>
          </div>

          <div style={sectionTitle}>Song details</div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Occasion</label>
              <input
                style={inputStyle}
                value={form.occasion || ""}
                onChange={(e) => update("occasion", e.target.value)}
                placeholder="Birthday, anniversary, memorial, graduation…"
              />
            </div>

            <div>
              <label style={labelStyle}>Recipient Name</label>
              <input
                style={inputStyle}
                value={form.recipientName || ""}
                onChange={(e) => update("recipientName", e.target.value)}
                placeholder="Who is this for?"
              />
            </div>

            <div>
              <label style={labelStyle}>Your Relationship to Recipient</label>
              <input
                style={inputStyle}
                value={form.relationship || ""}
                onChange={(e) => update("relationship", e.target.value)}
                placeholder="Father, mother, friend, spouse…"
              />
            </div>

            <div>
              <label style={labelStyle}>Vibe / Mood</label>
              <input
                style={inputStyle}
                value={form.vibe || ""}
                onChange={(e) => update("vibe", e.target.value)}
                placeholder="Uplifting, heartfelt, fun, reflective…"
              />
            </div>

            <div>
              <label style={labelStyle}>Genre</label>
              <input
                style={inputStyle}
                value={form.genre || ""}
                onChange={(e) => update("genre", e.target.value)}
                placeholder="Country, pop, acoustic, worship…"
              />
            </div>

            <div>
              <label style={labelStyle}>Tempo</label>
              <input
                style={inputStyle}
                value={form.tempo || ""}
                onChange={(e) => update("tempo", e.target.value)}
                placeholder="Slow, mid, upbeat…"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Must-include details or phrases</label>
              <input
                style={inputStyle}
                value={form.mustInclude || ""}
                onChange={(e) => update("mustInclude", e.target.value)}
                placeholder="Names, dates, places, lines, inside jokes…"
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Story / notes (optional)</label>
              <textarea
                style={textareaStyle}
                value={form.notes || ""}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Share the story, key moments, and what you want the listener to feel."
              />
            </div>
          </div>

          <div style={sectionTitle}>Photos for the video</div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Approx. number of photos</label>
              <input
                style={inputStyle}
                value={form.photoCount?.toString() || ""}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  update("photoCount", Number.isFinite(n) ? n : undefined);
                }}
                placeholder="Example: 25"
                inputMode="numeric"
              />
              <div style={helper}>
                You can change this later. I’ll guide you on the best photo
                count for pacing.
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Photo notes (optional)</label>
              <textarea
                style={textareaStyle}
                value={form.photoNotes || ""}
                onChange={(e) => update("photoNotes", e.target.value)}
                placeholder="Any photo order preferences, captions, or moments you want highlighted?"
              />
            </div>
          </div>

          <div style={btnRow}>
            <button
              type="submit"
              style={canContinue ? btnPrimary : btnPrimaryDisabled}
              disabled={!canContinue}
              onClick={() => track("CustomSongsPhotosContinueClick", { package: PACKAGE })}
            >
              Continue to Review →
            </button>

            <Link
              href="/custom-songs/order"
              style={btnSecondary}
              onClick={() => track("CustomSongsSkipToOrderClick", { from: "photos", package: PACKAGE })}
            >
              Skip (go to Order)
            </Link>

            <Link
              href="/custom-songs"
              style={btnSecondary}
              onClick={() => track("CustomSongsBackToLandingClick", { from: "photos" })}
            >
              Back to Options
            </Link>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Saved packageChoice: <code>{PACKAGE}</code>
          </div>
        </form>
      </section>
    </main>
  );
}
