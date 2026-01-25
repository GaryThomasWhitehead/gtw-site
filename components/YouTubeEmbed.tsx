"use client";

import React from "react";

function getYouTubeId(url: string) {
  try {
    const u = new URL(url);

    // standard watch?v=
    const v = u.searchParams.get("v");
    if (v) return v;

    // youtu.be/ID
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "").trim();
    }

    // /embed/ID
    if (u.pathname.includes("/embed/")) {
      return u.pathname.split("/embed/")[1]?.split("?")[0] ?? "";
    }

    return "";
  } catch {
    return "";
  }
}

export default function YouTubeEmbed({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const id = getYouTubeId(url);
  const src = id
    ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    : url;

  const wrap: React.CSSProperties = {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#000",
    boxShadow: "0 14px 34px rgba(0,0,0,0.16)",
  };

  const ratio: React.CSSProperties = {
    position: "relative",
    width: "100%",
    paddingTop: "56.25%", // 16:9
  };

  const iframe: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: 0,
  };

  return (
    <div style={wrap}>
      <div style={ratio}>
        <iframe
          title={title}
          src={src}
          style={iframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
