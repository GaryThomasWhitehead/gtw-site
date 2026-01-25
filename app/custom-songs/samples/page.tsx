"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

function youtubeEmbed(url: string) {
  // Supports: https://www.youtube.com/watch?v=VIDEO_ID ... and youtu.be/VIDEO_ID
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
  } catch {
    return url;
  }
}

function Card({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(12,12,12,0.55)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: ".02em",
            color: "#fff",
          }}
        >
          {title}
        </div>
        <span
          style={{
            marginLeft: 6,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: ".08em",
            color: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(255,255,255,0.22)",
            padding: "3px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.28)",
          }}
        >
          {badge}
        </span>
      </div>

      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function MediaFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "#000",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ position: "relative", paddingTop: "56.25%" }}>
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
}

export default function SamplesPage() {
  const bgStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundImage: "url('/backgrounds/custom-songs-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    padding: "44px 16px",
  };

  const container: React.CSSProperties = {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "0 8px",
    fontFamily: '"Georgia","Times New Roman",serif',
    color: "#111",
  };

  const glass: React.CSSProperties = {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.10)",
    boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
    padding: 26,
    backdropFilter: "blur(10px)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 50,
    fontWeight: 900,
    margin: "10px 0 10px",
    letterSpacing: "-0.02em",
    color: "#111",
    textShadow: "0 2px 12px rgba(255,255,255,0.55)",
  };

  const leadStyle: React.CSSProperties = {
    fontSize: 20,
    fontWeight: 800,
    color: "rgba(0,0,0,0.82)",
    lineHeight: 1.65,
    marginTop: 0,
    marginBottom: 16,
    maxWidth: 900,
    textShadow: "0 2px 10px rgba(255,255,255,0.55)",
  };

  const backLink: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 900,
    textDecoration: "none",
    color: "#111",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    background: "rgba(255,255,255,0.75)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 950,
    margin: "22px 0 12px",
    letterSpacing: ".02em",
    color: "#111",
    textShadow: "0 2px 10px rgba(255,255,255,0.45)",
  };

  const subtle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: ".10em",
    color: "rgba(0,0,0,0.62)",
    textTransform: "uppercase",
    margin: 0,
  };

  const grid2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  };

  const gridResponsive: React.CSSProperties = {
    ...grid2,
  };

  // You provided these:
  const ytSameQuietFire =
    "https://www.youtube.com/watch?v=c6R3qfdRhOM&list=OLAK5uy_kZGgD3IjVszE8noJm0PAtdyhi3Ytl52Yw";
  const ytFatherAndSons =
    "https://www.youtube.com/watch?v=PoM8Byk7bfk&list=OLAK5uy_ndeK0fJs0xat10zmdi3ZdWYQfpfnRXnTQ";

  return (
    <main style={bgStyle}>
      <div style={container}>
        <div style={glass}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/custom-songs"
              style={backLink}
              onClick={() => track("SamplesBackToCustomSongs")}
            >
              ← Back to Custom Songs
            </Link>

            <div
              style={{
                fontSize: 12,
                fontWeight: 950,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.75)",
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.15)",
                background: "rgba(255,255,255,0.65)",
              }}
            >
              Samples • Video & Music
            </div>
          </div>

          <h1 style={titleStyle}>Sample Songs &amp; Videos</h1>
          <p style={leadStyle}>
            Here are a few examples of my music and video storytelling —{" "}
            <strong>including full video samples</strong> and{" "}
            <strong>song demos</strong>.
          </p>

          <p style={subtle}>Video Samples</p>
          <h2 style={sectionTitle}>Cinematic Video Showcases</h2>

          <div
            style={gridResponsive}
            className="samplesGrid"
            aria-label="Video samples"
          >
            <Card title="Not for Sale" badge="Video">
              <MediaFrame>
                <video
                  controls
                  preload="metadata"
                  playsInline
                  style={{ width: "100%", height: "100%", display: "block" }}
                >
                  <source src="/videos/not-for-sale.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </MediaFrame>

              <div style={{ marginTop: 12, color: "rgba(255,255,255,0.88)" }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>
                  Awareness video sample
                </div>
                <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
                  A full music video created to raise awareness and spark
                  action.
                </div>
              </div>
            </Card>

            <Card title="Still Holding My Hand" badge="Video">
              <MediaFrame>
                <video
                  controls
                  preload="metadata"
                  playsInline
                  style={{ width: "100%", height: "100%", display: "block" }}
                >
                  {/* IMPORTANT: this must match the actual filename exactly */}
                  <source
                    src="/videos/still-holding-my-hand.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </MediaFrame>

              <div style={{ marginTop: 12, color: "rgba(255,255,255,0.88)" }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>
                  Emotional storytelling video sample
                </div>
                <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
                  A heartfelt music video built around a personal story and
                  meaningful visuals.
                </div>
              </div>
            </Card>
          </div>

          <p style={{ ...subtle, marginTop: 24 }}>Song Samples</p>
          <h2 style={sectionTitle}>YouTube Song Demos</h2>

          <div
            style={gridResponsive}
            className="samplesGrid"
            aria-label="YouTube song samples"
          >
            <Card title="Same Quiet Fire" badge="YouTube">
              <MediaFrame>
                <iframe
                  title="Same Quiet Fire — YouTube"
                  src={youtubeEmbed(ytSameQuietFire)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: 0,
                    display: "block",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </MediaFrame>

              <div style={{ marginTop: 12, color: "rgba(255,255,255,0.88)" }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>
                  Original song demo
                </div>
                <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
                  A warm, cinematic track showcasing emotional melody and lyric
                  storytelling.
                </div>
              </div>
            </Card>

            <Card title="Father and Sons" badge="YouTube">
              <MediaFrame>
                <iframe
                  title="Father and Sons — YouTube"
                  src={youtubeEmbed(ytFatherAndSons)}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: 0,
                    display: "block",
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </MediaFrame>

              <div style={{ marginTop: 12, color: "rgba(255,255,255,0.88)" }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>
                  Original song demo
                </div>
                <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
                  A powerful, reflective song built for meaning and connection.
                </div>
              </div>
            </Card>
          </div>

          {/* Responsive helper */}
          <style jsx>{`
            @media (max-width: 980px) {
              .samplesGrid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </div>
      </div>
    </main>
  );
}
