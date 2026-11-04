import { renderAppIcon } from '@/features/app/appIcon';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return renderAppIcon(size.width, 0.16);
}
