"use client";

import React from "react";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Thank you — I’ve got it.</h1>

        <p style={styles.text}>
          Your request has been submitted. Next, I’ll reach out by email to confirm
          details and give you the easiest way to send photos (for the optional
          <strong> Photo Music Video</strong>).
        </p>

        <div style={styles.highlight}>
          <div style={styles.highlightTitle}>What happens next</div>
          <ul style={styles.ul}>
            <li>I confirm your details (names, vibe, genre, timeline).</li>
            <li>You send photos (Drive/Dropbox link or email attachments).</li>
            <li>I write + produce your custom song.</li>
            <li>
              If you chose it: I create your <strong>Photo Music Video</strong>{" "}
              where your pictures play while the music plays.
            </li>
          </ul>
        </div>

        <div style={styles.ctaRow}>
          <a
            href="mailto:garys_new_music@yahoo.com?subject=Custom%20Song%20Request%20from%20Website"
            style={styles.btnPrimary}
          >
            Email Gary (Add details)
          </a>
          <Link href="/" style={styles.btnSecondary}>
            Back to Home
          </Link>
        </div>

        <p style={styles.small}>
          If you don’t see my email reply soon, check spam/junk.
        </p>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#faf9f6",
    padding: 30,
    fontFamily: "Georgia, serif",
  },
  card: {
    maxWidth: 900,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #eee",
    boxShadow: "0 10px 25px rgba(0,0,0,.06)",
  },
  title: { fontSize: 36, marginBottom: 10, fontWeight: 900 },
  text: { fontSize: 16, lineHeight: 1.7, color: "#333", marginTop: 0 },
  highlight: {
    marginTop: 18,
    background: "#fff7ea",
    border: "1px solid #f2e2c8",
    borderRadius: 14,
    padding: "14px 14px",
  },
  highlightTitle: { fontWeight: 900, fontSize: 16, marginBottom: 6 },
  ul: { margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 16 },
  ctaRow: {
    marginTop: 18,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  btnPrimary: {
    background: "#b57b17",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    background: "#eee",
    color: "#111",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  small: { marginTop: 16, color: "#666", fontSize: 14 },
};
