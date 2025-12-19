import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
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
      <body
        style={{
          margin: 0,
          backgroundColor: "#faf9f6",
          fontFamily: '"Georgia", "Times New Roman", serif',
          color: "#111",
        }}
      >
        {children}

        {/* ✅ Vercel Speed Insights */}
        <SpeedInsights />
      </body>
    </html>
  );
}
