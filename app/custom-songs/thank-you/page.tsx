"use client";

import Link from "next/link";
import CustomSongsShell from "@/components/CustomSongsShell";

export default function ThankYouPage() {
  const box: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
    padding: 18,
    fontWeight: 800,
    lineHeight: 1.85,
    fontSize: 17,
  };

  const btn: React.CSSProperties = {
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
  };

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS"
      title="You’re all set"
      subtitle="Thank you. If you already submitted the request email, I’ll respond and confirm details so the lyrics fit your story perfectly."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
    >
      <div style={box}>
        <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Next steps</div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>I’ll confirm key details with you (names, timeline, vibe, any must-include lines).</li>
          <li>Then I’ll write and record your song.</li>
          <li>If you chose the Photo Music Video, I’ll guide you on the best photo count + pacing.</li>
        </ul>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
          <Link href="/custom-songs/samples" style={btn}>
            Watch Samples
          </Link>
          <Link href="/custom-songs" style={btn}>
            Back to Options
          </Link>
        </div>
      </div>
    </CustomSongsShell>
  );
}
