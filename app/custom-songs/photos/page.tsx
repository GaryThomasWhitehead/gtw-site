"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import CustomSongsShell from "@/components/CustomSongsShell";
import { loadOrder, saveOrder, OrderData, PackageChoice } from "@/lib/customSongsStore";

export default function PhotosPage() {
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

  const packageChoice = useMemo<PackageChoice>(() => form.packageChoice ?? "song_video", [form.packageChoice]);

  function update<K extends keyof OrderData>(key: K, value: OrderData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const labelStyle: React.CSSProperties = { display: "block", fontWeight: 900, marginBottom: 6, fontSize: 15 };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.16)",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    fontWeight: 700,
  };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 130, resize: "vertical" };

  const sectionH: React.CSSProperties = { marginTop: 18, marginBottom: 10, fontSize: 22, fontWeight: 900 };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
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
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.90)",
    color: "#111",
    fontWeight: 900,
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS • PHOTO MUSIC VIDEO"
      title="Tell me about your Photo Music Video"
      subtitle="This includes a custom song plus a video where your photos play beautifully as the music plays. Fill in what you can — if you’re not sure, leave it blank and we’ll confirm details together."
      backHref="/custom-songs/genre"
      backLabel="← Back to Options"
    >
      <form autoComplete="off">
        <h3 style={sectionH}>Contact</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input
              style={inputStyle}
              value={form.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your name"
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
            autoComplete="off"
          />
        </div>

        <h3 style={sectionH}>Song details</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Occasion</label>
            <input
              style={inputStyle}
              value={form.occasion ?? ""}
              onChange={(e) => update("occasion", e.target.value)}
              placeholder="Birthday, anniversary, memorial, graduation…"
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
          />
        </div>

        <h3 style={sectionH}>Photos for the video</h3>

        <div style={{ marginTop: 10 }}>
          <label style={labelStyle}>Approx. number of photos</label>
          <input
            style={inputStyle}
            value={form.photoCount ?? ""}
            onChange={(e) => update("photoCount", e.target.value)}
            placeholder="Example: 25"
            inputMode="numeric"
          />
          <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.85, marginTop: 6 }}>
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
          />
        </div>

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

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
          Saved packageChoice: <code>{packageChoice}</code>
        </div>
      </form>
    </CustomSongsShell>
  );
}
