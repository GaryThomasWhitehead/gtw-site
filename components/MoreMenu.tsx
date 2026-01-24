"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";

export default function MoreMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          track("MoreMenuToggle");
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          background: "#fff",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 1px 0 rgba(0,0,0,.06), 0 8px 16px rgba(0,0,0,.04)",
        }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        More <span style={{ fontSize: 12 }}>▼</span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            minWidth: 220,
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,.12)",
            zIndex: 50,
          }}
        >
          <MenuItem href="/custom-songs" label="View Custom Song Options" event="MoreMenuOptionsClick" />
          <MenuItem href="/custom-songs/samples" label="Hear Samples" event="MoreMenuSamplesClick" />
          <MenuItem href="/custom-songs/reviews" label="Read Reviews" event="MoreMenuReviewsClick" />
          <MenuItem href="/custom-songs/faq" label="FAQ" event="MoreMenuFaqClick" />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  label,
  event,
}: {
  href: string;
  label: string;
  event: string;
}) {
  return (
    <a
      href={href}
      role="menuitem"
      onClick={() => track(event)}
      style={{
        display: "block",
        padding: "12px 14px",
        textDecoration: "none",
        color: "#111",
        fontWeight: 700,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {label}
    </a>
  );
}
