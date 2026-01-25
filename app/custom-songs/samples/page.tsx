"use client";

import Link from "next/link";
import CustomSongsShell from "@/components/CustomSongsShell";
import YouTubeEmbed from "@/components/YouTubeEmbed";

export default function SamplesPage() {
  const sectionTitle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 900,
    margin: "10px 0 14px",
    letterSpacing: "-0.01em",
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 18,
    alignItems: "start",
  };

  const card: React.CSSProperties = {
    gridColumn: "span 12",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
    overflow: "hidden",
  };

  const head: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderBottom: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.92)",
  };

  const tag: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.14)",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: ".06em",
    background: "rgba(255,255,255,0.85)",
  };

  const title: React.CSSProperties = { margin: 0, fontSize: 18, fontWeight: 900 };

  const bodyPad: React.CSSProperties = { padding: 14 };

  const videoWrap: React.CSSProperties = {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#000",
    boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
  };

  const twoCol: React.CSSProperties = {
    gridColumn: "span 12",
  };

  const responsiveTwoCol: React.CSSProperties = {
    ...twoCol,
  };

  return (
    <CustomSongsShell
      badge="CUSTOM SONGS • SAMPLES"
      title="Sample Songs & Videos"
      subtitle="Here are a few examples of my music and video storytelling — including full video samples and song demos."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
      rightSlot={
        <Link
          href="/custom-songs/genre"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "9px 12px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.14)",
            background: "rgba(255,255,255,0.90)",
            fontWeight: 900,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Start a Request →
        </Link>
      }
    >
      <h2 style={sectionTitle}>Video Samples</h2>

      <div style={grid}>
        <div style={{ ...card, ...responsiveTwoCol }}>
          <div style={head}>
            <h3 style={title}>Not for Sale</h3>
            <span style={tag}>VIDEO</span>
          </div>
          <div style={bodyPad}>
            <div style={videoWrap}>
              <video
                controls
                preload="metadata"
                playsInline
                style={{ width: "100%", height: "auto", display: "block" }}
              >
                <source src="/videos/not-for-sale.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        <div style={{ ...card, ...responsiveTwoCol }}>
          <div style={head}>
            <h3 style={title}>Still Holding My Hand</h3>
            <span style={tag}>VIDEO</span>
          </div>
          <div style={bodyPad}>
            <div style={videoWrap}>
              <video
                controls
                preload="metadata"
                playsInline
                style={{ width: "100%", height: "auto", display: "block" }}
              >
                <source src="/videos/still-holding-my-hand.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <h2 style={sectionTitle}>Song Samples (YouTube)</h2>

      <div style={grid}>
        <div style={{ ...card, gridColumn: "span 12" }}>
          <div style={head}>
            <h3 style={title}>Same Quiet Fire</h3>
            <span style={tag}>YOUTUBE</span>
          </div>
          <div style={bodyPad}>
            <YouTubeEmbed
              title="Same Quiet Fire — YouTube"
              url="https://www.youtube.com/watch?v=c6R3qfdRhOM&list=OLAK5uy_kZGgD3IjVszE8noJm0PAtdyhi3Ytl52Yw"
            />
          </div>
        </div>

        <div style={{ ...card, gridColumn: "span 12" }}>
          <div style={head}>
            <h3 style={title}>Father and Sons</h3>
            <span style={tag}>YOUTUBE</span>
          </div>
          <div style={bodyPad}>
            <YouTubeEmbed
              title="Father and Sons — YouTube"
              url="https://www.youtube.com/watch?v=PoM8Byk7bfk&list=OLAK5uy_ndeK0fJs0xat10zmdi3ZdWYQfpfnRXnTQ"
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 900px) {
          .twoColFix {
            grid-column: span 6 !important;
          }
        }
      `}</style>
    </CustomSongsShell>
  );
}
