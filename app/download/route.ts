import { getLatest } from '@/lib/release';

export const revalidate = 300;

/** A permanent link that always points at the newest APK. */
export async function GET() {
  const latest = await getLatest();
  return Response.redirect(latest.url, 302);
}
