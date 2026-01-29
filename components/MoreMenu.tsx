"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 800,
    textDecoration: "none",
    background: "#fff",
    color: "#111",
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "0 1px 0 rgba(0,0,0,.05), 0 8px 16px rgba(0,0,0,.06)",
    cursor: "pointer",
  };

  const menuStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    minWidth: 220,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    boxShadow: "0 18px 44px rgba(0,0,0,0.16)",
    overflow: "hidden",
    zIndex: 50,
  };

  const itemStyle: React.CSSProperties = {
    display: "block",
    padding: "10px 12px",
    fontWeight: 800,
    color: "#111",
    textDecoration: "none",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" style={btnStyle} onClick={() => setOpen((v) => !v)}>
        More <span aria-hidden style={{ fontSize: 12 }}>▼</span>
      </button>

      {open ? (
        <div style={menuStyle} role="menu" aria-label="More custom songs links">
          <Link href="/custom-songs/samples" style={itemStyle} role="menuitem">
            View Samples →
          </Link>
          <Link href="/custom-songs/reviews" style={itemStyle} role="menuitem">
            Read Reviews →
          </Link>
          <Link href="/custom-songs/faq" style={itemStyle} role="menuitem">
            Read FAQ →
          </Link>
          <Link
            href="/custom-songs/genre"
            style={{ ...itemStyle, borderBottom: "none" }}
            role="menuitem"
          >
            Pick Genre / Vibe →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
