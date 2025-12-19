"use client";

import React from "react";

type TrackedLinkProps = {
  href: string;
  children: React.ReactNode;
  eventName?: string;

  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
};

export default function TrackedLink({
  href,
  children,
  eventName,
  className,
  style,
  target = "_blank",
  rel = "noopener noreferrer",
}: TrackedLinkProps) {
  const handleClick = () => {
    if (!eventName) return;

    // Google Analytics (gtag)
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", eventName, { link_url: href });
    }

    // Vercel Analytics (va.track) - do NOT redeclare window.va types
    const va = (window as any).va;
    if (va && typeof va.track === "function") {
      va.track(eventName, { href });
    }
  };

  return (
    <a
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      onClick={eventName ? handleClick : undefined}
    >
      {children}
    </a>
  );
}
