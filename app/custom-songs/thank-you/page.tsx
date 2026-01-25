"use client";

import Link from "next/link";
import CustomSongsShell from "@/components/CustomSongsShell";

export default function ThankYouPage() {
  const box: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.78)",
    padding: 18,
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
    lineHeight: 1.7,
    fontSize: 17,
    fontWeight: 800,
    color: "#222",
  };

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
    marginTop: 14,
  };

  return (
    <CustomSongsShell
      title="You’re All Set"
      subtitle="Thank you — once I receive your request, I’ll confirm details so the lyrics fit your story."
      backHref="/custom-songs"
      badge="THANK YOU"
    >
      <div style={box}>
        If you have a deadline (birthday, memorial, anniversary date), email it to me and I’ll confirm timeline.
        <br />
        <br />
        Next step: I’ll reply with any clarifying questions and the plan for your song (and photo video if chosen).
      </div>

      <Link href="/custom-songs" style={btn}>
        Back to Custom Songs
      </Link>
    </CustomSongsShell>
  );
}
