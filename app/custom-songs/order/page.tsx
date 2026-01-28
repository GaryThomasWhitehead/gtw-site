"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CustomSongsShell from "@/components/CustomSongsShell";

type OrderData = {
  packageChoice?: "song_only" | "song_video";
  name?: string;
  email?: string;
  phone?: string;
  occasion?: string;
  recipientName?: string;
  relationship?: string;
  vibe?: string;
  genre?: string;
  tempo?: string;
  mustInclude?: string;
  notes?: string;
  photoCount?: string;
  photoNotes?: string;
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.86)",
    fontWeight: 950,
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
    transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease",
    letterSpacing: 0.2,
  };

  const activeStyle: React.CSSProperties = active
    ? {
        background: "linear-gradient(180deg, rgba(181,123,23,0.22), rgba(255,255,255,0.92))",
        border: "1px solid rgba(181,123,23,0.55)",
        boxShadow: "0 14px 34px rgba(181,123,23,0.20)",
      }
    : {};

  return (
    <button
      type="button"
      style={{ ...base, ...activeStyle }}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
      }}
    >
      {children}
    </button>
  );
}

export default function OrderPage() {
  const [form, setForm] = useState<OrderData>({});
  const [step, setStep] = useState<number>(1);

  useEffect(() => setForm(loadOrder()), []);
  useEffect(() => saveOrder(form), [form]);

  const steps = useMemo(
    () => [
      { n: 1, title: "Choose package", sub: "Pick what you want delivered." },
      { n: 2, title: "Your basics", sub: "So I can deliver and confirm details." },
      { n: 3, title: "Song direction", sub: "Genre, vibe, tempo (optional)." },
      { n: 4, title: "Your story", sub: "The heart of the song." },
      { n: 5, title: "Review & continue", sub: "Quick check before the review page." },
    ],
    []
  );

  const current = steps.find((s) => s.n === step) ?? steps[0];

  const progressPct = useMemo(() => (step / steps.length) * 100, [step, steps.length]);

  const label: React.CSSProperties = {
    display: "block",
    fontWeight: 950,
    marginBottom: 6,
    fontSize: 14,
    color: "rgba(0,0,0,0.80)",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.96)",
    fontFamily: "inherit",
    fontWeight: 800,
    outline: "none",
    boxShadow: "0 10px 26px rgba(0,0,0,0.08)",
  };

  const textarea: React.CSSProperties = {
    ...input,
    minHeight: 150,
    resize: "vertical",
    lineHeight: 1.6,
  };

  const row2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  };

  const card: React.CSSProperties = {
    borderRadius: 20,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.70))",
    padding: 18,
    boxShadow: "0 18px 44px rgba(0,0,0,0.12)",
  };

  const subtle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 850,
    color: "rgba(0,0,0,0.60)",
    lineHeight: 1.6,
  };

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.12)",
    fontWeight: 950,
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 16px 36px rgba(0,0,0,0.14)",
    transition: "transform 160ms ease, box-shadow 160ms ease",
    userSelect: "none",
  };

  const btnDark: React.CSSProperties = {
    ...btnBase,
    background: "#111",
    color: "#fff",
  };

  const btnGold: React.CSSProperties = {
    ...btnBase,
    background: "#b57b17",
    color: "#fff",
    border: "1px solid rgba(0,0,0,0.10)",
  };

  const btnGhost: React.CSSProperties = {
    ...btnBase,
    background: "rgba(255,255,255,0.88)",
    color: "#111",
  };

  const canGoNext = useMemo(() => {
    if (step === 1) return !!form.packageChoice;
    if (step === 2) return (form.name ?? "").trim().length > 0 && (form.email ?? "").trim().length > 0;
    return true;
  }, [form.email, form.name, form.packageChoice, step]);

  const next = () => setStep((s) => clamp(s + 1, 1, steps.length));
  const back = () => setStep((s) => clamp(s - 1, 1, steps.length));

  const genres = ["Country", "Pop", "Rock", "R&B", "Jazz", "Worship", "Rap / Hip-Hop", "Other"];
  const vibes = ["Warm & hopeful", "Emotional", "Uplifting", "Celebratory", "Romantic", "Funny / playful", "Reflective"];
  const tempos = ["Slow", "Mid", "Upbeat"];

  return (
    <CustomSongsShell
      title="Start My Custom Song"
      subtitle="Your lyrics are personally crafted by a seasoned, published songwriter — then I produce a radio-clean track with AI-assisted music & vocals to match your story."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
      badge="ORDER"
      rightSlot={
        <div
          style={{
            fontSize: 12,
            fontWeight: 950,
            padding: "7px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.14)",
            background: "rgba(255,255,255,0.75)",
          }}
        >
          Step {step} of {steps.length}
        </div>
      }
    >
      {/* Progress */}
      <div
        style={{
          marginTop: -6,
          marginBottom: 18,
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.10)",
          background: "rgba(255,255,255,0.78)",
          padding: 14,
          boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 2 }}>{current.title}</div>
            <div style={subtle}>{current.sub}</div>
          </div>
          <div style={{ minWidth: 220, flex: "0 0 auto" }}>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(0,0,0,0.10)",
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.10)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #b57b17, rgba(181,123,23,0.55))",
                  transition: "width 220ms ease",
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 900, color: "rgba(0,0,0,0.60)" }}>
              {Math.round(progressPct)}% complete
            </div>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div style={{ display: "grid", gap: 14 }}>
        {step === 1 ? (
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>What do you want?</div>
            <div style={{ ...subtle, marginBottom: 14 }}>
              Choose your package now — you can adjust details later.
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Chip
                active={form.packageChoice === "song_only"}
                onClick={() => setForm((p) => ({ ...p, packageChoice: "song_only" }))}
              >
                Custom Song (audio)
              </Chip>
              <Chip
                active={form.packageChoice === "song_video"}
                onClick={() => setForm((p) => ({ ...p, packageChoice: "song_video" }))}
              >
                Custom Song + Photo Music Video
              </Chip>
            </div>

            <div style={{ marginTop: 14, ...subtle }}>
              <b>Audio:</b> delivered as a high-quality MP3/WAV-style file.{" "}
              <b>Photo Video:</b> your photos timed to the music for a polished keepsake.
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div style={card}>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={row2}>
                <div>
                  <label style={label}>Your Name *</label>
                  <input
                    style={input}
                    value={form.name ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label style={label}>Email *</label>
                  <input
                    style={input}
                    value={form.email ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div>
                <label style={label}>Phone (optional)</label>
                <input
                  style={input}
                  value={form.phone ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(optional)"
                />
              </div>

              <div style={{ ...subtle }}>
                If you’re unsure about anything, leave it blank — I’ll confirm details so it fits your story perfectly.
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>Song direction (optional)</div>
            <div style={{ ...subtle, marginBottom: 14 }}>
              Pick a starting point — I’ll shape it into something polished.
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ ...label, marginBottom: 10 }}>Genre</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {genres.map((g) => (
                  <Chip
                    key={g}
                    active={(form.genre ?? "") === g}
                    onClick={() => setForm((p) => ({ ...p, genre: g === "Other" ? "" : g }))}
                  >
                    {g}
                  </Chip>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <input
                  style={input}
                  value={form.genre ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
                  placeholder="Or type a genre (optional)"
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ ...label, marginBottom: 10 }}>Vibe</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {vibes.map((v) => (
                  <Chip key={v} active={(form.vibe ?? "") === v} onClick={() => setForm((p) => ({ ...p, vibe: v }))}>
                    {v}
                  </Chip>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ ...label, marginBottom: 10 }}>Tempo</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {tempos.map((t) => (
                  <Chip
                    key={t}
                    active={(form.tempo ?? "") === t}
                    onClick={() => setForm((p) => ({ ...p, tempo: t }))}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>Song details</div>

            <div style={row2}>
              <div>
                <label style={label}>Occasion</label>
                <input
                  style={input}
                  value={form.occasion ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))}
                  placeholder="Birthday, wedding, tribute, memorial, etc."
                />
              </div>

              <div>
                <label style={label}>Recipient name</label>
                <input
                  style={input}
                  value={form.recipientName ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
                  placeholder="Who is it for?"
                />
              </div>

              <div>
                <label style={label}>Your relationship</label>
                <input
                  style={input}
                  value={form.relationship ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))}
                  placeholder="Mom, husband, best friend, etc."
                />
              </div>

              <div>
                <label style={label}>Must-include phrases</label>
                <input
                  style={input}
                  value={form.mustInclude ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, mustInclude: e.target.value }))}
                  placeholder="Names, phrases, inside jokes (optional)"
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Your story / notes</label>
              <textarea
                style={textarea}
                value={form.notes ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Tell me what happened, what you want it to say, and what emotion you want it to carry."
              />
              <div style={{ marginTop: 10, ...subtle }}>
                Best results: key moments + what you want the song to “speak over” the person.
              </div>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>Quick review</div>

            <div
              style={{
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "rgba(255,255,255,0.80)",
                padding: 14,
                boxShadow: "0 14px 32px rgba(0,0,0,0.10)",
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <div style={subtle}>
                  <b>Package:</b>{" "}
                  {form.packageChoice === "song_video"
                    ? "Custom Song + Photo Music Video"
                    : form.packageChoice === "song_only"
                    ? "Custom Song (audio)"
                    : "Not selected"}
                </div>
                <div style={subtle}>
                  <b>Name:</b> {form.name || "—"} &nbsp; • &nbsp; <b>Email:</b> {form.email || "—"}
                </div>
                <div style={subtle}>
                  <b>Occasion:</b> {form.occasion || "—"} &nbsp; • &nbsp; <b>Recipient:</b> {form.recipientName || "—"}
                </div>
                <div style={subtle}>
                  <b>Genre:</b> {form.genre || "—"} &nbsp; • &nbsp; <b>Vibe:</b> {form.vibe || "—"} &nbsp; • &nbsp;{" "}
                  <b>Tempo:</b> {form.tempo || "—"}
                </div>
                <div style={subtle}>
                  <b>Must-include:</b> {form.mustInclude || "—"}
                </div>
              </div>
            </div>

            {form.packageChoice === "song_video" ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 950, marginBottom: 8 }}>Photo Music Video (optional)</div>
                <div style={row2}>
                  <div>
                    <label style={label}>Approx photo count</label>
                    <input
                      style={input}
                      value={form.photoCount ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, photoCount: e.target.value }))}
                      placeholder="Example: 25"
                    />
                  </div>
                  <div>
                    <label style={label}>Photo notes</label>
                    <input
                      style={input}
                      value={form.photoNotes ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, photoNotes: e.target.value }))}
                      placeholder="Any timing or sequence notes (optional)"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 14, ...subtle }}>
              Next you’ll go to the Review page to confirm everything and submit.
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <Link href="/custom-songs/review" style={btnGold}>
                Continue to Review →
              </Link>
              <Link href="/custom-songs/photos" style={btnGhost}>
                Add Photo Video Details
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
        <button
          type="button"
          style={{ ...btnGhost, opacity: step === 1 ? 0.6 : 1 }}
          onClick={back}
          disabled={step === 1}
        >
          ← Back
        </button>

        {step < steps.length ? (
          <button
            type="button"
            style={{ ...btnDark, opacity: canGoNext ? 1 : 0.55 }}
            onClick={next}
            disabled={!canGoNext}
          >
            Next →
          </button>
        ) : null}

        <button
          type="button"
          style={btnGhost}
          onClick={() => {
            // Clear this order locally (handy for testing)
            setForm({});
            saveOrder({});
            setStep(1);
          }}
        >
          Reset form
        </button>
      </div>

      {!canGoNext && step === 2 ? (
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 900, color: "rgba(140,0,0,0.72)" }}>
          Please enter your name and email to continue.
        </div>
      ) : null}
    </CustomSongsShell>
  );
}
