"use client";

import React, { useEffect, useMemo, useState } from "react";

type PackageChoice = "song_only" | "song_video";
type OrderData = {
  packageChoice?: PackageChoice;
  // keep anything else you store in localStorage:
  name?: string;
  email?: string;
  phone?: string;
  occasion?: string;
  story?: string;
  genre?: string;
  tempo?: string;
  mood?: string;
  vocals?: string;
  notes?: string;
  // photo/video-related
  photos?: string[]; // (if you store object URLs or filenames, etc.)
};

const STORAGE_KEY = "gtw_custom_song_order";

function readOrderDataForceSongVideo(): OrderData & { packageChoice: "song_video" } {
  if (typeof window === "undefined") return { packageChoice: "song_video" };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { packageChoice: "song_video" };

    const parsed = JSON.parse(raw) as OrderData;

    // IMPORTANT: spread first, then override packageChoice
    // so you don't specify packageChoice twice.
    return { ...(parsed || {}), packageChoice: "song_video" };
  } catch {
    return { packageChoice: "song_video" };
  }
}

function saveOrderData(next: OrderData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function PhotosPage() {
  const [order, setOrder] = useState<OrderData & { packageChoice: "song_video" }>(() => ({
    packageChoice: "song_video",
  }));

  // simple client-only file list (you can expand to upload later)
  const [files, setFiles] = useState<File[]>([]);
  const fileNames = useMemo(() => files.map((f) => f.name), [files]);

  useEffect(() => {
    const loaded = readOrderDataForceSongVideo();
    setOrder(loaded);
  }, []);

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    setFiles(list);

    // If you store photo names in localStorage:
    const next = { ...order, photos: list.map((f) => f.name) };
    setOrder(next);
    saveOrderData(next);
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 16px" }}>
      <div
        style={{
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#fff",
          padding: 20,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 0.12, fontWeight: 800, color: "#777" }}>
          PHOTO MUSIC VIDEO
        </div>
        <h1 style={{ margin: "6px 0 10px", fontSize: 28, lineHeight: 1.15 }}>
          Upload your photos
        </h1>
        <p style={{ margin: "0 0 16px", color: "#444", lineHeight: 1.6 }}>
          Add photos you want included in your Photo Music Video. If you’re not ready,
          you can skip and come back later.
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 12,
              background: "#111",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(0,0,0,0.10)",
            }}
          >
            Choose Photos
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onFilesSelected}
              style={{ display: "none" }}
            />
          </label>

          <a
            href="/custom-songs/review"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 12,
              background: "#b57b17",
              color: "#fff",
              fontWeight: 900,
              textDecoration: "none",
              boxShadow: "0 8px 16px rgba(0,0,0,0.10)",
            }}
          >
            Continue
          </a>

          <a
            href="/custom-songs"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: 12,
              background: "#eee",
              color: "#111",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            Back
          </a>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Selected:</div>
          {fileNames.length === 0 ? (
            <div style={{ color: "#666" }}>No photos selected yet.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, color: "#333" }}>
              {fileNames.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: "#777" }}>
          Saved package: <b>{order.packageChoice}</b>
        </div>
      </div>
    </main>
  );
}
