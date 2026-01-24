"use client";

import React, { useEffect, useRef, useState } from "react";

export default function MoreMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const btn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#111",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 1px 0 rgba(0,0,0,.06)",
  };

  const menu: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    minWidth: 240,
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 12,
    boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
    overflow: "hidden",
    zIndex: 50,
  };

  const item: React.CSSProperties = {
    display: "block",
    padding: "12px 14px",
    textDecoration: "none",
    color: "#111",
    fontWeight: 700,
    fontSize: 14,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  };

  const itemLast: React.CSSProperties = { ...item, borderBottom: "none" };

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        style={btn}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        More <span style={{ fontSize: 12 }}>▼</span>
      </button>

      {open && (
        <div style={menu} role="menu" aria-label="More custom songs links">
          <a href="/custom-songs/samples" style={item} role="menuitem">
            Sample Songs &amp; Videos
          </a>
          <a href="/custom-songs/reviews" style={item} role="menuitem">
            Customer Reviews
          </a>
          <a href="/custom-songs/faq" style={itemLast} role="menuitem">
            FAQ
          </a>
        </div>
      )}
    </div>
  );
}
