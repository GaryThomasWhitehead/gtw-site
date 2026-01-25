"use client";

import React from "react";

function getYouTubeId(url: string) {
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (v) return v;
    // fallback for youtu.be/ID
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
  } catch {
    // ignore
  }
  return "";
}

export default function YouTubeEmbed({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const id = getYouTubeId(url);
  const src = id ? `https://www.youtube.com/embed/${id}` : url;

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.12)",
        background: "#000",
        boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
      }}
    >
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
        <iframe
          title={title}
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
  );
}
