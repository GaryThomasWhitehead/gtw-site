"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CustomSongsShell from "@/components/CustomSongsShell";

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

  useEffect(() => setForm(loadOrder()), []);
  useEffect(() => saveOrder(form), [form]);

  // If they came here directly, ensure a video-capable package is selected
  useEffect(() => {
    const isVideo =
      form.packageChoice === "video" ||
      form.packageChoice === "video_lyrics" ||
      form.packageChoice === "everything_bundle";

    if (!isVideo) {
      setForm((prev) => ({ ...prev, packageChoice: prev.packageChoice ?? "video" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const packageChoice = useMemo<PackageChoice>(() => form.packageChoice ?? "video", [form.packageChoice]);

  function update<K extends keyof OrderData>(key: K, value: OrderData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const labelStyle: React.CSSProperties = { display: "block", fontWeight: 900, marginBottom: 6 };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 120, resize: "vertical" };

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
    boxShadow: "0 10px 22px rgba(0,0,0,0.14)",
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
    <CustomSongsShell
      title="Photo Music Video Details"
      subtitle="This option includes a custom song plus a video where your photos play beautifully as the music plays."
      backHref="/custom-songs/order"
      backLabel="← Back to Order"
      badge="PHOTO VIDEO"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={labelStyle}>Your Name *</label>
          <input style={inputStyle} value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Email *</label>
          <input style={inputStyle} value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Phone (optional)</label>
        <input style={inputStyle} value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
      </div>

      <h3 style={{ marginTop: 18, marginBottom: 10, fontWeight: 900, fontSize: 20 }}>
        Photos for the video
      </h3>

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

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18, alignItems: "center" }}>
        <Link href="/custom-songs/review" style={btnPrimary}>
          Continue to Review →
        </Link>

        <Link href="/custom-songs/order" style={btnSecondary}>
          Back to Order
        </Link>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Saved packageChoice: <code>{packageChoice}</code>
        </div>
      </div>
    </CustomSongsShell>
  );
}
