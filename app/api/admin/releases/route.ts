import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL, SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const REPO = 'biaruuu/anibiar-androidv2';

/** The builds available to publish. Only the admin account may ask; the source repository name stays on the server. */
export async function GET(req: Request) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Not signed in' }, { status: 401 });
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user || data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return Response.json({ error: 'Not allowed' }, { status: 403 });
  }
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=15`, { headers, cache: 'no-store' });
  if (!res.ok) return Response.json({ error: `GitHub answered ${res.status}` }, { status: 502 });
  const list = (await res.json()) as any[];
  const builds = list
    .map((r) => {
      const build = Number(String(r.tag_name ?? '').replace(/^build-/, ''));
      const asset = (r.assets ?? []).find((a: any) => a?.name === 'Kiro.apk');
      if (!Number.isFinite(build) || !asset) return null;
      return { build, version: `0.3.${build}`, apk_url: asset.browser_download_url as string, size: Number(asset.size) || 0, date: r.published_at as string, notes: String(r.body ?? '') };
    })
    .filter(Boolean);
  return Response.json({ builds });
}
