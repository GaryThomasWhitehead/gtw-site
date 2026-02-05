"use client";

import CustomSongsShell from "@/components/CustomSongsShell";

export default function FAQPage() {
  const item: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.78)",
    padding: 18,
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
    marginBottom: 14,
  };

  const q: React.CSSProperties = { margin: 0, fontSize: 18, fontWeight: 900 };
  const a: React.CSSProperties = {
    margin: "8px 0 0",
    lineHeight: 1.7,
    fontSize: 16,
    fontWeight: 700,
    color: "#222",
  };

  return (
    <CustomSongsShell
      title="FAQ"
      subtitle="Quick answers about custom songs and Photo Music Videos."
      backHref="/custom-songs"
      badge="FAQ"
    >
      <div style={item}>
        <h3 style={q}>How does the process work?</h3>
        <p style={a}>
          You fill out the order details, I confirm the story + vibe, then I write and record your song.
          If you choose the video option, we’ll coordinate photos and timing.
        </p>
      </div>

      <div style={item}>
        <h3 style={q}>How long does it take?</h3>
        <p style={a}>
          Turnaround depends on workload and complexity. If you have a deadline, include it in your notes and I’ll confirm.
        </p>
      </div>

      <div style={item}>
        <h3 style={q}>Do I get revisions?</h3>
        <p style={a}>
          Yes — I’ll make reasonable adjustments so it fits your story. The goal is “this feels like us.”
        </p>
      </div>

      <div style={item}>
        <h3 style={q}>What do I receive?</h3>
        <p style={a}>
          You’ll receive the final song audio. If you choose the Photo Music Video option, you’ll also receive the finished video file.
        </p>
      </div>
    </CustomSongsShell>
  );
}