export const metadata = {
  title: "Custom Songs | Gary Thomas Whitehead",
  description: "Custom songs and photo music videos by Gary Thomas Whitehead.",
};

export default function CustomSongsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/custom-songs-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Soft overlay so the form is readable */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "rgba(0,0,0,0.35)",
          padding: "28px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* Center content */}
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
