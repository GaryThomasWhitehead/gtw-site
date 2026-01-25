"use client";

import CustomSongsShell from "@/components/CustomSongsShell";

export default function FAQPage() {
  const item: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
    padding: 18,
    marginBottom: 12,
  };

  const q: React.CSSProperties = { margin: 0, fontSize: 20, fontWeight: 900 };
  const a: React.CSSProperties = { margin: "8px 0 0", fontSize: 17, fontWeight: 800, lineHeight: 1.9, color: "#1a1a1a" };

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS • FAQ"
      title="Frequently Asked Questions"
      subtitle="Simple answers, no fluff. If your question isn’t here, submit the form and ask — I respond fast."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
    >
      <div style={item}>
        <h3 style={q}>How does it work?</h3>
        <p style={a}>You share the story and key details, I confirm anything missing, then I write and record your custom song.</p>
      </div>

      <div style={item}>
        <h3 style={q}>What if I don’t know all the details?</h3>
        <p style={a}>Leave it blank — I’ll confirm details with you so the lyrics feel accurate and personal.</p>
      </div>

      <div style={item}>
        <h3 style={q}>What is a Photo Music Video?</h3>
        <p style={a}>Your custom song plus a cinematic slideshow/video made from your photos — paced to the music and edited cleanly.</p>
      </div>

      <div style={item}>
        <h3 style={q}>Can it be emotional / faith-based / uplifting?</h3>
        <p style={a}>Absolutely. You can guide the tone: heartfelt, hopeful, reflective, worshipful — whatever fits your message.</p>
      </div>

      <div style={item}>
        <h3 style={q}>How many photos should I send?</h3>
        <p style={a}>Usually 20–40 works great, but I’ll guide you based on the song length and pacing you want.</p>
      </div>
    </CustomSongsShell>
  );
}
