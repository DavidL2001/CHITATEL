import { NextResponse } from 'next/server';
import { todayIn } from '@/lib/dates';
import { buildExport, exportFileName } from '@/lib/export';
import { getCurrentUser } from '@/server/currentUser';
import { getAllUserData } from '@/server/data';

export const dynamic = 'force-dynamic';

/** Downloads all of the signed-in user's data as JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const data = await getAllUserData(user.id);
  const payload = buildExport({ user: { name: user.name, email: user.email }, ...data });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFileName(todayIn(data.settings.timezone))}"`,
      'Cache-Control': 'no-store, private',
    },
  });
}
