"use client";

import React from "react";

type TrackedLinkProps = {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  eventName?: string;
  children: React.ReactNode;
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    va?: { track?: (event: string, data?: Record<string, any>) => void };
  }
}

export default function TrackedLink({
  href,
  className,
  style,
  target = "_blank",
  rel = "noopener noreferrer",
  eventName,
  children,
}: TrackedLinkProps) {
  const handleClick = () => {
    if (eventName && typeof window.gtag === "function") {
      window.gtag("event", eventName, { link_url: href });
    }

    if (eventName && window.va?.track) {
      window.va.track(eventName, { href });
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
