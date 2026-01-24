"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";

type PackageChoice = "song_only" | "song_video";

type OrderData = {
  packageChoice?: PackageChoice;

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
  photoCount?: string;
  photoNotes?: string;
};

const STORAGE_KEY = "gtw_custom_song_order_v1";

function safeReadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as OrderData;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveOrder(next: OrderData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function PhotosPage() {
  const router = useRouter();

  // ✅ NO autofill defaults — everything starts empty
  const [form, setForm] = useState<OrderData>({
    name: "",
    email: "",
    phone: "",

    occasion: "",
    recipientName: "",
    relationship: "",
    vibe: "",
    genre: "",
    tempo: "",
    mustInclude: "",
    notes: "",

    photoCount: "",
    photoNotes: "",
  });

  // Load saved values (if user already started)
  useEffect(() => {
    const saved = safeReadOrder();

    // Merge saved -> current empty defaults.
    // IMPORTANT: Spread order ensures saved values win.
    setForm((prev) => ({
      ...prev,
      ...saved,
      // Force correct package for this page without type errors:
      packageChoice: "song_video",
    }));
  }, []);

  // Save on each change (debounce not necessary; it's small)
  useEffect(() => {
    const payload: OrderData = {
      ...safeReadOrder(),
      ...form,
      packageChoice: "song_video",
    };
    saveOrder(payload);
  }, [form]);

  function update<K extends keyof OrderData>(key: K, value: OrderData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const pageWrapStyle = useMemo(
    () => ({
      minHeight: "100vh",
      padding: "28px 18px",
      backgroundImage: "url('/backgrounds/custom-songs-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
    }),
    []
  );

  const cardStyle: React.CSSProperties = {
    width: "min(980px, 100%)",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    padding: 22,
  };

  const subtleTopRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  };

  const smallPill: React.CSSProperties = {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".04em",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 999,
    padding: "6px 10px",
    background: "rgba(255,255,255,0.85)",
  };

  const h1Style: React.CSSProperties = {
    fontSize: 34,
    lineHeight: 1.12,
    margin: "10px 0 8px",
    fontFamily: '"Georgia", "Times New Roman", serif',
  };

  const leadStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: 18,
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.6,
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 800,
    marginTop: 18,
    marginBottom: 8,
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  };

  const grid1: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 14,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.15)",
    padding: "10px 12px",
    fontSize: 14,
    background: "rgba(255,255,255,0.95)",
    outline: "none",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 120,
    resize: "vertical",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  };

  const btnPrimary: React.CSSProperties = {
    appearance: "none",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 800,
    cursor: "pointer",
    background: "#777",
    color: "#fff",
  };

  const btnSecondary: React.CSSProperties = {
    appearance: "none",
    border: "1px solid rgba(0,0,0,0.18)",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    background: "rgba(255,255,255,0.75)",
    color: "#111",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  function continueToReview(e: React.FormEvent) {
    e.preventDefault();

    // Ensure latest saved state includes correct package choice:
    const payload: OrderData = { ...safeReadOrder(), ...form, packageChoice: "song_video" };
    saveOrder(payload);

    track("CustomSongsPhotosSubmit", { package: "song_video" });
    router.push("/custom-songs/review");
  }

  return (
    <main style={pageWrapStyle}>
      <section style={cardStyle}>
        <div style={subtleTopRow}>
          <Link href="/custom-songs" style={{ ...btnSecondary }}>
            ← Back to Options
          </Link>
          <span style={smallPill}>CUSTOM SONGS • PHOTO MUSIC VIDEO</span>
        </div>

        <h1 style={h1Style}>Tell me about your Photo Music Video</h1>
        <p style={leadStyle}>
          This option includes a custom song plus a video where your photos play beautifully as the music plays.
          Fill in what you can—if you&apos;re not sure, just leave it blank and we&apos;ll confirm details together.
        </p>

        <form onSubmit={continueToReview}>
          <div style={sectionTitle}>Contact</div>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Your Name *</label>
              <input
                style={inputStyle}
                value={(form.name as string) || ""}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle}
                type="email"
                value={(form.email as string) || ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Phone (optional)</label>
            <input
              style={inputStyle}
              value={(form.phone as string) || ""}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(optional)"
            />
          </div>

          <div style={sectionTitle}>Song details</div>

          <div style={grid2}>
            <div>
              <label style={labelStyle}>Occasion</label>
              <input
                style={inputStyle}
                value={(form.occasion as string) || ""}
                onChange={(e) => update("occasion", e.target.value)}
                placeholder="Birthday, anniversary, memorial, graduation…"
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

          <div style={{ ...grid2, marginTop: 12 }}>
            <div>
              <label style={labelStyle}>Your Relationship to Recipient</label>
              <input
                style={inputStyle}
                value={(form.relationship as string) || ""}
                onChange={(e) => update("relationship", e.target.value)}
                placeholder="Father, mother, friend, spouse…"
              />
            </div>
            <div>
              <label style={labelStyle}>Vibe / Mood</label>
              <input
                style={inputStyle}
                value={(form.vibe as string) || ""}
                onChange={(e) => update("vibe", e.target.value)}
                placeholder="Uplifting, heartfelt, fun, reflective…"
              />
            </div>
          </div>

          <div style={{ ...grid2, marginTop: 12 }}>
            <div>
              <label style={labelStyle}>Genre</label>
              <input
                style={inputStyle}
                value={(form.genre as string) || ""}
                onChange={(e) => update("genre", e.target.value)}
                placeholder="Country, pop, acoustic, worship…"
              />
            </div>
            <div>
              <label style={labelStyle}>Tempo</label>
              <input
                style={inputStyle}
                value={(form.tempo as string) || ""}
                onChange={(e) => update("tempo", e.target.value)}
                placeholder="Slow, mid, upbeat…"
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Must-include details or phrases</label>
            <input
              style={inputStyle}
              value={(form.mustInclude as string) || ""}
              onChange={(e) => update("mustInclude", e.target.value)}
              placeholder="Names, dates, places, lines, inside jokes…"
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Story / notes (optional)</label>
            <textarea
              style={textareaStyle}
              value={(form.notes as string) || ""}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Share the story, key moments, and what you want the listener to feel."
            />
          </div>

          <div style={sectionTitle}>Photos for the video</div>

          <div style={grid1}>
            <div>
              <label style={labelStyle}>Approx. number of photos</label>
              <input
                style={inputStyle}
                value={(form.photoCount as string) || ""}
                onChange={(e) => update("photoCount", e.target.value)}
                placeholder="Example: 25"
              />
              <div style={{ fontSize: 12, color: "rgba(0,0,0,0.65)", marginTop: 6 }}>
                You can change this later. I&apos;ll guide you on the best photo count for pacing.
              </div>
            </div>

            <div>
              <label style={labelStyle}>Photo notes (optional)</label>
              <textarea
                style={{ ...textareaStyle, minHeight: 110 }}
                value={(form.photoNotes as string) || ""}
                onChange={(e) => update("photoNotes", e.target.value)}
                placeholder="Any photo order preferences, captions, or moments you want highlighted?"
              />
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="submit" style={btnPrimary}>
              Continue to Review →
            </button>

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

          <div style={{ marginTop: 8, fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
            Saved packageChoice: <code>song_video</code>
          </div>
        </form>
      </section>
    </main>
  );
}
