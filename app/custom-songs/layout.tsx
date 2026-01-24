// app/custom-songs/layout.tsx

import type { ReactNode } from "react";

export default function CustomSongsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/custom-songs-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* subtle dark overlay so the white card pops */}
      <div
        style={{
          minHeight: "100vh",
          background: "rgba(0,0,0,0.35)",
          padding: "24px 16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
