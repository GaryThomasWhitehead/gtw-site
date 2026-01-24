"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

export default function SamplesPage() {
  const containerStyle: React.CSSProperties = {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "36px 18px",
    fontFamily: '"Georgia","Times New Roman",serif',
    color: "#111",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 22,
    marginTop: 18,
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#fff",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  };

  const headerStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontWeight: 900,
    fontSize: 18,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  };

  const tagStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 900,
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.2)",
    display: "inline-block",
    marginLeft: 10,
  };

  const yt = (id: string) =>
    `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;

  return (
    <main style={containerStyle}>
      <h1 style={{ marginBottom: 10, fontSize: 42, fontWeight: 900 }}>
        Sample Songs & Videos
      </h1>

      <p style={{ color: "#333", lineHeight: 1.8, fontSize: 18, fontWeight: 600 }}>
        Here are a few examples of my music and video storytelling — including full
        video samples and song demos.
      </p>

      <Link
        href="/custom-songs"
        style={{
          fontWeight: 900,
          fontSize: 18,
          textDecoration: "none",
          display: "inline-block",
          marginTop: 10,
        }}
      >
        ← Back to Custom Songs
      </Link>

      {/* ===== VIDEO SAMPLES ===== */}
      <h2 style={{ marginTop: 28, fontSize: 30, fontWeight: 900 }}>
        Video Samples
      </h2>

      <div style={gridStyle}>
        {/* Not for Sale */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            Not for Sale <span style={tagStyle}>Video</span>
          </div>

          <video
            controls
            preload="metadata"
            style={{ width: "100%", display: "block" }}
            onPlay={() => track("SampleVideoPlay", { title: "Not for Sale" })}
          >
            <source src="/videos/not-for-sale.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Still Holding My Hand — FIXED PATH */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            Still Holding My Hand <span style={tagStyle}>Video</span>
          </div>

          <video
            controls
            preload="metadata"
            style={{ width: "100%", display: "block" }}
            onPlay={() =>
              track("SampleVideoPlay", { title: "Still Holding My Hand" })
            }
          >
            <source src="/videos/still-holding-my-hand.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* ===== SONG SAMPLES ===== */}
      <h2 style={{ marginTop: 32, fontSize: 30, fontWeight: 900 }}>
        Song Samples (YouTube)
      </h2>

      <div style={gridStyle}>
        {/* Same Quiet Fire */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            Same Quiet Fire <span style={tagStyle}>YouTube</span>
          </div>

          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              title="Same Quiet Fire"
              src={yt("c6R3qfdRhOM")}
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        </div>

        {/* Father and Sons */}
        <div style={cardStyle}>
          <div style={headerStyle}>
            Father and Sons <span style={tagStyle}>YouTube</span>
          </div>

          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              title="Father and Sons"
              src={yt("PoM8Byk7bfk")}
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
