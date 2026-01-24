"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

/**
 * This page is for the "Photo Music Video" package.
 * It forces packageChoice = "song_video" while preserving any other saved fields.
 * Fixes build error: "packageChoice is specified more than once"
 */

type PackageChoice = "song" | "song_video";

type OrderData = {
  packageChoice: PackageChoice;

  // Contact
  name?: string;
  email?: string;
  phone?: string;

  // Project details
  occasion?: string;
  recipientName?: string;
  relationship?: string;
  mood?: string;
  style?: string;
  tempo?: string;
  genre?: string;
  keyPhrases?: string;
  mustInclude?: string;
  mustAvoid?: string;

  // Timeline / delivery
  dueDate?: string;
  notes?: string;

  // Photo video specific
  photoCount?: string;
  videoNotes?: string;

  // Anything else you may store later
  [key: string]: unknown;
};

const STORAGE_KEY = "gtw_custom_song_order_v1";

function loadOrder(): OrderData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { packageChoice: "song_video" };

    const parsed = JSON.parse(raw) as OrderData;

    // IMPORTANT: spread first, then override packageChoice to avoid duplicates
    return { ...parsed, packageChoice: "song_video" };
  } catch {
    return { packageChoice: "song_video" };
  }
}

function saveOrder(data: OrderData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage failures
  }
}

