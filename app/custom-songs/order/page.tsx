"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

  // direction (optional)
  genre?: string; // free text
  vibe?: string; // free text
  tempo?: string; // free text

  // photo video (optional)
  photoCount?: string;
  photoNotes?: string;
};

// bump the key so old saved values don’t interfere
const STORAGE_KEY = "customSongsOrder_v4";

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

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const PACKAGES: Array<{
  id: PackageChoice;
  title: string;
  price: number;
  subtitle: string;
  bullets: string[];
  badge?: string;
  accent?: "gold" | "dark";
}> = [
  {
    id: "song_audio",
    title: "Custom Song (Audio)",
    price: 249,
    subtitle: "Radio-clean song delivered as a high-quality file.",
    bullets: [
      "Personally written lyrics by a published songwriter",
      "AI-assisted music + vocals, produced to match your story",
      "Delivered as MP3/WAV-style file",
    ],
    accent: "dark",
  },
  {
    id: "song_audio_lyrics",
    title: "Custom Song + Printable Lyrics Sheet",
    price: 279,
    subtitle: "Audio song plus a beautiful PDF lyrics keepsake.",
    bullets: [
      "Everything in Custom Song (Audio)",
      "Printable lyrics sheet (PDF) — great for gifts & framing",
    ],
    badge: "POPULAR",
    accent: "gold",
  },
  {
    id: "video",
    title: "Custom Song + Photo Music Video",
    price: 499,
    subtitle: "Your photos timed to the music for a polished keepsake video.",
    bullets: [
      "Includes Custom Song (Audio)",
      "Photo Music Video edited to match the song moments",
      "Delivered as MP4 video file",
    ],
    badge: "BEST VALUE",
    accent: "gold",
  },
  {
    id: "video_lyrics",
    title: "Photo Music Video + Printable Lyrics Sheet",
    price: 529,
    subtitle: "The complete keepsake: video + audio + lyrics PDF.",
    bullets: [
      "Everything in Custom Song + Photo Music Video",
      "Printable lyrics sheet (PDF)",
    ],
    accent: "dark",
  },
  {
    id: "everything_bundle",
    title: "Everything Bundle",
    price: 599,
    subtitle: "All deliverables plus a couple premium extras.",
    bullets: [
      "Custom Song (Audio)",
      "Custom Photo Music Video (MP4)",
      "Printable lyrics sheet (PDF)",
      "Bonus: instrumental version",
      "Bonus: short social teaser clip (30–60s)",
    ],
    badge: "PREMIUM",
    accent: "gold",
  },
];

function normalizePackageParam(p?: string | null): PackageChoice | undefined {
  if (!p) return undefined;
  const v = p.toLowerCase().trim();

  // direct matches
  if (v === "song_audio" || v === "song_audio_lyrics" || v === "video" || v === "video_lyrics" || v === "everything_bundle") {
    return v as PackageChoice;
  }

  // a couple friendly aliases (optional)
  if (v === "song" || v === "audio" || v === "song_only") return "song_audio";
  if (v === "song_video" || v === "video_only") return "video";

  return undefined;
}

