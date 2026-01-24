"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

/**
 * IMPORTANT:
 * This STORAGE_KEY must match whatever your other custom-songs pages use (order/review).
 * If those pages already have a STORAGE_KEY, copy it and paste it here.
 */
const STORAGE_KEY = "gtw_custom_songs_order_v1";

type PackageChoice = "song" | "song_video";

type OrderData = {
  packageChoice: PackageChoice;

  // Contact
  name?: string;
  email?: string;
  phone?: string;

  // Project
  occasion?: string;
  recipient?: string;
  relationship?: string;

  // Notes / story
  notes?: string;

  // Photos (we store only metadata here; actual files are not persisted in localStorage)
  photoNotes?: string;
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadOrder(): OrderData {
  // Default for this page is always song_video
  const defaults: OrderData = { packageChoice: "song_video" };

  const saved = safeJsonParse<Partial<OrderData>>(localStorage.getItem(STORAGE_KEY));
  if (!saved) return defaults;

  // If saved.packageChoice exists but is invalid, ignore it.
  const savedChoice =
    saved.packageChoice === "song" || saved.packageChoice === "song_video"
      ? saved.packageChoice
      : undefined;

  // Merge safely (no duplicate keys, and packageChoice remains the union type)
  return {
    ...defaults,
    ...saved,
    packageChoice: savedChoice ?? "song_video",
  };
}

function saveOrder(data: OrderData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function PhotosPage() {
  const [mounted, setMounted] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("");
  const [recipient, setRecipient] = useState("");
  const [relationship, setRelationship] = useState("");
  const [notes, setNotes] = useState("");
  const [photoNotes, setPhotoNotes] = useState("");

  // Photos chosen on this page (NOT persisted to localStorage)
  const [files, setFiles] = useState<File[]>([]);

  // Load saved data once on mount
  useEffect(() => {
    setMounted(true);
    const data = loadOrder();

    setName(data.name ?? "");
    setEmail(data.email ?? "");
    setPhone(data.phone ?? "");
    setOccasion(data.occasion ?? "");
    setRecipient(data.recipient ?? "");
    setRelationship(data.relationship ?? "");
    setNotes(data.notes ?? "");
    setPhotoNotes(data.photoNotes ?? "");

    // Ensure analytics event
    track("CustomSongsPhotosView", { package: "song_video" });
  }, []);

  // Build previews
  const previews = useMemo(() => {
    return files.map((f) => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f),
    }));
  }, [files]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  function persistPartial() {
    // Keep packageChoice as the UNION type (NOT string)
    const payload: OrderData = {
      packageChoice: "song_video",
      name,
      email,
      phone,
      occasion,
      recipient,
      relationship,
      notes,
      photoNotes,
    };
    saveOrder(payload);
  }

  function onChooseFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles(picked);
    track("CustomSongsPhotosPicked", { count: picked.length });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Save typed payload (fixes your Vercel error)
    const payload: OrderData = {
      packageChoice: "song_video",
      name,
      email,
      phone,
      occasion,
      recipient,
      relationship,
      notes,
      photoNotes,
    };

    saveOrder(payload);

    track("CustomSongsPhotosSubmit", { package: "song_video" });

    // Move forward
    window.location.href = "/custom-songs/order";
  }

  const pageWrap: React.CSSProperties = {
    maxWidth: 980,
    margin: "0 auto",
    padding: "28px 20px",
    fontFamily: '"Georgia", "Times New Roman", serif',
    color: "#111",
    lineHeight: 1.6,
  };

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 2px 10px rgba(0,0,0,.05)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 700,
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 110,
    resize: "vertical",
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 800,
    textDecoration: "none",
    background: "#b57b17",
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
    background: "#111",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 1px 0 rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.06)",
  };

  return (
    <main style={pageWrap}>
      <div style={{ marginBottom: 14 }}>
        <Link
          href="/custom-songs"
          onClick={() => track("CustomSongsBackToLandingClick")}
          style={{ textDecoration: "none", fontWeight: 800, color: "#111" }}
        >
          ← Back to Custom Songs
        </Link>
      </div>

      <h1 style={{ margin: "6px 0 10px", fontSize: 30 }}>
        Photo Music Video — Add Your Photos
      </h1>

      <p style={{ marginTop: 0, color: "#444" }}>
        This page is for the <strong>Photo Music Video</strong> package. You can pick photos now,
        and we’ll confirm the best way to deliver them (email / shared folder) after you submit.
      </p>

      <section style={card}>
        <h2 style={{ margin: "0 0 10px", fontSize: 18, letterSpacing: ".06em", color: "#777" }}>
          STEP 1 — YOUR DETAILS (saved automatically)
        </h2>

        <form onSubmit={onSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input
                style={inputStyle}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                onBlur={persistPartial}
                placeholder="Your name"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={persistPartial}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Phone (optional)</label>
            <input
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={persistPartial}
              placeholder="(555) 555-5555"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>Occasion</label>
              <input
                style={inputStyle}
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                onBlur={persistPartial}
                placeholder="Birthday, Anniversary, Memorial..."
              />
            </div>
            <div>
              <label style={labelStyle}>Recipient</label>
              <input
                style={inputStyle}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                onBlur={persistPartial}
                placeholder="Who is this for?"
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Your relationship to the recipient</label>
            <input
              style={inputStyle}
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              onBlur={persistPartial}
              placeholder="Father, mother, friend, spouse..."
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Story / Notes for the song</label>
            <textarea
              style={textareaStyle}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={persistPartial}
              placeholder="Share the story, details, and what you want the listener to feel."
            />
          </div>

          <hr style={{ margin: "18px 0", border: "none", borderTop: "1px solid #eee" }} />

          <h2 style={{ margin: "0 0 10px", fontSize: 18, letterSpacing: ".06em", color: "#777" }}>
            STEP 2 — CHOOSE PHOTOS
          </h2>

          <div style={{ marginTop: 10 }}>
            <label style={labelStyle}>Select photos (optional for now)</label>
            <input type="file" multiple accept="image/*" onChange={onChooseFiles} />
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              Tip: If you have lots of photos, you can still continue — we can collect them via a shared folder after you submit.
            </div>
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                Selected photos: {files.length}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 10,
                }}
              >
                {previews.map((p) => (
                  <figure
                    key={p.url}
                    style={{
                      margin: 0,
                      border: "1px solid #eee",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.name}
                      style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                    />
                    <figcaption style={{ padding: 8, fontSize: 12 }}>
                      <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </div>
                      <div style={{ color: "#666" }}>{Math.round(p.size / 1024)} KB</div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Any notes about the photos (order, favorites, timing, etc.)</label>
            <textarea
              style={textareaStyle}
              value={photoNotes}
              onChange={(e) => setPhotoNotes(e.target.value)}
              onBlur={persistPartial}
              placeholder="Example: Start with the childhood photos, then wedding, end with the family group photo…"
            />
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" style={btnPrimary}>
              Continue to Order →
            </button>

            <Link
              href="/custom-songs/order"
              style={btnSecondary}
              onClick={() => {
                persistPartial();
                track("CustomSongsSkipToOrderClick", { from: "photos" });
              }}
            >
              Skip (go to Order)
            </Link>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Saved package: <strong>Photo Music Video</strong>{" "}
            (packageChoice = <code>song_video</code>)
            {!mounted ? null : ""}
          </div>
        </form>
      </section>
    </main>
  );
}
