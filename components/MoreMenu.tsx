"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type MenuItem = { label: string; href: string };

const ITEMS: MenuItem[] = [
  { label: "Samples", href: "/custom-songs/samples" },
  { label: "FAQ", href: "/custom-songs/faq" },
  { label: "Reviews", href: "/custom-songs/reviews" },
  { label: "Start Order", href: "/custom-songs/order" },
];

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
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.85)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    cursor: "pointer",
    fontWeight: 900,
    color: "#111",
  };

  const menu: React.CSSProperties = {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    width: 220,
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.98)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
    overflow: "hidden",
    zIndex: 50,
  };

  const item: React.CSSProperties = {
    display: "block",
    padding: "12px 12px",
    textDecoration: "none",
    color: "#111",
    fontWeight: 850,
    fontSize: 13,
  };

  const itemHover: React.CSSProperties = {
    background: "rgba(181,123,23,0.10)",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} style={btn}>
        Menu <span aria-hidden style={{ fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div style={menu} role="menu" aria-label="Custom Songs Menu">
          {ITEMS.map((it) => (
            <MenuLink key={it.href} href={it.href} baseStyle={item} hoverStyle={itemHover} close={() => setOpen(false)}>
              {it.label}
            </MenuLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  children,
  baseStyle,
  hoverStyle,
  close,
}: {
  href: string;
  children: React.ReactNode;
  baseStyle: React.CSSProperties;
  hoverStyle: React.CSSProperties;
  close: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={href}
      role="menuitem"
      onClick={close}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...baseStyle, ...(hover ? hoverStyle : null) }}
    >
      {children}
    </Link>
  );
}
