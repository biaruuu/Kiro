const REPO = 'biaruuu/anibiar-androidv2';
const DIRECT = `https://github.com/${REPO}/releases/latest/download/Kiro.apk`;

export type Note = { title: string; date: string; items: string[] };
export type Latest = {
  live: boolean;
  version: string;
  size: string;
  updated: string;
  url: string;
  notes: Note[];
};

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** The changelog the app itself shows: "## id | title | date" followed by "- bullet" lines, newest last. */
function parseChangelog(text: string): Note[] {
  const notes: Note[] = [];
  let cur: Note | null = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      const parts = line.slice(3).split('|').map((p) => p.trim());
      cur = { title: parts[1] ?? parts[0], date: parts[2] ?? '', items: [] };
      notes.push(cur);
    } else if (line.startsWith('- ') && cur) {
      cur.items.push(line.slice(2));
    }
  }
  return notes.reverse().slice(0, 6);
}

async function getJson(url: string): Promise<any | null> {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'kiro-store' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(url, { headers, next: { revalidate: 300 } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function getText(url: string): Promise<string> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    return res.ok ? await res.text() : '';
  } catch {
    return '';
  }
}

/** Newest APK on GitHub Releases plus the app's changelog. Falls back to the permanent "latest" link if GitHub can't be reached. */
export async function getLatest(): Promise<Latest> {
  const [rel, changelog] = await Promise.all([
    getJson(`https://api.github.com/repos/${REPO}/releases/latest`),
    getText(`https://raw.githubusercontent.com/${REPO}/main/app/src/main/assets/changelog.md`),
  ]);
  const notes = parseChangelog(changelog);
  const asset = rel?.assets?.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.apk'));
  if (!rel || !asset) {
    return { live: false, version: '', size: '', updated: '', url: DIRECT, notes };
  }
  const build = String(rel.tag_name ?? '').replace(/^build-/, '');
  return {
    live: true,
    version: /^\d+$/.test(build) ? `0.3.${build}` : String(rel.tag_name ?? ''),
    size: formatSize(Number(asset.size) || 0),
    updated: formatDate(rel.published_at ?? asset.updated_at ?? ''),
    url: asset.browser_download_url ?? DIRECT,
    notes,
  };
}

export const FALLBACK_URL = DIRECT;
