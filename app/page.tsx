// app/page.tsx
"use client";

import Image from "next/image";
import TrackedLink from "../components/TrackedLink";

export default function Home() {
  // ===== Links =====
  const links = {
    kindle: "https://www.amazon.com/dp/B0G4NQ1SF3",
    paperback: "https://www.amazon.com/dp/B0G4KJHKK6",
    soundcloudTrack: "https://soundcloud.com/user-747949669/mirrors-of-the-mind",
    soundcloudProfile: "https://soundcloud.com/user-747949669",

    // NOTE: replace these with your real links (or leave them out if you don’t want them)
    youtube: "https://www.youtube.com/",
    spotify: "https://open.spotify.com/",

    etsy: "https://www.etsy.com/shop/GaryCreatedArt?ref=profile_header",

    sampleChapterPdf: "/Part-of-Chapter-1.pdf",
  };

  // ===== Styles =====
  const page = {
    background: "#fbf7f1",
    minHeight: "100vh",
    padding: "48px 18px 70px",
    fontFamily:
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    color: "#1f1f1f",
  } as const;

  const container = {
    maxWidth: 1100,
    margin: "0 auto",
  } as const;

  const hero = {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 24,
    alignItems: "center",
    marginBottom: 38,
  } as const;

  const heroTitle = {
    fontSize: 56,
    lineHeight: 1.05,
    margin: "0 0 10px",
    letterSpacing: "-0.5px",
  } as const;

  const heroSubtitle = {
    margin: 0,
    fontSize: 18,
    color: "#444",
    maxWidth: 680,
  } as const;

  const heroCard = {
    background: "rgba(255,255,255,.75)",
    border: "1px solid #eee",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 10px 22px rgba(0,0,0,.06)",
  } as const;

  const section = {
    marginTop: 34,
    marginBottom: 46,
  } as const;

  const sectionTitle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 34,
    margin: "0 0 14px",
    letterSpacing: "-0.2px",
  } as const;

  const grid2 = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
  } as const;

  const card = {
    background: "rgba(255,255,255,.78)",
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 10px 20px rgba(0,0,0,.06)",
  } as const;

  const small = { color: "#555", lineHeight: 1.6 } as const;

  const btnRow = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 } as const;

  const btnBase = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid transparent",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  };

  const btnDark = {
    ...btnBase,
    background: "#111",
    color: "#fff",
  } as const;

  const btnBlue = {
    ...btnBase,
    background: "#2f66ff",
    color: "#fff",
  } as const;

  const btnLight = {
    ...btnBase,
    background: "rgba(255,255,255,.9)",
    color: "#111",
    border: "1px solid #ddd",
  } as const;

  const divider = {
    height: 1,
    background: "rgba(0,0,0,.06)",
    margin: "24px 0",
  } as const;

  const artGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
    marginTop: 14,
  } as const;

  const imgWrap = {
    background: "rgba(255,255,255,.9)",
    border: "1px solid #eee",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 8px 16px rgba(0,0,0,.05)",
  } as const;

  const caption = {
    padding: "10px 12px",
    color: "#444",
    fontWeight: 700,
    fontSize: 14,
  } as const;

  const footer = {
    textAlign: "center" as const,
    marginTop: 32,
    color: "#333",
    opacity: 0.9,
  };

  return (
    <main style={page}>
      <div style={container}>
        {/* ===== HERO ===== */}
        <header style={hero}>
          <div>
            <h1 style={heroTitle}>The Sent Son</h1>
            <p style={heroSubtitle}>
              A scripture-centered journey through the life, purpose, and message of Jesus Christ.
            </p>

            <div style={{ ...btnRow, marginTop: 18 }}>
              <a href="#book" style={btnDark}>Get the Book</a>
              <a href="#music" style={btnLight}>Music</a>
              <a href="#art" style={btnLight}>Art</a>
              <a href="#about" style={btnLight}>About</a>
            </div>
          </div>

          {/* Book image card */}
          <div style={heroCard}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              <div style={{ ...imgWrap, borderRadius: 16 }}>
                <Image
                  src="/Cover.png"
                  alt="The Sent Son book cover"
                  width={900}
                  height={1200}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority
                />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <TrackedLink
                  href={links.kindle}
                  eventName="book_kindle_hero_click"
                  style={btnDark}
                >
                  Buy Kindle
                </TrackedLink>

                <TrackedLink
                  href={links.paperback}
                  eventName="book_paperback_hero_click"
                  style={btnBlue}
                >
                  Buy Paperback
                </TrackedLink>

                <TrackedLink
                  href={links.sampleChapterPdf}
                  eventName="sample_chapter_hero_click"
                  style={btnLight}
                  target="_blank"
                >
                  Read Sample Chapter (PDF)
                </TrackedLink>
              </div>
            </div>
          </div>
        </header>

        {/* ===== BOOK SECTION ===== */}
        <section id="book" style={section}>
          <h2 style={sectionTitle}>📖 Get the Book</h2>

          <div style={grid2}>
            <div style={card}>
              <h3 style={{ margin: "0 0 6px", fontSize: 22 }}>Kindle Edition</h3>
              <p style={{ ...small, margin: "0 0 10px" }}>
                <strong>Recommended for personal Bible study.</strong>
                <br />
                Text-focused and distraction-free, without the note section.
              </p>

              <div style={btnRow}>
                <TrackedLink
                  href={links.kindle}
                  eventName="book_kindle_click"
                  style={btnDark}
                >
                  Buy Kindle Edition
                </TrackedLink>

                <TrackedLink
                  href={links.sampleChapterPdf}
                  eventName="sample_chapter_click_kindle_card"
                  style={btnLight}
                  target="_blank"
                >
                  Sample Chapter (PDF)
                </TrackedLink>
              </div>
            </div>

            <div style={card}>
              <h3 style={{ margin: "0 0 6px", fontSize: 22 }}>Paperback Edition</h3>
              <p style={{ ...small, margin: "0 0 10px" }}>
                <strong>Recommended for personal and group Bible study.</strong>
                <br />
                Includes a dedicated note section for reflection and discussion.
              </p>

              <div style={btnRow}>
                <TrackedLink
                  href={links.paperback}
                  eventName="book_paperback_click"
                  style={btnBlue}
                >
                  Buy Paperback Edition
                </TrackedLink>

                <TrackedLink
                  href={links.sampleChapterPdf}
                  eventName="sample_chapter_click_paperback_card"
                  style={btnLight}
                  target="_blank"
                >
                  Sample Chapter (PDF)
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ABOUT ===== */}
        <section id="about" style={section}>
          <h2 style={sectionTitle}>✍️ About the Author</h2>

          <div style={{ ...card, display: "grid", gridTemplateColumns: "140px 1fr", gap: 18, alignItems: "center" }}>
            <div style={{ ...imgWrap, borderRadius: 999 }}>
              <Image
                src="/Gary.png"
                alt="Gary Thomas Whitehead"
                width={500}
                height={500}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            <div>
              <p style={{ ...small, margin: 0 }}>
                Gary Thomas Whitehead is an author, songwriter, and visual artist whose work centers on faith,
                reflection, and spiritual clarity.
              </p>

              {/* This is the “fun fact” line you wanted fixed/complete */}
              <p style={{ ...small, margin: "10px 0 0", fontStyle: "italic" }}>
                A fun fact? When he’s not painting or writing, he’s often composing original music inspired by
                scripture and personal prayer.
              </p>
            </div>
          </div>
        </section>

        {/* ===== MUSIC ===== */}
        <section id="music" style={section}>
          <h2 style={sectionTitle}>🎵 Gary’s Original Music</h2>

          <div style={grid2}>
            <div style={card}>
              <p style={{ ...small, margin: 0 }}>
                Listen directly on SoundCloud (featured track and playlist embed).
              </p>

              <div style={btnRow}>
                <TrackedLink
                  href={links.soundcloudTrack}
                  eventName="soundcloud_mirrors_click"
                  style={btnDark}
                >
                  Mirrors of the Mind
                </TrackedLink>

                <TrackedLink
                  href={links.soundcloudProfile}
                  eventName="soundcloud_profile_click"
                  style={btnLight}
                >
                  SoundCloud Profile
                </TrackedLink>

                <TrackedLink
                  href={links.spotify}
                  eventName="spotify_click"
                  style={btnLight}
                >
                  Spotify
                </TrackedLink>

                <TrackedLink
                  href={links.youtube}
                  eventName="youtube_click"
                  style={btnLight}
                >
                  YouTube
                </TrackedLink>
              </div>

              <div style={divider} />

              {/* Optional: the cover image for the latest release (you have mirrors.png in /public) */}
              <div style={{ ...imgWrap }}>
                <TrackedLink
                  href={links.soundcloudTrack}
                  eventName="mirrors_image_click"
                  style={{ display: "block", textDecoration: "none", color: "inherit" }}
                >
                  <Image
                    src="/mirrors.png"
                    alt="Mirrors of the Mind cover"
                    width={1200}
                    height={1200}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                  <div style={caption}>Click the cover to listen: Mirrors of the Mind</div>
                </TrackedLink>
              </div>
            </div>

            <div style={card}>
              {/* SoundCloud embed */}
              <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #eee" }}>
                <iframe
                  title="SoundCloud Player"
                  width="100%"
                  height="360"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-747949669&color=%23111&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
                />
              </div>

              <p style={{ ...small, margin: "10px 0 0" }}>
                (If you want this embed to show a specific playlist/track instead of your profile, tell me which
                SoundCloud URL and I’ll swap the embed URL.)
              </p>
            </div>
          </div>
        </section>

        {/* ===== ART ===== */}
        <section id="art" style={section}>
          <h2 style={sectionTitle}>🎨 Original Art</h2>

          <div style={card}>
            <p style={{ ...small, margin: 0 }}>
              Explore my paintings and art listings:
            </p>

            <div style={btnRow}>
              <TrackedLink
                href={links.etsy}
                eventName="etsy_click"
                style={btnDark}
              >
                Visit My Etsy Shop
              </TrackedLink>
            </div>

            {/* Art images (based on what you showed in /public) */}
            <div style={artGrid}>
              <div style={imgWrap}>
                <Image
                  src="/Flames.png"
                  alt="Flames painting"
                  width={1200}
                  height={900}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div style={caption}>Flames</div>
              </div>

              <div style={imgWrap}>
                <Image
                  src="/trees.png"
                  alt="Up Through the Trees painting"
                  width={1200}
                  height={900}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div style={caption}>Up Through the Trees</div>
              </div>

              <div style={imgWrap}>
                <Image
                  src="/image.jpg"
                  alt="Artwork preview"
                  width={1200}
                  height={900}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                <div style={caption}>Featured Piece</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer style={footer}>
          © {new Date().getFullYear()} Gary Thomas Whitehead
        </footer>
      </div>

      {/* Responsive tweak */}
      <style jsx>{`
        @media (max-width: 900px) {
          header {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
