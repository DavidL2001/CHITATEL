import type { MetadataRoute } from 'next';
import { APP_DESCRIPTION, APP_NAME } from '@/constants/app';
import { BRAND_BACKGROUND } from '@/constants/brand';
import { ROUTES } from '@/constants/routes';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} – reading tracker`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: ROUTES.today,
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: BRAND_BACKGROUND,
    theme_color: BRAND_BACKGROUND,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
