"use client";

import CustomSongsShell from "@/components/CustomSongsShell";

export default function ReviewsPage() {
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  };

  const card: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.78)",
    padding: 18,
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
  };

  const quote: React.CSSProperties = {
    fontWeight: 900,
    fontSize: 16,
    marginBottom: 10,
  };

  const body: React.CSSProperties = {
    margin: 0,
    lineHeight: 1.7,
    fontSize: 16,
    fontWeight: 700,
    color: "#222",
  };

  return (
    <CustomSongsShell
      title="Reviews"
      subtitle="A few words from people who ordered a custom song or Photo Music Video."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
      badge="REVIEWS"
    >
      <div style={grid}>
        <div style={card}>
          <div style={quote}>
            “Still holding my hand. Wow! Thank you Gary for writing a personal song for my mom and me.”
          </div>
          <p style={body}>
            You completely captured the relationship my mom and I share. The song <em>Still Holding My Hand</em> will be
            cherished forever. I believe I am not the only one who this song will touch. Thank you Gary for such a
            priceless treasure.
            <br />
            <br />
            — Brenda W.
          </p>
        </div>

        <div style={card}>
          <div style={quote}>“It felt like you wrote our story.”</div>
          <p style={body}>
            The lyrics were spot on and the emotion came through. It wasn’t generic — it was us.
          </p>
        </div>

        <div style={card}>
          <div style={quote}>“The video made everyone cry (in a good way).”</div>
          <p style={body}>
            The photos hit at exactly the right moments. It looked clean and premium — like a real music video.
          </p>
        </div>

        <div style={card}>
          <div style={quote}>“Fast communication and easy process.”</div>
          <p style={body}>
            We didn’t have everything figured out — you guided us and made it simple.
          </p>
        </div>

        <div style={card}>
          <div style={quote}>“A keepsake we’ll watch for years.”</div>
          <p style={body}>
            The song is beautiful, and the video turns it into something we can share forever.
          </p>
        </div>
      </div>
    </CustomSongsShell>
  );
}