export default function OrderPage() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState<OrderData>({});
  const [step, setStep] = useState<number>(1);

  // Load saved order
  useEffect(() => setForm(loadOrder()), []);

  // Persist on change
  useEffect(() => saveOrder(form), [form]);

  // ✅ Apply ?package=... if present (and keep the user on the package step)
  useEffect(() => {
    const pkg = normalizePackageParam(searchParams?.get("package"));
    if (!pkg) return;

    setForm((prev) => {
      if (prev.packageChoice === pkg) return prev;
      const next = { ...prev, packageChoice: pkg };
      saveOrder(next);
      return next;
    });

    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedPkg = useMemo(
    () => PACKAGES.find((p) => p.id === form.packageChoice),
    [form.packageChoice]
  );

  const progressPct = useMemo(() => {
    // 5-step flow like your screenshots
    const map: Record<number, number> = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
    return map[step] ?? 20;
  }, [step]);

  const shellSubtitle =
    "Your lyrics are personally crafted by a seasoned, published songwriter — then I produce a radio-clean track with AI-assisted music & vocals to match your story.";

  const softCard: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.82)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.14)",
    padding: 18,
  };

  const row2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  };

  const label: React.CSSProperties = {
    display: "block",
    fontWeight: 900,
    marginBottom: 6,
    color: "rgba(0,0,0,0.78)",
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "rgba(255,255,255,0.95)",
    fontFamily: "inherit",
    outline: "none",
  };

  const textarea: React.CSSProperties = {
    ...input,
    minHeight: 140,
    resize: "vertical",
  };

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.92)",
    color: "#111",
    fontWeight: 950,
    textDecoration: "none",
    cursor: "pointer",
  };

  const btnNext: React.CSSProperties = {
    ...btnBase,
    background: "#111",
    color: "#fff",
    border: "1px solid rgba(0,0,0,0.35)",
    boxShadow: "0 12px 26px rgba(0,0,0,0.18)",
  };

  const btnGold: React.CSSProperties = {
    ...btnBase,
    background: "#b57b17",
    color: "#fff",
    border: "1px solid rgba(0,0,0,0.20)",
    boxShadow: "0 12px 26px rgba(0,0,0,0.16)",
  };

  function resetForm() {
    const cleared: OrderData = {};
    setForm(cleared);
    saveOrder(cleared);
    setStep(1);
  }

  const StepHeader = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => (
    <div
      style={{
        ...softCard,
        padding: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <div>
        <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ fontWeight: 850, color: "rgba(0,0,0,0.60)", fontSize: 13 }}>
          {subtitle}
        </div>
      </div>

      <div style={{ minWidth: 240 }}>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "rgba(0,0,0,0.10)",
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.10)",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background:
                "linear-gradient(90deg, rgba(181,123,23,0.95), rgba(0,0,0,0.85))",
            }}
          />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900, color: "rgba(0,0,0,0.55)" }}>
          {progressPct}% complete
        </div>
      </div>
    </div>
  );

  const PackageCard = ({
    p,
    selected,
  }: {
    p: (typeof PACKAGES)[number];
    selected: boolean;
  }) => {
    const accent =
      p.accent === "gold"
        ? {
            ring: "0 0 0 3px rgba(181,123,23,0.25)",
            border: "1px solid rgba(181,123,23,0.45)",
          }
        : {
            ring: "0 0 0 3px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.14)",
          };

    return (
      <button
        type="button"
        onClick={() => setForm((prev) => ({ ...prev, packageChoice: p.id }))}
        style={{
          textAlign: "left",
          borderRadius: 18,
          border: accent.border,
          background: selected
            ? "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))"
            : "rgba(255,255,255,0.86)",
          padding: 16,
          boxShadow: selected
            ? "0 26px 62px rgba(0,0,0,0.18)"
            : "0 16px 44px rgba(0,0,0,0.12)",
          cursor: "pointer",
          transition: "transform 160ms ease, box-shadow 160ms ease",
          outline: "none",
          transform: selected ? "translateY(-2px)" : "translateY(0px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 4 }}>
              {p.title}
            </div>
            <div style={{ fontSize: 13, fontWeight: 850, color: "rgba(0,0,0,0.62)" }}>
              {p.subtitle}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            {p.badge ? (
              <div
                style={{
                  display: "inline-flex",
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 950,
                  letterSpacing: 0.5,
                  border: "1px solid rgba(0,0,0,0.14)",
                  background: "rgba(255,255,255,0.92)",
                  marginBottom: 8,
                }}
              >
                {p.badge}
              </div>
            ) : null}
            <div style={{ fontSize: 20, fontWeight: 950 }}>{money(p.price)}</div>
          </div>
        </div>

        <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "rgba(0,0,0,0.78)", fontWeight: 850 }}>
          {p.bullets.map((b) => (
            <li key={b} style={{ margin: "6px 0", lineHeight: 1.35 }}>
              {b}
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(0,0,0,0.70)",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: selected ? "#b57b17" : "rgba(0,0,0,0.18)",
              boxShadow: selected ? "0 0 0 4px rgba(181,123,23,0.18)" : "none",
            }}
          />
          {selected ? "Selected" : "Select this package"}
        </div>
      </button>
    );
  };

  const selectedIsVideo =
    form.packageChoice === "video" ||
    form.packageChoice === "video_lyrics" ||
    form.packageChoice === "everything_bundle";

  return (
    <CustomSongsShell
      title="Start My Custom Song"
      subtitle={shellSubtitle}
      backHref="/custom-songs"
      badge="ORDER"
      rightSlot={
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 950,
              letterSpacing: ".12em",
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.14)",
              background: "rgba(255,255,255,0.70)",
            }}
          >
            Step {step} of 5
          </div>
        </div>
      }
    >
      {/* STEP 1 */}
      {step === 1 ? (
        <>
          <StepHeader title="Choose package" subtitle="Pick what you want delivered." />

          <div style={{ ...softCard, marginTop: 14 }}>
            <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 6 }}>
              What do you want?
            </div>
            <div style={{ fontWeight: 850, color: "rgba(0,0,0,0.62)", fontSize: 13, marginBottom: 12 }}>
              Choose your package now — you can adjust details later.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              {PACKAGES.map((p) => (
                <PackageCard key={p.id} p={p} selected={form.packageChoice === p.id} />
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 850, color: "rgba(0,0,0,0.65)" }}>
              <b>Audio:</b> delivered as a high-quality file.{" "}
              <b>Photo Video:</b> your photos timed to the music for a polished keepsake.
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" style={btnBase} onClick={resetForm}>
                Reset form
              </button>
              <button
                type="button"
                style={btnNext}
                onClick={() => setStep(2)}
                disabled={!form.packageChoice}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* STEP 2 */}
      {step === 2 ? (
        <>
          <StepHeader title="Your basics" subtitle="So I can deliver and confirm details." />

          <div style={{ ...softCard, marginTop: 14 }}>
            <div style={row2}>
              <div>
                <label style={label}>Your Name *</label>
                <input
                  style={input}
                  value={form.name ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label style={label}>Email *</label>
                <input
                  style={input}
                  value={form.email ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Phone (optional)</label>
              <input
                style={input}
                value={form.phone ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <div style={{ marginTop: 12, fontSize: 13, fontWeight: 850, color: "rgba(0,0,0,0.62)" }}>
              If you’re unsure about anything, leave it blank — I’ll confirm details so it fits your story perfectly.
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" style={btnBase} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="button" style={btnBase} onClick={resetForm}>
                Reset form
              </button>
              <button
                type="button"
                style={btnNext}
                onClick={() => setStep(3)}
                disabled={!form.name || !form.email}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* STEP 3 */}
      {step === 3 ? (
        <>
          <StepHeader title="Song direction" subtitle="Genre, vibe, tempo (optional)." />

          <div style={{ ...softCard, marginTop: 14 }}>
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Song direction (optional)</div>
            <div style={{ fontWeight: 850, color: "rgba(0,0,0,0.62)", fontSize: 13, marginBottom: 12 }}>
              Pick a starting point — I’ll shape it into something polished.
            </div>

            <div style={row2}>
              <div>
                <label style={label}>Genre</label>
                <input
                  style={input}
                  value={form.genre ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
                  placeholder="Country, Pop, Worship, Rock, etc."
                />
              </div>
              <div>
                <label style={label}>Vibe</label>
                <input
                  style={input}
                  value={form.vibe ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, vibe: e.target.value }))}
                  placeholder="Warm & hopeful, emotional, uplifting..."
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={label}>Tempo</label>
              <input
                style={input}
                value={form.tempo ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, tempo: e.target.value }))}
                placeholder="Slow, mid, upbeat"
              />
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" style={btnBase} onClick={() => setStep(2)}>
                ← Back
              </button>
              <button type="button" style={btnBase} onClick={resetForm}>
                Reset form
              </button>
              <button type="button" style={btnNext} onClick={() => setStep(4)}>
                Next →
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* STEP 4 */}
      {step === 4 ? (
        <>
          <StepHeader title="Your story" subtitle="The heart of the song." />

          <div style={{ ...softCard, marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
              <div>
                <label style={label}>Occasion</label>
                <input
                  style={input}
                  value={form.occasion ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))}
                />
              </div>
              <div>
                <label style={label}>Recipient name</label>
                <input
                  style={input}
                  value={form.recipientName ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))}
                />
              </div>
              <div>
                <label style={label}>Your relationship</label>
                <input
                  style={input}
                  value={form.relationship ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value }))}
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
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 850, color: "rgba(0,0,0,0.60)" }}>
                Best results: key moments + what you want the song to “speak over” the person.
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" style={btnBase} onClick={() => setStep(3)}>
                ← Back
              </button>
              <button type="button" style={btnBase} onClick={resetForm}>
                Reset form
              </button>
              <button type="button" style={btnNext} onClick={() => setStep(5)}>
                Next →
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* STEP 5 */}
      {step === 5 ? (
        <>
          <StepHeader title="Review & continue" subtitle="Quick check before the review page." />

          <div style={{ ...softCard, marginTop: 14 }}>
            <div style={{ fontWeight: 950, marginBottom: 10 }}>Quick review</div>

            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "rgba(255,255,255,0.80)",
                padding: 14,
                fontSize: 13,
                fontWeight: 850,
                color: "rgba(0,0,0,0.78)",
                lineHeight: 1.6,
              }}
            >
              <div>
                <b>Package:</b>{" "}
                {selectedPkg ? `${selectedPkg.title} (${money(selectedPkg.price)})` : "—"}
              </div>
              <div>
                <b>Name:</b> {form.name || "—"} &nbsp; • &nbsp; <b>Email:</b>{" "}
                {form.email || "—"}
              </div>
              <div>
                <b>Occasion:</b> {form.occasion || "—"} &nbsp; • &nbsp;{" "}
                <b>Recipient:</b> {form.recipientName || "—"}
              </div>
              <div>
                <b>Genre:</b> {form.genre || "—"} &nbsp; • &nbsp; <b>Vibe:</b>{" "}
                {form.vibe || "—"} &nbsp; • &nbsp; <b>Tempo:</b>{" "}
                {form.tempo || "—"}
              </div>
              <div>
                <b>Must-include:</b> {form.mustInclude || "—"}
              </div>
            </div>

            {selectedIsVideo ? (
              <>
                <div style={{ marginTop: 14, fontWeight: 950 }}>Photo Music Video (optional)</div>
                <div style={{ ...row2, marginTop: 10 }}>
                  <div>
                    <label style={label}>Approx photo count</label>
                    <input
                      style={input}
                      value={form.photoCount ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, photoCount: e.target.value }))}
                      placeholder="e.g., 15"
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
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 850, color: "rgba(0,0,0,0.60)" }}>
                  You can change this later. I’ll guide you on the best photo count for pacing.
                </div>
              </>
            ) : null}

            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 850, color: "rgba(0,0,0,0.62)" }}>
              Next you’ll go to the Review page to confirm everything and submit.
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
              <button type="button" style={btnBase} onClick={() => setStep(4)}>
                ← Back
              </button>
              <button type="button" style={btnBase} onClick={resetForm}>
                Reset form
              </button>

              <Link href="/custom-songs/review" style={btnGold}>
                Continue to Review →
              </Link>

              {selectedIsVideo ? (
                <Link href="/custom-songs/photos" style={btnBase}>
                  Add Photo Video Details
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </CustomSongsShell>
  );
}
