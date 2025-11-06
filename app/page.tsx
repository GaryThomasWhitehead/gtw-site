"use client";

export default function Home() {
  return (
    <main className="page">
      {/* HEADER */}
      <header className="topbar">
        <img
          src="/20251105_073045.jpg"
          alt="Header background artwork by Gary Whitehead"
          className="headerImage"
        />
        <div className="headerOverlay">
          <div className="brand">GARY THOMAS WHITEHEAD</div>
          <div className="portrait">
            <img src="/Gary.png" alt="Gary Thomas Whitehead portrait" className="garyPhoto" />
          </div>
        </div>
      </header>

      {/* AUTHOR BIO SECTION */}
      <section id="bio" className="block card">
        <h2>✍️ AUTHOR BIO</h2>
        <h3>Gary Thomas Whitehead</h3>
        <p>
          Gary Thomas Whitehead is a multidisciplinary artist whose heart beats through music,
          painting, and words of faith. As a Christian songwriter and painter, Gary’s work carries a
          single theme—the beauty of divine connection. Whether through the strokes of a brush, the
          lyrics of a song, or the pages of a book, he strives to awaken hope and remind others that
          light always finds its way through.
        </p>
        <p>
          His newest work, <em>The Sent Son: A Biblical Perspective on Jesus as Mediator and Divine
          Sonship</em>, reflects years of reflection, prayer, and study. Gary writes in this genre
          because faith has shaped every part of his life—and he believes theology should feel
          alive, personal, and artful, not distant or academic.
        </p>
        <p>
          A fun fact? When he’s not painting or writing, Gary has often been found recording
          melodies in his home studio, surrounded by canvases still drying on the walls.
        </p>
      </section>

      {/* BOOK SECTION */}
      <section id="book" className="block card">
        <h2>📖 ABOUT THE BOOK</h2>
        <h3>The Sent Son</h3>

        <div className="bookLayout">
          <div className="bookText">
            <p className="subtle">
              <em>The Sent Son</em> is a Biblical perspective on Jesus as Mediator and Divine
              Sonship — exploring themes of covenant, mercy, and the Father’s heart through
              scripture-rich reflections.
            </p>

            <ul className="bookDetails">
              <li>• Author: <strong>Gary Thomas Whitehead</strong></li>
              <li>• Genre: <strong>Christian theology / spiritual reflection</strong></li>
              <li>
                • The book offers an in-depth scriptural study on Jesus’ role as both mediator and
                divine son, written in a devotional, reflective tone — consistent with his artistic
                and musical expression.
              </li>
            </ul>

            <ul className="list">
              <li>
                <div className="item">
                  <span>Read sample chapter (PDF)</span>
                  <a
                    className="view"
                    href="/Part%20of%20Chapter%201.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open →
                  </a>
                </div>
              </li>
              <li>
                <div className="item">
                  <span>Contact the author</span>
                  <a className="view" href="mailto:Gary's_new_music@yahoo.com">
                    Email →
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="bookImage">
            <img
              src="/Cover.png"
              alt="The Sent Son — A Biblical Perspective on Jesus"
              className="bookCover"
            />
          </div>
        </div>
      </section>

      {/* MUSIC SECTION */}
      <section id="music" className="block card">
        <h2>🎵 LISTEN</h2>
        <h3>Music</h3>
        <p>
          Experience Gary’s original songs of inspiration and storytelling on your favorite
          streaming platforms.
        </p>

        <div className="embedWrap">
          <iframe
            title="Gary Whitehead — SoundCloud"
            width="100%"
            height="300"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/user-747949669&color=%230055ff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
          />
        </div>

        <div className="linkRow">
          <a
            className="btn primary"
            href="https://soundcloud.com/user-747949669"
            target="_blank"
            rel="noreferrer"
          >
            🎧 SoundCloud
          </a>
          <a
            className="btn youtube"
            href="https://www.youtube.com/channel/UC8sxDC0vLnUeR2VQmK3qyVg"
            target="_blank"
            rel="noreferrer"
          >
            ▶️ YouTube
          </a>
          <a
            className="btn spotify"
            href="https://open.spotify.com/artist/0Ffx93cnY4aH22LsxbNmPX"
            target="_blank"
            rel="noreferrer"
          >
            🎶 Spotify
          </a>
          <a
            className="btn facebook"
            href="https://www.facebook.com/profile.php?id=61556807271098"
            target="_blank"
            rel="noreferrer"
          >
            👍 Facebook
          </a>
        </div>
      </section>

      {/* ART / ETSY SECTION */}
      <section id="art" className="block card">
        <h2>🎨 GALLERY & SHOP</h2>
        <h3>Art</h3>
        <p>
          Original paintings and fine-art prints by Gary Whitehead. Browse a few favorites below, and
          visit my Etsy shop for the full collection.
        </p>

        <div className="gallery">
          <figure className="artCard">
            <img
              src="/Up%20Through%20the%20Trees.png"
              alt="Up Through the Trees — branches against a sunrise sky"
              loading="lazy"
            />
            <figcaption>Up Through the Trees</figcaption>
          </figure>

          <figure className="artCard">
            <img
              src="/Flames.png"
              alt="Flaming — abstract fire form on black with gold, red, and white flow"
              loading="lazy"
            />
            <figcaption>Flaming</figcaption>
          </figure>
        </div>

        <div className="linkRow">
          <a
            className="btn primary"
            href="https://www.etsy.com/shop/GaryCreatedArt?ref=profile_header"
            target="_blank"
            rel="noreferrer"
          >
            🛒 Visit My Etsy Shop
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} Gary Thomas Whitehead • All rights reserved</p>
      </footer>

      {/* STYLES */}
      <style jsx>{`
        :root { --max: 1120px; --pad: 20px; }

        .page {
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          font-weight: 600;
          color: #111;
          line-height: 1.6;
          background: linear-gradient(180deg, #f9f2e2 0%, #f7e7c8 40%, #f4e9d6 100%);
          min-height: 100vh;
        }

        /* HEADER — original frame height, image stretched to fit */
        .topbar {
          position: relative;
          width: 100%;
          height: 320px;           /* original size restored */
          overflow: hidden;
          border-bottom: 2px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .headerImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;       /* <-- shows the WHOLE picture, stretched to the frame */
          z-index: 0;
        }

        .headerOverlay {
          position: relative;
          z-index: 1;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(3px);
          padding: 20px 40px;
          border-radius: 16px;
        }

        .brand {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 0.12em;
          margin-bottom: 10px;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        .garyPhoto {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
          object-fit: cover;
        }

        .card {
          background: rgba(255, 253, 248, 0.92);
          border-radius: 16px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
          padding: 24px;
          margin: 28px auto;
          max-width: var(--max);
        }

        h2 { text-transform: uppercase; font-size: 14px; letter-spacing: 0.12em; color: #444; margin-bottom: 6px; }
        h3 { font-weight: 800; font-size: clamp(24px, 2.5vw, 30px); margin-bottom: 10px; }
        p { font-weight: 600; color: #222; }

        .bookLayout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; margin-top: 20px; }
        .bookImage { display: flex; justify-content: center; perspective: 1000px; }
        .bookCover {
          width: 80%; max-width: 360px; border-radius: 12px; border: 1px solid #e8e2d6;
          background: #fff; transform-style: preserve-3d;
          transition: transform 320ms ease, box-shadow 320ms ease;
          box-shadow: 0 10px 22px rgba(0,0,0,.22), 0 4px 10px rgba(0,0,0,.12);
        }
        .bookImage:hover .bookCover {
          transform: rotateY(-7deg) rotateX(4deg) translateY(-2px);
          box-shadow: 0 18px 36px rgba(0,0,0,.28), 0 8px 16px rgba(0,0,0,.18);
        }

        .btn {
          display: inline-block; padding: 10px 16px; border-radius: 10px;
          text-decoration: none; font-weight: 700; color: #222;
        }
        .btn.primary { background: #2b5cff; color: #fff; }
        .btn.youtube  { background: #ff0000; color: #fff; }
        .btn.spotify  { background: #1db954; color: #fff; }
        .btn.facebook { background: #1877f2; color: #fff; }

        .linkRow { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }

        .gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
        .artCard {
          padding: 12px; border-radius: 14px; background: #fff; border: 1px solid #eee;
          box-shadow: 0 4px 12px rgba(0,0,0,.08); transition: transform .25s ease;
        }
        .artCard:hover { transform: translateY(-4px); box-shadow: 0 10px 22px rgba(0,0,0,.15); }
        .artCard img { width: 100%; border-radius: 10px; }
        .artCard figcaption { margin-top: 10px; text-align: center; font-weight: 700; color: #333; }

        .footer {
          text-align: center; padding: 18px var(--pad); color: #333;
          border-top: 1px solid #ddd; margin-top: 40px;
          background: rgba(255,255,255,.7); font-weight: 700;
        }

        @media (max-width: 900px) {
          .bookLayout { grid-template-columns: 1fr; text-align: center; }
        }
        @media (max-width: 700px) {
          .gallery { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
