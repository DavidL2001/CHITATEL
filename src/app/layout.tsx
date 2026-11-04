import type { Metadata, Viewport } from 'next';
import { Inter, Literata } from 'next/font/google';
import type { ReactNode } from 'react';
import { APP_DESCRIPTION, APP_NAME } from '@/constants/app';
import { BRAND_BACKGROUND } from '@/constants/brand';
import { DEFAULT_THEME } from '@/constants/goals';
import { ServiceWorkerRegister } from '@/features/app/ServiceWorkerRegister';
import { getCurrentUser } from '@/server/currentUser';
import { getSettings } from '@/server/data';
import '@/styles/globals.scss';
import styles from './layout.module.scss';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Literata({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: BRAND_BACKGROUND,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const theme = user ? (await getSettings(user.id)).theme : DEFAULT_THEME;

  return (
    <html lang="en" data-theme={theme} className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a href="#main" className={styles.skipLink}>
          Skip to content
        </a>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
