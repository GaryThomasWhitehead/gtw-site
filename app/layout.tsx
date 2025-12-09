import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Gary Thomas Whitehead",
  description: "Author • Songwriter • Painter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Vercel Analytics Tracking */}
        <Analytics />
      </body>
    </html>
  );
}
