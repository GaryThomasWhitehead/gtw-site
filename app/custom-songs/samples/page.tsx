"use client";

import React from "react";
import CustomSongsShell from "@/components/CustomSongsShell";
import YouTubeEmbed from "@/components/YouTubeEmbed";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 22, marginBottom: 10 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 950,
          letterSpacing: 0.2,
          color: "#111",
        }}
      >
        {children}
      </h2>
      <div
        style={{
          marginTop: 10,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0.06), rgba(0,0,0,0.18))",
        }}
      />
    </div>
  );
}

function MediaCard({
  title,
  tag,
  children,
}: {
  title: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(255,255,255,0.86)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.14)",
        overflow: "hidden",
        transform: "translateZ(0)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.90), rgba(255,255,255,0.70))",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 950, color: "#111" }}>{title}</div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.14)",
            background: "rgba(255,255,255,0.82)",
            color: "#222",
          }}
        >
          {tag}
        </div>
      </div>

      {children}
    </div>
  );
}

function Ratio16x9({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#0b0b0b" }}>
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
}

export default function SamplesPage() {
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  };

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "contain",
    background: "#0b0b0b",
  };

  return (
    <CustomSongsShell
      title="Sample Songs & Videos"
      subtitle="Here are a few examples of my music and video storytelling — including full video samples and song demos."
      backHref="/custom-songs"
      backLabel="← Back to Custom Songs"
      badge="SAMPLES"
    >
      {/* Stronger, more premium intro */}
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 18,
          lineHeight: 1.65,
          fontWeight: 850,
          color: "rgba(0,0,0,0.78)",
          maxWidth: 900,
        }}
      >
        These are real examples of how I blend songwriting + timing + emotion into a polished keepsake.
        If you want a story-driven custom song (or a Photo Music Video), this is the level of finish you can expect.
      </p>

      <div
        style={{
          margin: "14px 0 18px",
          padding: "14px 16px",
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.10)",
          background: "rgba(255,255,255,0.72)",
          boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
          fontSize: 16,
          lineHeight: 1.65,
          fontWeight: 850,
          color: "rgba(0,0,0,0.74)",
        }}
      >
        Want something like this for your story? I can deliver <b>audio-only</b> or a full{" "}
        <b>Photo Music Video</b> (your pictures timed to the song).
      </div>

      <SectionTitle>Video Samples</SectionTitle>

      <div style={grid}>
        <MediaCard title="Not for Sale" tag="Video">
          <Ratio16x9>
            <video style={videoStyle} controls preload="metadata" playsInline>
              <source src="/videos/not-for-sale.mp4" type="video/mp4" />
            </video>
          </Ratio16x9>
        </MediaCard>

        <MediaCard title="Still Holding My Hand" tag="Video">
          <Ratio16x9>
            <video style={videoStyle} controls preload="metadata" playsInline>
              <source src="/videos/still-holding-my-hand.mp4" type="video/mp4" />
            </video>
          </Ratio16x9>
        </MediaCard>
      </div>

      <SectionTitle>Song Samples</SectionTitle>

      <div style={grid}>
        <MediaCard title="Same Quiet Fire" tag="YouTube">
          <YouTubeEmbed
            title="Same Quiet Fire"
            url="https://www.youtube.com/watch?v=c6R3qfdRhOM&list=OLAK5uy_kZGgD3IjVszE8noJm0PAtdyhi3Ytl52Yw"
          />
        </MediaCard>

        <MediaCard title="Father and Sons" tag="YouTube">
          <YouTubeEmbed
            title="Father and Sons"
            url="https://www.youtube.com/watch?v=PoM8Byk7bfk&list=OLAK5uy_ndeK0fJs0xat10zmdi3ZdWYQfpfnRXnTQ"
          />
        </MediaCard>
      </div>

      <p
        style={{
          margin: "16px 0 0",
          fontSize: 14,
          fontWeight: 800,
          color: "rgba(0,0,0,0.60)",
        }}
      >
        Tip: if a video ever “loads but won’t play,” it’s usually encoding/codec — the re-encode fix you did is the right move.
      </p>
    </CustomSongsShell>
  );
}
