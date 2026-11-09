import QRCode from 'qrcode';
import ShareButton from './ShareButton';
import { getLatest, FALLBACK_URL } from '@/lib/release';

export const revalidate = 300;

const FEATURES = [
  { icon: '⚡', title: 'Fast streaming', text: 'Starts quickly, picks the best server for you and adapts to your connection.' },
  { icon: '💬', title: 'Netflix-style captions', text: 'Clean, readable subtitles with one simple menu for language, style, size and timing.' },
  { icon: '🎬', title: 'Watch Together', text: 'Watch in sync with friends, react live and talk on a voice call.' },
  { icon: '✉️', title: 'Chat and voice notes', text: 'Message friends, send photos and voice notes, and react to messages.' },
  { icon: '▶️', title: 'Pick up where you left off', text: 'Continue watching opens the exact episode you stopped at.' },
  { icon: '🖼️', title: 'Picture in picture', text: 'Keep watching in a small window while you use other apps.' },
  { icon: '📉', title: 'Data saver', text: 'Caps video quality on mobile data so you use less.' },
  { icon: '🎨', title: 'Profile themes', text: 'Make your profile yours with themes, effects and a share card.' },
];

const STEPS = [
  { title: 'Download', text: 'Tap Install to download Kiro.apk. It is always the newest version.' },
  { title: 'Open the file', text: 'Open the downloaded file from your notifications or the Downloads folder.' },
  { title: 'Allow the install', text: 'If Android asks, allow installs from your browser (Install unknown apps).' },
  { title: 'Enjoy', text: 'Open Kiro. Future updates are offered inside the app.' },
];

const FAQ = [
  { q: 'Why is Kiro not on Google Play?', a: 'Kiro is installed directly from this page as an APK. It works the same as a store install, and the app tells you when a new version is ready.' },
  { q: 'Is it free?', a: 'Yes, Kiro is free to download and use.' },
  { q: 'Which devices work?', a: 'Android 7.0 and newer. There is no iPhone version yet.' },
  { q: 'Android says the file may be harmful. What now?', a: 'That message appears for any app installed outside Google Play. Choose to install anyway, or turn off Play Protect scanning for this install.' },
  { q: 'How do I update?', a: 'Kiro checks for updates itself. You can also come back here and install over the old version; your data stays.' },
];

export default async function Page() {
  const latest = await getLatest();
  const qr = await QRCode.toString(latest.url || FALLBACK_URL, { type: 'svg', margin: 1, width: 168, color: { dark: '#0b0b0d', light: '#ffffff' } });
  const [newest, ...older] = latest.notes;

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <a className="brand" href="#top">
            <img src="/icon.png" alt="" width={32} height={32} />
            <span>Kiro</span>
          </a>
          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#whats-new">What&apos;s new</a>
            <a href="#install">How to install</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className="btn btn-primary btn-sm" href="/download">Get the app</a>
        </div>
      </header>

      <main id="top" className="wrap">
        <section className="hero">
          <img className="app-icon" src="/icon.png" alt="Kiro app icon" width={128} height={128} />
          <div className="hero-text">
            <h1>Kiro</h1>
            <p className="dev">AniBiar TV</p>
            <p className="tags">Entertainment · Free · Android</p>
          </div>
        </section>

        <section className="stats" aria-label="App details">
          <div><strong>{latest.version || 'Latest'}</strong><span>Version</span></div>
          <div><strong>{latest.size || 'APK'}</strong><span>Size</span></div>
          <div><strong>7.0+</strong><span>Android</span></div>
          <div><strong>{latest.updated || 'Now'}</strong><span>Updated</span></div>
        </section>

        <section className="actions">
          <a className="btn btn-primary btn-lg" href={latest.url} download>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 20h14v-2H5v2zM12 3v10.2l3.6-3.6L17 11l-5 5-5-5 1.4-1.4 3.6 3.6V3h0z" /></svg>
            Install
          </a>
          <ShareButton />
        </section>
        <p className="hint">Downloads the newest Kiro.apk straight from AniBiar. Android 7.0 or newer.</p>

        <section className="qr-card">
          <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
          <div>
            <h3>Installing from a computer?</h3>
            <p>Scan this code with your phone camera to download Kiro directly on your phone.</p>
          </div>
        </section>

        <section id="features" className="block">
          <h2>Features</h2>
          <div className="features">
            {FEATURES.map((f) => (
              <article key={f.title} className="card">
                <div className="ico" aria-hidden="true">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="block">
          <h2>About this app</h2>
          <p className="lead">
            Kiro is the Android app for AniBiar TV. Browse what is airing, search with typo tolerance, stream in sub or dub, and keep your place across devices when you sign in.
            Watch with friends in sync, message them with photos and voice notes, and customise your profile.
          </p>
        </section>

        <section id="whats-new" className="block">
          <h2>What&apos;s new</h2>
          {newest ? (
            <article className="card note">
              <div className="note-head"><h3>{newest.title}</h3>{newest.date && <span>{newest.date}</span>}</div>
              <ul>{newest.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ) : (
            <p className="muted">Release notes will show here.</p>
          )}
          {older.length > 0 && (
            <details className="more">
              <summary>Earlier updates</summary>
              {older.map((n) => (
                <article key={n.title + n.date} className="note old">
                  <div className="note-head"><h4>{n.title}</h4>{n.date && <span>{n.date}</span>}</div>
                  <ul>{n.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </article>
              ))}
            </details>
          )}
        </section>

        <section className="block">
          <h2>App info</h2>
          <dl className="info">
            <div><dt>Version</dt><dd>{latest.version || 'Latest'}</dd></div>
            <div><dt>Updated</dt><dd>{latest.updated || '—'}</dd></div>
            <div><dt>Download size</dt><dd>{latest.size || '—'}</dd></div>
            <div><dt>Requires</dt><dd>Android 7.0 and up</dd></div>
            <div><dt>Package</dt><dd>com.anibiar.app</dd></div>
            <div><dt>Offered by</dt><dd>AniBiar TV</dd></div>
          </dl>
        </section>

        <section id="install" className="block">
          <h2>How to install</h2>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title}><span className="n">{i + 1}</span><div><h3>{s.title}</h3><p>{s.text}</p></div></li>
            ))}
          </ol>
        </section>

        <section id="faq" className="block">
          <h2>Questions</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-in">
          <span>Kiro by AniBiar TV</span>
          <span className="links">
            <a href="https://anibiartv.vercel.app">Website</a>
            <a href="https://github.com/biaruuu/anibiar-androidv2/releases">All releases</a>
          </span>
        </div>
      </footer>
    </>
  );
}