export default function PhotosPage() {
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState<OrderData>({
    packageChoice: "song_video",
    name: "",
    email: "",
    phone: "",
    occasion: "",
    recipientName: "",
    relationship: "",
    mood: "",
    style: "",
    tempo: "",
    genre: "",
    keyPhrases: "",
    mustInclude: "",
    mustAvoid: "",
    dueDate: "",
    notes: "",
    photoCount: "",
    videoNotes: "",
  });

  useEffect(() => {
    setMounted(true);

    // Load saved and force correct package
    const saved = loadOrder();
    setForm((prev) => ({
      ...prev,
      ...saved,
      packageChoice: "song_video",
    }));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveOrder({ ...form, packageChoice: "song_video" });
  }, [mounted, form]);

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      maxWidth: "980px",
      margin: "0 auto",
      padding: "24px 20px 40px",
      fontFamily: '"Georgia", "Times New Roman", serif',
      color: "#111",
      backgroundColor: "#faf9f6",
      lineHeight: 1.6,
    }),
    []
  );

  const cardStyle: React.CSSProperties = useMemo(
    () => ({
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 12,
      padding: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }),
    []
  );

  const labelStyle: React.CSSProperties = useMemo(
    () => ({
      fontSize: 12,
      letterSpacing: ".08em",
      color: "#7a7a7a",
      fontWeight: 700,
      textTransform: "uppercase",
      marginBottom: 6,
      display: "block",
    }),
    []
  );

  const inputStyle: React.CSSProperties = useMemo(
    () => ({
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid #ddd",
      outline: "none",
      fontSize: 15,
      fontFamily: "inherit",
      background: "#fff",
    }),
    []
  );

  const textareaStyle: React.CSSProperties = useMemo(
    () => ({
      ...inputStyle,
      minHeight: 110,
      resize: "vertical",
    }),
    [inputStyle]
  );

  const rowStyle: React.CSSProperties = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
    }),
    []
  );

  const btnPrimary: React.CSSProperties = useMemo(
    () => ({
      display: "inline-block",
      padding: "10px 14px",
      borderRadius: 10,
      fontWeight: 700,
      textDecoration: "none",
      background: "#111",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
    }),
    []
  );

  const btnSecondary: React.CSSProperties = useMemo(
    () => ({
      display: "inline-block",
      padding: "10px 14px",
      borderRadius: 10,
      fontWeight: 700,
      textDecoration: "none",
      background: "#fff",
      color: "#111",
      border: "1px solid #ddd",
      cursor: "pointer",
    }),
    []
  );

  function update<K extends keyof OrderData>(key: K, value: OrderData[K]) {
    setForm((prev) => ({ ...prev, [key]: value, packageChoice: "song_video" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // save already happens in effect, but we ensure it here too
    const payload = { ...form, packageChoice: "song_video" };
    saveOrder(payload);

    track("CustomSongsPhotosSubmit", { package: "song_video" });

    // Route to order page (or wherever you finalize)
    window.location.href = "/custom-songs/order";
  }

  return (
    <main style={containerStyle}>
      <div style={{ marginBottom: 14 }}>
        <Link
          href="/custom-songs"
          style={{ textDecoration: "none", color: "#111", fontWeight: 700 }}
          onClick={() => track("CustomSongsBackClick", { from: "photos" })}
        >
          ← Back to Custom Songs
        </Link>
      </div>

      <section style={cardStyle}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, letterSpacing: ".08em", color: "#7a7a7a" }}>
            CUSTOM SONGS • PHOTO MUSIC VIDEO
          </div>
          <h1 style={{ margin: "6px 0 10px", fontSize: 30 }}>
            Photo Music Video Details
          </h1>
          <p style={{ margin: 0 }}>
            This page collects details for the <strong>Photo Music Video</strong>{" "}
            package. Your selections are saved automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input
                style={inputStyle}
                value={(form.name as string) || ""}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                value={(form.email as string) || ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div style={{ ...rowStyle, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input
                style={inputStyle}
                value={(form.phone as string) || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
            <div>
              <label style={labelStyle}>Due Date (optional)</label>
              <input
                style={inputStyle}
                value={(form.dueDate as string) || ""}
                onChange={(e) => update("dueDate", e.target.value)}
                placeholder="Example: Feb 14"
              />
            </div>
          </div>

          <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #eee" }} />

          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Occasion</label>
              <input
                style={inputStyle}
                value={(form.occasion as string) || ""}
                onChange={(e) => update("occasion", e.target.value)}
                placeholder="Birthday, memorial, wedding, etc."
              />
            </div>
            <div>
              <label style={labelStyle}>Recipient Name</label>
              <input
                style={inputStyle}
                value={(form.recipientName as string) || ""}
                onChange={(e) => update("recipientName", e.target.value)}
                placeholder="Who is this for?"
              />
            </div>
          </div>

          <div style={{ ...rowStyle, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>Relationship</label>
              <input
                style={inputStyle}
                value={(form.relationship as string) || ""}
                onChange={(e) => update("relationship", e.target.value)}
                placeholder="Father, daughter, friend, spouse..."
              />
            </div>
            <div>
              <label style={labelStyle}>Mood / Feel</label>
              <input
                style={inputStyle}
                value={(form.mood as string) || ""}
                onChange={(e) => update("mood", e.target.value)}
                placeholder="Hopeful, heartfelt, uplifting..."
              />
            </div>
          </div>

          <div style={{ ...rowStyle, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>Genre (optional)</label>
              <input
                style={inputStyle}
                value={(form.genre as string) || ""}
                onChange={(e) => update("genre", e.target.value)}
                placeholder="Country, pop, worship, etc."
              />
            </div>
            <div>
              <label style={labelStyle}>Tempo / Style (optional)</label>
              <input
                style={inputStyle}
                value={(form.style as string) || ""}
                onChange={(e) => update("style", e.target.value)}
                placeholder="Slow ballad, mid-tempo, anthem..."
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Key Phrases / Must Include (optional)</label>
            <textarea
              style={textareaStyle}
              value={(form.mustInclude as string) || ""}
              onChange={(e) => update("mustInclude", e.target.value)}
              placeholder="Names, special lines, meaningful phrases, faith references..."
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Must Avoid (optional)</label>
            <textarea
              style={textareaStyle}
              value={(form.mustAvoid as string) || ""}
              onChange={(e) => update("mustAvoid", e.target.value)}
              placeholder="Anything you don't want mentioned..."
            />
          </div>

          <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #eee" }} />

          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Approx Photo Count</label>
              <input
                style={inputStyle}
                value={(form.photoCount as string) || ""}
                onChange={(e) => update("photoCount", e.target.value)}
                placeholder="Example: 20–40"
              />
            </div>
            <div>
              <label style={labelStyle}>Video Notes (optional)</label>
              <input
                style={inputStyle}
                value={(form.videoNotes as string) || ""}
                onChange={(e) => update("videoNotes", e.target.value)}
                placeholder="Any style requests, pacing, captions, etc."
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Anything Else You Want Me To Know?</label>
            <textarea
              style={textareaStyle}
              value={(form.notes as string) || ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Share the story, details, and what you want the listener to feel."
            />
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" style={btnPrimary}>
              Continue to Order →
            </button>

            <Link
              href="/custom-songs/order"
              style={btnSecondary}
              onClick={() => track("CustomSongsSkipToOrderClick", { from: "photos" })}
            >
              Skip (go to Order)
            </Link>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Saved package: <strong>Photo Music Video</strong> (packageChoice ={" "}
            <code>song_video</code>)
          </div>
        </form>
      </section>
    </main>
  );
}
