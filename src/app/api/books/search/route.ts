import { NextResponse, type NextRequest } from 'next/server';
import { APP_NAME } from '@/constants/app';
import { buildSearchUrl, mapSearchResponse } from '@/lib/openLibrary';
import { getCurrentUser } from '@/server/currentUser';
import { searchQuerySchema } from '@/server/schemas';

export const dynamic = 'force-dynamic';

/** Proxies Open Library search so the browser gets a small, already-mapped result list. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const query = searchQuerySchema.safeParse(request.nextUrl.searchParams.get('q') ?? '');
  if (!query.success) return NextResponse.json({ results: [] });

  try {
    const response = await fetch(buildSearchUrl(query.data), {
      headers: { 'User-Agent': `${APP_NAME} reading tracker` },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`Open Library responded ${response.status}`);
    const results = mapSearchResponse(await response.json());
    return NextResponse.json({ results }, { headers: { 'Cache-Control': 'private, max-age=300' } });
  } catch {
    return NextResponse.json({ error: 'Book search is unavailable right now.' }, { status: 502 });
  }
}
