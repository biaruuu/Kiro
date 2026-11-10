'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ADMIN_EMAIL, supabase } from '@/lib/supabase';

type Anime = {
  id: number; title: string; description: string | null; cover_url: string | null; banner_url: string | null;
  genres: string[]; year: number | null; format: string; status: string; episodes_total: number | null; score: number | null; published: boolean;
};
type Source = {
  id: number; anime_ref: number; episode: number; audio: string; label: string; url: string; format: string;
  referer: string | null; subtitle_url: string | null; published: boolean;
};
type Release = { build: number; version: string; apk_url: string; size: number; notes: string; status: 'draft' | 'published'; published_at: string | null };
type Build = { build: number; version: string; apk_url: string; size: number; date: string; notes: string };
type Stats = {
  users_total: number; users_24h: number; users_7d: number; reports_24h: number; reports_7d: number; crashes_7d: number; messages_24h: number;
  versions: { version: string; n: number }[]; devices: { device: string; n: number }[];
};

const BASE = 9_000_000;
const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return <p className="adm-center muted">Loading…</p>;
  if (!session) return <Login />;
  if (session.user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <div className="adm-center">
        <h1>Not the admin account</h1>
        <p className="muted">You are signed in as {session.user.email}. This panel is only for the owner.</p>
        <button className="adm-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </div>
    );
  }
  return <Panel session={session} />;
}

