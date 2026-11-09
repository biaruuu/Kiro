import QRCode from 'qrcode';
import ShareButton from './ShareButton';
import { getLatest, FALLBACK_URL } from '@/lib/release';
import {
  IconAndroid, IconBolt, IconCalendar, IconCaptions, IconChat, IconDisk, IconDownload, IconHistory,
  IconPalette, IconPip, IconSaver, IconShield, IconSpark, IconTag, IconUsers,
} from '@/lib/icons';

export const revalidate = 300;

const SCREENS = [
  { src: '/screens/home.jpg', label: 'Home' },
  { src: '/screens/details.jpg', label: 'Details' },
  { src: '/screens/search.jpg', label: 'Search' },
  { src: '/screens/profile.jpg', label: 'Profile' },
  { src: '/screens/edit-profile.jpg', label: 'Edit profile' },
];

const FEATURES = [
  { Icon: IconBolt, tone: 'amber', title: 'Fast streaming', text: 'Starts quickly, picks the best server for you and adapts to your connection.' },
  { Icon: IconCaptions, tone: 'sky', title: 'Netflix-style captions', text: 'Clean, readable subtitles with one simple menu for language, style, size and timing.' },
  { Icon: IconUsers, tone: 'violet', title: 'Watch Together', text: 'Watch in sync with friends, react live and talk on a voice call.' },
  { Icon: IconChat, tone: 'green', title: 'Chat and voice notes', text: 'Message friends, send photos and voice notes, and react to messages.' },
  { Icon: IconHistory, tone: 'rose', title: 'Pick up where you left off', text: 'Continue watching opens the exact episode you stopped at.' },
  { Icon: IconPip, tone: 'teal', title: 'Picture in picture', text: 'Keep watching in a small window while you use other apps.' },
  { Icon: IconSaver, tone: 'orange', title: 'Data saver', text: 'Caps video quality on mobile data so you use less.' },
  { Icon: IconPalette, tone: 'pink', title: 'Profile themes', text: 'Make your profile yours with themes, effects and a share card.' },
] as const;

const STEPS = [
  { Icon: IconDownload, title: 'Download', text: 'Tap Install to get Kiro.apk. It is always the newest version.' },
  { Icon: IconDisk, title: 'Open the file', text: 'Open it from your notifications or the Downloads folder.' },
  { Icon: IconShield, title: 'Allow the install', text: 'If Android asks, allow installs from your browser (Install unknown apps).' },
  { Icon: IconSpark, title: 'Enjoy', text: 'Open Kiro. Future updates are offered inside the app.' },
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
            <img src="/icon.png" alt="" width={34} height={34} />
            <span>Kiro</span>
          </a>
          <nav className="nav" aria-label="Sections">
            <a href="#screenshots">Screenshots</a>
            <a href="#features">Features</a>
            <a href="#whats-new">What&apos;s new</a>
            <a href="#install">How to install</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a className="btn btn-primary btn-sm" href={latest.url} download>
            <IconDownload size={16} />
            Get the app
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-bg" aria-hidden="true" />
          <div className="wrap hero-grid">
            <div className="hero-main">
              <div className="id">
                <img className="app-icon" src="/icon.png" alt="Kiro app icon" width={128} height={128} />
                <div>
                  <h1>Kiro</h1>
                  <p className="dev">AniBiar TV</p>
                  <p className="tags"><IconAndroid size={16} /> Android · Entertainment · Free</p>
                </div>
              </div>

              <div className="stats" aria-label="App details">
                <div><IconTag size={18} /><strong>{latest.version || 'Latest'}</strong><span>Version</span></div>
                <div><IconDisk size={18} /><strong>{latest.size || 'APK'}</strong><span>Size</span></div>
                <div><IconAndroid size={18} /><strong>7.0+</strong><span>Android</span></div>
                <div><IconCalendar size={18} /><strong>{latest.updated || 'Now'}</strong><span>Updated</span></div>
              </div>

              <div className="actions">
                <a className="btn btn-primary btn-lg" href={latest.url} download>
                  <IconDownload size={20} />
                  Install
                </a>
                <ShareButton />
              </div>
              <p className="hint">Downloads the newest Kiro.apk straight from AniBiar. Android 7.0 or newer.</p>

              <div className="qr-card">
                <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
                <div>
                  <h3>Installing from a computer?</h3>
                  <p>Scan this code with your phone camera to download Kiro directly on your phone.</p>
                </div>
              </div>
            </div>

            <div className="hero-phones" aria-hidden="true">
              <div className="phone p-left"><img src="/screens/search.jpg" alt="" loading="lazy" /></div>
              <div className="phone p-mid"><img src="/screens/home.jpg" alt="" /></div>
              <div className="phone p-right"><img src="/screens/details.jpg" alt="" loading="lazy" /></div>
            </div>
          </div>
        </section>

        <div className="wrap">
          <section id="screenshots" className="block">
            <h2>Screenshots</h2>
            <div className="shots" tabIndex={0} aria-label="App screenshots">
              {SCREENS.map((s) => (
                <figure key={s.src} className="shot">
                  <div className="phone"><img src={s.src} alt={`Kiro ${s.label} screen`} loading="lazy" /></div>
                  <figcaption>{s.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section id="features" className="block">
            <h2>Features</h2>
            <div className="features">
              {FEATURES.map(({ Icon, tone, title, text }) => (
                <article key={title} className="card feat">
                  <div className={`ico tone-${tone}`}><Icon size={22} /></div>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
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
                <div className="note-head"><h3>{newest.title}</h3>{newest.date && <span className="pill">{newest.date}</span>}</div>
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
              {STEPS.map(({ Icon, title, text }, i) => (
                <li key={title}>
                  <div className="step-top"><span className="n">{i + 1}</span><Icon size={20} /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
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
        </div>
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

      <div className="dock" role="region" aria-label="Install Kiro">
        <img src="/icon.png" alt="" width={44} height={44} />
        <div className="dock-t"><strong>Kiro</strong><span>{latest.version ? `v${latest.version} · ${latest.size}` : 'Free · Android'}</span></div>
        <a className="btn btn-primary" href={latest.url} download><IconDownload size={18} />Install</a>
      </div>
    </>
  );
}
