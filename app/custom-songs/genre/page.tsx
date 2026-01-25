"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CustomSongsShell from "@/components/CustomSongsShell";

type PackageChoice = "song_only" | "song_video";
type OrderData = {
  packageChoice?: PackageChoice;
  genre?: string;
  vibe?: string;
  tempo?: string;
};

const STORAGE_KEY = "customSongsOrder_v3";

function loadOrder(): OrderData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveOrder(next: OrderData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function GenrePage() {
  const [form, setForm] = useState<OrderData>({});

  useEffect(() => {
    setForm(loadOrder());
  }, []);

  useEffect(() => {
    saveOrder(form);
  }, [form]);

  const label: React.CSSProperties = { display: "block", fontWeight: 900, marginBottom: 6 };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#fff",
    fontFamily: "inherit",
  };

  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    cursor: "pointer",
  };

  const btnAlt: React.CSSProperties = { ...btn, background: "#b57b17" };

  return (
    <CustomSongsShell
      title="Choose Your Style"
      subtitle="Optional — choose a genre, vibe, and tempo. Leave blank if you want me to guide you."
      backHref="/custom-songs"
      badge="OPTIONS"
    >
      <div style={row}>
        <div>
          <label style={label}>Package</label>
          <select
            style={input}
            value={form.packageChoice ?? "song_video"}
            onChange={(e) => setForm((p) => ({ ...p, packageChoice: e.target.value as PackageChoice }))}
          >
            <option value="song_only">Custom Song (audio only)</option>
            <option value="song_video">Custom Song + Photo Music Video</option>
          </select>
        </div>

        <div>
          <label style={label}>Genre</label>
          <input
            style={input}
            value={form.genre ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
            placeholder="Country, acoustic, pop, worship…"
          />
        </div>

        <div>
          <label style={label}>Vibe / Mood</label>
          <input
            style={input}
            value={form.vibe ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, vibe: e.target.value }))}
            placeholder="Heartfelt, uplifting, reflective, fun…"
          />
        </div>

        <div>
          <label style={label}>Tempo</label>
          <input
            style={input}
            value={form.tempo ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, tempo: e.target.value }))}
            placeholder="Slow, mid, upbeat…"
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
        <Link href="/custom-songs/order" style={btnAlt}>
          Continue to Order →
        </Link>
        <Link href="/custom-songs/samples" style={btn}>
          View Samples
        </Link>
      </div>
    </CustomSongsShell>
  );
}
