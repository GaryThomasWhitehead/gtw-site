import TrackedLink from "../components/TrackedLink";

export default function Home() {
  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 20px",
      }}
    >
      {/* ================= HERO ================= */}
      <section style={{ marginBottom: "60px" }}>
        <h1 style={{ fontSize: "2.6rem", marginBottom: "12px" }}>
          The Sent Son
        </h1>

        <p style={{ fontSize: "1.2rem", opacity: 0.85 }}>
          A scripture-centered journey through the life, purpose, and message of
          Jesus Christ.
        </p>
      </section>

      {/* ================= BOOK SECTION ================= */}
      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>
          📖 Get the Book
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Kindle */}
          <div
            className="bookCard shadow rounded"
            style={{
              padding: "24px",
              border: "1px solid #eee",
            }}
          >
            <h3 style={{ fontSize: "1.4rem" }}>Kindle Edition</h3>

            <p className="muted" style={{ marginTop: "10px" }}>
              Recommended for <strong>personal Bible study</strong>.
              <br />
              Text-focused and distraction-free, without the note section.
            </p>

            <TrackedLink
              href="https://www.amazon.com/dp/B0G4NQ1SF3"
              eventName="click_kindle_book"
              className="btn"
              style={{
                display: "inline-block",
                marginTop: "16px",
                background: "#000",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Buy Kindle Edition
            </TrackedLink>
          </div>

          {/* Paperback */}
          <div
            className="bookCard shadow rounded"
            style={{
              padding: "24px",
              border: "1px solid #eee",
            }}
          >
            <h3 style={{ fontSize: "1.4rem" }}>Paperback Edition</h3>

            <p className="muted" style={{ marginTop: "10px" }}>
              Recommended for <strong>personal and group Bible study</strong>.
              <br />
              Includes a dedicated note section for reflection and discussion.
            </p>

            <TrackedLink
              href="https://www.amazon.com/dp/B0G4KJHKK6"
              eventName="click_paperback_book"
              className="btn"
              style={{
                display: "inline-block",
                marginTop: "16px",
                background: "#1a5cff",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Buy Paperback Edition
            </TrackedLink>
          </div>
        </div>
      </section>

      {/* ================= AUTHOR ================= */}
      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>
          About the Author
        </h2>

        <p style={{ maxWidth: "720px", lineHeight: 1.6 }}>
          Gary Thomas Whitehead is an author, songwriter, and visual artist whose
          work centers on faith, reflection, and spiritual clarity.
        </p>

        <p style={{ marginTop: "12px", fontStyle: "italic", opacity: 0.85 }}>
          A fun fact? When he’s not painting or writing, he’s often composing
          music inspired by scripture and personal prayer.
        </p>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        style={{
          textAlign: "center",
          padding: "18px",
          borderTop: "1px solid #eee",
          opacity: 0.8,
          fontSize: "0.95rem",
        }}
      >
        © {new Date().getFullYear()} Gary Thomas Whitehead
      </footer>
    </main>
  );
}
