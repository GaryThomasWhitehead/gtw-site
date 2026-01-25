"use client";

import CustomSongsShell from "@/components/CustomSongsShell";
import YouTubeEmbed from "@/components/YouTubeEmbed";

export default function SamplesPage() {
  const sectionTitle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 900,
    margin: "0 0 12px",
    letterSpacing: "-0.01em",
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  };

  const card: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
    overflow: "hidden",
  };

  const head: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    background: "rgba(255,255,255,0.92)",
    borderBottom: "1px solid rgba(0,0,0,0.10)",
  };

  const name: React.CSSProperties = { fontWeight: 900, fontSize: 16, margin: 0 };

  const tag: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 900,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.75)",
  };

  const videoWrap: React.CSSProperties = {
    background: "#000",
  };

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
    display: "block",
  };

  const note: React.CSSProperties = {
    margin: "0 0 18px",
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.65,
    color: "#222",
    maxWidth: 960,
  };

  return (
    <CustomSongsShell
      title="Sample Songs & Videos"
      subtitle="Here are a few examples of my music and video storytelling — including full video samples and song demos."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
      badge="SAMPLES"
    >
      <p style={note}>
        Want something like this for your story? I can deliver audio-only or a full{" "}
        <strong>Photo Music Video</strong> (your pictures timed to the song).
      </p>

      <h2 style={sectionTitle}>Video Samples</h2>

      <div style={grid2}>
        {/* Not for Sale */}
        <div style={card}>
          <div style={head}>
            <p style={name}>Not for Sale</p>
            <span style={tag}>Video</span>
          </div>
          <div style={videoWrap}>
            <video controls preload="metadata" playsInline style={videoStyle}>
              <source src="/videos/not-for-sale.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Still Holding My Hand */}
        <div style={card}>
          <div style={head}>
            <p style={name}>Still Holding My Hand</p>
            <span style={tag}>Video</span>
          </div>
          <div style={videoWrap}>
            <video controls preload="metadata" playsInline style={videoStyle}>
              <source src="/videos/still-holding-my-hand.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <h2 style={sectionTitle}>Song Samples (YouTube)</h2>

      <div style={grid2}>
        <div style={card}>
          <div style={head}>
            <p style={name}>Same Quiet Fire</p>
            <span style={tag}>YouTube</span>
          </div>
          <div style={{ padding: 14 }}>
            <YouTubeEmbed
              title="Same Quiet Fire — YouTube"
              url="https://www.youtube.com/watch?v=c6R3qfdRhOM&list=OLAK5uy_kZGgD3IjVszE8noJm0PAtdyhi3Ytl52Yw"
            />
          </div>
        </div>

        <div style={card}>
          <div style={head}>
            <p style={name}>Father and Sons</p>
            <span style={tag}>YouTube</span>
          </div>
          <div style={{ padding: 14 }}>
            <YouTubeEmbed
              title="Father and Sons — YouTube"
              url="https://www.youtube.com/watch?v=PoM8Byk7bfk&list=OLAK5uy_ndeK0fJs0xat10zmdi3ZdWYQfpfnRXnTQ"
            />
          </div>
        </div>
      </div>
    </CustomSongsShell>
  );
}
