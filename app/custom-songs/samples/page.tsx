"use client";

import React from "react";
import CustomSongsShell from "@/components/CustomSongsShell";
import YouTubeEmbed from "@/components/YouTubeEmbed";

function Divider() {
  return (
    <div
      style={{
        marginTop: 12,
        height: 1,
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.22), rgba(0,0,0,0.06), rgba(0,0,0,0.22))",
      }}
    />
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginTop: 26, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 950,
            letterSpacing: 0.2,
            color: "#111",
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <div style={{ fontSize: 14, fontWeight: 850, color: "rgba(0,0,0,0.60)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      <Divider />
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
        borderRadius: 20,
        border: "1px solid rgba(0,0,0,0.11)",
        background: "rgba(255,255,255,0.88)",
        boxShadow: "0 22px 62px rgba(0,0,0,0.16)",
        overflow: "hidden",
        transform: "translateZ(0)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 28px 78px rgba(0,0,0,0.18)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 22px 62px rgba(0,0,0,0.16)";
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
            "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 950, color: "#111" }}>{title}</div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 950,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.16)",
            background: "rgba(255,255,255,0.86)",
            color: "#222",
            letterSpacing: 0.3,
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
    <div
      style={{
        background: "#0b0b0b",
        position: "relative",
      }}
    >
      {/* subtle cinematic glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -40,
          background:
            "radial-gradient(600px 260px at 50% 20%, rgba(255,255,255,0.14), rgba(0,0,0,0) 60%)",
          pointerEvents: "none",
        }}
      />
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
    gap: 18,
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
      {/* More premium top copy */}
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 18,
          lineHeight: 1.65,
          fontWeight: 900,
          color: "rgba(0,0,0,0.78)",
          maxWidth: 920,
          textShadow: "0 1px 0 rgba(255,255,255,0.35)",
        }}
      >
        These are real examples of how I blend songwriting, timing, and emotion into a polished keepsake.
        If you want a story-driven custom song (or a Photo Music Video), this is the level of finish you can expect.
      </p>

      {/* Premium callout */}
      <div
        style={{
          margin: "14px 0 18px",
          padding: "14px 16px",
          borderRadius: 18,
          border: "1px solid rgba(0,0,0,0.11)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.60))",
          boxShadow: "0 18px 44px rgba(0,0,0,0.12)",
          fontSize: 16,
          lineHeight: 1.65,
          fontWeight: 900,
          color: "rgba(0,0,0,0.74)",
        }}
      >
        Want something like this for your story? I can deliver <b>audio-only</b> or a full{" "}
        <b>Photo Music Video</b> (your pictures timed to the song).
      </div>

      <SectionTitle title="Video Samples" subtitle="Full-length examples" />

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

      <SectionTitle title="Song Samples" subtitle="YouTube demos" />

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
    </CustomSongsShell>
  );
}
