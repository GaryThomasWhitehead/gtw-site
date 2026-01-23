import React from "react";

export default function CustomSongsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={pageWrap}>
      <div style={bgImage} aria-hidden="true" />
      <div style={bgOverlay} aria-hidden="true" />
      <div style={contentWrap}>{children}</div>
    </div>
  );
}

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  position: "relative",
};

const bgImage: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundImage: `url("/backgrounds/custom-songs-bg.png")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  filter: "blur(2px)",
  transform: "scale(1.03)", // prevents blur edge lines
  opacity: 0.45,
  pointerEvents: "none",
  zIndex: 0,
};

const bgOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(circle at top, rgba(255,255,255,0.35), rgba(250,249,246,0.90))",
  pointerEvents: "none",
  zIndex: 0,
};

const contentWrap: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
};
