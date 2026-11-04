import { renderAppIcon } from '@/features/app/appIcon';

const ICONS: Record<string, { size: number; padding?: number }> = {
  'icon-192.png': { size: 192 },
  'icon-512.png': { size: 512 },
  'maskable-512.png': { size: 512, padding: 0.26 },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONS).map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const icon = ICONS[(await params).file];
  if (!icon) return new Response('Not found', { status: 404 });
  return renderAppIcon(icon.size, icon.padding);
}
