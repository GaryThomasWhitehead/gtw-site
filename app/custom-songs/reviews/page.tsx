"use client";

import CustomSongsShell from "@/components/CustomSongsShell";

export default function ReviewsPage() {
  const card: React.CSSProperties = {
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
    padding: 18,
    marginBottom: 12,
    fontWeight: 800,
    lineHeight: 1.9,
    fontSize: 17,
  };

  const name: React.CSSProperties = { fontWeight: 900, marginBottom: 6, fontSize: 18 };

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS • REVIEWS"
      title="What People Say"
      subtitle="A few notes on what listeners tend to love: the personal details, the emotion, and the way the song feels like it was always theirs."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
    >
      <div style={card}>
        <div style={name}>“It felt like you wrote our story.”</div>
        The lyrics were spot on and the emotion came through. It wasn’t generic — it was personal.
      </div>

      <div style={card}>
        <div style={name}>“The video made everyone cry (in a good way).”</div>
        The photos hit at exactly the right moments. It looked clean and professional.
      </div>

      <div style={card}>
        <div style={name}>“Fast communication and easy process.”</div>
        We didn’t have everything figured out — you guided us and made it simple.
      </div>
    </CustomSongsShell>
  );
}
