"use client";

import React from "react";

type TrackedLinkProps = {
  href: string;
  children: React.ReactNode;
  eventName?: string;
  className?: string;
  style?: React.CSSProperties;
  target?: "_blank" | "_self";
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
    // Google Analytics (gtag)
    if (eventName && typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, {
        link_url: href,
      });
    }

    // Vercel Analytics (safe optional)
    if (eventName && typeof window !== "undefined" && (window as any).va?.track) {
      (window as any).va.track(eventName, { href });
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
