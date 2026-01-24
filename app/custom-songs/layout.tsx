import type { ReactNode } from "react";

export default function CustomSongsLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#faf9f6",
        backgroundImage: "url('/new.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        padding: "24px 16px",
      }}
    >
      {/* soft overlay so text stays readable */}
      <div
        style={{
          minHeight: "calc(100vh - 48px)",
          background: "rgba(250, 249, 246, 0.88)",
          borderRadius: "14px",
          padding: "18px",
          maxWidth: "1360px",
          margin: "0 auto",
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
