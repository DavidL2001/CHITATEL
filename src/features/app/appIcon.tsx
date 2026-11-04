import { ImageResponse } from 'next/og';
import { BRAND_ACCENT, BRAND_BACKGROUND } from '@/constants/brand';

/**
 * The app icon: an open book in the accent colour. `padding` (0–0.5) shrinks the artwork
 * for maskable icons, whose outer edges may be cropped by the OS.
 */
export function renderAppIcon(size: number, padding = 0.18) {
  const inner = size * (1 - padding * 2);
  const page = { width: inner * 0.44, height: inner * 0.62, background: BRAND_ACCENT };
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: inner * 0.04,
        background: BRAND_BACKGROUND,
      }}
    >
      <div
        style={{
          ...page,
          display: 'flex',
          borderRadius: `${inner * 0.1}px ${inner * 0.02}px ${inner * 0.02}px ${inner * 0.1}px`,
          transform: 'skewY(6deg)',
        }}
      />
      <div
        style={{
          ...page,
          display: 'flex',
          borderRadius: `${inner * 0.02}px ${inner * 0.1}px ${inner * 0.1}px ${inner * 0.02}px`,
          transform: 'skewY(-6deg)',
        }}
      />
    </div>,
    { width: size, height: size },
  );
}