/* ---------- login: the link or code goes to the owner's inbox ---------- */
function Login() {
  const [step, setStep] = useState<'start' | 'code'>('start');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [usePw, setUsePw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function sendLink() {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithOtp({ email: ADMIN_EMAIL, options: { emailRedirectTo: `${window.location.origin}/admin`, shouldCreateUser: false } });
    setBusy(false);
    if (error) setMsg(error.message); else { setStep('code'); setMsg('Sent. Open the email on this device and tap the link, or type the code from it below.'); }
  }
  async function verify() {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.verifyOtp({ email: ADMIN_EMAIL, token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setMsg(error.message);
  }
  async function pw() {
    setBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    setBusy(false);
    if (error) setMsg(error.message);
  }

  return (
    <div className="adm-center">
      <img src="/icon.png" alt="" width={64} height={64} className="adm-logo" />
      <h1>Kiro admin</h1>
      <p className="muted">Sign-in link is sent to the owner email, {ADMIN_EMAIL.replace(/(^.).*(@.*$)/, '$1•••$2')}.</p>
      {!usePw ? (
        <>
          <button className="adm-btn primary" disabled={busy} onClick={sendLink}>{step === 'start' ? 'Email me a login link' : 'Send again'}</button>
          {step === 'code' && (
            <div className="adm-row">
              <input className="adm-in" inputMode="numeric" placeholder="Code from the email" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="adm-btn" disabled={busy || code.length < 6} onClick={verify}>Verify</button>
            </div>
          )}
          <button className="adm-link" onClick={() => setUsePw(true)}>Use my password instead</button>
        </>
      ) : (
        <>
          <input className="adm-in" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="adm-btn primary" disabled={busy || !password} onClick={pw}>Sign in</button>
          <button className="adm-link" onClick={() => setUsePw(false)}>Email me a link instead</button>
        </>
      )}
      {msg && <p className="adm-msg">{msg}</p>}
    </div>
  );
}

/* ---------- panel ---------- */
function Panel({ session }: { session: Session }) {
  const [tab, setTab] = useState<'overview' | 'anime' | 'streams' | 'updates'>('overview');
  return (
    <div className="adm-wrap">
      <header className="adm-top">
        <div className="adm-brand"><img src="/icon.png" alt="" width={30} height={30} /> <strong>Kiro admin</strong></div>
        <nav className="adm-tabs">
          {(['overview', 'anime', 'streams', 'updates'] as const).map((t) => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'overview' ? 'Overview' : t === 'anime' ? 'Anime' : t === 'streams' ? 'Streams' : 'Updates'}</button>
          ))}
        </nav>
        <button className="adm-btn small" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>
      <main className="adm-main">
        {tab === 'overview' && <Overview />}
        {tab === 'anime' && <AnimeTab />}
        {tab === 'streams' && <StreamsTab />}
        {tab === 'updates' && <UpdatesTab token={session.access_token} />}
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return <div className="adm-card stat"><span>{label}</span><strong>{value}</strong>{sub && <em>{sub}</em>}</div>;
}

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  const [live, setLive] = useState({ online: 0, watching: 0, connected: false });

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_stats');
    if (error) setErr(error.message); else { setStats(data as Stats); setErr(''); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  // Live counts: listen on the same presence channel every open app announces itself on.
  useEffect(() => {
    const ch = supabase.channel('site-presence', { config: { presence: { key: `admin-${Math.random().toString(36).slice(2)}` } } });
    const read = () => {
      const st = ch.presenceState() as Record<string, any[]>;
      let online = 0, watching = 0;
      for (const [k, metas] of Object.entries(st)) {
        if (k.startsWith('admin-')) continue;
        online++;
        if (metas.some((m) => m?.w === 1)) watching++;
      }
      setLive({ online, watching, connected: true });
    };
    ch.on('presence', { event: 'sync' }, read).subscribe((s) => { if (s === 'SUBSCRIBED') read(); });
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <>
      <h2>Right now</h2>
      <div className="adm-grid">
        <Stat label="Online" value={live.connected ? live.online : '…'} sub="apps open this moment" />
        <Stat label="Watching" value={live.connected ? live.watching : '…'} sub="playing a video" />
      </div>
      <h2>Users</h2>
      {err && <p className="adm-msg">{err}</p>}
      <div className="adm-grid">
        <Stat label="Registered" value={stats?.users_total ?? '…'} />
        <Stat label="New in 24 h" value={stats?.users_24h ?? '…'} />
        <Stat label="New in 7 days" value={stats?.users_7d ?? '…'} />
        <Stat label="Messages in 24 h" value={stats?.messages_24h ?? '…'} />
      </div>
      <h2>App health</h2>
      <div className="adm-grid">
        <Stat label="Reports in 24 h" value={stats?.reports_24h ?? '…'} sub="installs that opened the app" />
        <Stat label="Reports in 7 days" value={stats?.reports_7d ?? '…'} />
        <Stat label="Crashes in 7 days" value={stats?.crashes_7d ?? '…'} />
      </div>
      <div className="adm-cols">
        <div className="adm-card">
          <h3>Versions (7 days)</h3>
          {stats?.versions?.length ? stats.versions.map((v) => <div className="adm-line" key={v.version}><span>{v.version}</span><b>{v.n}</b></div>) : <p className="muted">No reports yet.</p>}
        </div>
        <div className="adm-card">
          <h3>Devices (7 days)</h3>
          {stats?.devices?.length ? stats.devices.map((d) => <div className="adm-line" key={d.device}><span>{d.device}</span><b>{d.n}</b></div>) : <p className="muted">No reports yet.</p>}
        </div>
      </div>
      <p className="muted small">Online and Watching only count people with the app open right now. Registered counts accounts, not installs.</p>
    </>
  );
}

/* ---------- anime ---------- */
const emptyAnime = { title: '', description: '', cover_url: '', banner_url: '', genres: '', year: '', format: 'TV', status: 'RELEASING', episodes_total: '', score: '', published: false };

function AnimeTab() {
  const [list, setList] = useState<Anime[]>([]);
  const [form, setForm] = useState({ ...emptyAnime });
  const [editing, setEditing] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('admin_anime').select('*').order('id', { ascending: false });
    if (error) setMsg(error.message); else setList((data ?? []) as Anime[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof emptyAnime, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) { setMsg('A title is needed.'); return; }
    const num = (s: string) => (s.trim() === '' ? null : Number(s));
    const row = {
      title: form.title.trim(), description: form.description.trim() || null, cover_url: form.cover_url.trim() || null, banner_url: form.banner_url.trim() || null,
      genres: form.genres.split(',').map((g) => g.trim()).filter(Boolean), year: num(form.year), format: form.format, status: form.status,
      episodes_total: num(form.episodes_total), score: num(form.score), published: form.published,
    };
    const { error } = editing ? await supabase.from('admin_anime').update(row).eq('id', editing) : await supabase.from('admin_anime').insert(row);
    if (error) { setMsg(error.message); return; }
    setMsg(editing ? 'Saved.' : 'Added.'); setForm({ ...emptyAnime }); setEditing(null); load();
  }
  function edit(a: Anime) {
    setEditing(a.id);
    setForm({ title: a.title, description: a.description ?? '', cover_url: a.cover_url ?? '', banner_url: a.banner_url ?? '', genres: a.genres.join(', '), year: a.year?.toString() ?? '', format: a.format, status: a.status, episodes_total: a.episodes_total?.toString() ?? '', score: a.score?.toString() ?? '', published: a.published });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function toggle(a: Anime) { await supabase.from('admin_anime').update({ published: !a.published }).eq('id', a.id); load(); }
  async function remove(a: Anime) {
    if (!confirm(`Delete "${a.title}" and all its stream links?`)) return;
    await supabase.from('admin_sources').delete().eq('anime_ref', BASE + a.id);
    await supabase.from('admin_anime').delete().eq('id', a.id);
    load();
  }

  return (
    <>
      <h2>{editing ? 'Edit anime' : 'Add anime'}</h2>
      <div className="adm-card form">
        <label>Title<input className="adm-in" value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
        <label>Description<textarea className="adm-in" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
        <div className="adm-two">
          <label>Cover image URL<input className="adm-in" value={form.cover_url} onChange={(e) => set('cover_url', e.target.value)} placeholder="https://…" /></label>
          <label>Banner image URL<input className="adm-in" value={form.banner_url} onChange={(e) => set('banner_url', e.target.value)} placeholder="https://…" /></label>
        </div>
        <label>Genres (comma separated)<input className="adm-in" value={form.genres} onChange={(e) => set('genres', e.target.value)} placeholder="Action, Comedy" /></label>
        <div className="adm-four">
          <label>Year<input className="adm-in" inputMode="numeric" value={form.year} onChange={(e) => set('year', e.target.value)} /></label>
          <label>Episodes<input className="adm-in" inputMode="numeric" value={form.episodes_total} onChange={(e) => set('episodes_total', e.target.value)} /></label>
          <label>Score (0–100)<input className="adm-in" inputMode="numeric" value={form.score} onChange={(e) => set('score', e.target.value)} /></label>
          <label>Format
            <select className="adm-in" value={form.format} onChange={(e) => set('format', e.target.value)}>{['TV', 'TV_SHORT', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'].map((f) => <option key={f}>{f}</option>)}</select>
          </label>
        </div>
        <label>Status
          <select className="adm-in" value={form.status} onChange={(e) => set('status', e.target.value)}>{['RELEASING', 'FINISHED', 'NOT_YET_RELEASED'].map((f) => <option key={f}>{f}</option>)}</select>
        </label>
        <label className="adm-check"><input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} /> Published (visible to everyone in the app). Unpublished is visible only on your phone when you are signed in.</label>
        <div className="adm-row">
          <button className="adm-btn primary" onClick={save}>{editing ? 'Save changes' : 'Add anime'}</button>
          {editing && <button className="adm-btn" onClick={() => { setEditing(null); setForm({ ...emptyAnime }); }}>Cancel</button>}
        </div>
        {msg && <p className="adm-msg">{msg}</p>}
      </div>

      <h2>Your anime ({list.length})</h2>
      <div className="adm-list">
        {list.length === 0 && <p className="muted">Nothing added yet.</p>}
        {list.map((a) => (
          <div className="adm-card item" key={a.id}>
            {a.cover_url ? <img src={a.cover_url} alt="" className="thumb" /> : <div className="thumb empty" />}
            <div className="grow">
              <strong>{a.title}</strong>
              <span className="muted small">App id {BASE + a.id} · {a.format} · {a.status}{a.year ? ` · ${a.year}` : ''}</span>
              <span className={`badge ${a.published ? 'ok' : ''}`}>{a.published ? 'Published' : 'Draft'}</span>
            </div>
            <div className="adm-row">
              <button className="adm-btn small" onClick={() => edit(a)}>Edit</button>
              <button className="adm-btn small" onClick={() => toggle(a)}>{a.published ? 'Unpublish' : 'Publish'}</button>
              <button className="adm-btn small danger" onClick={() => remove(a)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- streams ---------- */
function StreamsTab() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [target, setTarget] = useState<'anilist' | number>('anilist');
  const [aniId, setAniId] = useState('');
  const [audio, setAudio] = useState<'sub' | 'dub'>('sub');
  const [label, setLabel] = useState('Kiro');
  const [bulk, setBulk] = useState('');
  const [referer, setReferer] = useState('');
  const [subUrl, setSubUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [rows, setRows] = useState<Source[]>([]);
  const [msg, setMsg] = useState('');

  const ref = target === 'anilist' ? Number(aniId) || 0 : BASE + target;

  useEffect(() => {
    supabase.from('admin_anime').select('*').order('id', { ascending: false }).then(({ data }) => setAnime((data ?? []) as Anime[]));
  }, []);

  const loadRows = useCallback(async () => {
    if (!ref) { setRows([]); return; }
    const { data, error } = await supabase.from('admin_sources').select('*').eq('anime_ref', ref).order('audio').order('episode');
    if (error) setMsg(error.message); else setRows((data ?? []) as Source[]);
  }, [ref]);
  useEffect(() => { loadRows(); }, [loadRows]);

  async function add() {
    if (!ref) { setMsg('Enter an AniList id or choose one of your anime.'); return; }
    const out: any[] = [];
    for (const raw of bulk.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const m = line.match(/^(\d+)\s*[|,\s]\s*(https?:\/\/\S+)$/i);
      if (!m) { setMsg(`Couldn't read: ${line}. Use "episode link", for example: 1 https://site.com/ep1.mp4`); return; }
      const url = m[2];
      out.push({
        anime_ref: ref, episode: Number(m[1]), audio, label: label.trim() || 'Kiro', url,
        format: /\.m3u8(\?|$)/i.test(url) ? 'hls' : 'file', referer: referer.trim() || null, subtitle_url: subUrl.trim() || null, published,
      });
    }
    if (!out.length) { setMsg('Paste at least one line.'); return; }
    const { error } = await supabase.from('admin_sources').insert(out);
    if (error) { setMsg(error.message); return; }
    setMsg(`Added ${out.length} link${out.length > 1 ? 's' : ''}.`); setBulk(''); loadRows();
  }
  async function del(id: number) { await supabase.from('admin_sources').delete().eq('id', id); loadRows(); }
  async function toggle(s: Source) { await supabase.from('admin_sources').update({ published: !s.published }).eq('id', s.id); loadRows(); }

  return (
    <>
      <h2>Add stream links</h2>
      <div className="adm-card form">
        <label>Anime
          <select className="adm-in" value={target === 'anilist' ? 'anilist' : String(target)} onChange={(e) => setTarget(e.target.value === 'anilist' ? 'anilist' : Number(e.target.value))}>
            <option value="anilist">An AniList anime (type its id)…</option>
            {anime.map((a) => <option key={a.id} value={a.id}>{a.title} (yours)</option>)}
          </select>
        </label>
        {target === 'anilist' && <label>AniList id<input className="adm-in" inputMode="numeric" value={aniId} onChange={(e) => setAniId(e.target.value)} placeholder="e.g. 218938 (the number at the end of its anilist.co link)" /></label>}
        <div className="adm-two">
          <label>Audio
            <select className="adm-in" value={audio} onChange={(e) => setAudio(e.target.value as 'sub' | 'dub')}><option value="sub">Sub</option><option value="dub">Dub</option></select>
          </label>
          <label>Server name (shown in the player)<input className="adm-in" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
        </div>
        <label>Episodes: one per line, “episode link”
          <textarea className="adm-in mono" rows={6} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'1 https://example.com/ep1.mp4\n2 https://example.com/ep2.m3u8'} />
        </label>
        <div className="adm-two">
          <label>Referer (only if the link needs one)<input className="adm-in" value={referer} onChange={(e) => setReferer(e.target.value)} placeholder="https://site.com/" /></label>
          <label>Subtitle link (.vtt / .srt, optional)<input className="adm-in" value={subUrl} onChange={(e) => setSubUrl(e.target.value)} placeholder="https://…/en.vtt" /></label>
        </div>
        <label className="adm-check"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Visible to everyone (otherwise only on your phone while signed in)</label>
        <div className="adm-row"><button className="adm-btn primary" onClick={add}>Add links</button></div>
        {msg && <p className="adm-msg">{msg}</p>}
        <p className="muted small">.mp4 and other direct files play as a file; links ending in .m3u8 play as HLS. The app's own player is used, so captions and Netflix-style styling still work.</p>
      </div>

      <h2>Links for this anime ({rows.length})</h2>
      <div className="adm-list">
        {rows.length === 0 && <p className="muted">Nothing here yet.</p>}
        {rows.map((s) => (
          <div className="adm-card item" key={s.id}>
            <div className="grow">
              <strong>Episode {s.episode} · {s.audio.toUpperCase()} · {s.label}</strong>
              <span className="muted small url">{s.url}</span>
              <span className={`badge ${s.published ? 'ok' : ''}`}>{s.published ? 'Visible' : 'Hidden'} · {s.format}</span>
            </div>
            <div className="adm-row">
              <a className="adm-btn small" href={s.url} target="_blank" rel="noreferrer">Open</a>
              <button className="adm-btn small" onClick={() => toggle(s)}>{s.published ? 'Hide' : 'Show'}</button>
              <button className="adm-btn small danger" onClick={() => del(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- app updates ---------- */
function UpdatesTab({ token }: { token: string }) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [rels, setRels] = useState<Release[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const [b, r] = await Promise.all([
      fetch('/api/admin/releases', { headers: { Authorization: `Bearer ${token}` } }).then((x) => x.json()).catch(() => ({ error: 'Could not load builds' })),
      supabase.from('app_releases').select('*').order('build', { ascending: false }),
    ]);
    setBusy(false);
    if (b.error) setMsg(b.error); else setBuilds(b.builds ?? []);
    if (r.error) setMsg(r.error.message); else setRels((r.data ?? []) as Release[]);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const status = (n: number) => rels.find((r) => r.build === n)?.status;
  const live = rels.filter((r) => r.status === 'published').sort((a, b) => b.build - a.build)[0];

  async function addDraft(b: Build) {
    const { error } = await supabase.from('app_releases').upsert({ build: b.build, version: b.version, apk_url: b.apk_url, size: b.size, notes: b.notes.slice(0, 2000), status: 'draft' });
    setMsg(error ? error.message : `Build ${b.build} is now a draft: only your phone (signed in to the app with the owner email) is offered it.`); load();
  }
  async function publish(n: number) {
    if (!confirm(`Publish build ${n} to everyone?`)) return;
    const { error } = await supabase.from('app_releases').update({ status: 'published', published_at: new Date().toISOString() }).eq('build', n);
    setMsg(error ? error.message : `Build ${n} is published. Everyone is offered it, and the download page uses it.`); load();
  }
  async function pull(n: number) {
    const { error } = await supabase.from('app_releases').update({ status: 'draft', published_at: null }).eq('build', n);
    setMsg(error ? error.message : `Build ${n} is back to draft.`); load();
  }
  async function remove(n: number) {
    if (!confirm(`Remove build ${n} from the list?`)) return;
    await supabase.from('app_releases').delete().eq('build', n); load();
  }

  return (
    <>
      <h2>Updates</h2>
      <div className="adm-card">
        <p><b>Live for everyone:</b> {live ? `build ${live.build} (${live.version})` : 'none published'}</p>
        <p className="muted small">New builds are not offered to anyone until you publish them. Add a build as a draft to test it on your own phone first: open the app signed in with the owner email and it will offer the update. When it works, publish.</p>
      </div>
      {msg && <p className="adm-msg">{msg}</p>}
      <div className="adm-list">
        {busy && builds.length === 0 && <p className="muted">Loading builds…</p>}
        {builds.map((b) => {
          const st = status(b.build);
          return (
            <div className="adm-card item" key={b.build}>
              <div className="grow">
                <strong>Build {b.build} <span className="muted">· {b.version} · {mb(b.size)}</span></strong>
                <span className="muted small">{new Date(b.date).toLocaleString()}</span>
                <span className={`badge ${st === 'published' ? 'ok' : st === 'draft' ? 'warn' : ''}`}>{st === 'published' ? 'Published' : st === 'draft' ? 'Draft (only you)' : 'Not added'}</span>
              </div>
              <div className="adm-row">
                {!st && <button className="adm-btn small" onClick={() => addDraft(b)}>Add as draft to test</button>}
                {st === 'draft' && <button className="adm-btn small primary" onClick={() => publish(b.build)}>Publish to everyone</button>}
                {st === 'published' && <button className="adm-btn small" onClick={() => pull(b.build)}>Pull back to draft</button>}
                {st && <button className="adm-btn small danger" onClick={() => remove(b.build)}>Remove</button>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
