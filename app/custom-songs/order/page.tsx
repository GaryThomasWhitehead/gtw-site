"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";

type PackageChoice = "song_only" | "song_video";

type OrderData = {
  packageChoice?: PackageChoice;
  occasion?: string;
  vibe?: string;
  story?: string;
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

export default function OrderPage() {
  const router = useRouter();

  // ✅ NO defaults (removes Birthday / Warm & Hopeful autofill)
  const [form, setForm] = useState<OrderData>({
    occasion: "",
    vibe: "",
    story: "",
  });

  useEffect(() => {
    const saved = safeReadOrder();
    setForm((prev) => ({
      ...prev,
      ...saved,
      // keep whatever packageChoice was set earlier (song_only or song_video)
      packageChoice: saved.packageChoice,
    }));
  }, []);

  useEffect(() => {
    saveOrder({ ...safeReadOrder(), ...form });
  }, [form]);

  const bgStyle = useMemo(
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

  const card: React.CSSProperties = {
    width: "min(980px, 100%)",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    padding: 24,
  };

  const pill: React.CSSProperties = {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 800,
    borderRadius: 999,
    padding: "6px 10px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.85)",
  };

  const input: React.CSSProperties = {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    padding: "12px 14px",
    fontSize: 16,
    background: "rgba(255,255,255,0.95)",
    outline: "none",
  };

  const textarea: React.CSSProperties = {
    ...input,
    minHeight: 170,
    resize: "vertical",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 14,
  };

  const btn: React.CSSProperties = {
    borderRadius: 14,
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
    border: "none",
    background: "#b07a12",
    color: "#fff",
  };

  const btnGhost: React.CSSProperties = {
    borderRadius: 14,
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(255,255,255,0.75)",
    color: "#111",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  function nextStep(e: React.FormEvent) {
    e.preventDefault();

    saveOrder({ ...safeReadOrder(), ...form });
    track("CustomSongsOrderSubmit", { step: 2 });

    router.push("/custom-songs/genre");
  }

  return (
    <main style={bgStyle}>
      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Link href="/custom-songs" style={btnGhost}>
              ← Back to Options
            </Link>
            <div style={{ marginTop: 8 }}>
              <span style={pill}>Step 2 of 5</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <Link href="/" style={{ fontWeight: 900, textDecoration: "none", color: "#111" }}>
              Home
            </Link>
            <div style={{ marginTop: 6, fontWeight: 800, color: "rgba(0,0,0,0.65)" }}>40% Complete</div>
          </div>
        </div>

        <h1 style={{ fontSize: 46, margin: "18px 0 12px", fontFamily: '"Georgia","Times New Roman",serif' }}>
          Let&apos;s shape the song
        </h1>

        <form onSubmit={nextStep}>
          <label style={{ display: "block", fontWeight: 900, marginBottom: 8 }}>Occasion *</label>
          <input
            style={input}
            value={form.occasion || ""}
            onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))}
            placeholder="Birthday, anniversary, memorial…"
            required
          />

          <div style={{ height: 14 }} />

          <label style={{ display: "block", fontWeight: 900, marginBottom: 8 }}>Mood / vibe *</label>
          <input
            style={input}
            value={form.vibe || ""}
            onChange={(e) => setForm((p) => ({ ...p, vibe: e.target.value }))}
            placeholder="Warm, hopeful, funny, emotional…"
            required
          />

          <div style={{ height: 14 }} />

          <label style={{ display: "block", fontWeight: 900, marginBottom: 8 }}>
            Your story (the more detail, the better) *
          </label>
          <textarea
            style={textarea}
            value={form.story || ""}
            onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))}
            placeholder="Names, relationship, key memories, phrases you want included, what you want them to feel when they hear it..."
            required
          />

          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <Link href="/custom-songs" style={btnGhost}>
              ← Back
            </Link>

            <button type="submit" style={btn}>
              Next →
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
