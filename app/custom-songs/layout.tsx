"use client";

export default function CustomSongsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/backgrounds/custom-songs-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        padding: "32px 0",
      }}
    >
      {/* Center the form card nicely */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
