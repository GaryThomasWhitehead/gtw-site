"use client";

import React, { useEffect, useRef, useState } from "react";

export default function MoreMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (e.target instanceof Node && wrapRef.current.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.10)",
          background: "#fff",
          cursor: "pointer",
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
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
            right: 0,
            minWidth: 220,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.10)",
            borderRadius: 12,
            boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          <MenuLink href="/custom-songs/samples" label="Sample Songs & Videos" />
          <MenuLink href="/custom-songs/reviews" label="Customer Reviews" />
          <MenuLink href="/custom-songs/faq" label="FAQ" />
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      role="menuitem"
      style={{
        display: "block",
        padding: "12px 14px",
        textDecoration: "none",
        color: "#111",
        fontWeight: 800,
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
      onClick={() => {
        // allow navigation; menu will close via document click
      }}
    >
      {label}
    </a>
  );
}
