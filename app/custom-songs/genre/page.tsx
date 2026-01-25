"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import CustomSongsShell from "@/components/CustomSongsShell";
import { loadOrder, saveOrder, OrderData, PackageChoice } from "@/lib/customSongsStore";

export default function GenrePage() {
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

  const set = (patch: Partial<OrderData>) => setForm((prev) => ({ ...prev, ...patch }));

  const chip: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.90)",
    fontWeight: 900,
    textDecoration: "none",
    color: "#111",
    cursor: "pointer",
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 14,
  };

  const tile: React.CSSProperties = {
    gridColumn: "span 12",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
    padding: 16,
  };

  const bigBtn = (active: boolean): React.CSSProperties => ({
    ...chip,
    background: active ? "#111" : "rgba(255,255,255,0.92)",
    color: active ? "#fff" : "#111",
    borderColor: active ? "rgba(0,0,0,0.40)" : "rgba(0,0,0,0.14)",
  });

  const genres = ["Country", "Acoustic", "Pop", "Worship / Faith", "Rock", "Classic / Oldies", "Other"];

  const nextHref = packageChoice === "song_video" ? "/custom-songs/photos" : "/custom-songs/order";

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS • OPTIONS"
      title="Choose Your Style"
      subtitle="Pick your package and a general vibe. If you’re not sure, choose ‘Other’ and we’ll dial it in together."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
    >
      <div style={grid}>
        <div style={tile}>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Package</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={bigBtn(packageChoice === "song_only")}
              onClick={() => {
                set({ packageChoice: "song_only" });
                track("CustomSongsPackageChoice", { packageChoice: "song_only" });
              }}
            >
              Custom Song
            </button>

            <button
              type="button"
              style={bigBtn(packageChoice === "song_video")}
              onClick={() => {
                set({ packageChoice: "song_video" });
                track("CustomSongsPackageChoice", { packageChoice: "song_video" });
              }}
            >
              Song + Photo Music Video
            </button>
          </div>
        </div>

        <div style={tile}>
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Genre</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {genres.map((g) => {
              const active = (form.genre ?? "").toLowerCase() === g.toLowerCase();
              return (
                <button
                  key={g}
                  type="button"
                  style={bigBtn(active)}
                  onClick={() => {
                    set({ genre: g });
                    track("CustomSongsGenrePick", { genre: g });
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 12, fontWeight: 800, opacity: 0.85 }}>
            Current: <span style={{ fontWeight: 900 }}>{packageChoice}</span> •{" "}
            <span style={{ fontWeight: 900 }}>{form.genre || "—"}</span>
          </div>
        </div>

        <div style={tile}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href={nextHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#b57b17",
                color: "#fff",
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
              }}
              onClick={() => track("CustomSongsContinueFromGenre", { packageChoice })}
            >
              Continue →
            </Link>

            <Link
              href="/custom-songs/samples"
              style={{
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
              }}
            >
              View Samples
            </Link>
          </div>
        </div>
      </div>
    </CustomSongsShell>
  );
}
